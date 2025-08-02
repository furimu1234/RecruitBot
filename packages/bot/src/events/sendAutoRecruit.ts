import {
	type DataStoreInterface,
	createAutoSend,
	getAutoSendInfo,
	getRecruit,
	getRecruitTrigger,
} from '@recruit/db';
import { sleep } from '@recruit/lib';
import { DiscordReplace } from '@recruit/replace';
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

	if (after.channel && after.member) {
		await sendRecuritMessage(store, after);
	}
}

const sendRecuritMessage = async (
	store: DataStoreInterface,
	after: VoiceState,
) => {
	let afterChannel = after.channel;
	const afterMember = after.member;
	if (!afterMember) return;

	if (!afterChannel) return;

	const guild = afterChannel.guild;
	if (!guild) return;

	await store.do(async (db) => {
		if (!afterChannel) return;
		const triggerModel = await getRecruitTrigger(db, {
			triggerId: afterChannel.id,
		});

		if (!triggerModel) return;

		const model = await getRecruit(db, {
			isAutoSend: true,
			id: triggerModel.recruitInfoId,
		});

		if (!model) {
			return;
		}

		const now = new Date();
		const autoSendTime = new Date();
		let autoSendInt = 0;

		if (model.autoSendInt) {
			autoSendInt = model.autoSendInt;
		}

		if (model.autoSendUnit === 'h') {
			const nowh = now.getHours();
			autoSendTime.setMinutes(nowh + autoSendInt);
		} else if (model.autoSendUnit === 'm') {
			const nowm = now.getMinutes();
			autoSendTime.setMinutes(nowm + autoSendInt);
		}

		await sleep((autoSendTime.getTime() - now.getTime()) / 1000);

		if (!after.channel) {
			return;
		}
		afterChannel = after.channel;

		const autoSendInfo = await getAutoSendInfo(db, {
			targetId: afterChannel.id,
		});

		if (autoSendInfo && !!autoSendInfo.isSended) return;

		let targetRoleId: string | undefined = undefined;

		const targetButtonData = model.panelInfo.rightButtons.find(
			(x) =>
				x.isAutoSend === true && x.recruitPanelInfoId === model.panelInfo.id,
		);

		let originalMessage: string | undefined = undefined;

		if (!targetButtonData) {
			const fixTargetButtonData = model.panelInfo.bottomButtons.find(
				(x) =>
					x.isAutoSend === true && x.recruitPanelInfoId === model.panelInfo.id,
			);
			if (!fixTargetButtonData) return;
			targetRoleId = fixTargetButtonData.roleId;
			originalMessage = fixTargetButtonData.message;
		} else {
			targetRoleId = targetButtonData.roleId;
			originalMessage = targetButtonData.message;
		}

		const targetRole = guild.roles.cache.get(targetRoleId ?? '0');

		if (!targetRole) return;

		const sendChannel = guild.channels.cache.get(model.sendChannelId);
		if (!sendChannel || !sendChannel.isSendable()) return;

		//メッセージ変換
		const discordReplace = DiscordReplace();
		originalMessage = discordReplace.originalChannelMention(
			originalMessage,
			afterChannel,
		);
		originalMessage = discordReplace.originalChannelName(
			originalMessage,
			afterChannel,
		);
		originalMessage = discordReplace.originalChannelId(
			originalMessage,
			afterChannel,
		);
		originalMessage = discordReplace.originalRoleMention(
			originalMessage,
			targetRole,
		);
		originalMessage = discordReplace.originalRoleName(
			originalMessage,
			targetRole,
		);
		originalMessage = discordReplace.originalRoleId(
			originalMessage,
			targetRole,
		);
		originalMessage = discordReplace.originalUserMention(
			originalMessage,
			afterMember,
		);
		originalMessage = discordReplace.originalUserName(
			originalMessage,
			afterMember,
		);
		originalMessage = discordReplace.originalUserId(
			originalMessage,
			afterMember,
		);

		await sendChannel.send({ content: originalMessage });

		await createAutoSend(db, { targetId: afterChannel.id, isSended: true });
	});
};
