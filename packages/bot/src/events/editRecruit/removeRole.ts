import { getRecruit, removeBottomButton, removeRightButton } from '@recruit/db';
import { sendMessageThenDelete } from '@recruit/lib';
import {
	ActionRowBuilder,
	type ButtonInteraction,
	type CacheType,
	ComponentType,
	Events,
	MessageFlags,
	RoleSelectMenuBuilder,
	type RoleSelectMenuInteraction,
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

	if (!customId.startsWith('recruitpaneledit_removerole_')) return;

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

	let maxSize = recruitInfo.panelInfo.bottomButtons.length;

	if (!recruitInfo.isSplitButtonLine) {
		maxSize = recruitInfo.panelInfo.rightButtons.length;
	}

	const menu = new RoleSelectMenuBuilder()
		.setCustomId('role_select')
		.setPlaceholder('削除するロールを選んでください')
		.setMaxValues(maxSize)
		.setMinValues(1);

	const row = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(menu);

	// セレクトメニューを送信
	const _reply = await interaction.channel.send({
		content: `削除するロールを選んでください※最大${maxSize}個`,
		components: [row],
	});
	const reply = await _reply.fetch();

	let selection: RoleSelectMenuInteraction<CacheType> | undefined = undefined;

	try {
		selection = await reply.awaitMessageComponent({
			componentType: ComponentType.RoleSelect,
			time: 3 * 60 * 1000,
		});
		await selection.deferUpdate();
		await selection.deleteReply();
	} catch (error) {}

	if (!selection) {
		sendMessageThenDelete({
			sleepSecond: 15,
			content: '3分間ロールの選択がないためキャンセルされました。',
		});
		return;
	}

	const selectedRoleIds = selection.values;

	const selectedRoles = selectedRoleIds
		.map((x) => {
			return guild.roles.cache.get(x);
		})
		.filter((x) => !!x);

	await store.do(async (db) => {
		if (recruitInfo.isSplitButtonLine) {
			await removeBottomButton(
				db,

				recruitInfo.panelId,
				selectedRoles,
			);
		} else {
			await removeRightButton(db, recruitInfo.panelId, selectedRoles);
		}
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
