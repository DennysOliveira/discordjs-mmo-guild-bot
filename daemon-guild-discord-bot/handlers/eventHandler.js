const { load } = require('dotenv/types');
const fs = require('fs');

module.exports = (client, Discord) => {
    const loadDir = (dir) => {
        const eventFiles = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js'));

        console.log(`Loading events.`)
        for(const file of eventFiles){
            const event = require(`../events/${dirs}/${file}`);
            const eventName = file.split('.')[0];
            console.log(`Loading event ${eventName}.`);
            client.on(eventName, event.bind(null, Discord, client));
        }
    }
    
    const eventDirectories = fs.readdirSync('./events/');
    eventDirectories.forEach(dir => loadDir(dir));
    // ['client', 'guild'].forEach(e => loadDir(e));
}