const connection = require('./connection')
const { promisify } = require('util')
const { prompt } = require('inquirer');
//Make  Async Query
const asyncQuery = promisify(connection.query).bind(connection);

//get new Employee Details
const employee_details = [
    {
        message: `\nWhat is the employee's first name?`,
        name: 'first_name',
        type: 'input'

    },
    {
        message: `\nWhat is the employee's last name?`,
        name: 'last_name',
        type: 'input'
    },
    {
        message: `\nWhat is the employee's role?`,
        name: 'role',
        type: 'list'
    },
    {
        message: `\nWho is the employee's manager?`,
        name: 'manager',
        type: 'list'
    }, {
        message: `\nIs this employee managing other employees?`,
        name: 'is_manager',
        type: 'list',
        choices: ['Yes', 'No']
    }
]
const q1a = [{
    message: '\nPlease select one of the following options :',
    name: 'choice',
    choices: ['View All Employees', 'View All Employees by Department', 'View All Employees by Manager', 'Add Employee', 'Remove Employee', 'Update Employee Role', 'Update Employee Manager'],
    type: 'list'
}]

const q1b = [{
    message: '\nPlease select one of the following options :',
    name: 'choice',
    choices: ['View All Roles', 'Add Role', 'Remove Role', 'Update Role'],
    type: 'list'
}]

const q1c = [{
    message: '\nPlease select one of the following options :',
    name: 'choice',
    choices: ['View All Departments', 'Add Department', 'Remove Department', 'Update Department'],
    type: 'list'
}]

async function viewer(attr1, attr2) {

    let result;
    if (arguments.length == 0) {
        result = await asyncQuery(`SELECT a.id as id,a.first_name as first_name,a.last_name as last_name,b.title as title,c.name as department,b.salary as salary,concat(d.first_name,' ',d.last_name) as manager FROM employee as a LEFT JOIN role as b on a.role_id=b.id LEFT JOIN department as c on c.id=b.department_id LEFT JOIN employee as d on a.manager_id=d.id`)
        console.table(result, ['id', 'first_name', 'last_name', 'title', 'department', 'salary', 'manager']);

    } else {
        result = await asyncQuery(`SELECT a.id as id,a.first_name as first_name,a.last_name as last_name,b.title as title,c.name as department,b.salary as salary,concat(d.first_name,' ',d.last_name) as manager FROM employee as a LEFT JOIN role as b on a.role_id=b.id LEFT JOIN department as c on c.id=b.department_id LEFT JOIN employee as d on a.manager_id=d.id where ${attr1 == 'department' ? 'c.name' : "concat(d.first_name,' ',d.last_name)"}='${attr2}'`)
        console.table(result, ['id', 'first_name', 'last_name', 'title', 'department', 'salary', 'manager']);
    }
}

async function employeeHandler() {
    const roles = await asyncQuery('SELECT * FROM  role ')
    const managers = await asyncQuery(`SELECT concat(first_name,' ',last_name) as manager_name,id FROM  employee where is_manager=true`)
    const emp_temp = await asyncQuery(`SELECT concat(first_name,' ',last_name) as employee,id from employee`)
    let emp = [{
        message: `\n Please, Select an employee `,
        name: 'name',
        type: 'list'
    }]
    emp[0].choices = emp_temp.map(item => item.employee)
    try {
        const response = await prompt(q1a)
        switch (response.choice) {
            case 'View All Employees':
                await viewer()
                break;
            case 'View All Employees by Department':
                let dept = [{
                    message: `\n Please, Select a department`,
                    name: 'name',
                    type: 'list'
                }]
                result = await asyncQuery('SELECT name FROM  department ')
                dept[0].choices = result.map(item => item.name)
                ans = await prompt(dept)
                await viewer('department', ans.name)
                break;
            case 'View All Employees by Manager':
                let mang = [{
                    message: `\n Please, Select a manager`,
                    name: 'name',
                    type: 'list'
                }]
                mang[0].choices = ['none', ...managers.map(item => item.manager_name)]
                ans = await prompt(mang)
                await viewer('manager', ans.name)
                break;
            case 'Add Employee':

                employee_details[2].choices = roles.map(item => item.title)

                employee_details[3].choices = ['none', ...managers.map(item => item.manager_name)]
                const res = await prompt(employee_details)
                let m_id = null;
                for (manager of managers) {
                    if (manager.manager_name == res.manager) {
                        m_id = manager.id
                        break;
                    }
                }
                let r_id;
                for (role of roles) {
                    if (role.title == res.role) {
                        r_id = role.id
                        break;
                    }
                }
                await asyncQuery(`INSERT INTO employee (first_name,last_name,role_id,is_manager,manager_id) values (?,?,?,?,?)`, [res.first_name, res.last_name, r_id, res.is_manager == 'Yes' ? true : false, m_id])
                break;
            case 'Remove Employee':
                ans = await prompt(emp)
                for (employee of emp_temp) {
                    if (employee.employee == ans.name) {
                        await asyncQuery(`DELETE from employee where id=?`, [employee.id])
                        break;
                    }
                }
                break;
            case 'Update Employee Role':
                ans = await prompt(emp)
                let rolesQ = [{
                    message: `\n Please, Select a role `,
                    name: 'name',
                    type: 'list'
                }]
                rolesQ[0].choices = roles.map(item => item.title);
                ans2 = await prompt(rolesQ)
                for (employee of emp_temp) {
                    if (employee.employee == ans.name) {
                        let temp_rol = (await asyncQuery(`SELECT id from role where title=?`, [ans2.name]))[0].id
                        await asyncQuery(`UPDATE employee set role_id=? where concat(first_name,' ',last_name)=? `, [temp_rol, ans.name])
                        break;
                    }
                }
                break;
            case 'Update Employee Manager':
                ans = await prompt(emp)
                employee_details[3].choices = ['none', ...managers.map(item => item.manager_name)]
                ans2 = await prompt(employee_details[3])
                for (employee of emp_temp) {
                    if (employee.employee == ans.name) {
                        let temp_mgr = (await asyncQuery(`SELECT id from employee where concat(first_name,' ',last_name)=?`, [ans2.manager]))[0].id
                        await asyncQuery(`UPDATE employee set manager_id=? where concat(first_name,' ',last_name)=? `, [temp_mgr, ans.name])
                        break;
                    }
                }
                break;
            default:

                break;
        }
    } catch (err) {
        console.log(err);
    }

}

