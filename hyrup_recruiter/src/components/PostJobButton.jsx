import React from "react";
import { FaPlus } from "react-icons/fa";

const PostJobButton = () => (
  <div
    className="
      fixed top-4 right-4
      lg:absolute lg:top-auto lg:right-10 lg:bottom-8
      w-[90vw] max-w-[254px] h-[56px]
      bg-[#6AB8FA] border-2 border-black
      shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]
      rounded-[10px] flex justify-center items-center
      cursor-pointer z-50 scale-75 sm:scale-100
      transition-all duration-200 ease-out
      hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)]
      hover:translate-x-[-2px] hover:translate-y-[-2px]
      active:translate-x-[2px] active:translate-y-[2px]
      active:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]
    "
  >
    <FaPlus className="text-2xl md:text-4xl" />
    <h1 className="font-[Jost-Bold] text-base md:text-xl ml-2">
      Post a Job
    </h1>
  </div>
);

export default PostJobButton;