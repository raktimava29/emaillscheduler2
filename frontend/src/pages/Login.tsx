import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, redirect } from "../lib/api";
import { useAuth } from "../auth/useAuth";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";
import Spinner from "../components/ui/Spinner";
import { useToast } from "../components/ui/toast-context";

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!auth.loading && auth.user) {
      navigate("/dashboard", { replace: true });
    }
  }, [auth.loading, auth.user, navigate]);

  const loginWithGoogle = () => {
      redirect("/auth/google");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast("Enter your email and password.", "error");
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      await auth.refreshUser();
      navigate("/dashboard");
    } catch (err: unknown) {
      console.error(err);
      toast(err instanceof Error ? err.message : "Sign in failed", "error");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back">
      <button type="button" onClick={loginWithGoogle} className="btn-ghost w-full py-3">
        <svg className="h-5 w-5" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.2 1.53 7.62 2.8l5.56-5.56C33.78 3.86 29.24 2 24 2 14.73 2 6.91 7.38 3.36 15.11l6.91 5.36C12.09 13.09 17.55 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24.5c0-1.64-.15-3.21-.43-4.72H24v9.04h12.7c-.55 2.96-2.2 5.47-4.7 7.16l7.23 5.61C43.91 37.36 46.5 31.44 46.5 24.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.27 28.47a14.5 14.5 0 010-8.94l-6.91-5.36a23.93 23.93 0 000 19.66l6.91-5.36z"
              />
              <path
                fill="#34A853"
                d="M24 46c6.48 0 11.92-2.14 15.89-5.81l-7.23-5.61c-2.01 1.35-4.58 2.14-8.66 2.14-6.45 0-11.91-3.59-13.73-8.97l-6.91 5.36C6.91 40.62 14.73 46 24 46z"
              />
            </svg>
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-sm text-slate2">
        <span className="h-px flex-1 bg-line" />
        or use email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form
        noValidate
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
          />
        </div>
        <PasswordField label="Password" autoComplete="current-password" value={password} onChange={setPassword} />
        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
          {isLoading ? <><Spinner /> Signing in...</> : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate2">
        New here?{" "}
        <Link to="/register" className="font-semibold text-cobalt hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
