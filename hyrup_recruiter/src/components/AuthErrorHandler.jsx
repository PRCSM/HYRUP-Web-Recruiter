import React, { useState, useEffect } from "react";

const AuthErrorHandler = ({ error, onRetry, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
    }
  }, [error]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300);
  };

  const getErrorMessage = (error) => {
    if (!error) return "";

    const errorCode = error.code || "";
    const errorMessage = error.message || "";

    // Handle specific Firebase auth errors
    switch (errorCode) {
      case "auth/popup-blocked":
        return {
          title: "Popup Blocked",
          message:
            "Your browser blocked the sign-in popup. Please allow popups for this site or try again.",
          action: "Try Again",
          showRetry: true,
        };

      case "auth/popup-closed-by-user":
        return {
          title: "Sign-in Cancelled",
          message:
            "The sign-in popup was closed. Please try again to complete authentication.",
          action: "Try Again",
          showRetry: true,
        };

      case "auth/cancelled-popup-request":
        return {
          title: "Sign-in Interrupted",
          message:
            "Another sign-in attempt is already in progress. Please wait and try again.",
          action: "Try Again",
          showRetry: true,
        };

      case "auth/network-request-failed":
        return {
          title: "Network Error",
          message:
            "Unable to connect to authentication services. Please check your internet connection.",
          action: "Retry",
          showRetry: true,
        };

      case "auth/too-many-requests":
        return {
          title: "Too Many Attempts",
          message:
            "Too many failed attempts. Please wait a moment before trying again.",
          action: "Try Later",
          showRetry: false,
        };

      case "auth/user-disabled":
        return {
          title: "Account Disabled",
          message:
            "This account has been disabled. Please contact support for assistance.",
          action: "Contact Support",
          showRetry: false,
        };

      default:
        // Check for popup-related error messages
        if (errorMessage.toLowerCase().includes("popup")) {
          return {
            title: "Popup Issue",
            message:
              "There was an issue with the authentication popup. Please ensure popups are enabled.",
            action: "Try Again",
            showRetry: true,
          };
        }

        return {
          title: "Authentication Error",
          message:
            errorMessage || "An unexpected error occurred during sign-in.",
          action: "Try Again",
          showRetry: true,
        };
    }
  };

  if (!error || !isVisible) return null;

  const errorInfo = getErrorMessage(error);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-lg p-6 m-4 max-w-md w-full shadow-xl transform transition-all duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {errorInfo.title}
          </h3>
        </div>

        <p className="text-gray-600 mb-6">{errorInfo.message}</p>

        <div className="flex space-x-3">
          {errorInfo.showRetry && onRetry && (
            <button
              onClick={() => {
                handleDismiss();
                onRetry();
              }}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              {errorInfo.action}
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorHandler;
