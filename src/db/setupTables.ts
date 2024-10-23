import pg from 'pg';
const { Client } = pg;
import * as dotenv from "dotenv";
dotenv.config({});
import { connectToDb } from './connection.js';

const DB_NAME: string = process.env.DB_NAME || 'db-name';
const DB_USER: string = process.env.DB_USER || 'postgres';
const DB_HOST: string = process.env.DB_HOST || 'localhost';
const DB_PASSWORD: string = process.env.DB_PASSWORD || 'root';

async function setupTables() {

    const client = new Client({
        host: DB_HOST,
        user: DB_USER,
        database: DB_NAME,
        password: DB_PASSWORD,
        port: 5432,
    });
    
    await client.connect();
    
    const departmentTableExists = await client.query(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'department');"
    );
    if (!departmentTableExists.rows[0].exists) {
      await client.query(`CREATE TABLE department (
        id SERIAL PRIMARY KEY,
        name VARCHAR(30) UNIQUE NOT NULL
      );`);
    }

    const roleTableExists = await client.query(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role');"
    );
    if (!roleTableExists.rows[0].exists) {
      await client.query(`CREATE TABLE role (
        id SERIAL PRIMARY KEY,
        title VARCHAR(30) UNIQUE NOT NULL,
        salary DECIMAL(10, 2) NOT NULL,
        department_id INTEGER NOT NULL,
        FOREIGN KEY (department_id) REFERENCES department (id)
      )`);
    }

    const employeeTableExists = await client.query(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employee');"
    );
    if (!employeeTableExists.rows[0].exists) {
      await client.query(`CREATE TABLE employee (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(30) NOT NULL,
        last_name VARCHAR(30) NOT NULL,
        role_id INTEGER NOT NULL,
        manager_id INTEGER,
        is_manager BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (role_id) REFERENCES role (id),
        FOREIGN KEY (manager_id) REFERENCES employee (id)
      )`);
    }
    
    await client.end();
}

export default setupTables;