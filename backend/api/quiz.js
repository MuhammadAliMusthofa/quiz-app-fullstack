const express = require('express');
const router = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser')
const app = express();
const { body, validationResult } = require('express-validator');
const connection = require('../config/database');

const multer = require('multer');
const path = require('path');

// app.use('/image', express.static(__dirname, 'public/assets/images'));

// Configure storage for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/assets/images'); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null,file.fieldname + '-' + uniqueSuffix);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      const allowedFields = ["questionImage", "option1Image", "option2Image", "option3Image", "option4Image"];
      if (allowedFields.includes(file.fieldname)) {
        cb(null, true);
      } else {
        cb(new Error('Unexpected field'), false);
      }
    }
});

// membuat soal pada quiz dngan id quiz tertentu
// router.post('/createDataQuiz/:quizId', upload.array('questions', 5), (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(422).json({
//             errors: errors.array()
//         });
//     }

//     const quizId = req.params.quizId;
//     const questions = req.body.questions;
//     const files = req.files;

//     const questionEntries = [];
//     const imageEntries = [];

//     questions.forEach((questionData, index) => {
//         questionEntries.push({
//             quiz_id: quizId,
//             question_text: questionData.question,
//             option1: questionData.option1,
//             option2: questionData.option2,
//             option3: questionData.option3,
//             option4: questionData.option4,
//             correct_answer: questionData.correctAnswer
//         });

//         ['questionImage', 'option1Image', 'option2Image', 'option3Image', 'option4Image'].forEach((item) => {
//             if (files[index] && files[index][item]) {
//                 imageEntries.push([
//                     questionEntries.length, // Using the current index of the questionEntries array
//                     item.replace('Image', ''),
//                     files[index][item].filename
//                 ]);
//             }
//         });
//     });

//     connection.query('INSERT INTO question (quiz_id, question_text, option1, option2, option3, option4, correct_answer) VALUES ?', [questionEntries], function (err, result) {
//         if (err) {
//             return res.status(500).json({ status: false, message: 'Internal Server Error', error: err.message });
//         }

//         if (imageEntries.length > 0) {
//             connection.query('INSERT INTO question_images (question_id, image_type, image_url) VALUES ?', [imageEntries], (imgErr, imgResult) => {
//                 if (imgErr) {
//                     return res.status(500).json({ status: false, message: 'Failed to save images', error: imgErr.message });
//                 }
//                 return res.status(201).json({ status: true, message: 'Questions and Images Added Successfully', data: result });
//             });
//         } else {
//             return res.status(201).json({ status: true, message: 'Questions Added Successfully, no images to save', data: result });
//         }
//     });
// });

router.post('/createDataQuiz/:quizId', upload.fields([
    { name: 'questionImage', maxCount: 1 },
    { name: 'option1Image', maxCount: 1 },
    { name: 'option2Image', maxCount: 1 },
    { name: 'option3Image', maxCount: 1 },
    { name: 'option4Image', maxCount: 1 }
]), [
    body('question').notEmpty(),
    body('option1').notEmpty(),
    body('option2').notEmpty(),
    body('option3').notEmpty(),
    body('option4').notEmpty(),
    body('correctAnswer').isIn(['option1', 'option2', 'option3', 'option4'])
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const quizId = req.params.quizId;
    const { question, option1, option2, option3, option4, correctAnswer } = req.body;
    const files = req.files;

    let questionData = {
        quiz_id: quizId,
        question_text: question,
        option1: option1,
        option2: option2,
        option3: option3,
        option4: option4,
        correct_answer: correctAnswer
    };

    connection.query('INSERT INTO question SET ?', questionData, function (err, result) {
        if (err) {
            return res.status(500).json({ status: false, message: 'Internal Server Error', error: err.message });
        }
        
        let questionId = result.insertId;
        let imageEntries = [];

        ['questionImage', 'option1Image', 'option2Image', 'option3Image', 'option4Image'].forEach((item, index) => {
            if (files[item] && files[item][0]) {
                imageEntries.push([
                    questionId,
                    item.replace('Image', ''),
                    files[item][0].filename // Menggunakan .filename untuk menghindari path
                ]);
            }
        });

        if (imageEntries.length > 0) {
            connection.query('INSERT INTO question_images (question_id, image_type, image_url) VALUES ?', [imageEntries], (imgErr, imgResult) => {
                if (imgErr) {
                    return res.status(500).json({ status: false, message: 'Failed to save images', error: imgErr.message });
                }
                return res.status(201).json({ status: true, message: 'Question and Images Added Successfully', data: result });
            });
        } else {
            return res.status(201).json({ status: true, message: 'Question Added Successfully, no images to save', data: result });
        }
    });
});

