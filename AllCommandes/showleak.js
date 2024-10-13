const fs = require('fs');
const path = require('path');
const Discord = require("discord.js");
const { default: axios } = require('axios');
const mysql = require('mysql2');
const config = require('../configs.json')
const JSONStream = require('jsonstream');

module.exports = {
    name: "showleak",
    description: "Permet de check un leak concernant un utilisateur !",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    category: "Leak",
    options: [
        {
            type: "string",
            name: "usernameouemail",
            description: "Le nom ou email de l'utilisateur (sans ping juste le pseudo) !",
            required: true,
            autocomplete: false
        },
        {
            type: "string",
            name: "database",
            description: "La base de données à rechercher !",
            required: true,
            autocomplete: true
        },
    ],

    async run(bot, message, args) {
        const catname = args.getString('usernameouemail');
        if (!catname) return message.reply("Aucun nom pour le salon.");

        const database = args.getString('database').toLowerCase();
        if (!database) return message.reply('Choisissez une base de données !');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        let query;

        try {

            switch (database) {
                case 'doxbin':
                    const connection = mysql.createConnection({
                        host: 'localhost',
                        user: config.db_username,
                        password: config.db_password,
                        database: database
                    });

                    connection.connect(err => {
                        if (err) {
                            console.error('Error connecting to the database:', err);
                            return message.reply("Impossible de se connecter à la base de données.");
                        }
                    });
                    if (emailRegex.test(catname)) {
                        query = `
                SELECT users.username, doxed.password, users.email, HEX(users.password) as binarypass, users.admin 
                FROM users 
                LEFT JOIN doxed ON users.username = doxed.username 
                WHERE users.email = ?
            `;
                    } else {
                        query = `
                SELECT users.username, doxed.password, users.email, HEX(users.password) as binarypass, users.admin 
                FROM users 
                LEFT JOIN doxed ON users.username = doxed.username 
                WHERE users.username = ?
            `;
                    }
                    connection.execute(query, [catname], async (err, results) => {
                        if (err) {
                            console.error('Error executing query:', err);
                            return message.reply("Une erreur est survenue lors de la requête.");
                        }

                        if (results.length === 0) {
                            return message.reply(`Aucune donnée trouvée pour l'utilisateur \`${catname}\` dans la base de données \`${database}\`.`);
                        }

                        const user = results[0];
                        const passwordBinary = user.binarypass;
                        const passwordString = `_binary 0x${passwordBinary}`
                        const embed = new Discord.EmbedBuilder()
                            .setColor("Red")
                            .setAuthor({ name: bot.user.tag, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
                            .setTitle(`Informations sur l'utilisateur : ${catname} `)
                            .setDescription("Leak de doxbin !")
                            .setTimestamp()
                            .addFields(
                                { name: "**Email leaké** :", value: `- Email : ${user.email}` },
                                { name: "**Mot de passe leaké**:", value: `- Mot de passe: ${user.password || 'Non disponible'}` },
                                { name: "**Binary password** :", value: `- Binary : ${passwordString}` },
                                { name: "**Is Admin**: ", value: `${user.admin == 0 ? "non" : "oui"}` }
                            )
                            .setImage("https://i.ibb.co/Lv2KMzc/doxbinlogo.jpg");
                        await message.reply({ embeds: [embed] });

                    });
                    connection.end(err => {
                        if (err) {
                            console.error('Error closing the database connection:', err);
                        }
                    });
                    break;
                case 'wakanim':
                    handleWakanim(catname, message, emailRegex);
                    break;
                default:
                    message.reply('Pas de base de données !')
                    break;
            }
        } catch (error) {
            console.error('Error:', error);
            return message.reply("Une erreur est survenue !");
        }
    }
};

function handleWakanim(catname, message, emailRegex) {
    const filePath = path.join(__dirname, '../wakanim_db.json');
    let userFound = false;


    const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    const parser = JSONStream.parse('*');

    stream.pipe(parser)
        .on('data', async (user) => {
            const usernameOrEmail = emailRegex.test(catname) ? user.email : user.username;


            if (usernameOrEmail === catname) {
                userFound = true;

                const embed = new Discord.EmbedBuilder()
                    .setColor("Blue")
                    .setAuthor({ name: bot.user.tag, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
                    .setTitle(`Informations sur l'utilisateur : ${catname} `)
                    .setDescription("Leak de Wakanim !")
                    .setTimestamp()
                    .addFields(
                        { name: "**Email** :", value: `- Email : ${user.email}` },
                        { name: "**Statut d'abonnement**:", value: `- Statut : ${user.subStatus}` },
                        { name: "**Date de fin de l'abonnement**:", value: `- Fin : ${user.SVODEndDate || 'Non disponible'}` },
                        { name: "**Pays**:", value: `- Pays : ${user.country || 'Non disponible'}` },
                    )
                    .setImage("https://i.ibb.co/xLSc6vH/wakanimlogo.png");

                await message.send({ embeds: [embed] });
            }
        })
        .on('end', () => {
            if (!userFound) {
                message.reply(`Aucune donnée trouvée pour l'utilisateur \`${catname}\` dans Wakanim.`);
            }
        })
        .on('error', (err) => {
            console.error('Erreur lors de la lecture du fichier JSON:', err);
            message.reply("Une erreur est survenue lors de la lecture du fichier Wakanim.");
        });
}