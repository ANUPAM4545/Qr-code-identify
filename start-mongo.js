const { MongoMemoryServer } = require('mongodb-memory-server');

async function start() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'identify_db'
    }
  });
  const uri = mongod.getUri();
  console.log(`MongoDB successfully started in-memory on ${uri}`);
  
  // Keep process alive
  setInterval(() => {}, 1000 * 60 * 60);
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
