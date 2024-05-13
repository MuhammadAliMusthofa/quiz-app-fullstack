import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function LobbyPage() {
  const { gameId } = useParams(); // Ambil gameId dari params URL
  const [gameData, setGameData] = useState(null); // State untuk menyimpan data game
  const [players, setPlayers] = useState([]); // State untuk menyimpan data pemain
  const [quizTitle, setQuizTitle] = useState(""); // State untuk menyimpan judul kuis
  const [status, setStatus] = useState(""); // State untuk menyimpan status permainan
  const navigate = useNavigate();

  // Fungsi untuk mengambil data game dari API
  const fetchGameData = async () => {
    try {
      const response = await fetch(`http://192.168.40.36:4001/api/quiz_title/${gameId}`);
      if (response.ok) {
        const data = await response.json();
        setGameData(data); // Simpan data game ke dalam state
        setQuizTitle(data.data.quiz_title); // Simpan judul kuis ke dalam state
        setStatus(data.data.game_status); // Simpan status permainan ke dalam state
      } else {
        console.error("Failed to fetch game data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
    }
  };

  // Fungsi untuk mengambil data pemain dari API
  const fetchPlayers = async () => {
    try {
      const response = await fetch(`http://192.168.40.36:4001/api/players/${gameId}`);
      if (response.ok) {
        const data = await response.json();
        setPlayers(data.data); // Simpan data pemain ke dalam state
      } else {
        console.error("Failed to fetch players:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  // Memanggil fungsi fetchGameData saat komponen dimuat
  useEffect(() => {
    const intervalId = setInterval(fetchPlayers, 2000);
    const intervalStatus = setInterval(fetchGameData, 2000);

    // Bersihkan interval saat komponen dilepas
    return () => {
      clearInterval(intervalId);
      clearInterval(intervalStatus);
    };
  }, [gameId]);

  const gameCode = gameData?.data?.game_code;

  // Fungsi untuk memulai game
  const startGame = async () => {
    try {
      const response = await fetch(`http://192.168.40.36:4001/api/start/${gameCode}`, {
        method: "PUT",
      });
      if (response.ok) {
        navigate(`/host/ingame/${gameCode}`);
      } else {
        console.error("Failed to start game:", response.statusText);
      }
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  return (
    <div className="player-page">
      <div className="card-lobby shadow col-md-6 mx-auto mt-5 p-4">
        <h1 className="text-center mb-4">Lobby</h1>
        <h2 className="text-center mb-4"> {quizTitle}</h2>
        {status === "waiting" ? (
          <p className="text-center">Waiting for other players to join...</p>
        ) : status === "ingame" ? (
          <p className="text-center">Game is in progress</p>
        ) : status === "finish" ? (
          <p className="text-center">Game has ended</p>
        ) : (
          <p className="text-center">Unknown game status</p>
        )}

        {gameData ? (
          <div className="">
            <p className="mb-3">Game Code: {gameData?.data?.game_code}</p>

            {players.length > 0 ? (
              <>
                <h2 className="mb-3">Players:</h2>
                <ul className="list-group l">
                  {players.map(player => (
                    <li key={player?.id} className="list-group-item" id="lobby-host">{player?.name}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No players in the game</p>
            )}
          </div>
        ) : (
          <p>Loading game data...</p>
        )}

        {/* Tambahkan teks dan tombol untuk menunggu pemain */}
        {status === "waiting" && (
          <button onClick={startGame} className="btn w-25 d-block mx-auto mt-3 shadow" id="button-lobby">Start</button>
        )}
      </div>
    </div>
  );
}

export default LobbyPage;
