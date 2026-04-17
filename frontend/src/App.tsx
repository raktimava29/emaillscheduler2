import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Compose from "./pages/Compose";
import MailView from "./pages/MailView";
import Login from "./pages/Login";
import Register from "./pages/Register"
import AuthCallback from "./pages/AuthCallback";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/compose" element={<ProtectedRoute><Compose /></ProtectedRoute>} />
      <Route path="/mail/:id" element={<ProtectedRoute><MailView /></ProtectedRoute>} />
    </Routes>
  );
}
