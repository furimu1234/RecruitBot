import {
	type RemindIntervalUnitEn,
	createRecruitTrigger,
	deleteRecruitTrigger,
	editBottomButton,
	editRightButton,
	getRecruit,
	type recuritPanelBottomButton,
	type recuritPanelRightButton,
	updateRecruit,
} from '@recruit/db';
import {
	confirmDialog,
	generateRandomString,
	selector,
	sendMessageThenDelete,
} from '@recruit/lib';
import {
	type ButtonInteraction,
	ChannelType,
	Events,
	type Guild,
	type GuildBasedChannel,
	MessageFlags,
	type ModalSubmitFields,
	type Role,
	type SendableChannels,
	TextInputBuilder,
	TextInputStyle,
	channelMention,
} from 'discord.js';
import { container } from '../../../container';
import { unitToJp } from '../../../lib';
import { makeEditRecruitPanelComponent } from '../../../lib/makeEditRecruitPanelComponent';

/**
 * 自動募集設定を更新する
 */

export const name = Events.InteractionCreate;
export const once = false;
export async function execute(interaction: ButtonInteraction): Promise<void> {
	if (!container.current) return;

	const store = container.current.getDataStore();
	const customId = interaction.customId;

	if (!customId) return;

	if (!customId.startsWith('recruitpaneledit_changeauto_')) return;

	const guild = interaction.guild;

	if (!guild) return;
	const panelId = customId.split('_')[2];

	if (!interaction.channel?.isSendable()) return;

	await interaction.deferUpdate();

	const model = await store.do(async (db) => {
		return await getRecruit(db, { panelId: panelId });
	});

	if (!model) {
		sendMessageThenDelete({
			sleepSecond: 15,
			content: 'データの取得に失敗しました。もう一度実行してみてください。',
		});
		return;
	}

	let q = '自動送信までの間隔を変更しますか?\n';
	q += `現在の送信時間: ${model.autoSendInt}${unitToJp(model.autoSendUnit)}`;

	const autoSendDialog = confirmDialog(interaction.channel, q);

	autoSendDialog.setOkLabel('変更する');
	autoSendDialog.setNoLabel('変更しない');

	const isAutoSendCustomId = generateRandomString();
	//自動送信までの時間の入力欄カスタムID
	const waitAutoSendTimeCustomId = `get_auto_send_by:${generateRandomString()}`;
	const waitAutoSendTimeUnitCustomId = `get_auto_send_unit_by:${generateRandomString()}`;

	const autoSendModalResult = await autoSendDialog.sendWithModal(
		true,
		interaction,
		{
			customId: isAutoSendCustomId,
			title: '自動送信時間変更ダイアログ',
			fields: [
				new TextInputBuilder()
					.setLabel('自動送信までの時間(数値のみ)')
					.setCustomId(waitAutoSendTimeCustomId)
					.setStyle(TextInputStyle.Short)
					.setMaxLength(10)
					.setRequired(true),
				new TextInputBuilder()
					.setLabel('自動送信までの時間(hもしくはm)')
					.setCustomId(waitAutoSendTimeUnitCustomId)
					.setStyle(TextInputStyle.Short)
					.setMaxLength(1)
					.setRequired(true),
			],
		},
	);

	if (autoSendModalResult.isCancel) {
		sendMessageThenDelete(
			{
				sleepSecond: 15,
				content: '自動送信時間は変更しません。',
			},
			interaction,
		);
		return;
	}

	let settingContent = `- 募集パネル作成チャンネル: ${channelMention(model.sendChannelId)}\n`;
	settingContent += `- パネルタイプ: ${model.isSplitButtonLine ? 'パネル種類2' : 'パネル種類1'}\n`;
	settingContent += `- 募集がなかった場合の自動送信有効状況: ${autoSendModalResult.isAutoSend ? '自動送信する' : '自動送信しない'}\n`;

	let triggerChannels: GuildBasedChannel[] = [];
	let autoSendRole: Role | undefined = undefined;
	let autoSendInt: number | undefined = undefined;
	let autoSendUnit: RemindIntervalUnitEn | undefined = undefined;

	if (autoSendModalResult.isAutoSend) {
		const autoSendInfo = getAutoSendValue(
			interaction,
			autoSendModalResult.modalFields,
			{
				waitAutoSendTime: waitAutoSendTimeCustomId,
				waitAutoSendTimeUnit: waitAutoSendTimeUnitCustomId,
			},
		);
		autoSendInt = autoSendInfo.autoSendInt;
		autoSendUnit = autoSendInfo.autoSendUnit;

		//どっちかがundefinedの場合は処理終了
		if (autoSendInt === undefined || autoSendUnit === undefined) return;

		settingContent += `- 自動送信までの時間: ${autoSendInt}${unitToJp(autoSendUnit)}`;
		//トリガーチャンネルを再設定(全削除して再登録)
		//ここで削除しないと削除用の機能を作らないといけない
		//自動募集対象ロールがなければ処理終了

		const selectTriggerResult = await selectTriggerChannelsWithRole(
			interaction.channel,
			guild,
			settingContent,
			{
				bottoms: model.isSplitButtonLine ? model.panelInfo.bottomButtons : [],
				rights: model.isSplitButtonLine ? [] : model.panelInfo.rightButtons,
			},
		);

		triggerChannels = selectTriggerResult.triggerChannels;
		autoSendRole = selectTriggerResult.autoSendRole;
	}

	if (!autoSendRole) return;

	await store.do(async (db) => {
		if (model.isSplitButtonLine) {
			await Promise.all(
				model.panelInfo.bottomButtons.map(async (x) => {
					await editBottomButton(db, model.panelInfo.id, x.roleId, {
						isAutoSend: false,
					});
				}),
			);

			await editBottomButton(db, model.panelInfo.id, autoSendRole.id, {
				isAutoSend: true,
			});
		} else {
			await Promise.all(
				model.panelInfo.rightButtons.map(async (x) => {
					await editRightButton(db, model.panelInfo.id, x.roleId, {
						isAutoSend: false,
					});
				}),
			);

			await editRightButton(db, model.panelInfo.id, autoSendRole.id, {
				isAutoSend: true,
			});
		}

		await deleteRecruitTrigger(db, { recruitInfoId: model.id });

		await createRecruitTrigger(
			db,
			triggerChannels.map((x) => {
				return {
					recruitInfoId: model.id,
					triggerId: x.id,
				};
			}),
		);

		await updateRecruit(db, {
			id: model.id,
			autoSendInt: autoSendInt,
			autoSendUnit: autoSendUnit,
		});
	});

	const component = await makeEditRecruitPanelComponent(interaction, store, {
		fullMatchTitle: model.panelInfo.title,
		guildId: guild.id,
	});

	if (!component) return;

	await interaction.editReply({
		components: [component],
		flags: MessageFlags.IsComponentsV2,
	});

	let content = '以下の通りに変更したよ!\n';
	content += `自動募集対象ロール: ${autoSendRole.name}\n`;
	content += `自動募集までの時間: ${autoSendInt}${unitToJp(autoSendUnit as RemindIntervalUnitEn)}\n`;
	content += `トリガーチャンネル一覧:\n ${triggerChannels.map((x) => channelMention(x.id)).join(' ')}\n`;

	sendMessageThenDelete(
		{
			sleepSecond: 15,
			content: content,
		},
		undefined,
		interaction.channel,
	);
}

