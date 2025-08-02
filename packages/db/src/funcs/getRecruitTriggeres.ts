import { eq, or } from 'drizzle-orm';

import { recruitTrigger } from '../';
import type { SchemaDB } from '../client';

export type RecruitTriggers = Awaited<ReturnType<typeof getRecruitTriggeres>>;

/**
 * トリガーチャンネルID取得
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function getRecruitTriggeres(
	db: SchemaDB,
	filter: Partial<typeof recruitTrigger.$inferSelect>,
) {
	const results = await db.query.recruitTrigger.findMany({
		where: or(
			filter.recruitInfoId !== undefined
				? eq(recruitTrigger.recruitInfoId, filter.recruitInfoId)
				: undefined,
		),
	});

	return results;
}
