import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { Embeddings } from '@langchain/core/embeddings';

class LocalChromaEmbedder extends Embeddings {
  private embedder: any;

  constructor() {
    super({});
  }

  private async getEmbedder() {
    if (!this.embedder) {
      const { DefaultEmbeddingFunction } =
        await import('@chroma-core/default-embed');
      this.embedder = new DefaultEmbeddingFunction();
    }
    return this.embedder;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const embedder = await this.getEmbedder();
    const results = await embedder.generate(texts);
    return results;
  }

  async embedQuery(text: string): Promise<number[]> {
    const embedder = await this.getEmbedder();
    const results = await embedder.generate([text]);
    return results[0];
  }
}

@Injectable()
export class ChromaService implements OnModuleInit {
  private readonly logger = new Logger(ChromaService.name);
  public vectorStore: Chroma;

  async onModuleInit() {
    this.logger.log('Connecting to Chroma DB at http://localhost:8000');

    this.vectorStore = new Chroma(new LocalChromaEmbedder(), {
      collectionName: 'querychat_collection',
      url: 'http://localhost:8000',
    });
  }

  public getVectorStore(): Chroma {
    return this.vectorStore;
  }
}
