import { eq, or } from 'drizzle-orm';
import { autoSendInfo } from '../';
import type { SchemaDB } from '../client';

/**
 * 募集送信情報取得
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function getAutoSendInfo(
	db: SchemaDB,
	filter: Partial<typeof autoSendInfo.$inferSelect>,
) {
	const result = await db.query.autoSendInfo.findFirst({
		where: or(
			filter.targetId !== undefined
				? eq(autoSendInfo.targetId, filter.targetId)
				: undefined,
		),
	});

	return result;
}
