require('dotenv').config()
const { Structures, MessageAttachment } = require('discord.js');

module.exports = Structures.get('Message').prototype.send = async function (content, options, one) {
    if (this.response) {
        if (content instanceof MessageAttachment || options instanceof MessageAttachment || one)
            return false;
        else 
            return await this.response.edit(content, options)
    }

    let msg = await this.channel.send(content, options)
    this.response = msg
    return msg;
}