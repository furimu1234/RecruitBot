import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	type MessageActionRowComponentBuilder,
	type SectionBuilder,
} from 'discord.js';
import { addSectionWithButtonBuilder } from '../addSectionWith';
import { addSeparatorBuilder } from '../addSeparator';
import type { IBottomButtonByModel } from './types';

//下にボタンがあるコンポーネントのベース
const makeBaseBottomButtonPanelComponent = (
	headerSection: SectionBuilder,
	rows: ActionRowBuilder<MessageActionRowComponentBuilder>[],
) => {
	const container = new ContainerBuilder()
		.addSectionComponents(headerSection)
		.addSeparatorComponents(addSeparatorBuilder());

	container.addActionRowComponents(...rows);

	return container;
};

/**
 * 右側にボタンがあるver.の募集パネルのコンポーネント
 * @returns
 */
export const makeBottomButtonPanelEditComponent = (
	title: string | null,
	description: string | null,
	panelId: string,
	bottomButtonOptions: IBottomButtonByModel[],
) => {
	const rows = [new ActionRowBuilder<MessageActionRowComponentBuilder>()];

	let row = 0;

	const sorted = bottomButtonOptions.sort((a, b) => {
		if (a.row !== b.row) return a.row - b.row;
		return a.col - b.col;
	});

	for (const buttonOption of sorted) {
		if (rows[row].components.length === 5) {
			rows.push(new ActionRowBuilder<MessageActionRowComponentBuilder>());
			row++;
		}

		rows[row].addComponents(
			new ButtonBuilder()
				.setCustomId(`editrole_${buttonOption.customId}`)
				.setLabel(`${buttonOption.name}の編集`)
				.setStyle(buttonOption.style),
		);
	}

	/**
	 * makeBaseBottomButtonPanelComponent(
			`${title}の編集パネル`,
			description ?? 'パネル説明',
			rows,
		),
	 */

	return {
		component: makeBaseBottomButtonPanelComponent(
			addSectionWithButtonBuilder({
				contents: [`# ${title}の編集パネル\n`, description ?? 'パネル説明'],
				buttonLabel: 'パネルに適用',
				buttonCustomId: `save_panel:${panelId}`,
				buttonStyle: ButtonStyle.Success,
			}),
			rows,
		),
	};
};
