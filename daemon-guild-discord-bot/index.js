const dotenv = require('dotenv');
dotenv.config();

const validator = require("email-validator");
const Discord = require("discord.js");
const fetch = require('node-fetch');
const config = require('./config.json')
var fs = require('fs');
const { Console } = require('console');
const { measureMemory } = require('vm');


// Tool Flags - not used variables.
_guildMemberAdd = false;
_guildMemberRemove = false;
_guildMemberUpdate = false;
_guildMessage = true;
_guildMessageDelete = false;

const intents = new Discord.Intents([
    Discord.Intents.NON_PRIVILEGED, // include all non-privileged intents, would be better to specify which ones you actually need
    "GUILD_MEMBERS", // lets you request guild members 
]);

const client = new Discord.Client({ ws: { intents }});

// Initial Bot Setup
client.once("ready", () => {
    console.log("Ready!");
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`Started with ${client.users.fetch.length} users, in ${client.channels.fetch.length} channels of ${client.guilds.fetch.length} guilds.`);

    client.user.setActivity(config.activity);
    // Create a bot invite link auto-gen with proper permissions.
});



// On Message Received
client.on("message", function (message) {
    // Get Formatted Time
    let currentTime = new Date();
    currentTime.toDateString();

   

    // If message is not prefixed (not a command).
    if (!message.content.startsWith(config.prefix)) {
        // Message is not a command (doesn't start with the specified prefix.
        if (message.guild) {
            // Guild Message Received
            console.log("L01 Processing message from guild [" + message.guild.name + "]:"+ message.channel.name + " -> " + message.author.username +"#"+ message.author.discriminator +": "+ message.content);
            let log = (" " + message.author.username + "#" + message.author.discriminator + ": " + message.content);            
            LogToFile("GuildMsg", "channels/", (message.channel.name + ".txt"), log);
        }
        else 
        {
            // Direct Message Received
            console.log("L02 Direct message received from -> " + message.author.name + ": " + message.content);
            let log = (" " + message.author.username + "#" + message.author.discriminator + ": " + message.content);
            LogToFile("DirectMsg", "direct/", "log.txt", log)
        }
        return;
    }
    else if (message.author.bot) {
        // If the bot is the message Author, return
        return;
    }
    else
    {
        // Parse command and call it if its valid.
        let command = parseCommand(message);
        
        if (command) { 
            callCommand(command);            
        }
    }
});

client.login(process.env.DISCORD_APP_TOKEN);

var arr = [];

commandsList = {
    test : function(message, args) {
        message.channel.send("Tested.");
    },
    dice : function(message, args) {
        let rand = Math.floor(Math.random() * args[0]) + 1;
        message.channel.send(`Você rolou **${rand}** no dado de ${args[0]} lados.`);
    },
    sort : function(message, args) {
        // #region ~ Define args from request input
        var reqStatus = "ALL";
        var reqRole = 0;

        if(!args[0])
        {
            message.channel.send(`Você precisa especificar o cargo a ser sorteado, exemplo: "/daemons sort CARGO".`);
            return;
        } 
        else {
            reqRole = args[0];
        }

        if(args[1]) {
            reqStatus = args[1];
        }
        else {
            reqStatus = "ALL";
        }
        //#endregion

        // #region ~ Find guild by ID and check if it exists
        const id = config.guildID;
        const guild = client.guilds.cache.find((g) => g.id === id);
        
        if (!guild) {
            console.log (`Não consegui encontrar uma guilda com o ID esoecificado: "${id}"`);
            return;
        }
        //#endregion

        // #region ~ Find Role by Name input from request and check if it exists
        const roleRequested = guild.roles.cache.find((role) => role.name === args[0]);
        if(!roleRequested) {
            message.channel.send(`Não consegui encontrar esse cargo, nesse servidor.`);
            return;
        }
        //#endregion

        var arr = new Array();

        // #region ~ Do fetch and sort through the member list.
        // Discord.RoleManager: fetch specific requested role.
        const request = guild.roles.fetch(roleRequested.id)
        .then( role => {
            // Log specific role members size.
            console.log(`Logging role.members.size: ${role.members.size}`);

            // doMessageHeader(sort); --> Make this a function later so it requires less lines inside the object.
            // #region ~ Log message header.
            if (reqStatus === "ALL") {
                message.channel.send(`**Jogo de azar é comigo mesmo >:)**\nSorteando ${role.members.size} membros do cargo ${role.name}.\nConsiderando todos os membros do cargo.\n`);
            } else if (reqStatus === "ONLINE") {
                message.channel.send(`**Jogo de azar é comigo mesmo >:)**\nSorteando ${role.members.size} membros do cargo ${role.name}.\nConsiderando apenas os membros que estão online no Discord.\n`);
            } else if (reqStatus === "VOICE") {
                message.channel.send(`**Jogo de azar é comigo mesmo >:)**\nSorteando ${role.members.size} membros do cargo ${role.name}.\nConsiderando apenas os membros que estão no canal ${message.member.voice.channel}\n`);
            }
            // #endregion

            // Discord.GuildMemberManager: fetch members to iterate through.
            guild.members.fetch().then( members => {
                // Log total guild members size.
                console.log(`Logging members.size: ${members.size}`);

                // Iterate through the Discord.Collection of Discord.GuildMember.
                members.forEach( member => {
                    // Roll a random number to the current member.
                    let user = `${member.user.username}#${member.user.discriminator}` 
                    let rand = Math.floor(Math.random() * 1000) + 1;
                    let kvp = [rand, user];

                    if (member.roles.cache.some( _role => _role.name === role.name))
                    {
                        arr.push(kvp);
                        console.log(`Sorting: ${arr.length}/${role.members.size} ${kvp[1]}`);
                    }

                    // If this array meets the size intended 
                    if (arr.length === role.members.size)
                    {
                        // Sort array in desc order
                        arr.sort((a, b) => {
                            if (a[0] < b[0]) return 1;
                            if (a[0] > b[0]) return -1;
                            return 0;
                        })

                        let string = "";
                        let position = 1;
                        arr.forEach( member => {
                            if(string.length >= 1800) 
                            {
                                message.channel.send(string);
                                string = "";
                            }

                            string = string + `${position}º - **${member[1]}**\nRolagem: ${member[0]}\n\n`
                            position++;
                        });
                        message.channel.send(string);
                    };
                });
            });
        });
        // #endregion
        
    }
};

