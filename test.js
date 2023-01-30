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
      port: 3306,
      database: 'employee_tracker',
      socketPath: "/tmp/mysql.sock"
      
    },
    console.log(`Connected to the courses_db database.`)
  );

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
    for (let manager of managers){
        console.log(manager.id, manager.first_name)
    }
    console.log(managers);
  });
}

getEmployeesAndManagers();

function displayManagers(){

}
displayManagers();