// create soal True or false
router.post('/createDataQuizTof/:quizId', upload.fields([
    { name: 'questionImage', maxCount: 1 },

]), [
    body('question').notEmpty(),
    // body('option1').notEmpty(),
    // body('option2').notEmpty(),
    // body('option3').notEmpty(),
    // body('option4').notEmpty(),
    body('correct_answer').notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const quizId = req.params.quizId;
    const { question, correct_answer } = req.body;
    const files = req.files;
    const qType = "tof";
    let questionData = {
        quiz_id: quizId,
        question_text: question,
        question_type: qType,
        correct_answer: correct_answer
    };

    connection.query('INSERT INTO question SET ?', questionData, function (err, result) {
        if (err) {
            return res.status(500).json({ status: false, message: 'Internal Server Error', error: err.message });
        }
        
        let questionId = result.insertId;
        let imageEntries = [];

        ['questionImage'].forEach((item, index) => {
            if (files[item] && files[item][0]) {
                imageEntries.push([
                    questionId,
                    item.replace('Image', ''),
                    files[item][0].filename // Menggunakan .filename untuk menghindari path
                ]);
            }
        });

        if (imageEntries.length > 0) {
            connection.query('INSERT INTO question_images (question_id, image_type, image_url) VALUES ?', [imageEntries], (imgErr, imgResult) => {
                if (imgErr) {
                    return res.status(500).json({ status: false, message: 'Failed to save images', error: imgErr.message });
                }
                return res.status(201).json({ status: true, message: 'Question and Images Added Successfully', data: result });
            });
        } else {
            return res.status(201).json({ status: true, message: 'Question Added Successfully, no images to save', data: result });
        }
    });
});

//update soal pada quiz pilihan ganda
router.put('/updateDataQuiz/:quizId/:questionId', upload.fields([
    { name: 'questionImage', maxCount: 1 },
    { name: 'option1Image', maxCount: 1 },
    { name: 'option2Image', maxCount: 1 },
    { name: 'option3Image', maxCount: 1 },
    { name: 'option4Image', maxCount: 1 }
]), [
    body('question').notEmpty(),
    body('option1').notEmpty(),
    body('option2').notEmpty(),
    body('option3').notEmpty(),
    body('option4').notEmpty(),
    body('correctAnswer').isIn(['option1', 'option2', 'option3', 'option4'])
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const quizId = req.params.quizId;
    const questionId = req.params.questionId;
    const { question, option1, option2, option3, option4, correctAnswer } = req.body;
    const files = req.files;

    let questionData = {
        question_text: question,
        option1: option1,
        option2: option2,
        option3: option3,
        option4: option4,
        correct_answer: correctAnswer
    };

    connection.query('UPDATE question SET ? WHERE quiz_id = ? AND id = ?', [questionData, quizId, questionId], function (err, result) {
        if (err) {
            return res.status(500).json({ status: false, message: 'Internal Server Error', error: err.message });
        }

        let imageEntries = [];
        ['questionImage', 'option1Image', 'option2Image', 'option3Image', 'option4Image'].forEach((item) => {
            if (files[item] && files[item][0]) {
                imageEntries.push([
                    questionId,
                    item.replace('Image', ''),
                    files[item][0].filename // Menggunakan .filename untuk menghindari path
                ]);
            }
        });

        if (imageEntries.length > 0) {
            const deleteQuery = 'DELETE FROM question_images WHERE question_id = ? AND image_type = ?';
            const insertQuery = 'INSERT INTO question_images (question_id, image_type, image_url) VALUES ?';

            // Use a transaction to ensure data consistency
            connection.beginTransaction(function (err) {
                if (err) {
                    return res.status(500).json({ status: false, message: 'Transaction Error', error: err.message });
                }

                const deletePromises = imageEntries.map(([questionId, imageType]) => {
                    return new Promise((resolve, reject) => {
                        connection.query(deleteQuery, [questionId, imageType], (delErr) => {
                            if (delErr) return reject(delErr);
                            resolve();
                        });
                    });
                });

                Promise.all(deletePromises)
                    .then(() => {
                        connection.query(insertQuery, [imageEntries], (imgErr, imgResult) => {
                            if (imgErr) {
                                return connection.rollback(() => {
                                    res.status(500).json({ status: false, message: 'Failed to save images', error: imgErr.message });
                                });
                            }
                            connection.commit((commitErr) => {
                                if (commitErr) {
                                    return connection.rollback(() => {
                                        res.status(500).json({ status: false, message: 'Commit Error', error: commitErr.message });
                                    });
                                }

                                // Fetch the updated question data
                                connection.query('SELECT * FROM question WHERE id = ?', [questionId], (selectErr, selectResult) => {
                                    if (selectErr) {
                                        return res.status(500).json({ status: false, message: 'Failed to fetch updated data', error: selectErr.message });
                                    }

                                    // Fetch the updated images data
                                    connection.query('SELECT * FROM question_images WHERE question_id = ?', [questionId], (imgSelectErr, imgSelectResult) => {
                                        if (imgSelectErr) {
                                            return res.status(500).json({ status: false, message: 'Failed to fetch updated images', error: imgSelectErr.message });
                                        }

                                        // Construct the response data
                                        let responseData = {
                                            question_id: selectResult[0].id,
                                            question_text: selectResult[0].question_text,
                                            option1: selectResult[0].option1,
                                            option2: selectResult[0].option2,
                                            option3: selectResult[0].option3,
                                            option4: selectResult[0].option4,
                                            correct_answer: selectResult[0].correct_answer,
                                        };

                                        imgSelectResult.forEach(image => {
                                            responseData[`${image.image_type}_image`] = image.image_url;
                                        });

                                        res.status(200).json({
                                            status: true,
                                            message: 'Question and Images Updated Successfully',
                                            data: responseData
                                        });
                                    });
                                });
                            });
                        });
                    })
                    .catch(delErr => {
                        connection.rollback(() => {
                            res.status(500).json({ status: false, message: 'Failed to delete old images', error: delErr.message });
                        });
                    });
            });
        } else {
            // Fetch the updated question data if no images were updated
            connection.query('SELECT * FROM question WHERE id = ?', [questionId], (selectErr, selectResult) => {
                if (selectErr) {
                    return res.status(500).json({ status: false, message: 'Failed to fetch updated data', error: selectErr.message });
                }

                connection.query('SELECT * FROM question_images WHERE question_id = ?', [questionId], (imgSelectErr, imgSelectResult) => {
                    if (imgSelectErr) {
                        return res.status(500).json({ status: false, message: 'Failed to fetch updated images', error: imgSelectErr.message });
                    }

                    // Construct the response data
                    let responseData = {
                        question_id: selectResult[0].id,
                        question_text: selectResult[0].question_text,
                        option1: selectResult[0].option1,
                        option2: selectResult[0].option2,
                        option3: selectResult[0].option3,
                        option4: selectResult[0].option4,
                        correct_answer: selectResult[0].correct_answer,
                    };

                    imgSelectResult.forEach(image => {
                        responseData[`${image.image_type}_image`] = image.image_url;
                    });

                    res.status(200).json({
                        status: true,
                        message: 'Question Updated Successfully, no new images to save',
                        data: responseData
                    });
                });
            });
        }
    });
});

