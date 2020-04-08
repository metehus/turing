const request = require('request');
const Utils = require('../Utils/Utils');
const Discord = require('discord.js');
const config = require('../config.json');

var reactions = ['🙂', '😡', '😏', '😢', '🤒']
var reactionsName = ['happy', 'angry', 'sassy', 'sad', 'sick']
var reactionsNamePt = ['feliz', 'bravo', 'tarado', 'triste', 'doente']

var strength = [['😜', '😜😮', '😜😮😎', '😜😮😎💪', '😜😮😎💪😂👌🔝'],
['😤', '😤☠', '😤☠😡', '😤☠😡🛑', '😤☠😡🛑🔞💣🤬'],
['😻', '😻😏', '😻😏😜', '😻😏😜😍', '😻😏😜😍👉👌😘'],
['😓', '😓😢', '😓😢😦', '😓😢😦😖', '😓😢😦😖😰😭😔'],
['😷', '😷🤢', '😷🤢😩', '😷🤢😩🤧', '😷🤢😩🤧🤕🤮🤒']]
var strengthNum = ['\u0031\u20E3', '\u0032\u20E3', '\u0033\u20E3', '\u0034\u20E3', '\u0035\u20E3']
var strengthText = ['Zap fraco', 'Zap médio', 'Isso q é zap bb', 'Zap monstrão', 'Zap topper demais']

