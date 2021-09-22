module.exports = {
    name: 'sort',
    alias: ['sorteio', 'sortear'],
    description: 'Sorteia os membros do cargo especificado.',
    usage: '',
    run(message, args, cmd, client, Discord) {
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
        
    }
}