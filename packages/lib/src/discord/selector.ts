import {
	ActionRowBuilder,
	type CacheType,
	ChannelSelectMenuBuilder,
	type ChannelSelectMenuInteraction,
	type ChannelType,
	ComponentType,
	type Guild,
	RoleSelectMenuBuilder,
	type RoleSelectMenuInteraction,
	type SendableChannels,
	StringSelectMenuBuilder,
	type StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { sleep } from '..';
import { generateRandomString } from '../random';

export const selector = (
	sendableChannel: SendableChannels,
	question: string,
) => {
	let cancelMessage = 'キャンセルしました。処理を中断します。';
	let maxSize = 1;

	const setCancelMessage = (message: string) => {
		cancelMessage = message;
	};

	const setMaxSize = (_maxSize: number) => {
		maxSize = _maxSize;
	};

	const channel = async (guild: Guild, ...channelTypes: ChannelType[]) => {
		const customId = `channel_select:${generateRandomString()}`;

		const menu = new ChannelSelectMenuBuilder()
			.setCustomId(customId)
			.setPlaceholder('チャンネルを選んでください')
			.setMaxValues(maxSize)
			.setMinValues(1)
			.setChannelTypes(channelTypes);

		const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
			menu,
		);

		// セレクトメニューを送信
		const _reply = await sendableChannel.send({
			content: question,
			components: [row],
		});
		const reply = await _reply.fetch();

		let selection: ChannelSelectMenuInteraction<CacheType> | undefined =
			undefined;

		try {
			selection = await reply.awaitMessageComponent({
				componentType: ComponentType.ChannelSelect,
				time: 3 * 60 * 1000,
			});
			if (selection.customId !== customId) return [];

			await selection.deferUpdate();
			await selection.deleteReply();
		} catch (error) {
			return [];
		}

		if (!selection) {
			const message = await sendableChannel.send({
				content: cancelMessage,
			});
			await sleep(15);
			await message.delete();
			return [];
		}

		const channels = selection.values
			.map((x) => guild.channels.cache.get(x))
			.filter((x) => x !== undefined);
		return channels;
	};

	const role = async (guild: Guild) => {
		const customId = `channel_select:${generateRandomString()}`;

		const menu = new RoleSelectMenuBuilder()
			.setCustomId(customId)
			.setPlaceholder('ロールを選んでください')
			.setMaxValues(maxSize)
			.setMinValues(1);

		const row = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
			menu,
		);

		// セレクトメニューを送信
		const _reply = await sendableChannel.send({
			content: question,
			components: [row],
		});
		const reply = await _reply.fetch();

		let selection: RoleSelectMenuInteraction<CacheType> | undefined = undefined;

		try {
			selection = await reply.awaitMessageComponent({
				componentType: ComponentType.RoleSelect,
				time: 3 * 60 * 1000,
			});
			if (selection.customId !== customId) return [];

			await selection.deferUpdate();
			await selection.deleteReply();
		} catch (error) {
			return [];
		}

		if (!selection) {
			const message = await sendableChannel.send({
				content: cancelMessage,
			});
			await sleep(15);
			await message.delete();
			return [];
		}

		const selectedRoleId = selection.values[0];
		const roles = selection.values
			.map((x) => guild.roles.cache.get(selectedRoleId))
			.filter((x) => x !== undefined);
		return roles;
	};
	const string = async (
		placeholder: string,
		values: { name: string; value: string }[],
	) => {
		const customId = `channel_select:${generateRandomString()}`;

		const menu = new StringSelectMenuBuilder()
			.setCustomId(customId)
			.setPlaceholder(placeholder)
			.setMaxValues(maxSize)
			.setMinValues(1);

		menu.addOptions(
			values.map((x) => {
				return new StringSelectMenuOptionBuilder()
					.setLabel(x.name)
					.setValue(x.value);
			}),
		);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			menu,
		);

		// セレクトメニューを送信
		const _reply = await sendableChannel.send({
			content: question,
			components: [row],
		});
		const reply = await _reply.fetch();

		let selection: StringSelectMenuInteraction<CacheType> | undefined =
			undefined;

		try {
			selection = await reply.awaitMessageComponent({
				componentType: ComponentType.StringSelect,
				time: 3 * 60 * 1000,
			});
			if (selection.customId !== customId) return [];

			await selection.deferUpdate();
			await selection.deleteReply();
		} catch (error) {
			return [];
		}

		if (!selection) {
			const message = await sendableChannel.send({
				content: cancelMessage,
			});
			await sleep(15);
			await message.delete();
			return [];
		}

		return selection.values;
	};

	return {
		setCancelMessage,
		setMaxSize,
		channel,
		role,
		string,
	};
};
