import { ChromaClient } from 'chromadb';
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed';

async function testSearch() {
  const client = new ChromaClient({ host: 'localhost', port: 8000 });
  const embedder = new DefaultEmbeddingFunction();
  
  const query = "Who is Meera's father?";
  const embedding = await embedder.generate([query]);
  
  const collection = await client.getCollection({ name: 'querychat_collection' });
  const results = await collection.query({
    queryEmbeddings: embedding,
    nResults: 3
  });
  
  console.log(JSON.stringify(results, null, 2));
}
testSearch();
