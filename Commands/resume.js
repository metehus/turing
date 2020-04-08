const { Song } = require("../structures/music")
const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');

var ping = new Utils.command({ name: 'resume', hidden: true, ownerOnly: true }, (m, g) => {

    m.guild.player.resume(m)

})

module.exports.init = ping