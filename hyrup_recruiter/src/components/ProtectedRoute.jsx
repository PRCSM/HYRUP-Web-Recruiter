import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({
  children,
  requiredUserType = null,
  redirectTo = "/signup",
}) => {
  const { currentUser, userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFF3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  // Special handling for registration page
  if (window.location.pathname === "/registration") {
    // On registration page, just need to be authenticated
    return children;
  }

  // Authenticated but no user type (needs registration)
  if (currentUser && !userType) {
    return <Navigate to="/registration" replace />;
  }

  // Check if user type matches requirement
  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to="/signup" replace />;
  }

  return children;
};

export default ProtectedRoute;
