import { and, eq } from 'drizzle-orm';
import { recuritInfo } from '../';
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
export async function deleteRecruitInfo(
	db: SchemaDB,
	filter: Partial<typeof recuritInfo.$inferSelect>,
) {
	await db
		.delete(recuritInfo)
		.where(and(filter.id ? eq(recuritInfo.id, filter.id) : undefined));

	return true;
}
