import React from "react";

export const Logo = ({ className = "w-8 h-8", ...props }) => {
  return (
    <img 
      src="/image.png?v=fresh-3" 
      alt="Majirani Skills Logo" 
      className={`object-contain ${className}`}
      {...props}
    />
  );
};
