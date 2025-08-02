import { and, eq } from 'drizzle-orm';
import { recuritPanelBottomButton } from '../';
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
export async function deleteBottomButton(
	db: SchemaDB,
	filter: Partial<typeof recuritPanelBottomButton.$inferSelect>,
) {
	await db
		.delete(recuritPanelBottomButton)
		.where(
			and(
				filter.recruitPanelInfoId
					? eq(
							recuritPanelBottomButton.recruitPanelInfoId,
							filter.recruitPanelInfoId,
						)
					: undefined,
				filter.id ? eq(recuritPanelBottomButton.id, filter.id) : undefined,
			),
		);

	return true;
}
