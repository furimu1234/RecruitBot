import type { Role } from 'discord.js';
import { inArray } from 'drizzle-orm';
import { recuritPanelBottomButton } from '../';
import type { SchemaDB } from '../client';

/**
 * 下ボタン削除
 * @param db drizzle
 * @param panelId パネルID
 * @param roles 削除するロール一覧
 * @returns
 */
export async function removeBottomButton(
	db: SchemaDB,
	panelId: string,
	roles: Role[],
) {
	await db.delete(recuritPanelBottomButton).where(
		inArray(
			recuritPanelBottomButton.customId,
			roles.map((x) => `${x.id}_${panelId}`),
		),
	);

	return true;
}