async function fetchRoleCount(guildId, roleId)
{
    const guild = client.guilds.cache.find((g) => g.id === guildId);
    let count = 0

    const request = await guild.roles.fetch(roleId)
    .then(role => {
        console.log(role.members.size);
        count = role.members.size;
        return count;
    })
    .catch(err => {
        console.log(err);
        return;
    });
    
}

function parseCommand(message) {
    const commandBody = message.content.slice(config.prefix.length); // Returns a string without the prefix. 
    const args = commandBody.trim().split(' '); // Removes blank spaces and splits each argument to an array.
    const command = args.shift().toLowerCase(); // Grab the command from the array and remove it from it.

    if (command) {
        let log = (`ParseCommand> Valid request by user ${message.author.username}#${message.author.discriminator} -> ${message.content}`);
        console.log(log);

        LogToFile("ValidRequest", "commands", "requests", log);

        let commandArray = [message, command, args];
        return commandArray;
    }
    else {
        let log = (`ParseCommand> Invalid request by user ${message.author.username}#${message.author.discriminator}. Either empty or missing command -> ${message.content}`);
        console.log(log);

        LogToFile("InvalidRequest", "commands", "requests", log);
        console.log("E03 Empty or invalid request, missing command after prefix. Message -> " + message.content);

        return false;
    }
}

function callCommand(commandArr){
    message = commandArr[0];
    command = commandArr[1];
    args = commandArr[2];

    if (commandsList[command])
    {
        // Call the proper command inside the Commands library, if it exists.
        let log = `CallCommand> Valid command called by user ${message.author.username}#${message.author.discriminator} -> ${command}`;
        LogToFile("ValidCommand", "commands", "calls", log)

        console.log(log);
        commandsList[command](message, args);
    }
    else
    {
        let log = `CallCommand> Invalid command called by user ${message.author.username}#${message.author.discriminator}. Command doesn't exist -> ${command}`;
        LogToFile("InvalidCommand", "commands", "calls", log);
        console.log(log);
    }
}

function LogToFile(type, directory, filename, content) {
    let currentTime = new Date();
    currentTime.toDateString();

    // Check if directory is terminated correctly with slashes, else, correct it.
    let lastchar = directory.slice(-1);
    if (lastchar !== "/") {
        directory = directory + "/";
    }

    // Add folder prefix.
    directory = "./logs/" + directory;
    
    // Check if folder exists, if not -> create it.
    if(!fs.existsSync(directory)){
        fs.mkdirSync(directory, { recursive: true });
    };

    let log = (`${currentTime} [${type}] ${content} \n`);
    let fullpath = directory + filename
    
    // Log valid message.
    fs.appendFile(fullpath, log, function (err) {
        if (err) {
            // FileSystem error when logging.
            console.log(err);
            console.log("LogToFileError when trying to log below.");
            console.log(`${log}`)
            console.log(`${fullpath}`)
            console.log(``)
        } else {
            // FileSystem success when logging.
            // console.log("Path: " + fullpath + " - Log: " + log);
        }
    });
}



// function DMSendErr(messageHandler, errMsg) {
//     messageHandler.author.send('**Hey ' + messageHandler.author.username + '!**');
//     messageHandler.author.send('Your command "**' + messageHandler.content + '**" is invalid.');
//     messageHandler.author.send(errMsg);

//     console.log('User ' + messageHandler.author.username + ' failed due to err: ' + errMsg);
// }


// if (command === 'test') {
//     message.channel.send("<@" + message.author.id + "> \n" +
//     "Second line. **Bold text.**");

// } else 
// if (command === 'help') {
//     const embed = new Discord.MessageEmbed()
//         .setColor('#00ffff')
//         .setTitle('Information')
//         .setURL("https://daemons.vercel.app/")
//         .setAuthor('Daemons')
//         .setDescription('For administrative commands, please call this command on admin channels.')            
//         .setTimestamp()
//         .setFooter('Daemons - New World')
//         .addFields(
//             { name: 'Placeholder', value: '/placeholder command' }
//         );

//     if(message.channel.name === "admin") {
//         embed.addField('Listar membros registrados:', '/cramunhão membros');
//         message.channel.send(embed);
//     } else {
//         message.channel.send(embed);
//     }
// }   