import z from 'zod';

export const userIdSchema = z.string().superRefine((val, ctx) => {
	if (!/\d{17,19}/.test(val)) {
		ctx.addIssue({
			message:
				'discordのユーザIDを指定してください。\nIDの確認方法は[こちら](https://support.discord.com/hc/ja/articles/206346498-%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC-%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC-%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8ID%E3%81%AF%E3%81%A9%E3%81%93%E3%81%A7%E8%A6%8B%E3%81%A4%E3%81%91%E3%82%89%E3%82%8C%E3%82%8B)です',
			path: ['ユーザ'],
			code: z.ZodIssueCode.custom,
		});
	}
});

export const channelIdSchema = z.string().superRefine((val, ctx) => {
	if (!/\d{17,19}/.test(val)) {
		ctx.addIssue({
			message:
				'discordのチャンネルIDを指定してください。\nIDの確認方法は[こちら](https://support.discord.com/hc/ja/articles/206346498-%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC-%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC-%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8ID%E3%81%AF%E3%81%A9%E3%81%93%E3%81%A7%E8%A6%8B%E3%81%A4%E3%81%91%E3%82%89%E3%82%8C%E3%82%8B)です',
			path: ['チャンネル'],
			code: z.ZodIssueCode.custom,
		});
	}
});
export const roleIdSchema = z.string().superRefine((val, ctx) => {
	if (!/\d{17,19}/.test(val)) {
		ctx.addIssue({
			message:
				'discordのロールIDを指定してください。\nIDの確認方法は[こちら](https://support.discord.com/hc/ja/articles/206346498-%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC-%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC-%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8ID%E3%81%AF%E3%81%A9%E3%81%93%E3%81%A7%E8%A6%8B%E3%81%A4%E3%81%91%E3%82%89%E3%82%8C%E3%82%8B)です',
			path: ['ロール'],
			code: z.ZodIssueCode.custom,
		});
	}
});
