import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(""); // State untuk menyimpan quiz yang dipilih
  const [modalVisible, setModalVisible] = useState(false); // State untuk mengatur keterlihatan modal
  const [quizTitle, setQuizTitle] = useState(""); // State untuk menyimpan judul quiz
  const navigate = useNavigate(); // Gunakan useNavigate untuk navigasi antar halaman

  // Fungsi untuk mengambil daftar quiz dari API
  const fetchQuizzes = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const response = await fetch(`http://localhost:4001/api/quiz/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.data); // Menyimpan daftar quiz ke state quizzes
      } else {
        console.error("Failed to fetch quizzes:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  // Memanggil fungsi fetchQuizzes saat komponen dimuat
  useEffect(() => {
    fetchQuizzes();
  }, []); // Membuat efek hanya dijalankan sekali saat komponen dimuat

  // Fungsi untuk menangani perubahan pada form select
  const handleSelectChange = (e) => {
    setSelectedQuiz(e.target.value);
  };

  // Fungsi untuk menangani klik tombol "Start Game"
  const handleStartGame = async () => {
    try {
      const userId = sessionStorage.getItem("userId"); // Ambil admin_id dari sessionStorage
      const response = await fetch(`http://localhost:4001/api/startgame/${selectedQuiz}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId }) // Sertakan admin_id dalam body request
      });
      if (response.ok) {
        const data = await response.json();
        // Game berhasil dimulai, arahkan pengguna ke halaman lobby
        navigate(`/lobby/host/${data.game_id}`); // Navigasi ke halaman lobby dengan menyertakan data response
      } else {
        console.error("Failed to start game:", response.statusText);
      }
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  // Fungsi untuk menangani submit form create quiz
  const handleSubmitCreateQuiz = async () => {
    try {
      const userId = sessionStorage.getItem("userId"); // Ambil admin_id dari sessionStorage
      const response = await fetch(`http://localhost:4001/api/quiz/add/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: quizTitle }) // Sertakan judul quiz dalam body request
      });
      if (response.ok) {
        // Quiz berhasil dibuat, tutup modal dan perbarui daftar quiz
        setModalVisible(false);
        fetchQuizzes();
      } else {
        console.error("Failed to create quiz:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  const handleLogout = async () => {
           
      sessionStorage.removeItem('userId');  // Assuming the userId is stored with this key
      // Navigate to the home page
      navigate('/');
        
  };

  return (
    <div className="quiz-bg">
      <div style={{float:'right'}}> <button className="btn btn-danger mt-5 me-5" onClick={handleLogout}>Logout</button></div>
      <h1 className="my-4 ms-5">Quiz List</h1>
      <div className="col-md-2">
          <button className="btn btn-success ms-5" onClick={() => setModalVisible(true)}>Create Quiz</button>
        </div>
      <ul className="list-group mt-3 w-50 ms-5">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="list-group-item ">
            <Link className="text-decoration-none" to={`/quiz/detail/${quiz?.id}`}>{quiz?.title}</Link>
          </li>
        ))}
      </ul>

      <div className="row mt-3 m-5 pt-5 pb-5 ps-2 w-50 rounded " id="game-select">
        <div className="col-md-8 ">
          <h5 className=" text-light mb-3 ">Mainkan Game Quiz</h5>
          <select className="form-select " onChange={handleSelectChange} value={selectedQuiz}>
            <option value="">Select Quiz Game</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
            ))}
          </select>
        <div className="mt-3 ">
          <button className="btn btn-primary ms-auto" onClick={handleStartGame}>Start Game</button>
        </div>
        </div>
        
      </div>

      {/* Modal untuk create quiz */}
      {modalVisible && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Quiz</h5>
                <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="quizTitle" className="form-label">Quiz Title:</label>
                  <input type="text" className="form-control" id="quizTitle" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleSubmitCreateQuiz}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
     
    </div>
    
  );
}

export default QuizListPage;
