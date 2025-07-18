   const jwt = require('jsonwebtoken');

   const user_token = (user) => {
      try {
         const token = jwt.sign(
               { id: user._id, email: user.email, name : user.name,username : user.username,bio : user.bio, profileImage :user.profileImage, followers : user.followers, following : user.following, posts : user.posts },
               process.env.JWT_SECRET,
               { expiresIn: '7d' }
         );
         return token;
      } catch (error) {
         console.error("Error generating user token:", error);
         throw new Error("Authentication failed. Please try again.");
      }
   }


   module.exports = {user_token}


   