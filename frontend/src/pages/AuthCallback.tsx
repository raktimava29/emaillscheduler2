import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import LoadingScreen from "../components/LoadingScreen";

export default function AuthCallback() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth) return;

    const handleAuth = async () => {
      try {
        await auth.refreshUser();
        navigate("/dashboard");
      } catch (err) {
        console.error("Auth failed", err);
        navigate("/");
      }
    };
    handleAuth();
  }, [auth, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoadingScreen title="Signing you in" description="This takes a few seconds." />
    </div>
  );
}
