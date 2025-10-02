import React from "react";
import JobPost from "../components/JobPost";


function PostJob() {
  return (
    <div className="bg-[#FFFFF3] w-screen h-screen select-none overflow-x-hidden">
      <div className="flex justify-center w-full h-full items-center">
        <div className="hidden md:block w-[270px] h-screen bg-[#FFFFF3]"></div>
        <JobPost />
      </div>
    </div>
  );
}

export default PostJob;
