import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  backgroundColor: '#4e0076',
  '& td, & th': {
    color: 'white',
  },
});

const Leaderboard = () => {
  const { gameCode } = useParams();
  const [playerScores, setPlayerScores] = useState([]);
  const [playerRank, setPlayerRank] = useState(null);
  const [totalPlayer, setTotalPlayer] = useState(null);
  const [playerName, setPlayerName] = useState(null);
  
  const userId = sessionStorage.getItem('userId');
  const navigate = useNavigate();
  
  const playerId = sessionStorage.getItem('playerId');

  useEffect(() => {
    const fetchPlayerScores = async () => {
        try {
            const response = await fetch(`${api}/player-score/${gameCode}`);
            if (!response.ok) {
                throw new Error("Failed to fetch player scores");
            }
            const data = await response.json();
            
            // Temukan peringkat player dengan membandingkan player_id dari session dengan player_id dalam respons
            const yourRanking = data.data.findIndex(player => player.id === parseInt(playerId)) + 1;
            // Temukan nama pemain berdasarkan playerId
            const yourPlayer = data.data.find(player => player.id === parseInt(playerId));
            const yourName = yourPlayer ? yourPlayer.player_name : "Unknown";
            setPlayerName(yourName)

            setPlayerRank(yourRanking)
            const countPlayer = data.total_players;
            setTotalPlayer(countPlayer)
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

  const handleFindNewGame = () => {
    // Hapus item playerId dari session storage
    sessionStorage.clear();
    navigate("/")
  };

  return (
    <>
    
    <div className="leaderboard-player ">
      <div className="container mt-5">

  

        <div className="d-flex justify-content-center">
          <div className="rank-compo col-md-6 p-5 text-center">
            <h3>Selamat <span className="text-warning"> {playerName}</span>, Ranking Kamu</h3>
            <h2> <span className="text-warning">{playerRank }</span> dari {totalPlayer} Player</h2>
          </div>
        </div>

  
     


        <div className="container mt-5">
          <div className="d-flex justify-content-center align-items-end flex-nowrap" style={{ overflowX: 'auto' }}>
            <div className="card p-3 m-2 bg-primary" style={{ minWidth: '150px', height: '250px', boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', transition: '0.3s', border: '5px solid silver' }}>
              <h3 style={{ fontSize: '1rem' }}>{playerScores[1]?.player_name || ''}</h3>
              <div className="avatar mx-auto my-3" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'url(/public/assets/2nd-place.png) center / cover no-repeat' }}></div>
            </div>
            <div className="card p-3 m-2 bg-dark text-light" style={{ minWidth: '150px', height: '350px', boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)', transition: '0.3s', border: '5px solid gold' }}>
              <h3 className="text-center" style={{ fontSize: '1rem' }}>{playerScores[0]?.player_name || ''}</h3>
              <div className="avatar mx-auto my-3" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'url(/public/assets/1st-prize.png) center / cover no-repeat' }}></div>
            </div>
            <div className="card p-3 m-2 bg-light" style={{ minWidth: '150px', height: '200px', boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', transition: '0.3s', border: '5px solid #773101' }}>
              <h3 style={{ fontSize: '1rem' }}>{playerScores[2]?.player_name || ''}</h3>
              <div className="avatar mx-auto my-3" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'url(/public/assets/3rd-place.png) center / cover no-repeat' }}></div>
            </div>
          </div>
        </div>




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
                    <TableRow sx={{ backgroundColor: player.id === parseInt(playerId) ? '#00FF98' : index % 2 === 0 ? '#d8bfd8' : '#8728a7' }}>
                        <TableCell >
                                  {index === 0 ? (
                                    <img style={{ width: '50px' }} src="/public/assets/badge.png" alt="" />
                                  ) : (
                                    index + 1
                                  )}
                          </TableCell>
                          <TableCell>{player.player_name}</TableCell>
                          <TableCell>{player.total_answers}</TableCell>
                          <TableCell>{player.total_correct_answers}</TableCell>
                          <TableCell>{player.player_score !== null ? player.player_score : 0}</TableCell>
                  </TableRow>
                    ) : (
                      <TableRow sx={{ backgroundColor: player.id === parseInt(playerId) ? '#00FF98' : index % 2 === 0 ? '#d8bfd8' : '#8728a7'}}>

                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{player.player_name}</TableCell>
                        <TableCell>{player.total_answers}</TableCell>
                        <TableCell>{player.total_correct_answers}</TableCell>
                        <TableCell>{player.player_score !== null ? player.player_score : 0}</TableCell>

                       </TableRow>

                    )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </div>

      <div className="mt-5 mb-5 d-flex justify-content-center">
        <button className="btn btn-lg " id="button-finish" onClick={handleFindNewGame}>Bermain Lagi</button>
      </div>
    </div>
  
    </>
  );
};

export default Leaderboard;
