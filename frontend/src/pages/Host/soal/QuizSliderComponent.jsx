import React, { useState } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import TableViewIcon from '@mui/icons-material/TableView';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// slider component
const QuizSlider = ({ quizzes }) => {
  const [viewMode, setViewMode] = useState('slider'); // state to manage view mode
  const [currentPage, setCurrentPage] = useState(1); // state to manage current page for pagination
  const rowsPerPage = 5; // number of rows per page

  const settings = {
    dots: false, // Set dots to false to hide the dot indicators
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: false // Set dots to false to hide the dot indicators
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: false // Set dots to false to hide the dot indicators
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false // Set dots to false to hide the dot indicators
        }
      }
    ]
  };

  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'slider' ? 'table' : 'slider');
  };

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, Math.ceil(quizzes.length / rowsPerPage)));
  };

  // Calculate the quizzes to be displayed on the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentQuizzes = quizzes.slice(startIndex, endIndex);

  return (
    <div className="mt-5">
      <div className="d-flex justify-content-end mb-3 p-2">
        <button onClick={toggleViewMode} className="btn btn-secondary" style={{ color:'white'}}>
          {viewMode === 'slider' ? <TableViewIcon /> : <ViewCarouselIcon />}
        </button>
      </div>
      
      {viewMode === 'slider' ? (
        <Slider {...settings}>
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="p-2">
              <Link className="text-decoration-none" to={`/quiz/detail/${quiz.id}`}>
                <div className="quiz-list-itemm p-2">
                  <div className="d-flex justify-content-center align-items-center flex-column">
                    <img
                      src={`/public/assets/quiz-icon/${quiz.quiz_icon}`}
                      alt={`Icon ${quiz.quiz_icon}`}
                      className="icon-image"
                    />
                    <p className="quiz-title text-light">{quiz.title}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      ) : (
        <div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Title</th>
              </tr>
            </thead>
            <tbody>
              {currentQuizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td>
                    <img
                      src={`/public/assets/quiz-icon/${quiz.quiz_icon}`}
                      alt={`Icon ${quiz.quiz_icon}`}
                      className="icon-image"
                    />
                  </td>
                  <td >
                  <Link to={`/quiz/detail/${quiz.id}`} style={{textDecoration:'none', color:'purple'}}>
                         {quiz.title}
                  </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-between">
            <button onClick={handlePreviousPage} disabled={currentPage === 1} className="btn btn-secondary">
              <ArrowBackIcon />
            </button>
            <span>Page {currentPage} of {Math.ceil(quizzes.length / rowsPerPage)}</span>
            <button onClick={handleNextPage} disabled={currentPage === Math.ceil(quizzes.length / rowsPerPage)} className="btn btn-secondary">
              <ArrowForwardIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizSlider;