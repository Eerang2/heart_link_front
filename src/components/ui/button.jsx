import React from "react";

const Button = ({ children, onClick, className = "", ...props }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export { Button };
