import {
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type CacheType,
	Collection,
	ComponentType,
	type Interaction,
	InteractionType,
	type MessageActionRowComponentBuilder,
	ModalBuilder,
	type ModalSubmitFields,
	type SendableChannels,
	type TextInputBuilder,
	type TextInputComponent,
} from 'discord.js';
import { sleep } from '..';
import { generateRandomString } from '../random';

type IModalFields = TextInputBuilder[];

interface ModalProp {
	customId: string;
	title: string;
	fields: IModalFields;
}

export const confirmDialog = (
	sendableChannel: SendableChannels,
	question: string,
) => {
	const okCustomId = generateRandomString();
	const noCustomId = generateRandomString();

	let okStyle = ButtonStyle.Success;
	let noStyle = ButtonStyle.Danger;
	let okLabel = '続行';
	let noLabel = 'キャンセル';
	let cancelMessage = 'キャンセルしました。処理を中断します。';

	const setOkStyle = (style: ButtonStyle) => {
		okStyle = style;
	};

	const setNoStyle = (style: ButtonStyle) => {
		noStyle = style;
	};

	const setOkLabel = (label: string) => {
		okLabel = label;
	};
	const setNoLabel = (label: string) => {
		noLabel = label;
	};
	const setCancelMessage = (message: string) => {
		cancelMessage = message;
	};

	const modal = async (interaction: Interaction, modalOption: ModalProp) => {
		if (
			interaction.type === InteractionType.ApplicationCommandAutocomplete ||
			interaction.type === InteractionType.ModalSubmit
		)
			return {} as ModalSubmitFields;

		const row = modalOption.fields.map((x) => {
			return new ActionRowBuilder<TextInputBuilder>().addComponents(x);
		});

		await interaction.showModal(
			new ModalBuilder()
				.addComponents(row)
				.setTitle(modalOption.title)
				.setCustomId(modalOption.customId),
		);

		const modal = await interaction.awaitModalSubmit({
			filter: (x) => x.customId === modalOption.customId,
			time: 2147483647, //32bit最大
		});

		try {
			await modal.deferUpdate();
		} catch {
			return {} as ModalSubmitFields;
		}

		return modal.fields;
	};

	const send = async (isCancel: boolean) => {
		const panel = await sendableChannel.send({
			content: `${question}\n3分経過すると処理が中断します。`,
			components: [
				new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId(okCustomId)
						.setLabel(okLabel)
						.setStyle(okStyle),
					new ButtonBuilder()
						.setCustomId(noCustomId)
						.setLabel(noLabel)
						.setStyle(noStyle),
				),
			],
		});
		const reply = await panel.fetch();

		let pushedButtonPanelType: ButtonInteraction<CacheType> | undefined =
			undefined;

		try {
			pushedButtonPanelType = await reply.awaitMessageComponent({
				componentType: ComponentType.Button,
				time: 3 * 60 * 1000,
			});
			await pushedButtonPanelType.deferUpdate();
			await pushedButtonPanelType.deleteReply();
		} catch {
			return false;
		}

		if (!pushedButtonPanelType) {
			const message = await sendableChannel.send({
				content: '3分間経過しました。処理を中断します。',
			});
			await sleep(15);
			await message.delete();
			return false;
		}

		if (isCancel && pushedButtonPanelType.customId === noCustomId) {
			const message = await sendableChannel.send({
				content: cancelMessage,
			});
			await sleep(15);
			await message.delete();
			return false;
		}

		return pushedButtonPanelType.customId === okCustomId;
	};

	const sendWithModal = async (
		isCancel: boolean,
		interaction: Interaction,
		modalOption: ModalProp,
	): Promise<{
		isAutoSend: boolean;
		isCancel: boolean;
		modalFields: ModalSubmitFields;
	}> => {
		let modalFields = {
			getField: (customId: string, type?: ComponentType) => {
				throw new Error('modalFieldsの初期化に失敗しました。');
			},
			components: [],
			fields: new Collection<string, TextInputComponent>(),
			getTextInputValue: (customId: string) => {
				throw new Error('getTextInputValueの初期化に失敗しました。');
			},
		} as ModalSubmitFields;

		const panel = await sendableChannel.send({
			content: `${question}\n3分経過すると処理が中断します。`,
			components: [
				new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId(okCustomId)
						.setLabel(okLabel)
						.setStyle(okStyle),
					new ButtonBuilder()
						.setCustomId(noCustomId)
						.setLabel(noLabel)
						.setStyle(noStyle),
				),
			],
		});
		const reply = await panel.fetch();

		let pushedButtonPanelType: ButtonInteraction<CacheType> | undefined =
			undefined;

		try {
			pushedButtonPanelType = await reply.awaitMessageComponent({
				componentType: ComponentType.Button,
				time: 3 * 60 * 1000,
			});
			panel.delete();
		} catch {
			panel.delete();
			return {
				isCancel: true,
				isAutoSend: false,
				modalFields: modalFields,
			};
		}

		if (!pushedButtonPanelType) {
			const message = await sendableChannel.send({
				content: '3分間経過しました。処理を中断します。',
			});
			await sleep(15);
			await message.delete();
			return {
				isCancel: true,
				isAutoSend: false,
				modalFields: modalFields,
			};
		}

		if (pushedButtonPanelType.customId === okCustomId) {
			modalFields =
				(await modal(pushedButtonPanelType, modalOption)) ??
				([] as ModalSubmitFields[]);
		} else {
			await pushedButtonPanelType.deferReply();
		}

		if (isCancel && pushedButtonPanelType.customId === noCustomId) {
			const message = await sendableChannel.send({
				content: cancelMessage,
			});
			await sleep(15);
			await message.delete();
			return {
				isCancel: true,
				isAutoSend: false,
				modalFields: modalFields,
			};
		}

		return {
			isCancel: false,
			isAutoSend: pushedButtonPanelType.customId === okCustomId,
			modalFields,
		};
	};

	return {
		setOkLabel,
		setOkStyle,
		setNoLabel,
		setNoStyle,
		send,
		sendWithModal,
	};
};
