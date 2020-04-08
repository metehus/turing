const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');

var categories = ["Geral", "Utilitário", "Aleatório"];
var categoriesEmojis = ["🎲", "🔧", "⁉"];

var evalCmd = new Utils.command({
    name: 'help',
    aliases: ['h', 'ajuda'],
    desc: "Ver lista de comandos e ajuda do bot.",
    cooldown: 2,
    needReactionsPermission: false
}, (m, g) => {
    const cmds = g.cmds

    var comandos = {}
    cmds.forEach(cmd => {
        if (!cmd.hidden) {
            if (cmd.cat in comandos)
                comandos[cmd.cat].push(cmd.name)
            else
                comandos[cmd.cat] = [cmd.name];
        }
    });

    
    if (m.content.split(" ")[1] == undefined)
        getCommands()
    else
        getCommandInfo()

    async function getCommands(edit = false) {
        var embed = new Discord.MessageEmbed()
            .setTitle("Comandos do Turing")
            //.setDescription("Escolha uma categoria para melhor gerenciamento dos comandos.")
            .setDescription(`\`${config.prefix}help <comando>\` para mais informações.`)
            .setColor(m.guild.members.find(u => u.id == m.client.user.id).displayHexColor);

        Object.keys(comandos).forEach(cmd => {
            embed.addField(`${cmd}`, "`" + comandos[cmd].join("`, `") + "`")
        })

        if(!edit)
            var msg = await m.channel.send(embed)
        else 
            var msg = await edit.edit(embed)

        // msg.awaitReactions((r, u) => categoriesEmojis.includes(r.emoji.name) && u.id == m.author.id, {max: 1, time: 600000}).then(c => { 
        
        //     if(c.size == 0) return

        //     getCatCommands(c.first().emoji.name, msg)
        // });

        // msg.react(categoriesEmojis[0])
        //     .then(() => msg.react(categoriesEmojis[1]))
        //     .then(() => msg.react(categoriesEmojis[2]))
        
    }

    function getCatCommands(cat, msg){
        msg.reactions.filter(e => categoriesEmojis.includes(e.emoji.name)).map(e => e.users.remove())
        console.log(msg.reactions.filter(e => categoriesEmojis.includes(e.emoji.name)).users)
        var commandList = [];
        cmds.forEach(cmd => {
            if(cmd.hidden == false && cmd.cat == `${cat} ${categories[categoriesEmojis.indexOf(cat)]}`){
                commandList.push(cmd.name);
            }
        })
        msg.edit(new Discord.MessageEmbed()
            .setTitle(`Comandos do Turing`)
            .addField(`${cat} ${categories[categoriesEmojis.indexOf(cat)]} (${commandList.length})`, `\`t.help <comando>\` para mais informações.`)
            .addField("Comandos", '`'+commandList.join('`, `')+'`')
            .setColor(m.guild.members.find(u => u.id == m.client.user.id).displayHexColor)).then(msg => {
                msg.react("↪")
                msg.awaitReactions((r, u) => r.emoji.name == "↪" && u.id == m.author.id, {max: 1, time: 600000}).then(c => { 
                    if(c.size == 0) return

                    msg.clearReactions()
        
                    getCommands(msg)
                })
            })
    }

    function getCommandInfo() {
        var comandoLista = []
        Object.keys(comandos).forEach(cmd => {
            comandos[cmd].forEach(c => {
                comandoLista.push(c)
            })
        });
        let cmd = m.content.split(" ")[1];
        if(cmd.startsWith(config.prefix))
            cmd = cmd.substring(2)
        if(comandoLista.includes(cmd) || comandoLista.includes(config.prefix+cmd)){
            
            var embed = new Discord.MessageEmbed()
                .setTitle(`Comandos do Turing`)
                .setFooter(`${m.author.username}#${m.author.discriminator}`, m.author.avatarURL)
                .setColor(m.guild.members.find(u => u.id == m.client.user.id).displayHexColor)
                
            cmds.forEach(c => {
                if(c.name == cmd){
                    var sub = "";
                    var ali = 'Sem aliases.'
                    if(c.aliases.length > 0){
                        console.log(ali)
                        ali = `\`${c.aliases.join("\`, \`")}\``;
                    }
                    embed.addField(`⚙ ${config.prefix}${cmd}`, c.desc)
                         .addField("Uso", c.usage)
                         .addField("Exemplos", c.examples)
                         .addField("Aliases", ali, true);
                    if(c.cooldown > 0) embed.addField('Cooldown', c.cooldown > 60 ? (c.cooldown / 60) + ' minutos' : c.cooldown + ' segundos', true)
                }
            })

            m.channel.send(embed)
            
        } else {
            m.channel.send(new Discord.MessageEmbed()
                .setTitle(`Comando \`${config.prefix}${cmd}\` não encontrado`)
                .setColor("#E50914")
                .setFooter(`${m.author.username}#${m.author.discriminator}`, m.author.avatarURL))
        }
    }

})

module.exports.init = evalCmd