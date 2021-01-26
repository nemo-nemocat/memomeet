const mysql = require("mysql");

const connection = mysql.createConnection({
    host: 'localhost',
    post: 3000,
    user: 'root',
    password: 'root',
    database: 'memomeet'
});

module.exports = connection;