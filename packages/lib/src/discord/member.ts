import type { Guild, GuildMember, User } from 'discord.js';

interface UserProp {
	user?: User | GuildMember;
	userId?: string;
}

export const getMember = async (guild: Guild, { user, userId }: UserProp) => {
	let id = userId;

	if (user) {
		id = user.id;
	}

	if (!id) return;

	let member = guild.members.cache.get(id);

	if (!member) {
		const fetchMember = await guild.members.fetch({ user: user });
		member = fetchMember.get(id);
	}
	return member;
};
