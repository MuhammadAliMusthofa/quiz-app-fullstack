import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, TextField, Modal, Box, FormControl, InputLabel, Select, MenuItem, Typography, Grid, CardContent, Card, CardMedia } from '@mui/material';

function CreateQuizPage() {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [quizName, setQuizName] = useState("");

  useEffect(() => {
    async function fetchQuizData() {
      const response = await fetch(`http://192.168.40.36:4001/api/question-list/${quizId}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.data);
      } else {
        console.error("Failed to fetch quiz questions:", response.statusText);
      }
    }
    const intervalId = setInterval(fetchQuizData, 1000);

    // Bersihkan interval saat komponen di-unmount atau gameCode berubah
    return () => clearInterval(intervalId);
  }, [quizId]);

  useEffect(() => {
    const fetchQuizName = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const response = await fetch(`http://192.168.40.36:4001/api/quiz/${userId}`);
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
    const formData = new FormData();
    formData.append('question', question);
    formData.append('option1', options[0]);
    formData.append('option2', options[1]);
    formData.append('option3', options[2]);
    formData.append('option4', options[3]);
    formData.append('correctAnswer', correctAnswer);
  
    const inputIds = ['questionImage', 'option1Image', 'option2Image', 'option3Image', 'option4Image'];
    inputIds.forEach(id => {
      const inputFile = document.getElementById(id);
      if (inputFile && inputFile.files.length > 0) {
        formData.append(id, inputFile.files[0]);
      } else {
        console.error(`Failed to find file input or no files selected for: ${id}`);
      }
    });
  
    try {
      const response = await fetch(`http://192.168.40.36:4001/api/createDataQuiz/${quizId}`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        alert("Question added successfully!");
        setModalOpen(false);
        setQuestion("");
        setOptions(["", "", "", ""]);
        setCorrectAnswer("");
        // Optionally refresh the question list
      } else {
        console.error("Failed to add question:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };
  

  return (
    <div className="admin-quiz">
      <div className=" p-5">
      <Typography variant="h4" className="title-quiz mb-2 rounded">Nama Quiz: {quizName}</Typography>
      <Button variant="contained" className="mb-3 button-add-quiz"  onClick={() => setModalOpen(true)}>Add Question</Button>
      <Grid container spacing={2} >
        {questions.map((question, index) => (
          <Grid item xs={12} md={6} key={question.question_id} >
            <Card className="card-read-quiz text-light"  >
              <CardContent >
                <Typography textAlign={"center"} variant="h5">Question {index + 1}: {question.question_text}</Typography>
                {question.questionImage && (
                  <CardMedia 
                    component="img"
                    image={`http://192.168.40.36:4001/image/${question.questionImage}`} // Adjust the path as needed
                    alt="Question image"
                    sx={{ height: 140, my: 2, borderRadius:'8px' }}
                  />
                )}
                <div className="d-flex flex-wrap justify-content-around">
                  {['option1', 'option2', 'option3', 'option4'].map((option, idx) => (
                    <div className="border mt-3 rounded p-2 " style={{height:'100px', width:'250px'}} key={idx}>
                     <Typography  variant="h5"> {`Option ${ idx + 1}`}: {question[option]}</Typography>
                      {question[`${option}_image`] && (
                        <CardMedia 
                        className="img-fluid"
                          component="img"
                          image={`http://192.168.40.36:4001/image/${question[`${option}_image`]}`} // Adjust the path as needed
                          alt={`Option ${idx + 1} image`}
                          sx={{ height: 100, mt: 1, width:250 }}
                        />
                      )}
                    </div>
                  ))}
                </div>
               
                <Typography variant="h5" mt={5} className="text-center">Correct Answer: {question[question.correct_answer]}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography id="modal-title" variant="h6" component="h2">Add Question</Typography>
          <form onSubmit={handleSubmit}>
            
            <TextField fullWidth label="Question" variant="outlined" value={question} onChange={(e) => handleChange(e, -1)} required margin="normal" />
            <input type="file" id="questionImage" style={{ display: 'block', marginBottom: 8 }} />
            
            {options.map((option, index) => (
              <Box key={index}>
                <TextField fullWidth label={`Option ${index + 1}`} variant="outlined" value={option} onChange={(e) => handleChange(e, index)} required margin="normal" />
                <input type="file" id={`option${index + 1}Image`} style={{ display: 'block', marginBottom: 8 }} />
              </Box>
            ))}
            <FormControl fullWidth margin="normal">
              <InputLabel id="correct-answer-label">Correct Answer</InputLabel>
              <Select labelId="correct-answer-label" id="correctAnswer" value={correctAnswer} onChange={(e) => handleChange(e, 4)} required>
                <MenuItem value="option1">Option 1</MenuItem>
                <MenuItem value="option2">Option 2</MenuItem>
                <MenuItem value="option3">Option 3</MenuItem>
                <MenuItem value="option4">Option 4</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" color="primary">Submit</Button>
          </form>
        </Box>
      </Modal>
      </div>
     
    </div>
  );
}

export default CreateQuizPage;
