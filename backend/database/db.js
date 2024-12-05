const mysql2 = require('mysql2');
require('dotenv').config();
var host = 'localhost';
// if (process.env.NODE_ENV === 'production') {
//     host = 'mysql-server';
// }

const connection = mysql2.createConnection({
    host: process.env.MY_IP_DATABASE || host,
    user: process.env.MY_IP_DATABASE_USER || 'root',
    password: process.env.MY_IP_DATABASE_PASSWORD || '',
    database: process.env.MY_IP_DATABASE_NAME || 'map_rent',
});

connection.connect((err) => {
    if (err) {
        console.log('error connecting to db');
        return;
    }
    console.log('connected to db');
});

module.exports = connection;