async function RoleHandler() {
    try {
        const res = await prompt(q1b)
        const roleQ = [{
            message: `\nWhat is the role title?`,
            name: 'title',
            type: 'input'
        }, {
            message: `\nWhat is the role salary?`,
            name: 'salary',
            type: 'input'
        },
        {
            message: `\n Please, Select a department`,
            name: 'department',
            type: 'list'
        }

        ]
        let roleR = [{
            message: `\n Please, Select a role`,
            name: 'name',
            type: 'list'
        }]
        let result;
        let ans;
        switch (res.choice) {
            case 'View All Roles':
                result = await asyncQuery('SELECT a.id as id,a.title as title,a.salary as salary,b.name as department FROM  role as a LEFT JOIN department as b on b.id=a.department_id')
                console.table(result, ['id', 'title', 'salary', 'department']);
                break;
            case 'Add Role':
                result = await asyncQuery('SELECT * FROM  department ')
                roleQ[2].choices = result.map(item => item.name)
                ans = await prompt(roleQ)
                const dept = (await asyncQuery('SELECT id from department where name=?', [ans.department]))[0].id
                await asyncQuery(`INSERT INTO role (title,salary,department_id) values (?,?,?)`, [ans.title, ans.salary, dept])
                break;
            case 'Remove Role':
                result = await asyncQuery('SELECT * FROM  role ')
                roleR[0].choices = result.map(item => item.title)
                ans = await prompt(roleR)
                await asyncQuery('DELETE from role where title=?', [ans.name])
                break;
            default:
                result = await asyncQuery('SELECT * FROM  role ')
                roleR[0].choices = result.map(item => item.title)
                ans = await prompt(roleR)
                console.log(ans);
                let result2 = await asyncQuery('SELECT * FROM  department ')
                roleQ[2].choices = result2.map(item => item.name)
                let ans2 = await prompt(roleQ)
                let temp_id = (await asyncQuery(`SELECT id from role where title=?`, [ans.name]))[0].id
                let dept2 = (await asyncQuery('SELECT id from department where name=?', [ans2.department]))[0].id
                await asyncQuery(`UPDATE role set title=?,salary=?,department_id=? where id=?`, [ans2.title, ans2.salary, dept2, temp_id])
                break;
        }
    } catch (err) {
        console.log(err);
    }
}


const DeptHandler = async function () {
    try {
        const res = await prompt(q1c)
        const deptQ = [{
            message: `\nWhat is the department's name?`,
            name: 'name',
            type: 'input'
        }]
        let deptR = [{
            message: `\n Please, Select a department`,
            name: 'name',
            type: 'list'
        }]
        let result;
        let ans;
        switch (res.choice) {
            case 'View All Departments':
                result = await asyncQuery('SELECT * FROM  department ')
                console.table(result, ['id', 'name']);
                break;
            case 'Add Department':
                ans = await prompt(deptQ)
                await asyncQuery('INSERT INTO department (name) values (?)', [ans.name])
                break;
            case 'Remove Department':
                result = await asyncQuery('SELECT * FROM  department ')
                deptR[0].choices = result.map(item => item.name)
                ans = await prompt(deptR)
                await asyncQuery('DELETE from department where name=?', [ans.name])
                break;
            default:
                result = await asyncQuery('SELECT * FROM  department ')
                deptR[0].choices = result.map(item => item.name)
                ans = await prompt(deptR)
                result = await asyncQuery('SELECT id FROM  department where name=?', [ans.name])
                ans = await prompt(deptQ)
                console.log(result, result[0].id, ans.name);
                await asyncQuery(`UPDATE department SET name=? where id=?`, [ans.name, result[0].id])
                break;
        }

    } catch (err) {
        console.log(err);
    }
}

async function statsHandler() {
    try {
        let deptR = [{
            message: `\n Please, Select a department`,
            name: 'name',
            type: 'list'
        }]
        let result = await asyncQuery('SELECT * FROM  department ')
        deptR[0].choices = result.map(item => item.name)
        ans = await prompt(deptR)
        let dpt_id = (await asyncQuery(`SELECT id from department where name=?`, [ans.name]))[0].id
        let sum = (await asyncQuery(`SELECT sum(b.salary) as sum FROM employee as a LEFT JOIN role as b on a.role_id=b.id  group by b.department_id  having b.department_id=?`, [dpt_id]))[0].sum
        console.log(`Budget of ${ans.name} department =${sum}`);

    }
    catch (err) {
        console.log(err);
    }
}
const employeeFunctions = { employeeHandler, RoleHandler, DeptHandler, statsHandler }
module.exports = employeeFunctions