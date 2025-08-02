import { and, eq } from 'drizzle-orm';
import { recuritPanelBottomButton } from '../';
import type { SchemaDB } from '../client';

/**
 * 下ボタン編集
 * @param db drizzle
 * @param panelInfoId パネル情報レコードID
 * @param panelId パネルID
 * @param maxRowSize 現在のボタン個数
 * @param roles 追加するロール一覧
 * @returns
 */
export async function editBottomButton(
	db: SchemaDB,
	panelInfoId: number,
	roleId: string,
	values: Partial<typeof recuritPanelBottomButton.$inferSelect>,
) {
	await db
		.update(recuritPanelBottomButton)
		.set(values)
		.where(
			and(
				eq(recuritPanelBottomButton.recruitPanelInfoId, panelInfoId),
				eq(recuritPanelBottomButton.roleId, roleId),
			),
		);

	return true;
}
