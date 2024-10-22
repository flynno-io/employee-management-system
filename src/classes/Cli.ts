import dotenv from 'dotenv';
dotenv.config();
import { pool, connectToDb } from '../connection.js';
import { QueryResult } from 'pg';

await connectToDb();
class Cli {
  exit: boolean = false;
  
  startCLi(): void {
    pool.query('SELECT * FROM employee;', (err: Error, result: QueryResult) => {
      if (err) {
        console.log(err);
      } else if (result) {
        console.log(result);
      }
    });
  }
}

export default Cli;