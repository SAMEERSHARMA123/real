import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import ProfileHeader from "./ProfileHeader";
import UserInfo from "./UserInfo";
import Tabs from "./Tabs";
import PhotoGrid from "./PhotoGrid";
import ShortsGrid from "./ShortsGrid";
import { MdVideoLibrary } from 'react-icons/md';
import { gql, useQuery } from '@apollo/client';
import { GET_ALL_POSTS,GET_ME } from '../../graphql/mutations';
import axios, { all } from "axios";
import { GetTokenFromCookie } from '../getToken/GetToken';

export default function Main({ userId }) {
  const [activeTab, setActiveTab] = useState(0); // 0: Feeds, 1: Shorts, 2: Tag
  const tabRefs = [useRef(null), useRef(null), useRef(null)];
  const [underline, setUnderline] = useState(null);
  const [tokens, setTokens] = useState();
  
  const [isFollowed, setIsFollowed] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  // Convert profile to state for dynamic updates
  const [profile, setProfile] = useState({
    
      id: "",
      name:  "",
      username : '',
      avatar: "",
      cover: "",
      bio: "",
      stats: {
        followers: "",
        following: "",
        posts: "",
      }
  })
  
  const [showProfileEditForm, setShowProfileEditForm] = useState(false);

     const user = async() => {
       // Use the userId from URL params if available, otherwise use the logged-in user's ID
       const targetUserId = userId || tokens?.id;
       if(!targetUserId){ return ""}
      try{
      const query = `
  query getMe($userId: ID!) {
    getMe(userId: $userId) {
      id
      name
      username
      bio
      profileImage
      isOnline
      lastActive
      followers { id }
      following { id }
      posts { id }
    }
  }
`;
   const variables = { userId: targetUserId.toString() };
   const response = await axios.post("http://localhost:5000/graphql",{query,variables},{
          headers: {
            'Content-Type': 'application/json',
          },
           withCredentials: true,
        })

        console.log(response?.data?.data?.getMe);
        const user = response?.data?.data?.getMe
         if (user) {
    setProfile({
      id:  user?.id,
      name: user?.name || "Katty Abrohams",
      username: user?.username || "Katty Abrohams",
      avatar: user?.profileImage || "https://randomuser.me/api/portraits/women/8.jpg",
      cover: user?.profileImage || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=cover&w=800&q=80",
      bio: user?.bio || "Embracing the mountain air 🗻\nContent creator 📸",
      stats: {
        followers: user?.followers?.length || 0,
        following: user?.following?.length || 0,
        posts: user?.posts?.length || 0,
      },
    });
  }

// window.location.reload();      
     }
     catch(error){
console.log(error);

     }
    }
     useEffect(()=> {
      user()
     },[tokens, userId])


  useEffect(() => {
  const decodedUser = GetTokenFromCookie();
  
   setTokens(decodedUser)

}, []);

  // Function to update profile data
  const updateProfile = (updates) => {
    setProfile(prev => {
      const newProfile = { ...prev, ...updates };
      // Save to localStorage
      try {
        localStorage.setItem('userProfile', JSON.stringify(newProfile));
        GetTokenFromCookie()
      } catch (error) {
        console.error("Error saving profile to localStorage:", error);
      }
      return newProfile;
    });
  };

  useLayoutEffect(() => {
    try {
      if (tabRefs[activeTab] && tabRefs[activeTab].current) {
        const node = tabRefs[activeTab].current;
        if (node) {
          setUnderline({ left: node.offsetLeft, width: node.offsetWidth });
        }
      }
    } catch (error) {
      console.error("Error setting tab underline position:", error);
    }
  }, [activeTab]);

  // Set initial underline position for Feeds tab
  useLayoutEffect(() => {
    try {
      if (tabRefs[0] && tabRefs[0].current) {
        const node = tabRefs[0].current;
        if (node && !underline) {
          setUnderline({ left: node.offsetLeft, width: node.offsetWidth });
        }
      }
    } catch (error) {
      console.error("Error setting initial tab underline position:", error);
    }
  }, [underline]);

  // Fetch posts from backend
  const { data, loading, error, refetch } = useQuery(GET_ALL_POSTS, {
    variables: { userId: userId || tokens?.id },
    skip: !userId && !tokens?.id,
  });
 
   useEffect(() => {
    if (data?.getAllPosts) {      
      setAllPosts(data.getAllPosts); // initial set
    }
  }, [data]);

  // Listen for postUploaded event to refetch posts immediately after upload
  useEffect(() => {
    const handlePostUploaded = () => {
      if (typeof refetch === 'function') refetch();
    };
    window.addEventListener('postUploaded', handlePostUploaded);
    return () => window.removeEventListener('postUploaded', handlePostUploaded);
  }, [refetch]);

  useEffect(()=>{
     window.addEventListener("postDeleted", () => {
    refetch(); // ya state update
  });
  },[])

  const photos = allPosts? allPosts.map(post => post.imageUrl) : [];

  useEffect(() => {
    const handleOpenProfileEdit = () => setShowProfileEditForm(true);
    window.addEventListener('openProfileEdit', handleOpenProfileEdit);
    return () => window.removeEventListener('openProfileEdit', handleOpenProfileEdit);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center w-full text-xs sm:text-sm md:text-base overflow-x-hidden">
      <ProfileHeader profile={profile} updateProfile={updateProfile} showProfileEditForm={showProfileEditForm} setShowProfileEditForm={setShowProfileEditForm} />
      <div className="h-8 xs:h-10 sm:h-14" />
      <UserInfo profile={profile} setProfile={setProfile} isFollowed={isFollowed} setIsFollowed={setIsFollowed} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabRefs={tabRefs} />
      <div className="w-full max-w-md px-1 xs:px-2 sm:px-4 py-2 xs:py-4 sm:py-6">
        {loading && <div>Loading...</div>}
        {error && <div>Error loading posts</div>}
        {activeTab === 0 ? (
          <PhotoGrid photos={allPosts} />
        ) : activeTab === 1 ? (
          <ShortsGrid shortsVideos={allPosts.filter(post => post.videoUrl)} />
        ) : (
          <PhotoGrid photos={allPosts} />
        )}
      </div>
    </div>
  );
}

