import React, { useState, useEffect } from "react";
import { useParams, useNavigate , Link } from "react-router-dom";
import Statistik from "./Statistik";
import { Row, Col } from "react-bootstrap";
import Snackbar from '@mui/material/Snackbar';
import { TextField, Box, Modal } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { Bounce } from "react-awesome-reveal";
import api from '../../config/Api';


const InGame = () => {
  const { gameCode } = useParams();
  const [status, setStatus] = useState("waiting");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [playerScores, setPlayerScores] = useState([]);
  const [playerScore, setPlayerScore] = useState([]);
  const [players, setPlayers] = useState([]); // State untuk menyimpan data pemain

  const [totalPlayer, setTotalPlayer] = useState(null);
  const [playerName, setPlayerName] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [countdown, setCountdown] = useState(24);
  const [showAnswerSummary, setShowAnswerSummary] = useState(false);
  const [answerSummary, setAnswerSummary] = useState(null);
  const [selesai, setselesai] = useState(false);
  const [waktuMundur , setwaktuMundur] = useState(1000);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answeredOptions, setAnsweredOptions] = useState({});
  const [optionsDisabled, setOptionsDisabled] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false
  });

  const [correctAnswer, setCorrectAnswer] = useState('');
  const [answered, setAnswered] = useState('');
  const [tofAnswer, setTofAnswer] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

 useEffect(() => {
    if (status === "ingame") {
        setShowModal(true);
        setShowQuiz(false);
        setTimeout(() => {
            setShowModal(false);
            setShowQuiz(true);
        }, 4000); // 4000 ms = 4 detik
    }
}, [status]);


    const handleCorrectAnswerChange = (event) => {
        setCorrectAnswer(event.target.value);
        setAnswered(event.target.value);
      
    };


    const GO = "/public/assets/going.gif";

      // Fungsi untuk mengambil data pemain dari API
  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${api}/playerss/${gameCode}`);
      if (response.ok) {
        const data = await response.json();
        setPlayers(data.data); // Simpan data pemain ke dalam state
      } else {
        console.error("Failed to fetch players:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

 


  // Memanggil fungsi fetchGameData saat komponen dimuat
  useEffect(() => {
    const intervalId = setInterval(fetchPlayers, 500);

    // Bersihkan interval saat komponen dilepas
    return () => {
      clearInterval(intervalId);
    };
  }, [gameCode]);

    const playerId = sessionStorage.getItem('playerId');

    useEffect(() => {
      const fetchPlayerScores = async () => {
          try {
              const response = await fetch(`${api}/player-score/${gameCode}`);
              if (!response.ok) {
                  throw new Error("Failed to fetch player scores");
              }
              const data = await response.json();
              
              // Temukan peringkat player dengan membandingkan player_id dari session dengan player_id dalam respons
              const yourRanking = data.data.findIndex(player => player.id === parseInt(playerId)) + 1;
              // Temukan nama pemain berdasarkan playerId
              const yourPlayer = data.data.find(player => player.id === parseInt(playerId));
              const yourName = yourPlayer ? yourPlayer.player_name : "Unknown";
              const yourScore = yourPlayer ? yourPlayer.player_score : 0;
              setPlayerScore(yourScore); // Simpan skor pemain ke dalam state baru
              setPlayerName(yourName)
  
              // setPlayerRank(yourRanking)
              const countPlayer = data.total_players;
              setTotalPlayer(countPlayer)
              setPlayerScores(data.data);
          } catch (error) {
              console.error("Error fetching player scores:", error);
          }
      };
  
      fetchPlayerScores();
       // Atur interval untuk menjalankan fetchPlayerScores setiap 1 detik
       const intervalId = setInterval(fetchPlayerScores, 1000);
  
       // Bersihkan interval saat komponen di-unmount atau gameCode berubah
       return () => clearInterval(intervalId);
    }, [gameCode]);

  useEffect(() => {
    // Memeriksa apakah ada data yang tersimpan di session storage saat komponen dimuat
    const storedData = sessionStorage.getItem('gameData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setStatus(parsedData.status);
      setQuestions(parsedData.questions);
      setCurrentQuestionIndex(parsedData.currentQuestionIndex);
      setCountdown(parsedData.countdown);
      setShowAnswerSummary(parsedData.showAnswerSummary);
      setAnswerSummary(parsedData.answerSummary);
      setselesai(parsedData.selesai);
      setSelectedAnswer(parsedData.selectedAnswer);
      setOptionsDisabled(parsedData.optionsDisabled);
    }
  }, []);

  useEffect(() => {
    // Menyimpan data ke session storage setiap kali ada perubahan pada state
    const gameData = {
      status,
      questions,
      currentQuestionIndex,
      countdown,
      showAnswerSummary,
      answerSummary,
      selesai,
      selectedAnswer,
      optionsDisabled
    };
    sessionStorage.setItem('gameData', JSON.stringify(gameData));
  }, [status, questions, currentQuestionIndex, countdown, showAnswerSummary, answerSummary, selesai, selectedAnswer, optionsDisabled]);

  const navigate = useNavigate();

  // API untuk mengambil status game
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${api}/quiz_list/${gameCode}`
        );
        if (response.ok) {
          const data = await response.json();
          setStatus(data.data[0].status);
          setQuestions(data.data);
        } else {
          console.error("Failed to fetch game status:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching game status:", error);
      }
    };

    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, [gameCode]);

  function DelayWaktu(i) {
    return new Promise((resolve) => setTimeout(resolve, i));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setwaktuMundur(1000);
      if (status === "ingame") {
        setselesai(false);
        if (!showAnswerSummary) {
          // Jika tidak menampilkan total answer, jalankan interval untuk pertanyaan
          setCountdown((prevCountdown) => {
            // console.log(`prevCountdown`,prevCountdown)
            if (prevCountdown === 1) {
              if (currentQuestionIndex === questions.length - 1) {
                // Jika ini adalah pertanyaan terakhir, arahkan ke halaman finish
                navigate(`/player/finish/${gameCode}`);
              } else {
                setCurrentQuestionIndex(
                  (prevIndex) => (prevIndex + 1) % questions.length
                ); // Go to the next question
                setwaktuMundur(5000);
                setselesai(true);
              }
            } else {
              return prevCountdown - 1; // Decrease countdown every second
            }
          });
        }
      }
    }, waktuMundur); // Update countdown every second
    return () => clearInterval(interval);
  }, [status, questions.length, showAnswerSummary, waktuMundur]);

  const timer = 20;

  // jawab soal tipe pilihan ganda
  const handleAnswerSelection = async (e, answer) => {
    const answerOption = e.target.id;

    if (!answeredOptions[currentQuestionIndex]) {
      try {
        const playerId = sessionStorage.getItem('playerId');
        setSelectedAnswer(answer);
        setSnackbarOpen(true);
        setAnsweredOptions(prevState => ({
          ...prevState,
          [currentQuestionIndex]: true
        }));

        const response = await fetch(`${api}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            player_id: playerId,
            question_id: questions[currentQuestionIndex]?.question_id,
            answer_text: answerOption,
            countdown: timer - countdown,
            game_code: gameCode,
          }),
        });

        if (response.ok) {
          console.log("Answer submitted successfully");
        } else {
          console.error("Failed to submit answer:", response.statusText);
        }
      } catch (error) {
        console.error("Error submitting answer:", error);
      }
    }
  };

  // jawab soal tipe melengkapi
  const handleMelengkapiAnswer = async () => {

    if (!answeredOptions[currentQuestionIndex]) {
      try {
        const playerId = sessionStorage.getItem('playerId');
        setSelectedAnswer(answered);
        setSnackbarOpen(true);
        setAnsweredOptions(prevState => ({
          ...prevState,
          [currentQuestionIndex]: true
        }));

        const response = await fetch(`${api}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            player_id: playerId,
            question_id: questions[currentQuestionIndex]?.question_id,
            answer_text: answered,
            countdown: timer - countdown,
            game_code: gameCode,
          }),
        });

        if (response.ok) {
          console.log("Answer submitted successfully");
        } else {
          console.error("Failed to submit answer:", response.statusText);
        }
      } catch (error) {
        console.error("Error submitting answer:", error);
      }
    }
  };

  
  // Jawab Soal Tipe true or false
  const handleAnswerTof = async (answer) => {

    if (!answeredOptions[currentQuestionIndex]) {
      try {
        const playerId = sessionStorage.getItem('playerId');
      
        setSelectedAnswer(answer);
        setSnackbarOpen(true);
        setAnsweredOptions(prevState => ({
          ...prevState,
          [currentQuestionIndex]: true
        }));

        const response = await fetch(`${api}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            player_id: playerId,
            question_id: questions[currentQuestionIndex]?.question_id,
            answer_text: answer,
            countdown: timer - countdown,
            game_code: gameCode,
          }),
        });
        if (response.ok) {
          console.log(`ini jawaban:mu ${tofAnswer} Answer submitted successfully `);
        } else {
          console.error("Failed to submit answer:", response.statusText);
        }
      } catch (error) {
        console.error("Error submitting answer:", error);
      }

    };
  };

  const handleAnswerClick = (event) => {
    const answer = event.currentTarget.id; // Use id as answer
    setTofAnswer(answer);
    handleAnswerTof(answer); // Pass the answer to the submission function
  };
  


  const handleFindNewGame = () => {
    sessionStorage.clear();
    navigate("/")

  };

  const renderQuestionOptions = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    switch (currentQuestion.question_type) {
      case "tof":
        return (

          

          <div className="d-flex flex-column justify-content-around h-100  ">
            <div className="container-fluid h-75 ">
              <div className="row h-75">
                <div className="col-md-6 d-flex justify-content-center align-items-center">
                  <div className="p-3   w-100 h-75 d-flex justify-content-center align-items-center rounded-5"  onClick={handleAnswerClick} id="false" style={{backgroundColor:'#FF66C4', borderRight:'8px solid #FFB9FF', borderBottom:'8px solid #FFB9FF'}}>
                      <h1 className="text-light" style={{fontSize:'4em'}}>FALSE</h1>
                  </div>
                </div>
                <div className="col-md-6 d-flex justify-content-center align-items-center">
                  <div className="p-3   w-100 h-75 d-flex justify-content-center align-items-center rounded-5"  onClick={handleAnswerClick} id="true" style={{backgroundColor:'#00BF63', borderLeft:'8px solid #96FABD', borderBottom:'8px solid #96FABD'}}>
                  <h1 className="text-light" style={{fontSize:'4em'}}>TRUE</h1>
                  </div>
                </div>
              </div>
             
            </div>

            <div className="p-3 footer-player d-flex justify-content-around">
              <div className=" rounded p-1 " style={{width:'', backgroundColor:'#8D4F98', borderRight:'4px solid #EE8EFF', borderBottom:'4px solid #EE8EFF'}}>
                <h2 className="text-center mt-2 text-light">{playerName}  </h2>
              </div>
              <div className="bg-secondary rounded " style={{ borderRight:'4px solid #000', borderBottom:'4px solid #000'}}>
                
                <h3 className="text-center text-light mt-3 ">{playerScore? playerScore : 0}</h3>
              </div>
            </div>
         </div>
          // <Row>
          //   <Col xs={12} md={6} className={`bg-primary p-4 `}  onClick={handleAnswerClick} id="false" >
          //     <h1>FALSE</h1> 
          //   </Col>
          //   <Col xs={12} md={6} className={`bg-warning p-4 `}  onClick={handleAnswerClick} id="true">
          //     <h1>TRUE</h1> 
          //   </Col>
          // </Row>
        );
      case "melengkapi":
        return (
          <>
          <div className="d-flex flex-column justify-content-around h-100  ">
            <div className="container-fluid h-75 ">
             
            </div>
            <Box sx={{ p: 5, backgroundColor: 'none' }}>
            <h3>Masukkan Jawaban</h3>
            <TextField
              id="question-input"
              name="question"
              placeholder="       Masukan Jawaban      "
              fullWidth
              variant="outlined"
              margin="normal"
              className="shadow"
              onChange={handleCorrectAnswerChange}
              sx={{
                
                backgroundColor: '#fff',
                borderRadius: '10px',
                '& .MuiInputBase-input': {
                  textAlign: 'center',
                  fontSize: '50px',
                  minHeight: '200px',
                  maxHeight: '500px',
                  padding: '16px'
                },
                height: 'auto'
              }}
            />
            <button className="btn-55 mt-4" onClick={handleMelengkapiAnswer}><span>Kirim Jawaban</span></button>
          </Box>

            <div className="p-3 footer-player d-flex justify-content-around">
              <div className=" rounded p-1 " style={{width:'', backgroundColor:'#8D4F98', borderRight:'4px solid #EE8EFF', borderBottom:'4px solid #EE8EFF'}}>
                <h2 className="text-center mt-2 text-light">{playerName}  </h2>
              </div>
              <div className="bg-secondary rounded " style={{ borderRight:'4px solid #000', borderBottom:'4px solid #000'}}>
                
                <h3 className="text-center text-light mt-3 ">{playerScore? playerScore : 0}</h3>
              </div>
            </div>
         </div>
         
          </>
        );
      default:
        return (
          <>
         
         <div className="d-flex flex-column justify-content-around h-100  ">
            <div className="container-fluid h-75 ">
              <div className="row h-50">
                <div className="col-md-6 d-flex justify-content-center align-items-center">
                  <div className="p-3   w-100 h-75 d-flex justify-content-center align-items-center rounded-5" style={{backgroundColor:'#C039FF', borderRight:'8px solid #C584FC', borderBottom:'8px solid #C584FC'}}>
                  <img src="/assets/card-a.png" className="img-fluid w-25" alt="" onClick={(e) => handleAnswerSelection(e, currentQuestion.option1)} id="option1" />

                  </div>
                </div>
                <div className="col-md-6 d-flex justify-content-center align-items-center">
                  <div className="p-3   w-100 h-75 d-flex justify-content-center align-items-center rounded-5"  style={{backgroundColor:'#FFA015', borderLeft:'8px solid #FFCF96', borderBottom:'8px solid #FFCF96'}}>
                  <img src="/assets/card-b.png" className="img-fluid w-25" alt="" onClick={(e) => handleAnswerSelection(e, currentQuestion.option2)} id="option2"  />

                  </div>
                </div>
              </div>
              <div className="row h-50 mt-4">
                <div className="col-md-6 d-flex justify-content-center align-items-center">
                  <div className="p-3   w-100 h-75 d-flex justify-content-center align-items-center rounded-5" style={{backgroundColor:'#00BF63', borderRight:'8px solid #96FABD', borderBottom:'8px solid #96FABD'}}>
                    <img src="/assets/card-c.png" className="img-fluid w-25" alt="" onClick={(e) => handleAnswerSelection(e, currentQuestion.option2)} id="option3" />
                  </div>
                </div>
                <div className="col-md-6 d-flex justify-content-center align-items-center ">
                  <div className="p-3   w-100 h-75 d-flex justify-content-center align-items-center rounded-5" style={{backgroundColor:'#FF66C4', borderLeft:'8px solid #FFB9FF', borderBottom:'8px solid #FFB9FF'}}>
                  <img src="/assets/card-d.png" className="img-fluid w-25" alt="" onClick={(e) => handleAnswerSelection(e, currentQuestion.option2)} id="option4" />

                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 footer-player d-flex justify-content-around mt-3">
              <div className=" rounded p-1 " style={{width:'', backgroundColor:'#8D4F98', borderRight:'4px solid #EE8EFF', borderBottom:'4px solid #EE8EFF'}}>
                <h2 className="text-center mt-2 text-light">{playerName}  </h2>
              </div>
              <div className="bg-secondary rounded " style={{ borderRight:'4px solid #000', borderBottom:'4px solid #000'}}>
                
                <h3 className="text-center text-light mt-3 " style={{width:'100px'}}>{playerScore? playerScore : 0}</h3>
              </div>
            </div>
         </div>
         
          </>
        );
    }
  };

  return (
    <div className="hostgame-player">
      <div className="d-flex justify-content-center">
        <div className="col-md-8">
          <div style={{margin:'30px auto'}}>
            {selesai && (
              <Statistik 
                gameCode={gameCode} 
                currentQuestionIndex={currentQuestionIndex === questions.length ? currentQuestionIndex : currentQuestionIndex - 1} 
                questions={questions} 
                setCountdown={setCountdown} 
              />
            )}
          </div>
        </div>
      </div>

      {status === "waiting" ? (
        <>
        <div className="d-flex  flex-column justify-content-around">
              <div className="container d-flex  justify-content-center">
                  <div className="shadow col-md-6 p-4 card-lobby ms-2 me-2">
                    <h1 className="text-center">Menunggu Game dimulai...</h1>
                  </div>
              </div>

              <div className="container">
                  <div className=" col-md-12 mx-auto  p-4  ms-2 me-2">
                  {players.length > 0 ? (
                  <>
                    <h2 className="mb-3 text-light">Players:</h2>
                  
                    <div className=" d-flex flex-wrap justify-content-center">
                      {players.map((player) => (
                        <Bounce cascade damping={0.1} key={player?.id}>
                          <div className=" p-3  d-flex align-items-center me-3" id="lobby-player">
                            <h5>{player?.name}</h5>
                          </div>
                        </Bounce>
                      ))}
                    </div>
                    <Modal
                    open={showModal}
                    onClose={() => {}}
                    aria-labelledby="ingame-modal"
                    aria-describedby="ingame-modal-description"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Box className='p-5' sx={{ border: 'none', boxShadow: 'none', outline: 'none' }}>
                        <img src={GO} alt="Loading" style={{ width: '300px' }} />
                    </Box>
                </Modal>
                  </>
                ) : (
                  <p>No players in the game</p>
                )}
                  </div>
                  
              </div>
        </div>
        
        </>
      ) : status === "ingame" && selesai === false ? (
        <>
            {showModal && (
                <Modal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    aria-labelledby="ingame-modal"
                    aria-describedby="ingame-modal-description"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Box className='p-5' sx={{ border: 'none', boxShadow: 'none', outline: 'none' }}>
                        <img src={GO} alt="Loading" style={{ width: '300px' }} />
                    </Box>
                </Modal>
            )}
            {showQuiz && (
                <>
                    <Snackbar open={snackbarOpen} autoHideDuration={1000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={() => setSnackbarOpen(false)}>
                        <MuiAlert elevation={6} variant="filled" onClose={() => setSnackbarOpen(false)} severity="info">
                            Anda sudah menjawab
                        </MuiAlert>
                    </Snackbar>
                    {/* <div className="card shadow col-md-6 mx-auto mt-5 p-4 rounded" id="card-play-quiz">
                        <div className="text-center">
                            <h1 className="mb-4">Kuis {currentQuestionIndex + 1}</h1>
                            <div>
                                <h1 className="display-1">{countdown}</h1>
                            </div>
                        </div>
                    </div> */}
                    {renderQuestionOptions()}
                </>
            )}
        </>
      ) : status === "Finish" && (
        <>
          <h1 className="text-center mb-4 text-light">Game Telah Selesai</h1>

          <div className="container d-flex  justify-content-center">
          <     button className="btn btn-lg btn-primary" onClick={handleFindNewGame}>Mencari Game Baru</button>
                  
              </div>
          <Link to="/"></Link>
        </>
      )}
    </div>
  );
};

export default InGame;
