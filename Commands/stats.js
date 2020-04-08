const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');
const moment = require('moment');
moment.locale('pt_BR');

require('dotenv').config()

var evalCmd = new Utils.command({ name: 'stats',
    desc: "Ver informações e status do bot",
    aliases: ['status']}, (m, g) => {
        let cmds = g.cmds
        var commandLength = 0

        cmds.forEach(c => {
            if(!c.hidden) commandLength++
        });
    
        m.channel.send(new Discord.MessageEmbed()
            .setAuthor("Informações do Turing", m.client.user.avatarURL)
            .addField("🕐 Uptime", "Estou ligado a "+moment.duration(m.client.uptime).humanize() + ".")
            .addField("💡 RAM", `\`\`\`${process.memoryUsage().rss /1024/1000} MB\`\`\``)
            .addField("📄 Comandos", `Total de **${commandLength}** comandos.`, true)
            .addField("📡 Servidores", `${m.client.guilds.size}`, true)
            .addField("🙇🏽 Usuários", `${m.client.users.filter(u => u.bot == false).size}`, true)
            .setColor(m.guild.members.find(u => u.id == m.client.user.id).displayHexColor))

})

module.exports.init = evalCmd