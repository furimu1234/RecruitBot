import {
	type DataStoreInterface,
	getRecruit,
	type recuritInfo,
} from '@recruit/db';
import { sendMessageThenDelete } from '@recruit/lib';
import type { ButtonStyle } from 'discord.js';

interface buttonData {
	id: number;
	recruitPanelInfoId: number | null;
	title?: string;
	description?: string;
	name: string;
	style: ButtonStyle;
	isAutoSend: boolean;
	row: number;
	col?: number;
	roleId: string;
	message: string;
}

interface DBData {
	recruitInfo: typeof recuritInfo.$inferSelect;
	buttonData: buttonData;
	customId?: string;
}

export const getButtonData = async (
	store: DataStoreInterface,
	options: {
		roleId?: string;
		panelId?: string;
		customId?: string;
	},
): Promise<DBData | undefined> => {
	let customId = options.customId;

	if (!options.customId) {
		customId = `recruit_${options.roleId}_${options.panelId}`;
	}

	const recruitInfo = await store.do(async (db) => {
		return await getRecruit(db, { panelId: options.panelId });
	});

	if (!recruitInfo) {
		sendMessageThenDelete({
			sleepSecond: 15,
			content: 'データの取得に失敗しました。もう一度実行してみてください。',
		});
		return;
	}

	if (recruitInfo.isSplitButtonLine) {
		const buttonData = recruitInfo.panelInfo.bottomButtons.find(
			(x) => x.customId === customId,
		);
		if (!buttonData) return;
		return {
			recruitInfo,
			buttonData,
			customId,
		};
	}
	const buttonData = recruitInfo.panelInfo.rightButtons.find(
		(x) => x.customId === customId,
	);

	if (!buttonData) return;

	return {
		recruitInfo,
		buttonData,
		customId,
	};
};

export const isSplitButtonLine = (
	dbData: Awaited<ReturnType<typeof getButtonData>>,
) => {};
