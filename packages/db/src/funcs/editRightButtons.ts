import { and, eq } from 'drizzle-orm';
import { recuritPanelRightButton } from '../';
import type { SchemaDB } from '../client';

/**
 * 右ボタン編集
 * @param db drizzle
 * @param panelInfoId パネル情報レコードID
 * @param panelId パネルID
 * @param maxRowSize 現在のボタン個数
 * @param roles 追加するロール一覧
 * @returns
 */
export async function editRightButton(
	db: SchemaDB,
	panelInfoId: number,
	roleId: string,
	values: Partial<typeof recuritPanelRightButton.$inferSelect>,
) {
	await db
		.update(recuritPanelRightButton)
		.set(values)
		.where(
			and(
				eq(recuritPanelRightButton.recruitPanelInfoId, panelInfoId),
				eq(recuritPanelRightButton.roleId, roleId),
			),
		);

	return true;
}
