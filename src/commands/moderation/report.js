const { ApplicationCommandOptionType } = require("discord.js");
const {reportTarget} = require("@helpers/ModUtils");

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: "report",
  description: "Report a member for breaking the rules.",
  cooldown: 10,
  category: "MODERATION",
  botPermissions: [],
  userPermissions: [],
  command: {
    enabled: false,
    aliases: ["rep"],
    usage: "<ID|@member> [reason]",
    minArgsCount: 2,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: "user",
        description: "The member you want to report.",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "reason",
        description: "The reason for the report.",
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`No user found matching ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await report(message.member, target, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await report(interaction.member, target, reason);
    await interaction.followUp(response);
  },
};

async function report(issuer, target, reason) {
    await reportTarget(issuer, target, reason)
    return `${target.user.tag} is reported!`;
}
