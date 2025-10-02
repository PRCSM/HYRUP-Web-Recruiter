import React, { useState } from 'react';

const ALL_SKILLS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Django', 'Flask', 'Java', 
  'Spring Boot', 'HTML', 'CSS', 'Tailwind CSS', 'SQL', 'MongoDB', 'Docker', 
  'Kubernetes', 'AWS', 'Vue.js', 'Angular', 'TypeScript', 'Ruby on Rails', 'PHP'
];

const PostJob = () => {
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    salaryRange: {
      min: '',
      max: '',
    },
    preferences: {
      skills: [],
      minExperience: '',
      education: '',
      location: '',
    },
  });

  const [skillInput, setSkillInput] = useState('');
  const [filteredSkills, setFilteredSkills] = useState([]);

  const handleInputChange = (e) => {
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);

    if (value.trim()) {
      const filtered = ALL_SKILLS.filter(
        (skill) =>
          skill.toLowerCase().includes(value.toLowerCase()) &&
          !jobData.preferences.skills.includes(skill)
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills([]);
    }
  };

  const handleAddSkill = (skill) => {
    if (!jobData.preferences.skills.includes(skill)) {
      setJobData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          skills: [...prev.preferences.skills, skill]
        }
      }));
    }
    setSkillInput('');
    setFilteredSkills([]);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setJobData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        skills: prev.preferences.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submissionData = {
      ...jobData,
      salaryRange: {
        min: Number(jobData.salaryRange.min),
        max: Number(jobData.salaryRange.max),
      },
      preferences: {
        ...jobData.preferences,
        minExperience: Number(jobData.preferences.minExperience),
      },
    };
    
    console.log('Job Data Submitted:', submissionData);
    alert('Job posted! Check the console for the data.');
  };

  return (
    <div className="  bg-[#FFFFF3] min-h-screen w-full flex flex-col items-center py-6">

      <div className="w-[90%]  md:w-[70%] bg-[#FFFFF3] border-2 custom-scrollbar border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] p-6 mt-15" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        
        <div className="text-center mb-6">
          <h1 className="text-3xl text-left md:text-5xl font-[BungeeShade] mb-3 text-black">
            POST A NEW JOB
          </h1>
          <p className="text-base text-left md:text-lg font-[Jost-Medium] text-gray-600">
            Fill in the details below to find your next great hire.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pt-4">
          
          
          {/* Job Title */}
          <div>
            <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text" name="title" value={jobData.title} onChange={handleInputChange}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
              required
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              name="description" value={jobData.description} onChange={handleInputChange}
              placeholder="Tell us about the role, responsibilities, and what you're looking for..."
              rows={5}
              className="w-full px-3 py-3 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200 resize-none"
              required
            />
          </div>

          {/* Salary Range Section */}
          <div>
            <h3 className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">Salary Range ($ Per Annum)</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <input
                type="number" name="salaryRange.min" value={jobData.salaryRange.min} onChange={handleInputChange}
                placeholder="Minimum Salary (e.g., 50000)"
                className="w-full px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                required
              />
              <input
                type="number" name="salaryRange.max" value={jobData.salaryRange.max} onChange={handleInputChange}
                placeholder="Maximum Salary (e.g., 80000)"
                className="w-full px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                required
              />
            </div>
          </div>


          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-4">Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                
                {/* --- UPDATED SKILLS SECTION --- */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">Required Skills</label>
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
                        <span className="font-medium text-[#6AB8FA]">{skill}</span>
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
                  <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">Minimum Experience (Years)</label>
                  <input
                    type="number" name="preferences.minExperience" value={jobData.preferences.minExperience} onChange={handleInputChange}
                    placeholder="e.g., 2"
                    className="w-full px-3 py-3 bg-[#FFF7E4] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]"
                    required
                  />
                </div>
                {/* Education */}
                <div>
                  <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">Education</label>
                  <input
                    type="text" name="preferences.education" value={jobData.preferences.education} onChange={handleInputChange}
                    placeholder="e.g., Bachelor's Degree"
                    className="w-full px-3 py-3 bg-[#FFF7E4] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]"
                    required
                  />
                </div>
                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-[Jost-Medium] text-gray-700 mb-1">Location</label>
                  <input
                    type="text" name="preferences.location" value={jobData.preferences.location} onChange={handleInputChange}
                    placeholder="e.g., San Francisco"
                    className="w-full px-3 py-3 bg-[#FFF7E4] border-2 border-black rounded-[8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]"
                    required
                  />
                </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="px-10 py-3 md:px-20 md:py-4 cursor-pointer bg-[#FFF7E4] border-2 border-black rounded-[10px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 ease-out active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)]"
            >
              <span className="text-xl md:text-3xl font-[BungeeShade] text-black">POST JOB</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;