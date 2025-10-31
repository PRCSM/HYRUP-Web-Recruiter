import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaArrowRightLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import Nav_sign from "../components/Nav_sign";
import GoogleSignInButton from "../components/GoogleSignInButton";
import AuthErrorHandler from "../components/AuthErrorHandler";
import animationData from "../../public/animations/business workshop.json";
import { useAuth } from "../hooks/useAuth";
const SignUp = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    userType,
    loading,
    error,
    signInWithGoogle,
    logout,
    setError,
  } = useAuth();
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Check if user is already authenticated and redirect accordingly
  useEffect(() => {
    if (currentUser && userType === "recruiter") {
      navigate("/");
    }
    // Remove the automatic redirect to registration
    // Let users choose to go to registration manually
  }, [currentUser, userType, navigate]);

  // Show error modal when there's an auth error
  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  const handleRetrySignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Retry sign-in failed (suppressed)
    }
  };

  const handleDismissError = () => {
    setShowErrorModal(false);
    setError(null);
  };

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

  return (
    <div className="relative bg-[url(../../public/images/background.png)] bg-cover bg-center  min-h-screen w-full">
      {/* Header */}
      <div class="absolute inset-0 backdrop-blur-[2px] bg-[rgb(255,255,243,0.2)]">
        <Nav_sign />
        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between md:justify-center items-center gap-10 md:gap-12">
          {/* Left section */}
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
            <Lottie
              animationData={animationData}
              loop={true}
              autoplay={true}
              className="w-56 h-56 sm:w-72 sm:h-72 md:w-[450px] md:h-[450px]"
            />
            <h2 className="font-[Jost-ExtraBold] text-center text-2xl sm:text-3xl md:text-[40px]">
              Hire verified skilled talent
            </h2>
            <p className="font-[Jost-Regular] text-center text-gray-700 text-base sm:text-lg md:text-[19px] w-[92%] md:w-[40vw]">
              Discover the best from Tier 2/3 colleges — pre-verified & job
              ready Candidates with{" "}
              <span className="text-black font-[BungeeShade]">HYRUP</span>
            </p>
          </div>

          {/* Right section */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div
              className="w-full max-w-[560px] md:w-[40vw] md:h-[80vh] bg-[#FFF7E4] border-4 border-black rounded-[10px] p-6 md:p-8 
                shadow-[6px_6px_0px_0px_rgba(0,0,0,0.7)] flex flex-col justify-between items-center"
            >
              <div className="p-2 md:p-4 text-center md:text-left">
                <h1 className="font-[BungeeShade] text-3xl sm:text-4xl md:text-[51px] leading-tight">
                  Welcome back, Recruiter!
                </h1>
                <p className="font-[Jost-Medium] text-[#4C4C4C] text-sm sm:text-base md:text-[17px] mt-2">
                  Simplify your hiring process and save time with
                  <span className="ml-1 font-[BungeeShade] text-lg md:text-[20px] text-[#6AB8FA]">
                    Hyrup
                  </span>
                  . Get started for free.
                </p>
              </div>
              <div className="text-center w-full">
                <h1 className="font-[Jost-Medium] mb-6 text-[#4C4C4C] text-sm sm:text-base md:text-[17px]">
                  Be a part of
                  <span className="ml-1 font-[BungeeShade] text-lg md:text-[20px] text-[#6AB8FA]">
                    Hyrup
                  </span>
                </h1>
                {error && (
                  <div className="w-full max-w-[420px] mx-auto mb-4 p-3 bg-red-100 border-2 border-red-400 rounded-[10px] text-red-700 text-center">
                    {error}
                  </div>
                )}

                {/* Show different content based on authentication status */}
                {currentUser && userType === null ? (
                  // User is authenticated but not registered
                  <div className="space-y-4">
                    <div className="w-full max-w-[420px] mx-auto p-4 bg-green-100 border-2 border-green-400 rounded-[10px] text-green-700 text-center">
                      <p className="font-[Jost-Medium] text-sm">
                        Welcome back! You're signed in as{" "}
                        <strong>{currentUser.email}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/registration")}
                      className="w-full max-w-[420px] mx-auto px-6 sm:px-8 md:px-10 border-4 gap-5 border-black rounded-[10px]
                        py-4 flex bg-[#6AB8FA] text-white justify-center items-center 
                        hover:cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-2px] hover:translate-y-[-2px] 
                        transition-all duration-200 ease-out active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]
                        font-[Jost-Medium] text-sm sm:text-base"
                    >
                      <span className="flex gap-3 items-center justify-center">
                        Complete Registration
                        <FaArrowRightLong />
                      </span>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await logout();
                          // The component will automatically re-render with the sign-in button
                        } catch (error) {
                          if (import.meta.env.DEV)
                            console.error("Error signing out:", error);
                        }
                      }}
                      className="w-full max-w-[420px] mx-auto px-6 sm:px-8 md:px-10 border-2 gap-5 border-gray-400 rounded-[10px]
                        py-3 flex bg-transparent text-gray-600 justify-center items-center 
                        hover:cursor-pointer hover:bg-gray-100 transition-all duration-200 ease-out
                        font-[Jost-Medium] text-sm sm:text-base"
                    >
                      Sign in with different account
                    </button>
                  </div>
                ) : (
                  // User is not authenticated, show Google sign in
                  <GoogleSignInButton
                    className="w-full max-w-[420px] mx-auto px-6 sm:px-8 md:px-10 border-4 gap-5 border-black rounded-[10px]
                      py-4 flex bg-white justify-center items-center 
                      hover:cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-2px] hover:translate-y-[-2px] 
                      transition-all duration-200 ease-out active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]
                      disabled:opacity-50 disabled:cursor-not-allowed font-[Jost-Medium] text-sm sm:text-base"
                    onSuccess={() => {}}
                    onError={(error) => {}}
                  >
                    <span className="flex gap-3 items-center justify-center">
                      Continue with Google
                      <FaArrowRightLong />
                    </span>
                  </GoogleSignInButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Handler Modal */}
      <AuthErrorHandler
        error={showErrorModal ? error : null}
        onRetry={handleRetrySignIn}
        onDismiss={handleDismissError}
      />
    </div>
  );
};

export default SignUp;
