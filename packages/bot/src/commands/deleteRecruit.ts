import {
	deleteBottomButton,
	deletePanelInfo,
	deleteRecruitInfo,
	deleteRightButton,
	getRecruitByTitle,
} from '@recruit/db';
import { confirmDialog, sendMessageThenDelete } from '@recruit/lib';
import { type Interaction, SlashCommandBuilder } from 'discord.js';
import { container } from '../container';
export const data = new SlashCommandBuilder()
	.setName('募集パネル削除')
	.setDescription('募集設定を削除します')
	.addStringOption((option) =>
		option
			.setName('募集パネルタイトル')
			.setDescription('削除するパネルのタイトルを選択します。')
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

	if (!interaction.channel.isSendable()) return;

	const deleteCheckDialog = confirmDialog(
		interaction.channel,
		`本当に${title}を削除しますか？`,
	);

	const isRun = await deleteCheckDialog.send(true);

	if (!isRun) {
		sendMessageThenDelete({
			sleepSecond: 15,
			content: '削除をキャンセルしました。',
		});
		return;
	}

	const store = container.current.getDataStore();

	await store.do(async (db) => {
		const model = await getRecruitByTitle(db, {
			fullMatchTitle: title,
			guildId: guild.id,
		});

		if (!model) {
			sendMessageThenDelete({
				sleepSecond: 15,
				content:
					'DBの取得に失敗しました。時間をおいてもう一度実行してみてください。',
			});
			return;
		}

		await deleteRightButton(db, { recruitPanelInfoId: model.panelInfo.id });
		await deleteBottomButton(db, { recruitPanelInfoId: model.panelInfo.id });
		await deletePanelInfo(db, { id: model.panelInfo.id });
		await deleteRecruitInfo(db, { id: model.panelInfo.id });
	});

	await interaction.followUp({
		content: '削除しました。',
	});
}
