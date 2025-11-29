import React, { useState, useEffect } from "react";
import Applicants from "../components/Applicants";
import Intership from "../components/Intership";
import { useAuth } from "../hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import apiService from "../services/apiService";

function Application() {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recruiterId, setRecruiterId] = useState(null);

  // Get job ID from URL parameters
  const jobIdFromUrl = searchParams.get("jobId");

  // Fetch jobs and applications from API
  useEffect(() => {
    const fetchJobsAndApplications = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First get the recruiter ID
        const companyResponse = await apiService.getCompanyByUID(
          currentUser.uid
        );

        if (!companyResponse.success) {
          throw new Error(companyResponse.message || "Company not found");
        }

        const recruiterData = companyResponse.data?.recruiter;
        if (!recruiterData?.id) {
          throw new Error("Recruiter information not found");
        }

        setRecruiterId(recruiterData.id);

        // Fetch jobs by recruiter ID
        const jobsResponse = await apiService.getJobsByRecruiter(
          recruiterData.id
        );
        const jobs = jobsResponse.success ? jobsResponse.data || [] : [];

        // Fetch applications for each job individually to ensure we get all applicants
        // regardless of the recruiter's activeJobs array state
        const applicationsPromises = jobs.map((job) =>
          apiService
            .getApplicationsByJob(job._id || job.id)
            .then((res) => (res.success ? res.data || [] : []))
            .catch((err) => {
              console.error(`Failed to fetch apps for job ${job._id}:`, err);
              return [];
            })
        );

        const applicationsArrays = await Promise.all(applicationsPromises);
        const allApplications = applicationsArrays.flat();

        // fetched jobs and applications (logging removed)

        setApplications(allApplications);

        // Fetch detailed student profiles for all applicants (deduped) and merge into applicant objects
        const studentIdForApp = (app) =>
          app.candidate?._id ||
          app.candidate?.id ||
          app.candidateId ||
          app.profile?._id ||
          app.userId;

        // collect unique student ids
        const studentIdSet = new Set();
        allApplications.forEach((app) => {
          const sid = studentIdForApp(app);
          if (sid) studentIdSet.add(sid);
        });

        const studentIds = Array.from(studentIdSet);
        const studentMap = {}; // id -> details

        if (studentIds.length > 0) {
          // fetch in parallel with graceful error handling
          await Promise.all(
            studentIds.map(async (sid) => {
              try {
                const resp = await apiService.getStudentById(sid);
                // API returns { success: true, student: {...} } per docs
                const data =
                  resp && (resp.student || resp.data || resp.user || resp);
                if (resp && resp.success && data) {
                  studentMap[sid] = data;
                }
              } catch (err) {
                // Failed to fetch student details for sid; ignore and continue
                // leave studentMap[sid] undefined - we'll fall back to app data
              }
            })
          );
        }

        // Map applications to their respective jobs and merge student details
        const jobsWithApplications = jobs.map((job) => {
          const jobApplications = allApplications.filter(
            (app) => app.job && app.job._id === job._id
          );

          return {
            ...job,
            id: job._id, // For compatibility with existing component
            applicants: jobApplications.map((app) => {
              const sid = studentIdForApp(app);
              const studentData = sid ? studentMap[sid] : null;

              // helper to extract profile picture and basic fields from either app or studentData
              const profilePic =
                studentData?.profile?.profilePicture ||
                app.candidate?.profile?.profilePicture ||
                "/images/profile.png";

              const normalized = {
                id: app._id,
                studentId: sid, // Added studentId for ChatContext
                name:
                  studentData?.profile?.FullName ||
                  studentData?.profile?.fullName ||
                  studentData?.name ||
                  app.candidate?.name ||
                  app.candidate?.profile?.FullName ||
                  "Unknown",
                email: studentData?.email || app.candidate?.email || "",
                profilePicture: profilePic,
                img: profilePic,
                desc:
                  studentData?.profile?.bio ||
                  studentData?.profile?.about ||
                  app.candidate?.profile?.bio ||
                  app.candidate?.profile?.about ||
                  app.candidate?.email ||
                  "",
                resume:
                  studentData?.profile?.resume ||
                  studentData?.resume ||
                  app.candidate?.profile?.resume ||
                  app.resume ||
                  "",
                firebaseId:
                  studentData?.firebaseId ||
                  app.candidate?.firebaseId ||
                  app.firebaseId,
                skills: Array.isArray(studentData?.skills)
                  ? studentData.skills
                  : Object.keys(studentData?.user_skills || {}) ||
                  Object.keys(app.candidate?.user_skills || {}),
                experiences:
                  studentData?.experience ||
                  studentData?.experiences ||
                  app.candidate?.experience ||
                  [],
                projects: studentData?.projects || [],
                college: studentData?.college || studentData?.education || {},
                status: app.status || "applied",
                appliedAt: app.createdAt,
                matchScore: app.matchScore || 0,
                match: app.matchScore || 0,
                applicationId: app._id,
                applicationId: app._id,
                ...app,
              };

              if (normalized.name === "Harish Siddartha" || normalized.name === "User") {
                console.log("Application.jsx normalized:", {
                  name: normalized.name,
                  id: normalized.id,
                  studentId: normalized.studentId,
                  firebaseId: normalized.firebaseId,
                  candidateFirebaseId: app.candidate?.firebaseId
                });
              }

              return normalized;
            }),
          };
        });

        setJobs(jobsWithApplications);

        // If there's a job ID from URL, find and select that job
        if (jobIdFromUrl && jobsWithApplications.length > 0) {
          const jobIndex = jobsWithApplications.findIndex(
            (job) => job._id === jobIdFromUrl
          );
          if (jobIndex !== -1) {
            setSelectedIdx(jobIndex);
          }
        }
      } catch (error) {
        // Error fetching jobs and applications
        setError(`Failed to load applications data: ${error.message}`);
        // Set fallback empty state
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsAndApplications();
  }, [currentUser?.uid, jobIdFromUrl]);

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
      if (import.meta.env.DEV)
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

  // Handler called when a job is removed on the server. Update local state accordingly.
  const handleRemoveJob = (jobId) => {
    setJobs((currentJobs) => {
      const index = currentJobs.findIndex(
        (j) => j.id === jobId || j._id === jobId
      );
      const newJobs = currentJobs.filter(
        (j) => j.id !== jobId && j._id !== jobId
      );

      // Adjust selected index to a valid position
      setSelectedIdx((curIdx) => {
        if (newJobs.length === 0) return 0;
        if (index === -1) return curIdx; // removed job not found in current list
        if (index < curIdx) return Math.max(0, curIdx - 1);
        if (index === curIdx) return 0; // select first job if the selected one was removed
        return curIdx;
      });

      // Close any open applicants modal
      setShowApplicantsModal(false);
      return newJobs;
    });
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
                  onRemoveJob={handleRemoveJob}
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
            onRemoveJob={handleRemoveJob}
          />
        </div>
      )}
    </div>
  );
}

export default Application;
