import React, { useState, useEffect } from "react";
import CircularProgress from "../components/CircularProgress";
import { FaMapLocation } from "react-icons/fa6";
import { BsArrowRightSquare } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import apiService from "../services/apiService";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, currentUser } = useAuth();

  const [dashboardData, setDashboardData] = useState({
    company: null,
    jobs: [],
    applications: [],
    stats: {
      totalJobs: 0,
      totalApplications: 0,
      shortlisted: 0,
      applicationJobRate: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoUrl, setLogoUrl] = useState("public/images/default-logo.webp");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch company information using UID (public endpoint)
        const companyResponse = await apiService.getCompanyByUID(
          currentUser.uid
        );

        if (!companyResponse.success) {
          throw new Error(
            companyResponse.message || "Failed to fetch company data"
          );
        }

        // Extract company data
        const companyData = companyResponse.data?.company || null;
        const recruiterData = companyResponse.data?.recruiter || null;
        // extracted company and recruiter data (logging removed)

        // Set logo from company data
        if (companyData?.logo) {
          setLogoUrl(companyData.logo);
        }

        // Fetch jobs and applications for this recruiter if we have recruiter ID
        let jobs = [];
        let applications = [];

        if (recruiterData?.id) {
          try {
            const jobsResponse = await apiService.getJobsByRecruiter(
              recruiterData.id
            );
            if (jobsResponse.success) {
              jobs = jobsResponse.data || [];
            }

            // Fetch applications for this recruiter
            const applicationsResponse =
              await apiService.getApplicationsByRecruiter(recruiterData.id);
            if (applicationsResponse.success) {
              applications = applicationsResponse.data || [];
            }
          } catch {
            // Error fetching jobs or applications
            // Continue with empty arrays
          }
        }

        // Map applications to their respective jobs and calculate stats
        const jobsWithApplications = jobs.map((job) => {
          const jobApplications = applications.filter(
            (app) => app.job && app.job._id === job._id
          );
          return {
            ...job,
            applications: jobApplications,
            applicantCount: jobApplications.length,
          };
        });

        const totalJobs = jobs.length;
        const totalApplications = applications.length;
        const shortlisted = applications.filter(
          (app) => app.status === "shortlisted"
        ).length;
        const applicationJobRate =
          totalJobs > 0 ? Math.round((totalApplications / totalJobs) * 100) : 0;

        setDashboardData({
          company: companyData,
          jobs: jobsWithApplications.slice(0, 4), // Top 4 jobs for display
          applications,
          stats: {
            totalJobs,
            totalApplications,
            shortlisted,
            applicationJobRate,
          },
        });
      } catch (error) {
        // Error fetching dashboard data

        // Check if it's a "company not found" error vs other errors
        if (
          error.message?.includes("Company not found") ||
          error.message?.includes("not found")
        ) {
          setError(
            "No company profile found. Please complete your company registration first."
          );
        } else {
          setError(`Failed to load dashboard data: ${error.message}`);
        }

        // Set fallback data for unregistered companies
        setDashboardData({
          company: {
            name: "Complete Registration",
            description:
              "Please complete your company registration to see your dashboard data.",
            logo: "public/images/Googlelogo.webp",
          },
          jobs: [],
          applications: [],
          stats: {
            totalJobs: 0,
            totalApplications: 0,
            shortlisted: 0,
            applicationJobRate: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser?.uid, userData]);

  // Check if we returned from posting a job and refresh data
  useEffect(() => {
    if (location.state?.jobPosted) {
      // Clear the state to prevent repeated refreshes
      navigate(location.pathname, { replace: true });
      // The main useEffect will automatically refetch due to dependency changes
    }
  }, [location.state?.jobPosted, navigate, location.pathname]);


  if (loading) {
    return (
      <div className="bg-[#FFFFF3] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFF3] w-full h-screen select-none custom-scrollbar overflow-x-hidden p-4  sm:p-8">
      {error && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-red-100 border-2 border-red-400 rounded-[10px] p-4">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-center items-center md:items-start gap-8 w-full max-w-7xl mx-auto">
        <div className="hidden sm:block w-[220px] h-full bg-[#FFFFF3]"></div>

        <div className="flex pt-15 md:pt-0 flex-col justify-center items-center sm:items-end lg:justify-start lg:items-start gap-8 w-full lg:w-auto">
          {/* Company Info Card */}
          <div className="flex flex-col">
            <h1 className="font-[BungeeShade] text-3xl">COMPANY INFO</h1>
            <div className="w-full max-w-lg bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] p-4 mt-3">
              <div className="flex justify-between items-start">
                <div className="w-[100px] h-[80px] sm:w-[120px] sm:h-[98px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex justify-center items-center flex-shrink-0">
                  <img
                    className="w-[59px] h-[59px]"
                    src={logoUrl}
                    alt="Company Logo"
                  />
                </div>
                <div className="flex flex-col justify-start text-left ml-4 flex-grow">
                  <h1 className="font-[Jost-ExtraBold] text-3xl sm:text-[40px] break-words">
                    {dashboardData.company?.name || "Your Company"}
                  </h1>
                  <p className="font-[Jost-Regular] text-lg sm:text-xl text-[#00000086]">
                    {userData?.email}
                  </p>
                  {dashboardData.company?.industry && (
                    <p className="font-[Jost-Medium] text-sm text-[#00000086]">
                      {dashboardData.company.industry}
                    </p>
                  )}
                </div>
                <div>
                  <button
                    className="bg-[#FFFFF3] hover:bg-[#fefee6] border-2 rounded-[10px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] flex items-center justify-center cursor-pointer w-[60px] h-[50px] sm:w-[73px] sm:h-[58px]"
                    onClick={() => {
                      const site = dashboardData.company?.website;
                      if (!site) return;
                      const url = site.startsWith("http")
                        ? site
                        : `https://${site}`;
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    aria-label="Open company website"
                    title="Open company website"
                  >
                    <img src="public/images/arrow.png" alt="Arrow icon" />
                  </button>
                </div>
              </div>
              <div>
                <p
                  className="font-[Jost-Medium] text-base sm:text-lg mt-4 line-clamp-3"
                  title={dashboardData.company?.description}
                >
                  {dashboardData.company?.description &&
                    dashboardData.company.description.trim()
                    ? dashboardData.company.description
                    : "Company description will appear here once you complete your profile..."}
                </p>
                {/* Website is intentionally not displayed as a visible link.
                    The arrow button at the top-right opens the site in a new tab. */}
              </div>
            </div>
          </div>

          {/* Stats Card */}

          <div className="flex flex-col">
            <h1 className="font-[BungeeShade] text-3xl">STATS</h1>

            <div className="w-full max-w-lg bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] p-4 mt-3">
              <div className="flex justify-around flex-wrap gap-4">
                <div className="flex justify-center gap-2 flex-col items-center">
                  <div className="w-full min-w-[120px] h-[85px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex justify-center items-center p-4">
                    <h1 className="font-[BungeeInline] text-[40px]">
                      {dashboardData.stats.totalJobs}
                    </h1>
                  </div>
                  <h1 className="font-[Jost-ExtraBold] text-xl">Total Jobs</h1>
                </div>
                <div className="flex justify-center gap-2 flex-col items-center">
                  <div className="w-full min-w-[120px] h-[85px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex justify-center items-center p-4">
                    <h1 className="font-[BungeeInline] text-[40px]">
                      {dashboardData.stats.totalApplications}
                    </h1>
                  </div>
                  <h1 className="font-[Jost-ExtraBold] text-xl text-center">
                    Total Applications
                  </h1>
                </div>
                <div className="flex justify-center gap-2 flex-col items-center">
                  <div className="w-full min-w-[120px] h-[85px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex justify-center items-center p-4">
                    <h1 className="font-[BungeeInline] text-[40px]">
                      {dashboardData.stats.shortlisted}
                    </h1>
                  </div>
                  <h1 className="font-[Jost-ExtraBold] text-xl">Shortlisted</h1>
                </div>
              </div>
              <hr className="border-t-4 mt-5 border-gray-800" />
              {/* Changed: Centered and wrapping container for rates. */}
              <div className="flex flex-wrap justify-center sm:justify-around items-center gap-4 mt-3">
                <div className="flex flex-col justify-center items-center text-center">
                  <h1 className="font-[BungeeShade] text-[40px]">
                    {dashboardData.stats.applicationJobRate}%
                  </h1>
                  <h1 className="font-[Jost-ExtraBold] text-xl">
                    Application/Job Rate
                  </h1>
                </div>
                <div className="flex mt-2 justify-center items-center">
                  <CircularProgress
                    percentage={dashboardData.stats.applicationJobRate}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Column: Open Positions --- */}
        <div className="flex flex-col justify-center items-center sm:items-end lg:justify-center lg:items-center w-full lg:w-auto">
          <h1 className="font-[BungeeShade] text-3xl mb-2">OPEN POSITIONS</h1>
          <div className="w-full max-w-md bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex flex-col justify-between items-center gap-6 p-6">
            <div className="flex flex-col justify_center items-center gap-4 w-full">
              {dashboardData.jobs.length > 0 ? (
                dashboardData.jobs.map((job) => (
                  <div
                    key={job._id}
                    className="w-full bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] cursor-pointer py-3 px-5 flex justify-between items-center
                      hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-2px] hover:translate-y-[-2px] 
                      transition-all duration-200 ease-out active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]"
                    onClick={() => navigate(`/Application?jobId=${job._id}`)}
                  >
                    <div>
                      <h1 className="font-[Jost-Medium] text-[16px]">
                        {job.title}
                      </h1>
                      <div className="flex items-center mt-1">
                        <FaMapLocation />
                        <span className="font-[Jost-Regular] text-[14px] text-[#00000086] ml-2">
                          {job.preferences?.location || job.mode || "Remote"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center items-center text-center flex-shrink-0 ml-2">
                      <h1 className="font-[BungeeInline] text-[20px]">
                        {job.applicantCount || 0}
                      </h1>
                      <h1 className="font-[Jost-ExtraBold] text-[16px]">
                        Applicants
                      </h1>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] py-8 px-5 text-center">
                  <p className="font-[Jost-Medium] text-gray-600">
                    No jobs posted yet. Click "Post Job" to create your first
                    job listing!
                  </p>
                </div>
              )}
            </div>
            <button
              className="w-full max-w-xs bg-[#E3FEAA] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-2px] hover:translate-y-[-2px] 
                transition-all duration-200 ease-out active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] cursor-pointer border-2 border-black rounded-[10px] py-3 px-5 flex justify-center gap-4 items-center"
              onClick={() => navigate("/postjob")}
            >
              <h1 className="font-[Jost-Medium] text-[16px]">
                {dashboardData.jobs.length > 0 ? "Post New Job" : "Post Job"}
              </h1>
              <BsArrowRightSquare className="text-3xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
