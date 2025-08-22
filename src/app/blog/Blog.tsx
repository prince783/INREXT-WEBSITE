/* eslint-disable no-unused-vars */
"use client";
import React from 'react'
import { useTheme } from "../content/ThemeContext"; // Importing theme context


const Blog = () => {
  const { isDarkMode } = useTheme();
  return (
    <div
      className={`bg-[#eff6ff6f] h-[100vh] overflow-hidden flex justify-center  ${
        isDarkMode ? "bg-black backdrop-blur-md border " : "bg-blue-50"
      }`}
    >
    <div>
        <img src="/images/about.jpg" alt="" />
    </div>
    </div>
  )
}

export default Blog
