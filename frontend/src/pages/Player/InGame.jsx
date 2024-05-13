import React, { useState, useEffect } from "react";
import { useParams, useNavigate , Link} from "react-router-dom";
import Statistik from "./Statistik";
import { Row, Col } from "react-bootstrap";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const InGame = () => {
  const { gameCode } = useParams();
  const [status, setStatus] = useState("waiting");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [showAnswerSummary, setShowAnswerSummary] = useState(false); // State untuk menampilkan total jawaban
  const [answerSummary, setAnswerSummary] = useState(null); // State untuk menyimpan total jawaban
  const [selesai, setselesai] = useState(false);
  const [waktuMundur , setwaktuMundur] = useState(1000);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // State untuk melacak jawaban yang dipilih
  const [optionsDisabled, setOptionsDisabled] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false
  });
  
  // State untuk melacak opsi jawaban yang sudah dipilih
const [answeredOptions, setAnsweredOptions] = useState({});

// Membuat fungsi untuk reset opsi jawaban yang sudah dipilih saat berganti pertanyaan
useEffect(() => {
  setAnsweredOptions({});
}, [currentQuestionIndex]);
  const navigate = useNavigate();

  // api untuk mengambil status game
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://192.168.40.36:4001/api/quiz_list/${gameCode}`
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

    // Panggil fetchData() setiap 1 detik
    const interval = setInterval(fetchData, 100);

    // Membersihkan interval saat komponen dilepas atau ketika gameCode berubah
    return () => clearInterval(interval);
    // fetchData();
  }, [gameCode]);
  console.log(countdown);

  function DelayWaktu(i) {
    return new Promise((resolve) => setTimeout(resolve, i));
  }

  // Logika untuk pungulangan soal
  useEffect(() => {
    const interval = setInterval(() => {
      setwaktuMundur(1000)
      if (status === "ingame") {
        setselesai(false)
        if (!showAnswerSummary) {
          // Jika tidak menampilkan total answer, jalankan interval untuk pertanyaan
          setCountdown((prevCountdown) => {
            // console.log(`prevCountdown`,prevCountdown)
            if (prevCountdown === 1) {
              if (currentQuestionIndex === questions.length - 1   ) {
                // Jika ini adalah pertanyaan terakhir, arahkan ke halaman finish
                // clearInterval(interval); // Hentikan interval
                navigate(`/player/finish/${gameCode}`); // Navigasi ke halaman finish
                // return ; // Atur countdown ke 0 agar tidak lanjut ke pertanyaan berikutnya
              } else {
                setCurrentQuestionIndex(
                  (prevIndex) => (prevIndex + 1) % questions.length
                ); // Go to the next question
                setwaktuMundur(5000)
                setselesai(true)
                // return 10; // Reset countdown to 10 seconds for the next question
              }
              
            } else {
              return prevCountdown - 1; // Decrease countdown every second
            }
          });
        }
      }
    }, waktuMundur); // Update countdown every second
    // Membersihkan interval saat komponen dilepas atau ketika menampilkan total answer
    console.log(`waktuMundur`,waktuMundur)
    return () => clearInterval(interval);
  }, [status, questions.length, showAnswerSummary,waktuMundur]);

  const timer = 10;

  // api jawaban
 // Memperbarui fungsi handleAnswerSelection untuk memeriksa apakah opsi sudah dipilih
const handleAnswerSelection = async (e, answer) => {
  const answerOption = e.target.id;

  if (!answeredOptions[currentQuestionIndex]) {
    try {
      const playerId = sessionStorage.getItem('playerId');
      setSelectedAnswer(answer); // Menetapkan jawaban yang dipilih

       // Menampilkan Snackbar "Anda sudah menjawab"
       setSnackbarOpen(true);

      // Menonaktifkan opsi yang dipilih
      setAnsweredOptions(prevState => ({
        ...prevState,
        [currentQuestionIndex]: true
      }));

      const response = await fetch(`http://192.168.40.36:4001/api/answer`, {
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

  const handleFindNewGame = () => {
    // Hapus item playerId dari session storage
    sessionStorage.removeItem('playerId');
  };

  return (
    <div className="ingame-player">
      
      <div className=" d-flex justify-content-center align-items-center ">
        <div className="col-md-8">
      {selesai  && (<Statistik 
        gameCode={gameCode} 
        currentQuestionIndex={currentQuestionIndex === questions.length ? currentQuestionIndex  : currentQuestionIndex - 1  } 
        questions={questions} 
        setCountdown={setCountdown} // Melewatkan prop setCountdown ke komponen Statistik
       />)} 

        </div>


      </div>

        {status === "waiting" ? (
         <div className=" shadow col-md-6 mx-auto mt-5 p-4 card-lobby">

          <h1 className="text-center">Menunggu Game dimulai...</h1>
         </div>
        ) : status === "ingame" && selesai == false ? (
          <>
          <Snackbar open={snackbarOpen} autoHideDuration={1000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={() => setSnackbarOpen(false)}>
          <MuiAlert elevation={6} variant="filled" onClose={() => setSnackbarOpen(false)} severity="info">
            Anda sudah menjawab
          </MuiAlert>
        </Snackbar>
          <div className="card shadow col-md-6 mx-auto mt-5 p-4 rounded" id="card-play-quiz">
          <div className="text-center">
            <h1 className="mb-4">Kuis {currentQuestionIndex +1}</h1>
            <div>
              <h1 className="display-1">{countdown}</h1>
              
              <Row>
                <Col xs={12} md={6} className={`bg-primary p-4 ${selectedAnswer === questions[currentQuestionIndex]?.option1 ? "selected" : ""}`} onClick={(e) => handleAnswerSelection(e, questions[currentQuestionIndex]?.option1)} id="option1" >
                  A
                </Col>
                <Col xs={12} md={6} className={`bg-warning p-4 ${selectedAnswer === questions[currentQuestionIndex]?.option2 ? "selected" : ""}`} onClick={(e) => handleAnswerSelection(e, questions[currentQuestionIndex]?.option2)} id="option2">
                  B
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={6} className={`bg-success p-4 ${selectedAnswer === questions[currentQuestionIndex]?.option3 ? "selected" : ""}`} onClick={(e) => handleAnswerSelection(e, questions[currentQuestionIndex]?.option3)} id="option3">
                  C 
                </Col>
                <Col xs={12} md={6} className={`bg-danger p-4 ${selectedAnswer === questions[currentQuestionIndex]?.option4 ? "selected" : ""}`} onClick={(e) => handleAnswerSelection(e, questions[currentQuestionIndex]?.option4)} id="option4">
                  D
                </Col>
              </Row>
            </div>
          </div>
      </div>
          </>
        ) : status === "Finish" ? (
          <>
          <h1 className="text-center mb-4">Game Telah Selesai</h1>

          <Link to="/">
            <button className=" btn btn-lg btn-primary" onClick={handleFindNewGame}>Mencari Game Baru</button>
          </Link>
          </>
        ) : (
          <h1 className="text-center mb-4">Total Player Menjawab</h1>
        )}
    </div>
  );
};

export default InGame;
