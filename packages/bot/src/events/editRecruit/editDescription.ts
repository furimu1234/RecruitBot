import { editPanelInfo, getRecruit } from '@recruit/db';
import {
	confirmDialog,
	generateRandomString,
	sendMessageThenDelete,
} from '@recruit/lib';
import {
	type ButtonInteraction,
	Events,
	MessageFlags,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { container } from '../../container';
import { makeEditRecruitPanelComponent } from '../../lib/makeEditRecruitPanelComponent';

export const name = Events.InteractionCreate;
export const once = false;
export async function execute(interaction: ButtonInteraction): Promise<void> {
	if (!container.current) return;

	const store = container.current.getDataStore();
	const customId = interaction.customId;

	if (!customId) return;

	if (!customId.startsWith('recruitpaneledit_editdesc')) return;

	const guild = interaction.guild;

	if (!guild) return;

	const panelId = customId.split('_').slice(-1)[0];

	if (!interaction.channel?.isSendable()) return;

	await interaction.deferUpdate();

	const recruitInfo = await store.do(async (db) => {
		return await getRecruit(db, { panelId: panelId });
	});

	if (!recruitInfo) {
		sendMessageThenDelete({
			sleepSecond: 15,
			content: 'データの取得に失敗しました。もう一度実行してみてください。',
		});
		return;
	}

	const descriptionCustomId = generateRandomString();

	const editDescModal = confirmDialog(
		interaction.channel,
		'パネルの説明を変更しますか？',
	);
	const modalResult = await editDescModal.sendWithModal(true, interaction, {
		customId: generateRandomString(),
		title: 'パネル説明変更画面',
		fields: [
			new TextInputBuilder()
				.setCustomId(descriptionCustomId)
				.setLabel('パネル説明')
				.setMinLength(1)
				.setRequired(true)
				.setStyle(TextInputStyle.Paragraph)
				.setValue(recruitInfo.panelInfo.description),
		],
	});

	const description =
		modalResult.modalFields.getField(descriptionCustomId).value;

	await store.do(async (db) => {
		await editPanelInfo(db, {
			id: recruitInfo.panelInfo.id,
			description: description,
		});
	});

	const component = await makeEditRecruitPanelComponent(interaction, store, {
		panelId: panelId,
	});

	if (!component) return;

	await interaction.editReply({
		components: [component],
		flags: MessageFlags.IsComponentsV2,
	});
}
