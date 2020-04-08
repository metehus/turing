require('dotenv').config()
const Discord = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');
const getColors = require('get-image-colors');
const requestImageSize = require('request-image-size');
const { createCanvas, loadImage } = require('canvas')
Utils.registerFonts()

var cmd = new Utils.command({
    name: 'palette',
    aliases: ['pallete', 'palete', 'pallette', 'paleta'],
    desc: "Ver a paleta de uma imagem",
    usage: `\`${config.prefix}palete [@user | {link} | {attachment}]\``,
    single: true,
    cooldown: 4
}, async (m) => {

    let image = await m.getAttachment()

    let colors = await getColors(image)

    let sizes = await requestImageSize(image)

    console.log(sizes)


    const can = { x: sizes.width < 700 ? sizes.width : 700 }

    let colorheight = 0

    if(can.x > 200)
        colorheight = can.x > 300 ? can.x / colors.length : ( can.x / colors.length ) * 1.8
    
    console.log(colorheight)

    can.y = (sizes.width < 700 ? sizes.height : (sizes.height / (sizes.width / can.x))) + colorheight 

    console.log(can)
    const canvas = createCanvas(can.x, can.y)
    const ctx = canvas.getContext('2d')

    console.log(image)

    let cImage = await loadImage(image)

    ctx.drawImage(cImage, 0, 0, can.x, can.y - colorheight)
    let blackGrd = ctx.createLinearGradient(0, can.y - colorheight, 0, can.y);
    blackGrd.addColorStop(0, "rgba(0, 0, 0, 0)");
    blackGrd.addColorStop(0.65, "rgba(0, 0, 0, 0.2)");
    blackGrd.addColorStop(1, "rgba(0, 0, 0, 0.9)");
    if(can.x > 200) 
        colors.forEach((color, i) => {
            ctx.fillStyle = color.hex();
            ctx.fillRect(i * (can.x / colors.length), can.y - colorheight, can.x / colors.length, can.y)
            
            ctx.fillStyle = blackGrd
            ctx.fillRect(i * (can.x / colors.length), can.y - colorheight, can.x / colors.length, can.y)
            //ctx.fillRect(0, 0, can.x, can.y)
            
            let fontH =(can.x / colors.length) * 0.23;
            ctx.textAlign = "center";
            ctx.font = fontH + 'px "RobotoCondensed"'
            ctx.fillStyle = 'white'
            ctx.fillText(color.hex().toUpperCase(), (i * (can.x / colors.length)) + ((can.x / colors.length) / 2), can.y - 3)
            console.log((i * (can.x / colors.length)) + ((can.x / colors.length) / 2), i * (can.x / colors.length),  can.x / colors.length)
        });

    

    m.send(new Discord.MessageEmbed()
        .setColor(colors[0].hex())
        .addField('Cores', colors.map(a => a.hex().toUpperCase()).join(", "))
        .setTitle('Paleta de cores')
        .setImage('attachment://palette.png')
        .attachFiles(new Discord.MessageAttachment(canvas.toBuffer(), "palette.png")), null, true)
    

})

module.exports.init = cmd