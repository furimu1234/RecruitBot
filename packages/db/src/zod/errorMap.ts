import { type ZodErrorMap, type ZodTypeAny, z } from 'zod';

// pathからdescriptionを取り出すヘルパー関数
const getDescriptionFromSchema = (
	path: (string | number)[],
	root: ZodTypeAny,
): string | undefined => {
	let current: ZodTypeAny | undefined = root;

	for (const key of path) {
		if (!current || !('shape' in current._def)) return undefined;
		const shape = current._def.shape() as Record<string, ZodTypeAny>;
		current = shape[key as string];
	}

	return current?._def.description;
};

export const schemaWrapper = <T>(schema: T) => {
	//biome-ignore lint/suspicious/noExplicitAny:
	const s = schema as any;

	const customErrorMap: ZodErrorMap = (issue, ctx) => {
		const labels =
			getDescriptionFromSchema(issue.path, s) || issue.path[0] || 'この項目';

		const label = labels.toString().split(',').slice(-1)[0];

		switch (issue.code) {
			case 'too_small':
				return {
					message: `${label}では${issue.minimum}以上の値を入力してください。`,
				};
			case 'too_big':
				return {
					message: `${label}では${issue.maximum}以下の値を入力してください。`,
				};

			case 'custom':
				return {
					message: `${label}${issue.message}`,
				};
			default:
				return { message: `${label}${ctx.defaultError}` };
		}
	};

	z.setErrorMap(customErrorMap);

	return schema;
};
