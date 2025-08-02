import { eq, or } from 'drizzle-orm';
import { recruitTrigger } from '../';
import type { SchemaDB } from '../client';

/**
 * トリガーチャンネルID取得
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function getRecruitTrigger(
	db: SchemaDB,
	filter: Partial<typeof recruitTrigger.$inferSelect>,
) {
	const result = await db.query.recruitTrigger.findFirst({
		where: or(
			filter.triggerId !== undefined
				? eq(recruitTrigger.triggerId, filter.triggerId)
				: undefined,
		),
	});

	return result;
}
