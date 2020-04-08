require('dotenv').config()
const moment = require('moment');
const {promisify} = require('util');
const Utils = require('../Utils/Utils');
const Discord = require('discord.js');
const config = require('../config.json');
const Spotify = require('node-spotify-api');
const spotifyApi = new Spotify({
    id: process.env.SPOTIFY_ID,
    secret: process.env.SPOTIFY_SECRET
});

var regex = {
    track:  /^((?:https?:\/\/|)(?:www\.|m\.|)open.spotify\.com\/track\/([a-zA-Z0-9-_]+)(?:\\?.*|))|(spotify:track:([a-zA-Z0-9-_]+))$/,
    album:  /^((?:https?:\/\/|)(?:www\.|m\.|)open.spotify\.com\/album\/([a-zA-Z0-9-_]+)(?:\\?.*|))|(spotify:album:([a-zA-Z0-9-_]+))$/,
    artist: /^((?:https?:\/\/|)(?:www\.|m\.|)open.spotify\.com\/artist\/([a-zA-Z0-9-_]+)(?:\\?.*|))|(spotify:artist:([a-zA-Z0-9-_]+))$/,
    playlist: /^(https:\/\/open.spotify.com\/user\/([a-zA-Z0-9]+)\/playlist\/|spotify:user:([a-zA-Z0-9]+):playlist:)([a-zA-Z0-9]+)(.*)$/,
    user: /^((?:https?:\/\/|)(?:www\.|m\.|)open.spotify\.com\/user\/([a-zA-Z0-9-_]+)(?:\\?.*|))|(spotify:user:([a-zA-Z0-9-_]+))$/,
}

var types = [['album', 'al'], ['musica', 'm', 'music', 'track'], ['artista', 'artist', 'ar'], ['playlist', 'p'], ['user', 'u'], ['me']]

