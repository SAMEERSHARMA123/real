import React, { useState, useEffect } from 'react';
import { FaCamera, FaTimes, FaUser, FaEdit, FaImage, FaSpinner, FaAt } from 'react-icons/fa';
import { useMutation } from '@apollo/client';
import { EDIT_PROFILE } from '../../graphql/mutations';
import { motion, AnimatePresence } from 'framer-motion';
import { GetTokenFromCookie } from '../getToken/GetToken';

const SuccessPopup = ({ show }) => (
  <div
    className={`fixed top-20 left-0 w-full flex justify-center z-[9999] transition-all duration-500 ${
      show
        ? 'opacity-100 scale-100 translate-y-0'
        : 'opacity-0 scale-90 -translate-y-8 pointer-events-none'
    }`}
    style={{ pointerEvents: show ? 'auto' : 'none' }}
  >
    <div className="flex items-center gap-3 px-6 py-3 border-2 border-purple-500 text-black rounded-xl shadow-lg bg-white">
      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-semibold text-lg">Profile Updated Successfully!</span>
    </div>
  </div>
);

const ErrorPopup = ({ show, message }) => (
  <div
    className={`fixed top-24 left-0 w-full flex justify-center z-[9999] transition-all duration-500 ${
      show
        ? 'opacity-100 scale-100 translate-y-0'
        : 'opacity-0 scale-90 -translate-y-8 pointer-events-none'
    }`}
    style={{ pointerEvents: show ? 'auto' : 'none' }}
  >
    <div className="flex items-center gap-3 px-6 py-3 border-2 border-red-500 text-black rounded-xl shadow-lg bg-white">
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <span className="font-semibold text-lg">{message}</span>
    </div>
  </div>
);

