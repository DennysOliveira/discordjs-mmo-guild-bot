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
            
            
            // const user = await client.users.cache.find(user => user.id === userId);
            const user = await client.users.fetch(userId);
            
            const request = await database.createMember(
                creator,
                userId,
                user.username,
                user.discriminator,
                role,
                profession,
                comments
            )
            
            if(!request.status) {
                
                if(request.status.contains("duplicate")){
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
            if(!message.member.hasPermission("ADMINISTRATOR")){
                message.channel.send("Você não tem permissão de executar esse comando.")
                return;
            }

            // Define arguments based on message request
            const lastUpdatedBy = `${message.member.user.username}#${message.member.user.discriminator}`;
            const userId        = args[0].slice(3, args[0].length -1);
            const role          = validateRole(args[1]);
            const profession    = validateProfession(args[2]);
            const comments      = args[3];
            
            const user = await client.users.fetch(userId);

            const member = { 
                lastUpdatedBy, role, 
                username: user.username, 
                discriminator: user.discriminator, 
                profession, 
                comments 
            }

            const request = await database.updateMember(userId, member)

            if(!request.status) {
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

            if(!request.status) {
                message.channel.send("Houve um problema ao executar esse comando. Contate um administrador.");
                return;
            }

            let userFullName = `${user.username}#${user.discriminator}`
            message.channel.send(`O membro ${userFullName}foi deletado com successo do banco de dados.`);


        }

        if (cmd === 'listar')
        {
            if(!message.member.hasPermission("ADMINISTRATOR")){
                message.channel.send("Você não tem permissão de executar esse comando.")
                return;
            }

            const response = await database.fetchMembers();

            if(!response.status) {
                message.channel.send(`Houve um erro ao executar esse comando. ${response.msg}`);
            }
            
            var string = "```" + "Membro               Função               Profissão           Descrição           " + "\n";
            string +=            "----------------------------------------------------------------------------------" + "\n";

            response.forEach((member) => {
                let role = "";
                let prof = "";
                let user = fixateStringSize(`${member.username}#${member.discriminator}`, 20);
                if (member.role) {role = fixateStringSize(member.role, 20)} else { role = fixateStringSize("Não definido", 20)};
                if (member.profession) { prof = fixateStringSize(member.profession, 20)} else { prof = fixateStringSize("Não definido", 20)};
                
                string += `${user} ${role} ${prof}\n`;
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
            validRoles = [
                "", "",
                "", "",
                ""
            ]

            return role;
        }

        function validateProfession(profession){
            validProfessions = [
                "", "", 
                "", "",
                "", "",
                "", ""
            ]

            return profession;
        }
    },
};


// Comando Exmeplo:
// !d registrar <@!300481947866759170> tank ferreiro