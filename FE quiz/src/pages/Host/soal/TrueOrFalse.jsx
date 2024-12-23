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
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const [previewImage, setPreviewImage] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    useEffect(() => {
        if (questionData) {
            setCorrectAnswer(questionData.correct_answer);
        }
    }, [questionData]);

  


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


    const handleSoalChange = (e) => {
        setQuestionData({ question_text: e.target.value });
    };

    const tipeSoal = ['Pilihan Ganda', 'True Or False', 'Melengkapi', 'Drag And Drop'];

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('question', questionData.question_text); // Ensure you're sending the correct part of questionData
    
        formData.append('correct_answer', selectedOption); // Use selectedOption to set correct_answer
    
        if (fileInputRef.current.files[0]) {
            formData.append('questionImage', fileInputRef.current.files[0]);
        }
        console.log()
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
    
        try {
            console.log(formData)
            const response = await fetch(`${api}/createDataQuizTof/${quizId}`, {
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

    return (
        <div className='bg-edit-question d-flex justify-content-center ' sx={{ textAlign: 'center', mt: 5 }}>
            <div className='col-md-10 '>       
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
                            borderRadius: '5px',
                            '& .MuiInputBase-input': {
                                textAlign: 'center',
                                fontSize: '25px'
                            }
                        }}
                    />

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
                        <Box
                            className="shadow"
                            sx={{
                                width: 300,
                                height: 250,
                                backgroundColor: 'grey.200',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                borderRadius:'20px'
                            }}
                            onClick={handleDivClick}
                        >
                            <img
                            style={{borderRadius:'20px'}}
                                src={previewImage || defaultImage} // Gunakan defaultImage jika previewImage kosong
                                alt="Insert Media"
                                width="250"
                                height="200"
                                // className=" ms-2"
                            />
                        </Box>
                        <input
                            type="file"
                            name="questionImage"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </Box>

                    {/* Input Jawaban */}
                    <Grid container spacing={2} sx={{ mt: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <input 
                                type="radio" 
                                id="true" 
                                name="answer" 
                                value="true" 
                                style={{ display: 'none' }} 
                                checked={selectedOption === 'true'}
                                onChange={() => handleOptionChange('true')}
                            />
                            <label htmlFor="true" style={{ width: '100%', margin: '0 8px' }}>
                                <Box 
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'white',
                                        backgroundColor: '#FF63D1',
                                        width: '100%',
                                        height: 100,
                                        p: 2,
                                        borderRadius: '10px',
                                        boxShadow: selectedOption === 'true' ? '0px 0px 10px 10px rgba(255,193,231,0.75)' : '0px 0px 5px 6px rgba(255,193,231,0.65)',
                                        transition: 'box-shadow 0.3s ease-in-out',
                                        cursor: 'pointer',
                                        transform: selectedOption === 'true' ? 'scale(1.05)' : 'scale(1)',
                                    }}
                                >
                                    <img src={`/assets/option3.png`} alt="Description of the image" style={{ width: '80px', height: '80px' }} />
                                    <div className="ms-5" style={{ display: 'flex', justifyContent: 'center !important' }}>
                                        <h1 className="ms-5">TRUE</h1>
                                    </div>
                                </Box>
                            </label>

                            <input 
                                type="radio" 
                                id="false" 
                                name="answer" 
                                value="false" 
                                style={{ display: 'none' }} 
                                checked={selectedOption === 'false'}
                                onChange={() => handleOptionChange('false')}
                            />
                            <label htmlFor="false" style={{ width: '100%', margin: '0 8px' }}>
                                <Box 
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'white',
                                        backgroundColor: '#12E3EB',
                                        width: '100%',
                                        height: 100,
                                        p: 2,
                                        borderRadius: '10px',
                                        boxShadow: selectedOption === 'false' ? '0px 0px 10px 10px rgba(193,245,255,0.75)' : '0px 0px 5px 6px rgba(193,245,255,0.65)',
                                        transition: 'box-shadow 0.3s ease-in-out',
                                        cursor: 'pointer',
                                        transform: selectedOption === 'false' ? 'scale(1.05)' : 'scale(1)',
                                    }}
                                >
                                    <img src={`/assets/option4.png`} alt="Description of the image" style={{ width: '80px', height: '80px' }} />
                                    <div className="ms-5" style={{ display: 'flex', justifyContent: 'center !important' }}>
                                        <h1 className="ms-5">FALSE</h1>
                                    </div>
                                </Box>
                            </label>
                        </Grid>

                    </Grid>
                    <div className="d-flex justify-content-center">
                        <button class="btn-55 mt-4" onClick={handleSubmit} style={{width:'98%'}}><span>Simpan</span></button>

                    </div>
                </Box>
            </div>
            <Snackbar
              open={snackbarOpen} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleSnackbarClose}
            >
                <MuiAlert elevation={6} variant="filled" severity="success" onClose={handleSnackbarClose}>
                Soal berhasil ditambah
        </MuiAlert>
        </Snackbar>
        </div>
    );
};

export default EditQuestionPage;
