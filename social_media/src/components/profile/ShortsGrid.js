import React from "react";
import { formatDuration } from "../../utils/formatters";

export default function ShortsGrid({ shortsVideos }) {
  return (
    <div className="w-full flex justify-center">
      <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4 w-full max-w-[26rem]">
        {shortsVideos.map((video, idx) => (
          <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-purple-50 cursor-pointer relative group">
            <video src={video.videoUrl} poster={video.thumbnailUrl || ""} controls  className="w-full h-full object-cover object-center cursor-pointer" style={{maxWidth:'100%',maxHeight:'100%', minHeight: '60px'}} />
            {/* Play Icon and Duration */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span className="text-white text-[8px] xs:text-[10px] sm:text-xs font-medium">
                {formatDuration(video.duration)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
