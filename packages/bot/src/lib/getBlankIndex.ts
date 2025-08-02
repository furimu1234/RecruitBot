import type { recuritPanelBottomButton } from '@recruit/db';

export const getBlankIndex = (
	datas: (typeof recuritPanelBottomButton.$inferSelect)[],
) => {
	const data = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
	];

	// Setで使用済みインデックスを管理
	const usedSet = new Set<string>();
	for (const { row, col } of datas) {
		usedSet.add(`${row},${col}`);
	}

	const empty: { row: number; col: number }[] = [];

	for (let row = 0; row < data.length; row++) {
		for (let col = 0; col < data[row].length; col++) {
			if (!usedSet.has(`${row},${col}`)) {
				empty.push({ row, col });
			}
		}
	}

	return empty.reverse();
};
