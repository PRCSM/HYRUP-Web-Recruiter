import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import Registration from './pages/Registration'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Application from './pages/Application'
import SideNav from './components/SideNav'
import PostJobButton from './components/PostJobButton'
import PostJobPage from './pages/PostJobPage'


const App = () => {
  const location = useLocation();
  const hidePostJob = ["/signup", "/registration"].includes(location.pathname.toLowerCase());

  return (
    <div className="flex">
      <SideNav />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/chats" element={<Chat/>} />
          <Route path="/Profile" element={<Profile/>} />
          <Route path="/Application" element={<Application/>} />
          <Route path="/postjob" element={<PostJobPage />} />
        </Routes>
      </div>
      {!hidePostJob && <PostJobButton />}
    </div>
  )
}

export default App