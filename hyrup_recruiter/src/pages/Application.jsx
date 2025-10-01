import React, { useState, useEffect } from "react";
import Applicants from "../components/Applicants";
import Intership from "../components/Intership";
import allJobsData from "../demodata/Jobs.json"; // <-- Imports your JSON file

function Application() {
  const [jobs, setJobs] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);

  // This hook runs once to initialize data from your JSON file.
  useEffect(() => {
    const initializedJobs = allJobsData.map((job) => ({
      ...job,
      applicants: job.applicants.map((applicant) => ({
        ...applicant,
        status: applicant.status || "rejected",
      })),
    }));
    setJobs(initializedJobs);
  }, []);

  // Single function to update an applicant's status in the main state.
  const handleUpdateApplicantStatus = (jobId, applicantId, newStatus) => {
    setJobs((currentJobs) =>
      currentJobs.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            applicants: job.applicants.map((applicant) =>
              applicant.id === applicantId
                ? { ...applicant, status: newStatus }
                : applicant
            ),
          };
        }
        return job;
      })
    );
  };
  
  // This function is called when a job card is clicked.
  const handleJobSelect = (idx) => {
    setSelectedIdx(idx);
    // On any screen, set this to true to trigger the modal on smaller devices.
    setShowApplicantsModal(true);
  };

  // Prepares a simplified list of jobs for the Intership component.
  const jobPostings = jobs.map((job) => ({
    title: job.title,
    location: job.location,
    applicants: job.applicants.length,
  }));

  return (
    <div className="bg-[#FFFFF3] w-full h-screen select-none overflow-x-hidden">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-center items-center lg:items-start lg:gap-12">
          <div className="hidden md:block w-[220px] h-screen bg-[#FFFFF3]"></div>
          <div className="pt-10 md:pt-0">
            <Intership
            jobs={jobPostings}
            selectedIdx={selectedIdx}
            onJobSelect={handleJobSelect}
          />
          </div>
          
          
          {/* Static view for large screens (hidden on smaller screens) */}
          <div className="hidden lg:block mt-8 lg:mt-0">
            <Applicants
              selectedJob={jobs[selectedIdx]}
              onUpdateStatus={handleUpdateApplicantStatus}
            />
          </div>
        </div>
      </div>

      {/* Modal view for small/medium screens (conditionally rendered) */}
      {showApplicantsModal && (
        <div className="lg:hidden">
          <Applicants
            isModal={true}
            selectedJob={jobs[selectedIdx]}
            onUpdateStatus={handleUpdateApplicantStatus}
            onClose={() => setShowApplicantsModal(false)}
          />
        </div>
      )}
    </div>
  );
}

export default Application;