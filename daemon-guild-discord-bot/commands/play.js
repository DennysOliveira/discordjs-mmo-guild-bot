const ytdl = require('ytdl-core-discord')
const ytSearch = require('yt-search');
const Discord = require("discord.js");
const { MessageAttachment } = require('discord.js');

const queue = new Map();

module.exports = {
    name: 'play',
    aliases: ['p','skip', 'stop'],
    cooldown: 0,
    description: 'Music bot.',    
    async run(message, args, cmd, client, Discord){
        console.log("Playing");
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) return message.channel.send('Você precisa estar em um canal para executar esse comando!');

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT')) return message.channel.send('Você não tem permissão para conectar nesse canal.');
        if(!permissions.has('SPEAK')) return message.channel.send('Você não tem permissão para falar nesse canal.');

        const serverQueue = queue.get(message.guild.id);

        if(cmd === 'play' || cmd === 'p') {

            if(!args.length) return message.channel.send('Você precisa especificar um segundo argumento.');
            let song = {};

            if(ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url };
            } else {
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }

                const video = await videoFinder(args.join(' '));
                if(video){
                    song = { title: video.title, url: video.url }
                } else {
                    message.channel.send('Não pude encontrar o vídeo.');
                }
            }

            if(!serverQueue) {
                const queueConstructor = {
                    voiceChannel: voiceChannel,
                    textChannel: message.channel,
                    connection: null,
                    timer: 0,
                    songs: [],
                }

                queue.set(message.guild.id, queueConstructor);
                queueConstructor.songs.push(song);

                try {
                    const connection = await voiceChannel.join();
                    queueConstructor.connection = connection;
                    videoPlayer(message.guild, queueConstructor.songs[0]);
                } catch (err) {
                    queue.delete(message.guild.id);
                    message.channel.send("Houve um erro ao conectar.");
                    throw err;
                }
            } else {
                serverQueue.songs.push(song);
                return message.channel.send(new Discord.MessageEmbed().setColor('#FF0000').setDescription(`**${song.title}** adicionado a fila de reprodução.\n${song.url}`));
                // return message.channel.send(`**${song.title}** adicionado a fila de reprodução.`);
            }
        }
        else if (cmd ==='skip') skipSong(message, serverQueue);
        else if (cmd ==='stop') stopSong(message, serverQueue);
    }
}

const videoPlayer = async (guild, song) => {
    const songQueue = queue.get(guild.id);

    if(!song) {        
        queue.delete(guild.id);

        // songQueue.timer = setTimeout(() => {
        //     songQueue.voiceChannel.leave();
        // }, 60 * 1000);

        return;
    }

    const stream = await ytdl(song.url, { filter: 'audioonly', highWaterMark: 1 << 25  });
    songQueue.connection.play(stream, { seek: 0, volume: 0.5, type: 'opus' })
    .on('finish', () => {
        songQueue.songs.shift();
        clearTimeout(songQueue.timer);
        videoPlayer(guild, songQueue.songs[0]);
    });
    await songQueue.textChannel.send(new Discord.MessageEmbed().setColor('#FF0000').setDescription(`Tocando **${song.title}**.\n${song.url}`));
}

const skipSong = (message, serverQueue) => {
    if (!message.member.voice.channel) return message.channel.send('Você precisa estar em um canal para executar esse comando.');
    
    if(!serverQueue) return message.channel.send(`Não há sons na fila de reprodução.`);
    

    message.channel.send(`Pulando para a próxima música na lista de reprodução.`);
    serverQueue.connection.dispatcher.end();

    
}

const stopSong = (message, serverQueue) => {
    if (!message.member.voice.channel) return message.channel.send('Você precisa estar em um canal para executar esse comando.');
    
    if(!serverQueue) return message.channel.send(`Não há sons na fila de reprodução.`);
    

    message.channel.send(`Removendo todas as músicas.`);
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}