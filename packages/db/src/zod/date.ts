import { parseDateWithTimezone } from '@recruit/lib';
import z from 'zod';

export const unixTimestampSchema = z.number().int().nonnegative();

export const daySchema = z
	.object({
		month: z.number().int().min(1).max(12).nullish(),
		day: z.number().int().min(1).max(31).nullish(),
	})
	.superRefine(({ month, day }, ctx) => {
		if (!day || !month) return;

		const now = new Date();
		const currentMonth = now.getMonth() + 1;

		// 入力が過去の月なら翌年として扱う
		const year =
			month < currentMonth ? now.getFullYear() + 1 : now.getFullYear();

		const date = new Date(year, month - 1, day);
		if (
			!(
				date.getFullYear() === year &&
				date.getMonth() === month - 1 &&
				date.getDate() === day
			)
		) {
			ctx.addIssue({
				message: '存在しない日付です。正しい日時を指定してください。',
				path: ['日'],
				code: z.ZodIssueCode.custom,
			});
		}
	});

/**
 * yyyy-MM-ddThh:mm:ss(z)形式化を調べるスキーマ
 */
export const ISOSchema = z.string().refine(
	(arg) => {
		if (arg === '{now}') return true;

		const value = parseDateWithTimezone(arg);

		return value.toISO() !== null;
	},
	{
		message: '不正な値が入力されました。もう一度確認してください。',
		path: ['iso8601'],
	},
);
