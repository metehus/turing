const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');



var invite = new Utils.command({ name: 'invite',
    desc: "Receber o link para adicionar o bot em seu servidor", usage: '`t.invite`'}, async (m) => {
    
        m.channel.send(new Discord.MessageEmbed()
            .setColor("#7289DA")
            .setTitle("Links do Turing")
            .addField("Adicionar no servidor", "https://discordapp.com/oauth2/authorize?client_id=505506655178326016&scope=bot&permissions=8")
            //.addField("Servidor oficial do bot", "https://discord.gg/")
            .setFooter(`Turing`, m.client.user.avatarURL))

})

module.exports.init = invite