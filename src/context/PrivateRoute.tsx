import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import React, { JSX } from "react";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { currentUser, token } = useAuth();

  if (!currentUser || !token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
