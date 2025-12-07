import React, { useState } from "react";
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { useChat } from "../contexts/ChatContext";
import "../../src/index.css";

function StudentProfile({ applicant, onClose, onUpdateStatus, jobId }) {
  const navigate = useNavigate();
  const { addChat } = useChat();

  // Derive shortlisted state from applicant status
  const isShortlisted = applicant?.status === "shortlisted";

  const handleToggleShortlist = async () => {
    if (!onUpdateStatus || !jobId || !applicant?.id) return;

    // Toggle between shortlisted and rejected
    // If currently shortlisted, action is to reject
    // If currently anything else (applied, rejected), action is to shortlist
    const newStatus = isShortlisted ? "rejected" : "shortlisted";

    await onUpdateStatus(jobId, applicant.id, newStatus);

    // Note: The parent component (Application.jsx) updates the state, 
    // which will flow down here and update `applicant.status`
  };

  // If no applicant data is passed to the component, it renders nothing.
  // This prevents displaying an empty or broken modal.
  if (!applicant) {
    return null;
  }

  // Destructure the applicant object to easily access its properties.
  // Provide fallbacks for different backend shapes (e.g., `experience` vs `experiences`).
  const {
    name = "N/A",
    phone = "N/A",
    email = "N/A",
    bio = "No bio provided.",
    img = "https://i.pravatar.cc/150", // A default placeholder image
    resume = "", // Resume URL from backend
    // backend may return skills as array or as object under user_skills
    skills: skillsFromProp = [],
    user_skills: userSkillsObj = null,
    // experience may be sent as `experience` or `experiences`
    experiences: experiencesProp = [],
    experience: experienceProp = [],
    // projects may be under `projects` or `project`
    projects: projectsProp = [],
    project: projectProp = [],
    // college info sometimes under `college` or `education`
    college: collegeProp = null,
    education: educationProp = null,
  } = applicant;

  // Normalize skills - backend returns as object { skillName: { level: "beginner" } }
  const skills =
    userSkillsObj && typeof userSkillsObj === "object"
      ? Object.keys(userSkillsObj)
      : Array.isArray(skillsFromProp)
        ? skillsFromProp
        : [];

  // Normalize experience arrays
  const experiences =
    (Array.isArray(experiencesProp) &&
      experiencesProp.length &&
      experiencesProp) ||
    (Array.isArray(experienceProp) &&
      experienceProp.length &&
      experienceProp) ||
    [];

  // Normalize projects arrays
  const projects =
    (Array.isArray(projectsProp) && projectsProp.length && projectsProp) ||
    (Array.isArray(projectProp) && projectProp.length && projectProp) ||
    [];

  // Normalize college/education object
  const college = collegeProp || educationProp || {};

  // Debug logging
  console.log("StudentProfile resume:", { resume, applicant });

  return (
    <div className="w-[95vw] md:w-[700px] relative h-[550px] bg-[#FBF3E7] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] px-1 md:px-3 pt-14 custom-scrollbar flex flex-col justify-start items-center overflow-x-hidden z-50">
      {/* Close button that triggers the onClose function passed from the parent */}
      <div
        onClick={onClose}
        className="absolute top-3 right-3 p-2 bg-white border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] flex justify-center items-center cursor-pointer"
      >
        <RxCross2 size={15} />
      </div>

      {/* Conditional rendering for the Shortlist/Reject button based on its state */}
      {isShortlisted ? (
        <div
          onClick={handleToggleShortlist}
          className="absolute right-16 top-3 cursor-pointer px-1.5 md:px-3 py-1 bg-[#FEAAAB] rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] border-2 border-black flex justify-center items-center gap-1"
        >
          <RxCross2 size={25} />
          <h1 className="font-[Jost-Medium] text-[16px]">Reject</h1>
        </div>
      ) : (
        <div
          onClick={handleToggleShortlist}
          className="absolute right-16 top-3 cursor-pointer px-1.5 md:px-3 py-1 bg-[#6AB8FA] rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] border-2 border-black flex justify-center items-center"
        >
          <TiTick size={30} />
          <h1 className="font-[Jost-Medium] text-[16px]">Shortlist</h1>
        </div>
      )}

      {/* --- Profile Header Section --- */}
      <div className=" flex-col flex md:flex-row justify-center gap-4 md:gap-10 items-start w-full px-4">
        <img
          className="w-[180px] h-[180px] rounded-[10px] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] object-cover"
          src={img}
          alt="Student profile"
        />
        <div className="flex flex-col justify-center gap-2 items-start w-[90%] md:w-[55%]">
          <h1 className="font-[BungeeInline] text-3xl">{name}</h1>
          <h1 className="font-[Jost-Regular] flex flex-wrap gap-x-7 gap-y-1 text-base text-[#00000089]">
            <span>{phone}</span>
            <span>{email}</span>
          </h1>
          <div className="flex gap-4 justify-center items-center flex-wrap">
            {resume ? (
              <a
                href={resume}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[150px] h-[39px] flex items-center justify-center font-[Jost-Medium] text-[20px] bg-[#E3FEAA] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] cursor-pointer hover:bg-[#d4f091] transition-colors"
              >
                Resume
              </a>
            ) : (
              <div className="w-[150px] h-[39px] flex items-center justify-center font-[Jost-Medium] text-[20px] bg-gray-200 border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] cursor-not-allowed text-gray-500">
                No Resume
              </div>
            )}
            <div
              className="px-6 py-1 flex items-center justify-center font-[Jost-Medium] text-[20px] bg-orange-300 border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] cursor-pointer"
              onClick={async () => {
                await addChat({
                  ...applicant,
                  id: applicant.studentId || applicant.id
                });
                onClose?.();
                navigate("/chats");
              }}
            >
              Chat
            </div>
          </div>

          <p className="font-[Jost-Medium] text-[16px] text-[#00000090]">
            {bio}
          </p>
        </div>
      </div>

      {/* --- Skills Section --- */}
      <div className="flex flex-col gap-3 w-[95%] flex-wrap mb-5 mt-5">
        <h1 className="font-[Jost-Medium] text-[27px]">Skills:</h1>
        <div className="flex gap-5 flex-wrap">
          {skills.length ? (
            skills.map((skill, index) => (
              <div
                key={skill?.id || skill?.name || index}
                className="px-4 py-2 bg-[#FFFFF3] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] flex justify-between items-center font-[Jost-Bold] text-[16px] text-[#000000b7]"
              >
                {typeof skill === "string"
                  ? skill
                  : skill?.name || JSON.stringify(skill)}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No skills listed.</div>
          )}
        </div>
      </div>

      {/* --- Experience Section --- */}
      <div className="flex flex-col gap-3 w-[95%] flex-wrap mb-5">
        <h1 className="font-[Jost-Medium] text-[27px]">Experience :</h1>
        <div className="flex flex-row gap-5 flex-wrap">
          {experiences.length ? (
            experiences.map((exp, idx) => (
              <div
                key={exp.id || exp._id || idx}
                className="w-[300px] h-auto bg-white border-2 border-black rounded-[8px] p-3 text-[12px] flex flex-col font-[Jost-Regular] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]"
              >
                <div>
                  <p>
                    Organization:{" "}
                    <span className="font-[Jost-SemiBold]">
                      {exp.nameOfOrg ||
                        exp.organization ||
                        exp.company ||
                        exp.employer ||
                        "N/A"}
                    </span>
                  </p>
                  <p className="mt-1">
                    Position:{" "}
                    <span className="font-[Jost-SemiBold]">
                      {exp.position || exp.title || exp.role || "N/A"}
                    </span>
                  </p>
                  <p className="mt-1">
                    Timeline:{" "}
                    <span className="font-[Jost-SemiBold]">
                      {exp.timeline || exp.period || exp.fromTo || "N/A"}
                    </span>
                  </p>
                </div>
                <div className="mt-1">
                  <p className="leading-snug">
                    Description:{" "}
                    <span>
                      {exp.description || exp.summary || exp.details || ""}
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No experience provided.</div>
          )}
        </div>
      </div>

      {/* --- Projects Section --- */}
      <div className="flex flex-col gap-3 w-[95%] flex-wrap mb-5">
        <h1 className="font-[Jost-Medium] text-[27px]">Projects :</h1>
        <div className="flex flex-row gap-5 flex-wrap">
          {projects.length ? (
            projects.map((proj, idx) => (
              <div
                key={proj.id || proj._id || idx}
                className="w-[300px] h-auto bg-white border-2 border-black rounded-[8px] p-3 text-[12px] flex flex-col font-[Jost-Regular] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]"
              >
                <div>
                  <p>
                    Name of Project:{" "}
                    <span className="font-[Jost-SemiBold]">
                      {proj.projectName ||
                        proj.name ||
                        proj.title ||
                        "Untitled"}
                    </span>
                  </p>
                  <p className="mt-1">
                    Link:{" "}
                    {proj.link ? (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-[Jost-SemiBold] text-blue-600 hover:underline"
                      >
                        View Project
                      </a>
                    ) : (
                      <span className="text-gray-500">No link</span>
                    )}
                  </p>
                </div>
                <div className="mt-1">
                  <p className="leading-snug">
                    Description:{" "}
                    <span>{proj.description || proj.summary || ""}</span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No projects provided.</div>
          )}
        </div>
      </div>

      {/* --- College Section --- */}
      <div className="flex flex-col gap-3 w-[95%] flex-wrap mb-5">
        <h1 className="font-[Jost-Medium] text-[27px]">College :</h1>
        <div className="w-full bg-white border-2 border-black rounded-[8px] p-4 text-[14px] flex flex-col gap-1 font-[Jost-Regular] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]">
          <p>
            College:{" "}
            <span className="font-[Jost-SemiBold]">
              {college.college ||
                college.name ||
                college.collegeName ||
                college.institution ||
                "N/A"}
            </span>
          </p>
          <p>
            University Type:{" "}
            <span className="font-[Jost-SemiBold]">
              {college.universityType ||
                college.university ||
                college.univ ||
                "N/A"}
            </span>
          </p>
          <p>
            Degree:{" "}
            <span className="font-[Jost-SemiBold]">
              {college.degree ||
                college.degreeName ||
                college.qualification ||
                "N/A"}
            </span>
          </p>
          <p>
            Year of Passing:{" "}
            <span className="font-[Jost-SemiBold]">
              {college.yearOfPassing || "N/A"}
            </span>
          </p>
          {college.cgpa && (
            <p>
              CGPA: <span className="font-[Jost-SemiBold]">{college.cgpa}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
