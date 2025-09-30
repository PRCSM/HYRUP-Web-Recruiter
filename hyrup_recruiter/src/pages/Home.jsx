import React from "react";
import CircularProgress from "../components/CircularProgress";
import { FaPlus } from "react-icons/fa";
import { FaMapLocation } from "react-icons/fa6";
import { BsArrowRightSquare } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const companyDescription = `Google LLC is an American multinational technology company
that specializes in Internet-related services and products, which include online advertising technologies, a search engine, cloud computing, software, and hardware. It is considered one of the Big Five technology companies in the U.S. information`;

const totalJobs = 5;
const totalApplications = 85;
const shortlisted = 40;

const applicationJobRate =
  totalJobs > 0 ? Math.round((shortlisted / totalApplications) * 100) : 0;

const jobs = [
  { title: "UI/UX Designer", location: "California, USA", applicants: 12 },
  { title: "Web Developer", location: "New York, USA", applicants: 20 },
  { title: "App Developer", location: "Austin, USA", applicants: 15 },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#FFFFF3] w-screen min-h-screen select-none overflow-x-hidden">
      <div className="flex-col pt-20 lg:pt-0 lg:flex-row flex justify-between items-center px-10">
        <div className="hidden lg:block w-[220px] h-screen bg-[#FFFFF3]"></div>
        <div>
          <div className="scale-[90%] flex flex-col justify-center items-center lg:items-start">
            <h1 className="font-[BungeeShade] text-3xl">COMPANY INFO</h1>
            <div className="flex flex-col w-[504px] h-[274px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] p-4 mt-3">
              <div className="flex justify-between">
                <div className="w-[120px] h-[98px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex justify-center items-center">
                  <img
                    className="w-[59px] h-[59px]"
                    src="public/images/Googlelogo.webp"
                    alt=""
                  />
                </div>
                <div className="flex flex-col justify-start text-left">
                  <h1 className="font-[Jost-ExtraBold] text-[40px]">Google</h1>
                  <p className="font-[Jost-Regular] text-xl text-[#00000086]">
                    google@gmail.com
                  </p>
                </div>
                <div>
                  <button className="bg-[#FFFFF3] hover:bg-[#fefee6] border-2 rounded-[10px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] flex items-center justify-center cursor-pointer w-[73px] h-[58px]">
                    <img src="public/images/arrow.png" alt="" />
                  </button>
                </div>
              </div>
              <div>
                <p
                  className="font-[Jost-Medium] text-lg mt-4 overflow-hidden text-ellipsis"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 4, // Show up to 4 lines
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  title={companyDescription}
                >
                  {companyDescription}
                </p>
              </div>
            </div>
          </div>
          <div className=" flex flex-col justify-center items-center lg:items-start scale-[80%] lg:scale-90">
            <h1 className="font-[BungeeShade] text-3xl">STATS</h1>
            <div className="flex flex-col w-[556px] h-[274px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] p-4 mt-3">
              <div className="flex justify-between">
                <div className="flex justify-center gap-2 flex-col items-center">
                  <div className="w-[129px] h-[85px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex justify-center items-center p-4">
                    <h1 className="font-[BungeeInline] text-[40px]">
                      {totalJobs}
                    </h1>
                  </div>
                  <h1 className="font-[Jost-ExtraBold] text-xl">Total Jobs</h1>
                </div>
                <div className="flex justify-center gap-2 flex-col items-center">
                  <div className="w-[129px] h-[85px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex justify-center items-center p-4">
                    <h1 className="font-[BungeeInline] text-[40px]">
                      {totalApplications}
                    </h1>
                  </div>
                  <h1 className="font-[Jost-ExtraBold] text-xl">
                    Total Application
                  </h1>
                </div>
                <div className="flex justify-center gap-2 flex-col items-center">
                  <div className="w-[129px] h-[85px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex justify-center items-center p-4">
                    <h1 className="font-[BungeeInline] text-[40px]">
                      {shortlisted}
                    </h1>
                  </div>
                  <h1 className="font-[Jost-ExtraBold] text-xl">Shortlisted</h1>
                </div>
              </div>
              <hr className="border-t-4 mt-3 border-gray-800" />
              <div className="flex justify-center gap-30 items-center">
                <div className="flex flex-col justify-center items-center">
                  <h1 className="font-[BungeeShade] text-[40px]">
                    {applicationJobRate}%
                  </h1>
                  <h1 className="font-[Jost-ExtraBold] text-xl">
                    Application/Job Rates
                  </h1>
                </div>
                <div className="flex mt-2 justify-center items-center">
                  <CircularProgress percentage={applicationJobRate} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-10 flex flex-col justify-center items-center lg:items-start">
          <h1 className="font-[BungeeShade] text-3xl mb-2">COMPANY INFO</h1>
          <div className="w-[356px] h-[473px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex flex-col justify-center items-center gap-10">
            <div className="flex flex-col justify-center items-center gap-10">
              {jobs.map((job, idx) => (
                <div
                  key={idx}
                  className="w-[314px] h-[82px] bg-[#FBF3E7] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] cursor-pointer py-3 px-5 flex justify-between items-center
                  hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-2px] hover:translate-y-[-2px] 
                transition-all duration-200 ease-out active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]"
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
            <button
              className="w-[240px] h-[45px] bg-[#E3FEAA] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-2px] hover:translate-y-[-2px] 
                transition-all duration-200 ease-out active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] cursor-pointer border-2 border-black  rounded-[10px] py-3 px-5 flex justify-center gap-4 items-center"
              onClick={() => navigate("/Application")}
            >
              <h1 className="font-[Jost-Medium]  text-[16px]">Show all</h1>
              <BsArrowRightSquare className="text-3xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
