import { and, eq, or } from 'drizzle-orm';
import { recuritInfo, recuritPanelBottomButton } from '../';
import type { SchemaDB } from '../client';

export type RecruitInfo = Awaited<ReturnType<typeof getRecruit>>;

/**
 * 募集登録
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function getRecruit(
	db: SchemaDB,
	filter: Partial<typeof recuritInfo.$inferSelect> & {
		customId?: string;
		isAutoSend?: boolean;
	},
) {
	const result = await db.query.recuritInfo.findFirst({
		where: or(
			filter.creatorId !== undefined
				? eq(recuritInfo.creatorId, filter.creatorId)
				: undefined,
			filter.panelId !== undefined
				? eq(recuritInfo.panelId, filter.panelId)
				: undefined,
		),
		with: {
			panelInfo: {
				with: {
					bottomButtons: {
						where: and(
							filter.customId !== undefined
								? eq(recuritPanelBottomButton.customId, filter.customId)
								: undefined,

							filter.isAutoSend !== undefined
								? eq(recuritPanelBottomButton.isAutoSend, filter.isAutoSend)
								: undefined,
						),
					},
					rightButtons: {
						where: and(
							filter.customId !== undefined
								? eq(recuritPanelBottomButton.customId, filter.customId)
								: undefined,

							filter.isAutoSend !== undefined
								? eq(recuritPanelBottomButton.isAutoSend, filter.isAutoSend)
								: undefined,
						),
					},
				},
			},
		},
	});

	return result;
}
