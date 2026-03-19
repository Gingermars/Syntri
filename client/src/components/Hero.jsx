import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center items-center bg-[url(/gradientBackground.png) bg-cover  bg-no bg-repeat] min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-5xl sm:text-7xl md:text-8xl 2xl:text-8xl font-bold mx-auto leading-[1.2] text-white">
          Welcome to <span className="text-primary">Syntri.ai</span>
        </h1>
        <p className="mt-4 max-w-xs sm:max-w-lg 2xl:max-w-2xl m-auto max-sm:text-sm text-gray-300">
          Your AI-powered solution for all your needs.
        </p>
      </div>

      <div
        onClick={() => navigate("/ai")}
        className="flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs"
      >
        <button className="bg-primary text-white py-10 px-4 rounded-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition duration-300 cursor-pointer">
          Get Started
        </button>
        <button className="border border-primary py-10 px-4 rounded-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition duration-300 cursor-pointer text-primary">
          Learn More
        </button>
      </div>

      <div className="flex items-center justify-center mt-8 gap-4 mx-auto text-gray-600">
        <img src={assets.user_group} alt="Description" className="h-8" />{" "}
        Trusted by 10k+ people
      </div>
    </div>
  );
};

export default Hero;
