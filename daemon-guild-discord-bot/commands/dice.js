module.exports = {
    name: 'dice',
    aliases: ['rolar', 'roll', 'dado'],
    description: 'Rola um dado de quantos lados você quiser.',
    run(message, args, cmd, client, Discord) {
        let rand = Math.floor(Math.random() * args[0]) + 1;
        message.channel.send(`Você rolou **${rand}** no dado de ${args[0]} lados.`);
    }
}
