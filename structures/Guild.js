require('dotenv').config()
const { Structures } = require('discord.js');
const { Player } = require("../structures/music")

module.exports = Structures.extend('Guild', Guild => {
    class GuildPlayer extends Guild {
        constructor(...args) {
            super(...args);
            this.cool = true;
            this.player = new Player(this)
        }
    }
    return GuildPlayer;
});