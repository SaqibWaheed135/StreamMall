import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, X, Save, User, Mail, Calendar, MapPin, Link, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const EditProfileScreen = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    location: '',
    website: '',
    isPrivate: false
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [errors, setErrors] = useState({});


  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const getAuthHeadersJSON = () => {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/profile/edit`, {
          headers: getAuthHeadersJSON()
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('Fetched user data:', userData); // Debug log
          
          setUser(userData);
          setFormData({
            username: userData.username || '',
            email: userData.email || '',
            bio: userData.bio || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
            location: userData.location || '',
            website: userData.website || '',
            isPrivate: Boolean(userData.isPrivate) // FIXED: Ensure boolean value
          });
          setAvatarPreview(userData.avatar || '');
        } else {
          console.error('Failed to fetch user data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox specifically for isPrivate
    if (type === 'checkbox') {
      console.log(`Checkbox ${name} changed to:`, checked); // Debug log
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          avatar: 'File size must be less than 5MB'
        }));
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          avatar: 'Only JPEG, PNG, GIF, and WebP files are allowed'
        }));
        return;
      }

      setAvatarFile(file);
      setRemoveAvatar(false);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear avatar error
      if (errors.avatar) {
        setErrors(prev => ({
          ...prev,
          avatar: ''
        }));
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setRemoveAvatar(true);
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (formData.username && !/^[a-zA-Z0-9_]{3,30}$/.test(formData.username)) {
      newErrors.username = 'Username must be 3-30 characters and contain only letters, numbers, and underscores';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Bio validation
    if (formData.bio && formData.bio.length > 160) {
      newErrors.bio = 'Bio must be 160 characters or less';
    }

    // Website validation
    if (formData.website && formData.website.trim() !== '' && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must be a valid URL starting with http:// or https://';
    }

    // Age validation
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const formDataObj = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataObj.append(key, formData[key]);
        }
      });

      // Add avatar file if selected
      if (avatarFile) {
        formDataObj.append('avatar', avatarFile);
      } else if (removeAvatar) {
        formDataObj.append('removeAvatar', 'true');
      }

      console.log('Sending isPrivate value:', formData.isPrivate); // Debug log

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formDataObj
      });

      const data = await response.json();
      console.log('Save response:', data); // Debug log

      if (response.ok) {
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show success message
        alert('Profile updated successfully!');
        
        // Go back to profile
        if (onBack) {
          onBack();
        }
      } else {
        setErrors({ general: data.msg || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFC0CB] text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFC0CB] text-black">
      {/* Header */}
      <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Edit Profile</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-[#ffb3c6]/40 border border-[#ff99b3] rounded-lg p-4">
            <p className="text-pink-800">{errors.general}</p>
          </div>
        )}

        {/* Avatar Section */}
        <div className="bg-white/70 border border-[#ff99b3] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={avatarPreview || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.username || 'User')}&background=random&color=fff&size=200&bold=true`}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#ff99b3]"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.username || 'User')}&background=random&color=fff&size=200&bold=true`;
                }}
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-white/90 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-5 h-5 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <div className="flex space-x-3">
                <label
                  htmlFor="avatar-upload"
                  className="px-4 py-2 bg-white border border-[#ff99b3] text-black rounded-lg hover:bg-[#ffb3c6] transition-colors cursor-pointer text-sm"
                >
                  Change Photo
                </label>
                {(avatarPreview || user?.avatar) && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              {errors.avatar && (
                <p className="text-red-600 text-sm mt-2">{errors.avatar}</p>
              )}
              <p className="text-gray-700 text-xs mt-2">
                JPEG, PNG, GIF, or WebP. Max 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white/70 border border-[#ff99b3] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-[#ff99b3] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="text-red-600 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-[#ff99b3] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white border border-[#ff99b3] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white border border-[#ff99b3] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-[#ff99b3] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {errors.dateOfBirth && (
                <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-[#ff99b3] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="City, Country"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link className="w-4 h-4 inline mr-2" />
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-[#ff99b3] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="https://yourwebsite.com"
              />
              {errors.website && (
                <p className="text-red-600 text-sm mt-1">{errors.website}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white/70 border border-[#ff99b3] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Bio</h2>
          <div className="relative">
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              maxLength={160}
              className="w-full p-3 bg-white border border-[#ff99b3] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              placeholder="Tell people about yourself..."
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-700">
              {formData.bio.length}/160
            </div>
          </div>
          {errors.bio && (
            <p className="text-red-600 text-sm mt-1">{errors.bio}</p>
          )}
        </div>

        {/* Privacy Settings - FIXED */}
        <div className="bg-white/70 border border-[#ff99b3] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Privacy Settings</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {formData.isPrivate ? <EyeOff className="w-5 h-5 text-pink-700" /> : <Eye className="w-5 h-5 text-pink-700" />}
              <div>
                <p className="font-medium text-black">Private Account</p>
                <p className="text-sm text-gray-700">
                  Only approved followers can see your posts, videos, and profile details
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate === true}  // FIXED: Explicit boolean check
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white/70 border border-[#ff99b3] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
          <div className="space-y-3">
            <button className="w-full p-3 text-left bg-red-100 border border-red-300 rounded-lg text-red-700 hover:bg-red-200 transition-colors">
              <p className="font-medium">Deactivate Account</p>
              <p className="text-sm text-red-600">Temporarily disable your account</p>
            </button>
            <button className="w-full p-3 text-left bg-red-100 border border-red-300 rounded-lg text-red-700 hover:bg-red-200 transition-colors">
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-red-600">Permanently delete your account and all data</p>
            </button>
          </div>
        </div>

        {/* Save Button (Mobile) */}
        <div className="pb-safe-area">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;