import React from "react";
import { useUser, useClerk, Protect } from "@clerk/clerk-react";
import {
  Eraser,
  FileText,
  Hash,
  House,
  Image,
  LogOut,
  Scissors,
  SquarePen,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  {
    to: "/ai",
    label: "Dashboard",
    Icon: House,
    gradient: "bg-gradient-to-r from-[#00f0ff] to-[#0077cc]",
  },
  {
    to: "/ai/write-article",
    label: "Write Article",
    Icon: SquarePen,
    gradient: "bg-gradient-to-r from-[#4b89d0] to-[#3eaed7]",
  },
  {
    to: "/ai/blog-titles",
    label: "Blog Titles",
    Icon: Hash,
    gradient: "bg-gradient-to-r from-[#ff55cc] to-[#8800ff]",
  },
  {
    to: "/ai/generate-images",
    label: "Generate Images",
    Icon: Image,
    gradient: "bg-gradient-to-r from-[#00ff00] to-[#008b8b]",
  },
  {
    to: "/ai/remove-background",
    label: "Remove Background",
    Icon: Eraser,
    gradient: "bg-gradient-to-r from-[#ffa500] to-[#ff4500]",
  },
  {
    to: "/ai/remove-object",
    label: "Remove Object",
    Icon: Scissors,
    gradient: "bg-gradient-to-r from-[#fc466b] to-[#3f5efb]",
  },
  {
    to: "/ai/review-resume",
    label: "Review Resume",
    Icon: FileText,
    gradient: "bg-gradient-to-r from-[#00DA83] to-[#009BB3]",
  },
  {
    to: "/ai/community",
    label: "Community",
    Icon: Users,
    gradient: "bg-gradient-to-r from-[#00c9ff] to-[#0077ff]",
  },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  if (!user) {
    return null;
  }

  return (
    <div
      className={`w-60 bg-black border-r border-gray-800 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 ${
        sidebar ? "translate-x-0" : "max-sm:-translate-x-full"
      } transition-all duration-300 ease-in-out`}
    >
      <div className="my-7 w-full">
        <img
          src={user.imageUrl}
          alt="User avatar"
          className="w-13 rounded-full mx-auto"
        />
        <h1 className="text-center mt-1">{user.firstName}</h1>
        <div className="px-6 mt-5 tet-sm text-gray-300 font-medium">
          {navItems.map(({ to, label, Icon, gradient }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/ai"}
              onClick={() => setSidebar(false)}
              className={({ isActive }) =>
                `px-3.5 py-2.5 flex items-center gap-3 rounded hover:bg-gray-900 transition-colors ${
                  isActive ? `${gradient} text-white` : ""
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div
          onClick={openUserProfile}
          className="flex gap-2 items-center cursor-pointer"
        >
          <img src={user.imageUrl} alt="" className="w-8 rounded-full" />
          <div>
            <h1 className="text-sm font-medium">{user.fullName}</h1>
            <p className="text-xs text-gray-400">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>
            </p>
          </div>
        </div>
        <LogOut
          onClick={signOut}
          className="w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Sidebar;
