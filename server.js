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

  function getManagers(employees) {
    db.query(`SELECT * FROM employee`, function(err,res){
        if (err) {
            console.error(err);
            return;
        }
    })
    let managers = [];
    for (let employee of employees) {
      if (!managers.some(manager => manager.id === employee.manager_id)) {
        managers.push(employees.find(e => e.id === employee.manager_id));
      }
    }
    return managers.filter(manager => manager !== undefined);
  }

var employees = [];
var managers = [];



function getManagers(employees) {
    let managers = []; 
    for (let employee of employees) {

      if (!managers.some(manager => manager?.id === employee.manager_id)) {
        managers.push(employees.find(e => e.id === employee.manager_id));
      }
    }
    return managers.filter(manager => manager !== undefined);
  }


const getEmployeesAndManagers = () => {
  // query the database for employees
  db.query('SELECT * FROM employee', function (err, rows, fields) {
    if (err) {
      console.error(err);
      return;
    }
    employees = rows;
    // console.log(employees)    
    // call the getManagers function and log the result
    managers = getManagers(employees);
    // console.log(managers);
  });
}



function initializePrompt() {
    inquirer.prompt([
        {
            type: "list", 
            message: "What would you like to do?",
            name: "choice",
            choices: [
                "View All Employees", // done
                "Add Employee",
                "Update Employees Role",
                "View All Roles", //done
                "Add Role",
                "View All Departments", //done
                "Add Department", // done
                "Quit"  
            ]
        }
    ])
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
        }
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
    db.query(`SELECT * FROM departments`, function(err,res){
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
            name: res.name
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
        }))
    })
};

function addEmployee(){
    db.query(`SELECT * FROM role`, function(err,res){
        console.log
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
                choices: () => {
                    var array = [];
                    for (var i=0; i<res.length; i++) {
                        array.push(res[i].title)
                    }
                    var newArray = [...new Set(array)];
                    return newArray;
                }
            },
            {
                type: "list",
                name: "manager",
                message: "Please choose the employee's manager",
                choices: () => {getEmployeesAndManagers()
                    return managers.first_name}
            },
           

        ]).then((ans => {
            var title 
            for (var i=0; i< res.length; i++) {
                if(res[i].title === ans.role){
                    title = res[i];
                }
            }
            var first_name 
            for (var i=0; i<res.length; i++) {
                if (res[i].first_name === ans.manager){
                 first_name = res[i];
                }
            }
            console.log(title)
            // console.log(first_name)
            // console.log(res[i].first_name, ans.first_name)
            console.log(ans)
            console.log("first_name ", ans.firstName, " last name ", ans.lastName, " role_id ", title.id, "managerID", first_name.id )
        
        // db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`, [ans.firstName, ans.lastName, title.id, first_name.id], function(err,res){
      
        // })
    }))
})
};

initializePrompt();