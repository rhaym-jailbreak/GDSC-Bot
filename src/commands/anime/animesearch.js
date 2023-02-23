const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const malScraper = require('mal-scraper');

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
    name: "animesearch",
    description: "search an anime",
    enabled: true,
    category: "ANIME",
    cooldown: 5,
    command: {
      enabled: true,
      minArgsCount: 1,
      usage: "[anime]",
    },
    slashCommand: {
      enabled: true,
      options: [
        {
          name: "anime",
          description: "anime name in english or japanese",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  
    async messageRun(message, args) {
      const search = args.join(" ");
      if (!search) return message.reply("Please enter an anime name to search.");
  
      const malEmbed = await searchAnime(search);
      message.reply({ embeds: [malEmbed] });
    },
  
    async interactionRun(interaction) {
      const search = interaction.options.getString("anime");
      if (!search) return interaction.followUp("Please enter an anime name to search.");
    
      const malEmbed = await searchAnime(search);
      await interaction.followUp({ embeds: [malEmbed] });
    }
    
  };
  
async function searchAnime(search) {
  const data = await malScraper.getInfoFromName(search);
  
  const malEmbed = new EmbedBuilder();
  malEmbed.setColor("#ffc1cc");
  malEmbed.setAuthor({ name: `Search result for "${search}"` });
  malEmbed.addFields(
    { name: "English Title", value: data.englishTitle },
    { name: "Japanese Title", value: data.japaneseTitle },
    { name: "Type", value: data.type },
    { name: "Episodes", value: data.episodes },
    { name: "Rating", value: data.rating },
    { name: "Aired", value: data.aired },
    { name: "Score", value: data.score },
    { name: "Score Stats", value: data.scoreStats },
    { name: "Link", value: data.url },
  );
  malEmbed.setThumbnail(data.picture);
  malEmbed.setTimestamp();

  return malEmbed;
}