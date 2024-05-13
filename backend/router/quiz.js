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

        // Lakukan kueri untuk mendapatkan semua quiz berdasarkan ID pengguna
        const sqlGetQuizByUserId = 'SELECT * FROM quiz WHERE creator_id = ?';
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

        // Updated query to fetch questions along with their respective images
        const sqlGetQuestions = `
            SELECT 
                q.id AS question_id, 
                q.question_text, 
                q.option1, 
                q.option2, 
                q.option3, 
                q.option4, 
                q.correct_answer,
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

            // Return data with images for each question and its options
            return res.status(200).json({
                status: true,
                message: 'Questions and images retrieved successfully',
                data: questionsResult
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

        // Lakukan kueri untuk mengupdate status permainan menjadi "ingame" berdasarkan game code
        const sqlUpdateGameStatus = 'UPDATE game SET status = "ingame" WHERE game_code = ?';
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
            SELECT q.id AS question_id, q.question_text, q.correct_answer, q.option1, q.option2, q.option3, q.option4,
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
                    score = 50;
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
            SET status = 'Finish'
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



// player score si player




  



module.exports = router;
