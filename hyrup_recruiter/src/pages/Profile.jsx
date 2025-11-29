import React, { useEffect } from "react";
import CompanyProfile from "../components/CompanyProfile";

const Profile = () => {


  return (
    <div className="bg-[#FFFFF3] w-screen h-screen select-none overflow-x-hidden">
      <div className="flex justify-center items-center">
        <div className="hidden md:block w-[270px] h-screen bg-[#FFFFF3]"></div>

        <CompanyProfile />
      </div>
    </div>
  );
};

export default Profile;
