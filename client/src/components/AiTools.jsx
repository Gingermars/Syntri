import React from "react";
import { AiToolsData } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const AiTools = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="px-4 sm:px-20 xl:px-32 my-24 relative inline-flex flex-col w-full justify-center items-center bg-[url(/gradientBackground.png) bg-cover  bg-no bg-repeat] min-h-screen">
      <div className="text-center mb-6">
        <h2 className="text-[#94A3B8] text-[32px] font-semibold">
          powerful AI tools
        </h2>
        <p className="mt-4 max-w-xs sm:max-w-lg 2xl:max-w-2xl mx-auto max-sm:text-sm text-gray-300">
          Explore the latest advancements in artificial intelligence and how
          they can benefit your business.
        </p>
      </div>

      <div className="flex flex-wrap mt-10 justify-center">
        {AiToolsData.map((tool, index) => (
          <div
            key={index}
            className="p-8 m-4 max-w-xs rounded-lg bg-[#1E293B] shadow-lg border border-gray-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => user && navigate(tool.path)}
          >
            <tool.Icon
              className="w-12 h-12 text-primary mb-4"
              style={{
                background: `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})`,
              }}
            />
            <h3 className="text-xl mt-6 mb-3 font-semibold mb-2">
              {tool.title}
            </h3>
            <p className="text-gray-600 text-sm max-w-[95%]">
              {tool.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiTools;
