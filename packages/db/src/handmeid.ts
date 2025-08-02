/**自動送信-単位 */
export const autoSendUnit = {
	月: 'M',
	日: 'd',
	時間: 'h',
	分: 'm',
} as const;

export type autoSendUnit = typeof autoSendUnit;
export type autoSendUnitJp = (typeof autoSendUnit)[keyof typeof autoSendUnit];
