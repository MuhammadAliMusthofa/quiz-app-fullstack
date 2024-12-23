import React, { useState } from "react";
import { useNavigate , Link} from "react-router-dom"; // Mengimpor useHistory dari react-router-dom
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import api from '../../config/Api';


function LoginForm() {
  const navigate = useNavigate(); // Mendapatkan objek history dari useHistory
  const [openSnackbar, setOpenSnackbar] = useState(false);

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
      const response = await fetch(`${api}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
      });

      if (response.ok) {
        // Mendapatkan data JSON dari respons API
        const data = await response.json();
        
        handleSnackbarOpen();

        // Pindah halaman setelah 3 detik
        setTimeout(() => {
          navigate("/login");
        }, 1000);
        
      } else {
        // Handle error response from API
        console.error("Register failed:", response.message);
      }
    } catch (error) {
      console.error("Error logging in user:", error);
    } finally {
      setDelay(false);
    }
    
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
  
    setOpenSnackbar(false);
  };
  
  const handleSnackbarOpen = () => {
    setOpenSnackbar(true);
  };

  const handleChange = (e) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };

  return (
    <>
    <Snackbar open={openSnackbar} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleSnackbarClose}>
        <MuiAlert elevation={6} variant="filled"   severity="success" onClose={handleSnackbarClose}>
          Berhasil Mendaftar
        </MuiAlert>
      </Snackbar>
    <div className=" d-flex justify-content-center align-items-center vh-100" id="container-auth">
      <form onSubmit={(e) => handleSubmit(e)} className=" form-card border p-4 shadow ">
      <div className="text-center">
              <img src="/public/assets/ErKuiz (5).png" alt="" style={{width:"250px", margin:0}}/>
            {/* <h1 className="text-center text-light">Login</h1> */}
            </div>
        <h1 className="mb-4 text-center text-light">Daftar</h1>
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
        <button type="submit" className="btn button-auth w-100 text-light" disabled={delay} > 
          {delay ? "Waiting..." : "Register"}
        </button>
      <div className="mt-3 text-light">Sudah Punya Akun ?<Link sx={{color:'#60E7FF !important'}}  className="text-decoration-none ms-1 text-warning " to="/login" >Login</Link></div>
      </form>

    </div>
    </>
  );
}

export default LoginForm;
