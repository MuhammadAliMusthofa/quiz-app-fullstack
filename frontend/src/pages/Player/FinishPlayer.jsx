import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Leaderboard = () => {
  const { gameCode } = useParams();
  const [playerScores, setPlayerScores] = useState([]);
  const userId = sessionStorage.getItem('userId');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchPlayerScores = async () => {
      try {
        const response = await fetch(`http://localhost:4001/api/player-score/${gameCode}`);
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

  const handleFindNewGame = () => {
    // Hapus item playerId dari session storage
    sessionStorage.removeItem('playerId');
    navigate("/")
  };
 

  return (
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

      </div>


   
        <div className="mt-5 d-flex justify-content-center">
          <button className="btn btn-lg btn-info" onClick={handleFindNewGame}>Bermain Lagi</button>
        </div>
      
    </div>
  );
};

export default Leaderboard;
