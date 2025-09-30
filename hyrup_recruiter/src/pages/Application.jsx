import React from "react";
import Applicants from "../components/Applicants";
import Intership from "../components/Intership";


function Application() {
  return (
    <div className="bg-[#FFFFF3] w-screen min-h-screen select-none overflow-x-hidden">
      <div className="flex justify-center gap-13 items-center px-3 overflow-x-hidden">
        <div className="hidden lg:block w-[220px] h-screen bg-[#FFFFF3]"></div>
        <Intership/>
        <Applicants/>
      </div>
    </div>
  );
}

export default Application;
