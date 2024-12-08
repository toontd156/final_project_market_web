const express = require('express');
const app = express();
const PORT = 3333 || process.env.PORT;
const connection = require('./database/db');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
app.use(cors());
require('dotenv').config();
app.use(express.json());
const crypto = require("crypto");
const nodemailer = require("nodemailer");
let otpStorage = {};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/api/signup', (req, res) => {
    const { fullname, email, password, phone } = req.body;
    const queryCheck = `SELECT email, phone FROM users WHERE email = ? AND phone = ?`;
    connection.query(queryCheck, [email, phone], async (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        if (result.length > 0) {
            res.status(400).send({ status: false, message: 'Email or Phone already registered' });
        } else {
            const hash = await bcrypt.hashSync(password, 10);
            const query = `INSERT INTO users (fullname, email, password, phone) VALUES (?, ?, ?, ?)`;
            connection.query(query, [fullname, email, hash, phone], (err, result) => {
                if (err) {
                    res.status(500).send({ status: false, message: err });
                }
                res.status(200).send({ status: true, message: 'Register success' });
            });
        }
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT id, email, password, role, toggle FROM users WHERE email = ?`;
    connection.query(query, [email], async (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        if (result.length > 0) {
            const checkPassword = await bcrypt.compareSync(password, result[0].password);
            if (checkPassword) {
                if (result[0].toggle === 0) {
                    return res.status(400).send({ status: false, message: 'Your account is not active' });
                }
                const data_token = {
                    id: result[0].id,
                    email: email,
                    role: result[0].role
                }
                const token = jwt.sign(data_token, process.env.SECRET_KEY, { expiresIn: process.env.TOKEN_EXPIRATION });
                res.status(200).send({ status: true, message: 'Login success', token: token });
            } else {
                res.status(404).send({ status: false, message: 'Password wrong' });
            }
        } else {
            console.log('error');
            res.status(404).send({ status: false, message: 'Email not registered' });
        }
    });
});

app.get('/api/get_area', (req, res) => {
    const { date } = req.query;
    const query = `SELECT 
    data_zone.id, 
    data_zone.category_id, 
    data_zone.name_zone, 
    data_zone.price, 
    data_zone.rent, 
    CONCAT(category_zone.category_name, ' ', data_zone.name_zone) AS zone_name, 
    user_history.status,
    user_history.date_market,
    data_zone.toggle
    FROM 
        data_zone 
    LEFT JOIN category_zone ON 
        data_zone.category_id = category_zone.id
    LEFT JOIN user_history ON
        user_history.zone_id = data_zone.id
    `;
    connection.query(query, (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        let new_result = [];
        for (let i = 0; i < result.length; i++) {
            let sm = result[i];
            if (sm.date_market !== null) {
                if (sm.date_market === date) {
                    const checkIdInNewResult = new_result.find((item) => item.id === sm.id);
                    if (!checkIdInNewResult) {
                        new_result.push(sm);
                    } else {
                        // update status
                        checkIdInNewResult.status = sm.status;
                        checkIdInNewResult.date_market = sm.date_market;
                    }
                } else {
                    const checkIdInNewResult = new_result.find((item) => item.id === sm.id);
                    if (!checkIdInNewResult) {
                        new_result.push(sm);
                    }
                }
            } else {
                new_result.push(sm);
            }
        }
        console.log(new_result);
        res.status(200).send({ status: true, data: new_result });
    });
});

app.post('/api/shop_detail', (req, res) => {
    const { id, email } = req.body;
    const query = `SELECT shop_name, shop_detail FROM users WHERE id = ? AND email = ?`;
    connection.query(query, [id, email], async (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        if (result.length > 0) {
            res.status(200).send({ status: true, data: result[0] });
        } else {
            console.log('error');
            res.status(404).send({ status: false, message: 'Email not registered' });
        }
    });
});

app.post('/api/payment_zone', upload.single('file'), (req, res) => {
    const { area, shopName, description, price, id_user, areaIndex, zoneId, date_is_coming, nowDate, productType } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    if (!area || !shopName || !description || !price || !filePath) {
        return res.status(400).send({ status: false, message: 'All field must be filled' });
    }

    const updateUser = `UPDATE users SET shop_name = ?, shop_detail = ?, shop_type = ? WHERE id = ?`;
    connection.query(updateUser, [shopName, description, productType, id_user], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ status: false, message: 'Database Error', error: err });
        }
    });

    const query = `INSERT INTO user_history (id_user, category_id, zone_id, status, date, date_market) VALUES (?, ?, ?, ?, ?, ?)`;

    connection.query(query, [id_user, areaIndex, zoneId, 'Pending', nowDate, date_is_coming], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ status: false, message: 'Database Error', error: err });
        }
        const queryPayment = `INSERT INTO user_payment (id_user, id_history, image_name, price) VALUES (?, ?, ?, ?)`;
        connection.query(queryPayment, [id_user, result.insertId, filePath, price], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ status: false, message: 'Database Error', error: err });
            }
        });
    });


    // const queryUpdateRent = `UPDATE data_zone SET rent = 1 WHERE id = ?`;
    // connection.query(queryUpdateRent, [zoneId], (err, result) => {
    //     if (err) {
    //         console.error(err);
    //         return res.status(500).send({ status: false, message: 'Database Error', error: err });
    //     }
    // });
    res.status(200).send({ status: true, message: 'Request success' });

});

app.post('/api/request_status', (req, res) => {
    const { id, email } = req.body;
    const query = `
        SELECT 
            user_history.id, 
            user_history.category_id, 
            user_history.zone_id, 
            user_history.status, 
            user_history.date,
            user_payment.image_name, 
            user_history.date_market,
            users.email,
            users.shop_name,
            users.shop_detail,
            users.shop_type,
            CONCAT(category_zone.category_name, ' ', data_zone.name_zone) AS area
        FROM 
            user_history 
        JOIN 
            user_payment 
            ON user_history.id = user_payment.id_history 
        JOIN 
            users 
            ON user_history.id_user = users.id 
        JOIN 
            data_zone 
            ON user_history.zone_id = data_zone.id 
        JOIN 
            category_zone 
            ON data_zone.category_id = category_zone.id 
        WHERE 
            user_history.id_user = ? 
            AND users.email = ?;
    `;


    connection.query(query, [id, email], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        console.log(result);
        res.status(200).send({ status: true, data: result });
    });

});

app.get('/api/request_status_admin', (req, res) => {

    const query = `
        SELECT 
            user_history.id, 
            user_history.category_id, 
            user_history.zone_id, 
            user_history.status, 
            user_history.date,
            user_history.date_market,
            user_payment.image_name, 
            user_payment.id AS payment_id,
            users.email,
            users.shop_name,
            users.shop_detail,
            users.shop_type,
            data_zone.price AS price,
            CONCAT(category_zone.category_name, ' ', data_zone.name_zone) AS area
        FROM 
            user_history 
        JOIN 
            user_payment 
            ON user_history.id = user_payment.id_history 
        JOIN 
            users 
            ON user_history.id_user = users.id 
        JOIN 
            data_zone 
            ON user_history.zone_id = data_zone.id 
        JOIN 
            category_zone 
            ON data_zone.category_id = category_zone.id
        WHERE
            user_history.status = 'Pending';
    `;

    connection.query(query, (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        res.status(200).send({ status: true, data: result });
    });
});

app.get('/api/history_request', (req, res) => {
    const query = `
        SELECT 
            user_history.id, 
            user_history.category_id, 
            user_history.zone_id, 
            user_history.status, 
            user_history.date,
            user_history.date_market,
            user_payment.image_name, 
            user_payment.id AS payment_id,
            users.email,
            users.shop_name,
            users.shop_detail,
            users.shop_type,
            data_zone.price AS price,
            CONCAT(category_zone.category_name, ' ', data_zone.name_zone) AS area
        FROM 
            user_history 
        JOIN 
            user_payment 
            ON user_history.id = user_payment.id_history 
        JOIN 
            users 
            ON user_history.id_user = users.id 
        JOIN 
            data_zone 
            ON user_history.zone_id = data_zone.id 
        JOIN 
            category_zone 
            ON data_zone.category_id = category_zone.id
        WHERE
            user_history.status != 'Pending'
        ORDER BY 
            user_history.id DESC;
    `;

    connection.query(query, (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        } else {
            console.log(result);
            res.status(200).send({ status: true, data: result });
        }
    });
});

app.get('/api/get_rent', (req, res) => {
    const { date_next_market } = req.query;
    console.log(date_next_market, 'date_next_market');
    const query = `SELECT 
        data_zone.id,
        data_zone.category_id,
        CONCAT(category_zone.category_name, ' ', data_zone.name_zone) AS area,
        category_zone.category_name,
        data_zone.name_zone,
        data_zone.price,
        data_zone.update,
        data_zone.rent,
        data_zone.size_market AS size,
        data_zone.toggle
        FROM 
            data_zone
        LEFT JOIN 
            category_zone
            ON data_zone.category_id = category_zone.id

    `;
    let data_cover = {
        Approved: '2',
        DisApproved: '0',
        Pending: '1'
    }
    connection.query(query, (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }

        const queryHistory = `SELECT user_history.id_user, user_history.zone_id, user_history.status, users.shop_name FROM user_history LEFT JOIN users ON user_history.id_user = users.id WHERE user_history.date_market = ?`;
        connection.query(queryHistory, [date_next_market], (err, result2) => {
            if (err) {
                res.status(500).send({ status: false, message: err });
            }
            for (let i = 0; i < result2.length; i++) {
                let sm_2 = result2[i];
                if (sm_2.status !== 'DisApproved') {
                    for (let j = 0; j < result.length; j++) {
                        let sm = result[j];
                        sm.status = '0'
                        if (sm.id === sm_2.zone_id) {
                            sm.shop_name = sm_2.shop_name;
                            sm.status = data_cover[sm_2.status];
                        }
                    }
                }
            }
            res.status(200).send({ status: true, data: result });
        });
        // res.status(200).send({ status: true, data: result });
    });

});

app.post('/api/insert_rent', (req, res) => {
    const { price, name_zone, size, category_name, rent, toggle } = req.body.data;
    const queryFindId = `SELECT id FROM category_zone WHERE category_name = ?`;

    connection.query(queryFindId, [category_name], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: `1 ${err}` });
        }

        const checkHasZone = `SELECT id FROM data_zone WHERE name_zone = ? AND category_id = ?`;
        connection.query(checkHasZone, [name_zone, result[0].id], (err, result2) => {
            if (err) {
                res.status(500).send({ status: false, message: `2 ${err}` });
            }
            if (result2.length > 0) {
                res.status(400).send({ status: false, message: 'Zone already exist' });
            } else {
                const query = `INSERT INTO data_zone (price, size_market, name_zone, category_id, toggle) VALUES (?, ?, ?, ?, ?)`;
                connection.query(query, [price, size, name_zone, result[0].id, toggle], (err, result) => {
                    if (err) {
                        res.status(500).send({ status: false, message: err });
                    }
                    res.status(200).send({ status: true, message: 'Insert success' });
                });
            }
        });
    });
});

app.post('/api/delete_rent', (req, res) => {
    const { id } = req.body;
    const query = `DELETE FROM data_zone WHERE id = ?`;
    connection.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        res.status(200).send({ status: true, message: 'Delete success' });
    });
});

app.post('/api/update_rent', (req, res) => {
    const { id, price, name_zone, size, rent, category_name, toggle } = req.body.data;
    // console.log(req.body.data.title);

    const queryFindId = `SELECT id FROM category_zone WHERE category_name = ?`;
    connection.query(queryFindId, [category_name], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: `1 ${err}` });
        }
        console.log(price, parseInt(rent), size, name_zone, result[0].id, id);
        const queryUpdate = `UPDATE data_zone SET price = ?, size_market = ?, name_zone = ?, category_id = ?, toggle = ?, \`update\` = NOW()  WHERE id = ?`;
        connection.query(queryUpdate, [price, size, name_zone, result[0].id, toggle, id], (err, result) => {
            if (err) {
                res.status(500).send({ status: false, message: err });
            }
            res.status(200).send({ status: true, message: 'Update success' });
        });
    });

    // const query = `UPDATE data_zone SET price = ?, rent = ?, size = ?, name_zone = ?, \`update\` = NOW() WHERE id = ?`;
    // connection.query(query, [price || 0, rent, size, name_zone, id], (err, result) => {
    //     if (err) {
    //         res.status(500).send({ status: false, message: err });
    //     }
    //     res.status(200).send({ status: true, message: 'Update success' });
    // });
});

