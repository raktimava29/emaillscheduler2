import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useContext(AuthContext);

  if (auth?.loading) {
    return null;
  }

  if (!auth?.user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
