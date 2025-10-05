import React, { useEffect, useState } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import apiService from "../services/apiService";
import { AuthContext } from "./AuthContextDef";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'student', 'recruiter', 'college', or null
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      return result;
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

      // Try to check if user exists as student first
      try {
        const studentResponse = await apiService.checkUser();
        if (studentResponse.exists && studentResponse.userType === "student") {
          setUserType("student");
          setUserData(studentResponse.user);
          return { type: "student", data: studentResponse.user };
        }
      } catch {
        // Student check failed, try recruiter
        console.log("User is not a student, checking recruiter...");
      }

      // Try recruiter login
      try {
        const recruiterResponse = await apiService.recruiterLogin();
        if (recruiterResponse.user) {
          setUserType("recruiter");
          setUserData(recruiterResponse.user);
          return { type: "recruiter", data: recruiterResponse.user };
        }
      } catch {
        console.log("User is not a recruiter");
      }

      // User doesn't exist in any system
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

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Only check user type if we're not on the registration page
        // This prevents redirect loops for new users
        const currentPath = window.location.pathname;
        if (currentPath !== "/registration") {
          await checkUserType();
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

    return unsubscribe;
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
