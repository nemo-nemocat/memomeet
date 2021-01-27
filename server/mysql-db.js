const mysql = require("mysql");

/* 배포 */
if (process.env.NODE_ENV == 'production') {
    const connection = mysql.createConnection({
        host: 'us-cdbr-east-03.cleardb.com',
        port: 3306,
        user: 'b5dfcc92d33e0e',
        password: '0c8450fd',
        database: 'heroku_9c78ff95d911e67'
    });
    module.exports = connection;
}

/* 개발 */
else {
    const connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'memomeet'
    });
    module.exports = connection;
}
