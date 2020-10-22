const { prompt } = require('inquirer');
const asyncQuery = require('./../employee_tracker')
const q1c = [{
    message: '\nPlease select one of the following options :',
    name: 'choice',
    choices: ['View All Departments', 'Add Department', 'Remove Department', 'Update Department'],
    type: 'list'
}]
const DeptHandler = async function () {
    const res = await prompt(q1c)
    const deptQ = [{
        message: `\nWhat is the department's name?`,
        name: 'name',
        type: 'input'
    }]
    let deptR = [{
        message: `\n Please, Selec a department`,
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
            await asyncQuery(`UPDATE department SET name='${ans.name}' where id=${result[0].id}`)
            break;
    }
    await question()
}

module.exports = DeptHandler;