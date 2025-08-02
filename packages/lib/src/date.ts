import { DateTime } from 'luxon';

/**
 * 入力されたタイムスタンプをDateTimeにパースする
 * @param input ISO形式の文字列
 * @returns DateTime
 */
export const parseDateWithTimezone = (input: string): DateTime => {
	// 明示的なタイムゾーン付き（Zまたは±hh:mm）ならそのまま解釈
	if (/Z$|[+-]\d{2}:\d{2}$/.test(input)) {
		return DateTime.fromISO(input, { setZone: true });
	}

	// タイムゾーンなし → 日本時間と仮定して解釈
	return DateTime.fromISO(input, { zone: 'Asia/Tokyo' });
};

/**
 * 入力情報から数値と単位を取得する
 * 1h -> 1時間、1m->1分, 1h1m->1時間1分
 * @param input 入力情報
 * @returns { hours?: number, minutes?: number }
 */
export const parseInputValue = (input: string) => {
	const result: { hours?: number; minutes?: number } = {};
	const hourMatch =
		input.match(/(\d+)h/) ?? input.match(/(\d+)H/) ?? input.match(/(\d+)時間/);
	const minuteMatch =
		input.match(/(\d+)m/) ?? input.match(/(\d+)M/) ?? input.match(/(\d+)分/);
	if (hourMatch) {
		result.hours = Number.parseInt(hourMatch[1], 10);
	}
	if (minuteMatch) {
		result.minutes = Number.parseInt(minuteMatch[1], 10);
	}
	return result;
};
