import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Lobby from "./pages/Host/Lobby";
import Quiz from "./pages/Host/Quiz";
import FindGame from "./pages/Player/FindGame";
import CreateQuiz from "./pages/Host/CreateDetailQuiz";
import NamaPlayer from "./pages/Player/NamePlayer";
import InGame from "./pages/Player/InGame";
import Stat from "./pages/Player/Statistik";
import HostGame from "./pages/Host/HostGame";
import Statistik from "./pages/Player/Statistik";

function App() {
  const location = useLocation();
  // const sharedLayout =
  //   location.pathname === "/" || location.pathname === "/register";
  return (
    <div className="app">
      <main className="content">
        {/* {!sharedLayout && <Navbar />} */}
        {/* Tampilkan Navbar jika hideNavbar bernilai false */}
        <Routes>
          <Route path="/" element={<FindGame />} />
          <Route path="/stat" element={<Statistik />} />
          <Route path="/host/ingame/:gameCode" element={<HostGame />} />
          <Route path="/play/ingame/:gameCode" element={<InGame />} />
          <Route path="/join/:game_code" element={<NamaPlayer />} />
          <Route path="/lobby/host/:gameId" element={<Lobby />} /> {/* Route untuk halaman lobby dengan parameter lobbyId */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/quiz/admin" element={<Quiz />} />
          <Route path="/quiz/detail/:quizId" element={<CreateQuiz />} />
          {/* <Route path="/register" element={<Register />} /> */}
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
 
        </Routes>
        {/* {!sharedLayout && <Footer />} */}
      </main>
    </div>
  );
}

export default App;
