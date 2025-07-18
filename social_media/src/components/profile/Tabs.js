import React from "react";

export default function Tabs({ activeTab, setActiveTab, tabRefs }) {
  return (
    <div className="w-full flex justify-center">
      <div className="relative flex justify-center gap-6 xs:gap-8 sm:gap-12 mt-6 xs:mt-8 sm:mt-10 w-[80%] max-w-[26rem] pb-4 bg-transparent shadow-none">
        {/* Feeds Tab */}
        <button ref={tabRefs[0]} onClick={() => setActiveTab(0)} className="flex flex-col items-center group focus:outline-none cursor-pointer relative">
          <span className="flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-2xl mb-2 bg-[#f6edff] shadow-md transition-transform duration-200 group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="2.5" fill="#8000ff"/>
              <rect x="14" y="3" width="7" height="7" rx="2.5" fill="#8000ff"/>
              <rect x="14" y="14" width="7" height="7" rx="2.5" fill="#8000ff"/>
              <rect x="3" y="14" width="7" height="7" rx="2.5" fill="#8000ff"/>
            </svg>
          </span>
          <span className={`text-xs xs:text-base sm:text-lg md:text-xl font-semibold ${activeTab === 0 ? 'text-[#8000ff]' : 'text-gray-400'}`}>Feeds</span>
          {activeTab === 0 && (
            <div className="absolute -bottom-2 w-16 h-1 xs:w-20 xs:h-1 sm:w-24 sm:h-1.5 bg-[#8000ff] rounded-full"></div>
          )}
        </button>

        {/* Shorts Tab */}
        <button ref={tabRefs[1]} onClick={() => setActiveTab(1)} className="flex flex-col items-center group focus:outline-none cursor-pointer relative">
          <span className="flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-2xl mb-2 bg-[#f6edff] shadow-md transition-transform duration-200 group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8" fill="#8000ff" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#8000ff" fillOpacity="0.2"/>
              <polygon points="10,8 16,12 10,16" fill="#8000ff"/>
            </svg>
          </span>
          <span className={`text-xs xs:text-base sm:text-lg md:text-xl font-semibold ${activeTab === 1 ? 'text-[#8000ff]' : 'text-gray-400'}`}>Shorts</span>
          {activeTab === 1 && (
            <div className="absolute -bottom-2 w-16 h-1 xs:w-20 xs:h-1 sm:w-24 sm:h-1.5 bg-[#8000ff] rounded-full"></div>
          )}
        </button>
      </div>
    </div>
  );
}

/*
@keyframes feedpulse {
  0% { filter: drop-shadow(0 0 0 #a78bfa88); }
  50% { filter: drop-shadow(0 0 8px #a78bfa88); }
  100% { filter: drop-shadow(0 0 0 #a78bfa88); }
}
.animate-feedpulse {
  animation: feedpulse 1.2s infinite;
}
*/
