import React, { useState, useEffect } from "react";
import Applicants from "../components/Applicants";
import Intership from "../components/Intership";
import { useAuth } from "../hooks/useAuth";
import apiService from "../services/apiService";

function Application() {
  const { userData } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch jobs and applications from API
  useEffect(() => {
    const fetchJobsAndApplications = async () => {
      if (!userData?.companyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch company jobs with applications
        const jobsResponse = await apiService.getCompanyJobs(
          userData.companyId._id
        );
        const applicationsResponse = await apiService.getApplications();

        const jobs = jobsResponse.jobs || [];
        const allApplications = applicationsResponse.opportunities || [];

        // Map applications to their respective jobs
        const jobsWithApplications = jobs.map((job) => {
          const jobApplications = allApplications.filter(
            (app) => app.job._id === job._id
          );
          return {
            ...job,
            id: job._id, // For compatibility with existing component
            applicants: jobApplications.map((app) => ({
              id: app._id,
              name: app.candidate?.profile?.FullName || "Unknown",
              email: app.candidate?.email || "",
              profilePicture:
                app.candidate?.profile?.profilePicture ||
                "/public/images/profile.png",
              skills: Object.keys(app.candidate?.user_skills || {}),
              experience: app.candidate?.experience || [],
              status: app.status || "applied",
              appliedAt: app.createdAt,
              matchScore: app.matchScore || 0,
              ...app,
            })),
          };
        });

        setJobs(jobsWithApplications);
      } catch (error) {
        console.error("Error fetching jobs and applications:", error);
        setError("Failed to load applications data");
        // Set fallback empty state
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsAndApplications();
  }, [userData]);

  // Update an applicant's status both locally and on the server
  const handleUpdateApplicantStatus = async (jobId, applicantId, newStatus) => {
    try {
      // Update on server first
      await apiService.updateApplicationStatus(applicantId, newStatus);

      // Update local state if API call succeeds
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
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update application status. Please try again.");
    }
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

  if (loading) {
    return (
      <div className="bg-[#FFFFF3] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFF3] w-full h-screen select-none overflow-x-hidden">
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-100 border-2 border-red-400 rounded-[10px] p-4">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        {jobs.length === 0 && !error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center bg-[#FBF3E7] border-2 border-black rounded-[10px] p-8 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]">
              <h2 className="text-2xl font-[BungeeShade] mb-4">
                No Jobs Posted Yet
              </h2>
              <p className="text-gray-600 mb-4">
                Start by posting a job to see applications here.
              </p>
              <button
                onClick={() => (window.location.href = "/postjob")}
                className="px-6 py-3 bg-white border-2 border-black rounded-[10px] font-[Jost-Medium] 
                         hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-1px] hover:translate-y-[-1px] 
                         transition-all duration-200"
              >
                Post Your First Job
              </button>
            </div>
          </div>
        ) : (
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
              {jobs[selectedIdx] && (
                <Applicants
                  selectedJob={jobs[selectedIdx]}
                  onUpdateStatus={handleUpdateApplicantStatus}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal view for small/medium screens (conditionally rendered) */}
      {showApplicantsModal && jobs[selectedIdx] && (
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
