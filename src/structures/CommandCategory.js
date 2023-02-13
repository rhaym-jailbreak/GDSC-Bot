const config = require("@root/config");

module.exports = {
  AI: {
    name: "Artificial Intelligence",
    image: "https://static.vecteezy.com/system/resources/previews/002/596/399/non_2x/machine-learning-artificial-neural-network-ai-icon-vector.jpg",
    emoji: "🧠",
  },
  ADMIN: {
    name: "Admin",
    image: "https://icons.iconarchive.com/icons/dakirby309/simply-styled/256/Settings-icon.png",
    emoji: "⚙️",
  },
  AUTOMOD: {
    name: "Automod",
    enabled: config.AUTOMOD.ENABLED,
    image: "https://icons.iconarchive.com/icons/dakirby309/simply-styled/256/Settings-icon.png",
    emoji: "🤖",
  },
  ANIME: {
    name: "Anime",
    image: "https://i.pinimg.com/originals/85/2e/fd/852efdd48e85132a507698f8ae4b224e.jpg",
    emoji: "🎨",
  },
  ECONOMY: {
    name: "Economy",
    enabled: config.ECONOMY.ENABLED,
    image: "https://icons.iconarchive.com/icons/custom-icon-design/pretty-office-11/128/coins-icon.png",
    emoji: "🪙",
  },
  FUN: {
    name: "Fun",
    image: "https://venngage-wordpress.s3.amazonaws.com/uploads/2022/09/meme_sad_frog.png",
    emoji: "😂",
  },
  GIVEAWAY: {
    name: "Giveaway",
    enabled: config.GIVEAWAYS.ENABLED,
    image: "https://cdn-icons-png.flaticon.com/512/5671/5671927.png",
    emoji: "🎉",
  },
  IMAGE: {
    name: "Image",
    enabled: config.IMAGE.ENABLED,
    image: "https://winaero.com/blog/wp-content/uploads/2019/09/Photos-app-icon-256-colorful.png",
    emoji: "🖼️",
  },
  INVITE: {
    name: "Invite",
    enabled: config.INVITE.ENABLED,
    image: "https://invite.gg/assets/invite_white.png",
    emoji: "📨",
  },
  INFORMATION: {
    name: "Information",
    image: "https://icons.iconarchive.com/icons/graphicloads/100-flat/128/information-icon.png",
    emoji: "🪧",
  },
  MODERATION: {
    name: "Moderation",
    enabled: config.MODERATION.ENABLED,
    image: "https://icons.iconarchive.com/icons/lawyerwordpress/law/128/Gavel-Law-icon.png",
    emoji: "🔨",
  },
  MUSIC: {
    name: "Music",
    enabled: config.MUSIC.ENABLED,
    image: "https://icons.iconarchive.com/icons/wwalczyszyn/iwindows/256/Music-Library-icon.png",
    emoji: "🎵",
  },
  OWNER: {
    name: "Owner",
    image: "https://www.pinclipart.com/picdir/middle/531-5318253_web-designing-icon-png-clipart.png",
    emoji: "🤴",
  },
  SOCIAL: {
    name: "Social",
    image: "https://icons.iconarchive.com/icons/dryicons/aesthetica-2/128/community-users-icon.png",
    emoji: "🫂",
  },
  STATS: {
    name: "Statistics",
    enabled: config.STATS.ENABLED,
    image: "https://icons.iconarchive.com/icons/graphicloads/flat-finance/256/dollar-stats-icon.png",
    emoji: "📈",
  },
  SUGGESTION: {
    name: "Suggestion",
    enabled: config.SUGGESTIONS.ENABLED,
    image: "https://cdn-icons-png.flaticon.com/512/1484/1484815.png",
    emoji: "📝",
  },
  TICKET: {
    name: "Ticket",
    enabled: config.TICKET.ENABLED,
    image: "https://icons.iconarchive.com/icons/custom-icon-design/flatastic-2/512/ticket-icon.png",
    emoji: "🎫",
  },
  UTILITY: {
    name: "Utility",
    image: "https://icons.iconarchive.com/icons/blackvariant/button-ui-system-folders-alt/128/Utilities-icon.png",
    emoji: "🛠",
  },
};
