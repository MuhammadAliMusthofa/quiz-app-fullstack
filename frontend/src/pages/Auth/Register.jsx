import React, { useState } from "react";
import { useNavigate , Link} from "react-router-dom"; // Mengimpor useHistory dari react-router-dom

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
      const response = await fetch("http://localhost:4001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
      });

      if (response.ok) {
        // Mendapatkan data JSON dari respons API
        const data = await response.json();
        navigate("/login");
       
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

  const handleChange = (e) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <form onSubmit={(e) => handleSubmit(e)} className="border p-4">
        <h1 className="mb-4">Register</h1>
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
        <button type="submit" className="btn btn-primary" disabled={delay}>
          {delay ? "Waiting..." : "Login"}
        </button>
      <div className="mt-3">Sudah Punya Akun ?<Link className="text-decoration-none ms-3" to="/login" >Login</Link></div>
      </form>

    </div>
  );
}

export default LoginForm;
