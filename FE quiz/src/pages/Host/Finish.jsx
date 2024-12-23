import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { styled } from '@mui/system';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer
} from '@mui/material';
import api from '../../config/Api';

// Styled components using MUI's styled
const StyledTableContainer = styled(TableContainer)({
  borderRadius: '8px',
  overflow: 'hidden',
});

const StyledTableHead = styled(TableHead)({
  backgroundColor: '#fff',
  '& th': {
    color: 'black',
  },
});

const StyledTableRowOdd = styled(TableRow)({
  backgroundColor: '#d8bfd8',
});

const StyledTableRowEven = styled(TableRow)({
  backgroundColor: '#8728a7',
  '& td, & th': {
    color: 'white',
  },
});

const Leaderboard = () => {
  const { gameCode } = useParams();
  const [playerScores, setPlayerScores] = useState([]);
  const userId = sessionStorage.getItem('userId');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchPlayerScores = async () => {
      try {
        const response = await fetch(`${api}/player-score/${gameCode}`);
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
      const response = await fetch(`${api}/game/finish/${gameCode}`, {
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
      sessionStorage.removeItem('gameData');
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
    <div className="leaderboard-player ">
      <div className="container mt-5">
        
      <h2 className="mb-4">Leaderboard</h2>
      <StyledTableContainer component={Paper}>
          <Table aria-label="simple table">
            <StyledTableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Nickname </TableCell>
                <TableCell>Jawaban Terjawab</TableCell>
                <TableCell>Jawaban Benar</TableCell>
                <TableCell>Score</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {playerScores.map((player, index) => (
                <React.Fragment key={index}>
                   {index % 2 === 0 ? (
                    <StyledTableRowOdd>
                  {/* <TableRow className={player.id === parseInt(playerId) ? 'table-info' : ""}>
                  </TableRow> */}
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{player.player_name}</TableCell>
                    <TableCell>{player.total_answers}</TableCell>
                    <TableCell>{player.total_correct_answers}</TableCell>
                    <TableCell>{player.player_score !== null ? player.player_score : 0}</TableCell>
                  </StyledTableRowOdd>
                    ) : (
                    <StyledTableRowEven>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{player.player_name}</TableCell>
                    <TableCell>{player.total_answers}</TableCell>
                    <TableCell>{player.total_correct_answers}</TableCell>
                    <TableCell>{player.player_score !== null ? player.player_score : 0}</TableCell>
                  {/* <TableRow className={player.id === parseInt(playerId) ? 'table-info' : ""}>
                  </TableRow> */}
                  </StyledTableRowEven>

                    )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>

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
