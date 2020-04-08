const config = require('../config.json');
const stringsJson = require('./languages.json');
const Discord = require('discord.js');
const { registerFont } = require('canvas')

var command = class Command {
    /**
     * @param {Object} cmd command configuration
     * @param {Function} func executable function
     */
    constructor(cmd, func) {
        this.name = cmd.name;
        this.usage = cmd.usage || 'Sem documentação de uso.';
        this.cat = cmd.cat || '🎲 Geral';
        this.desc = cmd.desc || 'Sem descrição do comando.';
        this.examples = cmd.examples || 'Sem exemplos.';
        this.aliases = cmd.aliases || [];
        this.hidden = cmd.hidden || false;
        this.needArgs = cmd.needArgs || false;
        this.ownerOnly = cmd.ownerOnly || false;
        this.cooldown = cmd.cooldown || 0;
        this.subcommands = cmd.subcommands || [];
        this.needSubCommand = cmd.needSubCommand || false;
        this.needReactionsPermission = cmd.needReactionsPermission || false;
        this.single = cmd.single || false
        this._exec = func
        this.cooldownUsers = new Set()
    }

    async run(m, a) {
        if (!m.author.bot) {
            if(this.cooldown == 0 || m.response) return await this.testArgs(m, a);
            if(this.cooldownUsers.has(m.author.id)) return this.sendCooldown(m)
            
            await this.testArgs(m, a);
            this.cooldownUsers.add(m.author.id)
            setTimeout(() => {
                this.cooldownUsers.delete(m.author.id)
            }, this.cooldown * 1000)
        }
    }

    sendCooldown(m){
        m.channel.send(new Discord.MessageEmbed()
            .setColor(config.colors.error)
            .setDescription(`Aguarde ${this.cooldown > 60 ? (this.cooldown / 60) + ' minutos' : this.cooldown + ' segundos'} para executar novamente.`)).then(msg => {
                setTimeout(() => {
                    msg.delete()
                }, 3E3)
            })
    }

    // TODO: Fix subcommand verify
    async testArgs(m, a) {
        m.cmd = true;
        if (this.needArgs && m.content.split(" ").slice(1).join(" ") == "")
            m.send(this.getUsage(m), null, this.single)
        else {
            if (this.needSubCommand) {
                if (!this.subcommands.find(a => a.includes(m.content.split(" ")[1])))
                    m.send(this.getUsage(m), null, this.single)
                else 
                    await this.exec(m, a)
                }
            else
                await this.exec(m, a)
        }

    }

    async exec(m, a) {
        
        a.usage = this.getUsage(m)
        if (this.ownerOnly) {
            if (config.owners.includes(m.author.id))
                try{
                    await this._exec(m, a)
                } catch(e) {
                    ErrorLog(m, e)
                }
            else
                m.channel.send(new Discord.MessageEmbed()
                    .setColor("#E50914")
                    .setTitle("Sem permissão para executar esse comando")
                    .setFooter(`Executado por ${m.author.username}`, m.author.avatarURL))
        } else
            try{
                await this._exec(m, a)
            } catch(e) {
                ErrorLog(m, e)
            }

    }

    getUsage(m) {
        var msg;
        if (this.usage == '')
            msg = "Comando sem uso definido"
        else
            msg = this.usage

        return new Discord.MessageEmbed()
            .setColor("#E50914")
            .setTitle(`Ocorreu um erro, tente:`)
            .setDescription(msg)
            .addField("Exemplos", this.examples)
            .setFooter(`${m.author.tag}`, m.author.avatarURL({format: 'png', size: 64}))
    }
}

var pagination = class Pagination {
    constructor(config, message) {
        this.pages = config.pages || [];
        this.page = 0;
        this.editMsg = config.editMsg || false;
        this.author = config.author || message.author;
        this.navIcons = config.navIcons || ['⏪', '⏩'];
        this.message = message
    }

    init() {
        if(this.editMsg) this.setPage(this.page, this.message)
        else this.message.channel.send(new Discord.MessageEmbed()
            .setColor("#3498db")
            .setTitle("Carregando...")
            .setFooter(`${this.author}#${this.author.discriminator}`, this.author.avatarURL)).then(msg => {
                this.setPage(this.page, msg)
            })

    }

    setPage(page, msg) {
        msg.reactions.filter(e => this.navIcons.includes(e.emoji.name)).map(e => e.users.remove(this.author))
        if(page < 0 || page >= this.pages.length){
            
            msg.awaitReactions((r, u) => this.navIcons.includes(r.emoji.name) && u.id == this.author.id, { max: 1, time: 60000 })
                .then(c => {
                    if (c.size == 0) return;
                    if (this.navIcons.includes(c.first().emoji.name)) {
                        if(c.first().emoji.name == this.navIcons[1]){
                            this.setPage(this.page+1, msg)
                        } else {
                            this.setPage(this.page-1, msg)
                        }
                    }
                })
            return;
        }
        this.page = page;
        msg.edit(this.pages[this.page]).then(msg => {
            msg.react(this.navIcons[0]).then(() => msg.react(this.navIcons[1]))
            msg.awaitReactions((r, u) => this.navIcons.includes(r.emoji.name) && u.id == this.author.id, { max: 1, time: 60000 })
                .then(c => {
                    if (c.size == 0) return;
                    if (this.navIcons.includes(c.first().emoji.name)) {
                        if(c.first().emoji.name == this.navIcons[1]){
                            this.setPage(this.page+1, msg)
                        } else {
                            this.setPage(this.page-1, msg)
                        }
                    }
                })
        })
    }
}


