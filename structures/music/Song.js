const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const config = require('../../config.json');
const { Stream } = require('../../structures/Stream.js');
const moment = require('moment');
/*const { createCanvas, loadImage, registerFont } = require('canvas')
registerFont("./src/fonts/RobotoCondensed-Bold.ttf", { family: 'RobotoCondensed', weight: 'bold' })
registerFont("./src/fonts/RobotoCondensed-BoldItalic.ttf", { family: 'RobotoCondensed', weight: 'bold', style: 'italic' })
registerFont("./src/fonts/RobotoCondensed-Italic.ttf", { family: 'RobotoCondensed', style: 'italic' })
registerFont("./src/fonts/RobotoCondensed-Light.ttf", { family: 'RobotoCondensed-Light' })
registerFont("./src/fonts/RobotoCondensed-LightItalic.ttf", { family: 'RobotoCondensed-Light', style: 'italic' })
registerFont("./src/fonts/RobotoCondensed-Regular.ttf", { family: 'RobotoCondensed' })
*/
module.exports = class Song {
    /**
     * 
     * @param {Object} options The Song options
     * @param {Discord.GuildMember} member The member who added the song
     */
    constructor(options, member, socket) {
        this.socket = socket;
        this.addedBy = member
        this.name = options.name || 'Sem nome'
        this.artist = options.artist || ''
        this.duration = options.duration;
        this.image = options.image;
        this.resource = options.resource;
        this.type = options.type || "default";
        if(!this.image){
           this.image = `./src/images/${this.type}_placeholder.png`;
        }
    }

    async imageCard(m, time, player) {
        try{
            let barColor = this.color;

            let can = { x: 750, y: 340 }
            let canvas = createCanvas(can.x, can.y)
            let ctx = canvas.getContext('2d')

            const images = Promise.all([
                loadImage(this.image), 
                loadImage(this.addedBy.user.avatarURL({format: 'png', size: 64})), 
                loadImage(`./src/images/${this.type}_white.png`)]);
            
            // let image = await loadImage(this.image)
            // let icon = await loadImage(`./src/images/${this.type}_white.png`)
            // let userAvatar = await loadImage(this.addedBy.user.avatarURL({format: 'png', size: 64}))

            // ctx.drawBlurredImage(image, 16, 0, (can.y / 2) * -1, can.x, can.x)

            let grd = ctx.createLinearGradient(0, 0, can.x, 0);
            grd.addColorStop(0, "rgba(0, 0, 0, 0.7)");
            grd.addColorStop(0.6, "rgba(0, 0, 0, 0.5)");
            grd.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, can.x, can.y);

            // ctx.drawImage(image, 40, (12 / 100) * can.y, (76 / 100) * can.y, (76 / 100) * can.y)


            ctx.globalAlpha = 0.7
            // ctx.drawImage(icon, (40 + (76 / 100) * can.y) + 20, ((12 / 100) * can.y) + 6, 20, 20)

            ctx.globalAlpha = 1
            ctx.fillStyle = "white";
            ctx.font = '25px "RobotoCondensed-Light"'
            ctx.fillText('Tocando agora', (40 + (76 / 100) * can.y) + 45, ((12 / 100) * can.y) + 25)

            ctx.font = '35px "RobotoCondensed"'
            ctx.fillText(this.name, (40 + (76 / 100) * can.y) + 20, ((12 / 100) * can.y) + 35 + 27)

            ctx.font = '25px "RobotoCondensed-Light"'
            ctx.fillText(this.artist, (40 + (76 / 100) * can.y) + 20, ((12 / 100) * can.y) + 25 + 67)

            let addedByIndex = 130
            ctx.font = '25px "RobotoCondensed"'
            //ctx.fillText('Adicionado por', (40 + (76 / 100) * can.y) + 20, ((12 / 100) * can.y) + 25 + addedByIndex)

            ctx.font = '30px "RobotoCondensed-Light"'
            // ctx.roundImage(userAvatar, (40 + (76 / 100) * can.y) + 20, ((12 / 100) * can.y) + 40 + addedByIndex, 35, 35)

            ctx.fillText(this.addedBy.user.tag, (40 + (76 / 100) * can.y) + 65, ((12 / 100) * can.y) + 65 + addedByIndex)


            let timePercent = (100 * time) / this.duration
            let barWF = can.x - ((40 + (76 / 100) * can.y) + 20)-((10 / 100) * can.y)
            let barH = 8
            let barW = (timePercent / 100) * barWF

            ctx.fillStyle = barColor
            ctx.fillRect((40 + (76 / 100) * can.y) + 20, can.y - ((12 / 100) * can.y) - barH, barWF, barH);

            ctx.fillStyle = 'white'
            ctx.globalAlpha = 0.6
            ctx.fillRect((40 + (76 / 100) * can.y) + 20, can.y - ((12 / 100) * can.y) - barH, barWF, barH);

            ctx.fillStyle = barColor
            ctx.globalAlpha = 1
            ctx.fillRect((40 + (76 / 100) * can.y) + 20, can.y - ((12 / 100) * can.y) - barH, barW, barH);

            let elapsed = moment(time).format('mm:ss')
            let duration = moment(this.duration).format('mm:ss')

            ctx.font = '30px "RobotoCondensed"'
            ctx.fillStyle = 'white'
            ctx.fillText(elapsed, (40 + (76 / 100) * can.y) + 20, can.y - ((12 / 100) * can.y) - barH - 10)
            ctx.textAlign="right"; 
            ctx.fillText(duration, (40 + (76 / 100) * can.y) + 20 + barWF, can.y - ((12 / 100) * can.y) - barH - 10)

            const [ image, userAvatar, icon ] = await images;

            ctx.drawImage(image, 40, (12 / 100) * can.y, (76 / 100) * can.y, (76 / 100) * can.y)
            ctx.drawImage(icon, (40 + (76 / 100) * can.y) + 20, ((12 / 100) * can.y) + 6, 20, 20)
            ctx.roundImage(userAvatar, (40 + (76 / 100) * can.y) + 20, ((12 / 100) * can.y) + 40 + addedByIndex, 35, 35)

            ctx.globalCompositeOperation = 'destination-over'
            ctx.drawBlurredImage(image, 16, 0, -((can.x - can.y) * 0.5), can.x, can.x)

            let embed = new Discord.MessageEmbed()
                .setTitle(`Tocando agora (1/${player.queue.length})`)
                .setDescription(`**${this.name}** de **${this.artist}**`)
                .addField('Adicionado por', this.addedBy.toString())
                .setImage('attachment://nowplaying.png')
                .setColor(barColor)

            if(player.queue.length > 1) embed.addField('Próximo na fila', player.queue[1].name)
            m.channel.send({embed: embed, files: [new Discord.MessageAttachment(canvas.toBuffer(), "nowplaying.png")]})
        } catch(e){
            console.error(e)
        }
    }

    get color(){
       return config.colors[this.type];
    }

    async stream(channel, join) {
      
      let data = {
            resource: {
                type: this.type,
                res: this.resource
            },
            channelId: channel.id,
            guildId: this.addedBy.guild.id,
            join: join
        }
      
      let guild = this.addedBy.guild
        await channel.join()
        //guild.stream = new Stream(guild, guild.channels.get(data.channelId), data.resource, this.addedBy.guild.player)
        let stream;
        if(this.type == 'youtube') stream = ytdl(this.resource, { filter: 'audioonly' });

        const dispatcher = channel.connection.play(stream, { seek: 0, volume: 1 });
        dispatcher.on("end", end => {
            guild.player.nextSong()
        });
    }
}



