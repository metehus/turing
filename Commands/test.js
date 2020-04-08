const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');


var cmd = new Utils.command({ name: 'test', hidden: true, ownerOnly: true}, async (m) => {
    
    //socket.emit('stream', {resource: {type: "youtube", res: m.content.split(" ").slice(1).join(" ")}, channelId: "278637285216616449", guildId: "278636362163552257"});

    m.member.voice.channel.join().then(() => {
        m.member.voice.channel.leave()
    })

    m.guild.player.queue = []

})

module.exports.init = cmd