/**
 * モーダルに入力された自動送信までの時間を取得する
 * @param interaction interaction
 * @param modalFields modal
 * @param customId フィールドのcustomId
 * @returns
 */
export const getAutoSendValue = (
	interaction: ButtonInteraction,
	modalFields: ModalSubmitFields,
	customId: { waitAutoSendTime: string; waitAutoSendTimeUnit: string },
) => {
	let autoSendUnit: RemindIntervalUnitEn | undefined = undefined;
	let autoSendInt: number | undefined = undefined;

	const autoSendTimeField = modalFields
		.getField(customId.waitAutoSendTime)
		.value.trim();
	const autoSendTimeUnitField = modalFields.getField(
		customId.waitAutoSendTimeUnit,
	).value;

	//単位がh,m以外の場合は処理終了
	if (!['h', 'm'].includes(autoSendTimeUnitField.toLocaleLowerCase())) {
		sendMessageThenDelete(
			{
				content: 'hもしくはmで入力してください。処理をキャンセルしました。',
				sleepSecond: 15,
			},
			interaction,
		);
		return { autoSendInt, autoSendUnit };
	}
	//数値に数字以外が入力されたら処理終了
	if (!Number.parseInt(autoSendTimeField)) {
		sendMessageThenDelete(
			{
				content:
					'自動送信までの時間(数値のみ)は数字以外を入力しないでください。処理をキャンセルしました。',
				sleepSecond: 15,
			},
			interaction,
		);
		return { autoSendInt, autoSendUnit };
	}

	autoSendUnit = autoSendTimeUnitField.toLowerCase() as 'h' | 'm';
	autoSendInt = Number.parseInt(autoSendTimeField);

	return { autoSendUnit, autoSendInt };
};

export const selectTriggerChannelsWithRole = async (
	interactionChannel: SendableChannels,
	guild: Guild,
	question: string,
	buttonData: {
		rights: (typeof recuritPanelRightButton.$inferSelect)[];
		bottoms: (typeof recuritPanelBottomButton.$inferSelect)[];
	},
) => {
	let triggerChannels: GuildBasedChannel[] = [];
	let autoSendRole: Role | undefined = undefined;

	//vc or カテゴリーチャンネルID指定
	const VCSelector = selector(
		interactionChannel,
		`自動送信のトリガーとなるVCもしくはカテゴリーを複数選択してください。(最大:20チャンネルで登録済みのトリガーチャンネルも再度登録してください。)\n\n※すでに設定がある場合はスキップされ、以下の設定は共有されます。\n\n${question}`,
	);
	VCSelector.setMaxSize(20);

	triggerChannels = await VCSelector.channel(
		guild,
		ChannelType.GuildVoice,
		ChannelType.GuildCategory,
	);

	let options: { name: string; value: string }[] = [];

	if (buttonData.bottoms.length > 0) {
		options = buttonData.bottoms
			.map((x) => {
				const role = guild.roles.cache.get(x.roleId);
				if (!role) return;

				return {
					name: role.name,
					value: x.roleId,
				};
			})
			.filter((x) => !!x);
	} else {
		options = buttonData.rights
			.map((x) => {
				const role = guild.roles.cache.get(x.roleId);
				if (!role) return;
				return {
					name: role.name,
					value: x.roleId,
				};
			})
			.filter((x) => !!x);
	}

	const autoSendReuritRoleSelector = selector(
		interactionChannel,
		'自動でどのロールに募集しますか？1つ選んでください。',
	);

	const autoSendRoles = await autoSendReuritRoleSelector.string(
		'自動送信するロールを選んでね!',
		options,
	);

	if (autoSendRoles.length === 0) {
		sendMessageThenDelete(
			{
				content: '自動募集するロールが見つかりませんでした。処理を終了します。',
				sleepSecond: 15,
			},
			undefined,
			interactionChannel,
		);
		return { triggerChannels, autoSendRole };
	}
	const roleId = autoSendRoles[0];
	autoSendRole = guild.roles.cache.get(roleId);

	return { triggerChannels, autoSendRole };
};
