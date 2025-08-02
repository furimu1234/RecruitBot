import { Events } from 'discord.js';

import type { Logger } from 'pino';
import { Container, container, remindBotClient1 } from './container';

import path from 'node:path';
import { loadCommands } from './commands/main';
import { slashCommandRegister } from './commands/utils/register';
import { loadEvents } from './loadEvents';

let logger: Logger<never, boolean>;

loadEvents(
	remindBotClient1,
	path.resolve(path.dirname(__filename), './events'),
);

remindBotClient1.once(Events.ClientReady, async () => {
	const client = remindBotClient1;

	container.current = Container();

	logger = container.current.logger;

	if (client.user) {
		logger.info('=============BOT START=============');
		logger.info(client.user?.displayName);
		const commands = await loadCommands();
		await slashCommandRegister(client.user, commands);
	}
});

remindBotClient1.on(Events.Error, async (error) => {
	console.error(error);
});

console.log('TOKEN: ', process.env.TOKEN);

remindBotClient1.login(process.env.TOKEN);