// Handler untuk menyimpan data quiz
router.post('/quiz/add/:userId', [
    // Validasi
    body('title').notEmpty(),
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array()
            });
        }

        const userId = req.params.userId; // Peroleh ID pengguna dari parameter rute

        // Pastikan userId adalah string
        const creatorId = String(userId);

        // Definisikan formData dengan creator_id dari parameter rute
        let formData = {
            title: req.body.title,
            quiz_icon: req.body.quiz_icon,
            creator_id: creatorId,
        };

        // Lakukan penyimpanan data
        connection.query('INSERT INTO quiz SET ?', formData, function (err, result) {
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
                    data: result // Mengembalikan data hasil insert
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

// Handler untuk mendapatkan semua quiz berdasarkan ID pengguna
router.get('/quiz/:userId', (req, res) => {
    try {
        const userId = req.params.userId; // Peroleh ID pengguna dari parameter rute

        // Lakukan kueri untuk mendapatkan semua quiz berdasarkan ID pengguna dan urutkan secara descending
        const sqlGetQuizByUserId = 'SELECT * FROM quiz WHERE creator_id = ? ORDER BY id DESC';
        connection.query(sqlGetQuizByUserId, [userId], function (err, rows) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'List of quizzes created by the user',
                    data: rows
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

// menampilkan list pertanyaan
router.get('/question-list/:quizId', (req, res) => {
    try {
        const quizId = req.params.quizId;

        const sqlGetQuizTitle = `SELECT title FROM quiz WHERE id = ?`;

        connection.query(sqlGetQuizTitle, [quizId], (err, quizResult) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            }

            if (quizResult.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: 'Quiz not found'
                });
            }

            const quizTitle = quizResult[0].title;

            const sqlGetQuestions = `
                SELECT 
                    q.id AS question_id, 
                    q.question_text, 
                    q.option1, 
                    q.option2, 
                    q.option3, 
                    q.option4, 
                    q.correct_answer,
                    q.question_type,
                    qi.image_url AS questionImage,
                    qi1.image_url AS option1_image,
                    qi2.image_url AS option2_image,
                    qi3.image_url AS option3_image,
                    qi4.image_url AS option4_image
                FROM question q
                LEFT JOIN question_images qi ON qi.question_id = q.id AND qi.image_type = 'question'
                LEFT JOIN question_images qi1 ON qi1.question_id = q.id AND qi1.image_type = 'option1'
                LEFT JOIN question_images qi2 ON qi2.question_id = q.id AND qi2.image_type = 'option2'
                LEFT JOIN question_images qi3 ON qi3.question_id = q.id AND qi3.image_type = 'option3'
                LEFT JOIN question_images qi4 ON qi4.question_id = q.id AND qi4.image_type = 'option4'
                WHERE q.quiz_id = ?
            `;

            connection.query(sqlGetQuestions, [quizId], (err, questionsResult) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: 'Internal Server Error',
                        error: err.message
                    });
                }

                if (questionsResult.length === 0) {
                    return res.status(404).json({
                        status: false,
                        message: 'No questions found for the specified quiz ID'
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: 'Quiz title and questions retrieved successfully',
                    data: {
                        title: quizTitle,
                        questions: questionsResult
                    }
                });
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});



// Handler untuk memulai game dan membuat lobby baru
router.post('/startgame/:quizId', async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array()
            });
        }

        const { quizId } = req.params; // Destructure quizId from params
        const { userId } = req.body; // Get userId from request body

        // Generate random 3 or 4 digit code
        const gameCode = Math.floor(1000 + Math.random() * 9000).toString();
        const status = "waiting";

        // Insert game data into the database
        const sqlInsertGame = 'INSERT INTO game (quiz_id, game_code, status, admin_id) VALUES (?, ?, ?, ?)';
        connection.query(sqlInsertGame, [quizId, gameCode, status, userId], async (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            }

            // Send success response
            res.status(201).json({
                status: true,
                message: 'Game Started Successfully',
                game_code: gameCode,
                game_id: result.insertId
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

//aoi untuk menampilkan game sesuai id game nya
router.get('/game/:gameId', async (req, res) => {
    try {
        const gameId = req.params.gameId;

        // Query ke database untuk mendapatkan data game berdasarkan ID game
        const sqlGetGameById = 'SELECT * FROM game WHERE id = ?';
        connection.query(sqlGetGameById, [gameId], async (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: 'Game not found'
                });
            }

            // Kirim data game sebagai respons
            res.status(200).json({
                status: true,
                data: result[0] // Ambil data pertama karena hasilnya hanya satu
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

// di halaman User
router.post('/find-game', async (req, res) => {
    try {
      const { game_code } = req.body; // Ambil game_code dari body request
  
      // Query untuk mencari game berdasarkan game_code
      const sqlFindGame = 'SELECT * FROM game WHERE game_code = ?';
      connection.query(sqlFindGame, [game_code], async (err, result) => {
        if (err) {
          return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
            error: err.message
          });
        }
  
        if (result.length === 0) {
          // Jika game tidak ditemukan, kirim respons dengan status 404
          return res.status(404).json({
            status: false,
            message: 'Game not found'
          });
        }
  
        // Jika game ditemukan, kirim data game dalam respons
        return res.status(200).json({
          status: true,
          message: 'Game found',
          data: result[0] // Ambil data game pertama dari hasil query
        });
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error',
        error: error.message
      });
    }
  });

// player menemukan room
router.post('/players/:gameCode', async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array()
            });
        }

        const { gameCode } = req.params; // Ambil gameCode dari parameter URL
        const { name } = req.body; // Ambil adminId dan nama pemain dari body permintaan

        // Query untuk mendapatkan admin_id dari tabel game berdasarkan game_code
        const sqlGetGameData = `
            SELECT g.id AS game_id, g.admin_id, q.title AS quiz_name
            FROM game g
            JOIN quiz q ON g.quiz_id = q.id
            WHERE g.game_code = ?
        `;
        connection.query(sqlGetGameData, [gameCode], async (err, gameResult) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            }

            if (gameResult.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: 'Game not found'
                });
            }

            const { game_id, admin_id, quiz_name } = gameResult[0];

            // Lakukan INSERT pemain ke dalam tabel player
            const sqlInsertPlayer = 'INSERT INTO player (game_id, game_code, admin_id, name) VALUES (?, ?, ?, ?)';
            connection.query(sqlInsertPlayer, [game_id, gameCode, admin_id, name], async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: 'Internal Server Error',
                        error: err.message
                    });
                }

                // Berhasil menyimpan pemain baru, kirim respons berhasil
                return res.status(201).json({
                    status: true,
                    message: 'Player added successfully',
                    data: {
                        game_id,
                        game_code: gameCode,
                        admin_id,
                        quiz_name,
                        player_id: result.insertId // Id pemain yang baru saja dimasukkan
                    }
                });
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});


