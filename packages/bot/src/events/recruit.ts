import { createAutoSend, getRecruit } from '@recruit/db';
import { getMember, sendMessageThenDelete } from '@recruit/lib';
import { DiscordReplace } from '@recruit/replace';
import {
	type ButtonInteraction,
	ChannelType,
	Events,
	MessageFlags,
} from 'discord.js';
import { container } from '../container';

export const name = Events.InteractionCreate;
export const once = false;
export async function execute(interaction: ButtonInteraction): Promise<void> {
	if (!container.current) return;

	if (!interaction.guild) return;

	const customId = interaction.customId;

	if (!customId || !customId.startsWith('recruit_')) return;
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	const guild = interaction.guild;

	if (!guild) return;

	const roleId = customId.split('_')[1];
	const role = interaction.guild.roles.cache.get(roleId);

	if (!role) return;
	const member = await getMember(guild, { user: interaction.user });
	if (!member) return;
	const voiceChannel = member.voice.channel;
	if (!voiceChannel) return;

	const store = await container.current.getDataStore();

	const model = await store.do(async (db) => {
		return await getRecruit(db, { panelId: interaction.message.id });
	});

	if (!model) {
		sendMessageThenDelete(
			{
				sleepSecond: 15,
				content:
					'DBデータの取得に失敗しました。もう一度ボタンを押してみてください。',
				flags: MessageFlags.Ephemeral,
			},
			interaction,
		);
		return;
	}
	//募集送信チャンネル取得
	const channel = guild.channels.cache
		.filter((x) => x.type === ChannelType.GuildText)
		.get(model.sendChannelId);
	if (!channel) return;

	//ボタンデータ特定
	let originalMessage = '';

	const rightButtonData = model.panelInfo.rightButtons.find(
		(x) => x.customId === customId,
	);
	if (!rightButtonData) {
		const bottomButtonData = model.panelInfo.bottomButtons.find(
			(x) => x.customId === customId,
		);
		if (!bottomButtonData) return;
		originalMessage = bottomButtonData.message;
	} else {
		originalMessage = rightButtonData.message;
	}

	//メッセージ変換
	const discordReplace = DiscordReplace();

	originalMessage = discordReplace.originalChannelMention(
		originalMessage,
		voiceChannel,
	);
	originalMessage = discordReplace.originalChannelName(
		originalMessage,
		voiceChannel,
	);
	originalMessage = discordReplace.originalRoleMention(originalMessage, role);
	originalMessage = discordReplace.originalRoleName(originalMessage, role);
	originalMessage = discordReplace.originalRoleId(originalMessage, role);
	originalMessage = discordReplace.originalUserMention(
		originalMessage,
		interaction.user,
	);
	originalMessage = discordReplace.originalUserName(
		originalMessage,
		interaction.user,
	);
	originalMessage = discordReplace.originalUserId(
		originalMessage,
		interaction.user,
	);
	if (!channel.isSendable()) return;

	await channel.send({ content: originalMessage });
	await interaction.followUp({
		content: '募集を投稿しました!',
		flags: MessageFlags.Ephemeral,
	});

	if (!voiceChannel) return;
	await store.do(async (db) => {
		await createAutoSend(db, {
			targetId: voiceChannel.id,
			isSended: true,
		});
	});
}
