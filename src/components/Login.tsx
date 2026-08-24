import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../service/api";
import "./library.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await api.post("/auth/login", { email, password });
      navigate("/dashboard/home");
    } catch (err) {
      alert("Login failed!");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Welcome back</h2>
        <div className="login-subtitle">Library Dashboard</div>

        <div className="form-field">
          <input
            type="email"
            placeholder="Email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="form-field">
          <input
            type="password"
            placeholder="Password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button onClick={handleLogin} className="btn btn-primary btn-block" style={{ marginTop: "8px" }}>
          Login
        </button>
      </div>
    </div>
  );
}
