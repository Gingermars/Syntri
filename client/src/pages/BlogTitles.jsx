import { Hash, Sparkles } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = [
    "Technology",
    "Health",
    "Business",
    "Science",
    "Entertainment",
    "Travel",
    "Lifestyle",
    "Education",
    "Food",
    "Sports",
  ];

  const [selectedCategory, setSelectedCategory] = useState("General");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const prompt = `Generate 5 catchy and SEO-friendly blog titles for a blog post about "${input}" in the category of "${selectedCategory}". The titles should be engaging, relevant to the topic, and designed to attract readers. Please provide a variety of title options that are creative and attention-grabbing.`;

      const { data } = await axios.post(
        "/api/ai/blog-title",
        { prompt },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

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
          <Sparkles className="w-6 text-[#ff55cc]" />
          <h1 className="text-xl font-bold">AI Title Generator</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Keyword</p>

        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Artificial Intelligence in Healthcare..."
          className="mt-2 w-full outline-none p-2 text-sm bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />

        <p className="mt-6 text-sm font-medium">Category</p>

        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {blogCategories.map((item) => (
            <span
              onClick={() => setSelectedCategory(item)}
              className={`px-3 py-1 border rounded-full cursor-pointer text-xs ${
                selectedCategory === item
                  ? "bg-purple-600 border-purple-600"
                  : "text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
              }`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
        <br />
        <button
          disabled={loading}
          className="mt-4 w-full bg-gradient-to-r from-[#ff55cc] to-[#8800ff] text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Hash className="w-5 h-5" />
          )}
          Generate Title
        </button>
        <br />
      </form>
      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-black rounded-lg flex flex-col border border-gray-500 min-h-96 max-h-[400px]">
        <div className="flex items-center gap-3 mb-3">
          <Hash className="w-6 h-5 text-[#8800ff]" />
          <h1 className="text-xl font-bold">Title Preview</h1>
        </div>
        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Hash className="w-10 h-10 text-gray-400" />
              <p>
                Your generated blog titles will appear here. Start by entering a
                keyword and selecting a category to generate titles.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-scroll text-sm p-4 bg-gray-800 border border-gray-600 text-slate-300 rounded-md">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitles;
