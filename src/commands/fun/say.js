const { ApplicationCommandOptionType } = require("discord.js");

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
        await message.channel.send(text);
      },
      async interactionRun(interaction) {
        const text = interaction.options.getString("input");
        await interaction.followUp(text);
      },
  };

  