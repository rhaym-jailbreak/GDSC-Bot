const { ApplicationCommandOptionType } = require("discord.js");
var Filter = require('bad-words'),
    filter = new Filter();

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
    name: "say",
    description: "Repeats back the provided text",
    category: "FUN",
    command: {
        enabled: true,
        minArgsCount: 0,
        usage: "[input]",
      },
    slashCommand: {
      enabled: true,
      options: [
        {
          name: "input",
          description: "Text to say back",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },

    async messageRun(message, args) {
        const text = args.join(" ");
        if (!text) {
            return message.reply("Please provide some text to say!");
        }
        if (filter.isProfane(text)) {
            console.log(filter.isProfane(text));
            return message.reply("I'm sorry, but I cannot say offensive or inappropriate words, including the bad word you provided. My purpose is to assist and provide helpful features to users in a professional and respectful manner. Let's keep the conversation positive and constructive.");
       }
        await message.channel.send(filter.clean(text));
    },
      async interactionRun(interaction) {
        const text = interaction.options.getString("input");
        if (filter.isProfane(text)) {
          return interaction.followUp("I'm sorry, but I cannot say offensive or inappropriate words, including the bad word you provided. My purpose is to assist and provide helpful features to users in a professional and respectful manner. Let's keep the conversation positive and constructive.");
        }
        await interaction.followUp(text);
      },
  };

  