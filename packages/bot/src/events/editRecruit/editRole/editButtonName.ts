import { editBottomButton, editRightButton } from '@recruit/db';
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
import { makeEditRoleComponent } from '../../../components/editRecruitPanel';
import { container } from '../../../container';
import { getButtonData } from '../../../lib/buttonData';

export const name = Events.InteractionCreate;
export const once = false;
export async function execute(interaction: ButtonInteraction): Promise<void> {
	if (!container.current) return;

	const store = container.current.getDataStore();
	const customId = interaction.customId;

	if (!customId) return;

	if (!customId.startsWith('editbuttonname_')) return;

	const guild = interaction.guild;

	if (!guild) return;
	const panelId = customId.split('_')[2];
	const roleId = customId.split('_')[1];
	console.log(customId);
	if (!interaction.channel?.isSendable()) return;

	await interaction.deferUpdate();

	const dbData = await getButtonData(store, {
		panelId: panelId,
		roleId: roleId,
	});
	console.log(dbData);

	if (!dbData) {
		sendMessageThenDelete(
			{
				sleepSecond: 15,
				content: 'データの取得に失敗しました。もう一度実行してみてください。',
			},
			interaction,
		);
		return;
	}
	if (!dbData.buttonData.recruitPanelInfoId) {
		sendMessageThenDelete(
			{
				sleepSecond: 15,
				content: 'データの取得に失敗しました。もう一度実行してみてください。',
			},
			interaction,
		);
		return;
	}
	const buttonData = dbData.buttonData;

	const role = guild.roles.cache.get(buttonData.roleId);

	if (!role) {
		sendMessageThenDelete(
			{
				sleepSecond: 15,
				content: 'データの取得に失敗しました。もう一度実行してみてください。',
			},
			interaction,
		);
		return;
	}

	const recruitPanelInfoId = buttonData.recruitPanelInfoId;

	if (!recruitPanelInfoId) {
		sendMessageThenDelete(
			{
				sleepSecond: 15,
				content: 'データの取得に失敗しました。もう一度実行してみてください。',
			},
			interaction,
		);
		return;
	}

	const randomString = generateRandomString();
	const bNrandomString = generateRandomString();

	const dialog = confirmDialog(
		interaction.channel,
		`ボタン名を編集しますか？\n現在のボタン名: ${buttonData.name}`,
	);
	const result = await dialog.sendWithModal(false, interaction, {
		customId: `edit_name:${randomString}`,
		title: 'ボタン名編集',
		fields: [
			new TextInputBuilder()
				.setLabel('ボタン名')
				.setCustomId(`bn_${bNrandomString}`)
				.setStyle(TextInputStyle.Short)
				.setMaxLength(10)
				.setValue(buttonData.name)
				.setRequired(true),
		],
	});

	buttonData.name = result.modalFields.getField(`bn_${bNrandomString}`).value;

	await store.do(async (db) => {
		if (!dbData.recruitInfo.isSplitButtonLine) {
			return await editRightButton(db, recruitPanelInfoId, buttonData.roleId, {
				name: buttonData.name,
			});
		}

		await editBottomButton(db, recruitPanelInfoId, buttonData.roleId, {
			name: buttonData.name,
		});
	});

	const component = makeEditRoleComponent(dbData.recruitInfo.panelId, role, {
		message: buttonData.message,
		name: buttonData.name,
		style: buttonData.style,
		title: buttonData.title,
		description: buttonData.description,
		roleId: buttonData.roleId,
	});

	await interaction.editReply({
		components: [component],
		flags: MessageFlags.IsComponentsV2,
	});
}
