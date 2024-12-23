import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper} from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ScienceIcon from '@mui/icons-material/Science';
import MovieIcon from '@mui/icons-material/Movie';
import LanguageIcon from '@mui/icons-material/Language';
import HistoryIcon from '@mui/icons-material/History';
import ComputerIcon from '@mui/icons-material/Computer';
import PublicIcon from '@mui/icons-material/Public';
import api from '../../config/Api';


const categories = [
  { id: 1, name: 'Umum', icon: <QuizIcon style={{ fontSize: 30, color: '#845EC2' }} /> },
  { id: 2, name: 'Edukasi', icon: <SchoolIcon style={{ fontSize: 30, color: '#845EC2' }} /> },
  { id: 3, name: 'Olahraga', icon: <SportsSoccerIcon style={{ fontSize: 30, color: '#845EC2' }} /> },
  { id: 4, name: 'Musik', icon: <MusicNoteIcon style={{ fontSize: 30, color: '#845EC2' }} /> },
  { id: 5, name: 'Sains', icon: <ScienceIcon style={{ fontSize: 30, color: '#845EC2' }} /> },
  { id: 6, name: 'Film', icon: <MovieIcon style={{ fontSize: 30, color: '#845EC2' }} /> },
  { id: 7, name: 'Bahasa', icon: <LanguageIcon style={{ fontSize: 30, color: '#845EC2' }} /> },
  { id: 8, name: 'Geografi', icon: <PublicIcon style={{ fontSize: 30, color: '#845EC2' }} /> },
];

const StyledCategory = styled(Paper)(({ theme, active }) => ({
  backgroundColor: active ? '#330537' : 'rgba(255, 255, 255, 0.8)',
  color: active ? '#fff' : '#000',
  padding: '10px',
  borderRadius: '200px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
}));

const Categories = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [quizzes, setQuizzes] = useState([]);

  const fetchQuizzes = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const response = await fetch(`${api}/quiz/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.data);
        console.log(`ini kategori quiz: ${quizzes}`)
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

  const handleCategoryClick = (index) => {
    setActiveCategory(index);
  };

  const filteredQuizzes = activeCategory !== null 
    ? quizzes.filter(quiz => quiz.kategori_id === categories[activeCategory].id) 
    : [];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <div className=" rounded-5 mt-5 p-5 text-light" 
           style={{
             backgroundImage: 'linear-gradient(to top, #330537, #552458, #79427c, #9f62a2, #c684c9)',
             boxShadow: '0px 0px 5px 4px rgba(255,255,255,0.76)',
             WebkitBoxShadow: '0px 0px 5px 4px rgba(255,255,255,0.76)',
             MozBoxShadow: '0px 0px 5px 4px rgba(255,255,255,0.76)',
           }}
      >
        <h1 className="text-center mb-5" style={{ color: '#fff' }}>Kategori Quiz</h1>
        <Grid container spacing={3} justifyContent="center">
          {categories.map((category, index) => (
            <Grid item xs={6} sm={4} md={3} lg={2} xl={1} key={index}>
              <StyledCategory
                active={activeCategory === index}
                onClick={() => handleCategoryClick(index)}
              >
                <Box>{category.icon}</Box>
              </StyledCategory>
              <Typography variant="h6" style={{ fontSize: '0.6rem', textAlign: 'center' }}>
                {category.name}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </div>

      {/* Tampilkan Quiz disini */}
      <div className="rounded-5 mt-3 p-5 text-light"
           style={{
             backgroundImage: 'linear-gradient(to top, #330537, #552458, #79427c, #9f62a2, #c684c9)',
             backgroundSize: 'cover',
             backgroundBlendMode: 'overlay',
             boxShadow: '0px 0px 5px 4px rgba(255,255,255,0.76)',
             WebkitBoxShadow: '0px 0px 5px 4px rgba(255,255,255,0.76)',
             MozBoxShadow: '0px 0px 5px 4px rgba(255,255,255,0.76)',
           }}
      >
        <div className="col-md-12">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            {filteredQuizzes.length > 0 ? (
              filteredQuizzes.map((quiz, index) => (
                <Link className="text-decoration-none" to={`/quiz/detail/${quiz.id}`}>
                <div className='shadow' key={index} style={{
                  flex: '0 0 23%',
                  alignItems:'center',
                  margin: '1%',
                  padding: '10px',
                  backgroundImage: 'linear-gradient(to right top, #444343, #636363, #858484, #a8a7a8, #cccccc, #d3d3d3, #d9d9d9, #e0e0e0, #c9c9c9, #b3b3b3, #9d9d9d, #888888)',

                  // backgroundImage: 'url(/public/assets/card-category.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '5px',
                  minHeight:'100px',
                  maxHeight:'100px',
                  color:'#000'
                    }}>
                  <h2 className="text-center text-dark">{quiz.title}</h2>
                    </div>
                      
                </Link>

              ))
            ) : (
              <Typography variant="h6" style={{ color: '#fff' }}>
                Tidak ada quiz untuk kategori ini.
              </Typography>
            )}
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Categories;
