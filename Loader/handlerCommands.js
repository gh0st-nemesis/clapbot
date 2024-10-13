const fs = require('fs')

module.exports = async bot => {
    fs.readdirSync("./AllCommandes").filter(f => f.endsWith(".js")).forEach(async file => {
        let command = require(`../AllCommandes/${file}`)
        if(!command.name || typeof command.name !== "string") throw new TypeError(`[-] - Command ${file.slice(0, file.length - 3)} doesn't have a name !`)
        bot.commands.set(command.name, command)
        console.log(`[+] - Commande ${file} loaded successfuly !`)    
    })
}