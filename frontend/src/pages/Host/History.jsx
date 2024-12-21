import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { styled } from '@mui/system';
import * as XLSX from 'xlsx';  // Import library xlsx
import DownloadIcon from '@mui/icons-material/Download';
import { Box, Grid, Paper, Typography, Button, IconButton, Pagination } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import EmailIcon from '@mui/icons-material/Email';
import ShareIcon from '@mui/icons-material/Share';
import api from '../../config/Api';

// Styled components
const StyledCard = styled(Paper)({
  padding: '16px',
  margin: '16px 0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderRadius: '8px',
  backgroundColor: '#fff',
});

const Leaderboard = () => {
  const { gameCode } = useParams();
  const [gameHistory, setGameHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(3); // Jumlah data per halaman
  const userId = sessionStorage.getItem('userId');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayerScores = async () => {
      try {
        const response = await fetch(`${api}/games/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch player scores");
        }
        const data = await response.json();
        setGameHistory(data.data);
      } catch (error) {
        console.error("Error fetching player scores:", error);
      }
    };

    fetchPlayerScores();
  }, [gameCode]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackbar(false);
  };

  const handleSnackbarOpen = () => {
    setOpenSnackbar(true);
  };

  // Fungsi untuk mengekspor data game ke Excel
  const exportToExcel = (game) => {
    const worksheet = XLSX.utils.json_to_sheet([game]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GameHistory");

    XLSX.writeFile(workbook, `GameHistory_${game.game_code}.xlsx`);
  };

  // Hitung jumlah halaman
  const pageCount = Math.ceil(gameHistory.length / itemsPerPage);

  // Ambil data berdasarkan halaman
  const getCurrentPageData = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return gameHistory.slice(startIndex, endIndex);
  };

  return (
    <>
      <Snackbar open={openSnackbar} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleSnackbarClose}>
        <MuiAlert elevation={6} variant="filled" severity="success" onClose={handleSnackbarClose}>
          Mengakhiri Game 
        </MuiAlert>
      </Snackbar>
      <div className="">
        <div className="container mt-5">
          <div className="d-flex align-items-center mb-4 text-dark">
            <img style={{ width: '50px' }} src="/public/assets/history.png" alt="" />
            <h2 className="ms-3">History</h2>
          </div>

          {getCurrentPageData().map((game, index) => (
            <StyledCard key={index}>
              <Box>
                <Typography variant="h6">{game.title}</Typography>
                <Typography variant="body2">Status: {game.status}</Typography>
                <Typography variant="body2">Start: {new Date(game.start_time).toLocaleString()}</Typography>
                <Typography variant="body2">End: {game.end_time ? new Date(game.end_time).toLocaleString() : 'N/A'}</Typography>
              </Box>

              <div className="p-3 rounded-circle bg-secondary text-light" style={{ cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); exportToExcel(game); }}>
                <DownloadIcon />
              </div>
            </StyledCard>
          ))}

          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
