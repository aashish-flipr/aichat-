import { Module } from '@nestjs/common';
import { IngestController } from './ingest.controller.js';
import { IngestService } from './ingest.service.js';
import { ChromaModule } from '../chroma/chroma.module.js';

@Module({
  imports: [ChromaModule],
  controllers: [IngestController],
  providers: [IngestService],
})
export class IngestModule {}
