module.exports = {
    name: 'ping',
    aliases: ['pung', 'pang', 'peng'],
    description: 'Ping command.',
    run(message, args, cmd, client, Discord) {
        message.channel.send("pong!");
    }
}