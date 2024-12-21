import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from '../../config/Api';


function JoinGame() {
  const { game_code } = useParams();
  const [playerName, setPlayerName] = useState("");
  const [quizName, setQuizName] = useState(""); // State untuk menyimpan nama kuis
  const navigate = useNavigate();

  useEffect(() => {
    // Fungsi untuk mengambil nama kuis dari API
    const fetchQuizName = async () => {
      try {
        const response = await fetch(`${api}/quiz_name/${game_code}`);
        if (response.ok) {
          const data = await response.json();
          setQuizName(data.data.quiz_name); // Set nama kuis ke dalam state
        } else {
          // Handle error, show error message
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchQuizName(); // Panggil fungsi untuk mengambil nama kuis saat komponen dimuat
  }, [game_code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${api}/players/${game_code}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: playerName })
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data); // Tambahkan ini untuk memeriksa respons dari API
        sessionStorage.setItem("playerId", data.data.player_id); // Simpan player_id ke session storage
        navigate(`/play/ingame/${game_code}`);
      } else {
        // Handle error, show error message
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="nama-player-page ">

      <div className=" d-flex flex-column justify-content-center align-items-center text-light h-75">
        <div style={{width:'350px', padding:'30px'}}>

        <h3 className=" text-center ">Join Quiz :</h3>
        <h1 className=" text-center  "> {quizName} </h1>
        </div>

      <form onSubmit={handleSubmit} className="player-name-card ">
        <div className="mb-3">
          <label htmlFor="playerName" className="form-label">Player Name:</label>
          <input
            type="text"
            className="form-control"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn w-100 button-name-player">Join Game</button>
      </form>
      </div>
    </div>
  );
}

export default JoinGame;
