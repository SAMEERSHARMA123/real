// import React, { useState } from 'react';
// import { MagnifyingGlassIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

// const ChatNavBar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   return (
//     <nav className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           {/* Left side - App Icon and Text */}
//           <div className="flex items-center">
//             <div className="flex-shrink-0 flex items-center">
//               <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                 </svg>
//               </div>
//               <span className="ml-3 text-xl font-bold text-white font-sans tracking-tight">ChatApp</span>
//             </div>
//           </div>

//           {/* Right side - Search and Menu Icons */}
//           <div className="flex items-center space-x-4">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="w-40 sm:w-64 bg-white/10 text-white placeholder-white/70 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
//               />
//               <MagnifyingGlassIcon className="h-5 w-5 text-white/70 absolute left-3 top-1/2 transform -translate-y-1/2" />
//             </div>
//             <button className="text-white/80 hover:text-white transition-colors duration-200">
//               <EllipsisVerticalIcon className="h-6 w-6" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default ChatNavBar; 