var spotify = new Utils.command({
    name: 'spotify', cat: '🔧 Utilitário',
    aliases: ['sp', 'spot'],
    usage: `\`${config.prefix}spotify <album | track | artist | playlist | music | me | link | uri> [args] [--cover]\``,
    desc: "Pesquise uma musica, album, artista, playlist ou usuário no Spotify.",
    examples: `\`${config.prefix}spotify musica Blue Monday\`
    \`${config.prefix}spotify spotify:album:2B87zXm9bOWvAJdkJBTpzF --cover\`
    \`${config.prefix}spotify artista Sufjan Stevens\`
    \`${config.prefix}spotify playlist summer hits\`
    \`${config.prefix}spotify user dipperbells --cover\`
    \`${config.prefix}spotify me\`
    \`${config.prefix}spotify @user#2040\``,
    subcommands: types,
    needArgs: true
}, async (m) => {
    var thisCommand = this.init,
        loadingEmbed = new Discord.MessageEmbed()
            .setColor("#3498db")
            .setTitle("Carregando..."),
        args = m.content.split(" ")

    let showAlbum = false
    let tagregex = /--(\w+)\s??(.+?(?=--|$))?/g

    // if(tagregex.test(m.content))
    //     if(tagregex.exec(m.content)[1] == 'cover')
    //         showAlbum = true


    if(args.find(a => a == '--cover'))
        showAlbum = true
        


    args.remove('--cover')

    if (args[1] !== undefined) {
        if(types[0].includes(args[1]))
            searchAlbum(args.slice(2).join(" "))
        else if(types[1].includes(args[1]))
            searchTrack(args.slice(2).join(" "))
        else if(types[2].includes(args[1]))
            searchArtists(args.slice(2).join(" "))
        else if(types[3].includes(args[1]))
            searchPlaylsit(args.slice(2).join(" "))
        else if(types[4].includes(args[1]))
            getUser(args[2])
        else if(types[5].includes(args[1]))
            getUserTrack(m.author)
        else if(regex.track.test(args[1]))
            await getTrack(regex.track.exec(args[1])[2] || regex.track.exec(args[1])[4], true, true)
        else if(regex.album.test(args[1]))
            await getAlbum(regex.album.exec(args[1])[2] || regex.album.exec(args[1])[4], true, true)
        else if(regex.artist.test(args[1]))
            await getArtist(regex.artist.exec(args[1])[2] || regex.artist.exec(args[1])[4], true, true)
        else if(regex.playlist.test(args[1]))
            await getPlaylist(regex.playlist.exec(args[1])[4], true, true)
        else if(regex.user.test(args[1]))
            await getUser(regex.user.exec(args[1])[2] || regex.user.exec(args[1])[4])
        else if(m.getUser(args[1], false))
            getUserTrack(m.getUser(args[1], false))
        else getUsage()

    }
    function getUserTrack(user){
        let noPlaying = new Discord.MessageEmbed()
            .setDescription(user.id == m.author.id ? "Você não esta tocando nada no momento." : `O usuário ${user} não está tocando nada no momento.`)
            .setColor("#E50914")
            .setFooter(`${m.author.username}#${m.author.discriminator}`, m.author.avatarURL)
        if(user.presence.activity){
            if (user.presence.activity.type == 'LISTENING')
                getTrack(user.presence.activity.syncID).then(async em => {
                    m.send(em)
                });
            else m.send(noPlaying)
        } else m.send(noPlaying)
        
    }


    function getUsage() {
        m.send(new Utils.command({name: thisCommand.name,  usage: thisCommand.usage, examples: thisCommand.examples }).getUsage(m))
    }

    async function searchTrack(query) {
        var msg = await m.send(loadingEmbed)
        spotifyApi.search({ type: 'track', query: query, limit: 9 })
            .then(async res => {
                if(res.tracks.items.length == 1) {msg.edit(await getTrack(res.tracks.items[0].id))}
                else if(res.tracks.items.length > 0){
                    let results = '';
                    res.tracks.items.forEach((track, i) => {
                        results += `\`[${i+1}]\` **[${track.artists[0].name}]** ${track.name}\n`
                    })
                    await msg.edit(new Discord.MessageEmbed()
                        .setAuthor("Resultados da pesquisa", "https://i.imgur.com/vw8svty.png")
                        .setTitle(query)
                        .setColor(config.colors.spotify)
                        .setDescription("Digite o numero do resultado para selecionar a música")
                        .addField("Resultados", results))
                    let colect = () => {
                        let collector = new Discord.MessageCollector(msg.channel, c => c.author.id == m.author.id, {time: 25000, max: 1});
                        collector.on('collect', async collected => {
                        
                            let resultNP = res.tracks.items.length;
                            if(isNaN(Number(collected.content)) || (Number(collected.content) < 1 || Number(collected.content) > resultNP)){
                                colect()
                            } else {
                                msg.edit(await getTrack(res.tracks.items[Number(collected.content)-1].id, true))
                                collected.delete();
                            }
                        })
                    }

                    colect()
                    
                } else {
                    msg.edit(new Discord.MessageEmbed()
                        .setTitle(`A busca para *${query}* não retornou nenhum resultado.`)
                        .setColor(config.colors.error))
                }
            })
            .catch(function (err) {
                Utils.ErrorLog(m, err)
            });
    }


    async function getTrack(id, send, link) {
        return new Promise((res, rej) => {
            spotifyApi.request('https://api.spotify.com/v1/tracks/' + id)
                .then(async data => {

                    let explicit = m.client.emojis.find(e => e.id == config.emojis.explicit).toString()
                    let track = data;
                    let artistlist = [];
                    track.artists.forEach(a => {
                        artistlist.push(`[${a.name}](${a.external_urls.spotify})`)
                    });

                    if(showAlbum){
                        let embed = new Discord.MessageEmbed()
                            .setImage(track.album.images[1].url)
                            .setColor(config.colors.spotify)
                            .setAuthor(track.name, "https://i.imgur.com/vw8svty.png", track.external_urls.spotify)
                        if(send){
                            m.send(embed)
                            res(embed)
                        } else 
                            res(embed)
                        return;
                    }

                    let embed = new Discord.MessageEmbed()
                        .setAuthor("Informações da música", "https://i.imgur.com/vw8svty.png")
                        .setColor(config.colors.spotify)
                        .setTitle(`${track.explicit ? explicit+"  " : ""}${track.name} \`(${moment(track.duration_ms).format('mm:ss')})\``)
                        .setURL(track.external_urls.spotify)
                        .addField(`Álbum${track.album.album_type == "single" ? "" : " (Single)"}`, `[${track.album.name}](${track.album.external_urls.spotify}) \`(${track.album.release_date.split("-")[0]})\``)
                        .addField(`Artista${track.artists.length == 1 ? "" : "s"}`, artistlist.join(", "), true)
                        .setThumbnail(track.album.images[1].url)
                    if(send){
                        m.send(embed)
                        res(embed)
                    } else 
                        res(embed)
                })
                .catch(e => {
                    if (e.statusCode == 404 && link){
                        let embed = new Discord.MessageEmbed()
                            .setTitle(`A URL ou URI está inválida.`)
                            .setColor(config.colors.error)
                        if(send){
                            m.send(embed)
                            res(embed)
                        } else 
                            res(embed)
                    } else Utils.ErrorLog(m, e)
                });
        })

    }


    async function searchAlbum(query) {
        var msg = await m.send(loadingEmbed)
        spotifyApi.search({ type: 'album', query: query, limit: 9 })
            .then(async res => {
                if(res.albums.items.length == 1) {msg.edit(await getAlbum(res.albums.items[0].id))}
                else if(res.albums.items.length > 0){

                    let results = '';
                    res.albums.items.forEach((album, i) => {
                        let albumType
                        if(album.album_type == 'compilation') albumType = '\`C\` '; else if (album.album_type == 'single') albumType = '\`S\` '; else albumType = ''
                        results += `\`[${i+1}]\` ${albumType}**[${album.artists[0].name}]** ${album.name} \`(${album.release_date.split("-")[0]})\`\n`
                    })
                    
                    await msg.edit(new Discord.MessageEmbed()
                        .setAuthor("Resultados da pesquisa", "https://i.imgur.com/vw8svty.png")
                        .setTitle(query)
                        .setColor(config.colors.spotify)
                        .setDescription("Digite o numero do resultado para selecionar o álbum.")
                        .addField("Resultados", results))

                    
                    let colect = () => {
                        let collector = new Discord.MessageCollector(msg.channel, c => c.author.id == m.author.id, {time: 25000, max: 1});
                        collector.on('collect', async collected => {
                        
                            let resultNP = res.albums.items.length;
                            if(isNaN(Number(collected.content)) || (Number(collected.content) < 1 || Number(collected.content) > resultNP)){
                                colect()
                            } else {
                                msg.edit(await getAlbum(res.albums.items[Number(collected.content)-1].id, false))
                                collected.delete();
                            }
                        })
                    }

                    colect()
                    
                } else {
                    msg.edit(new Discord.MessageEmbed()
                        .setTitle(`A busca para *${query}* não retornou nenhum resultado.`)
                        .setColor(config.colors.error))
                }
            })
            .catch(function (err) {
                Utils.ErrorLog(m, err)
            });
    }


    async function getAlbum(id, send, link) {
        return new Promise((res, rej) => {
            spotifyApi.request('https://api.spotify.com/v1/albums/' + id)
                .then(async data => {

                    let albumType,
                        artistlist = [],
                        trackList = '',
                        trackListNoLink = ''
                    data.artists.forEach(a => {
                        artistlist.push(`[${a.name}](${a.external_urls.spotify})`)
                    });
                    if(data.tracks.items.length > 10){
                        for (let i = 0; i < 10; i++) {
                            let track = data.tracks.items[i]
                            let iStr = (1+i).toString()
                            trackList += `\`[${iStr.length == 1 ? '0'+iStr : iStr}]\` [${track.name}](${track.external_urls.spotify}) \`(${moment(track.duration_ms).format('mm:ss')})\`\n`;
                            trackListNoLink += `\`[${iStr.length == 1 ? '0'+iStr : iStr}]\` ${track.name} \`(${moment(track.duration_ms).format('mm:ss')})\`\n`;
                        }
                        trackList += `\`[+${data.total_tracks-10} músicas]\``;
                        trackListNoLink += `\`[+${data.total_tracks-10} músicas]\``;
                    } else {
                        data.tracks.items.forEach((track, i) => {
                            let iStr = (1+i).toString()
                            trackList += `\`[${iStr.length == 1 ? '0'+iStr : iStr}]\` [${track.name}](${track.external_urls.spotify}) \`(${moment(track.duration_ms).format('mm:ss')})\`\n`;
                            trackListNoLink += `\`[${iStr.length == 1 ? '0'+iStr : iStr}]\` ${track.name} \`(${moment(track.duration_ms).format('mm:ss')})\`\n`;
                        })
                    }

                    if(data.album_type == 'compilation') albumType = '\`COMPILATION\` '; else if (data.album_type == 'single') albumType = '\`SINGLE\` '; else albumType = ''


                    if(showAlbum){
                        let embed = new Discord.MessageEmbed()
                            .setImage(data.images[1].url)
                            .setColor(config.colors.spotify)
                            .setAuthor(data.name, "https://i.imgur.com/vw8svty.png", data.external_urls.spotify)
                        if(send){
                            m.send(embed)
                            res(embed)
                        } else 
                            res(embed)
                        return;
                    }


                    let embed = new Discord.MessageEmbed()
                        .setAuthor("Informações do álbum", "https://i.imgur.com/vw8svty.png")
                        .setColor(config.colors.spotify)
                        .setTitle(`${albumType}${data.name} \`(${data.release_date.split("-")[0]})\``)
                        .setURL(data.external_urls.spotify)
                        .addField(`Artista${data.artists.length == 1 ? "" : "s"}`, artistlist.join(", "))
                        .addField("Músicas", trackList.length > 1000 ? trackListNoLink : trackList)
                        .setThumbnail(data.images[1].url)
                    if(send){
                        m.send(embed)
                        res(embed)
                    } else 
                        res(embed)
                })
                .catch(e => {
                    if (e.statusCode == 404 && link){
                        let embed = new Discord.MessageEmbed()
                            .setTitle(`A URL ou URI está inválida.`)
                            .setColor(config.colors.error)
                        if(send){
                            m.send(embed)
                            res(embed)
                        } else 
                            res(embed)
                    } else Utils.ErrorLog(m, e)
                });
        })

    }

    async function searchArtists(query) {
        var msg = await m.send(loadingEmbed)
        spotifyApi.search({ type: 'artist', query: query, limit: 9 })
            .then(async res => {
                if(res.artists.items.length == 1) {msg.edit(await getArtist(res.artists.items[0].id))}
                else if(res.artists.items.length > 0){

                    let results = '';
                    res.artists.items.forEach((artist, i) => {
                        results += `\`[${i+1}]\` ${artist.name} \`(${artist.followers.total} seguidores)\`\n`
                    })
                    
                    await msg.edit(new Discord.MessageEmbed()
                        .setAuthor("Resultados da pesquisa", "https://i.imgur.com/vw8svty.png")
                        .setTitle(query)
                        .setColor(config.colors.spotify)
                        .setDescription("Digite o numero do resultado para selecionar o artista.")
                        .addField("Resultados", results))

                    
                    let colect = () => {
                        let collector = new Discord.MessageCollector(msg.channel, c => c.author.id == m.author.id, {time: 25000, max: 1});
                        collector.on('collect', async collected => {
                        
                            let resultNP = res.artists.items.length;
                            if(isNaN(Number(collected.content)) || (Number(collected.content) < 1 || Number(collected.content) > resultNP)){
                                colect()
                            } else {
                                msg.edit(await getArtist(res.artists.items[Number(collected.content)-1].id, false))
                                collected.delete();
                            }
                        })
                    }

                    colect()
                    
                } else {
                    msg.edit(new Discord.MessageEmbed()
                        .setTitle(`A busca para *${query}* não retornou nenhum resultado.`)
                        .setColor(config.colors.error))
                }
            })
            .catch(function (err) {
                Utils.ErrorLog(m, err)
            });
    }


    async function getArtist(id, send, link) {
        return new Promise((res, rej) => {
            spotifyApi.request('https://api.spotify.com/v1/artists/' + id).then(async data => {

                spotifyApi.request(`https://api.spotify.com/v1/artists/${id}/top-tracks?country=BR`).then(async tr => {

                    let tracks = tr.tracks,
                        trackList = '',
                        trackListNoLink = '',
                        explicit = m.client.emojis.find(e => e.id == config.emojis.explicit).toString()
                    
                    if(tracks.length > 10){
                        for (let i = 0; i < 10; i++) {
                            let track = tracks[i]
                            let iStr = (1+i).toString()
                            trackList += `\`[${iStr.length == 1 ? '0'+iStr : iStr}]\` ${track.explicit ? explicit+" " : ""}[${track.name}](${track.external_urls.spotify}) \`(${moment(track.duration_ms).format('mm:ss')})\`\n`;
                            trackListNoLink += `\`[${iStr.length == 1 ? '0'+iStr : iStr}]\` ${track.explicit ? explicit+" " : ""}${track.name} \`(${moment(track.duration_ms).format('mm:ss')})\`\n`;
                        }
                        trackList += `\`[+${tracks.length-5} músicas]\``;
                        trackListNoLink += `\`[+${tracks.length-5} músicas]\``;
                    } else {
                        tracks.forEach((track, i) => {
                            let iStr = ((1+i).toString())
                            trackList += `\`[${iStr.length == 1 ? '0'+iStr : iStr}]\` ${track.explicit ? explicit+" " : ""}[${track.name}](${track.external_urls.spotify}) \`(${moment(track.duration_ms).format('mm:ss')})\`\n`;
                            trackListNoLink += `\`[${iStr.length == 1 ? '0'+iStr : iStr}]\` ${track.explicit ? explicit+" " : ""}${track.name} \`(${moment(track.duration_ms).format('mm:ss')})\`\n`;
                        })
                    }

                    if(showAlbum){
                        let embed = new Discord.MessageEmbed()
                            .setImage(data.images[1].url)
                            .setColor(config.colors.spotify)
                            .setAuthor(data.name, "https://i.imgur.com/vw8svty.png", data.external_urls.spotify)
                        if(send){
                            m.send(embed)
                            res(embed)
                        } else 
                            res(embed)
                        return;
                    }

                    let embed = new Discord.MessageEmbed()
                        .setAuthor("Informações do artista", "https://i.imgur.com/vw8svty.png")
                        .setColor(config.colors.spotify)
                        .setTitle(data.name)
                        .setURL(data.external_urls.spotify)
                        .addField("Seguidores", data.followers.total, true)
                        .addField("Músicas mais famosas", trackList.length > 1000 ? trackListNoLink : trackList)
                        .setThumbnail(data.images[1].url)
                    if(data.genres.length > 0) embed.addField("Gêneros", data.genres.join(", "), true);
                    
                    if(send){
                        m.send(embed)
                        res(embed)
                    } else 
                        res(embed)

                
                }).catch(e => {
                    Utils.ErrorLog(m, e)
                });
            })
            .catch(e => {
                if (e.statusCode == 404 && link){
                    let embed = new Discord.MessageEmbed()
                        .setTitle(`A URL ou URI está inválida.`)
                        .setColor(config.colors.error)
                    if(send){
                        m.send(embed)
                        res(embed)
                    } else 
                        res(embed)
                } else Utils.ErrorLog(m, e)
            });
        })

    }



    async function searchPlaylsit(query) {
        var msg = await m.send(loadingEmbed)
        spotifyApi.request(`https://api.spotify.com/v1/search?type=playlist&limit=9&q=${encodeURI(query)}`)
            .then(async res => {
                //console.log(res.playlists.items)
                if(res.playlists.items.length == 1) {msg.edit(await getPlaylist(res.playlists.items[0].id))}
                else if(res.playlists.items.length > 0){

                    let results = '';
                    res.playlists.items.forEach((playlist, i) => {
                        results += `\`[${i+1}]\` ${playlist.owner.display_name ? `[${playlist.owner.display_name}] ` : ''}${playlist.name} \`(${playlist.tracks.total})\`\n`
                    })
                    
                    await msg.edit(new Discord.MessageEmbed()
                        .setAuthor("Resultados da pesquisa", "https://i.imgur.com/vw8svty.png")
                        .setTitle(query)
                        .setColor(config.colors.spotify)
                        .setDescription("Digite o numero do resultado para selecionar a playlist.")
                        .addField("Resultados", results))

                    
                        let colect = () => {
                            let collector = new Discord.MessageCollector(msg.channel, c => c.author.id == m.author.id, {time: 25000, max: 1});
                            collector.on('collect', async collected => {
                            
                                let resultNP = res.albums.items.length;
                                if(isNaN(Number(collected.content)) || (Number(collected.content) < 1 || Number(collected.content) > resultNP)){
                                    colect()
                                } else {
                                    msg.edit(await getPlaylist(res.albums.items[Number(collected.content)-1].id, false))
                                    collected.delete();
                                }
                            })
                        }
    
                        colect()
                    
                } else {
                    msg.edit(new Discord.MessageEmbed()
                        .setTitle(`A busca para *${query}* não retornou nenhum resultado.`)
                        .setColor(config.colors.error))
                }
            })
            .catch(function (err) {
                Utils.ErrorLog(m, err)
            });
    }


    async function getPlaylist(id, send, link) {
        return new Promise((res, rej) => {
            spotifyApi.request('https://api.spotify.com/v1/playlists/' + id)
                .then(async data => {

                    let trackList = '',
                        trackListNoLink = ''
                    
                    if(data.tracks.items.length > 10){
                        for (let i = 0; i < 10; i++) {
                            let track = data.tracks.items[i].track
                            let iStr = (1+i).toString()
                            trackList += `\`[${iStr.length == 1 ? '0'+iStr : iStr}]\` [${track.name}](${track.external_urls.spotify}) \`(${moment(track.duration_ms).format('mm:ss')})\`\n`;
                            trackListNoLink += `\`[${iStr.length == 1 ? '0'+iStr : iStr}]\` ${track.name} \`(${moment(track.duration_ms).format('mm:ss')})\`\n`;
                        }
                        trackList += `\`[+${data.tracks.total-10} músicas]\``;
                        trackListNoLink += `\`[+${data.tracks.total-10} músicas]\``;
                    } else {
                        data.tracks.items.forEach((tr, i) => {
                            let track = tr.track
                            let iStr = (1+i).toString()
                            trackList += `\`[${iStr.length == 1 ? '0'+iStr : iStr}]\` [${track.name}](${track.external_urls.spotify}) \`(${moment(track.duration_ms).format('mm:ss')})\`\n`;
                            trackListNoLink += `\`[${iStr.length == 1 ? '0'+iStr : iStr}]\` ${track.name} \`(${moment(track.duration_ms).format('mm:ss')})\`\n`;
                        })
                    }

                    if(showAlbum){
                        let embed = new Discord.MessageEmbed()
                            .setImage(data.images[0].url)
                            .setColor(config.colors.spotify)
                            .setAuthor(data.name, "https://i.imgur.com/vw8svty.png", data.external_urls.spotify)
                        if(send){
                            m.send(embed)
                            res(embed)
                        } else 
                            res(embed)
                        return;
                    }

                    let embed = new Discord.MessageEmbed()
                        .setAuthor("Informações da playlist", "https://i.imgur.com/vw8svty.png")
                        .setColor(config.colors.spotify)
                        .setTitle(`${data.name}`)
                        .setURL(data.external_urls.spotify)
                        .addField(`Playlist de`, `[${data.owner.display_name || data.owner.id}](${data.owner.external_urls.spotify})`, true)
                        .addField("Seguidores", data.followers.total, true)
                        .addField("Músicas", trackList.length > 1000 ? trackListNoLink : trackList)
                        .setThumbnail(data.images[0].url)
                    if(data.description) embed.setDescription(data.description)
                    if(send){
                        m.send(embed)
                        res(embed)
                    } else 
                        res(embed)
                })
                .catch(e => {
                    if (e.statusCode == 404 && link){
                        let embed = new Discord.MessageEmbed()
                            .setTitle(`A URL ou URI está inválida.`)
                            .setColor(config.colors.error)
                        if(send){
                            m.send(embed)
                            res(embed)
                        } else 
                            res(embed)
                    } else Utils.ErrorLog(m, e)
                });
        })

    }


    async function getUser(id) {
        return new Promise((res, rej) => {
            spotifyApi.request('https://api.spotify.com/v1/users/' + id)
                .then(async data => {

                    if(showAlbum){
                        let embed = new Discord.MessageEmbed()
                            .setImage(data.images[0].url)
                            .setColor(config.colors.spotify)
                            .setAuthor(data.name, "https://i.imgur.com/vw8svty.png", data.external_urls.spotify)
                        m.send(embed)
                        return;
                    }

                    let embed = new Discord.MessageEmbed()
                        .setAuthor("Informações do usuário", "https://i.imgur.com/vw8svty.png")
                        .setColor(config.colors.spotify)
                        .setTitle(data.display_name || id)
                        .setURL(data.external_urls.spotify)
                        .addField("Seguidores", data.followers.total, true)
                        .setThumbnail(data.images[0].url)

                    m.send(embed)

                })
                .catch(e => {
                    if (e.statusCode == 404){
                        let embed = new Discord.MessageEmbed()
                            .setTitle(`A URL ou URI está inválida.`)
                            .setColor(config.colors.error)
                        m.send(embed)

                    } else Utils.ErrorLog(m, e)
                });
        })

    }





})

module.exports.init = spotify