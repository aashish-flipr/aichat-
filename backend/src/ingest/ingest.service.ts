import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ChromaService } from '../chroma/chroma.service.js';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(private readonly chromaService: ChromaService) {}

  async processAndIngestText(text: string, filename: string): Promise<any> {
    try {
      this.logger.log(`Starting ingestion for ${filename}`);

      // 1. Split text into chunks
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const rawDoc = new Document({
        pageContent: text,
        metadata: { source: filename },
      });

      const docs = await splitter.splitDocuments([rawDoc]);
      this.logger.log(`Split text into ${docs.length} chunks`);

      // 2. Add documents to Chroma DB
      const vectorStore = this.chromaService.getVectorStore();
      await vectorStore.addDocuments(docs);

      this.logger.log('Successfully ingested documents to Chroma DB');

      return {
        message: 'Ingestion successful',
        chunksAdded: docs.length,
        filename,
      };
    } catch (error: any) {
      this.logger.error(`Error ingesting document: ${error.message}`);
      throw new BadRequestException('Failed to ingest document');
    }
  }
}