app.post('/api/cancel_request', async (req, res) => {
    const { payment_id } = req.body;

    if (!payment_id) {
        return res.status(400).send({ status: false, message: 'Payment ID is required' });
    }

    try {
        // const queryUpdatePayment = `UPDATE user_payment SET status = 'Disapproved' WHERE id = ?`;
        // await new Promise((resolve, reject) => {
        //     connection.query(queryUpdatePayment, [payment_id], (err, result) => {
        //         if (err) reject(err);
        //         else resolve(result);
        //     });
        // });

        const querySelectHistory = `SELECT id_history FROM user_payment WHERE id = ?`;
        const idHistory = await new Promise((resolve, reject) => {
            connection.query(querySelectHistory, [payment_id], (err, result) => {
                if (err) reject(err);
                else if (result.length === 0) reject(new Error('No history found for the provided payment ID'));
                else resolve(result[0].id_history);
            });
        });

        const queryUpdateHistory = `UPDATE user_history SET status = 'Disapproved' WHERE id = ?`;
        await new Promise((resolve, reject) => {
            connection.query(queryUpdateHistory, [idHistory], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        const querySelectZone = `SELECT zone_id FROM user_history WHERE id = ?`;
        const idZone = await new Promise((resolve, reject) => {
            connection.query(querySelectZone, [idHistory], (err, result) => {
                if (err) reject(err);
                else if (result.length === 0) reject(new Error('No history found for the provided payment ID'));
                else resolve(result[0].zone_id);
            });
        });

        // const queryUpdateRent = `UPDATE data_zone SET rent = 2 WHERE id = ?`;
        // await new Promise((resolve, reject) => {
        //     connection.query(queryUpdateRent, [idZone], (err, result) => {
        //         if (err) reject(err);
        //         else resolve(result);
        //     });
        // });
        res.status(200).send({ status: true, message: 'Cancel success' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: false, message: error.message || 'Internal Server Error' });
    }
});

app.post('/api/approve_request', async (req, res) => {
    const { payment_id } = req.body;

    if (!payment_id) {
        return res.status(400).send({ status: false, message: 'Payment ID is required' });
    }

    try {
        // const queryUpdatePayment = `UPDATE user_payment SET status = 'Approved' WHERE id = ?`;
        // await new Promise((resolve, reject) => {
        //     connection.query(queryUpdatePayment, [payment_id], (err, result) => {
        //         if (err) reject(err);
        //         else resolve(result);
        //     });
        // });

        const querySelectHistory = `SELECT id_history FROM user_payment WHERE id = ?`;

        const idHistory = await new Promise((resolve, reject) => {
            connection.query(querySelectHistory, [payment_id], (err, result) => {
                if (err) reject(err);
                else if (result.length === 0) reject(new Error('No history found for the provided payment ID'));
                else resolve(result[0].id_history);
            });
        });
        const queryUpdateHistory = `UPDATE user_history SET status = 'Approved' WHERE id = ?`;
        await new Promise((resolve, reject) => {
            connection.query(queryUpdateHistory, [idHistory], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        const querySelectZone = `SELECT zone_id FROM user_history WHERE id = ?`;
        const idZone = await new Promise((resolve, reject) => {
            connection.query(querySelectZone, [idHistory], (err, result) => {
                if (err) reject(err);
                else if (result.length === 0) reject(new Error('No history found for the provided payment ID2'));
                else resolve(result[0].zone_id);
            });
        });

        // const queryUpdateRent = `UPDATE data_zone SET rent = 0 WHERE id = ?`;
        // await new Promise((resolve, reject) => {
        //     connection.query(queryUpdateRent, [idZone], (err, result) => {
        //         if (err) reject(err);
        //         else resolve(result);
        //     });
        // });



        res.status(200).send({ status: true, message: 'Success success' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: false, message: error.message || 'Internal Server Error' });
    }
});

app.get('/api/user_all', async (req, res) => {
    const query = `SELECT id, fullname, email, phone, role, shop_name, shop_detail, create_at, toggle, reason_toggle FROM users ORDER BY id DESC`;
    connection.query(query, (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        console.log(result);
        res.status(200).send({ status: true, data: result });
    });
})

app.get('/api/getDataForChart', async (req, res) => {
    const { date_is_coming } = req.query;
    console.log(date_is_coming);
    const query = 'SELECT status FROM user_history WHERE date_market = ?';
    connection.query(query, [date_is_coming], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        // Approve, Disapproved, Pending
        let cover_result = {
            Approved: 0,
            Disapproved: 0,
            Pending: 0
        }
        if (result.length > 0) {
            result.forEach((item) => {
                cover_result[item.status] += 1;
            });
            console.log(cover_result);
        }
        console.log(cover_result);

        res.status(200).send({ status: true, data: cover_result });
    });
})

app.get('/api/getFinancialData', async (req, res) => {
    const { typeChart } = req.query;  // typeChart can be 'daily', 'monthly', or 'total'
    const currentDate = new Date();
    console.log(typeChart);
    let query = '';
    if (typeChart === 'daily') {
        query = `SELECT  SUM(price) AS total FROM user_payment WHERE DATE(create_at) = CURDATE() GROUP BY create_at`;
    } else if (typeChart === 'monthly') {
        query = `SELECT SUM(price) as total FROM user_payment WHERE MONTH(create_at) = MONTH(CURDATE()) AND YEAR(create_at) = YEAR(CURDATE())`;
    } else if (typeChart === 'yearly') {
        query = `SELECT SUM(price) as total FROM user_payment`;
    } else {
        return res.status(400).send({ status: false, message: 'Invalid period' });
    }
    connection.query(query, [currentDate], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }

        console.log(result);
        res.status(200).send({ status: true, data: result, time_stamp: currentDate });
    });

})

app.post('/api/delete_user/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM users WHERE id = ?`;
    connection.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        res.status(200).send({ status: true, message: 'Delete success' });
    });
});

