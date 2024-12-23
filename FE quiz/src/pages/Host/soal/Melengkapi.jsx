import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Box, Grid, MenuItem, Select, InputLabel, FormControl, Snackbar, Button, Typography } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Edit, Save } from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';
import api from '../../../config/Api';


const EditQuestionPage = () => {
    const { quizId, questionId } = useParams();
    const [questionData, setQuestionData] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const [previewImage, setPreviewImage] = useState(null);
    const [originalOptionImages, setOriginalOptionImages] = useState([null, null, null, null]);
    const [newOptionImages, setNewOptionImages] = useState([null, null, null, null]);
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');


    const handleCorrectAnswerChange = (event) => {
        setCorrectAnswer(event.target.value);
    };


    useEffect(() => {
        async function fetchQuizData() {
          const response = await fetch(`${api}/question-list/${quizId}`);
          if (response.ok) {
            const data = await response.json();
            setQuestions(data.data);
          } else {
            console.error("Failed to fetch quiz questions:", response.statusText);
          }
        }
        const intervalId = setInterval(fetchQuizData, 1000);
    
        return () => clearInterval(intervalId);
      }, [quizId]);

 
    useEffect(() => {
        return () => {
            // Cleanup object URLs when the component unmounts
            newOptionImages.forEach(image => {
                if (image) {
                    URL.revokeObjectURL(image);
                }
            });
        };
        

    }, [newOptionImages]);




    const defaultImage = "/public/assets/img-nf.png";

    const handleDivClick = () => {
        fileInputRef.current.click();
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (file && validTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

  
  

    const handleSubmit = async () => {
      const formData = new FormData();
      formData.append('question', questionData.question_text); // Ensure you're sending the correct part of questionData
  
      formData.append('correct_answer', correctAnswer); // Use selectedOption to set correct_answer
  
      
  
      try {
          const response = await fetch(`${api}/createQuest/melengkapi/${quizId}`, {
              method: 'POST',
              body: formData,
          });
  
          if (response.ok) {
              const result = await response.json();
              setSnackbarOpen(true);
              setQuestionData(result.data);
  
              setTimeout(() => {
                  navigate(`/quiz/detail/${quizId}`);
              }, 500);
          } else {
              console.error('Failed to update question:', response.statusText);
          }
      } catch (error) {
          console.error('Error updating question:', error);
      }
  };

    const handleSoalChange = (e) => {
        setQuestionData({ question_text: e.target.value });
    };

    const tipeSoal = ['Pilihan Ganda', 'True Or False', 'Melengkapi', 'Drag And Drop'];

    return (
        <div className='bg-edit-question d-flex justify-content-center ' sx={{ textAlign: 'center', mt: 5 }}>
            <div className='col-md-10 '>
              
                   


                        {/* <Button variant="contained" sx={{height:'50px'}} className='ms-3 mb-3' startIcon={<Save />} onClick={handleSubmit}>
                            Simpan
                        </Button> */}
                <Box sx={{ p: 5, backgroundColor: 'none' }}>
                    <h3>Masukkan Soal</h3>
                    <TextField
                        id="question-input"
                        name="question"
                        placeholder="       Masukan Soal       "
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        onChange={handleSoalChange}
                        className="shadow"
                        sx={{
                            backgroundColor: '#fff',
                            borderRadius: '10px',
                            '& .MuiInputBase-input': {
                                textAlign: 'center',
                                fontSize: '25px',
                                minHeight: '200px', // Atur tinggi input TextField sesuai kebutuhan
                                maxHeight: '500px',
                                padding: '16px' // Tambahkan padding untuk memberi ruang pada input
                            },
                            height: 'auto' // Biarkan tinggi kotak pembungkus menyesuaikan
                        }}
                    />

                  
                  
                </Box>
                <Box sx={{ p: 5, backgroundColor: 'none' }}>
                    <h3>Masukkan Jawaban</h3>
                    <TextField
                        id="Answer-input"
                        name="answer"
                        placeholder="       Masukan Jawaban       "
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        onChange={handleCorrectAnswerChange}
                        className="shadow"
                        sx={{
                            backgroundColor: '#fff',
                            borderRadius: '5px',
                            '& .MuiInputBase-input': {
                                textAlign: 'center',
                                fontSize: '25px'
                            }
                        }}
                    />

                  
                  
                {/* <Button  variant="" fullWidth sx={{height:'50px',width:'100%', backgroundColor:'#a359c4', color:'#fff', boxShadow: '0px 0px 5px 2px rgba(255,255,255,0.4)',WebkitBoxShadow: '0px 0px 5px 2px rgba(255,255,255,0.4)',MozBoxShadow: '0px 0px 5px 2px rgba(255,255,255,0.4)',}} className='mb-3 mt-4 ' startIcon={<Save />} onClick={handleSubmit} >
                            Simpan
                    </Button> */}
                <button class="btn-55 mt-4" ><span>Simpan</span></button>
                </Box>
            </div>
            <Snackbar
              open={snackbarOpen} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleSnackbarClose}
            >
                <MuiAlert elevation={6} variant="filled" severity="success" onClose={handleSnackbarClose}>
                Update berhasil
        </MuiAlert>
        </Snackbar>
        </div>
    );
};

export default EditQuestionPage;
