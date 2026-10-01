import { Module } from '@nestjs/common';
import { ChromaService } from './chroma.service.js';

@Module({
  providers: [ChromaService],
  exports: [ChromaService],
})
export class ChromaModule {}
