import React, { useEffect, useRef, useState } from "react";
import Navbar from "../navbar/Navbar";
import StoryBar from "../storyBar/Storybar";
import FooterNav from "../footer/FooterNav";
import SocialPost from "../socialPost/SocialPost";
import CombinedLogin from "../login/CombinedLogin";
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_ALL_POSTS } from '../../graphql/mutations';
import axios from "axios";
import { GetTokenFromCookie } from '../getToken/GetToken';

const Main = () => {
  const storyBarRef = useRef(null);
  const token = sessionStorage.getItem('user');
  const navigate = useNavigate();
  const [allPosts, setAllPosts] = useState([]);
  const [tokens,setTokens] = useState();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);

  const scrollStories = (direction) => {
    try {
      const scrollAmount = 150;
      if (storyBarRef.current) {
        storyBarRef.current.scrollLeft += direction === "left" ? -scrollAmount : scrollAmount;
      }
    } catch (error) {
      console.error("Error scrolling stories:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);

  useEffect(()=>{
      try {
        const decodedUser = GetTokenFromCookie();
        setTokens(decodedUser);
      } catch (error) {
        console.error("Error getting token from cookie:", error);
      }
    },[])

    const handleCommentPost = async(id,text) => {
         console.log(id,text);
        try {
        const query = ` mutation CommentPost($userId: ID!,$postId: ID!, $text:String!) { CommentPost(userId: $userId,postId: $postId, text:$text){
        text
      commentedAt
      user {
        name
        username
        profileImage
      }

        }}`;
        const variables = {  userId: tokens.id, postId : id,text : text};

        const response = await axios.post("http://localhost:5000/graphql", { query: query, variables: variables }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        console.log(response);        
        // Refetch posts to get updated like status
        // refetch();
    }
    catch (err) {
      console.error(err);
    }

       
  }

  const handleLikePost = async(id) => {
    
        try {
        const query = ` mutation LikePost($userId: ID!,$postId: ID!) { LikePost(userId: $userId,postId: $postId)}`;
        const variables = {  userId: tokens.id, postId : id};

        const response = await axios.post("http://localhost:5000/graphql", { query: query, variables: variables }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        console.log(response);
        
        // Refetch posts to get updated like status
    }
    catch (err) {
      console.error(err);
    }

       
  }

  const handleDeletePost = (id) => {
    setDeletePostId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePost = async () => {
    try {
      const query = ` mutation DeletePost($id: ID!) { DeletePost(id: $id) }`;
      const variables = { id: deletePostId };
      const response = await axios.post("http://localhost:5000/graphql", { query: query, variables: variables }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response?.data?.data?.DeletePost) {
        setShowDeletePopup(true);
        setTimeout(() => setShowDeletePopup(false), 2000);
        setAllPosts((prev) => prev.filter((p) => p.id !== deletePostId));
        window.dispatchEvent(new Event("postDeleted"));
      }
      setShowDeleteConfirm(false);
      setDeletePostId(null);
    } catch (err) {
      console.error(err);
      setShowDeleteConfirm(false);
      setDeletePostId(null);
    }
  };

  const cancelDeletePost = () => {
    setShowDeleteConfirm(false);
    setDeletePostId(null);
  };

  // Fetch posts from backend
const { data, loading, error, refetch } = useQuery(GET_ALL_POSTS, {
  variables: { userId: tokens?.id },
  skip: !tokens?.id, // Skip query until tokens are loaded
});  

  useEffect(() => {
    if (data?.getAllPosts) {    
      setAllPosts(data.getAllPosts); // initial set
    }
  }, [data]);

  // Refetch data when tokens are available
  useEffect(() => {
    if (tokens?.id) {
      refetch();
    }
  }, [tokens, refetch]);

  // Listen for postUploaded event to refetch posts immediately after upload
  useEffect(() => {
    const handlePostUploaded = () => {
      if (typeof refetch === 'function') refetch();
    };
    window.addEventListener('postUploaded', handlePostUploaded);
    return () => window.removeEventListener('postUploaded', handlePostUploaded);
  }, [refetch]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Delete Success Popup */}
      {showDeletePopup && (
        <div className="fixed top-20 left-0 w-full flex justify-center z-[9999] transition-all duration-500">
          <div className="flex items-center gap-3 px-6 py-3 border-2 border-red-500 text-black rounded-xl shadow-lg bg-white">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-lg">Post Deleted Successfully!</span>
          </div>
        </div>
      )}
      {/* Delete Confirm Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center border-2 border-red-400">
            <span className="text-lg font-semibold mb-4 text-red-600">Are you sure you want to delete post?</span>
            <div className="flex gap-4 mt-2">
              <button onClick={confirmDeletePost} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">Yes, Delete</button>
              <button onClick={cancelDeletePost} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="pt-16 pb-20 md:ml-64"> {/* Added margin-left for sidebar on desktop */}
        <div className="max-w-4xl mx-auto px-4">
          {/* Story Bar */}
          <div className="bg-white shadow-sm mb-4 rounded-lg">
            <StoryBar storyBarRef={storyBarRef} scrollStories={scrollStories} />
          </div>

          {/* Footer */}
          <div className="mb-4">
            <FooterNav />
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {loading && <div>Loading...</div>}
            {error && tokens?.id && <div>Error loading posts</div>}
            {allPosts && allPosts.map((post) => (
              <SocialPost
                key={post.id}
                avatarSrc={post.createdBy?.profileImage || "https://ui-avatars.com/api/?name=User&background=random"}
                username={post.createdBy?.name || "User"}
                handle={post.createdBy?.username ? `@${post.createdBy.username}` : "@user"}
                postImageSrc={post.imageUrl}
                 postVideoSrc={post.videoUrl}
                caption={post.caption}
                initialLikes={post.likes?.length || 0}
                initialComments={post.comments?.length || 0}
                onDelete={() => handleDeletePost(post.id)}
                onLike={() => handleLikePost(post.id)}
                isInitiallyLiked={post?.likes?.some(like => like.user?.id === tokens?.id)}
                onComment={(text) => handleCommentPost(post.id, text)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
