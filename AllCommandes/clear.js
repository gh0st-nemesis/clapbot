const Discord = require("discord.js")
const ms = require('ms')

module.exports = {
    name: "clear",
    description: "permet d'effacer des messages dans un channel",
    permission: Discord.PermissionFlagsBits.ManageMessages,
    dm: false,
    category: "Modération",
    options: [
        {
            type: "number",
            name: "nombre",
            description: "Le nombre de messages à supprimer !",
            required: true,
            autocomplete: false
        },
        {
            type: "channel",
            name: "salon",
            description: "Le salon où effacer les messages !",
            required: false,
            autocomplete: false
        }
        

    ],

    async run(bot, message, args) {
        let channel = args.getChannel("salon")
        if (!channel) channel = message.channel
        if (channel.id !== message.channel.id && !message.guild.channels.cache.get(channel.id)) return message.reply("Aucun salon trouvé !")

        let number = args.getNumber("nombre")
        if (parseInt(number) <= 0 || parseInt(number) > 100) return message.reply("Il faut un nombre entre `0` et `100` inclus !")

        await message.deferReply()

        try {

            let messages = await channel.bulkDelete(parseInt(number))
            await message.followUp({ content: `J'ai pu effacé \`${messages.size}\` message(s) dans le salon ${channel} !`, ephemeral: true })

        } catch (error) {

            let messages = [...(await channel.messages.fetch()).filter(m => !m.interaction && (Date.now() - m.createdAt) <= 1209600000).values()]
            if (messages.length <= 0) return message.followUp("Messages datant de + de 14 jours impossible de les effacer")
            await channel.bulkDelete(messages)
            await message.followUp({ content: `J'ai pu effacé uniquement \`${messages.length}\` message(s) dans le salon ${channel} les autres datent de + de 14 jours !`, ephemeral: true })
        }
    }
}