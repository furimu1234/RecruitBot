import type { Role } from 'discord.js';
import { inArray } from 'drizzle-orm';
import type { SchemaDB } from '../client';
import { recuritPanelRightButton } from '../schema';

/**
 * 右ボタン削除
 * @param db drizzle
 * @param panelId パネルID
 * @param roles 削除するロール一覧
 * @returns
 */
export async function removeRightButton(
	db: SchemaDB,
	panelId: string,
	roles: Role[],
) {
	await db.delete(recuritPanelRightButton).where(
		inArray(
			recuritPanelRightButton.customId,
			roles.map((x) => `${x.id}_${panelId}`),
		),
	);

	return true;
}
