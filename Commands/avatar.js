require('dotenv').config()
const { MessageEmbed } = require('discord.js');
const Utils = require('../Utils/Utils');
const getColors = require('get-image-colors')

var cmd = new Utils.command({
    name: 'avatar',
    desc: "Ver avatar de alguem",
    aliases: ['a']
}, async (m) => {

    let user = m.getUser()

    let url = user.displayAvatarURL({ format: 'png', size: 2048 })

    getColors(user.displayAvatarURL({ format: 'png', size: 128 })).then(colors => {
        console.log(colors.map(a => a.hex()))
        
        m.send(new MessageEmbed()
            .setColor(colors[0].hex())
            .setImage(url))
    })

})

module.exports.init = cmd