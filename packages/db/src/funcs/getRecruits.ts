import { and, eq, like, or } from 'drizzle-orm';
import {
	recuritInfo,
	recuritPanelBottomButton,
	recuritPanelRightButton,
} from '../';
import type { SchemaDB } from '../client';

/**
 * リマインド登録
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function getRecruits(
	db: SchemaDB,
	filter: Partial<typeof recuritInfo.$inferSelect> & {
		title?: string;
		buttonName?: string;
	},
) {
	const results = await db.query.recuritInfo.findMany({
		where: or(
			filter.creatorId !== undefined
				? eq(recuritInfo.creatorId, filter.creatorId)
				: undefined,

			filter.guildId !== undefined
				? eq(recuritInfo.guildId, filter.guildId)
				: undefined,
		),
		with: {
			panelInfo: {
				with: {
					bottomButtons: {
						where: and(
							filter.buttonName
								? like(recuritPanelBottomButton.name, `%${filter.buttonName}%`)
								: undefined,
						),
					},
					rightButtons: {
						where: and(
							filter.buttonName
								? like(recuritPanelRightButton.name, `%${filter.buttonName}%`)
								: undefined,
						),
					},
				},
			},
		},
	});

	return results.filter((r) =>
		filter.title ? r.panelInfo.title.includes(filter.title) : true,
	);
}
