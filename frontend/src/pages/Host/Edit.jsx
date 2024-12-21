import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TextField, Box, Grid, MenuItem, Select, InputLabel, FormControl, Snackbar, Button, Typography } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Edit, Save, DeleteOutline } from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';
import EditMelengkapi from './soal/EditMelengkapi';
import EditPilgan from './soal/EditPilgan';
import EditTof from './soal/EditTof';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
// import Api from '/config/Api'
import api from '../../config/Api';


const EditQuestionPage = () => {
    const { quizId, questionId } = useParams();
    const [questionData, setQuestionData] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    // const [questionData, setQuestionData] = useState("");
    
    const navigate = useNavigate();
    

    // const baseUrlll = Api.baseUrl;

    useEffect(() => {
        const fetchQuestionDetail = async () => {
            try {
                const response = await fetch(`${api}/detailquestion/${quizId}/${questionId}`);
                if (response.ok) {
                    const data = await response.json();
                    setQuestionData(data.data);
                  
                } else {
                    console.error('Failed to fetch question detail:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching question detail:', error);
            }
        };

        fetchQuestionDetail();
    }, [quizId, questionId]);



    if (!questionData) {
        return <Typography>Loading...</Typography>;
    }

    const {
        question_text,
        correct_answer,
        questionImage,
        question_type
    } = questionData;

    const handleDelete = async () => {
        try {
            const response = await fetch(`${api}/delete-question/${quizId}/${questionId}`, {
                method: 'DELETE'
            });
  
            if (response.ok) {
                const data = await response.json();
                console.log(data.message); // Output success message
                setSnackbarOpen(true); // Show Snackbar after successful deletion
                // Navigate to quiz detail page after 2 seconds
                setTimeout(() => {
                    navigate(`/quiz/detail/${quizId}`);
                }, 2000);
            } else {
                console.error('Failed to delete question:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };

    return (
        <div className='bg-edit-question d-flex justify-content-center ' sx={{ textAlign: 'center', mt: 5 }}>
            <div className='col-md-10 '>
                <Box fullWidth sx={{ p: 5,   backgroundImage: "linear-gradient(to right top, #b91fff, #a633da, #923eb7, #7d4395, #684674, #674772, #674971, #664a6f, #7b4b8b, #8f4ba8, #a349c6, #b845e5)",  mt: 3, borderRadius: '8px', color:'#fff', boxShadow: '0px 0px 5px 2px rgba(255,255,255,0.4)',WebkitBoxShadow: '0px 0px 5px 2px rgba(255,255,255,0.4)',MozBoxShadow: '0px 0px 5px 2px rgba(255,255,255,0.4)', }}>
                    <h1>{questionData.quiz_title} - Nomor {questionData.question_number}</h1>
                    
                </Box>
                <Box sx={{mt:5}}>
                    <Link to={`/quiz/detail/${quizId}`} className="p-2 bg-warning text-light rounded me-4 shadow">
                            {/* <div>
                            </div> */}
                            <KeyboardBackspaceIcon sx={{fontSize:'2em'}}/>
                     </Link>
                    <Button variant="contained" color="error"  startIcon={<DeleteOutline />} onClick={handleDelete}>Delete</Button>

                </Box>
                <Snackbar
                    open={snackbarOpen} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <MuiAlert elevation={6} variant="filled" severity="success" >
                        Soal dihapus
                </MuiAlert>
                </Snackbar>

                <div>
                  {
                    questionData.question_type === "pilihan_ganda" ? (
                      <EditPilgan/>
                    ) : questionData.question_type === "tof" ? (
                      <EditTof/>
                    ) : (
                      <EditMelengkapi/>
                    )
                  }
                </div>
                
            </div>
           
        </div>
    );
};

export default EditQuestionPage;