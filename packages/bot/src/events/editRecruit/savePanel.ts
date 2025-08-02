import { getRecruit } from '@recruit/db';
import { sendMessageThenDelete } from '@recruit/lib';
import {
	type ButtonInteraction,
	type ContainerBuilder,
	Events,
	MessageFlags,
} from 'discord.js';
import { makeBottomButtonPanelComponent } from '../../components/recruitPanel/bottomButtonPanelComponent';
import { makeRightButtonPanelComponent } from '../../components/recruitPanel/rightButtonPanelComponent';
import { container } from '../../container';

/**
 * 募集パネルに設定を反映させる
 */

export const name = Events.InteractionCreate;
export const once = false;
export async function execute(interaction: ButtonInteraction): Promise<void> {
	if (!container.current) return;

	const store = container.current.getDataStore();
	const customId = interaction.customId;

	if (!customId) return;

	if (!customId.startsWith('save_panel:')) return;

	const guild = interaction.guild;

	if (!guild) return;
	const panelId = customId.split(':')[1];

	if (!interaction.channel?.isSendable()) return;

	await interaction.deferReply();

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

	const components: ContainerBuilder[] = [];

	if (!recruitInfo.isSplitButtonLine) {
		const componentInfo = makeRightButtonPanelComponent(
			recruitInfo.panelInfo.title,
			recruitInfo.panelInfo.description,
			recruitInfo.panelInfo.rightButtons,
		);

		components.push(componentInfo.component);
	} else {
		const componentInfo = makeBottomButtonPanelComponent(
			recruitInfo.panelInfo.title,
			recruitInfo.panelInfo.description,
			recruitInfo.panelInfo.bottomButtons,
		);

		components.push(componentInfo.component);
	}

	const sendChannel = guild.channels.cache.get(recruitInfo.sendChannelId);

	if (!sendChannel?.isSendable()) return;

	try {
		const message = await sendChannel.messages.fetch(recruitInfo.panelId);
		await message.edit({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
		await interaction.followUp({
			content: '更新に成功しました。',
		});
	} catch (e) {
		console.log(e);
		await interaction.followUp({
			content: '更新に失敗しました。時間をおいてもう一度実行してみてください。',
		});
	}
}
