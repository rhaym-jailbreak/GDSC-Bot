const { commandHandler, automodHandler, statsHandler } = require("@src/handlers");
const { PREFIX_COMMANDS, EMBED_COLORS, SUPPORT_SERVER } = require("@root/config");


const { getSettings } = require("@schemas/Guild");
const {EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder}  = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  const settings = await getSettings(message.guild);

// command handler
  let isCommand = false;
  if (PREFIX_COMMANDS.ENABLED) {
    // check for bot mentions
    if (
      message.mentions.has(client.user) &&
      message.content.trim() === `<@${client.user.id}>`
    ) {
      let components = [];
      const embed =new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(`Hello ${message.author}, my prefix is ${settings.prefix}`)
      .setTitle(`Did someone mention me?`)
      .setAuthor({ name: `Infinity Bot`, iconURL: `https://media.discordapp.net/attachments/797885804793036810/1079861523222114324/infini.png` })
      .setThumbnail(client.user.displayAvatarURL())
      .addFields({name: `Feel lost?`, value: `to view my commands list you can do command: ${settings.prefix}help or </help:1075324904305598535>`});
      components.push(new ButtonBuilder()
      .setURL(SUPPORT_SERVER)
      .setLabel("Support Server")
      .setStyle(ButtonStyle.Link));
      components.push(new ButtonBuilder()
      .setLabel("Invite Bot")
      .setStyle(ButtonStyle.Link)
      .setURL("https://discord.com/api/oauth2/authorize?client_id=1053744760705269801&permissions=8&scope=bot"));
      components.push(new ButtonBuilder()
      .setLabel("Dashboard")
      .setStyle(ButtonStyle.Link)
      .setURL("https://rhaym-tech.me/")
      .setDisabled(true));
      components.push(new ButtonBuilder()
      .setLabel("Top.gg vote")
      .setStyle(ButtonStyle.Link)
      .setURL("https://rhaym-tech.me/")
      .setDisabled(true));
      let buttonsRow = new ActionRowBuilder().addComponents(components);
      message.channel.safeSend({embeds: [embed], components: [buttonsRow]});
     }
  }
    if (message.content && message.content.startsWith(settings.prefix)) {
      const invoke = message.content.replace(`${settings.prefix}`, "").split(/\s+/)[0];
      const cmd = client.getCommand(invoke);
      if (cmd) {
        isCommand = true;
        commandHandler.handlePrefixCommand(message, cmd, settings);
      }
    }


  // stats handler
  if (settings.stats.enabled) await statsHandler.trackMessageStats(message, isCommand, settings);

  // if not a command
  if (!isCommand) await automodHandler.performAutomod(message, settings);
};
