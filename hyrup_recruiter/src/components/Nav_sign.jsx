import React from "react";

function Nav_sign() {
    return ( 
        <div className="flex items-center select-none gap-3 p-4">
        <img
          className="w-[47px] h-[40px] scale-[0.8] object-cover object-center"
          src="../../public/images/logo.png"
          alt="Logo"
        />
        <h1 className="text-xl sm:text-2xl font-[BungeeShade]">HYRUP</h1>
      </div>
     );
}

export default Nav_sign;