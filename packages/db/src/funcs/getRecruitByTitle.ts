import { and, eq, or } from 'drizzle-orm';
import { recuritInfo, recuritPanelBottomButton, recuritPanelInfo } from '../';
import type { SchemaDB } from '../client';

/**
 * リマインド登録
 * @param db drizzle
 * @param values db登録モデル
 * @returns
 */
export async function getRecruitByTitle(
	db: SchemaDB,
	filter: Partial<typeof recuritInfo.$inferSelect> & {
		customId?: string;
		isAutoSend?: boolean;
		fullMatchTitle: string;
	},
) {
	if (!filter.guildId) throw new Error('');

	const panelInfo = await db.query.recuritPanelInfo.findFirst({
		where: and(
			eq(recuritPanelInfo.title, filter.fullMatchTitle),
			eq(recuritPanelInfo.guildId, filter.guildId),
		),
	});

	if (!panelInfo || !panelInfo.recruitId) return undefined;

	const result = await db.query.recuritInfo.findFirst({
		where: or(
			filter.creatorId !== undefined
				? eq(recuritInfo.creatorId, filter.creatorId)
				: undefined,
			filter.panelId !== undefined
				? eq(recuritInfo.panelId, filter.panelId)
				: undefined,
			eq(recuritInfo.id, panelInfo.recruitId),
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
