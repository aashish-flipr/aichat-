import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { ChatHistory, ChatHistorySchema } from './schemas/chat-history.schema.js';
import { LlmModule } from '../llm/llm.module.js';
import { ChromaModule } from '../chroma/chroma.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatHistory.name, schema: ChatHistorySchema }]),
    LlmModule,
    ChromaModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
