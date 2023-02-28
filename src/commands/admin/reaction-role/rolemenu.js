const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton } = require('discord.js');
const { interactionRun } = require('../autorole');
/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'rolemenu',
  description: 'Creates a selection menu to assign roles',
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 0,
  },
  slashCommand: {
    enabled: true,
    options: [],
  },
  // Function to run for a regular command
  async messageRun(message, args) {
    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('select')
          .setPlaceholder('Select your role')
          .setMinValues(1)
          .setMaxValues(1)
      );
  
    const button = new MessageButton()
      .setCustomId('addRole')
      .setLabel('Add Role')
      .setStyle('PRIMARY');
  
    const messageContent = {
      content: 'Select a role:',
      components: [row],
    };
  
    if (message.member.permissions.has('MANAGE_ROLES')) {
      messageContent.components[0].addComponents(button);
    }
  
    const msg = await message.channel.send(messageContent);
  
    const filter = (i) => i.customId === 'addRole' && i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 15000 });
  
    collector.on('collect', async () => {
      const roles = message.guild.roles.cache.filter(role => !role.managed && role.name !== '@everyone').map(role => {
        return {
          label: role.name,
          value: role.id,
        };
      });
  
      if (roles.length === 0) {
        await msg.channel.send('There are no roles that can be added.');
        return;
      }
  
      const options = msg.components[0].components[0].options;
      const selectedValues = options.map(option => option.value);
  
      const newOptions = roles.filter(role => !selectedValues.includes(role.value));
  
      if (newOptions.length === 0) {
        await msg.channel.send('There are no roles that can be added.');
        return;
      }
  
      options.push(...newOptions);
  
      msg.edit({ content: 'Select a role:', components: [msg.components[0], row] });
    });
  
    collector.on('end', async () => {
      if (!msg.deleted) {
        const messageContent = {
          content: 'Selection menu closed due to inactivity.',
          components: [msg.components[0].setDisabled(true)],
        };
  
        await msg.edit(messageContent);
      }
    });
  
    const selectCollector = msg.createMessageComponentCollector({ componentType: 'SELECT_MENU', time: 15000 });
  
    selectCollector.on('collect', async interaction => {
      const selectedRole = interaction.values[0];
  
      const role = message.guild.roles.cache.get(selectedRole);
  
      if (role && !message.member.roles.cache.has(role.id)) {
        await message.member.roles.add(role.id);
        await interaction.reply({ content: `Role '${role.name}' added.`, ephemeral: true });
      }
    });
  
    selectCollector.on('end', async () => {
      if (!msg.deleted) {
        const messageContent = {
          content: 'Selection menu closed due to inactivity.',
          components: [row.setDisabled(true)],
        };
  
        await msg.edit(messageContent);
      }
    });
  },

  async interactionRun(interaction) {
    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('select')
          .setPlaceholder('Select your role')
          .setMinValues(1)
          .setMaxValues(1)
      );

    const button = new MessageButton()
      .setCustomId('addRole')
      .setLabel('Add Role')
      .setStyle('PRIMARY');

    const messageContent = {
      content: 'Select a role:',
      components: [row],
    };

    if (interaction.member.permissions.has('MANAGE_ROLES')) {
      messageContent.components[0].addComponents(button);
    }

    const msg = await interaction.reply(messageContent);

    const filter = (i) => i.customId === 'addRole' && i.user.id === interaction.user.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async () => {
      const roles = interaction.guild.roles.cache.filter(role => !role.managed && role.name !== '@everyone').map(role => {
        return {
          label: role.name,
          value: role.id,
        };
      });

      if (roles.length === 0) {
        await msg.channel.send('There are no roles that can be added.');
        return;
      }

      const options = msg.components[0].components[0].options;
      const selectedValues = options.map(option => option.value);

      const newOptions = roles.filter(role => !selectedValues.includes(role.value));

      if (newOptions.length === 0) {
        await msg.channel.send('There are no roles that can be added.');
        return;
      }

      options.push(...newOptions);

      msg.edit({ content: 'Select a role:', components: [msg.components[0], row] });
    });

    collector.on('end', async () => {
      if (!msg.deleted) {
        const messageContent = {
          content: 'Selection menu closed due to inactivity.',
          components: [msg.components[0].setDisabled(true)],
        };

        await msg.edit(messageContent);
      }
    });

    const selectCollector = msg.createMessageComponentCollector({ componentType: 'SELECT_MENU', time: 15000 });

    selectCollector.on('collect', async interaction => {
      const selectedRole = interaction.values[0];

      const role = interaction.guild.roles.cache.get(selectedRole);

      if (role && !interaction.member.roles.cache.has(role.id)) {
        await interaction.member.roles.add(role.id);
        await interaction.reply({ content: `Role '${role.name}' added.`, ephemeral: true });
      }
    });

    selectCollector.on('end', async () => {
      if (!msg.deleted) {
        const messageContent = {
          content: 'Selection menu closed due to inactivity.',
          components: [row.setDisabled(true)],
        };

        await msg.edit(messageContent);
      }
    });
  },
};