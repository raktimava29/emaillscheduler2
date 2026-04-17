import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../lib/api";

export default function AuthCallback() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token || !auth) return;

  const handleAuth = async () => {
    try {
      localStorage.setItem("token", token);

      const user = await apiFetch("/auth/me");
      auth.login(user, token);

      navigate("/dashboard");
      } catch (err) {
        console.error("Auth failed", err);
        navigate("/login");
    }
  };
    handleAuth();
  }, [auth, navigate]);

  return <p>Logging you in...</p>;
}
