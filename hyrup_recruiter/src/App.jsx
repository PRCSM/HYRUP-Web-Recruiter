import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Registration from "./pages/Registration";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Application from "./pages/Application";
import SideNav from "./components/SideNav";
import PostJobButton from "./components/PostJobButton";
import PostJobPage from "./pages/PostJobPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  const location = useLocation();
  const hideSidebarAndPostJob = ["/signup", "/registration"].includes(
    location.pathname.toLowerCase()
  );

  return (
    <AuthProvider>
      <div className="flex">
        {!hideSidebarAndPostJob && <SideNav />}
        <div className="flex-1">
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/registration"
              element={
                <ProtectedRoute redirectTo="/signup">
                  {hideSidebarAndPostJob && <SideNav />}
                  <Registration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute requiredUserType="recruiter">
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats"
              element={
                <ProtectedRoute requiredUserType="recruiter">
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Profile"
              element={
                <ProtectedRoute requiredUserType="recruiter">
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Application"
              element={
                <ProtectedRoute requiredUserType="recruiter">
                  <Application />
                </ProtectedRoute>
              }
            />
            <Route
              path="/postjob"
              element={
                <ProtectedRoute requiredUserType="recruiter">
                  <PostJobPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        {!hideSidebarAndPostJob && <PostJobButton />}
      </div>
    </AuthProvider>
  );
};

export default App;
