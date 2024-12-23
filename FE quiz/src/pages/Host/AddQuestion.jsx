import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Snackbar, Typography } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Pilgan from './soal/PilihanGanda';
import ToF from './soal/TrueOrFalse';
import Melengkapi from './soal/Melengkapi';
import DragAndDropQuestion from './soal/DND';

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreateIcon from '@mui/icons-material/Create';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Tab, Tabs } from '@mui/material';
import api from '../../config/Api';


const EditQuestionPage = () => {
    const { quizId } = useParams();
    const [title, setTitle] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const navigate = useNavigate();
    const [tipeSoal, setTipeSoal] = useState('Pilihan Ganda'); // State untuk menyimpan tipe soal yang dipilih

    const handleTypeSoalChange = (event, newValue) => {
        setTipeSoal(newValue);
    };

    useEffect(() => {
        async function fetchQuizData() {
            try {
                const response = await fetch(`${api}/question-list/${quizId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch quiz questions");
                }
                const data = await response.json();
                setTitle(data.data.title);
            } catch (error) {
                console.error("Error fetching quiz questions:", error);
            }
        }
        const intervalId = setInterval(fetchQuizData, 1000);

        return () => clearInterval(intervalId);
    }, [quizId]);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <div className='bg-edit-question d-flex justify-content-center ' style={{ textAlign: 'center', marginTop: '5px' }}>
            <div className='col-md-10 '>
                <Box fullWidth style={{
                    padding: '15px',
                    backgroundColor: '#a359c4',
                    marginTop: '15px',
                    borderRadius: '8px',
                    color: '#fff',
                    boxShadow: '0px 0px 5px 2px rgba(255,255,255,0.4)'
                }} className="border ">
                    <Typography variant="h4">Pertanyaan Baru - {title}</Typography>
                </Box>

                {/* Pilih Type Soal */}
                <Box style={{ marginRight: '15px', marginTop: '15px' }}>
                    <div className="d-flex border-bottom mb-2">
                            <h3 className='mt-2' >Pilih Tipe Soal</h3>
                            <img className='ms-2' src="/public/assets/tipe soal.png" alt="" srcset="" width={50} />

                    </div>
                    <Tabs
                        value={tipeSoal}
                        onChange={handleTypeSoalChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="scrollable auto tabs example"
                    >
                        {[
                            { label: 'Pilihan Ganda', icon: <FormatListBulletedIcon /> },
                            { label: 'True Or False', icon: <CheckCircleIcon /> },
                            { label: 'Melengkapi', icon: <CreateIcon /> },
                            { label: 'TTS', icon: <DragIndicatorIcon /> }
                        ].map((option, index) => (
                            <Tab key={index} label={option.label} icon={option.icon} value={option.label} />
                        ))}
                    </Tabs>
                </Box>

                {/* Conditional Rendering */}
                {tipeSoal === 'Pilihan Ganda' && <Pilgan />}
                {tipeSoal === 'True Or False' && <ToF />}
                {tipeSoal === 'Melengkapi' && <Melengkapi />}
                {tipeSoal === 'TTS' && <DragAndDropQuestion />}

                {/* <Button variant="contained" style={{ height: '50px' }} className='ms-3 mb-3' startIcon={<Save />} onClick={handleSubmit}>
                    Simpan
                </Button> */}

            </div>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                onClose={handleSnackbarClose}
            >
                <MuiAlert elevation={6} variant="filled" severity="success" onClose={handleSnackbarClose}>
                    Update berhasil
                </MuiAlert>
            </Snackbar>
        </div>
    );
};

export default EditQuestionPage;
