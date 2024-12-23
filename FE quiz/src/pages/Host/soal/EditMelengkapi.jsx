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

    useEffect(() => {
        if (questionData) {
            setCorrectAnswer(questionData.correct_answer);
        }
    }, [questionData]);


    const handleCorrectAnswerChange = (event) => {
        setQuestionData({
            ...questionData,
            correct_answer: event.target.value
        });
    };

    // api menarik data detail 
    useEffect(() => {
        const fetchQuestionDetail = async () => {
            try {
                const response = await fetch(`${api}/detailquestion/${quizId}/${questionId}`);
                if (response.ok) {
                    const data = await response.json();
                    setQuestionData(data.data);
                    console.log(questionData)
                    
                } else {
                    console.error('Failed to fetch question detail:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching question detail:', error);
            }
        };

        fetchQuestionDetail();
    }, [quizId, questionId]);



    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };



    // const {
    //     question_text,
    //     correct_answer,
    //     questionImage
    // } = questionData;
    const handleSoalChange = (e) => {
        setQuestionData({...questionData, question_text: e.target.value });
    };

    const handleSubmit = async () => {
      const formData = new FormData();
      formData.append('question', questionData.question_text); // Ensure you're sending the correct part of questionData
  
      formData.append('correct_answer', correctAnswer); // Use selectedOption to set correct_answer
  
      
  
      try {
          const response = await fetch(`${api}/updateQuest/melengkapi/${questionId}`, {
              method: 'PUT',
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
                        placeholder="Masukan Soal"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={questionData?.question_text}
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
                        value={questionData?.correct_answer}

                        margin="normal"
                        onChange={handleCorrectAnswerChange}
                        className="shadow"
                        sx={{
                            backgroundColor: '#fff',
                            borderRadius: '10px',
                            '& .MuiInputBase-input': {
                                textAlign: 'center',
                                fontSize: '25px'
                            }
                        }}
                    />

                  
                  
                {/* <Button  variant="" fullWidth sx={{height:'50px',width:'100%', backgroundColor:'#a359c4', color:'#fff', boxShadow: '0px 0px 5px 2px rgba(255,255,255,0.4)',WebkitBoxShadow: '0px 0px 5px 2px rgba(255,255,255,0.4)',MozBoxShadow: '0px 0px 5px 2px rgba(255,255,255,0.4)',}} className='mb-3 mt-4 ' startIcon={<Save />} onClick={handleSubmit} >
                            Simpan
                    </Button> */}
                <button class="btn-55 mt-4" onClick={handleSubmit}><span>Simpan</span></button>
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
