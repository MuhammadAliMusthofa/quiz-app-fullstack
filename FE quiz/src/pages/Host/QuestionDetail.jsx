import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box, Button, Snackbar  } from '@mui/material';
import { DeleteOutline, Edit } from '@mui/icons-material'; // Import icons
import api from '../../config/Api';

const DetailQuestionPage = () => {
    const { quizId, questionId } = useParams();
    const [questionData, setQuestionData] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const navigate = useNavigate();
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
        option1,
        option2,
        option3,
        option4,
        correct_answer,
        questionImage,
        option1_image,
        option2_image,
        option3_image,
        option4_image
    } = questionData;

    const defaultImage = "/public/assets/img-nf.png";

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
        <Box className="p-5">
            <Button variant="contained" className='me-3' startIcon={<Edit />}>Edit</Button>
            <Button variant="contained" color="error"  startIcon={<DeleteOutline />} onClick={handleDelete}>Delete</Button>
            <Card className="card-read-quiz text-dark shadow" sx={{ minHeight: '664px', maxHeight: '664px' }}>
                <CardContent>
                    <Typography
                        textAlign="center"
                        variant="h5"
                        sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                        }}
                    >
                        Question: {question_text}
                    </Typography>
                    <CardMedia
                        className="border mt-3 rounded p-2"
                        component="img"
                        image={questionImage ? `http://localhost:4001/image/${questionImage}` : defaultImage}
                        alt="Question image"
                        sx={{ height: 140, my: 2, borderRadius: '8px', maxWidth: '100%' }}
                    />
                    <div className="d-flex flex-wrap justify-content-around">
                        {[{ text: option1, image: option1_image }, { text: option2, image: option2_image }, { text: option3, image: option3_image }, { text: option4, image: option4_image }].map((option, idx) => (
                            <div
                                className="border bg-body-secondary mt-3 rounded p-2"
                                style={{
                                    height: 'auto',
                                    width: '250px',
                                    maxWidth: '100%',
                                    boxSizing: 'border-box',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                key={idx}
                            >
                                <Typography
                                    variant="h6"
                                    textAlign="center"
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '100%',
                                    }}
                                >
                                    {`Option ${idx + 1}`}: {option.text}
                                </Typography>
                                <CardMedia
                                    className="img-fluid"
                                    component="img"
                                    image={option.image ? `http://localhost:4001/image/${option.image}` : defaultImage}
                                    alt={`Option ${idx + 1} image`}
                                    sx={{ height: 100, mt: 1, width: '100%', objectFit: 'contain' }}
                                />
                            </div>
                        ))}
                    </div>
                    <Typography
                        variant="h5"
                        mt={5}
                        textAlign="center"
                        sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                        }}
                    >
                        Correct Answer: {questionData[correct_answer]}
                    </Typography>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message="Question deleted successfully"
            />
        </Box>
    );
};


export default DetailQuestionPage;
