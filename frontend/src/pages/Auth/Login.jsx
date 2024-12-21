import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import api from '../../config/Api';

function LoginForm() {
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [delay, setDelay] = useState(false);
  const [login, setLogin] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDelay(true);

    try {
      // Mengirim data login ke API
      const response = await fetch(`${api}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.userId) {
          sessionStorage.setItem("userId", data.userId);
          handleSnackbarOpen("Berhasil Login", "success");
          setTimeout(() => {
            navigate("/quiz/admin");
          }, 1000);
        } else {
          handleSnackbarOpen("Login gagal: No userId found in response", "error");
        }
      } else {
        handleSnackbarOpen("Login gagal: " + response.statusText, "error");
      }
    } catch (error) {
      handleSnackbarOpen("Error logging in user: " + error.message, "error");
    } finally {
      setDelay(false);
    }
  };

  const handleChange = (e) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleSnackbarOpen = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  return (
    <>
      <Snackbar open={openSnackbar} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleSnackbarClose}>
        <MuiAlert elevation={6} variant="filled" severity={snackbarSeverity} onClose={handleSnackbarClose}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
      {/* <div className="d-flex justify-content-center flex-column align-items-center vh-100" id="container-auth">
        <form onSubmit={handleSubmit} className="border p-4 form-card border p-4 shadow">
            <div className="text-center">
              <img src="/public/assets/ErKuiz (5).png" alt="" style={{maxWidth:"250px", margin:0}}/>
         
            </div>
            <h1 className="text-light text-center">Login</h1>
          <div className="mb-3 mt-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              name="username"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              name="password"
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn button-auth w-100 text-light" disabled={delay}>
            {delay ? "Waiting..." : "Login"}
          </button>
        </form>
      </div> */}

<div className=" d-flex justify-content-center align-items-center vh-100" id="container-auth">
      <form onSubmit={handleSubmit} className=" form-card border p-4 shadow ">
      <div className="text-center">
              <img src="/public/assets/ErKuiz (5).png" alt="" style={{width:"250px", margin:0}}/>
            {/* <h1 className="text-center text-light">Login</h1> */}
            </div>
        <h1 className="mb-4 text-center text-light">Login</h1>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            name="username"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            name="password"
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn button-auth w-100 text-light" disabled={delay}>
            {delay ? "Waiting..." : "Login"}
          </button>
      </form>

    </div>
    </>
  );
}

export default LoginForm;
