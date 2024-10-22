import dotenv from 'dotenv';
dotenv.config();
import { pool, connectToDb } from '../connection.js';
import { QueryResult } from 'pg';
import cfonts from 'cfonts';
import inquirer from 'inquirer';
import { table } from 'table';

await connectToDb();
class Cli {
  exit: boolean = false;

  async viewAllEmployees(): Promise<void> {
    const query = `
      SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager,
      CASE
        WHEN e.is_manager = true THEN 'Yes'
        ELSE 'No'
      END AS is_manager
      FROM employee e
      LEFT JOIN role r ON e.role_id = r.id
      LEFT JOIN department d ON r.department_id = d.id
      LEFT JOIN employee m ON e.manager_id = m.id
    `;
    const result: QueryResult = await pool.query(query);
    console.log(typeof(result.rows));
    console.log(table(result.rows));
  }

  async viewAllEmployeesByDepartment(): Promise<void> {
    const query = `
      SELECT d.name AS department, e.id, e.first_name, e.last_name, r.title
      FROM employee e
      LEFT JOIN role r ON e.role_id = r.id
      LEFT JOIN department d ON r.department_id = d.id
      ORDER BY d.name
    `;
    const result: QueryResult = await pool.query(query);
    console.table(result.rows);
  }

  async viewAllEmployeesByManager(): Promise<void> {
    const query = `
      SELECT CONCAT(m.first_name, ' ', m.last_name) AS manager, e.id, e.first_name, e.last_name, r.title
      FROM employee e
      LEFT JOIN role r ON e.role_id = r.id
      LEFT JOIN employee m ON e.manager_id = m.id
      ORDER BY manager
    `;
    const result: QueryResult = await pool.query(query);
    console.table(result.rows);
  }