app.post('/api/change_user/:id', (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const query = `UPDATE users SET role = ? WHERE id = ?`;
    connection.query(query, [role, id], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        res.status(200).send({ status: true, message: 'Change role success' });
    });
});

app.post('/api/change_user_toggle/:id', (req, res) => {
    const { id } = req.params;
    const { bool, reason } = req.body;
    const query = `UPDATE users SET toggle = ?, reason_toggle = ? WHERE id = ?`;
    if (bool === 0 && !reason) {
        return res.status(400).send({ status: false, message: 'Reason is required' });
    }

    if (bool === 1) {
        reason = null;
    }

    connection.query(query, [bool, reason, id], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        res.status(200).send({ status: true, message: 'Change role success' });
    });
});

app.get('/api/get_my_data/:id', (req, res) => {
    const { id } = req.params;
    const query = `SELECT fullname, email, phone FROM users WHERE id = ?`;
    connection.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        res.status(200).send({ status: true, data: result[0] });
    });
});

app.post('/api/update_my_data/:id', (req, res) => {
    const { id } = req.params;
    const { fullname, email, phone } = req.body;
    const query = `UPDATE users SET fullname = ?, email = ?, phone = ? WHERE id = ?`;
    connection.query(query, [fullname, email, phone, id], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        res.status(200).send({ status: true, message: 'Update success' });
    });
});

