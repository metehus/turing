const { Song } = require("../structures/music")
const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');

var ping = new Utils.command({
    name: 'nowplaying',
    desc: "Ver o que está tocando agora", hidden: true, ownerOnly: true, aliases: ['np'], usage: '`t.np`'
}, (m, g) => {

    console.log('sss')
    m.guild.player.nowPlaying(m)

})

module.exports.init = ping