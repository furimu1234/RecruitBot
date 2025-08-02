import { sendMessageThenDelete } from '@recruit/lib';
import {
	type Interaction,
	MessageFlags,
	SlashCommandBuilder,
} from 'discord.js';
import { container } from '../container';
import { makeEditRecruitPanelComponent } from '../lib/makeEditRecruitPanelComponent';
export const data = new SlashCommandBuilder()
	.setName('募集パネル編集')
	.setDescription('募集パネルを編集します')
	.addStringOption((option) =>
		option
			.setName('募集パネルタイトル')
			.setDescription('編集するパネルのタイトルを選択します。')
			.setAutocomplete(true),
	);

export async function execute(interaction: Interaction) {
	if (!interaction.isChatInputCommand()) return;
	if (!container.current) return;

	const interactionChannel = interaction.channel;

	if (!interactionChannel || !interactionChannel.isSendable()) return;

	const guild = interaction.guild;

	if (!guild) return;

	await interaction.deferReply();

	const title = interaction.options.getString('募集パネルタイトル');

	if (!title || title === '-1') {
		sendMessageThenDelete({
			content: 'タイトルが指定されなかったため処理をキャンセルしました。',
			sleepSecond: 15,
		});
		return;
	}

	const store = container.current.getDataStore();

	const component = await makeEditRecruitPanelComponent(interaction, store, {
		fullMatchTitle: title,
		guildId: guild.id,
	});

	if (!component) return;

	await interaction.followUp({
		components: [component],
		flags: MessageFlags.IsComponentsV2,
	});
}
