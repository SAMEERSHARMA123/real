import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { TRACK_VIDEO_VIEW } from '../graphql/mutations';

const useVideoViewTracker = (videoId, isPlaying = false) => {
  const [trackVideoView] = useMutation(TRACK_VIDEO_VIEW);
  const viewTrackedRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Reset tracking when video changes
    if (videoId) {
      viewTrackedRef.current = false;
    }
  }, [videoId]);

  useEffect(() => {
    if (!videoId || !isPlaying || viewTrackedRef.current) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Start 3-second timer when video starts playing
    timerRef.current = setTimeout(async () => {
      if (!viewTrackedRef.current && isPlaying) {
        try {
          await trackVideoView({
            variables: { videoId }
          });
          viewTrackedRef.current = true;
          console.log(`✅ View tracked for video ${videoId} after 3 seconds`);
        } catch (error) {
          console.error('Error tracking video view:', error);
        }
      }
    }, 3000); // 3 seconds

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [videoId, isPlaying, trackVideoView]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    isViewTracked: viewTrackedRef.current
  };
};

export default useVideoViewTracker;