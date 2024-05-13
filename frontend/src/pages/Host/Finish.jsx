import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Leaderboard = () => {
  const { gameCode } = useParams();
  const [playerScores, setPlayerScores] = useState([]);
  const userId = sessionStorage.getItem('userId');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchPlayerScores = async () => {
      try {
        const response = await fetch(`http://192.168.40.36:4001/api/player-score/${gameCode}`);
        if (!response.ok) {
          throw new Error("Failed to fetch player scores");
        }
        const data = await response.json();
        setPlayerScores(data.data);
      } catch (error) {
        console.error("Error fetching player scores:", error);
      }
    };

    fetchPlayerScores();
     // Atur interval untuk menjalankan fetchPlayerScores setiap 1 detik
     const intervalId = setInterval(fetchPlayerScores, 1000);

     // Bersihkan interval saat komponen di-unmount atau gameCode berubah
     return () => clearInterval(intervalId);
  }, [gameCode]);

  const handleFinishGame = async () => {
    try {
      const response = await fetch(`http://192.168.40.36:4001/api/game/finish/${gameCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // Jika body diperlukan, Anda dapat menambahkannya di sini
      });

      if (!response.ok) {
        throw new Error("Failed to finish game");
      }

      // Tampilkan alert "Game selesai" jika berhasil
      
      handleSnackbarOpen();

      // Pindah halaman setelah 3 detik
      setTimeout(() => {
        navigate('/quiz/admin');
      }, 1000);
    } catch (error) {
      // Tampilkan alert "Gagal menyelesaikan game" jika terjadi kesalahan
      alert("Gagal menyelesaikan game");
      console.error("Error finishing game:", error);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
  
    setOpenSnackbar(false);
  };
  
  const handleSnackbarOpen = () => {
    setOpenSnackbar(true);
  };
  

  return (
    <>
      <Snackbar open={openSnackbar} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleSnackbarClose}>
        <MuiAlert elevation={6} variant="filled"   severity="success" onClose={handleSnackbarClose}>
          Mengakhiri Game 
        </MuiAlert>
      </Snackbar>
    <div className="player-page ">
      <div className="container mt-5">
      <h2 className="mb-4">Leaderboard</h2>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Nickname </th>
            <th scope="col">Jawaban Terjawab</th>
            <th scope="col">Jawaban Benar</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>
          {playerScores.map((player, index) => (
            <tr key={index} className={index === 0 ? 'table-warning' : ''}>
              <th scope="row">{index + 1}</th>
              <td>{player.player_name}</td>
              <td>{player.total_answers}</td>
              <td>{player.total_correct_answers}</td>
              <td>{player.player_score !== null ? player.player_score : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {userId && (
        <div className="mt-5 d-flex justify-content-center">
          <button className="btn btn-lg " id="button-finish" onClick={handleFinishGame}>Finish</button>
        </div>
      )}
      </div>
    </div>
    </>
  );
};

export default Leaderboard;
