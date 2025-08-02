import { recruitTrigger } from '../';
import type { SchemaDB } from '../client';

/**
 * 募集文作成
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function createRecruitTrigger(
	db: SchemaDB,
	values: (typeof recruitTrigger.$inferInsert)[],
) {
	console.log(values);

	const results = await db
		.insert(recruitTrigger)
		.values(values)
		.returning({ id: recruitTrigger.triggerId });

	return results.map((x) => x.id);
}
