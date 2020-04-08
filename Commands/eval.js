const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');
require('dotenv').config()

var evalCmd = new Utils.command({ name: 'eval', ownerOnly: true, hidden: true }, async (m, g) => {

    //if(m.author.id !== "323546738600181761" || m.author.id !== "205873263258107905") {m.channel.send('corno'); return;}

    var code = m.content.split(" ").slice(1).join(" "),
        start = new Date(),
        raw = false;

    if(code.startsWith("--")){
        code = code.substr(2)
        raw = true;
    }

    if(code == 'client.token') m.channel.send('ih ala cornao')

    function clean(text) {
        if (typeof(text) === "string")
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return text;
        }

    try {
        if(/^`{1,3}\w+/g.test(code))
            code = code.replace(/^`{1,3}\w+/g, '')
        else
            code = code.replace(/^`{1,3}/g, '')
        code = code.replace(/`{1,3}$/g, '')
        
        var evaled = await eval(code);

        if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);

        if (clean(evaled).length > 1000){
            m.send(new Discord.MessageEmbed()
                .setColor("#E50914")
                .setTitle("Resultado muito grande, veja o console"))
            console.log(clean(evaled))
        } else {
            if(raw){
                m.send(clean(evaled)); return
            }
            m.send(new Discord.MessageEmbed()
                .setColor("#06E162")
                .addField("Resultado", `\`\`\`js\n${clean(evaled)}\`\`\``)
                .addField("Tempo", `\`\`\`${new Date() - start} ms\`\`\``))
        }

    } catch (e) {
        if(e.length > 1000){
            m.send(new Discord.MessageEmbed()
                .setColor("#E50914")
                .setTitle("Resultado muito grande, veja o console"))
                console.log(e)
        } else {
        console.log(e)    
        m.send(new Discord.MessageEmbed()
            .setColor("#E50914")
            .addField("Resultado", `\`\`\`xl\n${clean(evaled)}\`\`\``)
            .addField("Erro", `\`\`\`xl\n${e}\`\`\``)
            .addField("Tempo", `\`\`\`${new Date() - start} ms\`\`\``))}
    }

})

module.exports.init = evalCmd