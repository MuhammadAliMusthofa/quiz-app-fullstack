import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function FindGame() {
  const [gameCode, setGameCode] = useState("");
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://192.168.40.36:4001/api/find-game`, {
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
        console.error("Game not found");
      } else {
        // Handle other errors
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 text-light"  id="container-auth">

      <div className="form-card border p-4 shadow ">
        <form onSubmit={handleSubmit}  >
        <h1 className="text-center">Find Game</h1>
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
          <p>Sign-up untuk membuat soal <Link to="/register">di sini</Link>.</p>
        </div>
      </div>
    </div>
  );
}

export default FindGame;
