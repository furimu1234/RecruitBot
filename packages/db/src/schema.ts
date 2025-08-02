import type { ButtonStyle } from 'discord.js';
import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import type { autoSendUnit } from './handmeid';
import type { RemindIntervalUnitEn } from './zod';

/**募集情報テーブル */
export const recuritInfo = pgTable(
	'recurit_info',
	{
		id: serial('id').primaryKey(),
		creatorId: varchar('creator_id', { length: 19 }).notNull(),
		sendChannelId: varchar('send_channel_id', { length: 19 }).notNull(),
		guildId: varchar('guild_id', { length: 19 }).notNull(),
		panelId: varchar('panel_id', { length: 19 }).notNull(),
		isAutoSend: boolean('is_auto_send').notNull(),
		autoSendUnit: varchar('auto_send_unit').$type<RemindIntervalUnitEn>(),
		autoSendInt: integer('auto_send_int'),
		isSplitButtonLine: boolean('is_split_button_line').notNull(),
		//デフォルトでは募集を出してから24時間以上で削除
		autoDeleteTimeUnit: varchar('auto_delete_time_unit', {
			length: 10,
		})
			.default('h')
			.$type<autoSendUnit>(),
		autoDeleteTimeInt: integer('auto_delete_time').default(24),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index('creator_idx').on(table.creatorId),
		index('remind_info_idx').on(table.id),
	],
);

export const recruitTrigger = pgTable('recruit_trigger', {
	triggerId: varchar('trigger_id', { length: 19 }).primaryKey(),
	recruitInfoId: integer('recruit_info_id').notNull(),
});

export const autoSendInfo = pgTable(
	'auto_send_info',
	{
		id: serial('id').primaryKey(),
		targetId: varchar('target_id', { length: 19 }).notNull(),
		isSended: boolean('is_sended').default(false),
	},
	(table) => [index('target_idx').on(table.targetId)],
);

export const recuritPanelInfo = pgTable('recurit_panel_info', {
	id: serial('id').primaryKey(),
	guildId: varchar('guild_id', { length: 19 }).notNull(),
	recruitId: integer('recruit_id'),
	title: varchar({ length: 100 }).notNull(),
	description: varchar({ length: 2000 }).notNull(),
});

export const recuritPanelRightButton = pgTable('recurit_panel_right_button', {
	id: serial('id').primaryKey(),
	recruitPanelInfoId: integer('recruit_Panel_info_id'),
	title: varchar({ length: 100 }).notNull(),
	description: varchar({ length: 2000 }).notNull(),
	name: varchar('name', { length: 50 }).notNull(),
	customId: varchar('custom_id', { length: 100 }).notNull(),
	style: integer('style').notNull().$type<ButtonStyle>(),
	isAutoSend: boolean('is_auto_send').notNull(),
	row: integer('row').notNull(),
	roleId: varchar('role_id', { length: 19 }).notNull(),
	message: varchar('message', { length: 2000 }).notNull(),
});

export const recuritPanelBottomButton = pgTable('recurit_panel_bottom_button', {
	id: serial('id').primaryKey(),
	recruitPanelInfoId: integer('recruit_Panel_info_id'),
	name: varchar('name', { length: 50 }).notNull(),
	customId: varchar('custom_id', { length: 100 }).notNull(),
	style: integer('style').notNull().$type<ButtonStyle>(),
	isAutoSend: boolean('is_auto_send').notNull(),
	row: integer('row').notNull(),
	col: integer('col').notNull(),
	roleId: varchar('role_id', { length: 19 }).notNull(),
	message: varchar('message', { length: 2000 }).notNull(),
});

export const recuritInfoRelations = relations(recuritInfo, ({ one }) => ({
	panelInfo: one(recuritPanelInfo, {
		fields: [recuritInfo.id],
		references: [recuritPanelInfo.recruitId],
	}),
}));
export const recuritPanelInfoRelations = relations(
	recuritPanelInfo,
	({ one, many }) => ({
		recruit: one(recuritInfo, {
			fields: [recuritPanelInfo.recruitId],
			references: [recuritInfo.id],
		}),
		rightButtons: many(recuritPanelRightButton),
		bottomButtons: many(recuritPanelBottomButton),
	}),
);

export const recuritPanelRightButtonRelations = relations(
	recuritPanelRightButton,
	({ one }) => ({
		panel: one(recuritPanelInfo, {
			fields: [recuritPanelRightButton.recruitPanelInfoId],
			references: [recuritPanelInfo.id],
		}),
	}),
);

export const recuritPanelBottomButtonRelations = relations(
	recuritPanelBottomButton,
	({ one }) => ({
		panel: one(recuritPanelInfo, {
			fields: [recuritPanelBottomButton.recruitPanelInfoId],
			references: [recuritPanelInfo.id],
		}),
	}),
);
