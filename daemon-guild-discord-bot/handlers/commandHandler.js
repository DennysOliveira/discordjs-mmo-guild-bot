const fs = require('fs');

module.exports = (client, Discord) => {
    console.log(`Loading command modules:`);
    
    const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
    
    for(const file of commandFiles) {
        const command = require(`../commands/${file}`);
        
        if(command.name) {
            client.commands.set(command.name, command);
            console.log(`Loading module ${file}`);
        } else {
            console.log(`Warning when loading module ${file}`);
            continue;
        }
    }
}