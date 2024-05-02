import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const InGame = () => {
  const { gameCode } = useParams();
  const [status, setStatus] = useState('waiting');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [showAnswerSummary, setShowAnswerSummary] = useState(false); // State untuk menampilkan total jawaban
  const [answerSummary, setAnswerSummary] = useState(null); // State untuk menyimpan total jawaban

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:4001/api/quiz_list/${gameCode}`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data.data[0].status);
          setQuestions(data.data);
        } else {
          console.error('Failed to fetch game status:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching game status:', error);
      }
    };

    fetchData();
  }, [gameCode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'ingame') {
        if (!showAnswerSummary) { // Jika tidak menampilkan total answer, jalankan interval untuk pertanyaan
          setCountdown(prevCountdown => {
            if (prevCountdown === 1) {
              setCurrentQuestionIndex(prevIndex => (prevIndex + 1) % questions.length); // Go to the next question
              return 10; // Reset countdown to 10 seconds for the next question
            } else {
              return prevCountdown - 1; // Decrease countdown every second
            }
          });
        }
      }
    }, 1000); // Update countdown every second

    // Membersihkan interval saat komponen dilepas atau ketika menampilkan total answer
    return () => clearInterval(interval);
  }, [status, questions.length, showAnswerSummary]);

  useEffect(() => {
    if (countdown === 0) {
      if (!showAnswerSummary) { // Jika tidak menampilkan total answer, tampilkan total answer
        fetchAnswerSummary();
        setShowAnswerSummary(true);
        setTimeout(() => {
          setShowAnswerSummary(false); // Setelah 10 detik, sembunyikan total answer dan lanjutkan ke pertanyaan berikutnya
        }, 10000);
      } else { // Jika menampilkan total answer, kembali ke pertanyaan berikutnya
        setCurrentQuestionIndex(prevIndex => (prevIndex + 1) % questions.length);
        setCountdown(10);
      }
    }
  }, [countdown, questions.length, showAnswerSummary]);

  const fetchAnswerSummary = async () => {
    try {
      const response = await fetch(`http://localhost:4001/api/answer-summary/${gameCode}/${questions[currentQuestionIndex]?.question_id}`);
      if (response.ok) {
        const data = await response.json();
        setAnswerSummary(data.data);
      } else {
        console.error('Failed to fetch answer summary:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching answer summary:', error);
    }
  };

  return (
    <div className="container">
      <div className="card shadow col-md-6 mx-auto mt-5 p-4">
        {status === 'waiting' ? (
          <h1 className="text-center mb-4">Menunggu Game Dimulai Oleh Host....</h1>
        ) : status === 'ingame' ? (
          <div className="text-center">
            <h1 className="mb-4">Kuis</h1>
            <div>
              <h1 className="display-1">{countdown}</h1>
              <p className="mb-4">{questions[currentQuestionIndex]?.question_text}</p>
              <ul className="list-group">
                <li className="list-group-item">{questions[currentQuestionIndex]?.option1}</li>
                <li className="list-group-item">{questions[currentQuestionIndex]?.option2}</li>
                <li className="list-group-item">{questions[currentQuestionIndex]?.option3}</li>
                <li className="list-group-item">{questions[currentQuestionIndex]?.option4}</li>
              </ul>
            </div>
          </div>
        ) : (
          <h1 className="text-center mb-4">Game Status Unknown</h1>
        )}
      </div>
      {/* Menampilkan total answer jika state showAnswerSummary true */}
      {showAnswerSummary && (
        <div className="d-flex justify-content-center align-items-center mt-3">
          <div className='col'>
            {answerSummary.map((answer, index) => (
              <div key={index} className={`p-3 text-center bg-${index % 2 === 0 ? 'success' : 'danger'} border text-light`}>
                {answer.answer_text}: {answer.total_answers} Answer
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InGame;
