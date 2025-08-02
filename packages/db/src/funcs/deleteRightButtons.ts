import { and, eq } from 'drizzle-orm';
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
export async function deleteRightButton(
	db: SchemaDB,
	filter: Partial<typeof recuritPanelRightButton.$inferSelect>,
) {
	await db
		.delete(recuritPanelRightButton)
		.where(
			and(
				filter.recruitPanelInfoId
					? eq(
							recuritPanelRightButton.recruitPanelInfoId,
							filter.recruitPanelInfoId,
						)
					: undefined,
				filter.id ? eq(recuritPanelRightButton.id, filter.id) : undefined,
			),
		);

	return true;
}
