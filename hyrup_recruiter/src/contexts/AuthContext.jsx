import React, { useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import apiService from "../services/apiService";
import { AuthContext } from "./AuthContextDef";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'student', 'recruiter', 'college', or null
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign in with Google - with popup fallback to redirect
  const signInWithGoogle = async () => {
    try {
      setError(null);

      // Configure Google provider for better popup handling
      googleProvider.setCustomParameters({
        prompt: "select_account",
      });

      // First, try popup method
      try {
        const result = await signInWithPopup(auth, googleProvider);
        // After a successful popup sign-in, proactively check backend registration
        try {
          await checkUserType();
        } catch (err) {
          console.warn("checkUserType after popup sign-in failed:", err);
        }

        return result;
      } catch (popupError) {
        console.log("Popup authentication failed:", popupError);

        // Check if it's a popup blocked error
        if (
          popupError.code === "auth/popup-blocked" ||
          popupError.code === "auth/cancelled-popup-request" ||
          popupError.message.includes("popup")
        ) {
          console.log("Popup was blocked, falling back to redirect...");

          // Show user a message about redirect
          setError("Popup was blocked. Redirecting to Google Sign-In...");

          // Wait a moment for user to see the message
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Clear the error and use redirect method
          setError(null);
          await signInWithRedirect(auth, googleProvider);

          // signInWithRedirect doesn't return immediately,
          // the result will be handled in the useEffect via getRedirectResult
          return null;
        } else {
          // If it's not a popup issue, re-throw the error
          throw popupError;
        }
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError(error.message);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUserType(null);
      setUserData(null);
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error.message);
      throw error;
    }
  };

  // Check user type and get user data
  const checkUserType = async () => {
    try {
      setError(null);

      // Get current user UID
      const currentUserUid = auth.currentUser?.uid;
      if (!currentUserUid) {
        console.log("No current user UID available");
        setUserType(null);
        setUserData(null);
        return { type: null, data: null };
      }

      // First, check if user is registered as a company/recruiter using our public endpoint
      try {
        console.log("Checking if user is registered as recruiter/company...");
        const registrationResponse = await apiService.checkUserRegistration(
          currentUserUid
        );
        if (registrationResponse.success && registrationResponse.isRegistered) {
          console.log(
            "User found as registered recruiter:",
            registrationResponse.data
          );
          setUserType("recruiter");
          setUserData({
            id: registrationResponse.data.recruiterId,
            name: registrationResponse.data.recruiterName,
            email: registrationResponse.data.recruiterEmail,
            companyId: registrationResponse.data.companyId,
            companyName: registrationResponse.data.companyName,
          });
          return {
            type: "recruiter",
            data: {
              id: registrationResponse.data.recruiterId,
              name: registrationResponse.data.recruiterName,
              email: registrationResponse.data.recruiterEmail,
              companyId: registrationResponse.data.companyId,
              companyName: registrationResponse.data.companyName,
            },
          };
        }
      } catch (error) {
        console.log(
          "Registration check failed, trying other methods:",
          error.message
        );
      }

      // Try to check if user exists as student
      try {
        const studentResponse = await apiService.checkUser();
        if (studentResponse.exists && studentResponse.userType === "student") {
          setUserType("student");
          setUserData(studentResponse.user);
          return { type: "student", data: studentResponse.user };
        }
      } catch {
        // Student check failed
        console.log("User is not a student");
      }

      // Try recruiter login (legacy check)
      try {
        const recruiterResponse = await apiService.recruiterLogin();
        if (recruiterResponse.user) {
          setUserType("recruiter");
          setUserData(recruiterResponse.user);
          return { type: "recruiter", data: recruiterResponse.user };
        }
      } catch {
        console.log("Legacy recruiter check failed");
      }

      // User doesn't exist in any system
      console.log("User not found in any system");
      setUserType(null);
      setUserData(null);
      return { type: null, data: null };
    } catch (error) {
      console.error("Error checking user type:", error);
      setError(error.message);
      setUserType(null);
      setUserData(null);
      return { type: null, data: null };
    }
  };

  // Register as recruiter
  const registerRecruiter = async (recruiterData) => {
    try {
      setError(null);
      const response = await apiService.recruiterSignup(recruiterData);
      setUserType("recruiter");
      setUserData(response.user);
      // Force check user type after registration to ensure proper state
      setTimeout(() => {
        checkUserType();
      }, 500);
      return response;
    } catch (error) {
      console.error("Error registering recruiter:", error);
      setError(error.message);
      throw error;
    }
  };

  // Register as student
  const registerStudent = async (studentData) => {
    try {
      setError(null);
      const response = await apiService.studentSignup(studentData);
      setUserType("student");
      setUserData(response.user);
      return response;
    } catch (error) {
      console.error("Error registering student:", error);
      setError(error.message);
      throw error;
    }
  };

  // Update user data
  const updateUserData = (newData) => {
    setUserData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  // Handle redirect results on component mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Successfully signed in via redirect
          console.log("Successfully signed in via redirect:", result.user);
          // Proactively check backend registration so SignUp/other pages can react
          try {
            await checkUserType();
          } catch (err) {
            console.warn("checkUserType after redirect sign-in failed:", err);
          }
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
        setError(error.message);
      }
    };

    handleRedirectResult();
  }, []);

  // Monitor auth state changes
  useEffect(() => {
    let postRegisterTimeout = null;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // If we just registered and redirected here, skip an immediate check to avoid redirect flapping.
        try {
          const justRegistered = sessionStorage.getItem("hyrup:justRegistered");
          if (justRegistered) {
            sessionStorage.removeItem("hyrup:justRegistered");
            console.log(
              "Detected recent registration — deferring user-type check to avoid redirect loop."
            );
            // Defer the check slightly so that any backend state has time to settle.
            setLoading(true);
            postRegisterTimeout = setTimeout(async () => {
              try {
                await checkUserType();
              } catch (err) {
                console.error("Deferred checkUserType failed:", err);
              } finally {
                setLoading(false);
              }
            }, 900);
            return;
          }
        } catch {
          // ignore sessionStorage errors
        }
        // Only check user type if we're not on the registration or signup page
        // This prevents redirect loops for new users
        const currentPath = window.location.pathname;
        if (currentPath !== "/registration" && currentPath !== "/signup") {
          try {
            await checkUserType();
          } catch (error) {
            console.error("Error checking user type:", error);
            // Don't set error here as it might be normal for new users
          }
        }
        // Always set loading to false after handling auth state
        setLoading(false);
      } else {
        // User is signed out
        setUserType(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      if (postRegisterTimeout) clearTimeout(postRegisterTimeout);
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userType,
    userData,
    loading,
    error,
    signInWithGoogle,
    logout,
    checkUserType,
    registerRecruiter,
    registerStudent,
    updateUserData,
    setError, // For clearing errors
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
