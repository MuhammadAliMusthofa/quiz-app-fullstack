import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, IconButton, Typography, Container, Modal, Box, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const response = await fetch(`http://192.168.40.36:4001/api/quiz/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.data);
      } else {
        console.error("Failed to fetch quizzes:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSelectChange = (e) => {
    setSelectedQuiz(e.target.value);
  };

  const handleStartGame = async () => {
    const userId = sessionStorage.getItem("userId");
    const response = await fetch(`http://192.168.40.36:4001/api/startgame/${selectedQuiz}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId })
    });
    if (response.ok) {
      const data = await response.json();
      navigate(`/lobby/host/${data.game_id}`);
    } else {
      console.error("Failed to start game:", response.statusText);
    }
  };

  const handleSubmitCreateQuiz = async () => {
    const userId = sessionStorage.getItem("userId");
    const response = await fetch(`http://192.168.40.36:4001/api/quiz/add/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title: quizTitle })
    });
    if (response.ok) {
      setModalVisible(false);
      fetchQuizzes();
    } else {
      console.error("Failed to create quiz:", response.statusText);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    navigate('/');
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid grey',
    boxShadow: 24,
    p: 4,
    borderRadius:'8px'
  };

  return (
    <div className="quiz-bg">
      <AppBar position="static">
        <Toolbar>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Quiz 
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container>
          <Typography variant="h3" component="div" sx={{ flexGrow: 1, mt:3 }}>
            Quiz List
          </Typography>

        <Button variant="contained" color="success" sx={{ mt: 3 }} onClick={() => setModalVisible(true)}>Create Quiz</Button>
        <ul className="list-group mt-3">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="list-group-item">
              <Link className="text-decoration-none" to={`/quiz/detail/${quiz.id}`}>{quiz.title}</Link>
            </li>
          ))}
        </ul>

          <Box sx={{mt:3, background: 'rgba(0, 0, 0, 0.5) !important', backdropFilter: 'blur(8px)',color:' #fff'}} className=" p-2 rounded card-play-quiz">
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, mt:3 }}>
            Bermain
          </Typography>
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel sx={{color:'white'}} id="select-quiz-label">Select Quiz Game</InputLabel>
              <Select
                labelId="select-quiz-label"
                value={selectedQuiz}
                label="Select Quiz Game"
                onChange={handleSelectChange}
              >
                {quizzes.map((quiz) => (
                  <MenuItem key={quiz.id} value={quiz.id}>{quiz.title}</MenuItem>
                ))}
              </Select>
              <Button variant="contained" sx={{ mt: 3, mb:3 }} onClick={handleStartGame}>Start Game</Button>
            </FormControl>

          </Box>
      </Container>

      <Modal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Create Quiz
          </Typography>
          <TextField
            fullWidth
            label="Quiz Title"
            id="quizTitle"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmitCreateQuiz}>Create</Button>
        </Box>
      </Modal>
    </div>
  );
}

export default QuizListPage;
