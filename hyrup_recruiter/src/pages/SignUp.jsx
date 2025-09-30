import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaArrowRightLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import Nav_sign from "../components/Nav_sign";
import animationData from "../../public/animations/business workshop.json";
const SignUp = () => {
  const navigate = useNavigate();

  const handleGoogleSignup = () => {
    navigate('/registration');
  };

  return (
    <div className="relative bg-[url(../../public/images/background.png)] bg-cover bg-center  min-h-screen w-full">
      {/* Header */}
      <div class="absolute inset-0 backdrop-blur-[2px] bg-[rgb(255,255,243,0.2)]">
        <Nav_sign/>
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
            Discover the best from Tier 2/3 colleges — pre-verified & job ready
            Candidates with <span className="text-black font-[BungeeShade]">HYRUP</span>
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
              <div
                onClick={handleGoogleSignup}
                className="w-full max-w-[420px] mx-auto px-6 sm:px-8 md:px-10 border-4 gap-5 border-black rounded-[10px]
                py-4 flex bg-white justify-center items-center 
                hover:cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-2px] hover:translate-y-[-2px] 
                transition-all duration-200 ease-out active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]"
              >
                <FcGoogle />
                <h1 className="flex gap-3 font-[Jost-Medium] items-center justify-center text-sm sm:text-base">
                  Continue with Google
                  <span>
                    <FaArrowRightLong />
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      
    </div>
  );
};

export default SignUp;
