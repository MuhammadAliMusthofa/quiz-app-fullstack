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
        setCorrectAnswer(event.target.value);
    };


    

 
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

    const handleEditClick = () => {
        setIsEditing(true);
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

  
    const handleOptionImageChange = (e, index) => {
        const file = e.target.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
        if (file && validTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onloadend = () => {
                let tempNewOptionImages = [...newOptionImages];
                tempNewOptionImages[index] = reader.result;
                setNewOptionImages(tempNewOptionImages);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('question', questionData.question); // Ensure you're sending the correct part of questionData
        formData.append('option1', options[0]);
        formData.append('option2', options[1]);
        formData.append('option3', options[2]);
        formData.append('option4', options[3]);
        formData.append('correctAnswer', correctAnswer);
        
        if (fileInputRef.current.files[0]) {
            formData.append('questionImage', fileInputRef.current.files[0]);
        }
    
        newOptionImages.forEach((img, index) => {
            if (img && !(img instanceof File)) {
                const file = dataURLtoFile(img, `option${index + 1}.png`);
                formData.append(`option${index + 1}Image`, file);
            } else if (img instanceof File) {
                formData.append(`option${index + 1}Image`, img);
            }
        });
    
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
    
        try {
            const response = await fetch(`${api}/createDataQuiz/${quizId}`, {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                const result = await response.json();
                setSnackbarOpen(true);
                setIsEditing(false);
                setQuestionData(result.data);
                setNewOptionImages([
                    result.data.option1_image,
                    result.data.option2_image,
                    result.data.option3_image,
                    result.data.option4_image
                ]);
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
    
    
    function dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }

    const handleOptionChange = (e, index) => {
        let tempOptions = [...options];
        tempOptions[index] = e.target.value;
        setOptions(tempOptions);
    };

    const handleSoalChange = (e) => {
        setQuestionData({ ...questionData, [e.target.name]: e.target.value });
      };

    const tipeSoal = ['Pilihan Ganda', 'True Or False', 'Melengkapi', 'Drag And Drop'];

    

    return (
        <div className='bg-edit-question d-flex justify-content-center ' sx={{ textAlign: 'center', mt: 5 }}>
            <div className='col-md-10 '>
                        
                <Box sx={{ p: 5, backgroundColor: 'none' }}>
                    {/* <h4>Masukkan Soal</h4> */}
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

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
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
                                src={previewImage || defaultImage} 
                                // src={previewImage} 
                                alt="Insert Media"
                                width="300"
                                height="250"
                                // className="ms-2"
                                
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
                    <Grid container spacing={2} sx={{ mt: 5 }}>
                        {['primary', 'warning', 'success', 'error'].map((color, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Box
                                className="shadow"
                                    sx={{
                                        backgroundColor: '#fff',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        height: 100,
                                        p: 2,
                                        borderRadius:'8px'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            backgroundColor: `${color}.main`,
                                            height: '80px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 2,
                                            borderRadius: 3,
                                            // mt:2
                                        }}
                                    >
                                      <img
                                        src={ newOptionImages[index] || originalOptionImages[index] || defaultImage} // prioritize newOptionImages, fallback to originalOptionImages or defaultImage
                                        alt={`Option ${index + 1}`}
                                        width="50"
                                        />
                                    </Box>
                                    <TextField
                                        placeholder="Isi Jawaban"
                                        fullWidth
                                        name={`option${index + 1}`}
                                        label={`Option ${index + 1}`}
                                        variant="outlined"
                                        sx={{ mx: 2 }}
                                        value={options[index]}
                                        onChange={(e) => handleOptionChange(e, index)}
                                     
                                    />
                                    <label htmlFor={`option-file-${index}`}>
                                        <AddPhotoAlternateIcon sx={{ fontSize: 30, cursor: 'pointer', color:'grey' }} />
                                        <input
                                            type="file"
                                            name={`option${index + 1}Image`}
                                            id={`option-file-${index}`}
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleOptionImageChange(e, index)}
                                        />
                                    </label>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Jawaban Benar */}
                    <Box sx={{ mt: 5 }}>
                        <h4>Pilih Jawaban Benar</h4>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="select-label">Option</InputLabel>
                            <Select
                                labelId="select-label"
                                id="select-correct-answer"
                                label="Option"
                                onChange={handleCorrectAnswerChange}
                                sx={{
                                    backgroundColor: '#fff',
                                    borderRadius: '5px',
                                    
                                }}
                            >
                                {['option1', 'option2', 'option3', 'option4'].map((option, index) => (
                                    <MenuItem key={index} value={option} 
                                    
                                    >
                                        {`Option ${index + 1}`}
                                    </MenuItem>
                                ))}
                            </Select>
                            <button class="btn-55 mt-4" onClick={handleSubmit}><span>Simpan</span></button>
                        </FormControl>
                    </Box>
                </Box>
            </div>
            <Snackbar
              open={snackbarOpen} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleSnackbarClose}
            >
                <MuiAlert elevation={6} variant="filled" severity="success" onClose={handleSnackbarClose}>
                 Soal Baru Berhasil Ditambahkan
        </MuiAlert>
        </Snackbar>
        </div>
    );
};

export default EditQuestionPage;
