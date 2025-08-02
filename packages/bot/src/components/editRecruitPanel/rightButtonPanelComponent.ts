import { ButtonStyle, ContainerBuilder, type SectionBuilder } from 'discord.js';
import { addSectionWithButtonBuilder } from '../addSectionWith';
import { type SeparatorType, addSeparatorBuilder } from '../addSeparator';
import type { IRightButtonByModel } from './types';

export type ISectionWithButtonBuilder = {
	section: SectionBuilder;
} & SeparatorType;

//右にボタンがあるコンポーネントのベース
const makeBaseRightButtonPanelComponent = (
	headerSection: SectionBuilder,
	options: ISectionWithButtonBuilder[],
) => {
	const container = new ContainerBuilder()
		.addSectionComponents(headerSection)
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
 * 右側にボタンがあるver.の募集パネルのコンポーネント
 * @returns
 */
export const makeRightButtonPanelEditComponent = (
	title: string | null,
	description: string | null,
	panelId: string,
	buttonOptions: IRightButtonByModel[],
) => {
	return {
		component: makeBaseRightButtonPanelComponent(
			addSectionWithButtonBuilder({
				contents: [`# ${title}の編集パネル\n`, description ?? 'パネル説明'],
				buttonLabel: 'パネルに適用',
				buttonCustomId: `save_panel:${panelId}`,
				buttonStyle: ButtonStyle.Success,
			}),
			buttonOptions.map((x) => {
				return {
					section: addSectionWithButtonBuilder({
						contents: [`# ${x.title}\n${x.description}`],
						buttonCustomId: `editrole_${x.customId}`,
						buttonLabel: x.name,
						buttonStyle: x.style,
					}),
				};
			}),
		),
	};
};
