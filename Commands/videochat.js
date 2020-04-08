const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');



var invite = new Utils.command({ name: 'videochat', aliases: ['vc'],
    desc: "Receber o link para adicionar o bot em seu servidor", usage: '`t.invite`'}, async (m) => {
    
        m.channel.send(`<https://canary.discordapp.com/channels/${m.guild.id}/${m.member.voice.channelID}>`)

})

module.exports.init = invite