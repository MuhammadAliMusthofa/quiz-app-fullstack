const express = require('express');
const router = express.Router();
require('dotenv').config();

const { body, validationResult } = require('express-validator');
const connection = require('../config/database');

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


router.post('/createDataQuiz/:quizId', [
    // Validasi
    body('question').notEmpty(),
    body('option1').notEmpty(),
    body('option2').notEmpty(),
    body('option3').notEmpty(),
    body('option4').notEmpty(),
    body('correctAnswer').notEmpty(),
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array()
            });
        }

        const quizId = req.params.quizId;

        // Definisikan formData untuk pertanyaan
        let questionFormData = {
            quiz_id: quizId,
            question_text: req.body.question,
            option1: req.body.option1,
            option2: req.body.option2,
            option3: req.body.option3,
            option4: req.body.option4,
            correct_answer: req.body.correctAnswer
        };

        // Lakukan penyimpanan data pertanyaan
        connection.query('INSERT INTO question SET ?', questionFormData, function (err, questionResult) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    error: err.message
                });
            } else {
                return res.status(201).json({
                    status: true,
                    message: 'Question Added Successfully',
                    data: questionResult
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

// Handler untuk memulai game dengan Server-Sent Events (SSE)
// Handler untuk memulai game dan membuat lobby baru
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

        const sqlQuery = `
            SELECT q.id AS question_id, q.question_text, q.correct_answer, q.option1, q.option2, q.option4, q.option3,
                   quiz.title AS quiz_title,
                   game.quiz_id,
                   game.status
            FROM question q
            JOIN quiz ON q.quiz_id = quiz.id
            JOIN game ON quiz.id = game.quiz_id
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

router.post('/answer', async (req, res) => {
    try {
        const { player_id, question_id, answer_text, countdown, game_code } = req.body;

        // Cari game_id berdasarkan game_code
        const sqlGetGameId = `
            SELECT id AS game_id
            FROM game
            WHERE game_code = ?
        `;
        connection.query(sqlGetGameId, [game_code], async (err, gameResult) => {
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

            const game_id = gameResult[0].game_id;

            // Cari correct_answer dan quiz_id berdasarkan question_id
            const sqlGetQuestionInfo = `
                SELECT correct_answer, quiz_id
                FROM question
                WHERE id = ?
            `;
            connection.query(sqlGetQuestionInfo, [question_id], async (err, questionResult) => {
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
                        message: 'Question not found'
                    });
                }

                const correctAnswer = questionResult[0].correct_answer;
                const quizId = questionResult[0].quiz_id;

                // Hitung score berdasarkan answer_text dan countdown
                let score;
                if (answer_text === correctAnswer) {
                    if (countdown <= 5) {
                        score = 100;
                    } else if (countdown <= 10) {
                        score = 50;
                    } else {
                        score = 25;
                    }
                } else {
                    score = 0;
                }

                // Simpan jawaban ke dalam tabel answer bersama dengan game_id
                const sqlInsertAnswer = `
                    INSERT INTO answer (player_id, question_id, answer_text, countdown, score, game_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                connection.query(sqlInsertAnswer, [player_id, question_id, answer_text, countdown, score, game_id], async (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            status: false,
                            message: 'Internal Server Error',
                            error: err.message
                        });
                    }

                    // Update skor pemain pada tabel player
                    const sqlUpdatePlayerScore = `
                        UPDATE player
                        SET score = score + ?
                        WHERE id = ?
                    `;
                    connection.query(sqlUpdatePlayerScore, [score, player_id], async (err, updateResult) => {
                        if (err) {
                            return res.status(500).json({
                                status: false,
                                message: 'Internal Server Error',
                                error: err.message
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






module.exports = router;
