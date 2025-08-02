import { REST, Routes, type User } from 'discord.js';
import type { slashCommands } from '../../types';

export async function slashCommandRegister(
	clientUser: User,
	commands: slashCommands,
) {
	const rest = new REST().setToken(process.env.TOKEN);
	await rest.put(Routes.applicationCommands(clientUser.id), {
		body: commands,
	});
}
