const cleverbot = require("cleverbot-free");

util = require('util'),
color = require("ansi-color").set;
const readline = require('readline')

let rl = readline.createInterface(process.stdin, process.stdout)

function chat_command(cmd, arg) {
    if (arg) {
        bot.chat("/"+cmd+arg)
    } else { bot.chat("/"+cmd) }
    if (cmd.startsWith("!")) {
        bot.chat(cmd.substring(1))
    }
}

rl.on('line', function (line) {
        var cmd = line.match(/[a-z]+\b/)[0];
        var arg = line.substr(cmd.length+2, line.length)
        chat_command(cmd, arg)
})

// require del modulo del bot y los plugins
const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const AutoAuth = require('mineflayer-auto-auth')
const mineflayerViewer = require('prismarine-viewer').mineflayer

const fs = require('fs')
const contextfolder = '/context/'

const writeContext = async(path, content) => {
    try {
        fs.writeFileSync(__dirname+path, content)
    } catch (error) {
        console.error(error)
    }
}

const appendContext = async(path, content) => {
    try {
        fs.appendFileSync(__dirname+path, content)
    } catch (error) {
        console.error(error)
    }
}

require('dotenv').config()

const nconf = require('nconf')
nconf.file('config.json')

let options = {
    host: nconf.get('server:host'),
    port: nconf.get('server:port'),
    version: nconf.get('server:version'),
    auth: nconf.get('account:auth'),

    plugins: [AutoAuth],
    AutoAuth: {
        logging: true,
        password: 'salchichaGamer123',
        ignoreRepeat: false
      }
}

let bot = mineflayer.createBot(options)
bindEvents(bot)

function bindEvents(bot) {

    bot.on('error', function(err) {
        console.log("Bot has encountered an error")
    })

    bot.on('end', (reason) => {
        console.log("Bot has ended ("+reason+")")
        setTimeout(relog, 10000)
    })

    function relog() {
        console.log("Attempting to reconnect...")
        bot = mineflayer.createBot(options)
        bindEvents(bot)
    }

    bot.on('login', function() {
        console.log("Bot connected")
    })
}

bot.loadPlugin(pathfinder)
const RANGE_GOAL = 1

var prefix = 'bmp.'

const getResponse = async(author, inputmsg) => {
    try {
        if (fs.existsSync(__dirname+contextfolder+author)) {} else {writeContext(contextfolder+author, "")}
        const contextvalue = fs.readFileSync(__dirname+contextfolder+author)
        await cleverbot(inputmsg, contextvalue).then((response) => {
            // appendContext(contextfolder+author, response)
            console.log(response)
            bot.chat(response)
        })
    } catch (error) {
        console.error(error)
        bot.chat("Estoy saturada "+author+", pregúntame de nuevo más tarde.")
    }
}

bot.on('chat', (username, message) => {
    console.log(message)
    if (username !== bot.username) {
        if (message.startsWith('!')) {
            appendContext(contextfolder+username, message)
            getResponse(username, message)
        }
        if (message == prefix+'help') {
            bot.chat('Comandos: mine, come, stop, go')
        }
        if (message == prefix+'come') {
            const target = bot.players[username]?.entity
            if (!target) {
                bot.chat("Estás demasiado lejos, no te veo.")
            }
            else {
                const { x: playerX, y: playerY, z: playerZ } = target.position
                bot.chat("Estoy yendo pa "+target.position)
                bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL))
            }
        }
        if (message == prefix+'stop') {
            bot.pathfinder.stop
            bot.chat("Me he parao")
        }
    }
})

bot.on("message", function(message) { console.log(message.toString()) })

bot.on('goal_reached', function() {
    bot.chat("Ya he llegao")
})

bot.once('spawn', function() {
    mineflayerViewer(bot, {
        viewDistance: 10,
        port: 3000,
    })
})

bot.once('death', function() {})