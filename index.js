require('dotenv').config()
const Discord = require('discord.js');
const fs = require('fs');
const Utils = require('./Utils/Utils');
const config = require('./config.json');
const Firebase = require('firebase-admin');
require('./structures/Message.js').default
require('./structures/Guild.js').default
require('./Utils/prototypes.js')()

const client = new Discord.Client();



var serviceAccount = require('./firebase.json');

Firebase.initializeApp({
    credential: Firebase.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DBURL
});

var db = Firebase.firestore();

const settings = {/* your settings... */ timestampsInSnapshots: true };
db.settings(settings);


var commands = [];

client.on('ready', () => {
    console.log('Ready');
});

function initCommands() {
    return new Promise(res => {
        fs.readdirSync('./Commands').forEach(f => {
            try {
                if (f.endsWith(".js"))
                    commands.push(require(`./Commands/${f}`).init)
            } catch (e) {
                console.error(e)
            }
        });
        res()
    })
}

function initEvents() {
    client.on('message', async message => {
        let _cmd = message.content.split(" ")[0];
        commands.forEach(async cmd => {
            if (config.prefix + cmd.name == _cmd) {
                await cmd.run(message, {fb: Firebase, cmds: commands, fbdb: db})
            }
            cmd.aliases.forEach(ali => {
                if (config.prefix + ali == _cmd) {
                    cmd.run(message, {fb: Firebase, cmds: commands, fbdb: db})
                }
            })
        })
    });
    client.on("messageUpdate", (oldMsg, newMsg) => {
        client.emit('message', newMsg)
    })
}


initCommands()
    .then(initEvents)
    .then(() => client.login(process.env.TOKEN))
    .catch(e => {
        console.error(new Error(e))
    })

    var express = require('express');
    var app = express();
    
    app.get('/', function (req, res) {
      res.send('Hello World!');
    });
    
    app.listen(3000, function () {
      console.log('Example app listening on port 3000!');
    });
    