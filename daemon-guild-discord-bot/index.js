const dotenv = require('dotenv');
const Discord = require("discord.js");
const config = require('./config.json')
const ytdl = require('ytdl-core');
const fs = require('fs');

dotenv.config();

const intents = new Discord.Intents([
    Discord.Intents.NON_PRIVILEGED, // include all non-privileged intents, would be better to specify which ones you actually need
    "GUILD_MEMBERS", // lets you request guild members 
]);

const client = new Discord.Client({ ws: { intents }});

client.commands  = new Discord.Collection();
client.events    = new Discord.Collection();

// Load Databases
const database = require('./database/db.js');
database.initialize(client, Discord, config);

database.connect().then(() => {
    console.log("Database: Database is connected.");
})
.catch(err => {
    console.log("Database: Failed to connect.");
    console.log("Database: Error logged to logs/db.txt");
    console.log(fs.appendFile("./logs/db.txt", err));
});




// Load Handlers
console.log(`Loading handlers:`);
const handlerFiles = fs.readdirSync('./handlers/').filter(file => file.endsWith('.js'))
for (const file of handlerFiles) {
    console.log(`Loading handler: ${file}`);
    require(`./handlers/${file}`)(client, Discord, config, database);
};


client.login(process.env.DISCORD_APP_TOKEN);

// Command Line Interface input handler for server-sided commands.
const inputHandler = require('./inputHandler');
const { userInfo } = require('os');

// Initializes this input handler instance once.
inputHandler.init();


// Initializes logger
const logger = require('./logger').Init(config);