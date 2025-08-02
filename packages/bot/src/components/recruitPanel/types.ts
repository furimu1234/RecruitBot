import type { APIRole, Role } from 'discord.js';

type IRecruitRole = Role | APIRole | null;

export interface IRecruitRoles {
	speakingRole: IRecruitRole;
	workRole: IRecruitRole;
	gameRole: IRecruitRole;
}
