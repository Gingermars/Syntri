import { FileText, Sparkles } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL =
  import.meta.env.VITE_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : window.location.origin);

const ReviewResume = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    // Add your submission logic here
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", input);

      const { data } = await axios.post("/api/ai/review-resume", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      setContent(data.content);
      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-300">
      {/* Left col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-black rounded-lg border border-gray-500"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#00DA83]" />
          <h1 className="text-xl font-bold">Resume Review</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upload Resume</p>

        <input
          onChange={(e) => setInput(e.target.files[0])}
          type="file"
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="mt-2 w-full outline-none p-2 text-sm bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00ba9b]"
          required
        />

        <p className="text-xs text-gray-500 font-light mt-1">
          Supports PDF, DOC, DOCX and resume document formats
        </p>

        <button className="mt-4 w-full bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2">
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <FileText className="w-5 h-5" />
          )}
          Review Resume
        </button>
        <br />
      </form>
      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-black rounded-lg flex flex-col border border-gray-500 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-5 text-[#009BB3]" />
          <h1 className="text-xl font-bold">Analysis Result</h1>
        </div>
        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <FileText className="w-10 h-10 text-gray-400" />
              <p>
                Upload Resume and Click "Review Resume" to analyze your resume.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex-1 overflow-y-scroll text-sm p-4 bg-gray-800 border border-gray-600 rounded-md">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewResume;
