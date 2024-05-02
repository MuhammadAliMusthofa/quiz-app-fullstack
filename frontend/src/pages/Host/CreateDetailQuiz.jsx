import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function CreateQuizPage() {
  const { quizId } = useParams();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [quizName, setQuizName] = useState("");

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const fetchQuizName = async () => {
      try {
        const response = await fetch(`http://localhost:4001/api/quiz/${userId}`);
        if (response.ok) {
          const data = await response.json();
          const quiz = data.data.find((item) => item.id === parseInt(quizId));
          if (quiz) {
            setQuizName(quiz.title);
          }
        } else {
          console.error("Failed to fetch quiz name:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching quiz name:", error);
      }
    };

    fetchQuizName();
  }, [quizId]);

  const handleChange = (e, index) => {
    if (index === -1) {
      setQuestion(e.target.value);
    } else if (index >= 0 && index < 4) {
      const updatedOptions = [...options];
      updatedOptions[index] = e.target.value;
      setOptions(updatedOptions);
    } else if (index === 4) {
      setCorrectAnswer(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const quizData = {
      question: question,
      option1: options[0],
      option2: options[1],
      option3: options[2],
      option4: options[3],
      correctAnswer: correctAnswer,
    };

    try {
      const response = await fetch(`http://localhost:4001/api/createDataQuiz/${quizId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizData),
      });

      if (response.ok) {
        window.alert("Quiz created successfully!");
      } else {
        console.error("Failed to create quiz:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center">
        <div className="col-md-6">
          <h1 className="my-4">Create Quiz: {quizName}</h1>
          <form onSubmit={handleSubmit}>
            <div className="card shadow p-3 mb-3">
              <div className="mb-3 ">
                <label htmlFor="question" className="form-label">
                  Question
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="question"
                  value={question}
                  onChange={(e) => handleChange(e, -1)}
                  required
                />
              </div>
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="mb-3">
                  <label htmlFor={`option-${index}`} className="form-label">
                    Option {index + 1}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id={`option-${index}`}
                    value={options[index]}
                    onChange={(e) => handleChange(e, index)}
                    required
                  />
                </div>
              ))}
              <div className="mb-3">
                <label htmlFor="correctAnswer" className="form-label">
                  Correct Answer
                </label>
                <select
                  className="form-select"
                  aria-label="Default select example"
                  value={correctAnswer}
                  onChange={(e) => handleChange(e, 4)}
                  required
                >
                  <option value="">Select Correct Answer</option>
                  <option value="option1">Option 1</option>
                  <option value="option2">Option 2</option>
                  <option value="option3">Option 3</option>
                  <option value="option4">Option 4</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateQuizPage;
