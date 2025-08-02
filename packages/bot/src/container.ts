import { MakeDataStore, schema } from '@recruit/db';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import pino from 'pino';

import { Client, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import type { ContainerRef, IContainer } from './types';

dotenv.config({ path: '../../.env' });

export const Container = (): IContainer => {
	const logger = pino({
		transport: {
			target: 'pino-pretty',
			level: 'info',
			options: {
				colorize: true,
				translateTime: 'yyyy-mm-dd HH:MM:ss',
				ignore: 'pid,hostname',
			},
		},
	});

	const getDataStore = () => {
		const pool = new Pool({
			connectionString: process.env.PG_URL,
		});

		const client = drizzle<typeof schema>(pool, {
			schema: schema,
		});

		const dataStore = MakeDataStore(client);
		return dataStore;
	};

	return {
		logger,
		getDataStore,
	};
};

export const container: ContainerRef = { current: undefined };

export const remindBotClient1 = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.GuildMember, Partials.User],
});
remindBotClient1.setMaxListeners(30);
