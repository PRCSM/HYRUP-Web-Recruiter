import React, { useState } from 'react'
import Nav_sign from '../components/Nav_sign'
import { FaCloudUploadAlt, FaPlus } from 'react-icons/fa'

const Registration = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    email: '',
    street: '',
    city: '',
    pincode: '',
    state: '',
    country: '',
    description: '',
    logo: null
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.size <= 1.2 * 1024 * 1024) { // 1.2 MB limit
      setFormData(prev => ({
        ...prev,
        logo: file
      }))
    } else {
      alert('File size must be less than 1.2 MB')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Handle form submission here
  }

  return (
    <div className="relative bg-[#FFFFF3] min-h-screen w-full">
      <div>
        <Nav_sign/>
        
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
                Take your first step to simplify your hiring process and save time with{' '}
                <span className="text-[#6AB8FA] font-[BungeeShade]">Hyrup</span>
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 pt-7">
              
               {/* Company Details Section */}
               <div className="flex flex-col md:flex-row justify-between">
                 {/* Left Column */}
                 <div className="flex flex-col space-y-4">
                   {/* Company Name */}
                   <div>
                     <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
                       Enter Company Name
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
                   </div>

                   {/* Website */}
                   <div>
                     <label className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">
                       Website
                     </label>
                     <input
                       type="url"
                       name="website"
                       value={formData.website}
                       onChange={handleInputChange}
                       placeholder="Enter the url of your Company Website"
                       className="w-full md:w-[300px] lg:w-[400px] px-3 py-4 bg-[#FFF7E4] border-2 border-black rounded-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                              focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200"
                       required
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
                         className="absolute inset-0 w-[374px] h-full opacity-0 cursor-pointer"
                       />
                       <div className="w-full md:w-[300px] lg:w-[400px] h-[168px] bg-[#FFF7E4] border-2 border-black rounded-[10px] 
                                    shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center
                                    hover:bg-[#F0F0F0] transition-colors duration-200">
                         <FaCloudUploadAlt className="text-lg text-[#6AB8FA] mb-2" />
                         <p className="text-xs font-[Jost-Medium] text-[#6AB8FA]">
                           Click to Upload or drag and drop
                         </p>
                         <p className="text-xs text-gray-500">
                           (Max. File size: 1.2 MB)
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Address Section */}
               <div className="space-y-3">
                 <div>
                   <h3 className="block text-sm md:text-[24px] font-[Jost-Semibold] text-gray-700 mb-2">Address :</h3>
                   <p className="text-sm font-[Jost-Medium] text-gray-600 mb-3">Where is Your Company Located</p>
                 </div>
                 
                 {/* Address Box Container*/}
                 <div className="relative">
                   <div 
                     className="bg-[#FFF7E4] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] p-6 rounded-[10px]"
                   >
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
                  className="px-10 py-3 md:px-20 md:py-4 cursor-pointer bg-white border-2 border-black rounded-[10px] 
                         hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-1px] hover:translate-y-[-1px] 
                         transition-all duration-200 ease-out 
                         active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)]"
                >
                  <span className="text-xl md:text-3xl font-[BungeeShade] text-black">CONTINUE</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Registration