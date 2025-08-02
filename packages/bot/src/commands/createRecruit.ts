import {
	type BottomButtonCreateInfo,
	type RightButtonCreateInfo,
	createRecruit,
	createRecruitTrigger,
	isExistsPanelTitle,
	type recuritPanelBottomButton,
	type recuritPanelRightButton,
} from '@recruit/db';
import {
	confirmDialog,
	deleteMessages,
	generateRandomString,
	selector,
	sendMessageThenDelete,
} from '@recruit/lib';
import {
	ButtonStyle,
	ChannelType,
	type Guild,
	type GuildBasedChannel,
	type Interaction,
	MessageFlags,
	type Role,
	type SendableChannels,
	SlashCommandBuilder,
	SlashCommandChannelOption,
	SlashCommandRoleOption,
	SlashCommandStringOption,
	TextInputBuilder,
	TextInputStyle,
	channelMention,
} from 'discord.js';
import type { sectionWithButtonType } from '../components/addSectionWith';
import {
	type bottomButtonInfo,
	createSimpleBottomButtonInfo,
	makeBottomButtonExamplePanelComponent,
	makeBottomButtonPanelComponent,
} from '../components/recruitPanel/bottomButtonPanelComponent';
import {
	createRightButtonInfoHelper,
	makeRightButtonExamplePanelComponent,
	makeRightButtonPanelComponent,
	type rightButtonInfo,
} from '../components/recruitPanel/rightButtonPanelComponent';
import { container } from '../container';
export const data = new SlashCommandBuilder()
	.setName('募集パネル作成')
	.setDescription('募集パネルを登録します')
	.addChannelOption(
		new SlashCommandChannelOption()
			.setName('募集パネル作成チャンネル')
			.setDescription('暮秋パネルを作成するチャンネル。')
			.setRequired(true)
			.addChannelTypes(
				ChannelType.GuildText,
				ChannelType.GuildStageVoice,
				ChannelType.GuildVoice,
			),
	)
	.addStringOption(
		new SlashCommandStringOption()
			.setName('パネルタイトル')
			.setDescription('募集パネルのタイトル')
			.setRequired(true)
			.setMaxLength(50),
	)
	.addStringOption(
		new SlashCommandStringOption()
			.setName('パネル説明')
			.setDescription('どのような趣旨の募集パネルか(一行で)')
			.setRequired(true)
			.setMaxLength(50),
	)
	.addRoleOption(
		new SlashCommandRoleOption()
			.setName('雑談募集ロール')
			.setDescription('雑談募集をするときに通知をするロール')
			.setRequired(false),
	)
	.addRoleOption(
		new SlashCommandRoleOption()
			.setName('作業募集ロール')
			.setDescription('作業募集をするときに通知をするロール')
			.setRequired(false),
	)
	.addRoleOption(
		new SlashCommandRoleOption()
			.setName('ゲーム募集ロール')
			.setDescription('ゲーム募集をするときに通知をするロール')
			.setRequired(false),
	);

