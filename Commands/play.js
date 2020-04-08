require('dotenv').config()
const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');
const YouTube = require('simple-youtube-api');
const moment = require('moment');

var youtube = new YouTube(process.env.YOUTUBE_API);

const VIDEO_REGEX = /(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)/;



var cmd = new Utils.command({ name: 'play', hidden: true, ownerOnly: true }, async (m) => {

    let arg = m.content.split(" ").slice(1)[0]

    let id = VIDEO_REGEX.exec(arg)

    youtube.getVideoByID(id)
        .then(video => {
            let duration = moment.duration(video.raw.contentDetails.duration).asMilliseconds()
            console.log(duration)
            m.guild.player.addSong(m.member, {
                resource: arg,
                type: "youtube",
                name: video.title,
                artist: video.channel.title,
                image: video.thumbnails.high.url,
                duration: duration
            })
        })
        .catch(console.log);

})

module.exports.init = cmd