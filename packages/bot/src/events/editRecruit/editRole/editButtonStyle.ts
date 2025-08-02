import { editBottomButton, editRightButton } from '@recruit/db';
import {
	generateRandomString,
	selector,
	sendMessageThenDelete,
} from '@recruit/lib';
import {
	type ButtonInteraction,
	ButtonStyle,
	Events,
	MessageFlags,
} from 'discord.js';
import { makeEditRoleComponent } from '../../../components/editRecruitPanel';
import { container } from '../../../container';
import { buttonStyleToJp } from '../../../lib';
import { getButtonData } from '../../../lib/buttonData';

/**ボタンの色を変更する */

export const name = Events.InteractionCreate;
export const once = false;
export async function execute(interaction: ButtonInteraction): Promise<void> {
	if (!container.current) return;

	const store = container.current.getDataStore();
	const customId = interaction.customId;

	if (!customId) return;

	if (!customId.startsWith('editbuttonstyle_')) return;

	const guild = interaction.guild;

	if (!guild) return;
	const panelId = customId.split('_')[2];
	const roleId = customId.split('_')[1];

	if (!interaction.channel?.isSendable()) return;

	await interaction.deferUpdate();

	const dbData = await getButtonData(store, {
		panelId: panelId,
		roleId: roleId,
	});

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

	const dialog = selector(
		interaction.channel,
		`ボタンの色を編集しますか？\n現在のボタン色: ${buttonStyleToJp(buttonData.style)}`,
	);
	dialog.setCancelMessage('編集をキャンセルしました。');
	dialog.setMaxSize(1);

	const results = await dialog.string('ボタンの色を編集してね!', [
		{
			name: '紫色',
			value: ButtonStyle.Primary.toString(),
		},
		{
			name: '灰色',
			value: ButtonStyle.Secondary.toString(),
		},
		{
			name: '緑色',
			value: ButtonStyle.Success.toString(),
		},
		{
			name: '赤色',
			value: ButtonStyle.Danger.toString(),
		},
	]);

	const result = results[0];

	buttonData.style = Number.parseInt(result);

	await store.do(async (db) => {
		if (!dbData.recruitInfo.isSplitButtonLine) {
			return await editRightButton(db, recruitPanelInfoId, buttonData.roleId, {
				style: buttonData.style,
			});
		}

		await editBottomButton(db, recruitPanelInfoId, buttonData.roleId, {
			style: buttonData.style,
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
