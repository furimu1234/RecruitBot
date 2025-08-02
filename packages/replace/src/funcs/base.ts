/**ベース置換 */
interface IBaseReplace {
	/**wwww...を草に置換する */
	kusa: (baseText: string) => string;
}

export const BaseReplace = (): IBaseReplace => {
	const kusa = (baseText: string): string => {
		return baseText.replace(/w{4,}/g, '草');
	};

	return {
		kusa,
	};
};
