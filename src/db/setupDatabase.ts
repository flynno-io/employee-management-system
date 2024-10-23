import pg from 'pg';
const { Client } = pg;
import * as dotenv from "dotenv";
dotenv.config({});
import { connectToDb } from './connection.js';

const DB_NAME: string = process.env.DB_NAME || 'db-name';
const DB_USER: string = process.env.DB_USER || 'postgres';
const DB_HOST: string = process.env.DB_HOST || 'localhost';
const DB_PASSWORD: string = process.env.DB_PASSWORD || 'root';

async function setupDatabase() {

    const client = new Client({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        port: 5432,
    });
    
    await client.connect();
    
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${DB_NAME}'`);
    
    if (res.rowCount === 0) {
        console.log(`${DB_NAME} database not found, creating it.`);
        await client.query(`CREATE DATABASE "${DB_NAME}";`);
        console.log(`created database ${DB_NAME}.`);
    } else {
        console.log(`${DB_NAME} database already exists.`);
    }
    await client.end();
}

export default setupDatabase;