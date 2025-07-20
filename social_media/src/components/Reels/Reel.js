import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../components/sidebar/Sidebar';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_POSTS, GET_ALL_VIDEOS, LIKE_VIDEO, COMMENT_ON_VIDEO, INCREMENT_VIDEO_VIEWS } from '../../graphql/mutations';
import { GetTokenFromCookie } from '../../components/getToken/GetToken';
import { Heart, MessageCircleMore, Share2, Bookmark, Ellipsis, Volume2, VolumeOff } from 'lucide-react';
// import FooterNav from '../../components/footer/FooterNav';

// Sound wave animation styles
const soundWaveStyle = `
@keyframes wave {
  0%, 100% { height: 30%; }
  50% { height: 90%; }
}
`;

const Reel = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [tokens, setTokens] = useState();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const touchStartY = useRef(null);
  // For wheel scroll
  const lastWheelTime = useRef(0);
  // Heart icon toggle state
  const [liked, setLiked] = useState(false);
  // Follow button state
  const [isFollowing, setIsFollowing] = useState(false);
  // Mute/unmute state
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const handleMuteToggle = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };
  const handleFollowClick = () => setIsFollowing((prev) => !prev);
  // Double tap/double click handler for like
  const handleDoubleClick = () => setLiked((prev) => !prev);

  // Add state for comments and input
  const [commentInput, setCommentInput] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

  useEffect(() => {
    // Prevent scrolling when Reels page is mounted
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    try {
      const decodedUser = GetTokenFromCookie();
      setTokens(decodedUser);
    } catch (error) {
      console.error("Error getting token from cookie:", error);
    }
  }, []);

  // Fetch posts from backend
  const { data, loading, error, refetch } = useQuery(GET_ALL_POSTS, {
    variables: { userId: tokens?.id },
  });

  // Fetch videos from backend for reels
  const { data: videosData, loading: videosLoading, error: videosError, refetch: refetchVideos } = useQuery(GET_ALL_VIDEOS);

  // Mutations
  const [likeVideo] = useMutation(LIKE_VIDEO);
  const [commentOnVideo] = useMutation(COMMENT_ON_VIDEO);
  const [incrementVideoViews] = useMutation(INCREMENT_VIDEO_VIEWS);

  // Track like state per video
  const isVideoLiked = (video) => {
    if (!tokens?.id || !video?.likes) return false;
    return video.likes.some(like => like.user.id === tokens.id);
  };

  useEffect(() => {
    if (data?.getAllPosts) {
      // Filter only posts that have videos
      const videoPosts = data.getAllPosts.filter(post => post.videoUrl);
      setAllPosts(videoPosts);
    }
  }, [data]);

  useEffect(() => {
    if (videosData?.getAllVideos) {
      console.log(`📹 Loaded ${videosData.getAllVideos.length} videos from backend`);
      setAllVideos(videosData.getAllVideos);
    }
  }, [videosData]);

  // Refetch data when tokens are available
  useEffect(() => {
    if (tokens?.id) {
      refetch();
    }
  }, [tokens, refetch]);

  // Handle swipe up/down with smooth animation
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === null || isAnimating) return;
    const currentY = e.touches[0].clientY;
    const diffY = touchStartY.current - currentY;
    // Limit the drag distance for better UX
    const maxDrag = 100;
    const clampedDiffY = Math.max(-maxDrag, Math.min(maxDrag, diffY));
    setTranslateY(clampedDiffY);
  };

  const handleTouchEnd = (e) => {
    if (touchStartY.current === null || isAnimating) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY.current - touchEndY;
    
    if (Math.abs(diffY) > 50) {
      setIsAnimating(true);
      if (diffY > 0 && currentVideoIndex < allVideos.length - 1) {
        // Swipe up - animate to next video
        setTranslateY(-window.innerHeight);
        setTimeout(() => {
          setCurrentVideoIndex((prev) => prev + 1);
          setTranslateY(0);
          setIsAnimating(false);
        }, 300);
      } else if (diffY < 0 && currentVideoIndex > 0) {
        // Swipe down - animate to previous video
        setTranslateY(window.innerHeight);
        setTimeout(() => {
          setCurrentVideoIndex((prev) => prev - 1);
          setTranslateY(0);
          setIsAnimating(false);
        }, 300);
      } else {
        // Reset position if swipe is not valid
        setTranslateY(0);
      }
    } else {
      // Reset position if swipe distance is too small
      setTranslateY(0);
    }
    touchStartY.current = null;
  };

  // Handle keyboard up/down with smooth animation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isAnimating) return;
      
      if (e.key === 'ArrowUp' && currentVideoIndex > 0) {
        setIsAnimating(true);
        setTranslateY(window.innerHeight);
        setTimeout(() => {
          setCurrentVideoIndex((prev) => prev - 1);
          setTranslateY(0);
          setIsAnimating(false);
        }, 300);
      } else if (e.key === 'ArrowDown' && currentVideoIndex < allVideos.length - 1) {
        setIsAnimating(true);
        setTranslateY(-window.innerHeight);
        setTimeout(() => {
          setCurrentVideoIndex((prev) => prev + 1);
          setTranslateY(0);
          setIsAnimating(false);
        }, 300);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, allVideos.length, isAnimating]);

  // Handle wheel scroll for reel change with smooth animation
  const WHEEL_COOLDOWN = 400; // ms
  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastWheelTime.current < WHEEL_COOLDOWN || isAnimating) return;
    
    if (e.deltaY > 0 && currentVideoIndex < allVideos.length - 1) {
      setIsAnimating(true);
      setTranslateY(-window.innerHeight);
      setTimeout(() => {
        setCurrentVideoIndex((prev) => prev + 1);
        setTranslateY(0);
        setIsAnimating(false);
      }, 300);
      lastWheelTime.current = now;
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      setIsAnimating(true);
      setTranslateY(window.innerHeight);
      setTimeout(() => {
        setCurrentVideoIndex((prev) => prev - 1);
        setTranslateY(0);
        setIsAnimating(false);
      }, 300);
      lastWheelTime.current = now;
    }
  };

  // Like handler
  const handleHeartClick = async () => {
    const video = allVideos[currentVideoIndex];
    if (!video) return;
    try {
      await likeVideo({ variables: { videoId: video.id } });
      // Refetch videos to update like count
      if (typeof refetchVideos === 'function') refetchVideos();
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Comment handler
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const video = allVideos[currentVideoIndex];
    if (!video || !commentInput.trim()) return;
    try {
      await commentOnVideo({ variables: { videoId: video.id, text: commentInput } });
      setCommentInput("");
      // Refetch videos to update comments
      if (typeof refetchVideos === 'function') refetchVideos();
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  // Track view count with 3-second delay when video changes
  useEffect(() => {
    const video = allVideos[currentVideoIndex];
    if (!video) {
      console.log('⚠️ No video found at index:', currentVideoIndex);
      return;
    }

    console.log(`🎬 Starting 3-second timer for video ${video.id} (${video.title})`);
    console.log(`📊 Current views: ${video.views}`);

    // Set a 3-second timer before counting the view
    const viewTimer = setTimeout(async () => {
      try {
        console.log(`⏰ 3 seconds passed, tracking view for video ${video.id}`);
        const result = await incrementVideoViews({ variables: { videoId: video.id } });
        console.log(`✅ View tracked successfully:`, result.data);
        
        // Update the local state to reflect new view count
        setAllVideos(prevVideos => 
          prevVideos.map(v => 
            v.id === video.id 
              ? { ...v, views: result.data.incrementVideoViews.views }
              : v
          )
        );
        console.log(`📈 Updated local state with new view count: ${result.data.incrementVideoViews.views}`);
      } catch (error) {
        console.error('❌ Error tracking video view:', error);
        console.error('Error details:', error.message);
      }
    }, 3000); // 3 seconds delay

    // Cleanup timer if user swipes away before 3 seconds
    return () => {
      console.log(`🧹 Cleaning up timer for video ${video.id}`);
      clearTimeout(viewTimer);
    };
    // eslint-disable-next-line
  }, [currentVideoIndex, incrementVideoViews]);

  // Render individual reel card
  const renderReelCard = (video, index, offset = 0) => {
    if (!video) return null;
    const liked = isVideoLiked(video);
    return (
      <div
        key={`${video.id}-${index}`}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full absolute"
        style={{
          height: '35rem', 
          boxShadow: '0 8px 40px 8px rgba(0,0,0,0.35)',
          transform: `translateY(${offset + translateY}px)`,
          transition: isAnimating ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'transform 0.1s ease-out',
          zIndex: offset === 0 ? 10 : 5
        }}
        onDoubleClick={offset === 0 ? handleHeartClick : undefined}
      >
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <video
            ref={offset === 0 ? videoRef : null}
            className="w-full h-full object-cover"
            autoPlay={offset === 0}
            loop
            muted={isMuted}
            onClick={offset === 0 ? (e => {
              if (e.target.paused) {
                e.target.play();
              } else {
                e.target.pause();
              }
            }) : undefined}
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Video info overlay - only show on current video */}
          {offset === 0 && (
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center mb-2">
                <img
                  src={video.createdBy?.profileImage || "https://ui-avatars.com/api/?name=User&background=random"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="font-semibold">
                  {video.createdBy?.name || "User"}
                </span>
                <button
                  className={`ml-3 px-3 py-1 rounded-full border text-xs font-semibold transition-colors
                    ${isFollowing
                      ? 'border-purple-600 bg-purple-600 text-white hover:bg-purple-700 hover:border-purple-700'
                      : 'border-white text-white bg-transparent hover:bg-purple-600 hover:border-purple-600'}
                  `}
                  onClick={handleFollowClick}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
              <p className="text-sm opacity-90">{video.title}</p>
              {video.description && (
                <p className="text-xs opacity-75 mt-1">{video.description}</p>
              )}
              {/* ...existing code... */}
      {/* Fixed Comment Sidebar UI */}
      {showCommentBox && currentVideo && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col" style={{transition: 'transform 0.3s', transform: 'translateX(0)'}}>
          <div className="flex items-center justify-between px-4 py-3 border-b text-black">
            <span className="font-semibold text-lg">Comments</span>
            <button onClick={() => setShowCommentBox(false)} className="text-gray-500 hover:text-black text-xl">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 text-black">
            {currentVideo.comments?.length === 0 && (
              <div className="text-gray-400 text-sm text-center mt-8">No comments yet.</div>
            )}
            {currentVideo.comments?.map((c) => (
              <div key={c.id} className="mb-3 flex items-center gap-2">
                <span className="font-semibold text-xs text-black">{c.user?.name || 'User'}:</span>
                <span className="text-xs text-black">{c.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex gap-2 p-4 border-t">
            <input
              type="text"
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-2 py-1 rounded border text-black placeholder-gray-500 bg-white"
            />
            <button type="submit" className="px-2 py-1 bg-purple-600 text-white rounded">Send</button>
          </form>
        </div>
      )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get current video to display
  const currentVideo = allVideos[currentVideoIndex];
  const nextVideo = allVideos[currentVideoIndex + 1];
  const prevVideo = allVideos[currentVideoIndex - 1];

  return (
    <div className="w-full min-h-screen bg-gray-50 relative">
      <style>{soundWaveStyle}</style>
      <div className="flex pt-0"> {/* Remove pt-16 since Navbar is gone */}
        {/* Sidebar (fixed on desktop) */}
        <Sidebar />
        <div className="flex-1 md:ml-64 relative">
          {/* Single Reel Card UI - Centered to entire browser window */}
          <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-50">
            <div className="w-full max-w-[22.8rem] mx-auto flex flex-col items-center justify-center py-8">
              {(loading || videosLoading) && (
                <span className="text-white text-xl">Loading videos...</span>
              )}
              {(error || videosError) && (
                <span className="text-red-400 text-xl">Error loading videos</span>
              )}
              {!loading && !videosLoading && !error && !videosError && allVideos.length === 0 && (
                <span className="text-white text-xl">No videos available</span>
              )}
              {currentVideo && (
                <div 
                  className="relative flex items-center justify-center w-full" 
                  style={{height: '35rem'}}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onWheel={handleWheel}
                >
                  {/* Previous Reel (above) */}
                  {prevVideo && renderReelCard(prevVideo, currentVideoIndex - 1, -window.innerHeight || -560)}
                  
                  {/* Current Reel */}
                  {renderReelCard(currentVideo, currentVideoIndex, 0)}
                  
                  {/* Next Reel (below) */}
                  {nextVideo && renderReelCard(nextVideo, currentVideoIndex + 1, window.innerHeight || 560)}
                  {/* UI Elements - only show for current video when not animating */}
                  {!isAnimating && (
                    <>
                      {/* Mute/unmute button top right of reel card */}
                      <button
                        onClick={handleMuteToggle}
                        className="absolute top-4 right-4 z-30 bg-white/80 rounded-full p-2 shadow hover:bg-white"
                        style={{ 
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        {isMuted ? (
                          <VolumeOff className="w-6 h-6 text-black" />
                        ) : (
                          <Volume2 className="w-6 h-6 text-black" />
                        )}
                      </button>
                      {/* Lucide icons vertical stack - outside right of reel card */}
                      <div
  className="flex flex-col items-center gap-6 absolute z-20"
  style={{
    right: '-3.5rem',
    top: '50%',
    transform: 'translateY(-50%)'
  }}
>
  {/* Like Icon and Count */}
  <div className="flex flex-col items-center">
    <Heart
      className={`w-7 h-7 cursor-pointer ${isVideoLiked(currentVideo) ? 'text-red-500' : 'text-black'}`}
      fill={isVideoLiked(currentVideo) ? 'red' : 'none'}
      onClick={handleHeartClick}
    />
    <span className="text-xs mt-1 text-black">{currentVideo?.likes?.length || 0}</span>
  </div>

  {/* Comment Icon and Count */}
  <div className="flex flex-col items-center">
    <MessageCircleMore className="w-7 h-7 text-black cursor-pointer" onClick={() => setShowCommentBox(v => !v)} />
    <span className="text-xs mt-1 text-black">{currentVideo?.comments?.length || 0}</span>
  </div>

  {/* Share Icon */}
  <Share2 className="w-7 h-7 text-black cursor-pointer" />

  {/* Bookmark Icon */}
  <Bookmark className="w-7 h-7 text-black cursor-pointer" />

  {/* Ellipsis Icon */}
  <Ellipsis className="w-7 h-7 text-black cursor-pointer" />
</div>

                      
                      {/* Song thumbnail box - outside bottom right corner */}
                      <div
                        className="absolute z-30 flex items-end"
                        style={{ 
                          right: '-4rem', 
                          bottom: '1rem'
                        }}
                      >
                        <img
                          src="/images/imgi_58_ab67706f000000024dcaadadcaa3eb4246b9c6b4.jpg"
                          alt="Song Thumbnail"
                          className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
                        />
                        {/* Sound wave animation overlay */}
                        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', height: '22px', pointerEvents: 'none' }}>
                          {/* Each bar uses transformOrigin: 'center' to grow from center */}
                          <div style={{ width: '3px', margin: '0 1.5px', background: '#fff', borderRadius: '2px', animation: 'wave 0.8s infinite', animationDelay: '0s', transformOrigin: 'center' }} />
                          <div style={{ width: '3px', margin: '0 1.5px', background: '#fff', borderRadius: '2px', animation: 'wave 0.8s infinite', animationDelay: '0.2s', transformOrigin: 'center' }} />
                          <div style={{ width: '3px', margin: '0 1.5px', background: '#fff', borderRadius: '2px', animation: 'wave 0.8s infinite', animationDelay: '0.4s', transformOrigin: 'center' }} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* FooterNav fixed at bottom (removed) */}
      {/* <FooterNav /> */}
    </div>
  );
};

export default Reel;