require('dotenv').config()
const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const { createCanvas } = require('canvas')


var cmd = new Utils.command({
    name: 'degrade',
    aliases: ['gradient'],
    desc: "Ver um degradê de 2 cores", usage: '`t.degrade #fff #000`',
    needArgs: true,
    cat: '🔧 Utilitário',
    cooldown: 4
}, async (m) => {

    let colors = [m.content.split(" ")[1] || "#fff"];

    m.content.split(" ").slice(2).forEach(c => {
        if(c !== " ") colors.push(c)
    });

    let can = { x: 300, y: 150 }
    if(colors.length > 5) can.x = 600
    if(colors.length > 10) can.x = 900
    let canvas = createCanvas(can.x, can.y)
    let ctx = canvas.getContext('2d')

    var grd=ctx.createLinearGradient(0, 0, can.x, 0);
    colors.forEach((c, i) => {
        grd.addColorStop((i / (colors.length - 1)) / 1, '#'+(new Utils.Color(c).fullHex));
    })

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, can.x, 150);




    // console.log(colors)
    // console.log(--colors.length)
    let embed = new Discord.MessageEmbed()
        .setTitle(`Degradê de ${colors[0]} - ${colors[colors.length-1]}`)
        .setColor('#'+new Utils.Color(colors[0]).fullHex)
        .setImage('attachment://gradient.png');

    m.send({embed: embed, files: [new Discord.MessageAttachment(canvas.toBuffer(), "gradient.png")]}, null, true)

})

module.exports.init = cmd