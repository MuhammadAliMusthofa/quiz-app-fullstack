import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Tabs, Tab,  Toolbar, Button, IconButton, Typography, Container, Modal, Box, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddBoxIcon from '@mui/icons-material/AddBox';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import QuizIcon from '@mui/icons-material/Quiz';
import HistoryIcon from '@mui/icons-material/History';
import History from './History';
import Category from './Category';
import QuizSlider from './soal/QuizSliderComponent';
import api from '../../config/Api';


function QuizListPage() {

 
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const navigate = useNavigate();
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedVideoTitle, setSelectedVideoTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tabmenu, setTabMenu] = useState('Quiz List');
  
  const handleTabChange = (event, newValue) => {
    setTabMenu(newValue);
};



  const fetchQuizzes = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const response = await fetch(`${api}/quiz/${userId}`);
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
    const response = await fetch(`${api}/startgame/${selectedQuiz}`, {
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
    const response = await fetch(`${api}/quiz/add/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title: quizTitle, quiz_icon: selectedIcon })
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

  const handleIconSelect = (icon) => {
    setSelectedIcon(icon);
  };
  
  const components = Array.from({ length: 8 }); // Misalnya kita punya 8 komponen

  const componentStyle = {
    flex: '0 0 23%',
    margin: '1%',
    padding: '20px',
    backgroundColor: 'lightgray',
    borderRadius: '5px'
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    height:600,
    bgcolor: 'background.paper',
    border: '2px solid grey',
    boxShadow: 24,
    p: 4,
    borderRadius:'8px'
  };

  const quizIcons = [
    'quiz-icon1.png',
    'quiz-icon2.png',
    'quiz-icon3.png',
    'quiz-icon4.png',
    'quiz-icon5.png',
    'quiz-icon6.png',
    'quiz-icon7.png',
    'quiz-icon8.png',
  ];

  const kategoriList = [
    'Menanam Padi',
    'Tutorial Mengetik Cepat',
    'Pelatihan Public Speaking',
    'Belajar bernyanyi',
    'Cara Menghitung Cepat',
    'Film Dokumenter',
    'Mengaji bersama',
    'Tips & Trik Ujian Nasional',
    'Seni Memahami materi',
    'Erklika video',
  ];
  const dummyVideoTitles = [
    'Menanam Padi',
    'Tutorial Mengetik Cepat',
    'Pelatihan Public Speaking',
    'Belajar bernyanyi',
    'Cara Menghitung Cepat',
    'Film Dokumenter',
    'Mengaji bersama',
    'Tips & Trik Ujian Nasional',
    'Seni Memahami materi',
    'Erklika video',
  ];
  

  return (
    <div className="quiz-bg">
      <AppBar  position="static" sx={{backgroundColor:'#6b1d72 '}}>
          <Toolbar sx={{}}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <img className="img-fluid " src="../public/assets/ErKuiz (5).png" alt="" style={{width:'150px'}} /> 
            </Typography>

            <Button color="error" variant="contained" onClick={handleLogout}>Logout</Button>
          </Toolbar>
      </AppBar>
      <Container >
           {/*tab menu  */}
          <div className="bg-bg-bg col-md-12 bg-light rounded-5  mt-5 shadow" style={{}}>
              <div className="p-4 d-flex justify-content-between">
                  <Tabs
                          value={tabmenu}
                          onChange={handleTabChange}
                          variant="scrollable"
                          scrollButtons="auto"
                          aria-label="scrollable auto tabs example"
                      >
                          {[
                              { label: 'Quiz List', icon: <QuizIcon /> },
                              { label: 'History', icon: <HistoryIcon /> },
                              
                          ].map((option, index) => (
                              <Tab key={index} label={option.label} icon={option.icon} value={option.label} />
                          ))}
                  </Tabs>

                  <Button variant="contained"  className="shadow " id="btn-create-quiz" sx={{ mt: 3,fontFamily:'Nunito, sans-serif !important'}}  onClick={() => setModalVisible(true)}><AddBoxIcon/><span className="ms-2">Create Quiz</span></Button>
              </div>


              <div className="p-4">
                    {/* Conditional Rendering */}
                  {tabmenu === 'Quiz List' && <QuizSlider quizzes={quizzes} />}
                  {tabmenu === 'History' && <History />}

              </div>
          </div>


          {/* category component */}
          <Category/>

        
                
          <Box sx={{mt:5, mb:3, backgroundImage: "linear-gradient(to right top, #d58bf7, #d7a4fc, #dcbaff, #e3d0ff, #ede5ff, #ede5ff, #ede6ff, #ede6ff, #e1d2ff, #d7beff, #cfa9ff, #c794ff)", }} className=" p-4 rounded-5 shadow " id="">
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, mt:3 , fontFamily:'Nunito, sans !important'}}>
            Bermain
          </Typography>
            <FormControl fullWidth sx={{ mt: 3 , fontFamily:'Nunito, sans !important'}}>
                  <InputLabel sx={{color:'black', fontFamily:'Nunito, sans !important'}} id="select-quiz-label">Select Quiz Game</InputLabel>
                  <Select
                    labelId="select-quiz-label"
                    value={selectedQuiz}
                    label="Select Quiz Game"
                    onChange={handleSelectChange}
                  >
                    {quizzes.map((quiz) => (
                      <MenuItem sx={{ fontFamily:'Nunito, sans !important'}} key={quiz.id} value={quiz.id}>{quiz.title}</MenuItem>
                    ))}
                  </Select>
                  <Button variant="contained" id="btn-start-quiz" sx={{ mt: 3, mb:3 , backgroundColor: '#5A1789', color: '#fff', fontFamily:'Nunito, sans !important'}} onClick={handleStartGame}>Start Game</Button>
            </FormControl>

          </Box>
      </Container>

      {/* logout */}
      <Modal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
           Anda Yakin Ingin Logout?
          </Typography>
          <Button color="error" variant="outlined" onClick={handleLogout}>Logout</Button>
          
        </Box>
      </Modal>

      {/* Modal Create */}
      <Modal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{fontFamily:'Nunito, sans !important'}}
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


          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="select-video-title-label">Kategori</InputLabel>
            <Select
              labelId="select-video-title-label"
              id="select-video-title"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {kategoriList.map((title, index) => (
                <MenuItem key={index} value={title}>
                  {title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="select-video-title-label">Select Video Title</InputLabel>
            <Select
              labelId="select-video-title-label"
              id="select-video-title"
              value={selectedVideoTitle}
              onChange={(e) => setSelectedVideoTitle(e.target.value)}
            >
              {dummyVideoTitles.map((title, index) => (
                <MenuItem key={index} value={title}>
                  {title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
            <h5 className="mt-3">Pilih Icon Quiz</h5>
          <div className="icon-selection border">
            {quizIcons.map((icon) => (
              <label key={icon} className={`icon-label ${selectedIcon === icon ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="quizIcon"
                  value={icon}
                  checked={selectedIcon === icon}
                  onChange={() => handleIconSelect(icon)}
                  className="icon-input"
                />
                <img src={`/assets/quiz-icon/${icon}`} alt={`Quiz Icon ${icon}`} className="icon-image" />
              </label>
            ))}
          </div>
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmitCreateQuiz}>Create</Button>
        </Box>
      </Modal>

    </div>
  );
}

export default QuizListPage;
