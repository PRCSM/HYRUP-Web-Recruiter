import React, { useState } from "react";
import { FaMapLocation } from "react-icons/fa6";

function Intership() {
  const jobs = [
    { title: "UI/UX Designer", location: "California, USA", applicants: 12 },
    { title: "Web Developer", location: "New York, USA", applicants: 20 },
    { title: "App Developer", location: "Austin, USA", applicants: 15 },
    { title: "App Developer", location: "Austin, USA", applicants: 15 },
    { title: "App Developer", location: "Austin, USA", applicants: 15 },
  ];

  const [selectedIdx, setSelectedIdx] = useState(null);

  return (
    <div>
      <div className=" flex flex-col gap-3 justify-center items-center lg:items-start">
        <h1 className="font-[BungeeShade] text-3xl mb-2">JOB/INTERNSHIP</h1>
        <div className="w-[356px] h-[500px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex flex-col justify-start py-6 items-center overflow-y-scroll gap-10">
          <div className="flex flex-col gap-9">
            {jobs.map((job, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={
                  `w-[314px] h-[82px] border-2 border-black rounded-[10px] cursor-pointer py-3 px-5 flex justify-between items-center
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
