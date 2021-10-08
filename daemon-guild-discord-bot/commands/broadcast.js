module.exports = {
    name: 'broadcast',
    aliases: ['cast'],
    description: 'Broadcasts a message to all users from a specific role into their DM channel.',
    async run(message, args, cmd, client, Discord) {
        try {
            const roleId = args[0].slice(3, args[0].length -1);
            const cast   = args.slice(1).join(' ');

            // #region ~ Find guild by ID and check if it exists
            const guildId = message.guild.id;
            const guild = client.guilds.cache.find((g) => g.id === guildId);
            
            if (!guild) {
                console.log (`Não consegui encontrar uma guilda com o ID esoecificado: "${id}"`);
                return;
            }
            //#endregion

            // #region ~ Find Role by Name input from request and check if it exists
            const role = guild.roles.cache.find((role) => role.id === roleId);
            if(!role) {
                throw (`Não consegui encontrar esse cargo nesse servidor.`);
            }
            //#endregion
            const roleSync = await guild.roles.fetch(role.id);
            const members = await guild.members.fetch();

            var validMembers = [];

            members.forEach(member => {
                
                if(member.roles.cache.some(_role => _role.id == role.id)) {
                    console.log(`Valid for ${member.user.username}`)
                    validMembers.push(member);
                }

            });

            
            validMembers.forEach(member => {
                
                member.send(
                    new Discord.MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle(message.guild.name)
                    .setDescription(cast)
                    .setFooter(`Enviado por ${message.author.username}#${message.author.discriminator}`, message.author.avatarURL())
                    .setTimestamp()
                    .setThumbnail(message.author.avatarURL())
                );

                
            });

            message.channel.send(
                new Discord.MessageEmbed()
                .setColor('#FF0000')
                .setDescription(`Broadcast enviado com sucesso para ${validMembers.length} usuários do cargo **${role.name}**.`)
                .setFooter(`Enviado por ${message.author.username}#${message.author.discriminator}`, message.author.avatarURL())
                .setTimestamp()
                
            );

            
        }
        catch (err) {
            console.log("Err found at broadcast cmd.")
            console.log(err)
            return;
        }

    }
}
