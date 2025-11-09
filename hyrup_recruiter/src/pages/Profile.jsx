import React, { useEffect } from "react";
import CompanyProfile from "../components/CompanyProfile";

const Profile = () => {
  useEffect(() => {
    const fetchLogoFromLocalStorageAndCache = async () => {
      try {
        const localStorageLogo = localStorage.getItem("companyLogo");
        if (localStorageLogo) {
          setCompanyData((prev) => ({
            ...prev,
            company: {
              ...prev.company,
              logo: localStorageLogo,
            },
          }));
        } else if ("caches" in window) {
          const cache = await caches.open("logo-cache");
          const response = await cache.match(
            `/uploadedLogo/${localStorage.getItem("companyLogoName")}`
          );
          if (response) {
            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);
            setCompanyData((prev) => ({
              ...prev,
              company: {
                ...prev.company,
                logo: objectURL,
              },
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching logo from localStorage or cache:", error);
      }
    };

    fetchLogoFromLocalStorageAndCache();
  }, []);

  return (
    <div className="bg-[#FFFFF3] w-screen h-screen select-none overflow-x-hidden">
      <div className="flex justify-center items-center">
        <div className="hidden md:block w-[270px] h-screen bg-[#FFFFF3]"></div>

        <CompanyProfile />
      </div>
    </div>
  );
};

export default Profile;
