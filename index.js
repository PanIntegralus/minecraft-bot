const cleverbot = require("cleverbot-free");

const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')

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


const bot = mineflayer.createBot({
    username: process.env.USERNAME,
    // password: process.env.PASSWORD,
    host: 'localhost',
    port: '45743',
    version: '1.18.1',
    auth: 'microsoft'
})

bot.loadPlugin(pathfinder)
const RANGE_GOAL = 1

// const welcome = () => {
//     bot.chat('hola buenos dia')
// }

// bot.once('spawn', welcome)

var prefix = 'bmp.'

const getResponse = async(author, inputmsg) => {
    try {
        if (fs.existsSync(__dirname+contextfolder+author)) {} else {writeContext(contextfolder+author, "")}
        const contextvalue = fs.readFileSync(__dirname+contextfolder+author)
        await cleverbot(inputmsg, contextvalue).then((response) => {
            appendContext(contextfolder+author, response)
            console.log(response)
            bot.chat(response)
        })
    } catch (error) {
        console.error(error)
        bot.chat("Estoy saturada "+author+", pregúntame de nuevo más tarde.")
    }
}

bot.on('chat', (username, message) => {
    if (username !== bot.username) {
        if (message.startsWith('!')) {
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

bot.on('goal_reached', function() {
    bot.chat("Ya he llegao")
})

bot.once('death', function() {})