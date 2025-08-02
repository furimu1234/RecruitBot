import { eq } from 'drizzle-orm';
import { autoSendInfo } from '../';
import type { SchemaDB } from '../client';

/**
 * 自走送信状況削除
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function deleteAutoSend(
	db: SchemaDB,
	triggerChannelId: string | null,
) {
	if (!triggerChannelId) return;

	const results = await db
		.delete(autoSendInfo)
		.where(eq(autoSendInfo.targetId, triggerChannelId))
		.returning({ id: autoSendInfo.id });

	if (results.length !== 1) throw new Error();
}
