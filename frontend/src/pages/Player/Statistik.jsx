import React, { useEffect, useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../config/Api';

function Statistik({ gameCode, currentQuestionIndex, questions, setCountdown }) {
  const [answerSummary, setAnswerSummary] = useState([]);
  setCountdown(20)

  useEffect(() => {
    const fetchAnswerSummary = async () => {
      try {
        const response = await fetch(
          `${api}/answer-summary/${gameCode}/${questions[currentQuestionIndex]?.question_id}`
        );
        if (response.ok) {
          const data = await response.json();
          setAnswerSummary(data.data);
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

  // Fungsi untuk memberikan warna yang berbeda pada setiap bar
  const getColor = (answerText) => {
    switch (answerText) {
      case 'option1':
        return '#007bff'; // Warna biru
      case 'option2':
        return '#ff8c00'; // Warna oren
      case 'option3':
        return '#28a745'; // Warna hijau
      case 'option4':
        return '#dc3545'; // Warna merah
      default:
        return '#000'; // Warna default
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <div className="col">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={answerSummary}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="answer_text" tick={{ fill: "#fff" }} />
            <YAxis tick={{ fill: "#fff" }} />
            <Tooltip contentStyle={{ color: "#fff" }} />
            <Legend />
            <Bar dataKey="total_answers" name="Total Answers">
              {answerSummary.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.answer_text)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Statistik;