export default function ProfileHeader({ profile, updateProfile, showProfileEditForm, setShowProfileEditForm }) {
  
  const [name, setName] = useState( "");
  const [username, setUsername] = useState( "");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(profile.avatar ||null);
  const [avatar, setAvatar] = useState("");
  const [coverImage, setCoverImage] = useState( "");
  const [showSuccess, setShowSuccess] = useState(false);
  const [editProfile, { loading }] = useMutation(EDIT_PROFILE);
  const [user ,setUser] = useState();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
  if (profile?.avatar) {
    setAvatar(profile?.avatar);
  }

  if (profile?.cover) {
    setCoverImage(profile?.cover);
  }
}, [profile.avatar,profile.cover]);
  
  useEffect(()=>{
        const decodedUser = GetTokenFromCookie();
      setUser(decodedUser);

    },[])

  // Prevent background scrolling when form is open
  useEffect(() => {
    try {
      if (showProfileEditForm) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      // Cleanup function to restore scrolling when component unmounts
      return () => {
        try {
          document.body.style.overflow = 'unset';
        } catch (error) {
          console.error("Error resetting body overflow on cleanup:", error);
        }
      };
    } catch (error) {
      console.error("Error setting body overflow:", error);
    }
  }, [showProfileEditForm]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target.result);
        // Update parent component with new cover image
        updateProfile({ cover: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting profile update:", { name, username, caption, image: image?.name });
      
      const variables = {};
      if(user) variables.id = user.id;
      if (name) variables.name = name;
      if (username) variables.username = username;
      if (caption) variables.caption = caption;
      if (image) variables.image = image;
      
      const { data } = await editProfile({
        variables,
      });
      
      console.log("Profile update response:", data);
      if (data && data.editProfile) {
        const updates = {};
        if (data.editProfile.profileImage) {
          updates.avatar = data.editProfile.profileImage;
          setAvatar(data.editProfile.profileImage);
        }
        if (data.editProfile.name) {
          updates.name = data.editProfile.name;
        }
        if (data.editProfile.username) {
          updates.username = data.editProfile.username;
        }
        if (data.editProfile.bio) {
          updates.bio = data.editProfile.bio;
        }
        // Update parent component
        updateProfile(updates);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
      setShowProfileEditForm(false);
      setName("");
      setUsername("");
      setCaption("");
      setImage(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMessage("Failed to update profile: " + (err.message || "Unknown error"));
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <SuccessPopup show={showSuccess} />
      <ErrorPopup show={showError} message={errorMessage} />
      <div className="w-full max-w-3xl relative px-4 md:px-0 md:pr-16">
        <div className="flex justify-center relative">
          <div className="relative w-full">
          <img
              src={coverImage}
            alt="cover"
            className="w-full h-32 xs:h-36 sm:h-40 md:h-44 object-cover rounded-b-3xl"
          />
            {/* Camera Icon for Cover Image */}
            <div className="absolute bottom-3 right-4">
              <motion.label
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                htmlFor="cover-image-upload"
                className="cursor-pointer transition-all duration-300"
              >
                <FaCamera className="text-white w-5 h-5 drop-shadow-lg" />
                <input
                  id="cover-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </motion.label>
            </div>
          </div>
          <div className="absolute left-[67%] -translate-x-1/2 md:[left:calc(33.3333%+70px)] md:translate-x-0 -bottom-16 xs:-bottom-18 sm:-bottom-20 flex flex-col items-center">
            <div className="w-28 h-28 xs:w-32 xs:h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
              <img
                src={avatar || "https://ui-avatars.com/api/?name=User&background=EEE&color=888"}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Plus Icon attached just below avatar */}
            <div className="-mt-6 xs:-mt-7 sm:-mt-8 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-purple-600 rounded-full flex items-center justify-center w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 shadow-lg border-2 border-white focus:outline-none cursor-pointer transition-all duration-300"
                onClick={() => {
                  setName(profile.name || "");
                  setUsername(profile.username || "");
                  setCaption(profile.bio || "");
                  setShowProfileEditForm(true);
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <FaEdit className="text-white w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7" />
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {showProfileEditForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 pt-24 md:pt-20"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden max-h-[90vh] flex flex-col"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-purple-700 relative flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowProfileEditForm(false)}
                    className="absolute top-3 right-3 text-purple-700 transition-colors duration-200"
                  >
                    <FaTimes className="text-lg" />
                  </motion.button>
                  <div className="flex items-center space-x-3">
                    <div>
                      <h2 className="text-lg font-bold text-purple-700">Edit Profile</h2>
                      <p className="text-purple-600 text-xs">Update your information</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="p-4 flex-1 overflow-y-auto scrollbar-hide">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-1"
                    >
                      <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <FaUser className="text-purple-600" />
                        <span>Display Name</span>
                      </label>
                <input
                  type="text"
                        placeholder="Enter your name..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none text-gray-700 placeholder-gray-400 text-sm"
                      />
                    </motion.div>

                    {/* Username Input */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="space-y-1"
                    >
                      <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <FaAt className="text-purple-600" />
                        <span>Username</span>
                      </label>
                <input
                  type="text"
                        placeholder="Enter username..."
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none text-gray-700 placeholder-gray-400 text-sm"
                      />
                      <p className="text-xs text-gray-500">Username will be used as your unique identifier</p>
                    </motion.div>

                    {/* Caption Input */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-1"
                    >
                      <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <FaEdit className="text-purple-600" />
                        <span>Bio/Caption</span>
                      </label>
                      <textarea
                        placeholder="Write something about yourself..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                        rows="2"
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none text-gray-700 placeholder-gray-400 resize-none text-sm"
                      />
                    </motion.div>

                    {/* Image Upload */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-1"
                    >
                      <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <FaImage className="text-purple-600" />
                        <span>Profile Picture</span>
                      </label>
                      <div className="space-y-2">
                  {!image ? (
                          <motion.label
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-purple-400 rounded-lg cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group"
                          >
                            <motion.div
                              animate={{ y: [0, -3, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <FaCamera className="w-6 h-6 text-purple-500 mb-2 group-hover:text-purple-600 transition-colors duration-300" />
                            </motion.div>
                            <span className="text-purple-700 font-medium text-center text-sm">
                              <span className="block">Click to upload</span>
                              <span className="text-xs text-purple-500">or drag and drop</span>
                            </span>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={e => setImage(e.target.files[0])}
                        className="hidden"
                      />
                          </motion.label>
                        ) : (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-green-400 rounded-lg bg-gradient-to-br from-green-50 to-green-100 relative"
                          >
                            <div className="flex items-center space-x-2">
                              <FaImage className="w-5 h-5 text-green-600" />
                              <span className="text-green-700 font-medium text-sm">{image.name}</span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setImage(null)}
                              className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200 text-xs font-medium"
                      >
                        Remove
                            </motion.button>
                          </motion.div>
                  )}
                </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                  type="submit"
                      disabled={loading || (!name && !username && !caption && !image)}
                      className={`w-full py-3 px-4 rounded-lg font-semibold text-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 text-sm ${
                        loading || (!name && !username && !caption && !image)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-white border-2 border-purple-600 hover:bg-purple-600 hover:text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="w-4 h-4 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <FaEdit className="w-4 h-4" />
                          <span>Update Profile</span>
                        </>
                      )}
                    </motion.button>
              </form>
            </div>
              </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
  