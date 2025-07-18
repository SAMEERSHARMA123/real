import React, { useState, useRef, useEffect } from "react";
import { FaTimes, FaVolumeUp, FaVolumeMute, FaPhotoVideo, FaPlayCircle, FaPauseCircle } from "react-icons/fa";
import { useMutation } from "@apollo/client";
import { CREATE_POST, GET_ALL_POSTS } from "../../graphql/mutations";
import { GetTokenFromCookie } from '../getToken/GetToken';

const VideoUpload = ({ show, onClose, onSuccess }) => {
  const [caption, setCaption] = useState("");
  const [video, setVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [coverTime, setCoverTime] = useState(0);
  const [coverImage, setCoverImage] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const videoRef = useRef();
  const hiddenVideoRef = useRef();
  const [videoUrl, setVideoUrl] = useState(null);
  const [createPost] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_ALL_POSTS }],
  });
  const user = GetTokenFromCookie();
  const debounceRef = useRef();
  const coverInputRef = useRef();
  const isCancelled = useRef(false);

  // Handle video file selection
  const handleVideoFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('video/')) {
    alert('Only video files are allowed');
    setVideo(null);
    return;
  }
  const videoElement = document.createElement('video');
  videoElement.preload = 'metadata';
  videoElement.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoElement.src);
    const duration = videoElement.duration;
    if (duration > 60) {
      alert('⚠️ Video should not be longer than 60 seconds.');
      setVideo(null);
    } else {
      setVideo(file);
        setVideoDuration(duration);
        setCoverTime(0);
        setCoverImage(null);
    }
  };
  videoElement.onerror = () => {
    alert('❌ Failed to load video metadata. Please try another file.');
    setVideo(null);
  };
  videoElement.src = URL.createObjectURL(file);
};

  // Generate cover image from video at selected time
  useEffect(() => {
    if (!video || coverTime == null) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const videoURL = URL.createObjectURL(video);
      const videoEl = document.createElement('video');
      videoEl.src = videoURL;
      videoEl.currentTime = coverTime;
      videoEl.crossOrigin = "anonymous";
      videoEl.muted = true;
      videoEl.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        setCoverImage(canvas.toDataURL('image/jpeg'));
        URL.revokeObjectURL(videoURL);
      };
      videoEl.onerror = () => {
        setCoverImage(null);
        URL.revokeObjectURL(videoURL);
      };
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [video, coverTime]);

  // Handle slider change
  const handleSlider = (e) => {
    setCoverTime(Number(e.target.value));
  };

  // Handle sound toggle (UI only)
  const handleSoundToggle = () => {
    setSoundOn((prev) => !prev);
  };

  // Custom play/pause handler for video preview
  const handleVideoPreviewClick = () => {
    if (videoRef.current) {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  // Track play/pause state for overlay icon
  const [isPaused, setIsPaused] = useState(true);
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onPlay = () => setIsPaused(false);
    const onPause = () => setIsPaused(true);
    vid.addEventListener('play', onPlay);
    vid.addEventListener('pause', onPause);
    setIsPaused(vid.paused);
    return () => {
      vid.removeEventListener('play', onPlay);
      vid.removeEventListener('pause', onPause);
    };
  }, [video]);

  // Store video object URL only when video changes
  useEffect(() => {
    if (video) {
      const url = URL.createObjectURL(video);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoUrl(null);
    }
  }, [video]);

  // For file input to select cover image from gallery
  const handleCoverImageButton = () => {
    if (coverInputRef.current) coverInputRef.current.click();
  };
  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setCoverImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id || !caption || !video) return;
    setIsUploading(true);
    isCancelled.current = false;
    try {
      await createPost({
        variables: {
          id: user.id,
          caption,
          image: null, // You can send coverImage if backend supports
          video,
        },
      });
      if (isCancelled.current) return;
      setIsUploading(false);
      setCaption("");
      setVideo(null);
      setCoverImage(null);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setIsUploading(false);
      if (!isCancelled.current) alert("Upload failed ❌");
    }
  };

  // Cancel upload handler
  const handleCancelUpload = () => {
    isCancelled.current = true;
    setIsUploading(false);
    setVideo(null);
    setCoverImage(null);
    setCaption("");
  };

  if (!show) return null;

  // Add keyframes for progress bar animation (quick fix)
  const progressBarKeyframes = `@keyframes progressBar {0% {background-position: -200% 0;}100% {background-position: 200% 0;}}`;

  return (
    <>
      <style>{progressBarKeyframes}</style>
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-4 md:p-4 rounded-2xl shadow-2xl w-[540px] md:w-[650px] max-w-full box-border overflow-hidden relative border border-purple-100 flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-700 hover:text-red-500 bg-white/60 rounded-full p-2 shadow-md transition-colors"
        >
          <FaTimes />
        </button>
          <h2 className="text-2xl font-bold text-center text-purple-600 mb-4">Upload Video</h2>
            {!video ? (
            <div className="flex flex-col items-center justify-center w-full h-[160px] md:h-[200px]">
              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-[160px] md:h-[200px] rounded-xl cursor-pointer bg-white/40 border-2 border-dashed border-purple-400 relative overflow-hidden group transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                style={{ boxShadow: '0 4px 32px 0 rgba(168,139,250,0.10)' }}
              >
                <FaPhotoVideo className="w-12 h-12 text-purple-400 mb-2 z-20 group-hover:animate-bounce-slow transition-all" />
                <span className="text-base font-bold text-purple-600 group-hover:text-white transition-all duration-300 z-20 group-hover:scale-110">Select Video</span>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />
              </label>
            </div>
            ) : (
              <>
              <div className="flex flex-col md:flex-row gap-2 md:gap-3 box-border overflow-hidden w-full">
                {/* Left: Video Preview with custom play/pause */}
                <div className="flex-1 flex items-center justify-center w-full h-[160px] md:h-[200px] max-w-full md:max-w-[380px] box-border">
                  <div className="relative w-full h-full flex items-center justify-center cursor-pointer" onClick={handleVideoPreviewClick}>
                  <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full h-[160px] md:h-[200px] rounded-xl object-cover bg-black"
                      style={{ maxWidth: 320, maxHeight: 200 }}
                      muted
                      controls={false}
                    />
                    {/* Show triangular play icon overlay only when paused, with fully transparent background */}
                    {isPaused && (
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ background: 'transparent' }}>
                        <FaPlayCircle className="text-white opacity-60 text-5xl md:text-6xl drop-shadow-lg" />
                      </span>
                    )}
                  </div>
                </div>
                {/* Right: Controls - Cover Photo Section */}
                <div className="w-full md:w-[180px] flex flex-col items-center mt-2 md:mt-0 max-w-full md:max-w-[240px] box-border">
                  <span className="text-gray-700 mb-2 text-base md:mb-1 md:text-sm text-center">Cover photo</span>
                  <div className="w-[180px] h-[90px] md:w-[180px] md:h-[100px] max-w-full rounded-lg border-2 border-purple-400 mb-2 md:mb-1 bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm box-border">
                    {coverImage ? (
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">No cover</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="bg-purple-500 text-white w-[180px] md:w-[180px] px-4 py-2 rounded-lg mb-2 flex items-center justify-center gap-2 text-sm md:px-3 md:py-1 md:text-xs disabled:opacity-50 box-border"
                    disabled={!video}
                    onClick={handleCoverImageButton}
                  >
                    <FaPhotoVideo className="text-lg md:text-base" />
                    Cover Image
                  </button>
                  {/* Hidden file input for cover image selection */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={coverInputRef}
                    style={{ display: 'none' }}
                    onChange={handleCoverFileChange}
                  />
                  <input
                    type="range"
                    min={0}
                    max={videoDuration ? videoDuration.toFixed(1) : 0}
                    step={0.1}
                    value={coverTime}
                    onChange={handleSlider}
                    className="w-[180px] md:w-[180px] mb-2 accent-purple-500 md:mb-1 box-border"
                    style={{ touchAction: 'none', height: '32px' }}
                    disabled={!video}
                  />
                  <div className="flex justify-between w-full text-xs text-gray-500 mb-2 md:text-[10px] md:mb-2">
                    <span>0s</span>
                    <span>{videoDuration ? videoDuration.toFixed(1) : '0.0'}s</span>
                  </div>
                  <div className="flex items-center mt-2 md:mt-0">
                    <span className="mr-2 text-sm md:text-xs">Sound {soundOn ? 'on' : 'off'}</span>
                    <button
                      type="button"
                      className="bg-white border-2 border-purple-400 rounded-full p-2 md:p-1"
                      onClick={handleSoundToggle}
                    >
                      {soundOn ? <FaVolumeUp className="text-purple-500 text-lg md:text-base" /> : <FaVolumeMute className="text-purple-500 text-lg md:text-base" />}
                    </button>
                  </div>
                </div>
              </div>
              {/* Caption Input */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4">
                <textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-2 rounded-xl border-2 border-purple-100 focus:border-purple-400 outline-none resize-none text-sm placeholder-gray-400 shadow-sm"
                  rows={2}
                />
                <div className="flex justify-end gap-2 mt-1">
                  {video && !isUploading && (
                    <button
                      type="button"
                      onClick={() => { setVideo(null); setCoverImage(null); setCoverTime(0); setCaption(""); }}
                      className="bg-red-100 text-red-500 px-4 py-1 rounded-xl hover:bg-red-200 font-semibold shadow text-sm"
                    >
                      Remove
                    </button>
                  )}
                  {isUploading && (
                    <button
                      type="button"
                      onClick={handleCancelUpload}
                      className="bg-gray-200 text-gray-700 px-4 py-1 rounded-xl hover:bg-gray-300 font-semibold shadow text-sm"
                    >
                      Cancel
                    </button>
                  )}
          <button
            type="submit"
                    className="relative bg-purple-500 text-white px-6 py-1 rounded-xl font-bold shadow-md hover:bg-purple-600 disabled:opacity-60 disabled:cursor-not-allowed text-sm overflow-hidden"
                    disabled={isUploading || !video || !caption}
          >
            {isUploading && (
                    <span
                      className="absolute left-0 top-0 h-full w-full z-0"
                      style={{
                        background: "linear-gradient(90deg, #a78bfa33 0%, #a78bfa99 40%, #fff 50%, #a78bfa99 60%, #a78bfa33 100%)",
                        backgroundSize: "200% 100%",
                        backgroundPosition: "0% 0",
                        animation: "progressBar 1.2s linear infinite"
                      }}
                    ></span>
              )}
                    <span className="relative z-10">
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </span>
          </button>
                </div>
        </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default VideoUpload; 