const mysql2 = require('mysql2');

var host = 'localhost';
// if (process.env.NODE_ENV === 'production') {
//     host = 'mysql-server';
// }

const connection = mysql2.createConnection({
    host: host,
    user: 'root',
    password: '',
    database: 'map_rent',
});

connection.connect((err) => {
    if (err) {
        console.log('error connecting to db');
        return;
    }
    console.log('connected to db');
});

module.exports = connection;