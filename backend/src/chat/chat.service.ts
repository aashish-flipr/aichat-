import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatHistory } from './schemas/chat-history.schema.js';
import { LlmService } from '../llm/llm.service.js';
import { ChromaService } from '../chroma/chroma.service.js';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatHistory.name) private chatModel: Model<ChatHistory>,
    private llmService: LlmService,
    private chromaService: ChromaService
  ) {}

  async sendMessage(sessionId: string, userMessage: string): Promise<string> {
    this.logger.log(`Processing message for session: ${sessionId}`);
    
    // 1. Semantic Search
    const vectorStore = this.chromaService.getVectorStore();
    const searchResults = await vectorStore.similaritySearch(userMessage, 3);
    const contextText = searchResults.map(doc => doc.pageContent).join('\n---\n');

    this.logger.log(`Found ${searchResults.length} relevant chunks`);

    // 2. Fetch Chat History from Mongo
    const history = await this.chatModel.find({ sessionId }).sort({ createdAt: 1 }).exec();
    
    // 3. Construct Prompt Messages
    const systemPrompt = `You are a strict AI assistant. Your ONLY job is to answer the user's question using EXACTLY the information provided in the context below.
DO NOT add your own explanations, DO NOT elaborate, and DO NOT use outside knowledge. 
If the exact answer is not in the context, say "I don't know based on the provided documents."

Context:
${contextText}`;

    const messages: any[] = [new SystemMessage(systemPrompt)];
    
    // Add history
    for (const msg of history) {
      if (msg.role === 'human') messages.push(new HumanMessage(msg.content));
      if (msg.role === 'ai') messages.push(new AIMessage(msg.content));
    }

    // Add current message
    messages.push(new HumanMessage(userMessage));

    // 4. Get LLM response
    const model = this.llmService.getModel();
    const response = await model.invoke(messages);
    const aiMessageContent = response.content.toString();

    // 5. Save both messages to Mongo
    await this.chatModel.create({ sessionId, role: 'human', content: userMessage });
    await this.chatModel.create({ sessionId, role: 'ai', content: aiMessageContent });

    return aiMessageContent;
  }

  async getSessions() {
    // Group by sessionId and sort by latest activity
    const sessions = await this.chatModel.aggregate([
      { $group: { _id: "$sessionId", lastActivity: { $max: "$createdAt" } } },
      { $sort: { lastActivity: -1 } }
    ]);
    return sessions.map(s => s._id);
  }

  async getSessionHistory(sessionId: string) {
    return await this.chatModel.find({ sessionId }).sort({ createdAt: 1 }).exec();
  }
}
