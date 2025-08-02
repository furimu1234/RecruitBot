import type { recuritPanelRightButton } from '@recruit/db';
import {
	type APIRole,
	ButtonStyle,
	ContainerBuilder,
	type Role,
	type SectionBuilder,
	roleMention,
} from 'discord.js';
import {
	addSectionWithButtonBuilder,
	type sectionWithButtonType,
} from '../addSectionWith';
import { type SeparatorType, addSeparatorBuilder } from '../addSeparator';
import { addTextDisplay } from '../addTextDisplay';

export type ISectionWithButtonBuilder = {
	section: SectionBuilder;
} & SeparatorType;

export type rightButtonInfo = typeof recuritPanelRightButton.$inferSelect;

//右にボタンがあるコンポーネントのベース
const makeBaseRightButtonPanelComponent = (
	title: string,
	description: string,
	options: ISectionWithButtonBuilder[],
) => {
	const container = new ContainerBuilder()
		.addTextDisplayComponents(addTextDisplay(`# ${title}\n${description}`))
		.addSeparatorComponents(addSeparatorBuilder());

	for (const option of options) {
		container.addSectionComponents(option.section);

		container.addSeparatorComponents(
			addSeparatorBuilder({
				spaceSize: option.spaceSize,
				isDivider: option.isDivider,
			}),
		);
	}

	return container;
};

/**
 * 右側にボタンがあるコンポーネントのサンプル
 * @returns
 */
export const makeRightButtonExamplePanelComponent = () => {
	return makeBaseRightButtonPanelComponent(
		'パネル種類2',
		'パネル説明\nサンプルパネル。',
		[
			{
				section: addSectionWithButtonBuilder({
					contents: ['## ボタンタイトル\nボタン説明'],
					buttonCustomId: 'dummy_button_custom_id_1',
					buttonLabel: 'ボタンラベル1',
					buttonStyle: ButtonStyle.Success,
				}),
			},
			{
				section: addSectionWithButtonBuilder({
					contents: ['## ボタンタイトル\nボタン説明'],
					buttonCustomId: 'dummy_button_custom_id_2',
					buttonLabel: 'ボタンラベル2',
					buttonStyle: ButtonStyle.Primary,
				}),
			},
		],
	);
};

/**
 * 右側にボタンがあるver.の募集パネルのコンポーネント
 * @returns
 */
export const makeRightButtonPanelComponent = (
	title: string | null,
	description: string | null,
	buttonInfos: rightButtonInfo[],
) => {
	const sectionProps: sectionWithButtonType[] = buttonInfos.map((x) => {
		return {
			contents: [`# ${x.title}`, x.description],
			buttonCustomId: x.customId,
			buttonLabel: x.name,
			buttonStyle: x.style,
			roleId: x.roleId,
		};
	});

	return {
		component: makeBaseRightButtonPanelComponent(
			title ?? 'パネルタイトル',
			description ?? 'パネル説明',
			sectionProps.map((x) => {
				return { section: addSectionWithButtonBuilder(x) };
			}),
		),
		sections: sectionProps,
	};
};
export const createRightButtonInfoHelper = (
	role: Role | APIRole,
	style: ButtonStyle,
	panelId: string,
	buttonName: string,
): rightButtonInfo => {
	return {
		title: role.name,
		description: `右にある\`${buttonName}\`ボタンを押すと${roleMention(role.id)}に通知が飛びます。`,
		name: role.name,
		roleId: role.id,
		isAutoSend: false,
		customId: `recruit_${role.id}_${panelId}`,
		id: 0,
		message: '',
		recruitPanelInfoId: 0,
		row: 0,
		style: style,
	};
};
