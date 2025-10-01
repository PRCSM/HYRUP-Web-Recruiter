import React, { useState, useEffect } from "react";
import StudentProfile from "./StudentProfile";
import { FaMapMarkerAlt, TiTick, RxCross2 } from "../assets/Icons";

// A custom hook to check for media queries in JavaScript
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
};


function Applicants({ selectedJob, onUpdateStatus, isModal = false, onClose }) {
  const [viewAll, setViewAll] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  
  // This is the key change: check if the screen is smaller than the 'md' breakpoint (768px)
  const isSmallScreen = useMediaQuery('(max-width: 767px)');


  // Reset local state when the selected job changes
  useEffect(() => {
    setViewAll(false);
    setSelectedApplicant(null);
  }, [selectedJob]);

  // Placeholder for desktop view when no job is selected
  if (!selectedJob) {
    return (
      <div className="hidden lg:block">
        <h1 className="font-[BungeeShade] text-[32px] mb-4">APPLICANTS</h1>
        <div className="w-[500px] h-[520px] bg-[#FBF3E7] border-2 border-black rounded-[18px] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.7)] flex items-center justify-center">
          <span className="text-[20px] text-[#888] font-[Jost-Semibold] text-center">
            Select a Job To See Applicants
          </span>
        </div>
      </div>
    );
  }

  const applicants = selectedJob.applicants || [];

  const handleStatusToggle = (e, applicantId, currentStatus) => {
    e.stopPropagation(); // Prevents the profile modal from opening
    const newStatus = currentStatus === "accepted" ? "rejected" : "accepted";
    onUpdateStatus(selectedJob.id, applicantId, newStatus);
  };

  // Reusable component for rendering a single applicant card
  const renderApplicantCard = (app) => (
    <div key={app.id} onClick={() => setSelectedApplicant(app)} className="w-full h-[90px] bg-[#FFFFF3] border-2 border-black rounded-[12px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] flex items-center px-4 justify-between cursor-pointer hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-shadow">
        <div className="flex items-center gap-3 overflow-hidden">
            <img src={app.img} alt={app.name} className="w-[55px] h-[55px] rounded-full border border-black flex-shrink-0" />
            <div className="overflow-hidden">
                <h3 className="font-[Jost-Medium] text-[16px]">{app.name}</h3>
                <p className="text-sm font-[Jost-Regular] text-gray-500 truncate">{app.desc}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-green-600 font-[Jost-Regular] text-[16px]">{app.match}%</span>
            <button onClick={(e) => handleStatusToggle(e, app.id, app.status)} className={`w-[35px] h-[35px] flex items-center justify-center border-2 border-black rounded-md shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] cursor-pointer ${app.status === "accepted" ? "bg-[#C8F7C5]" : "bg-white"}`}>
                {app.status === "accepted" ? <TiTick size={20} /> : <RxCross2 size={20} />}
            </button>
        </div>
    </div>
  );
  
  // This is the content for the "View All" modal/overlay
  const ViewAllContent = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-40 p-4">
        <div className="w-full max-w-4xl h-[90vh] max-h-[700px] bg-[#FBF3E7] border-2 border-black rounded-[10px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="font-[Jost-Medium] text-[20px]">{selectedJob.title}</h2>
                    <div className="flex items-center font-[Jost-Medium] text-sm text-gray-600">
                        <FaMapMarkerAlt className="mr-1" />{selectedJob.location}
                    </div>
                </div>
                <button onClick={() => setViewAll(false)} className="bg-red-400 font-[Jost-Medium] text-white px-4 py-1 border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] cursor-pointer hover:bg-red-500 transition-all">
                    Close
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 flex-1">
                {applicants.map(renderApplicantCard)}
            </div>
        </div>
    </div>
  );

  // This is the content for the compact, default view
  const CompactContent = () => {
    // Conditionally show all applicants or just the first 4 based on screen size
    const applicantsToShow = isSmallScreen ? applicants : applicants.slice(0, 4);

    return (
        <div className="w-full h-full bg-[#FBF3E7] border-2 border-black rounded-[10px] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.7)] p-6 flex flex-col gap-5">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="font-[Jost-Medium] text-[20px]">{selectedJob.title}</h2>
                    <div className="flex items-center font-[Jost-Medium] text-sm text-gray-600">
                        <FaMapMarkerAlt className="mr-1" />{selectedJob.location}
                    </div>
                </div>
                {/* Logic to show the correct button */}
                {isModal ? (
                    <button onClick={onClose} className="bg-red-400 font-[Jost-Medium] text-white px-4 py-1 border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] hover:bg-red-500">Close</button>
                ) : !isSmallScreen ? ( // Only show "View All" on desktop and screens larger than 'md'
                    <button onClick={() => setViewAll(true)} className="bg-[#6AB8FA] font-[Jost-Medium] text-white px-4 py-1 border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]">View All</button>
                ) : null}
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto py-2 pr-2 flex-1">
                {applicantsToShow.map(renderApplicantCard)}
            </div>
        </div>
    );
  };

  // Main render logic for the component
  const applicantContent = (
    <>
      {viewAll ? <ViewAllContent /> : <CompactContent />}

      {/* Renders the Student Profile Modal when an applicant card is clicked */}
      {selectedApplicant && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
              <StudentProfile applicant={selectedApplicant} onClose={() => setSelectedApplicant(null)} />
          </div>
      )}
    </>
  );

  // If `isModal` is true (on mobile), wrap in a modal structure
  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-40 p-4">
          <div className="w-full max-w-4xl h-[90vh] max-h-[700px]">
              {applicantContent}
          </div>
      </div>
    );
  }
  
  // Otherwise, return the standard desktop view
  return (
    <div>
        <h1 className="font-[BungeeShade] text-[32px] mb-4">APPLICANTS</h1>
        <div className="w-[500px] h-[520px]">
            {applicantContent}
        </div>
    </div>
  );
}

export default Applicants;