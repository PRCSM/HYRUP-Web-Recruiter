import React, { useState, useRef, useEffect } from "react";
import Nav_sign from "./Nav_sign";
import NavButton from "./NavButton";
import { useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";

function SideNav() {
  const [activeButton, setActiveButton] = useState("Home");
  const [isOpen, setIsOpen] = useState(false); // For mobile sidebar
  const navigate = useNavigate();
  const location = useLocation();

  // GSAP refs
  const sidebarRef = useRef(null);
  const buttonRefs = useRef([]);

  // Map button names to their respective routes
  const buttonRoutes = {
    Home: "/",
    Application: "/Application",
    Chats: "/chats",
    Profile: "/Profile",
  };

  const buttons = ["Home", "Application", "Chats", "Profile"];

  // Reverse GSAP animation and close sidebar
  const handleCloseSidebar = () => {
    // Animate buttons out in reverse order (last button first)
    gsap.to(buttonRefs.current, {
      x: -40,
      opacity: 0,
      duration: 0.3,
      stagger: { each: 0.08, from: "end" }, // <-- reverse stagger
      ease: "power3.in",
    });
    // Animate sidebar out after buttons
    gsap.to(sidebarRef.current, {
      x: "-100%",
      duration: 0.4,
      ease: "power3.in",
      delay: 0.2 + 0.08 * (buttonRefs.current.length - 1), // wait for last button
      onComplete: () => setIsOpen(false),
    });
  };

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    navigate(buttonRoutes[buttonName]);
    handleCloseSidebar(); // Use the close animation
  };

  // GSAP animation for mobile/tablet sidebar
  useEffect(() => {
    if (isOpen) {
      // Sidebar slides in from left
      gsap.fromTo(
        sidebarRef.current,
        { x: "-100%" },
        { x: "0%", duration: 0.5, ease: "power3.out" }
      );
      // Buttons stagger in
      gsap.fromTo(
        buttonRefs.current,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.12,
          delay: 0.2,
          ease: "power3.out",
        }
      );
    }
  }, [isOpen]);

  // Set activeButton based on current path
  const getActiveButton = () => {
    const found = Object.entries(buttonRoutes).find(
      ([, path]) => path.toLowerCase() === location.pathname.toLowerCase()
    );
    return found ? found[0] : "Home";
  };

  useEffect(() => {
    setActiveButton(getActiveButton());
    // eslint-disable-next-line
  }, [location.pathname]);

  return (
    <>
      {/* Hamburger/Cross Icon for mobile/tablet */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded bg-[#FFF7E4] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]"
        onClick={() => (isOpen ? handleCloseSidebar() : setIsOpen(true))}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          // Cross icon
          <svg
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="8" y1="8" x2="20" y2="20" />
            <line x1="20" y1="8" x2="8" y2="20" />
          </svg>
        ) : (
          // Hamburger icon
          <svg
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="6" y1="9" x2="22" y2="9" />
            <line x1="6" y1="15" x2="22" y2="15" />
            <line x1="6" y1="21" x2="22" y2="21" />
          </svg>
        )}
      </button>

      {/* Sidebar for desktop */}
      <div className="hidden absolute top-0 left-0 md:block bg-[#FFF7E4] h-screen w-[256px] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] p-2">
        <Nav_sign />
        <div className="mt-14 flex flex-col gap-7 justify-center ml-2 items-start space-y-4">
          {buttons.map((buttonName) => (
            <div key={buttonName} className="mb-2">
              <NavButton
                name={buttonName}
                isActive={activeButton === buttonName}
                onClick={() => handleButtonClick(buttonName)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar overlay for mobile/tablet */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-60 flex">
          <div
            ref={sidebarRef}
            className="bg-[#FFF7E4] w-full h-full p-6 flex flex-col"
            style={{ transform: "translateX(-100%)" }} // initial for GSAP
          >
            <div className="h-20 w-full"></div>
            <Nav_sign />
            <div className="mt-14 flex flex-col gap-7 items-start space-y-4">
              {buttons.map((buttonName, idx) => (
                <div
                  key={buttonName}
                  className="mb-2 w-full"
                  ref={(el) => (buttonRefs.current[idx] = el)}
                  style={{ opacity: 0, transform: "translateX(-40px)" }} // initial for GSAP
                >
                  <NavButton
                    name={buttonName}
                    isActive={activeButton === buttonName}
                    onClick={() => handleButtonClick(buttonName)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SideNav;
