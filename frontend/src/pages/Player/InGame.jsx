import React, { useState, useEffect } from "react";
import { useParams, useNavigate , Link} from "react-router-dom";
import Statistik from "./Statistik";
import { Row, Col } from "react-bootstrap";

const InGame = () => {
  const { gameCode } = useParams();
  const [status, setStatus] = useState("waiting");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [showAnswerSummary, setShowAnswerSummary] = useState(false); // State untuk menampilkan total jawaban
  const [answerSummary, setAnswerSummary] = useState(null); // State untuk menyimpan total jawaban
  const [selesai, setselesai] = useState(false);
  const [waktuMundur , setwaktuMundur] = useState(1000);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // State untuk melacak jawaban yang dipilih
  const [visibleOptions, setVisibleOptions] = useState({
    option1: true,
    option2: true,
    option3: true,
    option4: true,
  });
  const [answerDisabled, setAnswerDisabled] = useState(false); // State untuk menandai apakah jawaban sudah dipilih
  const navigate = useNavigate();

  // api untuk mengambil status game
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4001/api/quiz_list/${gameCode}`
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
  const handleAnswerSelection = async (e,answer) => {
    const answerOption = e.target.id;
    console.log(e.target.id)
    // console.log(answer)
    try {
      // Mengambil player_id dari localStorage
      const playerId = sessionStorage.getItem('playerId');
      // const optionNumber = answer.charAt(answer.length - 1);
      setSelectedAnswer(answer); // Menetapkan jawaban yang dipilih
      const response = await fetch(`http://localhost:4001/api/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player_id: playerId,
          question_id: questions[currentQuestionIndex]?.question_id,
          answer_text: answerOption,
          countdown: timer - countdown, // Ganti dengan nilai countdown yang sesuai
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
  };

  const handleFindNewGame = () => {
    // Hapus item playerId dari session storage
    sessionStorage.removeItem('playerId');
  };

  return (
    <div className="ingame-player">
      {selesai  && (<Statistik 
        gameCode={gameCode} 
        currentQuestionIndex={currentQuestionIndex === questions.length ? currentQuestionIndex  : currentQuestionIndex - 1  } 
        questions={questions} 
        setCountdown={setCountdown} // Melewatkan prop setCountdown ke komponen Statistik
       />)} 

        {status === "waiting" ? (
         <div className=" shadow col-md-6 mx-auto mt-5 p-4 card-lobby">

          <h1 className="text-center">Menunggu Game dimulai...</h1>
         </div>
        ) : status === "ingame" && selesai == false ? (
          <div className="card shadow col-md-6 mx-auto mt-5 p-4 rounded" id="card-play-quiz">
          <div className="text-center">
            <h1 className="mb-4">Kuis {currentQuestionIndex +1}</h1>
            <div>
              <h1 className="display-1">{countdown}</h1>
              
              <Row>
                <Col xs={12} md={6} className={`bg-primary p-4 ${selectedAnswer === questions[currentQuestionIndex]?.option1 ? "selected" : ""}`} onClick={(e) => handleAnswerSelection(e, questions[currentQuestionIndex]?.option1)} id="option1">
                  <p>A</p> 
                </Col>
                <Col xs={12} md={6} className={`bg-warning p-4 ${selectedAnswer === questions[currentQuestionIndex]?.option2 ? "selected" : ""}`} onClick={(e) => handleAnswerSelection(e, questions[currentQuestionIndex]?.option2)} id="option2">
                  <p>B</p> 
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={6} className={`bg-success p-4 ${selectedAnswer === questions[currentQuestionIndex]?.option3 ? "selected" : ""}`} onClick={(e) => handleAnswerSelection(e, questions[currentQuestionIndex]?.option3)} id="option3">
                  <p>C</p> 
                </Col>
                <Col xs={12} md={6} className={`bg-danger p-4 ${selectedAnswer === questions[currentQuestionIndex]?.option4 ? "selected" : ""}`} onClick={(e) => handleAnswerSelection(e, questions[currentQuestionIndex]?.option4)} id="option4">
                  <p>D</p> 
                </Col>
              </Row>
            </div>
          </div>
      </div>
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
