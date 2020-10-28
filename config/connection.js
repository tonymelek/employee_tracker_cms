const { createConnection } = require('mysql');
// Connection attributes
const connection = createConnection({
    host: "localhost",
    port: 3306,// Your port; if not 3306
    user: "admin",// Your username
    password: "admin",// Your password
    database: "emplyoyee_tracker_db"
});
module.exports = connection
