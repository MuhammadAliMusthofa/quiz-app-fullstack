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
import Finish from "./pages/Host/Finish";
import PlayerFinish from "./pages/Player/FinishPlayer";
import HostGame from "./pages/Host/HostGame";
import Statistik from "./pages/Player/Statistik";
import '../public/assets/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';



function App() {
  // const location = useLocation();
  // const sharedLayout =
  //   location.pathname === "/" || location.pathname === "/register";
  return (
  
    <div className="app" style={{backgroundColor:""}} >
      <main className="content">
        {/* {!sharedLayout && <Navbar />} */}
        {/* Tampilkan Navbar jika hideNavbar bernilai false */}
        <Routes>
          <Route path="/" element={<FindGame />} />
          <Route path="/stat" element={<Statistik />} />
          <Route path="/host/finish/:gameCode" element={<Finish />} />
          <Route path="/player/finish/:gameCode" element={<PlayerFinish />} />
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
