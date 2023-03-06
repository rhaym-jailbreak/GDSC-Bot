const { EmbedBuilder } = require("discord.js");
  
  let giveMeAJoke = require('give-me-a-joke');
  
  /**
   * @type {import("@structures/Command")}
   */
   
  module.exports = {
    name: "joke",
    description: "generates you dead ass jokes",
    cooldown: 0,
    category: "FUN",
    botPermissions: ["EmbedLinks"],
    userPermissions: [],
    command: {
      enabled: true,
      aliases: [jk],
      usage: "[COMMAND]",
      minArgsCount: 0,
    },
    slashCommand: {
      enabled: true,
      options: [],
    },
  
    async messageRun(message, args, data) {
      const joke = await jokegen(); // Call the jokegen() function to get a joke
      const embed = new EmbedBuilder()
        .setTitle("Here's a dad joke for you!")
        .setDescription(joke);
     
      await message.reply({ embeds: [embed] }).then(sentMessage => {
          sentMessage.react('😂');
          sentMessage.react('😐');
      });
    },
  
    async interactionRun(interaction, data) {
      const joke = await jokegen(); // Call the jokegen() function to get a joke
      const embed = new EmbedBuilder()
        .setTitle("Here's a dad joke for you!")
        .setDescription(joke);
      
      await interaction.followUp({ embeds: [embed] }).then(sentMessage => {
          sentMessage.react('😂');
          sentMessage.react('😐');
      });
    }
  };
  
  async function jokegen() {
    return new Promise((resolve, reject) => {
      giveMeAJoke.getRandomDadJoke(function(joke) {
        resolve(joke); // Resolve the promise with the generated joke
      });
    });
  }