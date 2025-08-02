import type { RemindIntervalUnitEn } from '@recruit/db';
import { ButtonStyle } from 'discord.js';

export const buttonStyleToJp = (style: ButtonStyle) => {
	let name = '灰';

	switch (style) {
		case ButtonStyle.Danger:
			name = '赤';
			break;
		case ButtonStyle.Primary:
			name = '紫';
			break;
		case ButtonStyle.Success:
			name = '緑';
			break;
	}

	return `${name}色`;
};

export const unitToJp = (unit: RemindIntervalUnitEn | null) => {
	let value = '月';

	switch (unit) {
		case 'h':
			value = '時間';
			break;
		case 'm':
			value = '分';
			break;
		case 'd':
			value = '日';
			break;
		case null:
			value = '設定なし';
			break;
	}

	return value;
};