export async function execute(interaction: Interaction) {
	if (!interaction.isChatInputCommand()) return;
	if (!container.current) return;

	const interactionChannel = interaction.channel;

	if (!interactionChannel || !interactionChannel.isSendable()) return;

	const guild = interaction.guild;

	if (!guild) return;

	await interaction.deferReply();

	// 募集パネル作成チャンネルチェック

	const sendRecuritPanelChannelId = interaction.options.get(
		'募集パネル作成チャンネル',
	)?.value;

	if (!sendRecuritPanelChannelId) {
		interaction.followUp({
			content:
				'募集パネル作成チャンネルが見つかりませんでした。再度実行してみてください。',
		});
		return;
	}

	const sendRecruitPanelChannel = guild.channels.cache.get(
		sendRecuritPanelChannelId.toString(),
	);

	if (!sendRecruitPanelChannel || !sendRecruitPanelChannel.isSendable()) {
		interaction.followUp({
			content:
				'募集パネル作成チャンネルが見つかりませんでした。再度実行してみてください。',
		});
		return;
	}

	// 募集パネルのタイトルと説明
	const panelTitle =
		interaction.options.getString('パネルタイトル') ?? 'パネルタイトル';
	const panelDescription =
		interaction.options.getString('パネル説明') ?? 'パネル種類';

	const store = container.current.getDataStore();

	const isExists = await store.do(async (db) => {
		return await isExistsPanelTitle(db, guild.id, panelTitle);
	});
	console.log(isExists);

	if (isExists) {
		sendMessageThenDelete(
			{
				sleepSecond: 15,
				content:
					'そのタイトルはすでに別のパネルで使用してます。違うタイトルを指定してください。',
			},
			interaction,
		);
		return;
	}

	//ロール取得

	const speakingRole = interaction.options.getRole('雑談募集ロール');
	const workRole = interaction.options.getRole('作業募集ロール');
	const gameRole = interaction.options.getRole('ゲーム募集ロール');

	//パネル種類選択
	const bottomButtonPanel = await interactionChannel.send({
		components: [makeBottomButtonExamplePanelComponent()],
		flags: MessageFlags.IsComponentsV2,
	});
	const rightButtonPanel = await interactionChannel.send({
		components: [makeRightButtonExamplePanelComponent()],
		flags: MessageFlags.IsComponentsV2,
	});

	const buttonPanelTypeDiaglog = confirmDialog(
		interactionChannel,
		'どちらのパネルタイプでパネルを作成しますか？',
	);
	buttonPanelTypeDiaglog.setOkLabel('パネル種類1');
	buttonPanelTypeDiaglog.setNoLabel('パネル種類2');
	buttonPanelTypeDiaglog.setNoStyle(ButtonStyle.Primary);
	const isSplitButtonLine = await buttonPanelTypeDiaglog.send(false);

	//パネル作成
	const rightSections: sectionWithButtonType[] = [];
	let bottomRows: {
		label: string;
		customId: string;
		style: ButtonStyle;
		roleId: string;
	}[] = [];

	const panel = await sendRecruitPanelChannel.send({
		content: 'ここにパネルを作成',
	});
	const panelId = panel.id;

	const rightButtonInfos: rightButtonInfo[] = [];
	const bottomButtonInfos: bottomButtonInfo[] = [];

	if (speakingRole) {
		rightButtonInfos.push(
			createRightButtonInfoHelper(
				speakingRole,
				ButtonStyle.Success,
				panel.id,
				'雑談募集',
			),
		);
		bottomButtonInfos.push(
			createSimpleBottomButtonInfo(
				speakingRole,
				ButtonStyle.Success,
				panel.id,
				'雑談募集',
			),
		);
	}
	if (gameRole) {
		rightButtonInfos.push(
			createRightButtonInfoHelper(
				gameRole,
				ButtonStyle.Primary,
				panel.id,
				'ゲーム募集',
			),
		);
		bottomButtonInfos.push(
			createSimpleBottomButtonInfo(
				gameRole,
				ButtonStyle.Primary,
				panel.id,
				'ゲーム募集',
			),
		);
	}
	if (workRole) {
		rightButtonInfos.push(
			createRightButtonInfoHelper(
				workRole,
				ButtonStyle.Secondary,
				panel.id,
				'作業募集',
			),
		);
		bottomButtonInfos.push(
			createSimpleBottomButtonInfo(
				workRole,
				ButtonStyle.Secondary,
				panel.id,
				'作業募集',
			),
		);
	}

	//右ボタン
	if (!isSplitButtonLine) {
		const componentInfo = makeRightButtonPanelComponent(
			panelTitle,
			panelDescription,
			rightButtonInfos,
		);
		rightSections.push(...componentInfo.sections);

		panel.edit({
			content: null,
			components: [componentInfo.component],
			flags: MessageFlags.IsComponentsV2,
		});
		//下ボタン
	} else {
		const recruitPanelComponentInfo = makeBottomButtonPanelComponent(
			panelTitle,
			panelDescription,

			bottomButtonInfos,
		);
		bottomRows = recruitPanelComponentInfo.buttonsOptions;
		panel.edit({
			content: null,
			components: [recruitPanelComponentInfo.component],
			flags: MessageFlags.IsComponentsV2,
		});
	}

	// 自動で送信するか

	let autoSendContent =
		'数分間募集をしなかった場合、BOTが自動で募集文を作成するようにしますか？\n';
	autoSendContent += '- 時間の単位は**h**もしくは**m**で入力してください。\n';
	autoSendContent += '- 1時間VCに入らなかった場合自動送信する場合: 1h\n';
	autoSendContent += '- 30分VCに入らなかった場合自動送信する場合: 30m\n';

	const isAutoSendDialog = confirmDialog(interactionChannel, autoSendContent);
	isAutoSendDialog.setOkLabel('自動で送信');
	isAutoSendDialog.setNoLabel('送信しない');
	const isAutoSendCustomId = generateRandomString();
	//自動送信までの時間の入力欄カスタムID
	const waitAutoSendTimeCustomId = `get_auto_send_by:${generateRandomString()}`;
	const waitAutoSendTimeUnitCustomId = `get_auto_send_unit_by:${generateRandomString()}`;

	const isAutoSend = await isAutoSendDialog.sendWithModal(false, interaction, {
		customId: isAutoSendCustomId,
		title: '自動で送信するまでの時間を分単位で入力してください',
		fields: [
			new TextInputBuilder()
				.setLabel('自動送信までの時間(数値のみ)')
				.setCustomId(waitAutoSendTimeCustomId)
				.setStyle(TextInputStyle.Short)
				.setMaxLength(10)
				.setRequired(true),
			new TextInputBuilder()
				.setLabel('自動送信までの時間(hもしくはm)')
				.setCustomId(waitAutoSendTimeUnitCustomId)
				.setStyle(TextInputStyle.Short)
				.setMaxLength(1)
				.setRequired(true),
		],
	});
	if (isAutoSend.isCancel) return;

	let triggerChannels: GuildBasedChannel[] = [];
	let autoSendRole: Role | undefined = undefined;
	let autoSendInt = 0;
	let autoSendUnit: 'm' | 'h' = 'm';

	let settingContent = `- 募集パネル作成チャンネル: ${channelMention(sendRecruitPanelChannel.id)}\n`;
	settingContent += `- パネルタイプ: ${isSplitButtonLine ? 'パネル種類2' : 'パネル種類1'}\n`;
	settingContent += `- 募集がなかった場合の自動送信有効状況: ${isAutoSend.isAutoSend ? '自動送信する' : '自動送信しない'}\n`;

	if (isAutoSend.isAutoSend) {
		//モーダルから自動送信までの時間を取得
		const autoSendTimeField = isAutoSend.modalFields.getField(
			waitAutoSendTimeCustomId,
		);
		const autoSendTimeUnitField = isAutoSend.modalFields.getField(
			waitAutoSendTimeUnitCustomId,
		);

		if (!['h', 'm'].includes(autoSendTimeUnitField.value.toLocaleLowerCase())) {
			sendMessageThenDelete(
				{
					content: 'hもしくはmで入力してください。処理をキャンセルしました。',
					sleepSecond: 15,
				},
				interaction,
			);
			return;
		}
		if (!Number.parseInt(autoSendTimeField.value)) {
			sendMessageThenDelete(
				{
					content:
						'自動送信までの時間(数値のみ)は数字以外を入力しないでください。処理をキャンセルしました。',
					sleepSecond: 15,
				},
				interaction,
			);
			return;
		}

		autoSendUnit = autoSendTimeUnitField.value.toLowerCase() as 'h' | 'm';

		autoSendInt = Number.parseInt(autoSendTimeField.value);

		settingContent += `- 自動送信までの時間: ${autoSendTimeField.value}`;

		//vc or カテゴリーチャンネルID指定
		const VCSelector = selector(
			interactionChannel,
			`自動送信のトリガーとなるVCもしくはカテゴリーを複数選択してください。(最大:20チャンネルで登録数が増えると登録に時間がかかります)\n\n※すでに設定がある場合はスキップされ、以下の設定は共有されます。\n\n${settingContent}`,
		);
		VCSelector.setMaxSize(20);

		triggerChannels = await VCSelector.channel(
			guild,
			ChannelType.GuildVoice,
			ChannelType.GuildCategory,
		);

		const autoSendReuritRoleSelector = selector(
			interactionChannel,
			'自動でどのロールに募集しますか？1つ選んでください。',
		);

		const autoSendRoles = await autoSendReuritRoleSelector.role(guild);

		if (autoSendRoles.length === 0) {
			sendMessageThenDelete(
				{
					content:
						'自動募集するロールが見つかりませんでした。自動募集をオフにします。',
					sleepSecond: 15,
				},
				undefined,
				interactionChannel,
			);
		} else {
			autoSendRole = autoSendRoles[0];
		}
	}
	//いる？
	//triggerChannels.push(sendRecruitPanelChannel);

	await store.do(async (db) => {
		const rightButtonOptions: RightButtonCreateInfo[] = rightSections.map(
			(section, i) => {
				return {
					name: section.buttonLabel,
					customId: section.buttonCustomId,
					title: section.contents[0],
					style: section.buttonStyle ?? ButtonStyle.Secondary,
					description: section.contents[1],
					isAutoSend: autoSendRole ? section.roleId === autoSendRole.id : false,
					row: i,
					roleId: section.roleId,
				};
			},
		);
		const bottomButtonOptions: BottomButtonCreateInfo[] = bottomRows.map(
			(row, i) => {
				console.log(autoSendRole?.id, row.roleId);

				return {
					name: row.label,
					style: row.style,
					customId: row.customId,
					isAutoSend: autoSendRole ? autoSendRole.id === row.roleId : false,

					row: 0,
					col: i,
					roleId: row.roleId,
				};
			},
		);

		const modelId = await createRecruit(
			db,
			{
				guildId: guild.id,
				panelId,
				creatorId: interaction.user.id,
				sendChannelId: sendRecruitPanelChannel.id,
				isAutoSend: isAutoSend.isAutoSend,
				autoSendUnit: autoSendUnit,
				autoSendInt,
				isSplitButtonLine,
				createdAt: interaction.createdAt,
				updatedAt: interaction.createdAt,
			},
			{
				guildId: guild.id,
				title: panelTitle,
				description: panelDescription,
			},
			isSplitButtonLine ? undefined : rightButtonOptions,
			isSplitButtonLine ? bottomButtonOptions : undefined,
		);

		await createRecruitTrigger(
			db,
			triggerChannels.map((x) => {
				return {
					triggerId: x.id,
					recruitInfoId: modelId,
				};
			}),
		);
	});

	deleteMessages([rightButtonPanel, bottomButtonPanel]);

	let content = '# 募集パネルを作成しました。\n';
	content += '### 募集内容編集コマンドがおすすめ!\n';
	content += '- 雑談・作業・ゲーム以外の募集内容の追加\n';
	content += '- 募集送信後自動削除の時間指定・削除の無効化\n';
	content += '- 募集自動送信の時間単位での指定\n';
	content += 'などの設定項目が追加されます';

	await interaction.followUp({
		content,
	});
}

