import { getRecruit } from '@recruit/db';
import { sendMessageThenDelete } from '@recruit/lib';
import {
	type ButtonInteraction,
	type ContainerBuilder,
	Events,
	MessageFlags,
} from 'discord.js';
import { makeEditRoleComponent } from '../../../components/editRecruitPanel';
import { container } from '../../../container';

export const name = Events.InteractionCreate;
export const once = false;
export async function execute(interaction: ButtonInteraction): Promise<void> {
	if (!container.current) return;

	const store = container.current.getDataStore();
	const customId = interaction.customId;

	if (!customId) return;

	if (!customId.startsWith('editrole_')) return;

	const guild = interaction.guild;

	if (!guild) return;
	const panelId = customId.split('_')[3];
	const targetCustomId = `${customId.split('_')[1]}_${customId.split('_')[2]}_${customId.split('_')[3]}`;

	if (!interaction.channel?.isSendable()) return;

	await interaction.reply({ content: '編集パネルを作成しています...' });

	const recruitInfo = await store.do(async (db) => {
		return await getRecruit(db, { panelId: panelId });
	});
	console.log(recruitInfo);

	if (!recruitInfo) {
		sendMessageThenDelete(
			{
				sleepSecond: 15,
				content: 'データの取得に失敗しました。もう一度実行してみてください。',
			},
			interaction,
		);
		return;
	}

	let component: ContainerBuilder | undefined = undefined;

	if (recruitInfo.isSplitButtonLine) {
		const buttonData = recruitInfo.panelInfo.bottomButtons.find(
			(x) => x.customId === targetCustomId,
		);
		console.log(targetCustomId);
		if (!buttonData) return;

		const role = guild.roles.cache.get(buttonData.roleId);

		if (!role) {
			sendMessageThenDelete(
				{
					sleepSecond: 15,
					content: 'ロールの取得に失敗しました。もう一度実行してみてください。',
				},
				interaction,
			);
			return;
		}

		component = makeEditRoleComponent(recruitInfo.panelId, role, {
			message: buttonData.message,
			name: buttonData.name,
			style: buttonData.style,
			roleId: buttonData.roleId,
		});
	} else {
		const buttonData = recruitInfo.panelInfo.rightButtons.find(
			(x) => x.customId === targetCustomId,
		);
		console.log(targetCustomId);

		if (!buttonData) return;

		const role = guild.roles.cache.get(buttonData.roleId);

		if (!role) {
			sendMessageThenDelete(
				{
					sleepSecond: 15,
					content: 'ロールの取得に失敗しました。もう一度実行してみてください。',
				},
				interaction,
			);
			return;
		}

		component = makeEditRoleComponent(recruitInfo.panelId, role, {
			message: buttonData.message,
			name: buttonData.name,
			style: buttonData.style,
			title: buttonData.title,
			description: buttonData.description,
			roleId: buttonData.roleId,
		});
	}

	if (!component) return;

	await interaction.editReply({
		content: null,
		components: [component],
		flags: MessageFlags.IsComponentsV2,
	});
}
