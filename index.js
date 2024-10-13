const Discord = require('discord.js')
const intents = new Discord.IntentsBitField(3276799)
const bot = new Discord.Client({intents})
const handlerCommand = require('./Loader/handlerCommands')
const handlerEvents = require('./Loader/handlerEvents')
const express = require('express')
const app = express()
const PORT = 3000;

const configs = require('./configs.json')
bot.commands = new Discord.Collection()

handlerCommand(bot)
handlerEvents(bot)

bot.login(configs.token)

app.get('/status', (req, res) => {
    const status = bot.isReady() ? 'online' : 'offline';
    res.json({ botStatus: status });
});

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});