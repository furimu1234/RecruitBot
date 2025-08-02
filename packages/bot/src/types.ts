import type { DataStoreInterface } from '@recruit/db';
import type {
	Interaction,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import type pino from 'pino';

export interface IContainer {
	logger: pino.Logger;
	getDataStore: () => DataStoreInterface;
}

export type Ref<T> = { current?: T };
export type ContainerRef = Ref<IContainer>;

export type commandExecute = (interaction: Interaction) => Promise<void>;
export type slashCommands = RESTPostAPIChatInputApplicationCommandsJSONBody[];
