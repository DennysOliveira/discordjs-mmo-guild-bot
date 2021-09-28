const { MessageAttachment } = require("discord.js");
const { data } = require("../database/db");

module.exports = {
    name: 'registrar',
    aliases: ['remover', 'listar'],
    description: 'Registra e lista os membros.',
    usage: '',
    async run(message, args, cmd, client, Discord, database){
        if(cmd == 'registrar')
        {
            if(!message.member.hasPermission("ADMINISTRATOR")){
                message.channel.send("Você não tem permissão de executar esse comando.")
                return;
            }

            
            // Define arguments based on message request
            const creator       = `${message.member.user.username}#${message.member.user.discriminator}`;
            const userId        = args[0].slice(3, args[0].length -1);
            const role          = validateRole(args[1]);
            const profession    = validateProfession(args[2]);
            const comments      = args[3];
            
            if(role.status == "invalid") {
                message.channel.send(`Função ${args[1]} inválida.
                As funções disponíveis são ${[...role.validRoles]}`);
                return;
            }

            if(!profession.status == "invalid") {

                return;
            }
            
            // const user = await client.users.cache.find(user => user.id === userId);
            const user = await client.users.fetch(userId);
            
            const request = await database.createMember(
                creator,
                userId,
                user.username,
                user.discriminator,
                role.name,
                profession.name,
                comments
            )
            
            if(request.status == "error") {
                
                
                if(message.contains("duplicate")){
                    message.channel.send(`O usuário ${user.username}#${user.discriminator} já está registrado. Para alterar seus dados, use o comando **!d atualizar**.`)
                }
                else {
                    message.channel.send(`Houve um erro ao executar esse comando. ${request.msg}`)
                }


                return;
            }

            message.channel.send(`O usuário ${user.username}#${user.discriminator} foi registrado com sucesso.`);
            
        }

        if (cmd == 'atualizar')
        {   
            // Define arguments based on message request
            const lastUpdatedBy = `${message.member.user.username}#${message.member.user.discriminator}`;
            const userId        = args[0].slice(3, args[0].length -1);
            const role          = validateRole(args[1]);
            const profession    = validateProfession(args[2]);
            const comments      = args[3];

            if(!message.member.hasPermission("ADMINISTRATOR") || (message.member.user.id != userId)){
                message.channel.send("Você não tem permissão de executar esse comando.")
                return;
            }
            
            const user = await client.users.fetch(userId);

            const member = { 
                lastUpdatedBy, role, 
                username: user.username, 
                discriminator: user.discriminator, 
                profession, 
                comments 
            }

            const request = await database.updateMember(userId, member)

            if(request.status == "error") {
                message.channel.send(`Houve um erro ao executar esse comando. ${request.msg}`)
                return;
            }

            message.channel.send(`O membro ${userFullName}foi deletado com successo do banco de dados.`)
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
            if(!message.member.hasPermission("ADMINISTRATOR")){
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
            string += "```" + "Membro               Função               Profissão           Descrição           " + "\n";
            string +=         "----------------------------------------------------------------------------------" + "\n";

            // Format Display
            members.forEach((member) => {
                let role = "";
                let prof = "";
                let user = fixateStringSize(`${member.username}#${member.discriminator}`, 20);
                if (member.role) {role = fixateStringSize(member.role, 20)} else { role = fixateStringSize("Não definido", 20)};
                if (member.profession) { prof = fixateStringSize(member.profession, 20)} else { prof = fixateStringSize("Não definido", 20)};
                
                string += `${user} ${capStr(role)} ${capStr(prof)}\n`;
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
    },
};


// Comando Exmeplo:
// !d registrar <@!300481947866759170> tank ferreiro