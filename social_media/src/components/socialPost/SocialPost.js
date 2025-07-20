// import React, { useState } from "react";
// import { FaHeart, FaComment, FaPaperPlane, FaEllipsisV, FaBookmark, FaTrash } from "react-icons/fa";

// const SocialPost = ({ avatarSrc, username, handle, postImageSrc, caption, initialLikes, initialComments, onDelete, onLike,isInitiallyLiked }) => {
//   const [likes, setLikes] = useState(initialLikes);
//   const [commentCount, setCommentCount] = useState(initialComments);
//   const [isLiked, setIsLiked] = useState(isInitiallyLiked);
//   const [showCommentInput, setShowCommentInput] = useState(false);
//   const [newCommentText, setNewCommentText] = useState("");
//   const [comments, setComments] = useState([]);
//   const [showMenu, setShowMenu] = useState(false);
//         console.log(isLiked);
        
  
//   const handleLike = (PostId) => {
//     setLikes(isLiked ? likes - 1 : likes + 1);
//     setIsLiked(!isLiked);
//     onLike(PostId);
//   };

//   const handleCommentClick = () => {
//     setShowCommentInput(!showCommentInput);
//   };

//   const handleCommentSubmit = (e) => {
//     e.preventDefault();
//     if (newCommentText.trim()) {
//       setComments((prev) => [...prev, { id: Date.now(), username: "You", text: newCommentText.trim() }]);
//       setCommentCount(commentCount + 1);
//       setNewCommentText("");
//     }
//   };
  

//   return (
//     <div className="m-4 rounded-lg shadow bg-white">
//       <div className="flex items-center justify-between px-4 py-2 relative">
//         <div className="flex items-center gap-3">
//           <img src={avatarSrc} alt="avatar" className="w-11 h-11 rounded-full object-cover" />
//           <div>
//             <div className="font-bold">{handle}</div>
//             <div className="text-sm text-gray-500">{username}</div>
//           </div>
//         </div>
//         <div className="relative">
//           <button
//             className="p-2 rounded-full hover:bg-gray-100 transition"
//             aria-label="Post options"
//             onClick={() => setShowMenu((prev) => !prev)}
//           >
//             <FaEllipsisV className="text-gray-500 text-lg" />
//           </button>
//           {showMenu && (
//             <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
//               <button
//                 className="flex items-center w-full px-4 py-2 text-purple-600 hover:bg-purple-50 gap-2 text-sm font-semibold rounded-t-lg"
//                 onClick={() => setShowMenu(false)}
//               >
//                 <FaBookmark className="text-purple-600" />
//                 Bookmark
//               </button>
//               <button
//                 className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 gap-2 text-sm font-semibold rounded-b-lg"
//                onClick={onDelete}
//               >
//                 <FaTrash className="text-red-600" />
//                 Delete
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//       <img src={postImageSrc} alt="post" className="w-full max-h-96 object-cover rounded-lg" />
//       {/* Caption Section */}
//       {caption && (
//         <div className="px-4 py-2 text-sm">
//           <span className="font-bold mr-2">{handle}</span>
//           <span className="text-gray-800">{caption}</span>
//         </div>
//       )}
//       <div className="flex justify-around py-3 text-sm text-gray-700">
//         <button onClick={handleLike} className="flex items-center gap-1 cursor-pointer">
//           <FaHeart className={isLiked ? "text-red-500" : ""} />
//           <span>{likes.toLocaleString()}</span>
//         </button>
//         <button onClick={handleCommentClick} className="flex items-center gap-1 cursor-pointer">
//           <FaComment />
//           <span>{commentCount.toLocaleString()}</span>
//         </button>
//         <div className="flex items-center gap-1">
//           <FaPaperPlane />
//           <span>9.8K</span>
//         </div>
//       </div>

//       {showCommentInput && (
//         <form onSubmit={handleCommentSubmit} className="p-4 border-t border-gray-200">
//           <div className="flex gap-2">
//             <input
//               type="text"
//               placeholder="Add a comment..."
//               className="flex-grow border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//               value={newCommentText}
//               onChange={(e) => setNewCommentText(e.target.value)}
//             />
//             <button
//               type="submit"
//               className="bg-purple-600 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-purple-700 cursor-pointer"
//             >
//               Post
//             </button>
//           </div>
//         </form>
//       )}

