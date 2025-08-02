import { parseDateWithTimezone } from '@recruit/lib';
import z from 'zod';
import { ISOSchema, daySchema } from './date';
import { userIdSchema } from './discord';
import { schemaWrapper } from './errorMap';

export const remindIntervalUnitSchema = z.union([
	z.literal('M'),
	z.literal('d'),
	z.literal('h'),
	z.literal('m'),
]);

export type RemindIntervalUnitEn = z.infer<typeof remindIntervalUnitSchema>;

export const registerRemindInfoSchema = schemaWrapper(
	z
		.object({
			creatorId: userIdSchema.describe('ユーザ'),
			remindIntervalUnit: z
				.string()
				.describe('間隔(単位)')
				.transform((arg, ctx) => arg as RemindIntervalUnitEn),
			remindIntervalInt: z.number().max(2147483647).describe('間隔(数字)'),
			numberOfReminders: z.number().min(1).max(100).describe('リマインド回数'),
			startMonth: z.number().min(1).max(12).nullish().describe('開始月'),
			startDay: daySchema.nullish().describe('開始日'),
			startHour: z
				.number()
				.max(24)
				.nonnegative()
				.nullish()
				.describe('開始時刻'),
			startMinute: z
				.number()
				.max(59)
				.nonnegative()
				.nullish()
				.describe('開始分'),
			startISO: ISOSchema.nullish().describe('iso8601'),
			remindMessage: z.string().describe('リマインドメッセージ'),
			remindChannelId: z
				.string()
				.min(17)
				.max(19)
				.describe('リマインドチャンネル'),
			createdAt: z.date(),
		})
		.superRefine(
			(
				{ startMonth, startDay, startHour, startMinute, startISO, ...rest },
				ctx,
			) => {
				if (
					!startMonth &&
					!startDay?.day &&
					!startDay?.month &&
					!startHour &&
					!startMinute &&
					!startISO
				) {
					if (!startISO) {
						ctx.addIssue({
							message:
								'リマインド開始日、もしくは形式がわかる場合はiso形式の値を入れてください。',
							path: ['開始月', '開始日', '開始時間', '開始分', 'iso8601'],
							code: z.ZodIssueCode.custom,
						});
					} else if (!parseDateWithTimezone(startISO).toISO()) {
						ctx.addIssue({
							message: 'ISO形式で入力して下さい',
							path: ['iso8601'],
							code: z.ZodIssueCode.custom,
						});
					}
				}
			},
		),
);

export type IregisterRemindInfo = z.infer<typeof registerRemindInfoSchema>;