app.post('/api/update_my_password/:id', async (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    const query = `SELECT password FROM users WHERE id = ?`;
    connection.query(query, [id], async (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        const checkPassword = await bcrypt.compareSync(oldPassword, result[0].password);
        console.log(checkPassword)
        if (checkPassword) {
            const hash = await bcrypt.hashSync(newPassword, 10);
            const queryUpdate = `UPDATE users SET password = ? WHERE id = ?`;
            connection.query(queryUpdate, [hash, id], (err, result) => {
                if (err) {
                    res.status(500).send({ status: false, message: err });
                }
                res.status(200).send({ status: true, message: 'Update password success' });
            });
        } else {
            res.status(400).send({ status: false, message: 'Old password wrong' });
        }
    });
});

app.post('/api/add_user_with_admin', (req, res) => {
    const { fullname, email, password, phone, role } = req.body;
    const queryCheck = `SELECT email, phone FROM users WHERE email = ? AND phone = ?`;
    connection.query(queryCheck, [email, phone], async (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        if (result.length > 0) {
            res.status(400).send({ status: false, message: 'Email or Phone already registered' });
        } else {
            const hash = await bcrypt.hashSync(password, 10);
            const query = `INSERT INTO users (fullname, email, password, phone, role) VALUES (?, ?, ?, ?, ?)`;
            connection.query(query, [fullname, email, hash, phone, role], (err, result) => {
                if (err) {
                    res.status(500).send({ status: false, message: err });
                }
                res.status(200).send({ status: true, message: 'Register success' });
            });
        }
    });
});

