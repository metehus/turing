const { MessageEmbed, MessageAttachment } = require('discord.js');
const Utils = require('../Utils/Utils');
const config = require('../config.json');
const rp = require('request-promise');
const util = require('util')
const moment = require('moment-timezone');
moment.locale('pt');
const { createCanvas, loadImage } = require('canvas')
Utils.registerFonts()

const forecastIcons = {
    'clear-day': {
        emote: '☀',
        img: 'https://twemoji.maxcdn.com/2/72x72/2600.png',
        color: '#FDAA31'
    },
    'clear-night': {
        emote: '🌕',
        img: 'https://twemoji.maxcdn.com/72x72/1f315.png',
        color: '#CCD6DF'
    },
    'rain': {
        emote: '🌧',
        img: 'https://twemoji.maxcdn.com/2/72x72/1f327.png',
        color: '#80a5d6'
    },
    'snow': {
        emote: '🌨',
        img: 'https://twemoji.maxcdn.com/2/72x72/1f328.png',
        color: '#8c82ce'
    },
    'sleet': {
        emote: '<:sleet:513016418048933889>',
        img: 'https://cdn.discordapp.com/emojis/513016418048933889.png',
        color: '#4a80c7'
    },
    'wind': {
        emote: '<:wind:512847821976764416>',
        img: 'https://cdn.discordapp.com/emojis/512847821976764416.png',
        color: '#d5dae2'
    },
    'fog': {
        emote: '<:fogweather:512847755677270019>',
        img: 'https://cdn.discordapp.com/emojis/512847755677270019.png',
        color: '#d5dae2'
    },
    'cloudy': {
        emote: '☁',
        img: 'https://twemoji.maxcdn.com/2/72x72/2601.png',
        color: '#b6bfcb'
    },
    'partly-cloudy-day': {
        emote: '⛅',
        img: 'https://twemoji.maxcdn.com/2/72x72/26c5.png'
    },
    'partly-cloudy-night': {
        emote: '<:partlycloudynight:512847706654507008>',
        img: 'https://cdn.discordapp.com/emojis/512847706654507008.png'
    },
    'hail': {
        emote: '<:hail:512847793921064960>',
        img: 'https://cdn.discordapp.com/emojis/512847793921064960.png',
        color: '#4a80c7'
    },
    'thunderstorm': {
        emote: '🌩',
        img: 'https://twemoji.maxcdn.com/2/72x72/1f329.png'
    },
    'tornado': {
        emote: '🌪',
        img: 'https://twemoji.maxcdn.com/2/72x72/1f32a.png'
    }
}

const moonEmotes = Promise.all([
    loadImage('./src/images/weather/moons/1f311.png'),
    loadImage('./src/images/weather/moons/1f312.png'),
    loadImage('./src/images/weather/moons/1f313.png'),
    loadImage('./src/images/weather/moons/1f314.png'),
    loadImage('./src/images/weather/moons/1f315.png'),
    loadImage('./src/images/weather/moons/1f316.png'),
    loadImage('./src/images/weather/moons/1f317.png'),
    loadImage('./src/images/weather/moons/1f318.png')
])

const images = Promise.all([
    loadImage('./src/images/weather/arrow-up.png'),
    loadImage('./src/images/weather/weather-windy.png'),
    loadImage('./src/images/weather/humidity.png')
]);

const iconsAwait = Promise.all([
    loadImage('./src/images/weather/clear-day.png'),
    loadImage('./src/images/weather/clear-night.png'),
    loadImage('./src/images/weather/rain.png'),
    loadImage('./src/images/weather/snow.png'),
    loadImage('./src/images/weather/sleet.png'),
    loadImage('./src/images/weather/wind.png'),
    loadImage('./src/images/weather/fog.png'),
    loadImage('./src/images/weather/cloudy.png'),
    loadImage('./src/images/weather/partly-cloudy-day.png'),
    loadImage('./src/images/weather/partly-cloudy-night.png'),
    loadImage('./src/images/weather/hail.png'),
    loadImage('./src/images/weather/thunderstorm.png'),
    loadImage('./src/images/weather/tornado.png')
])