// player menemukan room
router.get('/quiz_name/:gameCode', async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array()
            });
        }

        const { gameCode } = req.params; // Ambil gameCode dari parameter URL

        // Query untuk mendapatkan data game dan nama kuis berdasarkan game_code
        const sqlGetGameData = `
            SELECT g.id AS game_id, g.admin_id, g.status AS game_status, q.title AS quiz_name
            FROM game g
            JOIN quiz q ON g.quiz_id = q.id
            WHERE g.game_code = ?
        `;
        connection.query(sqlGetGameData, [gameCode], async (err, gameResult) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            }

            if (gameResult.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: 'Game not found'
                });
            }

            // Mengambil data game dari hasil query
            const { quiz_name, game_status } = gameResult[0];

            // Kirim respons dengan nama kuis dan status game
            return res.status(200).json({
                status: true,
                message: 'Quiz name and game status found',
                data: {
                    quiz_name,
                    game_status
                }
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

// Handler untuk mendapatkan semua pemain berdasarkan ID permainan
router.get('/quiz_title/:gameId', (req, res) => {
    try {
        const gameId = req.params.gameId; // Dapatkan ID permainan dari parameter rute

        // Lakukan kueri untuk mendapatkan judul kuis, game_code, dan status berdasarkan ID permainan
        const sqlGetGameData = `
            SELECT g.game_code, q.title AS quiz_title, g.status AS game_status
            FROM game g
            JOIN quiz q ON g.quiz_id = q.id
            WHERE g.id = ?
        `;
        connection.query(sqlGetGameData, [gameId], function (err, rows) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            } else {
                if (rows.length === 0) {
                    return res.status(404).json({
                        status: false,
                        message: 'Game not found'
                    });
                }
                return res.status(200).json({
                    status: true,
                    message: 'Quiz title found',
                    data: {
                        game_code: rows[0].game_code,
                        quiz_title: rows[0].quiz_title,
                        game_status: rows[0].game_status
                    }
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


// menemukan user pada lobby game sesuai game_code
router.get('/playerss/:gameCode', (req, res) => {
    try {
        const gameCode = req.params.gameCode; // Dapatkan ID permainan dari parameter rute

        // Lakukan kueri untuk mendapatkan semua pemain berdasarkan ID permainan
        const sqlGetPlayersByGameId = 'SELECT * FROM player WHERE game_code = ?';
        connection.query(sqlGetPlayersByGameId, [gameCode], function (err, rows) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'List of players in the game',
                    data: rows
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
// menemukan user pada lobby game sesuai game_id
router.get('/players/:gameId', (req, res) => {
    try {
        const gameId = req.params.gameId; // Dapatkan ID permainan dari parameter rute

        // Lakukan kueri untuk mendapatkan semua pemain berdasarkan ID permainan
        const sqlGetPlayersByGameId = 'SELECT * FROM player WHERE game_id = ?';
        connection.query(sqlGetPlayersByGameId, [gameId], function (err, rows) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'List of players in the game',
                    data: rows
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

// mengubah status saat tombol start pada lobby diklik
router.put('/start/:gameCode', (req, res) => {
    try {
        const gameCode = req.params.gameCode; // Dapatkan gameCode dari parameter rute

        // Lakukan kueri untuk mengupdate status permainan menjadi "ingame" dan set start_time ke waktu sekarang berdasarkan game code
        const sqlUpdateGameStatus = 'UPDATE game SET status = "ingame", start_time = NOW() WHERE game_code = ?';
        connection.query(sqlUpdateGameStatus, [gameCode], function (err, result) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            } else {
                // Cek apakah ada baris yang terpengaruh (diupdate)
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        status: false,
                        message: 'Game not found'
                    });
                }
                
                return res.status(200).json({
                    status: true,
                    message: 'Game started successfully',
                    data: result
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


// list quiz berdasarkan gameCode
router.get('/quiz_list/:gameCode', (req, res) => {
    try {
        const gameCode = req.params.gameCode;

        // Updated SQL query to include multiple joins on question_images for different types
        const sqlQuery = `
            SELECT q.id AS question_id, q.question_text, q.correct_answer,q.question_type, q.option1, q.option2, q.option3, q.option4,
                   quiz.title AS quiz_title, game.quiz_id, game.status,
                   q_img.image_url AS question_image,
                   op1_img.image_url AS option1_image,
                   op2_img.image_url AS option2_image,
                   op3_img.image_url AS option3_image,
                   op4_img.image_url AS option4_image
            FROM question q
            JOIN quiz ON q.quiz_id = quiz.id
            JOIN game ON quiz.id = game.quiz_id
            LEFT JOIN question_images q_img ON q.id = q_img.question_id AND q_img.image_type = 'question'
            LEFT JOIN question_images op1_img ON q.id = op1_img.question_id AND op1_img.image_type = 'option1'
            LEFT JOIN question_images op2_img ON q.id = op2_img.question_id AND op2_img.image_type = 'option2'
            LEFT JOIN question_images op3_img ON q.id = op3_img.question_id AND op3_img.image_type = 'option3'
            LEFT JOIN question_images op4_img ON q.id = op4_img.question_id AND op4_img.image_type = 'option4'
            WHERE game.game_code = ?
        `;

        connection.query(sqlQuery, [gameCode], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: 'Quiz list not found for this game'
                });
            }

            return res.status(200).json({
                status: true,
                message: 'Quiz list found',
                data: rows
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});


// handle simpan jawaban player
router.post('/answer', async (req, res) => {
    try {
        const { player_id, question_id, answer_text, countdown, game_code } = req.body;

        // Get game_id based on game_code
        const gameResult = await queryAsync('SELECT id AS game_id FROM game WHERE game_code = ?', [game_code]);

        if (gameResult.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Game not found'
            });
        }

        const game_id = gameResult[0].game_id;

        // Get correct_answer and quiz_id based on question_id
        const questionResult = await queryAsync('SELECT correct_answer, quiz_id FROM question WHERE id = ?', [question_id]);

        if (questionResult.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Question not found'
            });
        }

        const correctAnswer = questionResult[0].correct_answer;
        const quizId = questionResult[0].quiz_id;

        // Calculate score based on answer_text and countdown
        let score = 0;
        const countdownValue = parseInt(countdown);
        if (!isNaN(countdownValue)) {
            if (answer_text === correctAnswer) {
                if (countdownValue <= 5) {
                    score = 100;
                } else if (countdownValue <= 10) {
                    score = 80;
                } else {
                    score = 25;
                }
            }
        }

        // Insert answer into answer table along with game_id
        const result = await queryAsync('INSERT INTO answer (player_id, question_id, answer_text, countdown, score, game_id) VALUES (?, ?, ?, ?, ?, ?)', [player_id, question_id, answer_text, countdown, score, game_id]);

        // Update player's score in player table
        const playerResult = await queryAsync('SELECT score FROM player WHERE id = ?', [player_id]);
        let currentScore = parseInt(playerResult[0].score); // Parse current score to integer

        if (isNaN(currentScore)) {
            currentScore = 0; // Handle case where initial score is NaN
        }

        const updatedScore = currentScore + score;

        const updateResult = await queryAsync('UPDATE player SET score = ? WHERE id = ?', [updatedScore, player_id]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: 'Player not found or score not updated'
            });
        }

        return res.status(201).json({
            status: true,
            message: 'Answer saved successfully',
            data: {
                answer_id: result.insertId,
                player_id,
                question_id,
                answer_text,
                countdown,
                score
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


// Utility function to execute SQL queries asynchronously
function queryAsync(sql, values) {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}


// Utility function to execute SQL queries asynchronously
function queryAsync(sql, values) {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}
// menampilkan total option terjawab
router.get('/answer-summary/:gameCode/:questionId', async (req, res) => {
    try {
        const { gameCode, questionId } = req.params;

        // Query untuk mendapatkan game_id berdasarkan game_code
        const sqlGetGameId = `
            SELECT id AS game_id
            FROM game
            WHERE game_code = ?
        `;
        
        connection.query(sqlGetGameId, [gameCode], (err, gameResult) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            }

            if (gameResult.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: 'Game not found'
                });
            }

            const gameId = gameResult[0].game_id;

            // Query untuk menghitung total jawaban dari masing-masing pilihan jawaban
            const sqlGetAnswerSummary = `
                SELECT answer_text, COUNT(*) as total_answers
                FROM answer
                WHERE game_id = ? AND question_id = ?
                GROUP BY answer_text
            `;
            
            connection.query(sqlGetAnswerSummary, [gameId, questionId], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: 'Internal Server Error',
                        error: err.message
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: 'Answer summary retrieved successfully',
                    data: result
                });
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

// mengubah status game menjadi finish
router.put('/game/finish/:gameCode', async (req, res) => {
    try {
        const { gameCode } = req.params;

        // Query untuk mengubah status game menjadi "Finish" berdasarkan game_code
        const sqlUpdateGameStatus = `
            UPDATE game
            SET status = 'Finish', 
            end_time = NOW()
            WHERE game_code = ?
        `;
        
        
        connection.query(sqlUpdateGameStatus, [gameCode], (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: false,
                    message: 'Game not found'
                });
            }

            return res.status(200).json({
                status: true,
                message: 'Game status updated to Finish successfully'
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

// API endpoint untuk mendapatkan data pemain berdasarkan game_code dan mengurutkannya berdasarkan skor tertinggi
router.get('/player-score/:gameCode', async (req, res) => {
    try {
        const { gameCode } = req.params;

        // Cari game_id berdasarkan game_code
        const sqlGetGameId = `
            SELECT id AS game_id
            FROM game
            WHERE game_code = ?
        `;
        connection.query(sqlGetGameId, [gameCode], async (err, gameResult) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            }

            if (gameResult.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: 'Game not found'
                });
            }

            const gameId = gameResult[0].game_id;

            // Query untuk mendapatkan jumlah total pemain dari game_id yang sama
            const sqlGetTotalPlayers = `
                SELECT COUNT(id) AS total_players
                FROM player
                WHERE game_id = ?
            `;
            connection.query(sqlGetTotalPlayers, [gameId], async (err, totalPlayersResult) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: 'Internal Server Error',
                        error: err.message
                    });
                }

                const totalPlayers = totalPlayersResult[0].total_players;

                // Query untuk mendapatkan data pemain berdasarkan game_id dan mengurutkannya berdasarkan skor tertinggi
                const sqlGetPlayerScore = `
                    SELECT player.id, player.name AS player_name, 
                        SUM(CASE WHEN answer.answer_text = question.correct_answer THEN 1 ELSE 0 END) AS total_correct_answers,
                        player.score AS player_score,
                        COUNT(answer.id) AS total_answers
                    FROM player
                    LEFT JOIN answer ON player.id = answer.player_id
                    LEFT JOIN question ON answer.question_id = question.id
                    WHERE player.game_id = ? 
                    GROUP BY player.id
                    ORDER BY player.score DESC

                `;

                connection.query(sqlGetPlayerScore, [gameId], async (err, playerResult) => {
                    if (err) {
                        return res.status(500).json({
                            status: false,
                            message: 'Internal Server Error',
                            error: err.message
                        });
                    }

                    // Tambahkan peringkat untuk setiap pemain dalam data
                    const rankedPlayerResult = playerResult.map((player, index) => ({
                        ...player,
                        player_rank: index + 1
                    }));

                    return res.status(200).json({
                        status: true,
                        message: 'Player scores retrieved successfully',
                        total_players: totalPlayers,
                        data: rankedPlayerResult
                    });
                });
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

// get detail pertanyaan dari quiz
router.get('/detailquestion/:quizId/:questionId', (req, res) => {
    try {
        const { quizId, questionId } = req.params;

        const sqlGetQuestionDetail = `
            SELECT 
                q.id AS question_id,
                q.question_text,
                q.option1,
                q.option2,
                q.option3,
                q.option4,
                q.correct_answer,
                q.question_type,
                qz.title AS quiz_title,  -- Mengambil title dari tabel quiz
                (
                    SELECT COUNT(*) + 1 
                    FROM question q2
                    WHERE q2.quiz_id = q.quiz_id AND q2.id < q.id
                ) AS question_number,   -- Menghitung nomor question
                qi.image_url AS questionImage,
                qi1.image_url AS option1_image,
                qi2.image_url AS option2_image,
                qi3.image_url AS option3_image,
                qi4.image_url AS option4_image
            FROM question q
            JOIN quiz qz ON qz.id = q.quiz_id   -- Join dengan tabel quiz
            LEFT JOIN question_images qi ON qi.question_id = q.id AND qi.image_type = 'question'
            LEFT JOIN question_images qi1 ON qi1.question_id = q.id AND qi1.image_type = 'option1'
            LEFT JOIN question_images qi2 ON qi2.question_id = q.id AND qi2.image_type = 'option2'
            LEFT JOIN question_images qi3 ON qi3.question_id = q.id AND qi3.image_type = 'option3'
            LEFT JOIN question_images qi4 ON qi4.question_id = q.id AND qi4.image_type = 'option4'
            WHERE q.quiz_id = ? AND q.id = ?
        `;
        connection.query(sqlGetQuestionDetail, [quizId, questionId], (err, questionResult) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            }

            if (questionResult.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: 'No question found for the specified quiz ID and question ID'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Question detail retrieved successfully',
                data: questionResult[0] 
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

// delete detail pertanyaan
router.delete('/delete-question/:quizId/:questionId', (req, res) => {
try {
    const { quizId, questionId } = req.params;

    const sqlDeleteQuestion = `
        DELETE FROM question
        WHERE id = ? AND quiz_id = ?
    `;
    connection.query(sqlDeleteQuestion, [questionId, quizId], (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: 'Question not found or does not belong to the specified quiz'
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Question deleted successfully'
        });
    });
} catch (error) {
    return res.status(500).json({
        status: false,
        message: 'Internal Server Error',
        error: error.message
    });
}
});

// soal quiz bertipe "melengkapi"
router.post('/createQuest/melengkapi/:quizId', upload.none(), [
    body('question').notEmpty(),
    body('correct_answer').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const quizId = req.params.quizId;
    const { question, correct_answer } = req.body;
    const qType = "melengkapi";

    let questionData = {
        quiz_id: quizId,
        question_text: question,
        correct_answer: correct_answer,
        question_type: qType
    };

    connection.query('INSERT INTO question SET ?', questionData, function (err, result) {
        if (err) {
            return res.status(500).json({ status: false, message: 'Internal Server Error', error: err.message });
        }

        return res.status(201).json({ status: true, message: 'Question Added Successfully', data: result });
    });
});

// update soal melengkapi
router.put('/updateQuest/melengkapi/:questionId', upload.none(), [
    body('question').notEmpty(),
    body('correct_answer').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const questionId = req.params.questionId;
    const { question, correct_answer } = req.body;

    let questionData = {
        question_text: question,
        correct_answer: correct_answer,
        question_type: 'melengkapi'
    };

    connection.query('UPDATE question SET ? WHERE id = ?', [questionData, questionId], function (err, result) {
        if (err) {
            return res.status(500).json({ status: false, message: 'Internal Server Error', error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: false, message: 'Question not found' });
        }

        return res.status(200).json({ status: true, message: 'Question Updated Successfully', data: result });
    });
});


// soal quiz bertipe "true or false atau tof"
router.post('/createQuest/truefalse/:quizId', upload.single('questionImage'), [
    body('question').notEmpty(),
    body('correct_answer').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const quizId = req.params.quizId;
    const { question, correct_answer } = req.body;
    const qType = "tof";
    const questionImage = req.file ? req.file.filename : null;

    let questionData = {
        quiz_id: quizId,
        question_text: question,
        correct_answer: correct_answer,
        question_type: qType
    };

    connection.query('INSERT INTO question SET ?', questionData, function (err, result) {
        if (err) {
            return res.status(500).json({ status: false, message: 'Internal Server Error', error: err.message });
        }

        const questionId = result.insertId;

        if (questionImage) {
            const imageEntry = {
                question_id: questionId,
                image_type: 'question',
                image_url: questionImage
            };

            connection.query('INSERT INTO question_images SET ?', imageEntry, function (imgErr, imgResult) {
                if (imgErr) {
                    return res.status(500).json({ status: false, message: 'Failed to save image', error: imgErr.message });
                }

                return res.status(201).json({ status: true, message: 'Question and Image Added Successfully', data: result });
            });
        } else {
            return res.status(201).json({ status: true, message: 'Question Added Successfully, no image to save', data: result });
        }
    });
});

// update soal true or false
router.put('/updateQuest/truefalse/:questionId', upload.single('questionImage'), [
    body('question').notEmpty(),
    body('correct_answer').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const questionId = req.params.questionId;
    const { question, correct_answer } = req.body;
    const questionImage = req.file ? req.file.filename : null;

    let questionData = {
        question_text: question,
        correct_answer: correct_answer,
        question_type: 'tof'
    };

    connection.query('UPDATE question SET ? WHERE id = ?', [questionData, questionId], function (err, result) {
        if (err) {
            return res.status(500).json({ status: false, message: 'Internal Server Error', error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: false, message: 'Question not found' });
        }

        if (questionImage) {
            const imageEntry = {
                image_url: questionImage,
                image_type: 'question'
            };

            connection.query('UPDATE question_images SET ? WHERE question_id = ?', [imageEntry, questionId], function (imgErr, imgResult) {
                if (imgErr) {
                    return res.status(500).json({ status: false, message: 'Failed to update image', error: imgErr.message });
                }

                return res.status(200).json({ status: true, message: 'Question and Image Updated Successfully', data: result });
            });
        } else {
            return res.status(200).json({ status: true, message: 'Question Updated Successfully, no image to update', data: result });
        }
    });
});

router.get('/games/:adminId', (req, res) => {
    try {
        const adminId = req.params.adminId; // Dapatkan adminId dari parameter rute

        // Kueri untuk mendapatkan data game, title dari tabel quiz, dan total player berdasarkan adminId
        const sqlGetGames = `
            SELECT g.quiz_id, q.title, g.status, g.game_code, g.start_time, g.end_time, COUNT(p.id) AS total_players
            FROM game g
            JOIN quiz q ON g.quiz_id = q.id
            LEFT JOIN player p ON g.game_code = p.game_code
            WHERE g.admin_id = ?
            GROUP BY g.quiz_id, q.title, g.status, g.game_code, g.start_time, g.end_time
            ORDER BY g.end_time DESC
        `;
        connection.query(sqlGetGames, [adminId], function (err, results) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            } else {
                // Cek apakah ada data yang ditemukan
                if (results.length === 0) {
                    return res.status(404).json({
                        status: false,
                        message: 'No games found for this admin'
                    });
                }
                
                return res.status(200).json({
                    status: 200,
                    message: 'Games retrieved successfully',
                    data: results
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

// Soal tipe TTS





  



module.exports = router;