export const selectTriggerChannelsWithRole = async (
	interactionChannel: SendableChannels,
	guild: Guild,
	question: string,
	buttonData: {
		rights: (typeof recuritPanelRightButton.$inferSelect)[];
		bottoms: (typeof recuritPanelBottomButton.$inferSelect)[];
	},
) => {
	let triggerChannels: GuildBasedChannel[] = [];
	let autoSendRole: Role | undefined = undefined;

	//vc or カテゴリーチャンネルID指定
	const VCSelector = selector(
		interactionChannel,
		`自動送信のトリガーとなるVCもしくはカテゴリーを複数選択してください。(最大:20チャンネルで登録済みのトリガーチャンネルも再度登録してください。)\n\n※すでに設定がある場合はスキップされ、以下の設定は共有されます。\n\n${question}`,
	);
	VCSelector.setMaxSize(20);

	triggerChannels = await VCSelector.channel(
		guild,
		ChannelType.GuildVoice,
		ChannelType.GuildCategory,
	);

	let options: { name: string; value: string }[] = [];

	if (buttonData.bottoms.length > 0) {
		options = buttonData.bottoms
			.map((x) => {
				const role = guild.roles.cache.get(x.roleId);
				if (!role) return;

				return {
					name: role.name,
					value: x.roleId,
				};
			})
			.filter((x) => !!x);
	} else {
		options = buttonData.rights
			.map((x) => {
				const role = guild.roles.cache.get(x.roleId);
				if (!role) return;
				return {
					name: role.name,
					value: x.roleId,
				};
			})
			.filter((x) => !!x);
	}

	const autoSendReuritRoleSelector = selector(
		interactionChannel,
		'自動でどのロールに募集しますか？1つ選んでください。',
	);

	const autoSendRoles = await autoSendReuritRoleSelector.string(
		'自動送信するロールを選んでね!',
		options,
	);

	if (autoSendRoles.length === 0) {
		sendMessageThenDelete(
			{
				content: '自動募集するロールが見つかりませんでした。処理を終了します。',
				sleepSecond: 15,
			},
			undefined,
			interactionChannel,
		);
		return { triggerChannels, autoSendRole };
	}
	const roleId = autoSendRoles[0];
	autoSendRole = guild.roles.cache.get(roleId);

	return { triggerChannels, autoSendRole };
};
