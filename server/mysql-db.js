const mysql = require("mysql");

/* 개발 */
if (process.env.NODE_ENV == 'development') {
    const connection = mysql.createConnection({
        host: 'localhost',
        post: 3000,
        user: 'root',
        password: 'root',
        database: 'memomeet'
    });
    module.exports = connection;
}

/* 배포 */
else if (process.env.NODE_ENV == 'production') {
    const connection = mysql.createConnection({
        host: 'us-cdbr-east-03.cleardb.com',
        post: 3306,
        user: 'b5dfcc92d33e0e',
        password: '0c8450fd',
        database: 'heroku_9c78ff95d911e67'
    });
    module.exports = connection;
}