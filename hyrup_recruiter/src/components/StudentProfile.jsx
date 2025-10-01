import React, { useState } from "react";
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import "../../src/index.css";

function StudentProfile({ applicant, onClose }) {
  // This state is self-contained within the modal to track shortlisting status.
  const [isShortlisted, setIsShortlisted] = useState(false);

  const handleToggleShortlist = () => {
    setIsShortlisted(!isShortlisted);
  };

  // If no applicant data is passed to the component, it renders nothing.
  // This prevents displaying an empty or broken modal.
  if (!applicant) {
    return null;
  }

  // Destructure the applicant object to easily access its properties.
  // Default values (e.g., "N/A", []) are provided to prevent errors if data is missing.
  const {
    name = "N/A",
    phone = "N/A",
    email = "N/A",
    bio = "No bio provided.",
    img = "https://i.pravatar.cc/150", // A default placeholder image
    skills = [],
    experiences = [],
    projects = [],
    college = {}
  } = applicant;

  return (
    <div className="w-[95vw] md:w-[700px] relative h-[550px] bg-[#FBF3E7] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] px-1 md:px-3 pt-5 md:pt-14 custom-scrollbar flex flex-col justify-start items-center overflow-x-hidden z-50">
      {/* Close button that triggers the onClose function passed from the parent */}
      <div onClick={onClose} className="absolute top-3 right-3 p-2 bg-white border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] flex justify-center items-center cursor-pointer">
        <RxCross2 size={15} />
      </div>

      {/* Conditional rendering for the Shortlist/Reject button based on its state */}
      {isShortlisted ? (
        <div onClick={handleToggleShortlist} className="absolute right-4 md:right-16 cursor-pointer top-16 md:top-14 px-1.5 md:px-3 py-1 bg-[#FEAAAB] rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] border-2 border-black flex justify-center items-center gap-1">
          <RxCross2 size={25} />
          <h1 className="font-[Jost-Medium] text-[16px]">Reject</h1>
        </div>
      ) : (
        <div onClick={handleToggleShortlist} className="absolute right-4 md:right-16 cursor-pointer top-16 md:top-14 px-1.5 md:px-3 py-1 bg-[#6AB8FA] rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] border-2 border-black flex justify-center items-center">
          <TiTick size={30} />
          <h1 className="font-[Jost-Medium] text-[16px]">Shortlist</h1>
        </div>
      )}

      {/* --- Profile Header Section --- */}
      <div className=" flex-col flex md:flex-row justify-center gap-4 md:gap-10 items-start w-full px-4">
        <img className="w-[180px] h-[180px] rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] object-cover" src={img} alt="Student profile" />
        <div className="flex flex-col justify-center gap-2 items-start w-[90%] md:w-[55%]">
          <h1 className="font-[BungeeInline] text-3xl">{name}</h1>
          <h1 className="font-[Jost-Regular] flex flex-wrap gap-x-7 gap-y-1 text-base text-[#00000089]">
            <span>{phone}</span>
            <span>{email}</span>
          </h1>
          <div className="w-[150px] h-[39px] flex items-center justify-center font-[Jost-Medium] text-[20px] bg-[#E3FEAA] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] cursor-pointer">
            Resume
          </div>
          <p className="font-[Jost-Medium] text-[16px] text-[#00000090]">{bio}</p>
        </div>
      </div>

      {/* --- Skills Section --- */}
      <div className="flex flex-col gap-3 w-[95%] flex-wrap mb-5 mt-5">
        <h1 className="font-[Jost-Medium] text-[27px]">Skills:</h1>
        <div className="flex gap-5 flex-wrap">
          {skills.map((skill, index) => (
            <div key={index} className="px-4 py-2 bg-[#FFFFF3] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] flex justify-between items-center font-[Jost-Bold] text-[16px] text-[#000000b7]">
              {skill}
            </div>
          ))}
        </div>
      </div>

      {/* --- Experience Section --- */}
      <div className="flex flex-col gap-3 w-[95%] flex-wrap mb-5">
        <h1 className="font-[Jost-Medium] text-[27px]">Experience :</h1>
        <div className="flex flex-row gap-5 flex-wrap">
          {experiences.map((exp) => (
            <div key={exp.id} className="w-[300px] h-auto bg-white border-2 border-black rounded-[8px] p-3 text-[12px] flex flex-col font-[Jost-Regular] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]">
              <div>
                <p>Organization: <span className="font-[Jost-SemiBold]">{exp.organization}</span></p>
                <p className="mt-1">Position: <span className="font-[Jost-SemiBold]">{exp.position}</span></p>
                <p className="mt-1">Timeline: <span className="font-[Jost-SemiBold]">{exp.timeline}</span></p>
              </div>
              <div className="mt-1">
                <p className="leading-snug">Description: <span>{exp.description}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Projects Section --- */}
      <div className="flex flex-col gap-3 w-[95%] flex-wrap mb-5">
        <h1 className="font-[Jost-Medium] text-[27px]">Projects :</h1>
        <div className="flex flex-row gap-5 flex-wrap">
          {projects.map((proj) => (
            <div key={proj.id} className="w-[300px] h-auto bg-white border-2 border-black rounded-[8px] p-3 text-[12px] flex flex-col font-[Jost-Regular] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]">
              <div>
                <p>Name of Project: <span className="font-[Jost-SemiBold]">{proj.name}</span></p>
                <p className="mt-1">
                  Link: <a href={proj.link} target="_blank" rel="noopener noreferrer" className="font-[Jost-SemiBold] text-blue-600 hover:underline">View Project</a>
                </p>
              </div>
              <div className="mt-1">
                <p className="leading-snug">Description: <span>{proj.description}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- College Section --- */}
      <div className="flex flex-col gap-3 w-[95%] flex-wrap mb-5">
        <h1 className="font-[Jost-Medium] text-[27px]">College :</h1>
        <div className="w-full bg-white border-2 border-black rounded-[8px] p-4 text-[14px] flex flex-col gap-1 font-[Jost-Regular] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]">
          <p>College Name: <span className="font-[Jost-SemiBold]">{college.name}</span></p>
          <p>University: <span className="font-[Jost-SemiBold]">{college.university}</span></p>
          <p>Degree: <span className="font-[Jost-SemiBold]">{college.degree}</span></p>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;

