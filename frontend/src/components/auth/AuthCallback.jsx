import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../authContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userId = params.get("userId");

    if (token && userId) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      setCurrentUser(userId);
      navigate("/");
    } else {
      console.error("Missing token or userId from OAuth callback");
      navigate("/auth");
    }
  }, [location, navigate, setCurrentUser]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "white" }}>
      <h2>Authenticating with GitHub...</h2>
    </div>
  );
};

export default AuthCallback;
