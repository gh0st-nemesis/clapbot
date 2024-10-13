const handlerSlashCommands = require('../Loader/handlerSlashCommands')

module.exports = async bot => {
    await handlerSlashCommands(bot)
    console.clear()
    console.log("============================================")
    console.log(" ")
    console.log(`${bot.user.tag} is connected successfuly !`)
    console.log(" ")
    console.log("============================================")
}