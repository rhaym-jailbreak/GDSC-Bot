const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
  } = require("discord.js");
  const Aki = require("aki-api");
  
  const games = new Map();
  
  /**
   * @type {import("@structures/Command")}
   */
  
  module.exports = {
    name: "akimator",
    description: "akimator game",
    cooldown: 10,
    category: "FUN",
    botPermissions: ["EmbedLinks"],
    userPermissions: [],
    command: {
      enabled: true,
      aliases: ["aki"],
      usage: "[COMMAND]",
      minArgsCount: 0,
    },
    slashCommand: {
      enabled: true,
      options: [],
    },
  
    async messageRun(message, args, data) {
      const response = await aki(message);
      message.reply(response);
    },
  
    async interactionRun(interaction, data) {
      await interaction.deferReply();
      const response = await aki(interaction);
      interaction.followUp(response);
    },
  };
  
  async function aki(context) {
    let game = games.get(context.user.id);
  
    if (!game) {
      const aki = new Aki();
      await aki.start();
      games.set(context.user.id, { aki });
      game = games.get(context.user.id);
    }
  
    if (context.isCommand()) {
      game = { aki: new Aki() };
      await game.aki.start();
    }
  
    const { aki } = game;
  
    if (context.isInteraction()) {
      const button = context.customId && context.customId.startsWith("aki-");
  
      if (button) {
        const answerId = parseInt(context.customId.split("-")[1]);
        await aki.step(answerId);
  
        if (aki.progress >= 70 || aki.currentStep >= 78) {
          await aki.win();
          games.delete(context.user.id);
        }
      }
    }
  
    if (!aki || aki.currentStep >= 79 || !aki.answers || !aki.question) {
      games.delete(context.user.id);
      return "Game over";
    }
  
    const question = aki.question;
  
    const embed = new EmbedBuilder()
      .setTitle(`Question ${aki.currentStep + 1}`)
      .setDescription(question)
      .setFooter(`Progress: ${aki.progress}%`);
  
    if (aki.answers.length === 1) {
      await aki.step(0);
      await aki.win();
      games.delete(context.user.id);
  
      const guess = aki.answers[0];
  
      return `I am ${Math.floor(aki.progress)}% sure that your character is ${guess.name} (${guess.description})!`;
    }
  
    const buttons = aki.answers.map((answer, index) => {
      const label = answer.name.length > 50 ? `${answer.name.substring(0, 50)}...` : answer.name;
      return new ButtonBuilder()
        .setCustomId(`aki-${index}`)
        .setLabel(label)
        .setStyle(ButtonStyle.PRIMARY)
        .setType(ComponentType.BUTTON);
    });
  
    const row = new ActionRowBuilder().addComponents(...buttons);
  
    if (context.isCommand()) {
      return { embeds: [embed], components: [row] };
    } else {
      await context.editReply({ embeds: [embed], components: [row] });
    }
  }
  