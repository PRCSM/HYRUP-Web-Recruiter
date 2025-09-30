import React from "react";

function NavButton({ name, isActive, onClick }) {
    const buttonClass = (isActive 
        ? "bg-[#6ab7fa86] hover:bg-[#6AB8FA] "
        : "bg-[#FFFFF3] hover:bg-[#CACACA] "
    ) +
        "border-2 rounded-[10px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] flex items-center justify-left px-7 cursor-pointer md:w-[205px] md:h-[53px] w-full h-[70px] " +
        "transition-all duration-200 ease-out " +
        "hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] hover:translate-x-[-2px] hover:translate-y-[-2px] " +
        "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]";
    
    return (  
        <div className={buttonClass} onClick={onClick}>
            <h1 className="font-[JostBold] md:text-xl select-none text-2xl">{name}</h1> 
        </div>
    );
}

export default NavButton;