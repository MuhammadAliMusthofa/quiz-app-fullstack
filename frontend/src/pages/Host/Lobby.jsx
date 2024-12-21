import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Howl } from 'howler'; // Import Howl from howler
import { Fade, Bounce } from "react-awesome-reveal";
import { Modal , Box} from "@mui/material";
import QRCode from 'react-qr-code';
import api from '../../config/Api';

function LobbyPage() {
  const { gameId } = useParams(); // Ambil gameId dari params URL
  const [gameData, setGameData] = useState(null); // State untuk menyimpan data game
  const [players, setPlayers] = useState([]); // State untuk menyimpan data pemain
  const [quizTitle, setQuizTitle] = useState(""); // State untuk menyimpan judul kuis
  const [status, setStatus] = useState(""); // State untuk menyimpan status permainan
  const navigate = useNavigate();
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(false);


const GO = "/public/assets/going.gif";

  // Fungsi untuk mengambil data game dari API
  const fetchGameData = async () => {
    try {
      const response = await fetch(`${api}/quiz_title/${gameId}`);
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
      const response = await fetch(`${api}/players/${gameId}`);
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

 
  useEffect(() => {
    const audioFile = '/assets/lobby-sound.mp3'; 

    const audioInstance = new Howl({
      src: [audioFile],
      html5: true, 
      volume: 0.0, //isi volume 
      html5PoolSize: 10,
      loop: true,
    });

    setAudio(audioInstance);
    audioInstance.play();

    return () => {
      audioInstance.unload();
    };
  }, []);

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
    setLoading(true);
    try {
      const response = await fetch(`${api}/start/${gameCode}`, {
        method: "PUT",
      });
      if (response.ok) {
        setTimeout(() => {
          navigate(`/host/ingame/${gameCode}`);
          setLoading(false);
        }, 4000);
        
        } else {
        console.error("Failed to start game:", response.statusText);
      }
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  return (
    <div className="player-page">

        <h2 className="text-center mb-4 mt-3 text-light">Lobby</h2>
      <Fade >
        <div className="m-3">

        <div className=" col-md-6 p-4 card-lobby" style={{ margin: '20px auto' }}>
      <h1 className="text-center text-bold mb-4 text-quiz">" {quizTitle} "</h1>
      <div className="d-flex justify-content-around flex-wrap">
        <div className="game-code-container">
          <p className="text-center mt-3">Insert Game Code</p>
          <h1 className="mb-3 text-bold text-center game-code">
            {gameData?.data?.game_code}
          </h1>
        </div>
        <div className="mt-3  border rounded  d-flex align-items-center qr-code-container bg-light p-1" style={{width:'200px', height:'200px'}} >
          <QRCode value="http://localhost:5173/" style={{width:'100%'}}  />
        </div>
      </div>
    </div>
        </div>

      </Fade>

      <div className=" shadow col-md-8 mx-auto mt-5 p-4 ">
        {/* <h1  className="text-center text-bold mb-4 text-warning">" {quizTitle} "</h1> */}
        {status === "waiting" ? (
          
          <h2 className="text-center text-light">Waiting for other players to join...</h2>
        ) : status === "ingame" ? (
          <p className="text-center">Game is in progress</p>
        ) : status === "finish" ? (
          <p className="text-center">Game has ended</p>
        ) : (
          <p className="text-center">Unknown game status</p>
        )}

        {gameData ? (

          <>
          <div className="">
            {/* <p className="mb-3 text-center">Game Code</p>
            <h1 className="mb-3 text-bold text-center">{gameData?.data?.game_code}</h1> */}

            {players.length > 0 ? (
              <>
                <h2 className="mb-3 text-light">Players:</h2>
              
                <div className=" d-flex flex-wrap justify-content-center">
                  {players.map((player) => (
                    <Bounce cascade damping={0.1} key={player?.id}>
                      <div className="list-player p-3 rounded d-flex align-items-center me-3" id="lobby-host">
                        <h5>{player?.name}</h5>
                      </div>
                    </Bounce>
                  ))}
                </div>
              </>
            ) : (
              <p>No players in the game</p>
            )}
          </div>
          <Modal
            open={loading}
            onClose={() => {}}
            aria-labelledby="loading-modal"
            aria-describedby="loading-modal-description"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Box className='p-5' sx={{ border: 'none', boxShadow: 'none', outline: 'none' }}>
              <img src={GO} alt="Loading" style={{ width: '300px' }} />
            </Box>
          </Modal>


          </>
        ) : (
          <p>Loading game data...</p>
        )}

        {/* Tambahkan teks dan tombol untuk menunggu pemain */}
        {status === "waiting" && (
          <button onClick={startGame} className="btn w-50 d-block mx-auto mt-5 shadow p-3" id="button-lobby">START GAME</button>

 
        )}
      </div>
    </div>

    
  );
}

export default LobbyPage;
