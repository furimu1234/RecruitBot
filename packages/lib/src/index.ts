export * from './date';
export * from './random';
export * from './discord';

export const sleep = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms * 1000));
};
