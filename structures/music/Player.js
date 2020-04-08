const Discord = require('discord.js');
const Song = require('./Song.js')

module.exports = class Player{
    /**
     * @param {Discord.Guild} guild 
     */
    constructor(guild, socket){
        this.guild = guild
        this.queue = [];
        this.socket = socket
    }
    
    /**
     * @param {Discord.GuildMember} member the user who added the song
     * @param {Object} options The song options
     * @param {String} options.name The song name
     * @param {String} options.resource The song stream resource
     * @param {String} options.type The song type
     */
    addSong(member, options){
        if(!member.voice.channel) return 'No user channel';
        if(!member.guild.me.voice.channel){
            if(!member.voice.channel.joinable) return 'No permissions';
            this.queue.push(new Song(options, member, this.socket))
            this.join(member.voice.channel)
            this.queue[0].stream(member.voice.channel)
        } else {
            if(this.queue.length == 30) return 'Max songs'
            this.queue.push(new Song(options, member, this.socket))
            if(this.queue.length == 1) this.queue[0].stream(this.guild.me.voice.channel, false)
           
        }

    }

    nextSong(){
        this.queue.shift();
        if(this.queue.length > 0) this.queue[0].stream(this.guild.me.voice.channel, false)
        else this.leave()
    }

    nowPlaying(m){
        if(this.queue.length == 0) return 'No songs';
        let channel = this.guild.me.voice.channel
        let stream = channel.connection.dispatcher.streamTime
        this.playingMessage = m;
      this.nowPlayingHandle(stream)
    }

    nowPlayingHandle(time){
        this.queue[0].imageCard(this.playingMessage, time, this)
    }

    pause(m){
        let channel = this.guild.me.voice.channel
        let stream = channel.connection.dispatcher.pause()
        m.channel.send(new Discord.MessageEmbed()
            .setDescription(`**${this.queue[0].name}** pausado`)
            .setColor(this.queue[0].color))
    }

    resume(m){
        let channel = this.guild.me.voice.channel
        let stream = channel.connection.dispatcher.resume()
        m.channel.send(new Discord.MessageEmbed()
            .setDescription(`Continuando a tocar **${this.queue[0].name}**`)
            .setColor(this.queue[0].color))
    }


    join(channel){
        channel.join()
    }

    leave(){
        this.guild.me.voice.channel.leave
    }

}