import { SapphireClient } from '@sapphire/framework';
import { Client, GuildMember, Interaction, Message, MessageButton, MessageButtonStyle, MessageEmbed } from 'discord.js';
import { token } from './config.json';

process.on('unhandledRejection', (err: Error) => console.error(err.stack));

// @ts-expect-error
Client.prototype._eval = undefined;

const client = new SapphireClient({
	defaultPrefix: '!',
	intents: ['GUILDS', 'GUILD_MESSAGES'],
	partials: ['MESSAGE', 'CHANNEL'],
	caseInsensitiveCommands: true,
	ws: {
		properties: { $browser: 'Discord iOS' },
	},
});

client.once('ready', () => {
	console.log('YogaBot is online');
});

client.on('interactionCreate', (interaction: Interaction) => {
	if(interaction.isCommand()) {
		if(interaction.commandName === 'buttons') {
			const button = new MessageButton()
				.setCustomId('1234');

			if(interaction.options.get('label')?.value && (interaction.options.get('label')?.value as string).length < 81) {
				button.setLabel(interaction.options.get('label')?.value as string);
			}
			else {button.setLabel('button!');}

			if(interaction.options.get('disabled')) {
				button.setDisabled(interaction.options.getBoolean('disabled', true))
					.setStyle(interaction.options.getString('style', true) as MessageButtonStyle);

				interaction.reply({ content: 'here\'s your custom button!', components:  [{ type: 'ACTION_ROW', components: [button] }], ephemeral: true });
			}
			else {
				button.setDisabled(false)
					.setStyle(interaction.options.getString('style', true) as MessageButtonStyle);

				interaction.reply({ content: 'here\u0027s your custom button!', components:  [{ type: 'ACTION_ROW', components: [button] }], ephemeral: true });
			}
		}
	}
	else if(interaction.isButton()) {
		if (interaction.user.id === interaction.customId.split('-')[1]) (interaction.message as Message).delete();
	}
	else if(interaction.isContextMenu()) {
		const user = interaction.options.getMember('user', true) as GuildMember;
		const arr: string[] = [];

		user.roles.cache.forEach(e => arr.push(e.toString()));

		const embed = new MessageEmbed()
			.setTitle(`${user.user.username}'s profile`)
			.setDescription(`
			bot: ${user.user.bot}
			created at: <t:${Math.floor(user.user.createdTimestamp / 1000)}:F> or <t:${Math.floor(user.user.createdTimestamp / 1000)}:R>
			discriminator: ${user.user.discriminator}
			joined at: <t:${Math.floor(user.joinedTimestamp! / 1000)}:F> or <t:${Math.floor(user.joinedTimestamp! / 1000)}:R>
			roles: ${arr}`)
			.setThumbnail(user.user.displayAvatarURL({ size: 2048, dynamic: true }));

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}
});

client.on('messageUpdate', async (oldMessage, newMessage): Promise<void> => {
	if (newMessage.content === oldMessage.content) return;

	if (oldMessage.partial || newMessage.partial) await newMessage.fetch();

	client.emit('message', newMessage as Message);
});

declare module '@sapphire/pieces' {
	interface Container {
		owo: string
	}
}

client.login(token);
