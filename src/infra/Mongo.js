const mongoUri = require("../environment.json").mongoURI;
const { MongoClient } = require("mongodb");

async function conectarMongoDB() {
  const client = new MongoClient(mongoUri, { useUnifiedTopology: true });

  try {
    await client.connect();
    console.log("Conexão estabelecida com sucesso!");
    return client;
  } catch (e) {
    console.log(e);
  }
}

async function desconectarMongoDB(client) {
  if (client) {
    try {
      await client.close();
      console.log("Conexão fechada com sucesso!");
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = { conectarMongoDB, desconectarMongoDB };
