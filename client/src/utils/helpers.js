/**
 * Format image URLs to handle both relative and absolute paths,
 * ensuring they work both locally and on hosted environments
 * 
 * @param {string} url - The image URL to format
 * @returns {string} - The properly formatted URL
 */
export const formatImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/400x200?text=No+Image";
  
  // If it's already an absolute URL, return it as is
  if (url.startsWith("http")) return url;
  
  // Get the API base URL from environment or use the default
  const apiBaseUrl = process.env.REACT_APP_BASE_URL?.replace('/api', '') || "https://swanbackend.onrender.com";
  
  // If it's a relative URL starting with /, prefix it with the base URL
  if (url.startsWith("/")) return `${apiBaseUrl}${url}`;
  
  // For any other format, just return the URL
  return url;
};

/**
 * Format a date to a readable string
 * 
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "Unknown date";
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}; 