  async addEmployee(): Promise<void> {
    const roles = await pool.query('SELECT id, title FROM role');
    const managers = await pool.query('SELECT id, first_name, last_name FROM employee WHERE manager_id IS NULL');
    const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));
    const managerChoices = managers.rows.map(manager => ({ name: `${manager.first_name} ${manager.last_name}`, value: manager.id }));
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: 'Enter the employee\'s first name:'
      },
      {
        type: 'input',
        name: 'lastName',
        message: 'Enter the employee\'s last name:'
      },
      {
        type: 'list',
        name: 'roleId',
        message: 'Select the employee\'s role:',
        choices: roleChoices
      },
      {
        type: 'list',
        name: 'managerId',
        message: 'Select the employee\'s manager:',
        choices: managerChoices
      }
    ]);
    const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)';
    await pool.query(query, [answers.firstName, answers.lastName, answers.roleId, answers.managerId]);
    console.log('Employee added successfully!');
  }

  async removeEmployee(): Promise<void> {
    const employees = await pool.query('SELECT id, first_name, last_name FROM employee');
    const employeeChoices = employees.rows.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }));
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select the employee to remove:',
        choices: employeeChoices
      }
    ]);
    const query = 'DELETE FROM employee WHERE id = $1';
    await pool.query(query, [answers.employeeId]);
    console.log('Employee removed successfully!');
  }

  async updateEmployeeRole(): Promise<void> {
    const employees = await pool.query('SELECT id, first_name, last_name FROM employee');
    const employeeChoices = employees.rows.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }));
    const roles = await pool.query('SELECT id, title FROM role');
    const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select the employee to update:',
        choices: employeeChoices
      },
      {
        type: 'list',
        name: 'roleId',
        message: 'Select the employee\'s new role:',
        choices: roleChoices
      }
    ]);
    const query = 'UPDATE employee SET role_id = $1 WHERE id = $2';
    await pool.query(query, [answers.roleId, answers.employeeId]);
    console.log('Employee role updated successfully!');
  }

  async updateEmployeeManager(): Promise<void> {
    const employees = await pool.query('SELECT id, first_name, last_name FROM employee');
    const employeeChoices = employees.rows.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }));
    const managers = await pool.query('SELECT id, first_name, last_name FROM employee');
    const managerChoices = managers.rows.map(manager => ({ name: `${manager.first_name} ${manager.last_name}`, value: manager.id }));
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select the employee to update:',
        choices: employeeChoices
      },
      {
        type: 'list',
        name: 'managerId',
        message: 'Select the employee\'s new manager:',
        choices: managerChoices
      }
    ]);
    const query = 'UPDATE employee SET manager_id = $1 WHERE id = $2';
    await pool.query(query, [answers.managerId, answers.employeeId]);
    console.log('Employee manager updated successfully!');
  }

  async viewAllRoles(): Promise<void> {
    const query = 'SELECT r.id, r.title, r.salary, d.name AS department FROM role r LEFT JOIN department d ON r.department_id = d.id';
    const result: QueryResult = await pool.query(query);
    console.table(result.rows);
  }

  async addRole(): Promise<void> {
    const departments = await pool.query('SELECT id, name FROM department');
    const departmentChoices = departments.rows.map(department => ({ name: department.name, value: department.id }));
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the role title:'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the role salary:'
      },
      {
        type: 'list',
        name: 'departmentId',
        message: 'Select the role department:',
        choices: departmentChoices
      }
    ]);
    const query = 'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)';
    await pool.query(query, [answers.title, answers.salary, answers.departmentId]);
    console.log('Role added successfully!');
  }

  async removeRole(): Promise<void> {
    const roles = await pool.query('SELECT id, title FROM role');
    const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'roleId',
        message: 'Select the role to remove:',
        choices: roleChoices
      }
    ]);
    const query = 'DELETE FROM role WHERE id = $1';
    await pool.query(query, [answers.roleId]);
    console.log('Role removed successfully!');
  }

  async viewAllDepartments(): Promise<void> {
    const query = 'SELECT id, name FROM department';
    const result: QueryResult = await pool.query(query);
    console.table(result.rows);
  }

  async addDepartment(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter the department name:'
      }
    ]);
    const query = 'INSERT INTO department (name) VALUES ($1)';
    await pool.query(query, [answers.name]);
    console.log('Department added successfully!');
  }

  async removeDepartment(): Promise<void> {
    const departments = await pool.query('SELECT id, name FROM department');
    const departmentChoices = departments.rows.map(department => ({ name: department.name, value: department.id }));
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'departmentId',
        message: 'Select the department to remove:',
        choices: departmentChoices
      }
    ]);
    const query = 'DELETE FROM department WHERE id = $1';
    await pool.query(query, [answers.departmentId]);
    console.log('Department removed successfully!');
  }

  async exitCli(): Promise<void> {
    console.log('Exiting the application...');
    process.exit(0);
  }

  printWelcomeMessage(): void {
    cfonts.say('Employee Management CLI', {
      font: 'shade',              // define the font face
      align: 'left',            // define text alignment
      colors: ['blue', 'yellow'],  // define all colors
      background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
      letterSpacing: 1,           // define letter spacing
      lineHeight: 1,              // define the line height
      space: true,                // define if the output text should have empty lines on top and on the bottom
      maxLength: '0',             // define how many character can be on one line
    });
  }

  printActionMenu(): void {
    inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          new inquirer.Separator('--- Employee Management ---'),
          'View all employees',
          'View all employees by department',
          'View all employees by manager',
          'Add employee',
          'Remove employee',
          'Update employee role',
          'Update employee manager',
          new inquirer.Separator('--- Role Management ---'),
          'View all roles',
          'Add role',
          'Remove role',
          new inquirer.Separator('--- Department Management ---'),
          'View all departments',
          'Add department',
          'Remove department',
          new inquirer.Separator('--- Exit Application ---'),
          'Exit'
        ]
      }
    ]).then(async (answers) => {
      switch (answers.action) {
        case 'View all employees':
          await this.viewAllEmployees();
          break;
        case 'View all employees by department':
          await this.viewAllEmployeesByDepartment();
          break;
        case 'View all employees by manager':
          await this.viewAllEmployeesByManager();
          break;
        case 'Add employee':
          await this.addEmployee();
          break;
        case 'Remove employee':
          await this.removeEmployee();
          break;
        case 'Update employee role':
          await this.updateEmployeeRole();
          break;
        case 'Update employee manager':
          await this.updateEmployeeManager();
          break;
        case 'View all roles':
          await this.viewAllRoles();
          break;
        case 'Add role':
          await this.addRole();
          break;
        case 'Remove role':
          await this.removeRole();
          break;
        case 'View all departments':
          await this.viewAllDepartments();
          break;
        case 'Add department':
          await this.addDepartment();
          break;
        case 'Remove department':
          await this.removeDepartment();
          break;
        case 'Exit':
          this.exit = true;
          await this.exitCli();
          break;
      }
      if (!this.exit) {
        this.printActionMenu();
      }
    });
  }
  
  async startCLi(): Promise<void> {
    this.printWelcomeMessage();
    this.printActionMenu();
  }
}

export default Cli;