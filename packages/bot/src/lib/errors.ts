export const Messages = {
	//biome-ignore lint/suspicious/noExplicitAny:
	W001: (data: any) => '本当にこのデータを削除しますか？\n', //TODO: データ変換処理
	E001: () => '予期しないエラーが発生しました。',
	E002: (message: string) =>
		`パラメータの入力方法が間違ってます。\n以下を修正してください。\n${message}`,
	E003: (min: number, max: number) => `${min}以上${max}未満で指定してください`,
	E004: () => 'この機能は自分が作成したデータのみ編集できます。',
	E005: () => 'この機能は自分が作成したデータのみ削除できます。',
	E006: () => 'この機能は自分が作成したデータのみ終了できます。',
	E007: () =>
		'日時データの作成に失敗しました。再度パラメータを確認して実行してください。',
	E008: () =>
		'DISCORD側でエラーが発生しました。時間をおいてもう一度実行してみてください。',
};

type MessageCode = keyof typeof Messages;
