import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center aurora-bg">
        <div className="text-center">
          <div className="inline-block h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="mt-4 text-sm text-muted-foreground heading-serif text-lg">
            Aquecendo o forno...
          </p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
