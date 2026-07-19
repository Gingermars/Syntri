import React, { useEffect, useState } from "react";
import { Gem, Sparkles } from "lucide-react";
import { Protect, useAuth } from "@clerk/clerk-react";
import CreationItem from "../components/CreationItem";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL =
  import.meta.env.VITE_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : window.location.origin);

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  const getDashboardData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/user/get-user-creations", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <div className="h-full overflow-y-scroll p-6">
      <div className="flex justify-start gap-4 flex-wrap">
        {/* Total Creation Cards */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-black rounded-xl border border-gray-700">
          <div className="text-slate-300 flex flex-col gap-1">
            <p className="text-sm">Total Creations</p>
            <h2 className="text-xl font-semibold">{creations.length}</h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#00f0ff] to-[#0077cc] text-black flex items-center justify-center">
            <Sparkles className="w-5 text-white" />
          </div>
        </div>

        {/* Active Plans Cards */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-black rounded-xl border border-gray-700">
          <div className="text-slate-300 flex flex-col gap-1">
            <p className="text-sm">Active Plans</p>
            <h2 className="text-xl font-semibold">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>
            </h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#ff55cc] to-[#aa00aa] text-black flex items-center justify-center">
            <Gem className="w-5 text-white" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-3/4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-t-transparent border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="mt-6 mb-4">Recent Creations</p>
          {creations.map((item) => (
            <CreationItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
