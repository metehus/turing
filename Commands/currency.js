const { MessageEmbed } = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');
const request = require('request-promise');
const db = require('../src/database/currencies.json');

const API_URL = `https://free.currencyconverterapi.com/api/v6/convert?q=`

var currency = new Utils.command({
    name: 'currency',
    desc: "Converter valores de moedas.",
    usage: `\`${config.prefix}currency <moeda> <moeda destino> [valor]\``,
    examples: `\`${config.prefix}currency BRL\`
    \`${config.prefix}currency BRL JPY\`
    \`${config.prefix}currency EUR USD 50\``,
    cat: '🔧 Utilitário',
    needArgs: true
}, async (m, g) => {
        
    const args = [...m.content.split(" ").slice(1)]
    let conversion = { }

    if(args.length == 1)
        conversion = { from: args[0], to: args[0] == 'USD' ? 'EUR' : 'USD', value: 1 }
    if(args.length == 2)
        conversion = { from: args[0], to: args[1], value: 1 }
    if(args.length == 3)
        conversion = { from: args[0], to: args[1], value: args[2] }

    if(!verifyCurrency(conversion.from)){
        m.send(errorEmbed(conversion.from, m))
        return;
    }

    if(!verifyCurrency(conversion.to)){
        m.send(errorEmbed(conversion.to, m))
        return;
    }

    if(conversion.from == conversion.to){
        m.send(new MessageEmbed()
            .setColor(config.colors.error)
            .setFooter(m.author.tag, m.author.displayAvatarURL({ format: 'png', size: 16 }))
            .setAuthor(`Por favor escolha 2 moedas diferentes`, m.client.emojis.get(config.emojis.error).url))
        return
    }

    let converted = JSON.parse(await request(`${API_URL}${conversion.from}_${conversion.to},${conversion.to}_${conversion.from}`))

    console.log(require('util').inspect(converted, true, 20, true))

    if(!converted.results){
        m.send(new MessageEmbed()
        .setColor(config.colors.error)
        .setFooter(m.author.tag, m.author.displayAvatarURL({ format: 'png', size: 16 }))
        .setDescription('O sistema de conversão pode estar sobrecarregado, tente novamente em 1 hora')
        .setAuthor(`Ocorreu um erro no sistema de conversão.`, m.client.emojis.get(config.emojis.error).url))
        return
    }

    let embed = new MessageEmbed()
        .setAuthor('Conversão de dinheiro', 'https://twemoji.maxcdn.com/2/72x72/1f4b0.png')
        .setColor('#57C479')

    let ftVal = `${db.currencies[conversion.from].currencySymbol} ${converted.results[`${conversion.from}_${conversion.to}`].val * conversion.value} ${db.currencies[conversion.from].currencyName}`
    let tfVal = `${db.currencies[conversion.to].currencySymbol} ${converted.results[`${conversion.to}_${conversion.from}`].val * conversion.value} ${db.currencies[conversion.to].currencyName}`

    embed.addField(`${conversion.value} ${conversion.from} -> ${conversion.to}`, ftVal)
    embed.addField(`${conversion.value} ${conversion.to} -> ${conversion.from}`, tfVal)

    m.send(embed)

})

const errorEmbed = (currency, m) => {
    return new MessageEmbed()
        .setColor(config.colors.error)
        .setFooter(m.author.tag, m.author.displayAvatarURL({ format: 'png', size: 16 }))
        .setAuthor(`Moeda inválida: ${currency}`, m.client.emojis.get(config.emojis.error).url)
}

const getCurrencyInfo = (currency) => {
    let a = Object.keys(db.currencies).find(d => db.countries[d].currencyId == currency)
    return db.countries[a]
}

const verifyCurrency = (currency) => {
    if(Object.keys(db.currencies).find(c => c == currency))
        return true
    else 
        return false
}

module.exports.init = currency