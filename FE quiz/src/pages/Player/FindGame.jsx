import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import api from '../../config/Api';

function FindGame() {
  const [gameCode, setGameCode] = useState("");
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${api}/find-game`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ game_code: gameCode }) // Ubah gameCode menjadi game_code sesuai dengan nama yang digunakan di backend
      });
      if (response.ok) {
        const data = await response.json();
        const { game_code } = data.data; // Perubahan di sini
        navigate(`/join/${game_code}`);
      } else if (response.status === 404) { // Tangani respons 404 (Not Found) secara eksplisit
        // Handle error, show error message
      handleSnackbarOpen();

        console.error("Game not found");
      } else {
        // Handle other errors
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
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
    <div className="d-flex justify-content-center align-items-center vh-100 text-light"  id="container-auth">
    <Snackbar open={openSnackbar} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleSnackbarClose}>
        <MuiAlert elevation={6} variant="filled"   severity="error" onClose={handleSnackbarClose}>
          Kode yang anda masukkan salah
        </MuiAlert>
      </Snackbar>
      <div className="form-card border p-4 shadow ">
        <form onSubmit={handleSubmit}  >
        <div className="text-center">
              <img src="/public/assets/ErKuiz (5).png" alt="" style={{width:"250px", margin:0}}/>
            {/* <h1 className="text-center text-light">Login</h1> */}
            </div>
        <h1 className="text-center">Temukan Permainan</h1>
          <div className="mb-3">
            <label htmlFor="gameCode" className="form-label">Game Code:</label>
            <input
              type="text"
              className="form-control"
              id="gameCode"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
            />
          </div>
          <button type="submit" className="btn button-auth w-100 text-light">Play</button>
        </form>
        <div className="mt-3">
          <p>Sign-up untuk membuat soal <Link className="text-decoration-none ms-1 text-warning" to="/register">di sini</Link></p>
        </div>
      </div>
    </div>
  );
}

export default FindGame;
