import dotenv from 'dotenv';
dotenv.config();
import { exec } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

// Promisify the exec function for better async/await usage
const execPromise = promisify(exec);

// Define variables (use environment variables if provided)
const DB_NAME: string = process.env.DB_NAME || 'your_database_name';
const DB_USER: string = process.env.DB_USER || 'your_username';

// Paths to SQL files relative to the root directory
const SCHEMA_FILE: string = path.join(process.cwd(), 'db', 'schema.sql');
const SEED_FILE: string = path.join(process.cwd(), 'db', 'seed.sql');

// Helper function to execute shell commands
async function runCommand(command: string, description: string): Promise<void> {
  try {
    console.log(`\nRunning: ${description}...`);
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.error(`Error running ${description}:`, stderr);
      throw new Error(stderr);
    }

    console.log(stdout);
  } catch (error) {
    console.error(`Failed to execute command: ${command}\n`, error);
    throw error;
  }
}

// Main function to run schema and seed scripts
async function setupDatabase() {
  try {
    // Switch databases to allow for database creation
    await runCommand(
      `psql -U ${DB_USER} -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${DB_NAME}' AND pid <> pg_backend_pid();"`, // FIXME: the employee_db is not properly disconnecting.
      'Switching to postgres database'
    );

    // Run schema.sql to set up the database structure
    await runCommand(
      `psql -U ${DB_USER} -d ${DB_NAME} -f ${SCHEMA_FILE}`,
      'Database schema setup'
    );

    // Run seed.sql to populate the database
    await runCommand(
      `psql -U ${DB_USER} -d ${DB_NAME} -f ${SEED_FILE}`,
      'Database seeding'
    );

    console.log('\nDatabase setup and seeding completed successfully!');
  } catch (error) {
    console.error('Failed to set up and seed the database:', error);
    process.exit(1);
  }
}

// Run the database setup function
setupDatabase();