app.post('/api/edit_user_with_admin', (req, res) => {
    const { id, fullname, email, phone, shop_name, shop_detail, role, toggle, reason_toggle } = req.body;
    const updateQuery = `UPDATE users SET fullname = ?, email = ?, phone = ?, shop_name = ?, shop_detail = ?, role = ?, toggle = ?, reason_toggle = ? WHERE id = ?`;
    connection.query(updateQuery, [fullname, email, phone, shop_name, shop_detail, role, toggle, reason_toggle, id], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        res.status(200).send({ status: true, message: 'Update success' });
    });
});

app.get('/api/get_data_ads', (req, res) => {
    const query = `SELECT id, name_ads, high_light, get_next_week, create_at, image_ads, status_open FROM data_ads`;
    connection.query(query, (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        res.status(200).send({ status: true, data: result });
    });
});

app.post('/api/add_data_ads', upload.single('file'), (req, res) => {
    const { name_ads, high_light, get_next_week } = req.body;
    const filePath = `/uploads/${req.file.filename}`;

    const query = `INSERT INTO data_ads (name_ads, high_light, get_next_week, image_ads) VALUES (?, ?, ?, ?)`;
    console.log(name_ads, high_light, get_next_week);
    connection.query(query, [name_ads, high_light, get_next_week, filePath], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        console.log(result);
        res.status(200).send({ status: true, message: 'Insert success' });
    });
});