var zap = new Utils.command({
    name: 'zap', cat: '⁉ Aleatório',
    aliases: ['zapzap', 'whatsapp'],
    usage: `\`${config.prefix}zap <mensagem para ser zapeada>\``,
    desc: "Transforme uma mensagem em zapzap.",
    examples: `\`${config.prefix}zap PABLLO VITTAR FOI LONGE DEMAIS\`\n\`${config.prefix}zap --AOOOO CORNAAAO\` use \`--\` no começo para usar o comando automaticamente`,
    subcommands: { '--<texto>': `use \`--\` no começo para usar o comando automaticamente sem precisar escolher humor e força` },
    needArgs: true,
    needReactionsPermission: true
}, async (m) => {

    if (m.content.split(" ").slice(1).join(" ") == "") {
        m.channel.send(new Discord.MessageEmbed()
            .setTitle("Insira um texto valido.")
            .setColor("#E50914")
            .setFooter(`${m.author.username}#${m.author.discriminator}`, m.author.avatarURL))
        return;
    }

    var msgZap = m.content.split(" ").slice(1).join(" ");

    if (m.content.split(" ")[1].startsWith("--")) {
        msgZap = msgZap.substring(2)
        getZap('happy', 2);
        return
    }


    try {
        m.channel.send(new Discord.MessageEmbed()
            .setAuthor("Vem de zap bebe", "https://i.imgur.com/eX69EBp.png", "http://vemdezapbe.be/")
            .setColor("#25D366")
            .setFooter(`Aguarde todos os emojis para reagir`)
            .setDescription("Escolha um humor para seu zap:\n:slight_smile:: **Feliz.**\n:rage:: **Bravo.**\n:smirk:: **Safado.**\n:cry:: **Triste.**\n:thermometer_face:: **Doente.**"))
            .then(async msg => {

                for (let emoji of reactions)
                    await msg.react(emoji)
                //reactions.forEach(async a => await msg.react(a))

                msg.awaitReactions((r, u) => reactions.includes(r.emoji.name) && u.id == m.author.id, { max: 1, time: 30000 })
                    .then(c => {
                        if (c.size == 0) {
                            msg.delete()
                            return;
                        }
                        var mood = reactionsName[reactions.indexOf(c.first().emoji.name)];
                        msg.delete().then(() => {
                            getStength(mood);
                        });
                    })
                    .catch(e => Utils.ErrorLog(m, e));
            })

    } catch (e) {
        Utils.ErrorLog(m, e)
    }

    async function getStength(mood) {
        try {

            var forca = "";
            strength.forEach(s => {
                forca += `\n${strengthNum[strength.indexOf(s)]}: **${strengthText[strength.indexOf(s)]} ${strength[reactionsName.indexOf(mood)][strength.indexOf(s)]}**`;
            })

            let strEmbed = new Discord.MessageEmbed()
                .setAuthor("Vem de zap bebe", "https://i.imgur.com/eX69EBp.png", "http://vemdezapbe.be/")
                .setColor("#25D366")
                .setFooter(`Aguarde todos os emojis para reagir`)
                .setDescription(`Voce escolheu o humor **${reactionsNamePt[reactionsName.indexOf(mood)]}**, agora escolha uma força pro seu zap:${forca}`)

            let msg = await m.channel.send(strEmbed)

            for (let i = 1; i <= 5; i++)
                await msg.react(i + '\u20E3')

            msg.awaitReactions((r, u) => strengthNum.includes(r.emoji.name) && u.id == m.author.id, { max: 1, time: 30000 })
                .then(c => {
                    if (c.size == 0) {
                        msg.delete()
                        return;
                    }
                    let strength = strengthNum.indexOf(c.first().emoji.name);
                    msg.delete().then(() => {
                        getZap(mood, strength);
                    });
                }).catch(e => Utils.ErrorLog(m, e));

        } catch (e) {
            Utils.ErrorLog(m, e)
        }

    }

    function getZap(mood, strength) {
        //m.reply(`zap ${msgZap} de humor ${mood} e força ${strength++}`)

        var headers = {
            'Content-Type': 'application/json'
        }
        var options = {
            url: 'http://vemdezapbe.be/api/v1.0/zap',
            method: 'POST',
            headers: headers,
            form: { 'zap': msgZap, 'mood': mood, 'strength': ++strength }
        }
        try {

            m.channel.send(new Discord.MessageEmbed()
                .setColor("#3498db")
                .setTitle("Carregando...")
                .setFooter(`${m.author.username}#${m.author.discriminator}`, m.author.avatarURL)).then(async loadMsg => {
                    request(options, async function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var zap = JSON.parse(body).zap.replace(/\s+(?!\w+)/g, '');
                            if (zap.length > 1020) {
                                var sendZap = false;
                                if (zap.length > 1990)
                                    msgerr = `Seu zap foi tão 😎💪**TOP D++++**😂👌🔝 que deu ${zap.length}/1990 caracteres. Tente abaixar a força de seu zap ou separa-lo.`;
                                else {
                                    sendZap = true;
                                    msgerr = `Seu zap foi tão 😎💪**TOP D++++**😂👌🔝 que foi maior que 1020, tendo ${zap.length} caracteres e tivemos que separar as mensagens.`;
                                }

                                let embed = new Discord.MessageEmbed()
                                    .setTitle(msgerr)
                                    .setColor("#E50914")
                                    .setFooter(`${m.author.username}#${m.author.discriminator}`, m.author.avatarURL)

                                if (sendZap) embed.setFooter(`Reaja com 🇺 para transformar em unicode`)
                                let msg;

                                if (sendZap) {
                                    msg = await loadMsg.edit('`' + zap + '`', embed)
                                    msg.awaitReactions((r, u) => r.emoji.name == "🇺" && u.id == m.author.id, { max: 1, time: 80000 })
                                    .then(c => {
                                        if (c.size == 0) msg.reactions.removeAll();

                                        msg.edit(`\`${zap}\``, { embed: null })
                                        msg.reactions.removeAll()
                                    })
                                    .catch(e => Utils.ErrorLog(m, e));
                                msg.react("🇺");
                                }
                                else
                                    msg = await loadMsg.edit(embed)

                                

                                return;

                            }



                            // TODO: Criar link com protocolo pra whatsapp
                            var zapUrl = encodeURI("http://musicstats.cf/zapzap/?text=" + zap)
                            loadMsg.edit(new Discord.MessageEmbed()
                                .setAuthor("Zap pronto bb", "https://i.imgur.com/eX69EBp.png", "http://vemdezapbe.be/")
                                .setColor("#25D366")
                                .setFooter(`Reaja com 🇺 para transformar em unicode`)
                                .setDescription(zap))
                                .then(msg => {
                                    msg.awaitReactions((r, u) => r.emoji.name == "🇺" && u.id == m.author.id, { max: 1, time: 80000 })
                                        .then(c => {
                                            if (c.size == 0) msg.reactions.removeAll();

                                            msg.edit(`\`${zap}\``, { embed: null })
                                            msg.reactions.removeAll()
                                        })
                                        .catch(e => Utils.ErrorLog(m, e));
                                    msg.react("🇺");
                                }).catch(e => {
                                    Utils.ErrorLog(m, e)
                                });
                        }
                    })
                }).catch(e => {
                    Utils.ErrorLog(m, e)
                });
        } catch (e) {
            Utils.ErrorLog(m, e)
        }

    }

})

module.exports.init = zap