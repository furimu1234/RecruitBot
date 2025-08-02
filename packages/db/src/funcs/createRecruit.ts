import {
	recuritInfo,
	recuritPanelBottomButton,
	recuritPanelInfo,
	recuritPanelRightButton,
} from '../';
import type { SchemaDB } from '../client';

interface PanelInfo {
	title: string;
	description: string;
	guildId: string;
}

export interface BottomButtonCreateInfo {
	name: string;
	customId: string;
	style: number;
	isAutoSend: boolean;
	row: number;
	col: number;
	roleId: string;
}

export interface RightButtonCreateInfo
	extends Omit<BottomButtonCreateInfo, 'row' | 'col'> {
	title: string;
	description: string;
	row: number;
}

/**
 * 募集文作成
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function createRecruit(
	db: SchemaDB,
	values: typeof recuritInfo.$inferInsert,
	panel: PanelInfo,
	rightButtons?: RightButtonCreateInfo[],
	bottomButtons?: BottomButtonCreateInfo[],
) {
	const results = await db
		.insert(recuritInfo)
		.values(values)
		.returning({ id: recuritInfo.id });

	if (results.length !== 1) throw new Error();

	const result = results[0];

	const panelResults = await db
		.insert(recuritPanelInfo)
		.values({
			recruitId: result.id,
			...panel,
		})
		.returning({ id: recuritPanelInfo.id });

	if (panelResults.length !== 1) throw new Error();
	const panelResult = panelResults[0];

	if (values.isSplitButtonLine && bottomButtons) {
		for (const bottomButton of bottomButtons) {
			await db.insert(recuritPanelBottomButton).values({
				recruitPanelInfoId: panelResult.id,
				name: bottomButton.name,
				customId: bottomButton.customId,
				style: bottomButton.style,
				message:
					'{role_mention}\n{user_mention}が{channel_mention}に入室してるよ!',
				isAutoSend: false,
				row: bottomButton.row,
				col: bottomButton.col,
				roleId: bottomButton.roleId,
			});
		}
	} else if (!values.isSplitButtonLine && rightButtons) {
		for (const rightButton of rightButtons) {
			await db.insert(recuritPanelRightButton).values({
				recruitPanelInfoId: panelResult.id,
				title: rightButton.title,
				description: rightButton.description,
				name: rightButton.name,
				customId: rightButton.customId,
				style: rightButton.style,
				message:
					'{role_mention}\n{user_mention}が{channel_mention}に入室してるよ!',
				isAutoSend: false,
				row: rightButton.row,
				roleId: rightButton.roleId,
			});
		}
	}

	return result.id;
}
