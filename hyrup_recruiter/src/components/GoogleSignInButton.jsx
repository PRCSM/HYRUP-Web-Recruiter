import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const GoogleSignInButton = ({
  children = "Sign in with Google",
  className = "",
  onSuccess = () => {},
  onError = () => {},
}) => {
  const { signInWithGoogle, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e) => {
    // Prevent default and ensure this is a direct user interaction
    e.preventDefault();

    try {
      setIsLoading(true);

      // Call signInWithGoogle directly from user click event
      // This ensures it's treated as a user-initiated action
      const result = await signInWithGoogle();

      if (result) {
        onSuccess(result);
      }
    } catch (error) {
      // Sign-in error (suppressed)
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className={`
          flex items-center justify-center gap-3 px-6 py-3 
          bg-white border border-gray-300 rounded-lg 
          hover:bg-gray-50 focus:outline-none focus:ring-2 
          focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${className}
        `}
        type="button"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {typeof children === "string" ? <span>{children}</span> : children}
          </>
        )}
      </button>

      {error && error.includes && error.includes("popup") && (
        <div className="mt-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md p-2">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Redirecting to Google Sign-In...
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;
