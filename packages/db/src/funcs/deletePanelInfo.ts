import { and, eq } from 'drizzle-orm';
import { recuritPanelInfo } from '../';
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
export async function deletePanelInfo(
	db: SchemaDB,
	filter: Partial<typeof recuritPanelInfo.$inferSelect>,
) {
	await db.delete(recuritPanelInfo).where(
		and(
			filter.id ? eq(recuritPanelInfo.id, filter.id) : undefined,
		),
	);

	return true;
}
