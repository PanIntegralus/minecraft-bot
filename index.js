const cleverbot = require("cleverbot-free");

const mineflayer = require('mineflayer')

require('dotenv').config()


const bot = mineflayer.createBot({
    username: process.env.USERNAME,
    // password: process.env.PASSWORD,
    host: 'pruebaslol.ploudos.me',
    port: '',
    version: '1.18.1',
    auth: 'microsoft'
})

// const welcome = () => {
//     bot.chat('hola buenos dia')
// }

// bot.once('spawn', welcome)

var prefix = 'bmp.'

const getResponse = async(input) => {
    await cleverbot(input).then((response) => {
        console.log(response)
        bot.chat(response)
    })
}

bot.on('chat', (username, message) => {
    if (username !== bot.username) {
        if (message.startsWith('!')) {
            getResponse(message)
        }
        if (message == prefix+'help') {
            bot.chat('Comandos: mine, come, go')
        }
        if (message == prefix+'come') {

        }
    }
})

bot.once('death', function() {})