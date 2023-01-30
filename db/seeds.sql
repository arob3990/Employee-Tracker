INSERT INTO department (id, name)
VALUES (1, "Sales"),
        (2, "Engineering"),
        (3, "IT"),
        (4, "Accounting"),
        (5, "Administration");


INSERT INTO role (id,title, salary, department_id)
VALUES (1,"Sales Associate", 50000,1),
        (2,"Sales Lead", 75000,1),
        (3,"IT Administrator", 105000,3),
        (4,"Accounts Receivable Accountant", 60000,4),
        (5,"Accountants Payable Accountant", 60000,4),
        (6,"Office Administrator", 55000,5),
        (7,"Office Manager", 85000,5),
        (8,"Software Engineer I", 165000,2),
        (9,"Software Engineer II", 205000,2);

INSERT INTO employee (id, first_name, last_name, manager_id, role_id)
VALUES (1, "Alex", "Robertson", null, 9),
        (2, "Bryce", "Harvey", null, 2),
        (3, "John", "Smith", 1, 8),
        (4, "Jane", "Doe", 2, 1),
        (5, "Trevor", "Balenciaga", null, 3),
        (6, "Patrizia", "Regianni", 5, 6);