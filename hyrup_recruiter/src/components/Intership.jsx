import React from "react";
import { FaMapLocation } from "../assets/Icons"; 

function Intership({ jobs, selectedIdx, onJobSelect }) {
  return (
    <div className="py-4 lg:py-0">
      <div className="flex flex-col gap-3 justify-center items-center">
        <h1 className="font-[BungeeShade] text-3xl mb-2 text-center">JOB/INTERNSHIP</h1>
        {/* Responsive container: 90vw on mobile, 710px on tablet, 356px on desktop */}
        <div className="w-[90vw] md:w-[356px] h-[80vh] md:h-[550px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex flex-col justify-start py-6 items-center overflow-y-auto gap-10">
          <div className="flex flex-col items-center gap-9 w-full px-4">
            {jobs.map((job, idx) => (
              <div
                key={idx}
                onClick={() => onJobSelect(idx)}
                className={
                  `w-full lg:w-[314px] h-[82px] border-2 border-black rounded-[10px] cursor-pointer py-3 px-5 flex justify-between items-center
                   shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]
                   hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                   transition-all duration-200 ease-out active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] ` +
                  (selectedIdx === idx ? "bg-[#6ab7fa86]" : "bg-[#FBF3E7]")
                }
              >
                <div>
                  <h1 className="font-[Jost-Medium] text-[16px]">
                    {job.title}
                  </h1>
                  <div className="flex items-center mt-1">
                    <FaMapLocation />
                    <span className="font-[Jost-Regular] text-[14px] text-[#00000086]">
                      &nbsp; &nbsp; {job.location}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <h1 className="font-[BungeeInline] text-[20px]">
                    {job.applicants}
                  </h1>
                  <h1 className="font-[Jost-ExtraBold] text-[16px]">
                    Applicants
                  </h1>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Intership;