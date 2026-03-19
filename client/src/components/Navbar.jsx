import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();

  return (
    <div className="flex z-5 justify-between items-center w-full backdrop-blur-2xl fixed py-3 px-5 sm:px-10 xl:px-32">
      <img
        src={assets.logo}
        alt="Logo"
        className="w-32 sm:w-44"
        onClick={() => navigate("/")}
      />
      {user ? (
        <UserButton />
      ) : (
        <button
          onClick={() => openSignIn()}
          className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-gradient-to-r from-[#00f0ff] to-[#0077cc] hover:from-[#00e6ff] hover:to-[#006bb3] text-white font-semibold px-10 py-2.5"
        >
          Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
