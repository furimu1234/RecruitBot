import type { recuritPanelBottomButton } from '@recruit/db';
import {
	type APIRole,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	type MessageActionRowComponentBuilder,
	type Role,
} from 'discord.js';
import { addSeparatorBuilder } from '../addSeparator';
import { addTextDisplay } from '../addTextDisplay';

export type bottomButtonInfo = typeof recuritPanelBottomButton.$inferSelect;

//下にボタンがあるコンポーネントのベース
const makeBaseBottomButtonPanelComponent = (
	title: string,
	description: string,
	rows: ActionRowBuilder<MessageActionRowComponentBuilder>[],
) => {
	const container = new ContainerBuilder()
		.addTextDisplayComponents(addTextDisplay(`# ${title}\n${description}`))
		.addSeparatorComponents(addSeparatorBuilder());

	container.addActionRowComponents(...rows);

	return container;
};

/**
 * 右側にボタンがあるコンポーネントのサンプル
 * @returns
 */
export const makeBottomButtonExamplePanelComponent = () => {
	return makeBaseBottomButtonPanelComponent(
		'パネル種類1',
		'パネル説明\nサンプルパネル。',
		[
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId('dummy_button_custom_id')
					.setLabel('ボタンラベル1')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('dummy_button_custom_id_2')
					.setLabel('ボタンラベル2')
					.setStyle(ButtonStyle.Primary),
			),
		],
	);
};

/**
 * 右側にボタンがあるver.の募集パネルのコンポーネント
 * @returns
 */
export const makeBottomButtonPanelComponent = (
	title: string | null,
	description: string | null,
	buttonInfos: bottomButtonInfo[],
) => {
	const rows = [new ActionRowBuilder<MessageActionRowComponentBuilder>()];
	const buttons: {
		label: string;
		customId: string;
		style: ButtonStyle;
		roleId: string;
	}[] = [];

	const sorted = buttonInfos.sort((a, b) => {
		if (a.row !== b.row) return a.row - b.row;
		return a.col - b.col;
	});

	for (const buttonInfo of sorted) {
		if (buttonInfo.row > rows.length) {
			rows.push(new ActionRowBuilder<MessageActionRowComponentBuilder>());
		}

		rows[buttonInfo.row].addComponents(
			new ButtonBuilder()
				.setCustomId(buttonInfo.customId)
				.setLabel(buttonInfo.name)
				.setStyle(buttonInfo.style),
		);

		buttons.push({
			label: buttonInfo.name,
			customId: buttonInfo.customId,
			style: buttonInfo.style,
			roleId: buttonInfo.roleId,
		});
	}

	return {
		component: makeBaseBottomButtonPanelComponent(
			title ?? 'パネルタイトル',
			description ?? 'パネル説明',
			rows,
		),
		buttonsOptions: buttons,
	};
};

export const createSimpleBottomButtonInfo = (
	role: Role | APIRole,
	style: ButtonStyle,
	panelId: string,
	buttonName: string,
): bottomButtonInfo => {
	return {
		id: 0,
		col: 0,
		row: 0,
		customId: `recruit_${role.id}_${panelId}`,
		isAutoSend: false,
		message: '',
		name: buttonName,
		recruitPanelInfoId: 0,
		roleId: role.id,
		style: style,
	};
};
