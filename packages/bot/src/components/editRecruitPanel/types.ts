import type { APIRole, ButtonStyle, Role } from 'discord.js';

type IRecruitRole = Role | APIRole | null;

export interface IRecruitRoles {
	speakingRole: IRecruitRole;
	workRole: IRecruitRole;
	gameRole: IRecruitRole;
}

export interface IButtonByModel {
	name: string;
	customId: string;
	style: ButtonStyle;
}
export interface IBottomButtonByModel {
	name: string;
	customId: string;
	style: ButtonStyle;
	row: number;
	col: number;
}

export interface IRightButtonByModel extends IButtonByModel {
	title: string;
	description: string;
}
