import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import apiService from "../services/apiService";
import skillsData from "../demodata/skills.json";

const PostJob = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [recruiterId, setRecruiterId] = useState(null);

  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    rolesAndResponsibilities: "",
    perks: [],
    details: "",
    jobType: "company",
    employmentType: "full-time",
    noOfOpenings: 1,
    duration: "",
    mode: "hybrid",
    stipend: "",
    salaryRange: {
      min: "",
      max: "",
    },
    preferences: {
      skills: [],
      minExperience: "",
      education: "",
      location: "",
    },
  });

  const [skillInput, setSkillInput] = useState("");
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [locationInput, setLocationInput] = useState("");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const googleAutocompleteServiceRef = useRef(null);
  const googleScriptLoadedRef = useRef(false);
  const [popularPerks] = useState([
    "Health insurance",
    "Flexible hours",
    "Remote work",
    "Paid time off",
    "401k",
    "Stock options",
    "Dental",
    "Vision",
    "Gym membership",
    "Learning budget",
  ]);
  const [perkInput, setPerkInput] = useState("");
  const [filteredPerks, setFilteredPerks] = useState([]);
  const [educationOptions] = useState([
    "Any",
    "High School",
    "Diploma",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [apiDebugInfo, setApiDebugInfo] = useState(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingRoles, setIsGeneratingRoles] = useState(false);

  // AI Content Generation using free Hugging Face API
  const generateAIContent = async (type) => {
    const jobTitle = jobData.title.trim();
    
    if (!jobTitle) {
      alert("Please enter a job title first to generate AI content.");
      return;
    }

    const isDescription = type === "description";
    
    if (isDescription) {
      setIsGeneratingDescription(true);
    } else {
      setIsGeneratingRoles(true);
    }

    try {
      const prompt = isDescription
        ? `Write a professional job description for a ${jobTitle} position. Include an overview of the role, key qualifications, and what makes this opportunity exciting. Keep it concise and engaging, around 150-200 words.`
        : `List 6-8 key roles and responsibilities for a ${jobTitle} position. Format as bullet points starting with action verbs. Be specific and professional.`;

      // Using Hugging Face free inference API with Mistral model
      const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(import.meta.env.VITE_HF_API_KEY && {
              "Authorization": `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
            }),
          },
          body: JSON.stringify({
            inputs: `<s>[INST] ${prompt} [/INST]`,
            parameters: {
              max_new_tokens: 500,
              temperature: 0.7,
              top_p: 0.95,
              do_sample: true,
            },
          }),
        }
      );

      if (!response.ok) {
        // If Hugging Face fails, use fallback templates
        throw new Error("API unavailable");
      }

      const data = await response.json();
      
      let generatedText = "";
      if (Array.isArray(data) && data[0]?.generated_text) {
        // Extract only the response part (after [/INST])
        const fullText = data[0].generated_text;
        const instEnd = fullText.lastIndexOf("[/INST]");
        generatedText = instEnd !== -1 
          ? fullText.substring(instEnd + 7).trim() 
          : fullText.trim();
      } else if (data.error) {
        throw new Error(data.error);
      }

      if (generatedText) {
        if (isDescription) {
          setJobData((prev) => ({ ...prev, description: generatedText }));
        } else {
          setJobData((prev) => ({ ...prev, rolesAndResponsibilities: generatedText }));
        }
      } else {
        throw new Error("No content generated");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      
      // Fallback to template-based content
      const fallbackContent = generateFallbackContent(jobTitle, isDescription);
      if (isDescription) {
        setJobData((prev) => ({ ...prev, description: fallbackContent }));
      } else {
        setJobData((prev) => ({ ...prev, rolesAndResponsibilities: fallbackContent }));
      }
    } finally {
      if (isDescription) {
        setIsGeneratingDescription(false);
      } else {
        setIsGeneratingRoles(false);
      }
    }
  };

  // Fallback content generator when AI API is unavailable
  const generateFallbackContent = (jobTitle, isDescription) => {
    if (isDescription) {
      return `We are looking for a talented ${jobTitle} to join our dynamic team. In this role, you will have the opportunity to work on exciting projects and contribute to our company's growth.

The ideal candidate will bring a combination of technical expertise and collaborative spirit. You will work closely with cross-functional teams to deliver high-quality solutions that meet our business objectives.

This is an excellent opportunity for someone who is passionate about their craft and eager to make a meaningful impact. We offer a supportive work environment, competitive compensation, and opportunities for professional growth.`;
    } else {
      return `• Lead and execute projects related to ${jobTitle} responsibilities
• Collaborate with cross-functional teams to deliver high-quality results
• Analyze requirements and develop effective solutions
• Maintain documentation and ensure best practices are followed
• Participate in code reviews, planning sessions, and team meetings
• Stay updated with industry trends and emerging technologies
• Mentor junior team members and contribute to knowledge sharing
• Communicate progress and findings to stakeholders effectively`;
    }
  };

  // Fetch available skills and recruiter ID on component mount
  useEffect(() => {
    const loadSkills = () => {
      // Load skills from local JSON file
      setAllSkills(skillsData);
    };

    const fetchLocations = async () => {
      try {
        const res = await apiService.getLocations();
        // Expecting backend to return an array of strings or objects. If response has .data, try to use it.
        const locs = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];
        setAllLocations(locs);
      } catch (err) {
        // Error fetching locations - fallback to defaults
        // Fallback to some common cities
        setAllLocations([
          "Bengaluru",
          "San Francisco",
          "New York",
          "London",
          "Delhi",
          "Mumbai",
          "Chennai",
          "Hyderabad",
          "Pune",
          "Kolkata",
          "Ahmedabad",
          "Gurugram",
          "Noida",
        ]);
      }
    };

    const fetchRecruiterId = async () => {
      if (currentUser?.uid) {
        try {
          const companyResponse = await apiService.getCompanyByUID(
            currentUser.uid
          );
          if (companyResponse.success && companyResponse.data?.recruiter?.id) {
            setRecruiterId(companyResponse.data.recruiter.id);
          }
        } catch (error) {
          // Error fetching recruiter ID
        }
      }
    };

    loadSkills();
    fetchLocations();
    fetchRecruiterId();
    // Try to load Google Maps Places script if API key provided
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey && !googleScriptLoadedRef.current) {
      const existing = document.querySelector(
        `script[data-google-maps="places"]`
      );
      if (!existing) {
        const s = document.createElement("script");
        s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        s.async = true;
        s.defer = true;
        s.setAttribute("data-google-maps", "places");
        s.onload = () => {
          googleScriptLoadedRef.current = true;
          try {
            if (window.google?.maps?.places) {
              googleAutocompleteServiceRef.current =
                new window.google.maps.places.AutocompleteService();
            }
          } catch (err) {
            if (import.meta.env.DEV)
              console.warn("Google Maps Places failed to initialize:", err);
          }
        };
        s.onerror = (e) => {
          if (import.meta.env.DEV)
            console.warn("Failed to load Google Maps script", e);
        };
        document.head.appendChild(s);
      } else {
        googleScriptLoadedRef.current = true;
        if (window.google?.maps?.places) {
          googleAutocompleteServiceRef.current =
            new window.google.maps.places.AutocompleteService();
        }
      }
    }
  }, [currentUser?.uid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested object updates
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setJobData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setJobData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);

    if (value.trim()) {
      const filtered = allSkills.filter(
        (skill) =>
          skill.toLowerCase().includes(value.toLowerCase()) &&
          !jobData.preferences.skills.includes(skill)
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills([]);
    }
  };

  // Location typeahead handlers
  const handleLocationInputChange = (e) => {
    const v = e.target.value;
    setLocationInput(v);
    setJobData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, location: v },
    }));
    if (v.trim()) {
      // If Google Autocomplete service is available, use it
      const svc = googleAutocompleteServiceRef.current;
      if (svc && svc.getPlacePredictions) {
        svc.getPlacePredictions({ input: v, types: ['(cities)'] }, (preds, status) => {
          console.log("Google Maps API Status:", status);
          setApiDebugInfo(`Status: ${status}`);

          try {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              Array.isArray(preds)
            ) {
              const mapped = preds.map((p) => p.description);
              setFilteredLocations(mapped);
            } else {
              console.warn("Google Maps API failed or returned no results. Status:", status);
              // Fallback to local filtering
              const filtered = allLocations.filter((loc) =>
                loc.toLowerCase().includes(v.toLowerCase())
              );
              setFilteredLocations(filtered);
            }
          } catch (err) {
            console.error("Error processing Google Maps predictions:", err);
            // Places predictions failed; use local filtering
            const filtered = allLocations.filter((loc) =>
              loc.toLowerCase().includes(v.toLowerCase())
            );
            setFilteredLocations(filtered);
          }
        });
      } else {
        // No Google service available — use local filtering
        const filtered = allLocations.filter((loc) =>
          loc.toLowerCase().includes(v.toLowerCase())
        );
        setFilteredLocations(filtered);
      }
    } else {
      setFilteredLocations([]);
    }
  };

  const selectLocation = (loc) => {
    setJobData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, location: loc },
    }));
    setLocationInput(loc);
    setFilteredLocations([]);
  };

  const handleAddSkill = (skill) => {
    if (!jobData.preferences.skills.includes(skill)) {
      setJobData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          skills: [...prev.preferences.skills, skill],
        },
      }));
    }
    setSkillInput("");
    setFilteredSkills([]);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setJobData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        skills: prev.preferences.skills.filter(
          (skill) => skill !== skillToRemove
        ),
      },
    }));
  };

  const removePerk = (perkToRemove) => {
    setJobData((prev) => ({
      ...prev,
      perks: prev.perks.filter((p) => p !== perkToRemove),
    }));
  };

  // Perk input/typeahead handlers
  const handlePerkInputChange = (e) => {
    const v = e.target.value;
    setPerkInput(v);
    if (v.trim()) {
      const suggestions = popularPerks.filter(
        (p) =>
          p.toLowerCase().includes(v.toLowerCase()) &&
          !(jobData.perks || []).includes(p)
      );
      setFilteredPerks(suggestions);
    } else {
      setFilteredPerks([]);
    }
  };

  const addPerk = (val) => {
    const value = (val || "").trim();
    if (!value) return;
    setJobData((prev) => {
      const current = prev.perks || [];
      if (current.includes(value)) return prev;
      return { ...prev, perks: [...current, value] };
    });
    setPerkInput("");
    setFilteredPerks([]);
  };

  const handlePerkKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredPerks.length > 0) {
        addPerk(filteredPerks[0]);
      } else {
        addPerk(perkInput);
      }
    } else if (e.key === "Backspace" && !perkInput) {
      // Remove last perk
      setJobData((prev) => {
        const current = prev.perks || [];
        if (current.length === 0) return prev;
        return { ...prev, perks: current.slice(0, -1) };
      });
    }
  };

  const selectSuggestion = (s) => addPerk(s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate recruiter ID before submitting
      if (!recruiterId) {
        throw new Error(
          "Recruiter information not found. Please ensure you are properly registered."
        );
      }

      const submissionData = {
        ...jobData,
        recruiter: recruiterId, // Use the MongoDB ObjectId of the recruiter
        noOfOpenings: Number(jobData.noOfOpenings) || 1,
        stipend: jobData.stipend ? Number(jobData.stipend) : undefined,
        salaryRange: {
          min: Number(jobData.salaryRange.min),
          max: Number(jobData.salaryRange.max),
        },
        preferences: {
          ...jobData.preferences,
          minExperience: Number(jobData.preferences.minExperience) || 0,
        },
      };

      // If perks is an empty array, remove it so backend receives no perks field (preserve prior behavior)
      if (Array.isArray(submissionData.perks)) {
        if (submissionData.perks.length === 0) {
          // remove empty perks array to preserve prior behavior
          delete submissionData.perks;
        } else {
          // Backend expects a string for perks; convert array to a single string (CSV)
          // e.g., ["401k", "Health insurance"] -> "401k, Health insurance"
          submissionData.perks = submissionData.perks.join(", ");
        }
      }

      // Remove empty fields
      Object.keys(submissionData).forEach((key) => {
        if (submissionData[key] === "" || submissionData[key] === undefined) {
          delete submissionData[key];
        }
      });

      // Submitting job data (debug logs removed)

      const response = await apiService.postJob(submissionData);

      if (response.success) {
        alert("Job posted successfully!");
        // Navigate to home and potentially refresh the page to show updated stats
        navigate("/", { state: { jobPosted: true } });
      } else {
        throw new Error(response.message || "Failed to post job");
      }
    } catch (error) {
      // Error posting job
      setError(error.message || "Failed to post job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="  bg-[#FFFFF3] min-h-screen w-full flex flex-col items-center py-6">
      <div
        className="w-[90%]  md:w-[70%] bg-[#FFFFF3] border-2 custom-scrollbar border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] p-6 mt-15"
        style={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl text-left md:text-5xl font-[BungeeShade] mb-3 text-black">
            POST A NEW JOB
          </h1>
          <p className="text-base text-left md:text-lg font-[Jost-Medium] text-gray-600">
            Fill in the details below to find your next great hire.
          </p>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border-2 border-red-400 rounded-[10px] text-red-700">
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pt-4">
          {/* Job Title */}
          <div>
            <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleInputChange}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
              required
            />
          </div>

          {/* Job Description */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700">
                Job Description
              </label>
              <button
                type="button"
                onClick={() => generateAIContent("description")}
                disabled={isGeneratingDescription || !jobData.title.trim()}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-[Jost-Medium] rounded-lg
                  hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-md hover:shadow-lg"
                title={!jobData.title.trim() ? "Enter job title first" : "Generate with AI"}
              >
                {isGeneratingDescription ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>AI Generate</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              name="description"
              value={jobData.description}
              onChange={handleInputChange}
              placeholder="Tell us about the role, responsibilities, and what you're looking for..."
              rows={5}
              className="w-full px-3 py-3 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200 resize-none"
              required
            />
          </div>

          {/* Additional Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Roles and Responsibilities */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm md:text-lg font-[Jost-Semibold] text-gray-700">
                  Roles & Responsibilities
                </label>
                <button
                  type="button"
                  onClick={() => generateAIContent("roles")}
                  disabled={isGeneratingRoles || !jobData.title.trim()}
                  className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-[Jost-Medium] rounded-md
                    hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-md hover:shadow-lg"
                  title={!jobData.title.trim() ? "Enter job title first" : "Generate with AI"}
                >
                  {isGeneratingRoles ? (
                    <>
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>AI Generate</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                name="rolesAndResponsibilities"
                value={jobData.rolesAndResponsibilities}
                onChange={handleInputChange}
                placeholder="List key responsibilities..."
                rows={4}
                className="w-full px-3 py-3 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200 resize-none"
              />
            </div>

            {/* Perks: tokenized input with inline typeahead suggestions */}
            <div>
              <label className="block text-sm md:text-lg font-[Jost-Semibold] text-gray-700 mb-2">
                Perks & Benefits
              </label>

              {/* Selected perks tags */}
              <div className="flex flex-wrap gap-3 mb-3 p-3 bg-[#FFF7E4] border-2 border-black rounded-lg min-h-[48px]">
                {jobData.perks && jobData.perks.length > 0 ? (
                  jobData.perks.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1 bg-[#FFFFF3] border-2 border-black rounded-full"
                    >
                      <span className="text-sm">{p}</span>
                      <button
                        type="button"
                        onClick={() => removePerk(p)}
                        className="text-black font-bold"
                      >
                        &times;
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No perks selected</div>
                )}
              </div>

              {/* Inline token input + suggestions */}
              <div className="relative">
                <input
                  type="text"
                  value={perkInput}
                  onChange={handlePerkInputChange}
                  onKeyDown={handlePerkKeyDown}
                  placeholder="Type to search or add perks (press Enter to add)"
                  className="w-full px-3 py-2 bg-[#FFF7E4] border-2 border-black rounded-[8px]"
                />

                {filteredPerks.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-[#FFF7E4] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] max-h-40 overflow-y-auto">
                    {filteredPerks.map((sugg, i) => (
                      <div
                        key={i}
                        onClick={() => selectSuggestion(sugg)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      >
                        {sugg}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Type and Employment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Employment Type */}
            <div>
              <label className="block text-sm md:text-lg font-[Jost-Semibold] text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                name="employmentType"
                value={jobData.employmentType}
                onChange={handleInputChange}
                className="w-full px-3 py-3 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]"
                required
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            {/* Work Mode */}
            <div>
              <label className="block text-sm md:text-lg font-[Jost-Semibold] text-gray-700 mb-2">
                Work Mode
              </label>
              <select
                name="mode"
                value={jobData.mode}
                onChange={handleInputChange}
                className="w-full px-3 py-3 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]"
                required
              >
                <option value="remote">Remote</option>
                <option value="on-site">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Number of Openings */}
            <div>
              <label className="block text-sm md:text-lg font-[Jost-Semibold] text-gray-700 mb-2">
                Number of Openings
              </label>
              <input
                type="number"
                name="noOfOpenings"
                value={jobData.noOfOpenings}
                onChange={handleInputChange}
                min="1"
                placeholder="e.g., 3"
                className="w-full px-3 py-3 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]"
                required
              />
            </div>
          </div>

          {/* Salary Range Section */}
          <div>
            <h3 className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
              Salary Range ($ Per Annum)
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              <input
                type="number"
                name="salaryRange.min"
                value={jobData.salaryRange.min}
                onChange={handleInputChange}
                placeholder="Minimum Salary (e.g., 50000)"
                className="w-full px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                required
              />
              <input
                type="number"
                name="salaryRange.max"
                value={jobData.salaryRange.max}
                onChange={handleInputChange}
                placeholder="Maximum Salary (e.g., 80000)"
                className="w-full px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-4">
              Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {/* --- UPDATED SKILLS SECTION --- */}
              <div className="md:col-span-2">
                <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">
                  Required Skills
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={handleSkillInputChange}
                    placeholder="Type to search and select skills..."
                    className="w-full px-3 py-3 bg-[#FFF7E4] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]"
                  />
                  {/* Skills Dropdown */}
                  {filteredSkills.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-[#FFF7E4] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] max-h-48 overflow-y-auto">
                      {filteredSkills.map((skill, index) => (
                        <div
                          key={index}
                          onClick={() => handleAddSkill(skill)}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Selected Skills Tags */}
                <div className="flex flex-wrap gap-4 mt-5 p-4 bg-[#FFF7E4] border-2 border-black rounded-lg min-h-[50px]">
                  {jobData.preferences.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-[#FFFFF3] border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <span className="font-medium text-[#6AB8FA]">
                        {skill}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-xl font-bold leading-none text-black transition-transform duration-150 hover:scale-125"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minimum Experience */}
              <div>
                <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">
                  Minimum Experience (Years)
                </label>
                <input
                  type="number"
                  name="preferences.minExperience"
                  value={jobData.preferences.minExperience}
                  onChange={handleInputChange}
                  placeholder="e.g., 2"
                  className="w-full px-3 py-3 bg-[#FFF7E4] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]"
                  required
                />
              </div>
              {/* Education */}
              <div>
                <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">
                  Education
                </label>
                <select
                  name="preferences.education"
                  value={jobData.preferences.education}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 bg-[#FFF7E4] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]"
                  required
                >
                  {educationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="preferences.location"
                    value={locationInput || jobData.preferences.location}
                    onChange={handleLocationInputChange}
                    placeholder="eg., Bengaluru"
                    className="w-full px-3 py-3 bg-[#FFF7E4] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]"
                    required
                  />
                  {/* Debug Info */}
                  {apiDebugInfo && (
                    <div className="text-xs text-red-500 mt-1">
                      API Debug: {apiDebugInfo}
                    </div>
                  )}
                  {filteredLocations.length > 0 && (
                    <div className="absolute z-30 w-full mt-1 bg-[#FFF7E4] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] max-h-40 overflow-y-auto">
                      {filteredLocations.map((loc, i) => (
                        <div
                          key={i}
                          onClick={() => selectLocation(loc)}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        >
                          {loc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3 md:px-20 md:py-4 cursor-pointer bg-[#FFF7E4] border-2 border-black rounded-[10px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 ease-out active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl md:text-3xl font-[BungeeShade] text-black">
                {isSubmitting ? "POSTING..." : "POST JOB"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
