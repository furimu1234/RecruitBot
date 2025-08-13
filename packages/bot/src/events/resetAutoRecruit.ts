import { deleteAutoSend, getAutoSendInfo } from '@recruit/db';
import { Events, type VoiceState } from 'discord.js';
import { container } from '../container';

export const name = Events.VoiceStateUpdate;
export const once = false;
export async function execute(
	before: VoiceState,
	after: VoiceState,
): Promise<void> {
	if (!container.current) return;

	if (before.channelId === after.channelId) return;
	if (!container.current) throw new Error();

	const store = container.current.getDataStore();

	if (before.channel) {
		const beforeChannel = before.channel;
		const beforeChannelId = before.channel.id;

		const model = await store.do(async (db) => {
			return await getAutoSendInfo(db, { targetId: beforeChannelId });
		});

		if (!model) return;

		if (Array.from(beforeChannel.members.values()).length !== 0) {
			return;
		}

		await store.do(async (db) => {
			await deleteAutoSend(db, beforeChannelId);
		});
	}
}
