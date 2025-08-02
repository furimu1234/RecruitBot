import type { Role } from 'discord.js';
import { recuritPanelRightButton } from '../';
import type { SchemaDB } from '../client';

/**
 * 右ボタン追加
 * @param db drizzle
 * @param panelInfoId パネル情報レコードID
 * @param panelId パネルID
 * @param maxRowSize 現在のボタン個数
 * @param roles 追加するロール一覧
 * @returns
 */
export async function addRightButton(
	db: SchemaDB,
	panelInfoId: number,
	panelId: string,
	maxRowSize: number,
	roles: Role[],
) {
	const newButtons: (typeof recuritPanelRightButton.$inferInsert)[] = roles.map(
		(role, i) => {
			return {
				recruitPanelInfoId: panelInfoId,
				roleId: role.id,
				title: `${role.name}の設定`,
				description: `${role.name}の設定`,
				name: role.name,
				style: 2,
				customId: `recruit_${role.id}_${panelId}`,
				isAutoSend: false,
				message:
					'{role_mention}\n{user_mention}が{channel_mention}に入室してるよ!',
				row: maxRowSize + i,
			};
		},
	);

	await db.insert(recuritPanelRightButton).values(newButtons);

	return true;
}
