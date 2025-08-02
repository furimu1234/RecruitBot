import { ButtonStyle, ContainerBuilder, type Role } from 'discord.js';
import { buttonStyleToJp } from '../../lib';
import { addSectionWithButtonBuilder } from '../addSectionWith';
import { addSeparatorBuilder } from '../addSeparator';

export const makeEditRoleComponent = (
	panelId: string,
	role: Role,
	buttonOption: {
		name: string;
		style: ButtonStyle;
		message: string;
		title?: string;
		description?: string;
		roleId: string;
	},
) => {
	const container = new ContainerBuilder();
	container
		.addSectionComponents(
			addSectionWithButtonBuilder({
				contents: [
					`# ${role.name}の設定画面`,
					`ボタン名: ${buttonOption.name}`,
				],
				buttonCustomId: `editbuttonname_${role.id}_${panelId}`,
				buttonLabel: `${buttonOption.name}の名前変更`,
				buttonStyle: ButtonStyle.Success,
			}),
		)
		.addSeparatorComponents(addSeparatorBuilder());

	container
		.addSectionComponents(
			addSectionWithButtonBuilder({
				contents: [`ボタン色: ${buttonStyleToJp(buttonOption.style)}`],
				buttonCustomId: `editbuttonstyle_${role.id}_${panelId}`,
				buttonLabel: `${buttonOption.name}の色変更`,
				buttonStyle: ButtonStyle.Primary,
			}),
		)
		.addSeparatorComponents(addSeparatorBuilder());
	container
		.addSectionComponents(
			addSectionWithButtonBuilder({
				contents: [`募集内容: \n${buttonOption.message}`],
				buttonCustomId: `editbuttonmessage_${role.id}_${panelId}`,
				buttonLabel: `${buttonOption.name}の募集内容変更`,
				buttonStyle: ButtonStyle.Danger,
			}),
		)
		.addSeparatorComponents(addSeparatorBuilder());

	if (buttonOption.title !== undefined) {
		container
			.addSectionComponents(
				addSectionWithButtonBuilder({
					contents: [`ボタンタイトルの編集: \n${buttonOption.title}`],
					buttonCustomId: `editbuttontitle_${role.id}_${panelId}`,
					buttonLabel: `${buttonOption.name}のタイトル変更`,
					buttonStyle: ButtonStyle.Success,
				}),
			)
			.addSeparatorComponents(addSeparatorBuilder());
	}
	if (buttonOption.description !== undefined) {
		container
			.addSectionComponents(
				addSectionWithButtonBuilder({
					contents: [`ボタン説明の編集: \n${buttonOption.description}`],
					buttonCustomId: `editbuttondescription_${role.id}_${panelId}`,
					buttonLabel: `${buttonOption.name}の説明変更`,
					buttonStyle: ButtonStyle.Primary,
				}),
			)
			.addSeparatorComponents(addSeparatorBuilder());
	}

	return container;
};
