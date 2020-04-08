const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');



var ping = new Utils.command({ name: 'ping',
    desc: "Ver o ping do bot", usage: '`t.ping`'}, async (m) => {
    
        var msg = await m.channel.send(new Discord.MessageEmbed()
            .setColor("#3498db")
            .setTitle("Carregando...")
            .setFooter(`${m.author.username}#${m.author.discriminator}`, m.author.avatarURL))

        msg.edit(new Discord.MessageEmbed()
            .setTitle("Pong!")
            .addField("Bot", `**${msg.createdTimestamp - m.createdTimestamp}**ms`, true)
            .addField("API", `**${m.client.ws.ping}**ms`, true)
            .setColor(m.guild.members.find(u => u.id == m.client.user.id).displayHexColor))

})

module.exports.init = ping