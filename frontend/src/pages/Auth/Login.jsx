import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Mengimpor useHistory dari react-router-dom

function LoginForm() {
  const navigate = useNavigate(); // Mendapatkan objek history dari useHistory

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
      const response = await fetch("http://192.168.40.36:4001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
      });

      if (response.ok) {
        // Mendapatkan data JSON dari respons API
        const data = await response.json();
        
        // Memeriksa apakah respons memiliki userId
        if (data.userId) {
          // Menyimpan userId dalam sessionStorage
          sessionStorage.setItem("userId", data.userId);
          // Navigasi ke halaman dashboard setelah login berhasil
          navigate("/quiz/admin");
        } else {
          console.error("Login failed:", "No userId found in response");
        }
      } else {
        // Handle error response from API
        console.error("Login failed:", response.message);
      }
    } catch (error) {
      console.error("Error logging in user:", error);
    } finally {
      setDelay(false);
    }
  };

  const handleChange = (e) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };

  return (
    <div className=" d-flex justify-content-center align-items-center vh-100" id="container-auth">
      <form onSubmit={(e) => handleSubmit(e)} className="border p-4 form-card border p-4 shadow">
        <h1 className="mb-4 text-light text-center">Login</h1>
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
  );
}

export default LoginForm;
