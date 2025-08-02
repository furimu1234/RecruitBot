import {
	ChannelType,
	type GuildBasedChannel,
	type GuildMember,
	type Message,
	type Role,
	type User,
	channelMention,
	roleMention,
	userMention,
} from 'discord.js';

/**discordメッセージを変換する */
interface IDiscordReplace {
	/**チャンネルメンションをチャンネル名に置換する */
	channelMentionToNameFromMessage: (message: Message) => string;
	/**ロールメンションをロール名に置換する */
	roleMentionToNameFromMessage: (message: Message) => string;
	/**ユーザメンションをユーザ名に置換する */
	userMentionToNameFromMessage: (message: Message) => Promise<string>;

	/**{channel_mention}をチャンネルメンションに変換する */
	originalChannelMention: (
		message: string,
		targetChannel: GuildBasedChannel,
	) => string;
	/**{channel_name}をチャンネル名に変換する */
	originalChannelName: (
		message: string,
		targetChannel: GuildBasedChannel,
	) => string;
	/**{channel_id}をチャンネルIDに変換する */
	originalChannelId: (
		message: string,
		targetChannel: GuildBasedChannel,
	) => string;
	/**{role_mention}をロールメンションに変換する */
	originalRoleMention: (message: string, targetRole: Role) => string;
	/**{role_name}をロール名に変換する */
	originalRoleName: (message: string, targetRole: Role) => string;
	/**{role_id}をロールIDに変換する */
	originalRoleId: (message: string, targetRole: Role) => string;
	/**{user_mention}をユーザメンションに変換する */
	originalUserMention: (
		message: string,
		targetUser: User | GuildMember,
	) => string;
	/**{user_name}をユーザ名に変換する */
	originalUserName: (message: string, targetUser: User | GuildMember) => string;
	/**{user_id}をユーザIDに変換する */
	originalUserId: (message: string, targetUser: User | GuildMember) => string;
}

export const DiscordReplace = (): IDiscordReplace => {
	const channelMentionToNameFromMessage = (message: Message): string => {
		if (!message.guild) return message.content;

		let text = message.content;

		const matches = [...text.matchAll(/<#(\d+)>/g)];

		for (const match of matches) {
			const channelId = match[1];
			const channel = message.guild.channels.cache
				.filter((x) => x.type === ChannelType.GuildText)
				.get(channelId);
			if (channel) {
				text = text.replace(match[0], channel.name);
			}
		}

		return text;
	};
	const roleMentionToNameFromMessage = (message: Message): string => {
		if (!message.guild) return message.content;

		let text = message.content;

		const matches = [...text.matchAll(/<@&(\d+)>/g)];

		for (const match of matches) {
			const roleId = match[1];
			const role = message.guild.roles.cache.get(roleId);
			if (role) {
				text = text.replace(match[0], role.name);
			}
		}

		return text;
	};

	const userMentionToNameFromMessage = async (
		message: Message,
	): Promise<string> => {
		if (!message.guild) return message.content;

		let text = message.content;

		const matches = [...text.matchAll(/<@!?(\d+)>/g)];

		if (message.guild.members.cache.size < 2) {
			await message.guild.members.fetch({});
		}

		for (const match of matches) {
			const memberId = match[1];

			const member = message.guild.members.cache.get(memberId);
			if (member) {
				text = text.replace(match[0], member.displayName);
			}
		}

		return text;
	};

	const originalChannelMention = (
		message: string,
		targetChannel: GuildBasedChannel,
	) => {
		return message.replace(
			/{channel_mention}/g,
			channelMention(targetChannel.id),
		);
	};
	const originalChannelName = (
		message: string,
		targetChannel: GuildBasedChannel,
	) => {
		return message.replace(/{channel_name}/g, targetChannel.name);
	};
	const originalChannelId = (
		message: string,
		targetChannel: GuildBasedChannel,
	) => {
		return message.replace(/{channel_id}/g, targetChannel.id);
	};

	const originalRoleMention = (message: string, targetRole: Role) => {
		return message.replace(/{role_mention}/g, roleMention(targetRole.id));
	};
	const originalRoleName = (message: string, targetRole: Role) => {
		return message.replace(/{role_name}/g, targetRole.name);
	};
	const originalRoleId = (message: string, targetRole: Role) => {
		return message.replace(/{role_id}/g, targetRole.id);
	};

	const originalUserMention = (
		message: string,
		targetUser: User | GuildMember,
	) => {
		return message.replace(/{user_mention}/g, userMention(targetUser.id));
	};
	const originalUserName = (
		message: string,
		targetUser: User | GuildMember,
	) => {
		return message.replace(/{user_name}/g, targetUser.displayName);
	};
	const originalUserId = (message: string, targetUser: User | GuildMember) => {
		return message.replace(/{user_id}/g, targetUser.id);
	};

	return {
		channelMentionToNameFromMessage,
		roleMentionToNameFromMessage,
		userMentionToNameFromMessage,
		originalChannelMention,
		originalChannelName,
		originalChannelId,
		originalRoleMention,
		originalRoleName,
		originalRoleId,
		originalUserMention,
		originalUserName,
		originalUserId,
	};
};
