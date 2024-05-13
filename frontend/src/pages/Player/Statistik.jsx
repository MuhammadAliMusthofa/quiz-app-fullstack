
import React, { useEffect, useState } from 'react';

function Statistik({ gameCode, currentQuestionIndex, questions, setCountdown }) {
  const [answerSummary, setAnswerSummary] = useState([]);
  setCountdown(10)
  useEffect(() => {
    const fetchAnswerSummary = async () => {
      try {
        const response = await fetch(
          `http://192.168.40.36:4001/api/answer-summary/${gameCode}/${questions[currentQuestionIndex]?.question_id}`
        );
        if (response.ok) {
          const data = await response.json();
          setAnswerSummary(data.data);
          // Di sini, Anda juga dapat memperbarui countdown menggunakan setLocalCountdown
        } else {
          console.error("Failed to fetch answer summary:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching answer summary:", error);
      }
    };

    fetchAnswerSummary();

    const interval = setInterval(fetchAnswerSummary, 200)
    return () => clearInterval(interval);
  }, [gameCode, currentQuestionIndex, questions]);

  // Countdown ini akan diperbarui sesuai dengan nilai yang didapatkan dari API
 
  return (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <div className="col">
        {answerSummary?.map((answer, index) => (
          <div
            key={index}
            className={`p-3 text-center bg-${index % 2 === 0 ? "success" : "danger"} border text-light`}
          >
            {answer.answer_text}: {answer.total_answers} Answer
          </div>
        ))}
      </div>
      </div>
   
  );
}

// export default Statistik;


export default Statistik