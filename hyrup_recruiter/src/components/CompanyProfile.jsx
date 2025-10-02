import React from "react";
import { TiTick } from "../assets/Icons"; // Assuming this path is correct

function CompanyProfile() {
  return (
    // CHANGE HERE: Added items-center to center the component on mobile, and lg:items-start to align left on large screens
    <div className="pt-20 px-5 md:pt-5 flex flex-col items-center lg:items-center">
      <h1 className="font-[BungeeShade] text-3xl mb-2">
        COMPANY INFO
      </h1>
      {/* CHANGE #1: Removed `mx-auto`.
        CHANGE #2: Changed `items-center justify-center` to `items-start justify-start` to align all internal content to the top-left.
      */}
      <div className="w-full h-auto custom-scrollbar overflow-y-auto md:w-[600px] lg:w-[830px] md:h-auto lg:h-[540px] p-8 bg-[#FBF3E7] relative border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex flex-col items-start justify-start gap-5">
        
        <div
          className="absolute right-4 cursor-pointer top-4 px-1.5 md:px-3 py-1.5 bg-[#E3FEAA] rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                     transition-all duration-200 ease-out flex justify-center items-center gap-1"
        >
          <TiTick size={25} />
          <h1 className="font-[Jost-Medium] text-[16px]">EDIT PROFILE</h1>
        </div>

        {/* CHANGE #3: Removed `md:justify-center`. This lets the content align left by default. 
          Also aligned items to the center for a better mobile look.
        */}
        <div className="flex flex-col md:flex-row justify-start items-center md:items-start md:gap-10 w-full pt-10 md:pt-0">
          <img
            className="scale-75 md:scale-100 w-[200px] h-[160px] rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] object-contain border-2 border-black"
            src="/images/Googlelogo.webp" // Corrected path for React
            alt="Company Logo"
          />
          <div className="flex flex-col justify-center gap-3 items-center md:items-start w-[90%] md:w-[55%]">
            <h1 className="font-[Jost-ExtraBold] text-5xl">Google</h1>
            <h1 className="font-[Jost-Regular] flex flex-wrap gap-x-7 gap-y-1 text-xl text-[#00000089]">
              <span>google@gmail.com</span>
            </h1>
            <div className="px-5 py-2 flex gap-2 items-center justify-center font-[Jost-Bold] text-[20px] bg-[#FFFFF3] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] cursor-pointer">
              <span className="flex justify-center items-center gap-2">
                <img
                  className="w-[40px]"
                  src="/images/arrow.png" // Corrected path for React
                  alt="arrow icon"
                />
                <h1>WEBSITE</h1>
              </span>
            </div>
          </div>
        </div>
        
        <div className="w-full flex flex-col items-start justify-center px-2 md:px-8 mt-4">
          <h2 className="font-[Jost-Bold] text-2xl mb-4">Address :</h2>
          {/* CHANGE #4: Removed `w-[80%]` and `mx-auto` to allow grid to align left within its parent. */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 font-[Jost-Regular] text-lg">
            <p>
              <span className="font-[Jost-Medium]">Street :</span> Wabagai Terapishak
            </p>
            <p>
              <span className="font-[Jost-Medium]">City :</span> Kakching, Imphal
            </p>
            <p>
              <span className="font-[Jost-Medium]">State :</span> Manipur
            </p>
            <p>
              <span className="font-[Jost-Medium]">Country :</span> India
            </p>
            <p>
              <span className="font-[Jost-Medium]">Pincode :</span> 795103
            </p>
          </div>
        </div>

        <div className="w-full px-2 md:px-8">
            <h2 className="font-[Jost-Bold] text-2xl mb-4">Description :</h2>
            {/* CHANGE #5: Removed the inner `px-5` to rely on the parent's padding for consistent alignment. */}
            <p className="font-[Jost-Regular] text-lg text-[#00000090]">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sapiente hic similique adipisci maxime! Soluta magnam obcaecati tempore recusandae libero debitis dolorem, illum ad! Lorem ipsum dolor sit, amet consectetur adipisicing elit. Harum dolores, aliquid possimus iusto quia perspiciatis quod unde, ex rerum ipsum eveniet. Harum nemo consectetur fugit non aliquam itaque sequi dicta similique tempore architecto tempora praesentium ab at odit, quos qui facere hic aliquid provident quisquam odio deleniti. Nobis, et est.
            </p>
        </div>
        
      </div>
    </div>
  );
}

export default CompanyProfile;