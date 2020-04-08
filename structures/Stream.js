const Discord = require('discord.js');
const ytdl = require('ytdl-core');

module.exports = class Stream{
    constructor(guild, channel, resource, player){
        this.guild = guild;
        this.channel = channel;
        this.type = resource.type;
        this.resource = resource.res;
    }

    stream() {
        let stream;
        if(this.type == 'youtube') stream = ytdl(this.resource, { filter: 'audioonly' });

        const dispatcher = this.channel.connection.play(stream, { seek: 0, volume: 1 });
        dispatcher.on("end", end => {
            console.log(end)
            this.palyer.nextSong()
        });
    }
}