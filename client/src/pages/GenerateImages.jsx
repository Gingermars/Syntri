import { Sparkles, Image } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const imageStyle = [
    "Realistic",
    "Cartoon",
    "3D Render",
    "Anime",
    "Fantasy",
    "Watercolor",
    "Oil Painting",
    "Surreal",
    "Abstract",
    "Portrait",
  ];

  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    // Add your submission logic here
    try {
      setLoading(true);

      const prompt = `Generate a ${selectedStyle} image based on the following description: "${input}". The image should be visually appealing and capture the essence of the description. Please create an image that is unique and creative, reflecting the specified style.`;

      const { data } = await axios.post(
        "/api/ai/generate-image",
        { prompt, publish },
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
          <Sparkles className="w-6 text-[#00ff00]" />
          <h1 className="text-xl font-bold">AI Image Generator</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Describe Your Image</p>

        <textarea
          onChange={(e) => setInput(e.target.value)}
          value={input}
          rows={4}
          placeholder="Describe the image you want to generate..."
          className="mt-2 w-full outline-none p-2 text-sm bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        <p className="mt-6 text-sm font-medium">Style</p>

        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {imageStyle.map((item) => (
            <span
              onClick={() => setSelectedStyle(item)}
              className={`px-3 py-1 border rounded-full cursor-pointer text-xs ${
                selectedStyle === item
                  ? "bg-green-600 border-green-600"
                  : "text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
              }`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="my-6 flex items-center gap-2">
          <label className="relative cursor-pointer">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
              className="mr-2 sr-only peer"
            />

            <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition"></div>

            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4"></span>
          </label>
          <p className="text-sm text-gray-300">Publish Image Publicly</p>
        </div>

        <br />
        <button
          disabled={loading}
          className="mt-4 w-full bg-gradient-to-r from-[#00ff00] to-[#008b8b] text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Image className="w-5 h-5" />
          )}
          Generate Image
        </button>
        <br />
      </form>
      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-black rounded-lg flex flex-col border border-gray-500 min-h-96">
        <div className="flex items-center gap-3">
          <Image className="w-6 h-5 text-[#008b8b]" />
          <h1 className="text-xl font-bold">Image Preview</h1>
        </div>
        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Image className="w-10 h-10 text-gray-400" />
              <p>
                Your generated images will appear here. Describe an image and
                choose a style to get started.
              </p>
            </div>
          </div>
        ) : (
          <img
            src={content}
            alt="Generated"
            className="w-full h-full object-contain"
          />
        )}
      </div>
    </div>
  );
};

export default GenerateImages;
