import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';

import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const pool = new Pool({
	connectionString: process.env.PG_URL,
});

const sql = readFileSync(path.join('./initSqls/main.sql'), 'utf-8');

const main = async () => {
	await pool.query(sql);
	await pool.end();
};
main();
