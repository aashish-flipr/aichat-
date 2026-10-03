import { ChromaClient } from 'chromadb';

async function peek() {
  console.log('Connecting to Chroma DB at http://localhost:8000...\n');

  const client = new ChromaClient({
    host: 'localhost',
    port: 8000,
    ssl: false,
  });

  try {
    const collections = await client.listCollections();

    if (collections.length === 0) {
      console.log('No collections found.');
      return;
    }

    console.log(`Found ${collections.length} collection(s):`);

    for (const c of collections) {
      console.log(`- ${c.name}`);
    }

    const collectionName = 'querychat_collection';

    const collection = await client.getCollection({
      name: collectionName,
    });

    const total = await collection.count();

    console.log(`\nCollection: ${collectionName}`);
    console.log(`Total items: ${total}`);

    const data = await collection.get({
      limit: 50,
      include: ['documents', 'metadatas', 'embeddings'],
    });

    console.log('\n========== CHROMA DATA ==========');

    for (let i = 0; i < data.ids.length; i++) {
      console.log(`\nDOCUMENT #${i + 1}`);
      console.log('--------------------------------');

      console.log('ID:');
      console.log(data.ids[i]);

      console.log('\nTEXT:');
      console.log(data.documents?.[i]);

      console.log('\nMETADATA:');
      console.dir(data.metadatas?.[i], { depth: null });


      console.log('\n================================');
    }
  } catch (error) {
    console.error('\nError:', error.message);
  }
}

peek();