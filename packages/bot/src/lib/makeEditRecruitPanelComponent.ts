import {
	type DataStoreInterface,
	type RecruitInfo,
	type RecruitTriggers,
	getRecruit,
	getRecruitByTitle,
	getRecruitTriggeres,
} from '@recruit/db';
import { sendMessageThenDelete } from '@recruit/lib';
import {
	type APIRole,
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type ChatInputCommandInteraction,
	type ContainerBuilder,
	type Guild,
	type MessageActionRowComponentBuilder,
	type Role,
	channelMention,
} from 'discord.js';
import { addSeparatorBuilder } from '../components/addSeparator';
import { addTextDisplay } from '../components/addTextDisplay';
import {
	makeBottomButtonPanelEditComponent,
	makeRightButtonPanelEditComponent,
} from '../components/editRecruitPanel';
import { unitToJp } from './convert';

export const makeEditRecruitPanelComponent = async (
	interaction: ChatInputCommandInteraction | ButtonInteraction,
	store: DataStoreInterface,
	filter: {
		panelId?: string;
		fullMatchTitle?: string;
		guildId?: string;
	},
) => {
	const guild = interaction.guild;

	if (!guild) return;

	let component: ContainerBuilder | undefined = undefined;

	const { recruitInfo, recruitTriggers } = await store.do(async (db) => {
		let recruitInfo: RecruitInfo | undefined = undefined;
		let recruitTriggers: RecruitTriggers = [];

		if (filter.fullMatchTitle !== undefined) {
			recruitInfo = await getRecruitByTitle(db, {
				fullMatchTitle: filter.fullMatchTitle,
				guildId: filter.guildId,
			});
		} else {
			recruitInfo = await getRecruit(db, { panelId: filter.panelId });
		}

		if (!recruitInfo) return { recruitInfo, recruitTriggers };

		recruitTriggers = await getRecruitTriggeres(db, {
			recruitInfoId: recruitInfo.id,
		});

		return { recruitInfo, recruitTriggers };
	});

	if (!recruitInfo) {
		sendMessageThenDelete({
			sleepSecond: 15,
			content: 'データの取得に失敗しました。もう一度実行してみてください。',
		});
		return;
	}

	if (recruitInfo.isSplitButtonLine) {
		const description = recruitInfo.panelInfo.description;

		const bottomComponent = makeBottomButtonPanelEditComponent(
			recruitInfo.panelInfo.title,
			description,
			recruitInfo.panelId,
			recruitInfo.panelInfo.bottomButtons,
		);

		component = bottomComponent.component;
	} else if (!recruitInfo.isSplitButtonLine) {
		const description = recruitInfo.panelInfo.description;

		const rightComponent = makeRightButtonPanelEditComponent(
			recruitInfo.panelInfo.title,
			description,
			recruitInfo.panelId,
			recruitInfo.panelInfo.rightButtons,
		);

		component = rightComponent.component;
	}

	if (!component) {
		sendMessageThenDelete(
			{
				content:
					'不明なエラーが発生しました。コマンドをもう一度実行してみてください。',
				sleepSecond: 15,
			},
			interaction,
		);
		return;
	}

	const autoSendSection = createAutoSendSectionComponent(
		guild,
		recruitInfo,
		recruitInfo.panelInfo.id,
		recruitTriggers.map((x) => x.triggerId),
	);

	if (autoSendSection) {
		component.addSeparatorComponents(addSeparatorBuilder());
		component.addTextDisplayComponents(autoSendSection);
	}

	component.addSeparatorComponents(addSeparatorBuilder());

	const rows = [
		new ActionRowBuilder<MessageActionRowComponentBuilder>(),
		new ActionRowBuilder<MessageActionRowComponentBuilder>(),
	];

	//ロール追加削除。自動送信パネルに変更
	rows[0].addComponents(
		new ButtonBuilder()
			.setCustomId(`recruitpaneledit_addrole_${recruitInfo.panelId}`)
			.setLabel('募集対象ロール追加')
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId(`recruitpaneledit_removerole_${recruitInfo.panelId}`)
			.setLabel('募集対象ロール削除')
			.setStyle(ButtonStyle.Danger),
		new ButtonBuilder()
			.setCustomId(`recruitpaneledit_changeauto_${recruitInfo.panelId}`)
			.setLabel('募集自動送信変更')
			.setStyle(ButtonStyle.Primary),
	);
	rows[1].addComponents(
		new ButtonBuilder()
			.setCustomId(`recruitpaneledit_editdesc_${recruitInfo.panelId}`)
			.setLabel('パネル説明変更')
			.setStyle(ButtonStyle.Secondary),
	);

	component.addActionRowComponents(rows);

	return component;
};

export const createAutoSendSectionComponent = (
	guild: Guild,
	recruitInfo: Awaited<ReturnType<typeof getRecruit>>,
	panelInfoId: number,
	triggerIds: string[],
) => {
	if (!recruitInfo) return;

	let role: Role | APIRole | undefined = undefined;

	if (!recruitInfo.isSplitButtonLine) {
		const buttonData = recruitInfo.panelInfo.rightButtons.find(
			(x) => x.recruitPanelInfoId === panelInfoId && x.isAutoSend,
		);
		if (!buttonData) return;

		role = guild.roles.cache.get(buttonData.roleId);
	} else {
		const buttonData = recruitInfo.panelInfo.bottomButtons.find(
			(x) => x.recruitPanelInfoId === panelInfoId && x.isAutoSend,
		);

		if (!buttonData) return;

		role = guild.roles.cache.get(buttonData.roleId);
	}

	if (!role) return;

	const triggerChannelMentions = triggerIds
		.map((x) => {
			const channel = guild.channels.cache.get(x);

			return channel ? channelMention(channel.id) : undefined;
		})
		.filter((x) => x !== undefined);

	return addTextDisplay(
		`# 自動募集設定\n自動送信までの時間: ${recruitInfo.autoSendInt}${unitToJp(recruitInfo.autoSendUnit)}\n自動送信対象ロール: ${role.name}\n自動送信トリガーチャンネル一覧:\n ${triggerChannelMentions}`,
	);
};
