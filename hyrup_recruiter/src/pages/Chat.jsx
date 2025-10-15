import React from "react";
import StudentProfile from "../components/StudentProfile";
import ChatStudent from "../components/ChatStudent";
import ChatTextingArea from "../components/ChatTextingArea";

const Chat = () => {
  return (
    <div className="bg-[#FFFFF3] w-screen min-h-screen select-none overflow-x-hidden">
      <div className="flex h-screen justify-center gap-13 items-center px-3 overflow-x-hidden">
        <div className="hidden md:block w-[220px] h-screen bg-[#FFFFF3]"></div>
        <ChatStudent />
        <ChatTextingArea />
      </div>
    </div>
  );
};

export default Chat;
