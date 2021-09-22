const fs = require('fs');

module.exports = (client, Discord, config) => {
    const loadDir = (dirs) => {
        const eventFiles = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js'));

        for(const file of eventFiles){
            const event = require(`../events/${dirs}/${file}`);
            const eventName = file.split('.')[0];
            console.log(`Loading event ${eventName}.`);
            client.on(eventName, event.bind(null, client, Discord, config));
        }
    }

    ['client', 'guild'].forEach(e => loadDir(e));
}