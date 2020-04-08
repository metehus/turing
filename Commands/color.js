require('dotenv').config()
const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const rp = require('request-promise');
const config = require('../config.json');
const chroma = require('chroma-js')


var cmd = new Utils.command({
    name: 'cor',
    aliases: ['color'],
    cat: '🔧 Utilitário',
    desc: "Ver HEX, RGB, numeral e amostra de uma cor",
    usage: `\`${config.prefix}cor <cor>\``,
    examples: `\`${config.prefix}cor #fff\`\n\`${config.prefix}cor teal\`\n\`${config.prefix}cor 255, 0, 0\``,
    needArgs: true
}, async (m) => {

    var testRgb = (c) => {
        if(c.split(', ').length == 3) return c.split(', ')
        else if(c.split(',').length == 3) return c.split(',')
        else if(c.split('; ').length == 3) return c.split('; ')
        else if(c.split(';').length == 3) return c.split(';')
        else return false;
    }

    const args = m.content.split(" ").slice(1)
    var c;

    if(!testRgb(args.join(" ")))
        c = args[0]
    else
        c = testRgb(args.join(" "))

    try{
        color = chroma(c)
    } catch(e) {
        console.log('sem cor')
        m.send(new Discord.MessageEmbed()
            .setDescription('Cor não encontrada.')
            .setColor(config.colors.error))
        return;
    }

    

    let info =JSON.parse(await rp(`http://www.thecolorapi.com/id?format=json&hex=${color.hex().split('#')[1]}`))
    
    m.send(new Discord.MessageEmbed()
        .setColor(color.hex())
        .setAuthor(info.name.value, `http://www.colourlovers.com/img/${color.hex().split('#')[1]}/5/5/Sminted.png`)
        .addField("HEX", color.hex(), true)
        .addField("RGB", color.rgb().join(", "), true)
        ///.addField("HSL", color.hsl().join(', '), true)
        .addField("DEC", color.num(), true)
        .setThumbnail(`http://www.colourlovers.com/img/${color.hex().split('#')[1]}/50/50/Sminted.png`))

})

module.exports.init = cmd