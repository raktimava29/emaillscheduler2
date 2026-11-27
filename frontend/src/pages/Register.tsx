import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";
import Spinner from "../components/ui/Spinner";
import { useToast } from "../components/ui/toast-context";

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      toast("Enter your email and a password.", "error");
      return;
    }

    if (password.length < 8) {
      toast("Use at least 8 characters for your password.", "error");
      return;
    }

    if (password !== confirmPassword) {
      toast("Passwords do not match.", "error");
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      toast("Account created. Sign in to continue.");
      navigate("/");
    } catch (err: unknown) {
      console.error(err);
      toast(err instanceof Error ? err.message : "Registration failed", "error");
      setIsLoading(false);
    }
  };

  const strength = Math.min(password.length, 8);
  const matches = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <AuthLayout title="Create your account">
      <form
        noValidate
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
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
        <PasswordField
          label="Password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          hint={
            <>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sky" aria-hidden>
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength === 8 ? "bg-mint" : "bg-sun"}`}
                  style={{ width: `${(strength / 8) * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate2">
                {strength === 8 ? "Length looks good" : "Must be at least 8 characters"}
              </p>
            </>
          }
        />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          hint={matches && <p className="mt-1.5 text-xs font-semibold text-mint">Passwords match</p>}
        />
        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
          {isLoading ? <><Spinner /> Creating account...</> : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate2">
        Already have an account?{" "}
        <Link to="/" className="font-semibold text-cobalt hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
