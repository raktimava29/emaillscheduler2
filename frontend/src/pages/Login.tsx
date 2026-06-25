import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, redirect } from "../lib/api";
import { useAuth } from "../auth/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = () => {
      redirect("/auth/google");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
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
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/30 blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-cyan-200/30 to-emerald-200/30 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
      </div>

      <div className="relative w-full max-w-md px-6">
        {/* Logo/Brand */}
        <div className="mb-8 text-center animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent" style={{ fontFamily: 'SF Pro Display, system-ui, sans-serif' }}>
            ChronoMail
          </h1>
          <p className="mt-2 text-sm text-gray-600">Schedule emails with precision</p>
        </div>

        {/* Login Card */}
        <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl shadow-gray-200/50 border border-white/20 p-8 animate-slideUp">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            Welcome back
          </h2>

          {/* Google Login */}
          <button
            onClick={loginWithGoogle}
            className="group relative mb-6 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-100 hover:-translate-y-0.5"
          >
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
            <span className="group-hover:text-emerald-600 transition-colors">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-gray-500">or continue with email</span>
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* Login Button */}
          <button
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Create one
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