app.post('/api/edit_data_ads', upload.single('file'), (req, res) => {
    const { id, name_ads, high_light, get_next_week, status_open } = req.body;
    if (req.file) {
        const filePath = `/uploads/${req.file.filename}`;
        const query = `UPDATE data_ads SET name_ads = ?, high_light = ?, get_next_week = ?, image_ads = ?, status_open = ? WHERE id = ?`;
        connection.query(query, [name_ads, high_light, get_next_week, filePath, status_open, id], (err, result) => {
            if (err) {
                res.status(500).send({ status: false, message: err });
            }
            res.status(200).send({ status: true, message: 'Update success' });
        });
    } else {
        const query = `UPDATE data_ads SET name_ads = ?, high_light = ?, get_next_week = ?, status_open = ? WHERE id = ?`;
        connection.query(query, [name_ads, high_light, get_next_week, status_open, id], (err, result) => {
            if (err) {
                res.status(500).send({ status: false, message: err });
            }
            res.status(200).send({ status: true, message: 'Update success' });
        });
    }

});

app.post('/api/get_market_on_event', (req, res) => {
    const { date } = req.body;
    console.log(date, 'date');
    const query = `
        SELECT 
            user_history.id, 
            user_history.category_id, 
            user_history.zone_id, 
            user_history.status, 
            user_history.date,
            user_history.date_market,
            user_payment.image_name, 
            user_payment.id AS payment_id,
            users.email,
            users.shop_name,
            users.shop_detail,
            users.shop_type,
            data_zone.price AS price,
            CONCAT(category_zone.category_name, ' ', data_zone.name_zone) AS area
        FROM 
            user_history 
        JOIN 
            user_payment 
            ON user_history.id = user_payment.id_history 
        JOIN 
            users 
            ON user_history.id_user = users.id 
        JOIN 
            data_zone 
            ON user_history.zone_id = data_zone.id 
        JOIN 
            category_zone 
            ON data_zone.category_id = category_zone.id
        WHERE
            user_history.status != 'Pending' AND user_history.date_market = ?
        ORDER BY 
            user_history.id DESC;
    `;
    connection.query(query, [date], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        } else {
            console.log(result);
            res.status(200).send({ status: true, data: result });
        }
    });
});

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "maketmfu@gmail.com",
        pass: "lxal dpam guat dkti",
    },
});

