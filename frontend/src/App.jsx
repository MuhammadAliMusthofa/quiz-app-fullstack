import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Lobby from "./pages/Host/Lobby";
import Quiz from "./pages/Host/Quiz";
import FindGame from "./pages/Player/FindGame";
import CreateQuiz from "./pages/Host/CreateDetailQuiz";
import AddQuestion from "./pages/Host/AddQuestion";
import EditQuiz from "./pages/Host/Edit";
import Nyoba from "./pages/Host/nyoba";
import History from "./pages/Host/History";
import DetailHistory from "./pages/Host/DetailHistory";
import DetailQuestion from "./pages/Host/QuestionDetail";
import NamaPlayer from "./pages/Player/NamePlayer";
import InGame from "./pages/Player/InGame";
import Stat from "./pages/Player/Statistik";
import Finish from "./pages/Host/Finish";
import PlayerFinish from "./pages/Player/FinishPlayer";
import HostGame from "./pages/Host/HostGame";
import Quizquiz from "./pages/Host/Sidebar";
import Statistik from "./pages/Player/Statistik";
import '../public/assets/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // List of paths that need loading
  const pathsWithLoading = [
    "/quiz/admin",
    "/quiz/detail/:quizId",
    "/lobby/host/:gameId",
    "/host/history"
  ];

  useEffect(() => {
    // Check if the current path matches any of the paths that need loading
    const shouldLoad = pathsWithLoading.some(path => {
      if (path.includes(':')) {
        const regexPath = new RegExp(`^${path.replace(/:\w+/, '\\w+')}$`);
        return regexPath.test(location.pathname);
      }
      return location.pathname === path;
    });

    if (shouldLoad) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [location]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        border: 'none'
      }}>
        <div className="scene  rounded-circle p-3" style={{backgroundColor:'#cfcfcf74'}}>
          <img src={`/public/assets/scene-load.gif`} alt="Loading GIF" width="250" />
        </div>
          <img className="ms-3" src={`/public/assets/logoo.gif`} alt="Loading GIF" width="250" />
      
      </div>
    );
  }

  return (
    <div className="app">
      <main className="content">
        <Routes>
          <Route path="/" element={<FindGame />} />
          <Route path="/stat" element={<Statistik />} />
          <Route path="/host/finish/:gameCode" element={<Finish />} />
          <Route path="/host/history" element={<History />} />
          <Route path="/host/detail-history/:gameCode" element={<DetailHistory />} />
          <Route path="/player/finish/:gameCode" element={<PlayerFinish />} />
          <Route path="/host/ingame/:gameCode" element={<HostGame />} />
          <Route path="/play/ingame/:gameCode" element={<InGame />} />
          <Route path="/join/:game_code" element={<NamaPlayer />} />
          <Route path="/lobby/host/:gameId" element={<Lobby />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/quiz/admin" element={<Quiz />} />
          <Route path="/quiz/quiz" element={<Quizquiz />} />
          <Route path="/nyoba" element={<Nyoba />} />
          <Route path="/quiz/detail/:quizId" element={<CreateQuiz />} />
          <Route path="/quiz/detaillll/:quizId" element={<AddQuestion />} />
          <Route path="/quiz/detail/:quizId/question/:questionId" element={<EditQuiz />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
