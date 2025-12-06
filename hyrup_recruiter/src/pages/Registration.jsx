import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav_sign from "../components/Nav_sign";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import apiService from "../services/apiService";
import { uploadCompanyLogo } from "../services/firebaseService";

const Registration = () => {
  const navigate = useNavigate();
  const { currentUser, error, setError, loading, checkUserType } = useAuth();

  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    email: "",
    industry: "",
    street: "",
    city: "",
    pincode: "",
    state: "",
    country: "",
    companySize: "",
    foundedYear: "",
    description: "",
    logo: null,
    companyType: "",
    // Recruiter specific data
    recruiterName: "",
    phone: "",
    designation: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [showOtherIndustry, setShowOtherIndustry] = useState(false);
  const [registrationChecked, setRegistrationChecked] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const redirectTimeoutRef = React.useRef(null);

  // Check if user is already registered and redirect accordingly
  useEffect(() => {
    // Registration page mount - logging removed

    // Prevent multiple checks
    if (registrationChecked || isCheckingRegistration) {
      return;
    }

    const checkRegistrationStatus = async () => {
      if (!currentUser && !loading) {
        // User is not authenticated, redirect to signup.
        // Add a short debounce to avoid redirect flapping while auth state settles.
        redirectTimeoutRef.current = setTimeout(() => {
          // Only redirect if still on this page and still not authenticated
          if (!currentUser && !loading) {
            navigate("/signup");
            setRegistrationChecked(true);
          }
        }, 300);
        return;
      }

      if (currentUser && currentUser.uid && !loading) {
        setIsCheckingRegistration(true);

        try {
          const response = await apiService.checkUserRegistration(
            currentUser.uid
          );

          if (response.success && response.isRegistered) {
            // User is already registered - redirect

            // Mark that we've checked and redirect to home immediately
            setRegistrationChecked(true);
            navigate("/", { replace: true });
          } else {
            // User is not registered yet, showing registration form
            // User is authenticated but not registered, stay on registration page
          }
        } catch (error) {
          // Error checking registration status
          // If there's an error checking, let them try to register
        } finally {
          setIsCheckingRegistration(false);
          // If we didn't already set registrationChecked in the registered branch, set it now
          setRegistrationChecked((prev) => prev || true);
        }
      }
    };

    checkRegistrationStatus();
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [
    currentUser,
    loading,
    navigate,
    registrationChecked,
    isCheckingRegistration,
  ]);

  // Show loading while authentication is being processed or checking registration
  if (loading || isCheckingRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFF3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg font-medium">
            {loading ? "Loading..." : "Checking registration status..."}
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1.2 * 1024 * 1024) {
      // 1.2 MB limit
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }));

      // Display the uploaded image
      const reader = new FileReader();
      reader.onload = (event) => {
        const uploadedImage = event.target.result;
        setLogoPreview(uploadedImage);

        // Store the uploaded image in a cookie
        document.cookie = `uploadedLogo=${uploadedImage}; path=/; max-age=86400`; // Expires in 1 day

        // Store the uploaded image in web cache
        if ("caches" in window) {
          caches.open("logo-cache").then((cache) => {
            const blob = new Blob([uploadedImage], { type: file.type });
            const response = new Response(blob);
            cache.put(`/uploadedLogo/${file.name}`, response);
          });
        }

        // Store the uploaded image in localStorage
        localStorage.setItem("companyLogo", uploadedImage);
      };
      reader.readAsDataURL(file);
    } else {
      alert("File size must be less than 1.2 MB");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.companyName.trim())
      errors.companyName = "Company name is required";
    if (!formData.website.trim()) errors.website = "Website is required";
    if (!formData.email.trim()) errors.email = "Company email is required";
    if (!formData.description.trim())
      errors.description = "Company description is required";
    if (!formData.street.trim()) errors.street = "Street address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.pincode.trim()) errors.pincode = "Pincode is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.country.trim()) errors.country = "Country is required";
    if (!formData.recruiterName.trim())
      errors.recruiterName = "Your name is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.designation.trim())
      errors.designation = "Your designation is required";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Starting registration process

      const uid = currentUser?.uid;
      if (!uid) {
        throw new Error("User not authenticated");
      }

      const companyData = {
        companyName: formData.companyName.trim(),
        companyEmail: formData.email.trim(),
        companyType: formData.companyType || "Startup",
        website: formData.website.trim(),
        industry: formData.industry?.trim() || "",
        description: formData.description.trim(),
        location: {
          address: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country.trim(),
          zipcode: formData.pincode.trim(),
        },
        size: formData.companySize?.trim() || "",
        founded: formData.foundedYear
          ? parseInt(formData.foundedYear, 10)
          : undefined,
        recruiterName: formData.recruiterName.trim(),
        recruiterEmail: currentUser.email,
        recruiterPhone: formData.phone.trim(),
        position: formData.designation || "Recruiter",
        uid: uid,
      };

      // Upload logo if selected
      if (formData.logo) {
        try {
          const logoUrl = await uploadCompanyLogo(
            formData.logo,
            formData.companyName
          );
          companyData.logo = logoUrl;
        } catch (uploadError) {
          console.error("Logo upload failed:", uploadError);
          // Continue with registration even if logo upload fails, or handle as needed
          // For now, we'll alert the user but proceed (or you could throw to stop)
          if (!window.confirm("Logo upload failed. Do you want to continue without a logo?")) {
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Validate required fields before making API call
      if (
        !companyData.companyName ||
        !companyData.companyEmail ||
        !companyData.recruiterName ||
        !companyData.recruiterEmail ||
        !companyData.uid
      ) {
        throw new Error(
          "All required fields must be filled: Company Name, Company Email, Recruiter Name, and you must be signed in"
        );
      }

      const companyResponse = await apiService.registerCompany(companyData);

      // Update the AuthContext with the new user data after successful registration
      if (companyResponse.success && companyResponse.data) {
        // Force a re-check of user type in AuthContext
        try {
          await checkUserType();
        } catch (authError) {
          console.error(authError); // Log the error for debugging
        }
      }

      // Show success message
      alert("Registration successful! Welcome to Hyrup!");

      // Navigate to dashboard after a short delay to ensure state is updated
      setTimeout(() => {
        // Mark that we just registered so the auth handler can avoid immediate re-checks
        try {
          sessionStorage.setItem("hyrup:justRegistered", "1");
        } catch (err) {
          console.error(err); // Log the error for debugging
        }
        navigate("/", { replace: true });
      }, 500);
    } catch (error) {
      // Registration error

      // Provide more specific error messages
      let errorMessage = "Registration failed. Please try again.";

      if (
        error.message.includes("Failed to fetch") ||
        error.name === "TypeError"
      ) {
        errorMessage =
          "Cannot connect to server. Please ensure your backend server is running on port 3000.";
      } else if (error.message.includes("Network error")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-[#FFFFF3] min-h-screen w-full">
      <div>
        <Nav_sign />

        {/* Main Content */}
        <div className=" max-w-[97vw] md:max-w-[85vw] mx-auto px-6 py-6">
          {/* Form Container */}
          <div className="bg-[#FFFFF3] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] p-6">
            {/* Header Section */}
            <div className="text-center mb-6">
              <h1 className="text-3xl text-left md:text-6xl font-[BungeeShade] mb-3 text-black">
                REGISTER YOUR <br /> COMPANY
              </h1>
              <p className="text-base text-left md:text-lg font-[Jost-Medium] text-gray-600">
                Take your first step to simplify your hiring process and save
                time with{" "}
                <span className="text-[#6AB8FA] font-[BungeeShade]">Hyrup</span>
              </p>

              {error && (
                <div className="mt-4 p-4 bg-red-100 border-2 border-red-400 rounded-[10px] text-red-700">
                  {error}
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 pt-7">
              {/* Company Details Section */}
              <div className="flex flex-col md:flex-row justify-between">
                {/* Left Column */}
                <div className="flex flex-col space-y-4">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
                      Enter Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter the name of your Company"
                      className="w-full md:w-[300px] lg:w-[400px] px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                              focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                      required
                    />
                    {validationErrors.companyName && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.companyName}
                      </p>
                    )}
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="e.g., company.com or company.in"
                      className="w-full md:w-[300px] lg:w-[400px] px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                              focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                      required
                    />
                  </div>
                  {/* Industry */}
                  <div>
                    <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
                      Industry
                    </label>
                    <div className="relative w-full md:w-[300px] lg:w-[400px]">
                      <select
                        name="industry"
                        value={showOtherIndustry ? "Other" : formData.industry}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "Other") {
                            setShowOtherIndustry(true);
                            setFormData((prev) => ({ ...prev, industry: "" }));
                          } else {
                            setShowOtherIndustry(false);
                            setFormData((prev) => ({ ...prev, industry: value }));
                          }
                        }}
                        className="w-full px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                                focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200
                                appearance-none cursor-pointer font-[Jost-Regular] text-gray-700 pr-10"
                      >
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Media & Entertainment">Media & Entertainment</option>
                        <option value="Hospitality">Hospitality</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Telecommunications">Telecommunications</option>
                        <option value="Automotive">Automotive</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Energy">Energy</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {showOtherIndustry && (
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        placeholder="Enter your industry"
                        className="w-full md:w-[300px] lg:w-[400px] px-3 py-4 mt-2 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                                focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                      />
                    )}
                  </div>
                  {/* Company Size */}
                  <div>
                    <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
                      Company Size
                    </label>
                    <input
                      type="text"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                      placeholder="e.g., 1-10, 11-50, 51-200"
                      className="w-full md:w-[300px] lg:w-[400px] px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                              focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-2 mt-2 space-y-4">
                  {/* Company Email */}
                  <div>
                    <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
                      Enter Company Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter the email of your Company"
                      className="w-full md:w-[300px] lg:w-[400px] px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                              focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Company Type Dropdown */}
                  <div>
                    <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
                      Company Type *
                    </label>
                    <div className="relative w-full md:w-[300px] lg:w-[400px]">
                      <select
                        name="companyType"
                        value={formData.companyType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                              focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200
                              appearance-none cursor-pointer font-[Jost-Regular] text-gray-700 pr-10"
                        required
                      >
                        <option value="">Select Company Type</option>
                        <option value="Startup">Startup</option>
                        <option value="MNC">MNC</option>
                        <option value="SME">SME</option>
                        <option value="Government">Government</option>
                        <option value="Non-Profit">Non-Profit</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Founded Year */}
                  <div>
                    <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
                      Founded Year
                    </label>
                    <input
                      type="text"
                      name="foundedYear"
                      value={formData.foundedYear}
                      onChange={handleInputChange}
                      placeholder="e.g., 2020"
                      className="w-full md:w-[300px] lg:w-[400px] px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                              focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
                      Upload Company Logo
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-[374px] h-full opacity-0 cursor-pointer z-10"
                      />
                      <div
                        className="w-full md:w-[300px] lg:w-[400px] h-[168px] bg-[#FFF7E4] border-2 border-black rounded-[10px] 
                                    shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center
                                    hover:bg-[#F0F0F0] transition-colors duration-200 overflow-hidden"
                      >
                        {logoPreview ? (
                          <div className="flex flex-col items-center justify-center h-full">
                            <img
                              src={logoPreview}
                              alt="Logo Preview"
                              className="w-20 h-20 object-cover rounded-full border-2 border-black"
                            />
                            <p className="text-xs font-[Jost-Medium] text-green-600 mt-2">
                              {formData.logo?.name || "Logo uploaded"}
                            </p>
                            <p className="text-xs text-[#6AB8FA] mt-1">
                              Click to change
                            </p>
                          </div>
                        ) : (
                          <>
                            <FaCloudUploadAlt className="text-4xl text-[#6AB8FA] mb-2" />
                            <p className="text-xs font-[Jost-Medium] text-[#6AB8FA]">
                              Click to Upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              (Max. File size: 1.2 MB)
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-3">
                <div>
                  <h3 className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
                    Address :
                  </h3>
                  <p className="text-sm font-[Jost-Medium] text-gray-600 mb-3">
                    Where is Your Company Located
                  </p>
                </div>

                {/* Address Box Container*/}
                <div className="relative">
                  <div className="bg-[#FFF7E4] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] p-6 rounded-[10px]">
                    {/* Street Field - Full Width */}
                    <div className="mb-5">
                      <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">
                        Street
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="Enter the Street no/ address"
                        className="w-full px-3 py-2 bg-white border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                                focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                        required
                      />
                    </div>

                    {/* Two Column Layout */}
                    <div className="flex flex-col justify-between md:flex-row gap-4">
                      {/* Left Column */}
                      <div className="flex flex-col gap-5 space-y-4">
                        {/* City */}
                        <div>
                          <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Enter the city"
                            className="w-full md:w-[300px] lg:w-[400px] px-3 py-2 bg-white border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                                     focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                            required
                          />
                        </div>

                        {/* Pincode */}
                        <div>
                          <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">
                            Pincode
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            placeholder="Enter the Pincode"
                            className="w-full md:w-[300px] lg:w-[400px] px-3 py-2 bg-white border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                                     focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                            required
                          />
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="flex flex-col gap-5 space-y-4">
                        {/* State */}
                        <div>
                          <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="Enter the state"
                            className="w-full md:w-[300px] lg:w-[400px] px-3 py-2 bg-white border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                                     focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                            required
                          />
                        </div>

                        {/* Country */}
                        <div>
                          <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            placeholder="Enter the Name of the country"
                            className="w-full md:w-[300px] lg:w-[400px] px-3 py-2 bg-white border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                                     focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recruiter Information Section */}
              <div className="space-y-3">
                <div>
                  <h3 className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
                    Your Information :
                  </h3>
                  <p className="text-sm font-[Jost-Medium] text-gray-600 mb-3">
                    Tell us about yourself as the recruiter
                  </p>
                </div>

                <div className="bg-[#FFF7E4] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] p-6 rounded-[10px]">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Left Column */}
                    <div className="flex flex-col gap-5 space-y-4">
                      {/* Recruiter Name */}
                      <div>
                        <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          name="recruiterName"
                          value={formData.recruiterName}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="w-full md:w-[300px] lg:w-[400px] px-3 py-2 bg-white border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                                 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                          required
                        />
                        {validationErrors.recruiterName && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.recruiterName}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          className="w-full md:w-[300px] lg:w-[400px] px-3 py-2 bg-white border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                                 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                          required
                        />
                        {validationErrors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-5 space-y-4">
                      {/* Designation */}
                      <div>
                        <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">
                          Your Designation *
                        </label>
                        <input
                          type="text"
                          name="designation"
                          value={formData.designation}
                          onChange={handleInputChange}
                          placeholder="e.g. HR Manager, Talent Acquisition"
                          className="w-full md:w-[300px] lg:w-[400px] px-3 py-2 bg-white border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                                 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                          required
                        />
                        {validationErrors.designation && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.designation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Description */}
              <div>
                <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
                  Enter Company Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell Us about Your Company"
                  rows={3}
                  className="w-full px-3 h-40 py-3 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                         focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200 resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-3 md:px-20 md:py-4 cursor-pointer bg-white border-2 border-black rounded-[10px] 
                         hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-1px] hover:translate-y-[-1px] 
                         transition-all duration-200 ease-out 
                         active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)]
                         disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-xl md:text-3xl font-[BungeeShade] text-black">
                    {isSubmitting ? "REGISTERING..." : "CONTINUE"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