app.post('/api/forgetPassword', async (req, res) => {
    const { email } = req.body;
    const query = `SELECT id, email FROM users WHERE email = ?`;
    connection.query(query, [email], async (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        if (result.length === 0) {
            return res.status(404).send({ status: false, message: 'Email not found' });
        }
        const otp = generateOtp();
        otpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

        const mailOptions = {
            from: "maketmfu@gmail.com",
            to: email,
            subject: "Your OTP for Password Reset",
            text: `Your OTP is: ${otp}`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ message: "Failed to send OTP" });
            }
            console.log("Email sent:", info.response);
            res.status(200).send({ status: true, message: "OTP sent to your email" });
        });
    });
});

app.post('/api/verifyOtp', async (req, res) => {
    const { email, otp } = req.body;
    if (!otpStorage[email]) {
        return res.status(400).send({ status: false, message: 'OTP expired' });
    }
    if (otpStorage[email].otp !== otp) {
        return res.status(400).send({ status: false, message: 'Invalid OTP' });
    }
    if (otpStorage[email].expiresAt < Date.now()) {
        return res.status(400).send({ status: false, message: 'OTP expired' });
    }
    res.status(200).send({ status: true, message: 'OTP verified' });
});

app.post('/api/resetPassword', async (req, res) => {
    const { email, password } = req.body;
    const hash = await bcrypt.hashSync(password, 10);
    const query = `UPDATE users SET password = ? WHERE email = ?`;
    connection.query(query, [hash, email], (err, result) => {
        if (err) {
            res.status(500).send({ status: false, message: err });
        }
        res.status(200).send({ status: true, message: 'Password reset success' });
    });
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});