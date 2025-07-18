import React from "react";

export default function PhotoGrid({ photos }) {
  return (
    <div className="w-full flex justify-center">
      <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4 w-full max-w-[26rem]">
        {photos.map((photo, idx) => (
          <div
            key={idx}
            className="group aspect-square rounded-md overflow-hidden bg-purple-50 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 relative"
          >
            {/* <img
              src={photo}
              alt="user post"
              className="w-full h-full object-cover object-center cursor-pointer group-hover:scale-110 transition-all duration-500"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                minHeight: "60px",
              }}
            /> */}

            {photo.imageUrl ? (
              <img
                src={photo.imageUrl}
                alt="user post"
                className="w-full h-full object-cover object-center cursor-pointer group-hover:scale-110 transition-all duration-500"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  minHeight: "60px",
                }}
              />
            ) : photo.videoUrl ? (
              <video
                src={photo.videoUrl}
                controls
                className="w-full h-full object-cover object-center cursor-pointer group-hover:scale-110 transition-all duration-500"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  minHeight: "60px",
                }}
              />
            ) : (
              <p>No media available</p>
            )}


            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
