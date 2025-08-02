import type { ChatInputCommandInteraction } from 'discord.js';

export const getStringOption = (
	name: string,
	interaction: ChatInputCommandInteraction,
): string | undefined => {
	return interaction.options.get(name)?.value?.toString();
};
