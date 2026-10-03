import { ChromaClient } from 'chromadb';

async function deleteCorruptData() {
  console.log('Connecting to Chroma DB at http://localhost:8000...');

  const client = new ChromaClient({
    host: 'localhost',
    port: 8000,
  });

  try {
    const collectionName = 'querychat_collection';
    const collection = await client.getCollection({
      name: collectionName,
    });

    console.log(`Deleting documents from source: 'The_Lantern_of_Chandpur_Story.pdf'...`);
    
    // Chroma DB allows deleting by metadata using the 'where' clause
    await collection.delete({
      where: { source: 'The_Lantern_of_Chandpur_Story.pdf' }
    });

    console.log('Successfully deleted the corrupt data!');
    
    const remaining = await collection.count();
    console.log(`Remaining items in collection: ${remaining}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

deleteCorruptData();
