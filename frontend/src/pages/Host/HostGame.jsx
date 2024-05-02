import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const InGame = () => {
  const { gameCode } = useParams();
  const [status, setStatus] = useState('waiting');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [countdown, setCountdown] = useState(10);

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
    const interval1 = setInterval(fetchData, 1000); 
    const interval = setInterval(() => {
      if (status === 'ingame') {
        setCountdown(prevCountdown => {
          if (prevCountdown === 1) {
            setCurrentQuestionIndex(prevIndex => (prevIndex + 1) % questions.length);
            return 10;
          } else {
            return prevCountdown - 1;
          }
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(interval1);
    } 
    
  }, [gameCode, status]);

  useEffect(() => {
    if (countdown === 0 && currentQuestionIndex === questions.length - 1) {
      finishGame();
    } else if (countdown === 0) {
      setCurrentQuestionIndex(prevIndex => (prevIndex + 1) % questions.length);
      setCountdown(1);
    }
  }, [countdown, currentQuestionIndex, questions]);

  const finishGame = async () => {
    try {
      const response = await fetch(`http://localhost:4001/api/game/finish/${gameCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        console.log('Game finished successfully');
        setStatus('Finish'); // Set status to "Finish" locally
      } else {
        console.error('Failed to finish game:', response.statusText);
      }
    } catch (error) {
      console.error('Error finishing game:', error);
    }
  };

  return (
    <div className="container">
      <div className="card shadow col-md-6 mx-auto mt-5 p-4">
        {status === 'waiting' ? (
          <h1 className="text-center mb-4">Menunggu Game Dimulai Oleh Host....</h1>
        ) : status === 'ingame' ? (
          <div className="text-center">
            <h1 className="mb-4">Kuis {currentQuestionIndex + 1 }</h1>
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
        ) : status === 'Finish' ? (
          <h1 className="text-center mb-4">Finish</h1>
        ) : (
          <h1 className="text-center mb-4">Game Status Unknown</h1>
        )}
      </div>
    </div>
  );
};

export default InGame;
