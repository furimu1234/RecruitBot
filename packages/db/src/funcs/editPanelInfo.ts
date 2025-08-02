import { eq } from 'drizzle-orm';
import { recuritPanelInfo } from '../';
import type { SchemaDB } from '../client';

/**
 * 募集文編集
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function editPanelInfo(
	db: SchemaDB,
	values: Partial<typeof recuritPanelInfo.$inferSelect>,
) {
	const results = await db
		.update(recuritPanelInfo)
		.set(values)
		.where(eq(recuritPanelInfo.id, values.id ?? 0))
		.returning({ id: recuritPanelInfo.id });

	if (results.length !== 1) throw new Error();

	const result = results[0];

	return result.id;
}
