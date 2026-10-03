import { Controller, Post, Get, Body, Param, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service.js';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  async getSessions() {
    return await this.chatService.getSessions();
  }

  @Get('history/:sessionId')
  async getHistory(@Param('sessionId') sessionId: string) {
    return await this.chatService.getSessionHistory(sessionId);
  }

  @Post()
  async handleChat(@Body() body: { sessionId: string; message: string }) {
    if (!body || !body.sessionId || !body.message) {
      throw new BadRequestException('sessionId and message are required');
    }
    
    const response = await this.chatService.sendMessage(body.sessionId, body.message);
    return { response };
  }
}
