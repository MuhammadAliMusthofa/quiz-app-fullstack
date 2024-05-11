const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
require('dotenv').config();

//import database
const connection = require('../../config/database');

// Secret key untuk JWT
const secretKey = process.env.SECRET_KEY_JWT;
const saltRounds = 10; // jumlah salt rounds untuk bcrypt

// Rute untuk registrasi pengguna
router.post('/register', [

    // Validasi data masukan
    body('username').notEmpty(),
    body('password').notEmpty(),

], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Cek apakah username telah digunakan
    const sqlCheckExistingUser = 'SELECT * FROM users WHERE username = ?';
    connection.query(sqlCheckExistingUser, [username], (err, results) => {
        if (err) {
            console.error('Error checking existing user: ' + err.stack);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
                error: err.message
            });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password menggunakan bcrypt
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password: ' + err.stack);
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            }

            // Simpan data pengguna ke dalam tabel pengguna dengan password yang di-hash
            const sqlInsertUser = 'INSERT INTO users (username, password) VALUES (?, ?)';
            connection.query(sqlInsertUser, [username, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Error inserting user: ' + err.stack);
                    return res.status(500).json({
                        status: false,
                        message: 'Internal Server Error',
                        error: err.message
                    });
                }

                console.log('User registered successfully');
                return res.status(200).json({
                    status: 200,
                    message: 'User registered successfully',
                });
            });
        });
    });
});

// Rute untuk autentikasi (login)
router.post('/login', [

    // Validasi data masukan
    body('username').notEmpty(),
    body('password').notEmpty(),

], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Cari pengguna berdasarkan kredensial
    const sqlFindUser = 'SELECT * FROM users WHERE username = ?';
    connection.query(sqlFindUser, [username], (err, results) => {
        if (err) {
            console.error('Error finding user: ' + err.stack);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Bandingkan password yang di-hash dengan password yang diberikan menggunakan bcrypt
        bcrypt.compare(password, results[0].password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords: ' + err.stack);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (isMatch) {
                // Mengembalikan ID pengguna yang berhasil login
                res.json({ 
                    status: 200,
                    message: `Login successfully`,
                    userId: results[0].id
                });
            } else {
                res.status(401).json({ error: 'Invalid username or password' });
            }
        });
    });
});

// router.post('/logout', (req, res) => {
//     req.session.destroy(err => {
//         if (err) {
//             console.error('Failed to destroy the session during logout:', err);
//             return res.status(500).json({
//                 status: false,
//                 message: 'Failed to logout due to server error.'
//             });
//         }

//         res.status(200).json({
//             status: true,
//             message: 'Logged out successfully.'
//         });
//     });
// });



router.get('/test', (req, res) => {
    console.log("Halo zain");
    res.send("Halo zain"); // Mengirimkan respons "Halo zain" ke klien
});
module.exports = router;
