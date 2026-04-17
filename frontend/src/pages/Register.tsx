import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {

      if (!email || !password) {
      alert("Please fill all fields");
      return;
      }

      try {
        await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            email,
            password
          })
        })

        alert("Registered successfully");
        navigate("/");
      } catch (err: unknown) {
        console.error(err);
      }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-[420px] rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Registration
        </h1>

        <input
          type="email"
          placeholder="Email ID"
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-md bg-gray-100 px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-400"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-md bg-gray-100 px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-400"
        />

        <button
          className="w-full rounded-md bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
          onClick={handleRegister}
        >
          Register
        </button>

        <p className="text-sm text-gray-400 text-center mt-4">Already have an account?
          <span 
            className="cursor-pointer hover:underline mx-1"
            onClick={() => navigate("/")}
          > 
            Login 
          </span>
        </p>
      </div>
    </div>
  );
}
