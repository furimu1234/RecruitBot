/**
 * 指定長のランダム文字列を生成する
 * @param length 生成する文字数（デフォルトは 10）
 */
export const generateRandomString = (length = 10): string => {
	const chars =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + // 大文字
		'abcdefghijklmnopqrstuvwxyz' + // 小文字
		'0123456789'; // 数字
	let result = '';
	for (let i = 0; i < length; i++) {
		// Math.random() 版（シンプルだが暗号論的には弱い）
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
};
