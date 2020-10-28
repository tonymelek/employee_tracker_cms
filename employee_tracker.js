//Dependencies
const connection = require('./config/connection')
const { promisify } = require('util')

const figlet = require('figlet');
const question = require('./controllers/userController')

//Make  Async Connect
const asyncConnect = promisify(connection.connect).bind(connection);


// Make Async Figlet
const asyncFiglet = promisify(figlet)
//Initiation Function
async function start() {
    await asyncConnect()
    console.log("connected as id " + connection.threadId);
    const banner = await asyncFiglet('Employee Manager')
    console.log(banner);
    await question()
}
start()

