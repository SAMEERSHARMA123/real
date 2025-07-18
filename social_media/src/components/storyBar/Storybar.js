import React from "react";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";

const StoryBar = ({ storyBarRef, scrollStories }) => (
  <div className="relative flex items-center px-4 py-3">
    <button onClick={() => scrollStories("left")} className="absolute left-0 z-10 bg-white p-2 rounded-full shadow-md cursor-pointer">
      <FaChevronLeft />
    </button>
    <div
      ref={storyBarRef}
      className="flex gap-4 overflow-x-auto whitespace-nowrap scroll-smooth flex-grow mx-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {[1, 2, 3, 4, 5, 6, 7].map((n, i) => (
        <div key={i} className="relative inline-block w-16 h-16 min-w-[64px] min-h-[64px]">
          <div className="w-full h-full rounded-full border-2 border-purple-500 overflow-hidden cursor-pointer">
            <img
              src={`https://i.pravatar.cc/150?img=${n}`}
              alt="story"
              className="w-full h-full object-cover cursor-pointer"
            />
          </div>
          {i === 0 && (
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-[2px] text-xs shadow-sm cursor-pointer">
              <FaPlus className="text-purple-600 cursor-pointer" />
            </div>
          )}
          {i === 1 && (
            <span className="absolute top-0 left-0 bg-red-600 text-white text-[10px] px-1 rounded-full">
              Live
            </span>
          )}
        </div>
      ))}
    </div>
    <button onClick={() => scrollStories("right")} className="absolute right-0 z-10 bg-white p-2 rounded-full shadow-md cursor-pointer">
      <FaChevronRight />
    </button>
  </div>
);

export default StoryBar; 