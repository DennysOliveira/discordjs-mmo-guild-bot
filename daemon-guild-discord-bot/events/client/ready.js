module.exports = (client, Discord, config) => {
    
        console.log("Cramunhão tá online, corre Jesus!");
        console.log(`Logged in as ${client.user.tag}`);
        console.log(`Started with ${client.users.fetch.length} users, in ${client.channels.fetch.length} channels of ${client.guilds.fetch.length} guilds.`);
    
        client.user.setActivity(config.activity);
        
    
}