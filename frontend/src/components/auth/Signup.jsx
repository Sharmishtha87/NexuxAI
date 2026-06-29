import React, { useState, useEffect } from "react";
import { EyeIcon, EyeClosedIcon } from "@primer/octicons-react";
import axios from "axios";
import { useAuth } from "../../authContext";

import "./auth.css";

import githubLogo from "../../assets/github-mark-white.svg";
import { Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setCurrentUser } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/signup`, {
        email: email,
        password: password,
        username: username,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      setCurrentUser(res.data.userId);
      setLoading(false);

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Signup Failed!");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-logo-container">
        <img className="logo-login" src="/logo_dark_blue.png" alt="NexuxAI Logo" style={{ width: "96px", height: "96px", borderRadius: "50%", boxShadow: "0 8px 32px rgba(88, 166, 255, 0.3)" }} />
      </div>

      <div className="login-box-wrapper">
        <div className="login-heading">
          <div style={{ padding: '8px' }}>
            <h1>Sign Up</h1>
          </div>
        </div>

        <div className="login-box">
          <div>
            <label className="label">Username</label>
            <input
              autoComplete="off"
              name="Username"
              id="Username"
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Email address</label>
            <input
              autoComplete="off"
              name="Email"
              id="Email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="div">
            <label className="label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                autoComplete="off"
                name="Password"
                id="Password"
                className="input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: "40px", width: "100%" }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "var(--text-secondary)"
                }}
              >
                {showPassword ? <EyeClosedIcon size={16} /> : <EyeIcon size={16} />}
              </span>
            </div>
          </div>

          <button
            className="login-btn"
            disabled={loading}
            onClick={handleSignup}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            className="github-auth-btn"
            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/github/login`}
          >
            <img src={githubLogo} alt="GitHub" className="btn-icon" style={{ width: "16px", height: "16px", marginRight: "8px", filter: "invert(1)" }} />
            Continue with GitHub
          </button>
        </div>

        <div className="pass-box">
          <p>
            Already have an account? <Link to="/auth">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;