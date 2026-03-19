import React, { useState } from "react";
import { Edit, Sparkle } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const { getToken } = useAuth();
  const ariticleLengths = [
    { length: 2000, text: "Short (500-800 words)" },
    { length: 4000, text: "Medium (1000-1500 words)" },
    { length: 6000, text: "Long (2000+ words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(ariticleLengths[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const prompt = `Write a detailed article about ${input} with a length of around ${selectedLength.length} words. The article should be well-structured, engaging, and informative. Include an introduction, main body, and conclusion. Use clear and concise language, and make sure to cover the topic comprehensively.`;

      const { data } = await axios.post(
        "/api/ai/generate-article",
        { prompt, length: selectedLength.length },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message || "Could not generate article.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-300">
      {/* Left col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-black rounded-lg border border-gray-500"
      >
        <div className="flex items-center gap-3">
          <Sparkle className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-bold">Write Article</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Article Topic</p>

        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="The Future of Artificial Intelligence is..."
          className="mt-2 w-full outline-none p-2 text-sm bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <p className="mt-6 text-sm font-medium">Article Length</p>

        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {ariticleLengths.map((item, index) => (
            <span
              onClick={() => setSelectedLength(item)}
              className={`px-3 py-1 border rounded-full cursor-pointer text-xs ${
                selectedLength.text === item.text
                  ? "bg-blue-600 border-blue-600"
                  : "text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
              }`}
              key={index}
            >
              {item.text}
            </span>
          ))}
        </div>
        <br />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-gradient-to-r from-[#4b89d0] to-[#3eaed7] text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Edit className="w-5 h-5" />
          )}
          Generate Article
        </button>
      </form>
      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-black rounded-lg flex flex-col border border-gray-500 min-h-96 max-h-[800px]">
        <div className="flex items-center gap-3">
          <Edit className="w-6 h-5 text-blue-600" />
          <h1 className="text-xl font-bold">Article Preview</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Edit className="w-10 h-10 text-gray-400" />
              <p>
                Start by entering an article topic and selecting the desired
                length to generate your article.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full overflow-y-scroll text-sm p-2 bg-gray-800 border border-gray-600 rounded-md">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;
