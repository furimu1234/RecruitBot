import { eq } from 'drizzle-orm';
import { recuritInfo } from '../';
import type { SchemaDB } from '../client';

/**
 * 募集文編集
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function updateRecruit(
	db: SchemaDB,
	values: Partial<typeof recuritInfo.$inferSelect>,
) {
	const results = await db
		.update(recuritInfo)
		.set(values)
		.where(eq(recuritInfo.id, values.id ?? 0))
		.returning({ id: recuritInfo.id });

	if (results.length !== 1) throw new Error();

	const result = results[0];

	return result.id;
}
