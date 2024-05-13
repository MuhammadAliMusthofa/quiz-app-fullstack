import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Statistik from "../Player/Statistik";

const Host = () => {
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
  const navigate = useNavigate();

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

    fetchData();
  }, [gameCode]);
  console.log(countdown);

  function DelayWaktu(i) {
    return new Promise((resolve) => setTimeout(resolve, i));
  }


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
                navigate(`/host/finish/${gameCode}`); // Navigasi ke halaman finish
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
  const handleAnswerSelection = async (answer) => {
    try {
      // Mengambil player_id dari localStorage
      const playerId = sessionStorage.getItem('playerId');

      setSelectedAnswer(answer); // Menetapkan jawaban yang dipilih
      const response = await fetch('http://192.168.40.36:4001/api/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player_id: playerId,
          question_id: questions[currentQuestionIndex]?.question_id,
          answer_text: answer,
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

  return (
    <div className="ingame-player">
      {selesai && (<Statistik 
        gameCode={gameCode} 
        currentQuestionIndex={currentQuestionIndex === questions.length ? currentQuestionIndex  : currentQuestionIndex -1   } 
        questions={questions} 
        setCountdown={setCountdown} // Melewatkan prop setCountdown ke komponen Statistik
       />)} 

        {status === "waiting" ? (
          <div className="card shadow col-md-6 mx-auto mt-5 p-4">
              <h1 className="text-center mb-4">
                Menunggu Game Dimulai Oleh Host....
              </h1>
          </div>
        ) : status === "ingame" && selesai == false ? (
        <div className=" shadow col-md-6 mx-auto mt-5 p-4" id="card-play-quiz">
          <div className="text-center" >
            <h1 className="mb-4">Kuis {currentQuestionIndex +1}</h1>
            <div>
              <h1 className="display-1">{countdown}</h1>

              <h3>{questions[currentQuestionIndex].question_text}</h3>
              <img src={questions[currentQuestionIndex].question_image} alt="" />
              
              <div className="d-flex flex-wrap justify-content-around p-3">
  <div className="option-item mb-3 p-3  rounded " style={{ backgroundImage: `url(http://192.168.40.36:4001/image/${questions[currentQuestionIndex]?.option1_image})`, height:'150px', width:'200px' }}>
    <p>{questions[currentQuestionIndex]?.option1}</p>
  </div>
  <div className="option-item mb-3 p-3  rounded " style={{ backgroundImage: `url(http://192.168.40.36:4001/image/${questions[currentQuestionIndex]?.option2_image})`, height:'150px', width:'200px' }}>
    <p>{questions[currentQuestionIndex]?.option2}</p>
  </div>
  <div className="option-item mb-3 p-3  rounded " style={{ backgroundImage: `url(http://192.168.40.36:4001/image/${questions[currentQuestionIndex]?.option3_image})`, height:'150px', width:'200px' }}>
    <p>{questions[currentQuestionIndex]?.option3}</p>
  </div>
  <div className="option-item mb-3 p-3  rounded " style={{ backgroundImage: `url(http://192.168.40.36:4001/image/${questions[currentQuestionIndex]?.option4_image})`, height:'150px', width:'200px' }}>
    <p>{questions[currentQuestionIndex]?.option4}</p>
  </div>
</div>

              

            </div>
          </div>
        </div>
        ) : (
          <h1 className="text-center mb-4">Total Player Menjawab</h1>
        )}
      </div>

     
  );
};

export default Host;

