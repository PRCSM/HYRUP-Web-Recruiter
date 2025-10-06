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
    // The Registration component itself will handle checking if user is already registered
    return children;
  }

  // For other protected routes, check user type more carefully
  // Only redirect if we're sure about the user type status
  if (currentUser && userType === null && !loading) {
    // User is authenticated but we couldn't determine their type
    // This might mean they need to register
    return <Navigate to="/registration" replace />;
  }

  // Check if user type matches requirement
  if (requiredUserType && userType && userType !== requiredUserType) {
    return <Navigate to="/signup" replace />;
  }

  // If we have a current user and either no requirement or matching type, allow access
  if (currentUser && (!requiredUserType || userType === requiredUserType)) {
    return children;
  }

  // If user type is still being determined, show loading
  if (currentUser && userType === null && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFF3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
