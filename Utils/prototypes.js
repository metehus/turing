const Discord = require("discord.js");
const { Player } = require("../structures/music");
const { createCanvas, Canvas, Context2d } = require('canvas')

module.exports = () => {

    String.prototype.reverse = function(){
        return this.split('').reverse().join('')
    }

    String.prototype.removeAcento = function(){       
        let text = this.toLowerCase();                                                         
        text = text.replace(new RegExp('[ÁÀÂÃ]','gi'), 'a');
        text = text.replace(new RegExp('[ÉÈÊ]','gi'), 'e');
        text = text.replace(new RegExp('[ÍÌÎ]','gi'), 'i');
        text = text.replace(new RegExp('[ÓÒÔÕ]','gi'), 'o');
        text = text.replace(new RegExp('[ÚÙÛ]','gi'), 'u');
        text = text.replace(new RegExp('[Ç]','gi'), 'c');
        return text;                 
    }

    Discord.Message.prototype.getUser = function (query, itself = true) {
        query = query ? query.toLowerCase() : this.content.split(" ")[1];
        if (this.mentions.users.size !== 0) return this.mentions.users.first();
        if (this.guild.members.get(query)) return this.guild.members.get(query).user
        if (this.guild.members.find(m => m.user.username.toLowerCase() == query)) return this.guild.members.find(m => m.user.username.toLowerCase() == query).user
        if (this.guild.members.find(m => m.displayName.toLowerCase() == query)) return this.guild.members.find(m => m.nickname.toLowerCase() == query).user
        if (this.guild.members.find(m => m.user.id == query)) return this.guild.members.find(m => m.user.id == query).user
        if (this.guild.members.find(m => m.user.username.toLowerCase().includes(query))) return this.guild.members.find(m => m.user.username.toLowerCase().includes(query)).user
        if (this.guild.members.find(m => m.user.tag.toLowerCase().includes(query))) return this.guild.members.find(m => m.user.tag.toLowerCase().includes(query)).user
        if (itself) return this.author
    }

    Discord.Message.prototype.getAttachment = async function (msg = this, itselfAvatar = true) {
        let regex = /(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]*\.(?:jpg|gif|png))(?:\?([^#]*))?(?:#(.*))?/
        let urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/

        if (msg.attachments.size > 0 && regex.test(msg.attachments.first().url) && msg.attachments.first().size > 128)
            return msg.attachments.first().url

        else if (msg.embeds.length > 0 && msg.embeds[0].thumbnail && regex.test(msg.embeds[0].thumbnail.url))
            return msg.embeds[0].thumbnail.url

        else if (msg.getUser(null, false))
            return msg.getUser(null, false)
        

        else if (regex.test(msg.content) && urlRegex.test(msg.content))
            return msg.content.match(urlRegex)[0]

        else if (msg.mentions.users.size > 0)
            return msg.mentions.users.first().displayAvatarURL({ format: 'png', size: 2048 })

        else {
            let messages = await msg.channel.messages.fetch({
                limit: 5,
                before: msg.id
            }).then(c => c.array())

            for (let message of messages)
                if (message.author.id !== msg.client.user.id &&
                    (message.attachments.size > 0 && regex.test(message.attachments.first().url) && message.attachments.first().size > 128) ||
                    (message.embeds.length > 0 &&
                        message.embeds[0].thumbnail &&
                        regex.test(message.embeds[0].thumbnail.url)))
                    return msg.getAttachment(message, itselfAvatar)

            if (itselfAvatar)
                return msg.author.displayAvatarURL({ format: 'png', size: 2048 })

            return false
        }


    }

    Array.prototype.remove = function() {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    Context2d.prototype.printTextBox = function (text, x, y, lH, fit) {
        fit = fit || 0
        var ctx = this


        if (fit <= 0) {
            ctx.fillText(text, x, y)
            return
        }

        let words = text.split(' ')
        let currentLine = 0
        let idx = 1

        while (words.length > 0 && idx <= words.length) {
            let str = words.slice(0, idx).join(' ')
            let w = ctx.measureText(str).width
            if (w > fit) {
                if (idx === 1) {
                    idx = 2
                }
                let { width } = ctx.measureText(words.slice(0, idx - 1).join(' '))

                ctx.fillText(words.slice(0, idx - 1).join(' '), x + (fit - width) / 2, y + (lH * currentLine))
                currentLine++
                words = words.splice(idx - 1)
                idx = 1
            }
            else idx++
        }
        if (idx > 0) {
            let { width } = ctx.measureText(words.join(' '))
            ctx.fillText(words.join(' '), x + (fit - width) / 2, y + (lH * currentLine))
        }
    }

    Canvas.prototype.blur = function (blur) {
        const ctx = this.getContext('2d')

        const delta = 5
        const alphaLeft = 1 / (2 * Math.PI * delta * delta)
        const step = blur < 3 ? 1 : 2
        let sum = 0
        for (let y = -blur; y <= blur; y += step) {
            for (let x = -blur; x <= blur; x += step) {
                let weight = alphaLeft * Math.exp(-(x * x + y * y) / (2 * delta * delta))
                sum += weight
            }
        }
        for (let y = -blur; y <= blur; y += step) {
            for (let x = -blur; x <= blur; x += step) {
                ctx.globalAlpha = alphaLeft * Math.exp(-(x * x + y * y) / (2 * delta * delta)) / sum * blur
                ctx.drawImage(this, x, y)
            }
        }
        ctx.globalAlpha = 1
    }

    Context2d.prototype.drawBlurredImage = function (image, blur, imageX, imageY, w = image.width, h = image.height) {
        const canvas = createCanvas(w, h)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, w, h)
        canvas.blur(blur)
        this.drawImage(canvas, imageX, imageY, w, h)
    }

    Context2d.prototype.roundImageCanvas = function (img, w = img.width, h = img.height, r = w * 0.5) {
        const canvas = createCanvas(w, h)
        const ctx = canvas.getContext('2d')

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        ctx.globalCompositeOperation = 'source-over'
        ctx.drawImage(img, 0, 0, w, h)

        ctx.fillStyle = '#fff'
        ctx.globalCompositeOperation = 'destination-in'
        ctx.beginPath()
        ctx.arc(w * 0.5, h * 0.5, r, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.fill()

        return canvas
    }


    Context2d.prototype.roundImage = function (img, x, y, w, h, r) {
        this.drawImage(this.roundImageCanvas(img, w, h, r), x, y, w, h)
        return this
    }
}