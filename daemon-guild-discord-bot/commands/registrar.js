const { MessageAttachment } = require("discord.js");
const { data } = require("../database/db");

module.exports = {
    name: 'registrar',
    aliases: ['remover', 'listar', 'atualizar'],
    description: 'Registra e lista os membros.',
    usage: '',
    async run(message, args, cmd, client, Discord, database){
        try {
            
            if(cmd === 'registrar')
            {
                // Validate user permissions
                if(!message.member.hasPermission("ADMINISTRATOR")){
                    throw "Você não tem permissão de executar esse comando."
                }

                if(args.length <= 0) throw `O registro deve ser feito da seguinte forma; !d registrar <@!${message.member.user.id}> tank joalheria Nome no Jogo`
                
                

                // Define arguments based on message request
                const creator       = `${message.member.user.username}#${message.member.user.discriminator}`;
                const ign           = args.slice(3).join(' ');
                const userIdString = args[0].slice(3, args[0].length -1);
                
                // Validate UserID
                if (userIdString.length != 18) {
                    throw `O usuário precisa ser mencionado com "@".\nDessa forma: !d registrar <@!${message.member.user.id}>.`;                    
                }
                
                // If user is valid, parse it into a number.
                const userId        = parseInt(userIdString);

                
                // Call Role and Profession validation
                const role          = validateRole(args[1]);
                const profession    = validateProfession(args[2]);

                // Validate errors for roles.
                if(role.status == "invalid") throw `**Função inválida:**:   O membro será registrado sem definição. - As funções disponíveis são ${[...role.validRoles]}\n`;
                if(profession.status == "invalid") throw `**Profissão inválida:** O membro será registrado sem definição. - As profissão disponíveis são ${[...profession.validProfessions]}\n`;
                
                // const user = await client.users.cache.find(user => user.id === userId);
                const user = await client.users.fetch(userId);
                
                const request = await database.createMember( creator, userId, user.username, user.discriminator, ign, role.name, profession.name );
                
                // Validate if error received from database.createMember
                if(request.status == "error") {               
                    if(request.msg.contains("duplicate")) throw `O usuário ${user.username}#${user.discriminator} já está registrado. Para alterar seus dados, use o comando **!d atualizar**.`;
                    else throw `Houve um erro ao executar esse comando. ${request.msg}`
                }
                
                // If no errors until now, request was successful.
                message.channel.send(sendEmbed(`O usuário ${user.username}#${user.discriminator} foi registrado com sucesso.`));

            
            }

            if (cmd === 'atualizar')
            {   
                // Extract data from message arguments
                const lastUpdatedBy = `${message.member.user.username}#${message.member.user.discriminator}`;
                const _role          = validateRole(args[1]);
                const _profession    = validateProfession(args[2]);
                const comments      = args[3];
                const userIdString = args[0].slice(3, args[0].length -1);
                
                // Validate UserID
                if (userIdString.length != 18) {
                    throw `O usuário precisa ser mencionado com "@".\nDessa forma: !d registrar <@!${message.member.user.id}>.`;                    
                }
                
                // If user is valid, parse it into a number.
                const userId        = parseInt(userIdString);

                // If not administrator or not trying to edit self -> return error.
                if(!message.member.hasPermission("ADMINISTRATOR") || !(message.member.user.id = userId)){
                    throw "Você não tem permissão de executar esse comando.";
                };
                
                const user = await client.users.fetch(userId);

                const member = { 
                    lastUpdatedBy,
                    username: user.username, 
                    discriminator: user.discriminator, 
                    role: _role.name, 
                    profession: _profession.name, 
                    comments 
                }

                const request = await database.updateMember(userId, member)

                if(request.status == "error") {
                    message.channel.send(`Houve um erro ao executar esse comando. ${request.msg}`)
                    return;
                }

                if(!request) {
                    console.log("No rqst.")
                }

                message.channel.send(`O membro ${member.username}#${member.discriminator} foi atualizado com sucesso.`)
            }

            if (cmd === 'remover')
            {
                if(!message.member.hasPermission("ADMINISTRATOR")){
                    message.channel.send("Você não tem permissão de executar esse comando.")
                    return;
                }

                const userId        = args[0].slice(3, args[0].length -1);
                
                const request = await database.deleteMember(userId);
                const user = await client.users.fetch(userId);

                if(request.status == "error") {
                    message.channel.send("Houve um problema ao executar esse comando. Contate um administrador.");
                    return;
                }

                let userFullName = `${user.username}#${user.discriminator}`
                message.channel.send(`O membro ${userFullName}foi deletado com successo do banco de dados.`);


            }

            if (cmd === 'listar')
            {
                if(!message.member.hasPermission("ADMINISTRATOR")) {
                    // message.channel.send("Você não tem permissão de executar esse comando.")
                    return;
                }

                const request = await database.fetchMembers();

                if(request.status == "error") {
                    // message.channel.send(`Houve um erro ao executar esse comando. ${request.msg}`);
                }

                var string;
                var members = request.data;
                
                // Get Profession and Role quantities
                // Roles and Professions index
                var staticRoles = { melee: 0, ranged: 0, mage: 0, tank: 0, healer: 0, nd: 0 };
                var staticProfs = { ferraria: 0, armaria: 0, engenharia: 0, joalheria: 0, arcana: 0, culinaria: 0, mobilia: 0, nd: 0 };

                // Add profession and roles to index
                members.forEach(member => {
                    console.log(`Validating role: ${member.role}`);
                    
                    let role = validateRole(member.role);
                    if(role.status == "valid") {
                        staticRoles[member.role] += 1;
                    }
                    else {
                        staticRoles["nd"] += 1;
                    }                

                    console.log(`Validating prof: ${member.role}`);
                    let prof = validateProfession(member.profession);
                    if(prof.status == "valid") {
                        staticProfs[member.profession] += 1;
                    }
                    else {
                        staticProfs["nd"] += 1;
                    }
                });

                // Display General Overview (TODO: FixateStringSize and better layout to be displayed)
                string += "\n**Lista dos Membros Registrados**\n"
                string += "```\n"
                string += `Funções:\n`
                string += `${fixateStringSize(`Tanques: ${staticRoles.tank}`, 16)} ${fixateStringSize(`Healer: ${staticRoles.healer}`, 16)} ${fixateStringSize(`Magos: ${staticRoles.mage}`, 16)} ${fixateStringSize(`Ranged: ${staticRoles.ranged}`, 16)} ${fixateStringSize(`Melee: ${staticRoles.melee}`, 16)} ${fixateStringSize(`Não definido: ${staticRoles.nd}`, 16)} \n`
                string += "```"
                string += "```"
                string += `Profissões:\n`
                string += `${fixateStringSize(`Ferraria: ${staticProfs.ferraria}`, 16)} ${fixateStringSize(`Armaria: ${staticProfs.armaria}`, 16)} ${fixateStringSize(`Engenharia: ${staticProfs.engenharia}`, 16)} ${fixateStringSize(`Joalheria: ${staticProfs.joalheria}`, 16)} ${fixateStringSize(`Arcana: ${staticProfs.arcana}`, 16)} ${fixateStringSize(`Culinária: ${staticProfs.culinaria}`, 16)} ${fixateStringSize(`Mobília: ${staticProfs.mobilia}`, 16)} ${fixateStringSize(`Não def: ${staticProfs.nd}`, 16)}\n`
                string += "```"
                
                // Sort Roles Alphabetically
                // Deprecated (now done in fetchMembers directly from the db)
                // Still might be useful later on
                // members.sort((a, b) => {                
                //     if(a.role > b.role) return -1;
                //     if(a.role < b.role) return 1;
                //     return 0;

                // })
            
                
                // Add Display Header for member listing
                string += "```" + "Membro               IGN                  Função               Profissão           Descrição           " + "\n";
                string +=         "-------------------------------------------------------------------------------------------------------" + "\n";

                // Format Display
                members.forEach((member) => {
                    let role = "";
                    let prof = "";
                    let user = fixateStringSize(`${member.username}#${member.discriminator}`, 20);
                    let ign  = fixateStringSize(`${member.ign}`, 20);
                    if (member.role) {role = fixateStringSize(member.role, 20)} else { role = fixateStringSize("Não definido", 20)};
                    if (member.profession) { prof = fixateStringSize(member.profession, 20)} else { prof = fixateStringSize("Não definido", 20)};
                    
                    string += `${user} ${ign} ${capStr(role)} ${capStr(prof)}\n`;
                });

                string += "```"

                message.channel.send(string);

            }

            function fixateStringSize(str, size){
                let string = str;

                let len = string.length;

                if(string.length < size) {
                    for(var i = string.length; i < size; i++){
                        string += " ";
                    }
                } else {
                    string = string.substring(0, size);
                }
                console.log(string)
                return string;
                
            }

            function validateRole(role){
                const validRoles = [
                    "tank", "ranged",
                    "melee", "mage",
                    "healer"
                ]

                if(validRoles.includes(role)) {
                    return { status: "valid",   validRoles, name: role };
                } else {
                    return { status: "invalid", validRoles, name: "nd" };
                }
            }

            function validateProfession(profession){
                const validProfessions = [
                    "ferraria", "armaria", 
                    "engenharia", "joalheria",
                    "arcana", "culinaria",
                    "mobilia"
                ]

                if(validProfessions.includes(profession)) {
                    return { status: "valid",   validProfessions, name: profession };
                } else {
                    return { status: "invalid", validProfessions, name: "nd" };
                }
            }

            function capStr(string){
                let lwr = string.toLowerCase();
                
                return string.charAt(0).toUpperCase() + lwr.slice(1);
            }

            function sendEmbed(msg) {
                return new Discord.MessageEmbed().setColor('#FF0000').setDescription(msg);
            }
        }
        catch (err) {
            console.log(err);
            console.log(`Error caught at "/registrar.js" above.`);
            message.channel.send(sendEmbed(err));
        }
    },
};


// Comando Exmeplo:
// !d registrar <@!300481947866759170> tank ferreiro O Feiticeiro