var ErrorLog = (m, e, senderror=true) => {
    console.error(e)
    m.client.guilds.get("505163101620928513").channels.get("505526342780059669").send(new Discord.MessageEmbed()
        .setAuthor("Diagnóstico de erro", m.client.emojis.get(config.emojis.error).url)
        .addField("Mensagem", `\`\`\`${m.content}\`\`\``)
        .addField("Erro", `\`\`\`${e}\`\`\``)
        .setColor("#E50914")
        .setTimestamp())
    if(senderror) m.channel.send(new Discord.MessageEmbed()
        .setTitle("Ocorreu um erro inesperado!")
        .setColor("#E50914")
        .setFooter(`${m.author.username}#${m.author.discriminator}`, m.author.avatarURL))
}

function commandGetUsage(m, cmd) {
    var msg;
    if (cmd.usage == '')
        msg = "Comando sem uso definido"
    else
        msg = cmd.usage

    return new Discord.MessageEmbed()
        .setColor("#E50914")
        .setTitle(`Uso do comando **${config.prefix}${cmd.name}**`)
        .setDescription(msg)
        .addField("Exemplos", cmd.examples)
        .setFooter(`Executado por ${m.author.username}#${m.author.discriminator}`, m.author.avatarURL)
}

class StringTranslate {
    constructor(id, params = [], lang = "pt_BR") {
        this.id = id;
        this.params = params;
        this.json = stringsJson;
        this.lang = lang;

    }

    get text() {
        if (this.params == []) {
            return this.json[this.lang][this.id];
        } else {
            var newString = this.json[this.lang][this.id];
            for (let i = 0; i < this.params.length; i++) {

                newString = newString.replace('${' + i + '}', this.params[i]);

            }
            return newString;
        }
    }
}

class Color{
    constructor(color){
        this.hexColor = "FFFFFF"
        if(color.startsWith("#") && (color.length == 4 || color.length == 7)) this.hexColor = color.substr(1);
        if(color.length == 3 || color.length == 6) this.hexColor = color
        if(color.split(", ").length == 3) this.hexColor = this.rgbArrayToHex(color.split(", "))
    }

    get fullHex() {
        if(this.hexColor.length == 6) return this.hexColor;
        let h = this.hexColor.split("")
        return h[0]+h[0]+h[1]+h[1]+h[2]+h[2]

    }

    get rgbArray(){
        var bigint = parseInt(this.fullHex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
    
        return [r, g, b]
    }

    static rgbToHex (r, g, b) { 
        let rgb = b | (g << 8) | (r << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1)
    }

    static rgbArrayToHex (arr) {
        arr = arr.map(Number);
        let rgb = arr[2] | (arr[1] << 8) | (arr[0] << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1)
    }
}

var registerFonts = () => {
    registerFont("./src/fonts/RobotoCondensed-Bold.ttf", { family: 'RobotoCondensed', weight: 'bold' })
    registerFont("./src/fonts/RobotoCondensed-BoldItalic.ttf", { family: 'RobotoCondensed', weight: 'bold', style: 'italic' })
    registerFont("./src/fonts/RobotoCondensed-Italic.ttf", { family: 'RobotoCondensed', style: 'italic' })
    registerFont("./src/fonts/RobotoCondensed-Light.ttf", { family: 'RobotoCondensed-Light' })
    registerFont("./src/fonts/RobotoCondensed-LightItalic.ttf", { family: 'RobotoCondensed-Light', style: 'italic' })
    registerFont("./src/fonts/RobotoCondensed-Regular.ttf", { family: 'RobotoCondensed' })
}

module.exports.command = command
module.exports.ErrorLog = ErrorLog
module.exports.commandGetUsage = commandGetUsage
module.exports.StringTranslate = StringTranslate
module.exports.Pagination = pagination
module.exports.Color = Color
module.exports.registerFonts = registerFonts