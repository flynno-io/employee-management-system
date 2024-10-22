-- Seed data into the department, role, and employee tables

-- Truncate the tables before inserting new data
TRUNCATE TABLE employee, role, department RESTART IDENTITY CASCADE;

-- Insert data into the department table
INSERT INTO department (name) VALUES
('Engineering'),
('Finance'),
('Legal'),
('Sales');

-- Insert data into the role table
INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 100000.00, 1),
('Accountant', 75000.00, 2),
('Attorney', 120000.00, 3),
('Salesperson', 80000.00, 4);

-- Insert data into the employee table
INSERT INTO employee (first_name, last_name, role_id, is_manager) VALUES
('Bing', 'Crosby', 1, TRUE),
('Ella', 'Fitzgerald', 2, TRUE),
('Nat', 'King Cole', 3, TRUE),
('Judy', 'Garland', 4, TRUE),
('Cab', 'Calloway', 1, FALSE),
('Frank', 'Sinatra', 1, FALSE),
('Billie', 'Holiday', 2, FALSE),
('Ethel', 'Waters', 2, FALSE),
('Lena', 'Horne', 4, FALSE),
('Fred', 'Astaire', 4, FALSE);
