module.exports = (client, Discord, config) => {
    
        console.log(`Bot is online! Version ${config.version}`);
        console.log(`Logged in as ${client.user.tag}`);
        console.log(`Started with ${client.users.fetch.length} users, in ${client.channels.fetch.length} channels of ${client.guilds.fetch.length} guilds.`);
    
        client.user.setActivity(config.activity);
        
    
}