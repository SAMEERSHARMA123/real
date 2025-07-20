// Utility functions for formatting video metadata

/**
 * Format file size from bytes to MB
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "15.2 MB")
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

/**
 * Format duration from seconds to MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration (e.g., "2:35")
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return "0:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format view count with proper suffixes
 * @param {number} views - Number of views
 * @returns {string} - Formatted view count (e.g., "1.2K", "1.5M")
 */
export const formatViewCount = (views) => {
  if (!views || views === 0) return "0";
  
  if (views < 1000) return views.toString();
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
  return `${(views / 1000000).toFixed(1)}M`;
};