var cmd = new Utils.command({
    name: 'clima',
    desc: "Ver clima de algum local.",
    usage: `\`${config.prefix}clima <lugar>\``,
    examples: `\`#${config.prefix}clima sao paulo\``,
    aliases: ['cli'],
    cooldown: 5,
    cat: '🔧 Utilitário',
    needArgs: true
}, async (m) => {

    let args = m.content.split(' ').slice(1);

    let search = await rp(encodeURI(`https://maps.googleapis.com/maps/api/geocode/json?address=${args.join(' ')}&key=${process.env.GOOGLE_MAPS_API}&language=pt-br`))
    search = JSON.parse(search)

    function sendNotFoundEmbed() {
        m.send(new MessageEmbed()
            .setColor(config.colors.error)
            .setAuthor('Nenhuma cidade encontrada.', m.client.emojis.get(config.emojis.error).url), null, true)
    }

    const getMoonImage = (phase, moone) => {
        phase = phase * 100
        switch (true) {
            case (phase < 12.5):
                return moone[0]
            case (phase < 25):
                return moone[1]
            case (phase < 37.5):
                return moone[2]
            case (phase < 49):
                return moone[3]
            case (phase < 52):
                return moone[4]
            case (phase < 75):
                return moone[5]
            case (phase < 87.5):
                return moone[6]
            case (phase < 100):
                return moone[7]
        }
    }

    if (search.status == 'OK') {
        let result = search.results[0]
        if (!result.address_components.find(a => a.types.includes('administrative_area_level_2') || a.types.includes('locality'))) {
            sendNotFoundEmbed()
            return;
        }

        let weather = await rp(encodeURI(`https://api.darksky.net/forecast/${process.env.DARKSKY_KEY}/${result.geometry.location.lat},${result.geometry.location.lng}?lang=pt&units=ca`))
        weather = JSON.parse(weather)

        let colors = {
            day: ['#5433FF', '#20BDFF'],
            night: ['#161b5f', '#31378d']
        }

        let getTimeData = (time, tz) => {
            let timeTz = moment.unix(time).tz(tz)
            time = new Date(timeTz._d.valueOf() + timeTz._d.getTimezoneOffset() * 60000)
            return moment(time)
        }

        let times = [
            getTimeData(weather.currently.time, weather.timezone).valueOf(),
            getTimeData(weather.daily.data[0].sunriseTime, weather.timezone).valueOf(),
            getTimeData(weather.daily.data[0].sunsetTime, weather.timezone).valueOf()];

        let can = { x: 640, y: 380 }
        let canvas = createCanvas(can.x, can.y)
        let ctx = canvas.getContext('2d')
        let c;

        var grd = ctx.createLinearGradient(can.x, 0, 0, can.y);
        if (times[0] > times[1] && times[0] < times[2])
            c = colors.day
        else
            c = colors.night
        grd.addColorStop(0, c[0]);
        grd.addColorStop(1, c[1]);

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, can.x, can.y);

        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.font = '130px "RobotoCondensed"'
        ctx.fillText(parseFloat(weather.currently.temperature.toFixed(1)), 580, 140)
        ctx.font = '25px "RobotoCondensed-Light"'
        ctx.fillText(getTimeData(weather.currently.time, weather.timezone).format('D [de] MMM [de] YYYY, HH:mm'), 620, 35)

        ctx.textAlign = "left";
        ctx.font = '45px "RobotoCondensed-Light"'
        ctx.fillText('°C', 580, 80)

        ctx.textAlign = "left";
        ctx.font = '23px "RobotoCondensed-Light"'
        ctx.printTextBox(weather.currently.summary.replace('Ligeiramente ', ''), 0, 150, 30, 170)

        ctx.font = '25px "RobotoCondensed-Light"'
        ctx.fillText(`${parseFloat(weather.daily.data[0].temperatureHigh.toFixed(1))} °C`, 220, 40)
        ctx.fillText(`${parseFloat(weather.daily.data[0].temperatureLow.toFixed(1))} °C`, 220, 73)
        ctx.fillText(`${parseFloat((weather.currently.humidity * 100).toFixed(1))} %`, 220, 105)
        ctx.fillText(`${parseFloat(weather.currently.windSpeed.toFixed(1))} km/h`, 220, 140)


        let daily = weather.daily.data.slice(1, 8);

        let [arrow, wind, humidity] = await images;
        let [...icons] = await iconsAwait
        let [...moonIcons] = await moonEmotes
        let graphVals = daily.map(d => parseFloat(d.temperatureHigh.toFixed(1)) + 50)

        let graph = { // max 220 min 360 -- 140
            min: Math.min(...graphVals),
            max: Math.max(...graphVals),
            values: graphVals
        }

        let graphGrd = ctx.createLinearGradient(0, 255, 0, can.y);
        graphGrd.addColorStop(0, "rgba(10, 10, 10, 0.06)");
        graphGrd.addColorStop(1, "rgba(0, 0, 0, 0.4)");

        let gVals = graph.values.map(v => (100 * (v - graph.min)) / (graph.max - graph.min))

        ctx.fillStyle = graphGrd;
        ctx.beginPath();

        ctx.lineTo(87 * 7 + 55, can.y + 10);
        ctx.lineTo(-5, can.y + 10);

        ctx.lineTo(-5, 360 - (gVals[0] * 140) / 100);

        graph.values.map(d => d - graph.min).forEach((d, i) => {
            let y = (gVals[i] * 140) / 100;
            ctx.lineTo(87 * i + 55, 360 - y);
        })

        ctx.lineTo(87 * 7 + 55, 360 - (gVals[6] * 140) / 100);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();

        ctx.fillStyle = 'white'

        ctx.textAlign = "center";
        daily.forEach((d, i) => {
            ctx.font = '20px "RobotoCondensed"'

            ctx.fillText(getTimeData(d.time, weather.timezone).format('ddd').toUpperCase(), 87 * i + 55, 210)

            let max = parseFloat(d.temperatureHigh.toFixed(1))
            let min = parseFloat(d.temperatureLow.toFixed(1))

            ctx.font = '24px "RobotoCondensed-Light"'
            ctx.fillText(`${min}°`, 87 * i + 60, 355)
            ctx.fillText(`${max}°`, 87 * i + 60, 325)

            ctx.drawImage(icons[Object.keys(forecastIcons).indexOf(d.icon)], 87 * i + 40, 220, 32, 32)
            ctx.drawImage(getMoonImage(d.moonPhase, moonIcons), 87 * i + 43, 265, 23, 23)
        })

        ctx.drawImage(icons[Object.keys(forecastIcons).indexOf(weather.currently.icon)], 30, 10, 110, 110)

        ctx.drawImage(arrow, 190, 16, 28, 30)

        ctx.save()
        ctx.translate(218, 80)
        ctx.rotate(Math.PI)
        ctx.drawImage(arrow, 0, 0, 28, 30)
        ctx.restore()

        ctx.drawImage(humidity, 190, 81, 28, 30)
        ctx.drawImage(wind, 190, 114, 28, 30)

        let embed = new MessageEmbed()
            .setAuthor(weather.currently.summary, forecastIcons[weather.currently.icon].img)
            .setDescription(`${result.formatted_address}`)
            .setColor(c[1])
            .setFooter('Powered by Dark Sky')
            .setImage('attachment://weather.png');

        m.send({ embed: embed, files: [new MessageAttachment(canvas.toBuffer(), "weather.png")] }, null, true)
    } else sendNotFoundEmbed()



})

module.exports.init = cmd