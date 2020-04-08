const { MessageEmbed } = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');
const languages = require('../src/database/languages.json');
const request = require('request-promise').defaults({ encoding: 'utf8' })

require('dotenv').config()

var cmd = new Utils.command({
    name: 'traduzir',
    desc: "Traduzir uma frase",
    aliases: ['translate'],
    usage: `\`${config.prefix}traduzir <linguagem> <destino> <frase>\``,
    examples: `\`${config.prefix}traduzir pt en quem ler é corno\`
    \`${config.prefix}traduzir auto pt wie es nur ist, wenn er entdeckt\``,
    needArgs: true
}, async (m) => {
       
    const args = [ ...m.content.split(" ").slice(1) ]

    if(args.length == 1){
        m.send(sendError('Por favor insira uma linguagem para traduzir', m))
        return
    }
    if(args.length == 2){
        m.send(sendError('Por favor insira um texto válido', m))
        return
    }
    let from = args[0]
    let to = args[1]

    let embed = new MessageEmbed()
        .setAuthor('Tradução', 'https://i.imgur.com/snDlsDV.png')
        .setColor('#4B8BF5')

    if(!languages.find(l => l[1] == args[0]))
        from = 'auto'

    if(!languages.find(l => l[1] == args[1])){
        embed.setDescription(`Não foi possivel encontrar a linguagem \`${args[1]}\`, traduzindo para Português.`)
        to = 'pt'
    }

    const trLink = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${from}&tl=${to}&q=${encodeURI(args.slice(2).join(" "))}`
    const translated = JSON.parse(await request(trLink))

    console.log(translated)

    embed.addField(languages.find(l => l[1] == to)[0], translated[0][0][0])

    if(from == 'auto')
        embed.addField(`Traduzido de`, `${languages.find(l => l[1] == translated[2])[0]} (detectado automaticamente)`)

    m.send(embed)

})

const sendError = (err, m) => {
    return new MessageEmbed()
        .setColor(config.colors.error)
        .setFooter(m.author.tag, m.author.displayAvatarURL({ format: 'png', size: 16 }))
        .setAuthor(err, m.client.emojis.get(config.emojis.error).url)
}

module.exports.init = cmd