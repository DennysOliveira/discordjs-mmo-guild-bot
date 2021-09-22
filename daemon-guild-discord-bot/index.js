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
    _help: "`!cramunhão help`\nMostra isso.",
    help: function(message, args) {
        let string = "";
        for (var key in commandsList) {
            if(key[0] != "_") {
                string += "**"+ key.toUpperCase() + "**\n";

                let descriptor = "_" + key;
                if(commandsList[descriptor])
                {
                    string += commandsList[descriptor] + "\n";
                } else {
                    string += "\n";
                }

                string += "\n";
            }
        }

        if(string) {
            message.channel.send(`${string}`);
        }
    },
    _fala: "`!cramunhão fala Boa noite.`\nFaz com que o cramunhão diga as palavras no seu lugar.",
    fala: function(message, args) {
        
        let string = "";
        args.forEach(word => {
            string += word + " ";
            
        });
        
        message.channel.send(`**${string}**`);
        
        message.delete();        
    },    
    _dice: "`!cramunhão dice 20`\nRola um dado de quantos lados você especificar.",
    dice : function(message, args) {
        let rand = Math.floor(Math.random() * args[0]) + 1;
        message.channel.send(`Você rolou **${rand}** no dado de ${args[0]} lados.`);
    },
    _sort: "`!cramunhão sort @cargo`\nSorteia dentre os membros de um cargo especificado.",
    sort : function(message, args) {
        // #region ~ Define args from request input
        const reqStatusEnum = { 
            TODOS: 1,
            CANAL: 2,
            VOZ: 3 
        };
        var reqStatus = reqStatusEnum.TODOS;
        var reqMaximum = 0;

        // Role to be sorted
        if(!args[0])
        {
            message.channel.send(`Você precisa especificar o cargo a ser sorteado, exemplo: "/daemons sort CARGO".`);
            return;
        } 
        else {
            var reqRole = args[0];
        }

        // Status to be considered
        if(args[1]) {
            let string = args[1];
            string.toUpperCase();

            if (reqStatusEnum[string])
            {
                reqStatus = reqStatusEnum[string];
            } else {
                message.channel.send("Você precisa escolher dentre os seguintes filtros do cargo para o sorteio: **todos**, **canal** ou **voz**.");
            }
        }
        else {
            reqStatus = reqStatusEnum.TODOS;
        }

        // Maximum number of people to be shown.
        if (args[2]) {
            var reqMaximum = args[2];
        } else {
            var reqMaximum = 0;
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

        // #region ~ Do fetch and sort through the member list.
        // Discord.RoleManager: fetch specific requested role.
        var arr = new Array();
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

                        // Limit the array to the size requested
                        if (reqMaximum != 0)
                        {
                            arr = arr.slice(role.members.size - reqMaximum);
                        }

                        // Formulates the string to be sent
                        let string = "";
                        let position = 1;
                        arr.forEach( member => {
                            // Send the string for each message character limit before continuing
                            if(string.length >= 1800) 
                            {
                                message.channel.send(string);
                                string = "";
                            }
                            
                            // Description line for each member sorted.
                            string = string + `${position}º - **${member[1]}** - Rolagem: ${member[0]}\n`
                            position++;
                        });
                        message.channel.send(string);
                    };
                });
            });
        });
        // #endregion
        
    },
    _play: "`!cramunhão play https://youtube.com/...`\nToca música.\nSuporte p/ Youtube apenas, por enquanto.",
    play : function (message, args) {
        const url = args[0];
        if (!url) {
            message.channel.send(`Você precisa especificar a URL da música.`);
            return;
        }
    },
    _test: "`!cramunhão test`\nTeste.",
    test : function(message, args) {
        let string = args[0];
        let roleId = string.slice(3, -1);

        console.log(roleId);
        console.log(roleId.length);

        const roleRequest = message.guild.roles.cache.find((role) => role.id === roleId);
        
        if(!roleRequest) {
            message.channel.send(`Não consegui encontrar esse cargo em ${message.guild.name}.`);
            return;
        }
        else {
            message.channel.send(`Você quis dizer: ${roleRequest.name}?`);
        }
    }
};

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

