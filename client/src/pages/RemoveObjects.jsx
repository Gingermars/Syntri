import { Scissors, Sparkles } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";

axios.defaults.baseURL =
  import.meta.env.VITE_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : window.location.origin);

const RemoveObjects = () => {
  const [input, setInput] = useState("");
  const [object, setObject] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    // Add your submission logic here
    try {
      setLoading(true);

      if (object.split(" ").length > 1) {
        return toast("Please enter only one object name");
      }

      const formData = new FormData();

      const compressedFile = await imageCompression(input, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
      });

      formData.append("image", compressedFile); // use the compressed file
      formData.append("object", object);

      const { data } = await axios.post("/api/ai/remove-object", formData, {
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
          <Sparkles className="w-6 text-[#fc466b]" />
          <h1 className="text-xl font-bold">Object Remover</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upload Image</p>

        <input
          onChange={(e) => setInput(e.target.files[0])}
          type="file"
          accept="image/*"
          className="mt-2 w-full outline-none p-2 text-sm bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#9d52b3]"
          required
        />

        <p className="mt-6 text-sm font-medium">Describe Your Image</p>

        <textarea
          onChange={(e) => setObject(e.target.value)}
          value={object}
          rows={4}
          placeholder="Describe the object you want to remove..."
          className="mt-2 w-full outline-none p-2 text-sm bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#9d52b3]"
          required
        />

        <button
          disabled={loading}
          className="mt-4 w-full bg-gradient-to-r from-[#fc466b] to-[#3f5efb] text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Scissors className="w-5 h-5" />
          )}
          Remove Object
        </button>
        <br />
      </form>
      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-black rounded-lg flex flex-col border border-gray-500 min-h-96">
        <div className="flex items-center gap-3">
          <Scissors className="w-6 h-5 text-[#3f5efb]" />
          <h1 className="text-xl font-bold">Processed Image</h1>
        </div>
        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Scissors className="w-10 h-10 text-gray-400" />
              <p>
                Your processed image with the specified object removed will
                appear here.
              </p>
            </div>
          </div>
        ) : (
          <img
            src={content}
            alt="Processed"
            className="w-full h-full object-contain"
          />
        )}
      </div>
    </div>
  );
};

export default RemoveObjects;
