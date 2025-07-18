import { jwtDecode } from "jwt-decode";

// Check if token is expired
function isTokenExpired(decoded) {
  if (!decoded?.exp) return true;
  const currentTime = Date.now() / 1000; // in seconds
  return decoded.exp < currentTime;
}

// Main function to get user info from token
export function GetTokenFromCookie() {
  try {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      console.warn("Token not found in cookie");
      return null;
    }

    try {
      const decoded = jwtDecode(token);

      try {
        if (isTokenExpired(decoded)) {
          console.warn("Token has expired");
          return null;
        }
      } catch (error) {
        console.error("Error checking token expiration:", error);
        return null;
      }

      return decoded;
    } catch (err) {
      console.error("Invalid token:", err);
      return null;
    }
  } catch (error) {
    console.error("Error accessing or parsing cookie:", error);
    return null;
  }
}

