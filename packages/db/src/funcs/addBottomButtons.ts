import type { Role } from 'discord.js';
import { recuritPanelBottomButton } from '../';
import type { SchemaDB } from '../client';

/**
 * 下ボタン追加
 * @param db drizzle
 * @param panelInfoId パネル情報レコードID
 * @param panelId パネルID
 * @param maxRowSize 現在のボタン個数
 * @param roles 追加するロール一覧
 * @returns
 */
export async function addBottomButton(
	db: SchemaDB,
	panelInfoId: number,
	panelId: string,
	blankIndexMap: {
		row: number;
		col: number;
	}[],
	roles: Role[],
) {
	const newButtons: (typeof recuritPanelBottomButton.$inferInsert)[] =
		roles.map((role, i) => {
			let indexes = undefined;
			while (indexes === undefined) {
				indexes = blankIndexMap.pop();
			}
			console.log(role.name, indexes);

			return {
				recruitPanelInfoId: panelInfoId,
				roleId: role.id,
				name: role.name,
				style: 2,
				customId: `recruit_${role.id}_${panelId}`,
				isAutoSend: false,
				message:
					'{role_mention}\n{user_mention}が{channel_mention}に入室してるよ!',
				row: indexes.row,
				col: indexes.col,
			};
		});

	await db.insert(recuritPanelBottomButton).values(newButtons);

	return true;
}
