import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
            const response = await fetch(`http://192.168.40.36:4001/api/player-score/${gameCode}`);
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
            // console.log(countPlayer)
            setTotalPlayer(countPlayer)
            setPlayerScores(data.data);
            setYourRanking(yourRanking);
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

        <div className="d-flex justify-content-center">
          <div className="rank-compo col-md-6 p-5 text-center">
              <h3>Selamat <span className="text-info"> {playerName}</span>, Ranking Kamu</h3>
              <h2> <span className="text-info">{playerRank }</span> dari {totalPlayer} Player</h2>

            </div>
      </div>
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
    <tr key={index} className={player.id === parseInt(playerId) ? 'table-info' : ''}>
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
          <button className="btn btn-lg " id="button-finish" onClick={handleFindNewGame}>Bermain Lagi</button>
        </div>
      
    </div>
  );
};

export default Leaderboard;
