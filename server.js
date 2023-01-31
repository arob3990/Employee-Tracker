const express = require('express');
const mysql = require('mysql2');
const consoleTable = require('console.table');
const inquirer = require('inquirer');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: 'Lozinka1!',
      database: 'employee_tracker',
      socketPath: "/tmp/mysql.sock"
      
    },
    console.log(`Connected to the courses_db database.`)
  );


//Establish list of questions for prompt
function initializePrompt() {
    inquirer.prompt([
        {
            type: "list", 
            message: "What would you like to do?",
            name: "choice",
            choices: [
                "View All Employees", 
                "Add Employee", 
                "Update Employees Role",
                "View All Roles", 
                "Add Role", 
                "View All Departments", 
                "Add Department", 
                "Quit"  
            ]
        }
    ])
    // Launches the various functions to interact with the database based off of the choice made above
    .then(function(ans) {
        switch (ans.choice) {
            case "View All Employees":
                viewAllEmployees();
            break;
            case "Add Employee":
                addEmployee();
            break;
            case "Update Employees Role":
                updateEmployee();
            break;
            case "View All Roles":
                viewAllRoles();
            break;
            case "Add Role":
                addRole();
            break;
            case "View All Departments":
                viewAllDepartments();
            break;
            case "Add Department":
                addDepartments();
            break;
            case "Quit":
                db.end();
                console.log('\n You have exited the employee management program. Thanks for using! \n');
                return;
            default:
                break;
            
        }
    })
}

function viewAllEmployees () {
    db.query(`SELECT e.id, e.first_name, e.last_name, role.title, department.name, role.salary, CONCAT(m.first_name, ' ', m.last_name) manager 
                FROM employee m 
                RIGHT JOIN employee e ON e.manager_id = m.id 
                JOIN role ON e.role_id = role.id 
                JOIN department ON department.id = role.department_id 
                ORDER BY e.id;`, 
                (err, res) => {
        if (err) throw err;
        console.table(res)
        initializePrompt();
})
}

function viewAllRoles(){
    db.query(`SELECT role.title, role.id, department.name, role.salary
            FROM role
            INNER JOIN department ON department.id = role.department_id`,
            function(err, res){
                if (err) {
                    console.table(err);
                }
                console.table(res)
                initializePrompt()
            })
}

function viewAllDepartments(){
    db.query(`SELECT * FROM department`, function(err,res){
        if (err) {
            console.table(err);
        }
        console.table(res)
        initializePrompt();
    })
};

function addDepartments(){
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Please enter in the name of the department"

        }
    ])
    .then((ans) => {
        db.query(`INSERT INTO department SET ?`,
        {
            name: ans.name
        },
        function(err, res){
            if (err) {
                console.table(err);
            }
            console.table(res)
            initializePrompt();
        }
        )
})
};




function addRole(){
    db.query(`SELECT * FROM department`, function (err, res){
        inquirer.prompt([
            {
                type: "input",
                name: "role",
                message: "Please enter the name of the role"
            },
            {
                type: "input",
                name: "salary", 
                message: "What is the salary for this role?"
            },
            {
                type: "list",
                name: "department",
                message: "Which department does this role belong to?",
                choices: () => {
                    var deptArray = [];
                    for (var i=0; i<res.length; i++) {
                        deptArray.push(res[i].name)
                    }
                    return deptArray;
                }
            }
        ]).then((ans => {
            for (var i=0; i< res.length; i++) {
                if(res[i].name === ans.department){
                    var department = res[i];
                }
            }
            
            db.query(`INSERT INTO role (title, salary,department_id) VALUES (?,?,?)`, [ans.role, ans.salary, department.id], function (err,res) {
                
            })
            console.log(`\n New role added to the database \n`)
            initializePrompt()
        }))
    })
};

function addEmployee(){
    db.query(`SELECT * FROM role`, function(err,res){
        if (err) throw err;
        let roles = res.map(role => ({name: role.title, value: role.id}));
    db.query(`SELECT * FROM employee;`, (err,res) => {
        if (err) throw err;
        let employees = res.map(employee => ({name: employee.first_name + ' ' + employee.last_name, value: employee.id}));
        inquirer.prompt([
            {
                type: "input",
                name: "firstName",
                message: "Please enter in the employee's first name"
            },
            {
                type: "input",
                name: "lastName",
                message: "Please enter in the employee's last name"
            },
            {
                type: "list",
                name: "role",
                message: "What is the employee's role?",
                choices: roles
            },
            {
                type: "list",
                name: "manager",
                message: "Please choose the employee's manager",
                choices: employees
            },
        ]).then((ans) => {
            db.query(`INSERT INTO employee SET ?`,
            {
                first_name: ans.firstName,
                last_name: ans.lastName,
                role_id: ans.role,
                manager_id: ans.manager,
            },
            (err,res) => {
                if (err) throw err;
                console.log(`Employee ${ans.firstName} ${ans.lastName} added to the database`);
                initializePrompt();
        })
        })
    })
    })
};

function updateEmployee (){
    db.query(`SELECT * FROM role;`, (err,res) => {
        if (err) throw err;
        let roles = res.map(role => ({name: role.title, value: role.id}));
    db.query(`SELECT * FROM employee;`, (err,res) => {
        if (err) throw err;
        let employees = res.map(employee => ({name: employee.first_name + ' ' + employee.last_name, value: employee.id}));
        inquirer.prompt([
            {
                type: "list", 
                name: "employee",
                message: "Which employee's role would you like to update?",
                choices: employees
            },
            {
                type: "list",
                name: "newRole",
                message: "What is the employee's new role?",
                choices: roles
            }
        ]).then((ans) => {
            db.query(`UPDATE employee SET ? WHERE ?`,
            [
                {role_id: ans.newRole,},
                {id: ans.employee,}
            ],
            (err,res) => {
                if (err) throw err;
                console.log(`Updated the employee's role in the db`);
                initializePrompt();
            })
        })
    })
    })
}

initializePrompt();

