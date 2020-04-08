require('dotenv').config()
const { MessageEmbed, MessageAttachment } = require('discord.js');
const Utils = require('../Utils/Utils');
const util = require('util')
const request = require('request-promise');
const config = require('../config.json');
const { createCanvas, loadImage } = require('canvas')
Utils.registerFonts()

const types = [['user', 'u'], ['track', 'musica', 'm', 't'], ['toptracks'], ['topartists', 'top']]

var cmd = new Utils.command({
    name: 'lastfm',
    desc: "Pesquise uma música ou veja as informações, top musicas ou top artistas de um usuário",
    cat: '🔧 Utilitário',
    aliases: ['lfm'],
    usage: `\`${config.prefix}lastfm <user | musica | toptracks | topartists> <args> [--7day | 1month | 3month | 6month | 12month | overall]\``,
    examples: `\`${config.prefix}lastfm user metye\`
    \`${config.prefix}lastfm musica bohemian rhapsody\`
    \`${config.prefix}lastfm toptracks metye\`
    \`${config.prefix}lastfm topartists metye --overall\``,
    needArgs: true,
    cooldown: 4,
    needArgs: true,
    needSubCommand: true,
    subcommands: types,
    hidden: true,
    single: true
}, async (m, g) => {

    let args = m.content.split(" ")
    console.log(args, !args[2])
    if(!args[2]){
        m.send(g.usage, null, true)
        return
    }

    console.log('ddd')
    
    if(types[0].includes(args[1]))
        m.send(await getUser(args[2], '7day', m), null, true)

})

async function getUser(user, period, m) {

    try{

         let userInfo   = await request(`http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${user}&api_key=${process.env.LASTFM_KEY}&format=json`)
         let lastTracks = await request(`http://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${user}&api_key=${process.env.LASTFM_KEY}&format=json&limit=10`)
         let topTracks  = await request(`http://ws.audioscrobbler.com/2.0/?method=user.getTopTracks&user=${user}&api_key=${process.env.LASTFM_KEY}&format=json&limit=10&period=${period}`)
        
         userInfo = JSON.parse(userInfo)
         lastTracks = JSON.parse(lastTracks)
        topTracks = JSON.parse(topTracks)

let listening = false

        if(lastTracks.recenttracks.track[0]["@attr"])
            listening = true



        function getTrack(i){
            return lastTracks.recenttracks.track[i].image[1]['#text'] ? lastTracks.recenttracks.track[i].image[1]['#text'] : './src/images/default_placeholder.png'
        }

        //console.log(util.inspect(userInfo, false, null, true), userInfo.user.image, userInfo.user.image.length, userInfo.user.image[userInfo.user.image.length-1]['#text'])
        //return `\`\`\`js\n${util.inspect(userInfo, false, null, false)}\`\`\``

        const images = Promise.all([
            loadImage(userInfo.user.image[0]['#text']),
            loadImage(userInfo.user.image[userInfo.user.image.length-1]['#text'])
        ])

        const mimages = Promise.all([
            loadImage(getTrack(0)),
            loadImage(getTrack(1)),
            loadImage(getTrack(2)),
            loadImage(getTrack(3)),
            loadImage(getTrack(4)),
            loadImage(getTrack(5)),
        ])

        

        

        let can = { x: 640, y: 380 }
        let canvas = createCanvas(can.x, can.y)
        let ctx = canvas.getContext('2d')


        var grd = ctx.createLinearGradient(can.x, 0, 0, can.y);
        grd.addColorStop(0, '#e02f2f');
        grd.addColorStop(1, '#7f0e00');

        ctx.fillStyle = grd;
        //ctx.fillRect(0, 0, can.x, can.y)

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
        ctx.fillRect(0, 0, can.x, can.y)

        ctx.font = '33px "RobotoCondensed"'
        ctx.fillStyle = 'white'
        ctx.fillText(userInfo.user.realname, 125, 50)
        ctx.font = '20px "RobotoCondensed-Light"'
        ctx.fillText('@' + userInfo.user.name, 125, 75)
        ctx.font = '20px "RobotoCondensed"'
        ctx.fillText(userInfo.user.playcount, 125, 102)
        let countW = ctx.measureText(userInfo.user.playcount).width
        ctx.font = '20px "RobotoCondensed-Light"'
        ctx.fillText('músicas ouvidas', 129 + countW, 102)

        if(listening){
            ctx.textAlign = "right";
            ctx.font = '20px "RobotoCondensed-Light"'
            ctx.fillText('OUVINDO AGORA', can.x-20, 30)
        }


        let [ lowRes, avatar ] = await images;

        let [...musicCovers] = await mimages;

        
        
        ctx.roundImage(avatar, 20, 20, 90, 90)

        if(listening){
            ctx.roundImage(musicCovers[0], can.x-20-70, 40, 70, 70)
        }

        ctx.globalCompositeOperation = 'destination-over'
        ctx.drawBlurredImage(lowRes, 16, 0, -((can.x - can.y) * 0.5), can.x, can.x)
        

        return new MessageAttachment(canvas.toBuffer(), 'lastfm.png')

    } catch(e) {
        if(e.response){
            if(e.response.statusCode == 404)
                return new MessageEmbed()
                    .setColor(config.colors.error)
                    .setDescription('Não foi possível encontrar este usuário')
        } else 
            Utils.ErrorLog(m, e)
    }
    
    
}

module.exports.init = cmd