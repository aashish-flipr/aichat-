import { Injectable, Logger } from '@nestjs/common';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatGroq } from '@langchain/groq';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private chatModel: BaseChatModel;

  constructor() {
    this.initializeModel();
  }

  private initializeModel() {
    const provider = process.env.LLM_PROVIDER || 'groq';
    const modelName = process.env.LLM_MODEL_NAME || 'llama-3.3-70b-versatile';

    this.logger.log(
      `Initializing LLM Provider: ${provider}, Model: ${modelName}`,
    );

    switch (provider.toLowerCase()) {
      case 'groq':
        this.chatModel = new ChatGroq({
          apiKey: process.env.GROQ_API_KEY,
          model: modelName,
        });
        break;
      case 'openai':
      case 'gemini':
        throw new Error(
          `Provider ${provider} selected but integration package is not installed yet.`,
        );
      default:
        throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
    }
  }

  public getModel(): BaseChatModel {
    return this.chatModel;
  }
}
