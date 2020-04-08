const { Song } = require("../structures/music")
const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');

var ping = new Utils.command({ name: 'pause', hidden: true, ownerOnly: true }, (m, g) => {

    m.guild.player.pause(m)

})

module.exports.init = ping