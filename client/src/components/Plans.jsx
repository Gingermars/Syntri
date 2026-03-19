import React from "react";
import { PricingTable } from "@clerk/clerk-react";
// optional: Clerk provides a ready dark base theme
import { dark } from "@clerk/themes";

const Plans = () => {
  return (
    <div className="max-w-2xl mx-auto z-20 my-30">
      <div className="text-center mb-6">
        <h2 className="text-[32px] font-extrabold text-slate-300">Our Plans</h2>
        <p className="mt-4 text-lg text-gray-300">
          Choose the plan that fits your needs.
        </p>
      </div>

      <div className="mt-14 max-sm:mx-8 ">
        <PricingTable
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#00f0ff",
              colorBackground: "#071427", // overall background for the component
              colorText: "#e6f6fb", // main text color
              colorTextMuted: "#94a3b8",
              colorBorder: "rgba(0,240,255,0.12)",
              // add any other variables you need — tweak after inspecting the rendered DOM
            },
          }}
        />
      </div>
    </div>
  );
};

export default Plans;
