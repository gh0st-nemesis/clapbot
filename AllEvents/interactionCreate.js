const Discord = require('discord.js')

module.exports = async (bot, interaction) => {

    if (interaction.type === Discord.InteractionType.ApplicationCommandAutocomplete) {
        let entry = interaction.options.getFocused()

        if (interaction.commandName === "help") {
            let choices = bot.commands.filter(cmd => cmd.name.includes(entry))
            await interaction.respond(entry === "" ? bot.commands.map(cmd => ({ name: cmd.name, value: cmd.name })) : choices.map(choice => ({ name: choice.name, value: choice.name })))
        }

        if (interaction.commandName === "showleak") {
            const focusedOption = interaction.options.getFocused(true);
            const guild = interaction.guild;
            const entry = focusedOption.value;

            if (focusedOption.name === "database") {
                
                let choices;

                
                    choices = [
                        { name: 'doxbin', value: 'doxbin' },
                        { name: "wakanim", value: 'wakanim' }
                        
                    ];
                

                
                const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(entry.toLowerCase()));
                await interaction.respond(filtered.map(choice => ({ name: choice.name, value: choice.value })));

            } 

        }

    }

    if (interaction.type === Discord.InteractionType.ApplicationCommand) {

        let command = require(`../AllCommandes/${interaction.commandName}`)
        command.run(bot, interaction, interaction.options)
    }
}