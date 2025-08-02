import { autoSendInfo } from '../';
import type { SchemaDB } from '../client';

/**
 * 募集文作成
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function createAutoSend(
	db: SchemaDB,
	values: typeof autoSendInfo.$inferInsert,
) {
	const results = await db
		.insert(autoSendInfo)
		.values(values)
		.returning({ id: autoSendInfo.id });

	if (results.length !== 1) throw new Error();

	return results[0];
}
