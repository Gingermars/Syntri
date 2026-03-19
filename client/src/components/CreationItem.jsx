import React, { useState } from "react";
import Markdown from "react-markdown";

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="p-4 max-w-5xl text-sm text-gray-300 bg-black border border-gray-500 rounded-lg cursor-pointer"
    >
      <div className="flex justify-between items-center gap-4">
        <h2>{item.prompt}</h2>
        <button className="bg-[#454e5b] border border-[#2d5492] rounded-full text-[#6a9ae7] px-4 py-1">
          {item.type}
        </button>
      </div>
      <p className="text-gray-500 mt-2">
        {item.type} - {new Date(item.created_at).toLocaleDateString()}
      </p>

      {expanded &&
        (item.type === "image" ? (
          <div>
            <img
              src={item.content}
              alt="image"
              className="mt-3 w-full max-w-md"
            />
          </div>
        ) : (
          <div className="mt-3 h-full overflow-y-scroll text-sm text-gray-300">
            <div className="reset-tw">
              <Markdown>{item.content}</Markdown>
            </div>
          </div>
        ))}
    </div>
  );
};

export default CreationItem;
