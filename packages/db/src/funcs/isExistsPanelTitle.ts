import { and, eq } from 'drizzle-orm';
import { recuritPanelInfo } from '../';
import type { SchemaDB } from '../client';

/**
 * 入力されたパネルがすでにそのーサーバーにあるか
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function isExistsPanelTitle(
	db: SchemaDB,
	guildId: string,
	title: string,
) {
	const results = await db
		.select()
		.from(recuritPanelInfo)
		.where(
			and(
				eq(recuritPanelInfo.title, title),
				eq(recuritPanelInfo.guildId, guildId),
			),
		);

	return results.length > 0;
}
