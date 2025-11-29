import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import apiService from "../services/apiService";
import { uploadCompanyLogo } from "../services/firebaseService";

function CompanyProfile() {
  const { userData, currentUser } = useAuth();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!currentUser?.uid) {
          throw new Error("User not authenticated");
        }

        console.log("Fetching company data for UID:", currentUser.uid);

        // Use the public endpoint that doesn't require authentication
        const response = await apiService.getCompanyByUID(currentUser.uid);

        if (response.success && response.data) {
          setCompanyData(response.data);
          console.log("Company data fetched successfully:", response.data);
        } else {
          throw new Error(response.message || "Failed to fetch company data");
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
        setError(error.message);

        // Set fallback data if available from userData
        if (userData || currentUser) {
          setCompanyData({
            company: {
              name: userData?.companyName || "Your Company",
              description: "Company description not available",
              website: "",
              industry: "Not specified",
              size: "Not specified",
              founded: "Not specified",
              location: {
                city: "Not specified",
                address: "",
                state: "",
                country: "",
                zipcode: "",
              },
            },
            recruiter: {
              name: userData?.name || currentUser?.displayName || "User",
              email: userData?.email || currentUser?.email || "Not specified",
              designation: "Not specified",
            },
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [userData, currentUser]);

  if (loading) {
    return (
      <div className="pt-20 px-5 md:pt-5 flex flex-col items-center lg:items-center">
        <div className="w-full md:w-[600px] lg:w-[830px] md:h-auto lg:h-[540px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-lg font-medium">
              Loading company profile...
            </p>
          </div>
        </div>
      </div>
    );
  }
  // Get company and recruiter data with fallbacks
  const company = companyData?.company || {};
  const recruiter = companyData?.recruiter || {};

  return (
    <div className="pt-20 px-5 md:pt-5 flex flex-col items-center lg:items-center">
      <h1 className="font-[BungeeShade] text-3xl mb-2">COMPANY INFO</h1>

      {error && (
        <div className="w-full md:w-[600px] lg:w-[830px] mb-4 p-4 bg-red-100 border-2 border-red-400 rounded-[10px] text-red-700">
          <p>Error loading company data: {error}</p>
          <p className="text-sm mt-2">Showing available information...</p>
        </div>
      )}

      <div className="w-full h-auto custom-scrollbar overflow-y-auto md:w-[600px] lg:w-[830px] md:h-auto lg:h-[540px] p-8 bg-[#FBF3E7] relative border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-[10px] flex flex-col items-start justify-start gap-5">
        <div className="flex flex-col md:flex-row justify-start items-center md:items-start md:gap-10 w-full">
          <div className="relative w-[200px] h-[160px] rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] object-contain border-2 border-black">
            <img
              className="w-full h-full object-cover"
              src={company.logo || "/images/Googlelogo.webp"}
              alt={`${company.name || "Company"} Logo`}
            />
            <button
              className="absolute top-2 right-2 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
              onClick={() => {
                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = "image/*";
                fileInput.onchange = async (e) => {
                  const file = e.target.files[0];
                  if (file && file.size <= 1.2 * 1024 * 1024) {
                    try {
                      // Show loading state or optimistic update if needed
                      // For now, we'll just upload and then update

                      // 1. Upload to Firebase Storage
                      const logoUrl = await uploadCompanyLogo(
                        file,
                        company.name || "Company"
                      );

                      if (logoUrl) {
                        // 2. Update Backend
                        const updateResponse = await apiService.updateCompany(
                          companyData.recruiter.id, // Assuming recruiter ID is used for updates or we need company ID
                          { logo: logoUrl }
                        );

                        if (updateResponse.success) {
                          // 3. Update Local State
                          setCompanyData((prev) => ({
                            ...prev,
                            company: {
                              ...prev.company,
                              logo: logoUrl,
                            },
                          }));
                          alert("Logo updated successfully!");
                        } else {
                          throw new Error("Failed to update company profile");
                        }
                      }
                    } catch (err) {
                      console.error("Error updating logo:", err);
                      alert(`Failed to update logo: ${err.message}`);
                    }
                  } else {
                    alert("File size must be less than 1.2 MB");
                  }
                };
                fileInput.click();
              }}
            >
              ✏️
            </button>
          </div>
          <div className="flex flex-col justify-center gap-3 items-center md:items-start w-[90%] md:w-[55%]">
            <h1 className="font-[Jost-ExtraBold] text-5xl">
              {company.name || "Your Company"}
            </h1>
            <h1 className="font-[Jost-Regular] flex flex-wrap gap-x-7 gap-y-1 text-xl text-[#00000089]">
              <span>{recruiter.email || "company@email.com"}</span>
            </h1>
            {company.website && (
              <div
                className="px-5 py-2 flex gap-2 items-center justify-center font-[Jost-Bold] text-[20px] bg-[#FFFFF3] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] cursor-pointer hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 ease-out"
                onClick={() => window.open(company.website, "_blank")}
              >
                <span className="flex justify-center items-center gap-2">
                  <img
                    className="w-[40px]"
                    src="/images/arrow.png"
                    alt="arrow icon"
                  />
                  <h1>WEBSITE</h1>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col items-start justify-center px-2 md:px-8 mt-4">
          <h2 className="font-[Jost-Bold] text-2xl mb-4">Company Details :</h2>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 font-[Jost-Regular] text-lg">
            <p>
              <span className="font-[Jost-Medium]">Industry :</span>{" "}
              {company.industry || "Not specified"}
            </p>
            <p>
              <span className="font-[Jost-Medium]">Company Size :</span>{" "}
              {company.size || "Not specified"}
            </p>
            <p>
              <span className="font-[Jost-Medium]">Founded :</span>{" "}
              {company.founded || "Not specified"}
            </p>
            <p>
              <span className="font-[Jost-Medium]">Location :</span>{" "}
              {company.location?.city || company.location || "Not specified"}
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col items-start justify-center px-2 md:px-8 mt-4">
          <h2 className="font-[Jost-Bold] text-2xl mb-4">Address :</h2>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 font-[Jost-Regular] text-lg">
            <p>
              <span className="font-[Jost-Medium]">Street :</span>{" "}
              {company.location?.address &&
                company.location.address.trim() !== ""
                ? company.location.address
                : "Not provided during registration"}
            </p>
            <p>
              <span className="font-[Jost-Medium]">City :</span>{" "}
              {company.location?.city && company.location.city.trim() !== ""
                ? company.location.city
                : "Not specified"}
            </p>
            <p>
              <span className="font-[Jost-Medium]">State :</span>{" "}
              {company.location?.state && company.location.state.trim() !== ""
                ? company.location.state
                : "Not specified"}
            </p>
            <p>
              <span className="font-[Jost-Medium]">Country :</span>{" "}
              {company.location?.country &&
                company.location.country.trim() !== ""
                ? company.location.country
                : "Not specified"}
            </p>
            <p>
              <span className="font-[Jost-Medium]">Pincode :</span>{" "}
              {company.location?.zipcode &&
                company.location.zipcode.trim() !== ""
                ? company.location.zipcode
                : "Not specified"}
            </p>
          </div>
        </div>

        <div className="w-full px-2 md:px-8">
          <h2 className="font-[Jost-Bold] text-2xl mb-4">Description :</h2>
          <p className="font-[Jost-Regular] text-lg text-[#00000090]">
            {company.description ||
              "No company description available. Please update your company profile to add a description."}
          </p>
        </div>

        <div className="w-full px-2 md:px-8">
          <h2 className="font-[Jost-Bold] text-2xl mb-4">
            Recruiter Information :
          </h2>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 font-[Jost-Regular] text-lg">
            <p>
              <span className="font-[Jost-Medium]">Name :</span>{" "}
              {recruiter.name || "Not specified"}
            </p>
            <p>
              <span className="font-[Jost-Medium]">Email :</span>{" "}
              {recruiter.email || "Not specified"}
            </p>
            <p>
              <span className="font-[Jost-Medium]">Position :</span>{" "}
              {recruiter.position || recruiter.designation || "Not specified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;
