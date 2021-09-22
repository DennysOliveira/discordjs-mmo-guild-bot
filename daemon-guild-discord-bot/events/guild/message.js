const fs = require('fs');

module.exports = (client, Discord, config, message) => {
    // Get Formatted Time
    let currentTime = new Date();
    currentTime.toDateString();

    // Validate prefixes bot watching rules
    if (!doValidate(message)) return;

    // Try and parse valid command
    const request = parseCommand(message);

    // Check input command
    const command = client.commands.get(request.cmd) || client.commands.find(a => a.aliases && a.aliases.includes(request.cmd));
    
    // Validate and run
    if (command) command.run(message, request.args, request.cmd, client, Discord);


    
    //#region ~ Functions
    function doValidate(message)
    {
        if (message.author.bot) return;
        if (!message.content.startsWith(config.prefix)) {
            // Message is not a command (doesn't start with the specified prefix.
            if (message.guild) {
                // Guild Message Received
                console.log("L01 Processing message from guild [" + message.guild.name + "]:"+ message.channel.name + " -> " + message.author.username +"#"+ message.author.discriminator +": "+ message.content);
                let log = (" " + message.author.username + "#" + message.author.discriminator + ": " + message.content);            
            }
            return;
        }
        
        if(!message.guild) {
            // Direct Message Received
            let user = message.author.username + "#" + message.author.discriminator;
        
            console.log(`L02 Direct message received from ${user}: ${message.content}`);
            let log = (`${user}: ${message.content}`);
            LogToFile("DirectMsg", "direct/", user, log, message);
            return;
        }

        return 1;
    }
    
    function parseCommand(message) {
        const commandBody = message.content.slice(config.prefix.length); // Returns a string without the prefix. 
        const args = commandBody.trim().split(' '); // Removes blank spaces and splits each argument to an array.
        const command = args.shift().toLowerCase(); // Grab the command from the array and remove it from it.

        if (command) {
            let log = (`ParseCommand> Valid request by user ${message.author.username}#${message.author.discriminator} -> ${message.content}`);
            console.log(log);

            LogToFile("ValidRequest", "commands", "requests", log, message);

            const request = {
                cmd: command,
                args: args
            }
            
            return request;
        }
        else {
            let log = (`ParseCommand> Invalid request by user ${message.author.username}#${message.author.discriminator}. Either empty or missing command -> ${message.content}`);
            console.log(log);

            LogToFile("InvalidRequest", "commands", "requests", log, message);
            console.log("E03 Empty or invalid request, missing command after prefix. Message -> " + message.content);

            return false;
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
        // directory =  "../logs/" + directory;
        directory =  `../logs/${message.guild.id}/${directory}`;
        
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
    //#endregion
};

// function callCommand(commandArr){
//     message = commandArr[0];
//     command = commandArr[1];
//     args = commandArr[2];

//     if (commandsList[command])
//     {
//         // Call the proper command inside the Commands library, if it exists.
//         let log = `CallCommand> Valid command called by user ${message.author.username}#${message.author.discriminator} -> ${command}`;
//         LogToFile("ValidCommand", "commands", "calls", log, message)

//         console.log(log);
//         commandsList[command](message, args);
//     }
//     else
//     {
//         let log = `CallCommand> Invalid command called by user ${message.author.username}#${message.author.discriminator}. Command doesn't exist -> ${command}`;
//         LogToFile("InvalidCommand", "commands", "calls", log, message);
//         console.log(log);
//     }
// }



