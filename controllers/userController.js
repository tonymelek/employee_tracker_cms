const { prompt } = require('inquirer');
const connection = require('../config/connection')
const { employeeHandler, RoleHandler, DeptHandler, statsHandler } = require('./../config/orm')
const q0 = [{
    message: '\nPlease select one of the following options :',
    name: 'choice',
    choices: ['Employee', 'Role', 'Department', 'Statistics', 'Exit'],
    type: 'list'
}]

const question = async function () {
    const res = await prompt(q0)
    switch (res.choice) {
        case 'Employee':
            await employeeHandler()
            await question()
            break;
        case 'Role':
            await RoleHandler()
            await question()
            break;
        case 'Department':
            await DeptHandler()
            await question()
            break;
        case 'Statistics':
            await statsHandler()
            await question()
            break;
        default:
            connection.end();
            break;
    }
}
module.exports = question 