//       {comments.length > 0 && (
//         <div className="px-4 pb-4">
//           {comments.map((comment) => (
//             <div key={comment.id} className="mt-2 text-sm">
//               <span className="font-bold">{comment.username}:</span> {comment.text}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SocialPost; 






import React, { useEffect, useState } from "react";
import {
  FaHeart,
  FaComment,
  FaPaperPlane,
  FaEllipsisV,
  FaBookmark,
  FaTrash,
} from "react-icons/fa";

const SocialPost = ({
  avatarSrc,
  username,
  handle,
  postImageSrc,
  postVideoSrc,
  caption,
  initialLikes,
  initialComments,
  onDelete,
  onLike,
  isInitiallyLiked,
  onComment
}) => {
  
  const [likes, setLikes] = useState(initialLikes);
  const [commentCount, setCommentCount] = useState(initialComments);
  const [isLiked, setIsLiked] = useState(isInitiallyLiked);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  // 👉 Refresh hone ke baad bhi isLiked aur likes update ho jaye
  useEffect(() => {
    setIsLiked(isInitiallyLiked);
    setLikes(initialLikes);
  }, [isInitiallyLiked, initialLikes]);

  const handleLike = (PostId) => {
    setLikes(isLiked ? likes - 1 : likes + 1);
    setIsLiked(!isLiked);
    onLike(PostId); // Backend call
  };

  const handleCommentClick = () => {
    
    setShowCommentInput(!showCommentInput);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (newCommentText.trim()) {
      onComment(newCommentText)
      setComments((prev) => [
        ...prev,
        { id: Date.now(), username: "You", text: newCommentText.trim() },
      ]);
      setCommentCount(commentCount + 1);
      setNewCommentText("");
    }
  };

  return (
    <div className="m-4 rounded-lg shadow bg-white">
      <div className="flex items-center justify-between px-4 py-2 relative">
        <div className="flex items-center gap-3">
          <img
            src={avatarSrc}
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover"
          />
          <div>
            <div className="font-bold">{handle}</div>
            <div className="text-sm text-gray-500">{username}</div>
          </div>
        </div>
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Post options"
            onClick={() => setShowMenu((prev) => !prev)}
          >
            <FaEllipsisV className="text-gray-500 text-lg" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <button
                className="flex items-center w-full px-4 py-2 text-purple-600 hover:bg-purple-50 gap-2 text-sm font-semibold rounded-t-lg"
                onClick={() => setShowMenu(false)}
              >
                <FaBookmark className="text-purple-600" />
                Bookmark
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 gap-2 text-sm font-semibold rounded-b-lg"
                onClick={onDelete}
              >
                <FaTrash className="text-red-600" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

    {postImageSrc ? (
  <img
    src={postImageSrc}
    alt="post"
    className="w-full max-h-96 object-cover rounded-lg"
  />
) : postVideoSrc ? (
  <video
    src={postVideoSrc}
    controls
    className="w-full max-h-96 object-cover rounded-lg"
    preload="metadata"
    style={{ maxHeight: '400px' }}
  >
    Your browser does not support the video tag.
  </video>
) : null}


      {caption && (
        <div className="px-4 py-2 text-sm">
          <span className="font-bold mr-2">{handle}</span>
          <span className="text-gray-800">{caption}</span>
        </div>
      )}

      <div className="flex justify-around py-3 text-sm text-gray-700">
        <button
          onClick={handleLike}
          className="flex items-center gap-1 cursor-pointer"
        >
          <FaHeart className={isLiked ? "text-red-500" : ""} />
          <span>{likes.toLocaleString()}</span>
        </button>
        <button
          onClick={handleCommentClick}
          className="flex items-center gap-1 cursor-pointer"
        >
          <FaComment />
          <span>{commentCount.toLocaleString()}</span>
        </button>
        <div className="flex items-center gap-1">
          <FaPaperPlane />
          <span>9.8K</span>
        </div>
      </div>

      {showCommentInput && (
        <form onSubmit={handleCommentSubmit} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-grow border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            />
            <button
              type="submit"
              className="bg-purple-600 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-purple-700 cursor-pointer"
            >
              Post
            </button>
          </div>
        </form>
      )}

      {comments.length > 0 && (
        <div className="px-4 pb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="mt-2 text-sm">
              <span className="font-bold">{comment.username}:</span>{" "}
              {comment.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialPost;
