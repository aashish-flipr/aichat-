import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'chat_history' })
export class ChatHistory extends Document {
  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true, enum: ['human', 'ai'] })
  role: string;

  @Prop({ required: true })
  content: string;
}

export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);
