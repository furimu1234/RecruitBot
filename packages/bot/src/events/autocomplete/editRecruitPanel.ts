import { getRecruits } from '@recruit/db';
import { type AutocompleteInteraction, Events } from 'discord.js';
import { container } from '../../container';

export const name = Events.InteractionCreate;
export const once = false;
export async function execute(
	interaction: AutocompleteInteraction,
): Promise<void> {
	if (!interaction.isAutocomplete()) return;

	if (interaction.commandName !== '募集パネル編集') return;

	if (!container.current) return;
	const store = container.current.getDataStore();

	const focusedValue = interaction.options.getFocused();

	const models = await store.do(async (db) => {
		return await getRecruits(db, {
			title: focusedValue,
			guildId: interaction.guild ? interaction.guild.id : '0',
		});
	});

	if (!models) {
		return await interaction.respond([
			{ name: 'パネル作成コマンドで作成してね!', value: '-1' },
		]);
	}

	await interaction.respond(
		models.map((m) => ({ name: m.panelInfo.title, value: m.panelInfo.title })),
	);
}
