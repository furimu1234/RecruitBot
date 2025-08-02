import { and, eq } from 'drizzle-orm';
import { recruitTrigger } from '../';
import type { SchemaDB } from '../client';

/**
 * 募集文作成
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function deleteRecruitTrigger(
	db: SchemaDB,
	filter: Partial<typeof recruitTrigger.$inferSelect>,
): Promise<void> {
	console.log(filter);
	await db
		.delete(recruitTrigger)
		.where(
			and(
				filter.recruitInfoId
					? eq(recruitTrigger.recruitInfoId, filter.recruitInfoId)
					: undefined,
				filter.triggerId
					? eq(recruitTrigger.triggerId, filter.triggerId)
					: undefined,
			),
		)
		.returning({ id: recruitTrigger.triggerId });
}
