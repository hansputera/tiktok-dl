import React from "react";

export const Footer = () => (
    <React.Fragment>
        <p className="text-lg">
            &copy; {new Date().getFullYear()} <a target="_blank" href="https://github.com/hansputera/tiktok-dl.git" className="text-gray-800 font-sans">TikTok-DL Project</a>
        </p>
    </React.Fragment>
)