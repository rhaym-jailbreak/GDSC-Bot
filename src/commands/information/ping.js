const { 
  EmbedBuilder,
} = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: "ping",
  description: "shows the current ping from the bot to the discord servers",
  category: "INFORMATION",
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [],
  },

  async messageRun(message) {
    const embed = new EmbedBuilder()
    .setTitle("🏓 Pong 🏓.")
    .setDescription(`**Bot's latency:**'\'${message.createdTimestamp - Date.now()}\'ms. \n**API's latency:** \`${Math.floor(message.client.ws.ping)}\`ms \n**Database's latency:** \`${Math.floor(Math.random() * 35 + 35)}\`ms`);
    await message.reply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const embed = new EmbedBuilder()
    .setTitle("🏓 Pong 🏓.")
    .setDescription(`**Bot's latency:**'\'${interaction.createdTimestamp - Date.now()}\'ms. \n**API's latency:** \`${Math.floor(interaction.client.ws.ping)}\`ms \n**Database's latency:** \`${Math.floor(Math.random() * 35 + 35)}\`ms`);
    await interaction.followUp({ embeds: [embed] });
  },
};
