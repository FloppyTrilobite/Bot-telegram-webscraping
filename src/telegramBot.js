const TelegramBot = require("node-telegram-bot-api");
const emoji = require("node-emoji").emoji;

const token = require("./environment.json").token;
const bot = new TelegramBot(token, { polling: true });

const Mongo = require("./infra/Mongo");

const Scraper = require("./infra/scraper");


bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];

  bot.sendMessage(chatId, resp);
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === "/echo") {
    bot.sendMessage(
      chatId,
      "pipipipopopo"
    );
  } else if (msg.text === "/subscribe") {
    try {
      let client = await Mongo.conectarMongoDB();
      let db = client.db("projetoBot");
      let collection = db.collection("users");
      let usuarios = await collection.find({}).toArray();
      for (usuario of usuarios) {
        if (chatId == usuario.telegramId) {
          bot.sendMessage(chatId, "Id já registrado");
          await Mongo.desconectarMongoDB(client);
          return;
        }
      }
      let pessoa = {
        telegramId: chatId,
        nome: msg.chat.first_name,
        sobrenome: msg.chat.last_name,
        dataCadastro: new Date(),
      };
      collection.insertOne(pessoa, async (err, resultado) => {
        if (err) {
          console.log(err);
          return;
        }
        bot.sendMessage(chatId, "Feito!você está inscrito");
        await Mongo.desconectarMongoDB(client);
      });
    } catch (erro) {
      bot.sendMessage(chatId, "Não consegui te inscrever");
      console.log(erro);
    }
  } else if (msg.text === "/unsubscribe") {
    try {
      let client = await Mongo.conectarMongoDB();
      let db = client.db("projetoBot");
      let collection = db.collection("users");
      await collection.deleteOne(
        { telegramId: chatId },
        async (err, resultado) => {
          if (err) {
            console.log(err);
            bot.sendMessage(chatId, "Não consegui te desinscrever");
          } else {
            bot.sendMessage(chatId, "Ok, espero ter sido útil");
          }
          await Mongo.desconectarMongoDB(client);
        }
      );
    } catch (erro) {
      bot.sendMessage(chatId, "Não consegui te desinscrever");
      console.log(erro);
    }
  } else {
    bot.sendMessage(
      chatId,
      `\n\/echo -> Interagir comigo ${emoji.boat}\n/subscribe -> Você se inscreve para receber atualizações de agendamentos\n/unsubscribe -> Você para de receber minhas mensagens chatas`);
  }
});

async function analisaSubAtt() {
  
  let dados = await Scraper();

  console.log(dados);

  try {
    let client = await Mongo.conectarMongoDB();
    let db = client.db("projetoBot");
    let collection = db.collection("users");
    let usuarios = await collection.find({}).toArray();
    for (usuario of usuarios) {
      bot.sendMessage(usuario.telegramId, JSON.stringify(dados));
    }
    await Mongo.desconectarMongoDB(client);
  } catch (erro) {
    console.log(erro);
  }
}

const interval = setInterval(analisaSubAtt, 60000);
