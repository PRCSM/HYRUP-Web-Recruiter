import React from "react";

function Applicants() {
  return (
    <div>
      <h1 className="font-[BungeeShade] text-[32px] mb-4">APPLICANTS</h1>
      <div
        className="w-[500px] h-[520px] bg-[#FBF3E7] border-2 border-black rounded-[18px] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.7)] flex items-center justify-center"
      >
        <span className="text-[20px] text-[#888] font-[Jost-Semibold] text-center">
          Select a Job To See
          <br />
          the Applicants
        </span>
      </div>
    </div>
  );
}

export default Applicants;
