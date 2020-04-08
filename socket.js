require('dotenv').config()
const app = require('express')();
const server = require('http').Server(app);
var sio = require('socket.io')(server);
var io = sio.of('/stream');
const Discord = require('discord.js');
const Stream = require('./structures/Stream.js')

const client = new Discord.Client();

client.on('ready', () => {
    console.log("adasdasd ready")
})

app.listen(3000, function () {
  console.log('Example app listening on port '+ process.env.PORT);
});

app.get('/', function (req, res) {
  console.log('sssaaaaa')
    res.send("<pre>Music server ready at port " + process.env);
});

app.get('/stream', async (data, res) => {
  console.log(data)
        let guild = client.guilds.get(data.guildId)
        let channel = guild.channels.get(data.channelId)
        if(data.join) await channel.join()
        guild.stream = new Stream(io, guild, guild.channels.get(data.channelId), data.resource)
        guild.stream.stream()
});

io.on('connection', function (socket) {
    console.log('Connected')
    socket.emit('status', { status: 200, message: 'connected' });
    socket.on('join', async data => {
        let guild = client.guilds.get(data.guildId)
        let channel = guild.channels.get(data.channelId)
        await channel.join()
    })
    socket.on('leave', async data => {
        let guild = client.guilds.get(data.guildId)
        let channel = guild.channels.get(data.channelId)
        await channel.leave()
    })
    socket.on('stream',async data => {
        console.log(data)
        let guild = client.guilds.get(data.guildId)
        let channel = guild.channels.get(data.channelId)
        if(data.join) await channel.join()
        guild.stream = new Stream(io, guild, guild.channels.get(data.channelId), data.resource)
        guild.stream.stream()
    })

    socket.on('s-stream-time',async data => {
        console.log(data)
        let guild = client.guilds.get(data.guildId)
        let channel = guild.me.voice.channel
        let stream = channel.connection.dispatcher.streamTime
        console.log(stream)
        io.emit('r-stream-time', {streamTime: stream, guildId: data.guildId})
    })

    socket.on('pause',async data => {
        console.log(data)
        let guild = client.guilds.get(data.guildId)
        let channel = guild.me.voice.channel
        channel.connection.dispatcher.pause()
    })

    socket.on('resume',async data => {
        console.log(data)
        let guild = client.guilds.get(data.guildId)
        let channel = guild.me.voice.channel
        channel.connection.dispatcher.resume()
    })

    
});



client.login(process.env.TOKEN)

