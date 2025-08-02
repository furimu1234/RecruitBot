declare namespace NodeJS {
	interface ProcessEnv {
		readonly TOKEN: string;
		readonly PG_URL: string;
	}
}
