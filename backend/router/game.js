const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

//import express validator
const { body, validationResult } = require('express-validator');

//import database
const connection = require('../config/database');





/**
 * INDEX POSTS
 */
//  router.get('/quiz/list', function (req, res) {
//     //query
//     connection.query('SELECT * FROM quiz ORDER BY id DESC', function (err, rows) {
//         if (err) {
//             return res.status(500).json({
//                 status: false,
//                 message: 'Internal Server Error',
//                 error: err.message // Mengirimkan pesan kesalahan spesifik
//             })
//         } else {
//             return res.status(200).json({
//                 status: true,
//                 message: 'List Data Tags',
//                 data: rows
//             })
//         }
//     });
// });

const secretKey = process.env.SECRET_KEY_JWT;


const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Mengekstrak token dari header Authorization
    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.userId = decoded.id;
        next();
    });
};


// Fungsi untuk mendapatkan user_id berdasarkan token dari database
const getUserIdByToken = (token) => {
    return new Promise((resolve, reject) => {
        const sqlFindUserByToken = 'SELECT id FROM users WHERE token = ?';
        connection.query(sqlFindUserByToken, [token], (err, results) => {
            if (err) {
                reject(err);
            } else {
                if (results.length > 0) {
                    resolve(results[0].id);
                } else {
                    reject(new Error('User not found for the given token'));
                }
            }
        });
    });
};

// Handler untuk menyimpan data tag
router.post('/quiz/add', verifyToken, async (req, res) => {
    try {
        // Validasi data JSON
        if (!req.body.title || !req.body.description) {
            return res.status(422).json({
                status: false,
                message: 'Title and description are required'
            });
        }

        // Dapatkan user_id berdasarkan token
        const token = req.headers['authorization'].split(' ')[1];
        const userId = await getUserIdByToken(token);

        // Definisikan formData dengan user_id sebagai created_by
        let formData = {
            title: req.body.title,
            description: req.body.description,
            creator_id: userId,
        };

        // Lakukan penyimpanan data
        connection.query('INSERT INTO quiz (title, description, creator_id) VALUES (?, ?, ?)', 
        [formData.title, formData.description, formData.creator_id], 
        function (err, result) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            } else {
                return res.status(201).json({
                    status: true,
                    message: 'Quiz Added Successfully',
                    data: result // Mengembalikan data hasil insert, bukan rows[0]
                });
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});


    


module.exports = router;