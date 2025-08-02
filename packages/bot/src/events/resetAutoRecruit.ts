import { deleteAutoSend } from '@recruit/db';
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

	if (before.channel && before.member) {
		const beforeChannel = before.channel;

		if (Array.from(beforeChannel.members.values()).length !== 0) {
			return;
		}
		const beforeChannelId = before.channel.id;

		await store.do(async (db) => {
			await deleteAutoSend(db, beforeChannelId);
		});
	}
}
