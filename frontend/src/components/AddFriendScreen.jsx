import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, User, UserPlus, UserCheck, Shield, MessageCircle, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config/api';

const AddFriendsScreen = ({ onBack }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userFollowStatus, setUserFollowStatus] = useState({});

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchSuggestedUsers();
  }, []);

  // Fetch suggested users (users not followed by current user)
  const fetchSuggestedUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/getUsers`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const allUsersData = await response.json();
        const allUsers = allUsersData.data || allUsersData;

        // Filter out current user
        const otherUsers = allUsers.filter(user => 
          user._id !== currentUser?.id && user._id !== currentUser?._id
        );

        // Get first 20 users as suggestions
        const suggestions = otherUsers.slice(0, 20);
        setSuggestedUsers(suggestions);

        // Fetch follow status for suggested users
        for (const user of suggestions) {
          fetchFollowStatus(user._id);
        }
      }
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search users function
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      let users = [];

      try {
        const searchResponse = await fetch(
          `${API_BASE_URL}/auth/searchUsers?q=${encodeURIComponent(query)}`,
          { headers: getAuthHeaders() }
        );

        if (searchResponse.ok) {
          const resJson = await searchResponse.json();
          users = resJson.data || [];
        } else if (searchResponse.status === 404) {
          throw new Error('Search endpoint not found');
        }

      } catch (searchError) {
        console.log('Using fallback search method');
        try {
          const allUsersResponse = await fetch(`${API_BASE_URL}/auth/getUsers`, {
            headers: getAuthHeaders()
          });

          if (allUsersResponse.ok) {
            const allUsersData = await allUsersResponse.json();
            const allUsers = allUsersData.data || allUsersData;

            users = allUsers.filter(user =>
              user.username.toLowerCase().includes(query.toLowerCase()) &&
              user._id !== currentUser?.id &&
              user._id !== currentUser?._id
            );
          }
        } catch (fallbackError) {
          console.error('Fallback search also failed:', fallbackError);
          users = [];
        }
      }

      setSearchResults(users);

      // Fetch follow status for each user
      for (const user of users) {
        fetchFollowStatus(user._id);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch follow status for a user
  const fetchFollowStatus = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/follow/status/${userId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const status = await response.json();
        setUserFollowStatus(prev => ({
          ...prev,
          [userId]: status
        }));
      }
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async (user) => {
    const userId = user._id;
    const currentStatus = userFollowStatus[userId] || {};

    try {
      if (currentStatus.isFollowing) {
        const response = await fetch(`${API_BASE_URL}/follow/unfollow/${userId}`, {
          method: 'POST',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          setUserFollowStatus(prev => ({
            ...prev,
            [userId]: {
              ...prev[userId],
              isFollowing: false,
              canMessage: false,
              relationship: prev[userId]?.isFollowedBy ? 'follower' : 'none'
            }
          }));
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/follow/request/${userId}`, {
          method: 'POST',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          const result = await response.json();

          if (result.requiresApproval) {
            setUserFollowStatus(prev => ({
              ...prev,
              [userId]: {
                ...prev[userId],
                hasPendingRequest: true
              }
            }));
          } else {
            setUserFollowStatus(prev => ({
              ...prev,
              [userId]: {
                ...prev[userId],
                isFollowing: true,
                canMessage: prev[userId]?.isFollowedBy || false,
                relationship: prev[userId]?.isFollowedBy ? 'mutual' : 'following'
              }
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  // Start conversation
  const startConversation = async (user) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ recipientId: user._id })
      });

      if (response.ok) {
        const conversation = await response.json();
        window.location.href = `/messages/${conversation._id}`;
      } else {
        const error = await response.json();
        alert(error.msg || t('addFriends.cannotStartConversation'));
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert(t('addFriends.failedToStartConversation'));
    }
  };

  // Navigate to user profile
  const goToProfile = (user) => {
    window.location.href = `/profile/${user._id}`;
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      const timeoutId = setTimeout(() => {
        searchUsers(value);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  };

  // Get follow button text
  const getFollowButtonText = (userId) => {
    const status = userFollowStatus[userId] || {};
    if (status.hasPendingRequest) return t('addFriends.requested');
    if (status.isFollowing) return t('addFriends.following');
    return t('addFriends.follow');
  };

  // Get follow button style
  const getFollowButtonStyle = (userId) => {
    const status = userFollowStatus[userId] || {};
    if (status.hasPendingRequest) {
      return "bg-[#ffb3c6] text-gray-700 cursor-not-allowed";
    }
    if (status.isFollowing) {
      return "bg-white text-pink-700 border border-[#ff99b3] hover:bg-[#ffb3c6]";
    }
    return "bg-gradient-to-r from-pink-600 to-pink-500 text-white hover:opacity-90";
  };

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num?.toString() || '0';
  };

  // Render user card
  const renderUserCard = (user) => {
    const followStatus = userFollowStatus[user._id] || {};
    const isFriend = followStatus.relationship === 'mutual';

    return (
      <div key={user._id} className="bg-white/70 border border-[#ff99b3] p-4 rounded-xl hover:bg-[#ffb3c6] transition-colors">
        <div className="flex items-center space-x-3">
          <button onClick={() => goToProfile(user)} className="flex items-center space-x-3 flex-1">
            <div className="relative">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=200&bold=true`}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=200&bold=true`;
                }}
              />
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-pink-600 rounded-full p-1">
                  <Shield className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center space-x-1">
                <p className="font-bold text-pink-700">{user.username}</p>
                {user.isVerified && (
                  <Shield className="w-4 h-4 text-pink-600" />
                )}
                {isFriend && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    <Users className="w-3 h-3 inline mr-1" />
                    {t('addFriends.friendsLabel')}
                  </span>
                )}
                {followStatus.relationship === 'following' && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                    {t('addFriends.following')}
                  </span>
                )}
                {followStatus.relationship === 'follower' && (
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                    {t('addFriends.followsYou')}
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-sm">
                {formatNumber(user.followersCount || 0)} {t('addFriends.followers')}
                {user.bio && <span> • {user.bio.substring(0, 30)}{user.bio.length > 30 ? '...' : ''}</span>}
              </p>
            </div>
          </button>

          <div className="flex items-center space-x-2">
            {/* Message button - show if friends or can message */}
            {(isFriend || followStatus.canMessage) && (
              <button
                onClick={() => startConversation(user)}
                className="p-2 bg-pink-600 hover:bg-pink-700 rounded-full transition-colors"
                title={t('addFriends.sendMessage')}
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </button>
            )}

            {/* Follow button */}
            <button
              onClick={() => handleFollowToggle(user)}
              disabled={followStatus.hasPendingRequest}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 ${getFollowButtonStyle(user._id)}`}
            >
              {followStatus.isFollowing ? (
                <UserCheck className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span className="text-sm">{getFollowButtonText(user._id)}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFC0CB] text-black">
      {/* Header */}
      <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10">
        <div className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">{t('addFriends.addFriends')}</h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder={t('addFriends.searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-white border border-[#ff99b3] text-black pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Search Results */}
        {searchTerm.trim() ? (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">{t('addFriends.searchResults')}</h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="bg-white/70 border border-[#ff99b3] p-4 rounded-xl animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                      </div>
                      <div className="w-20 h-8 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-700">
                <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t('addFriends.noUsersFound')}</p>
                <p className="text-sm">{t('addFriends.tryDifferentSearch')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map(renderUserCard)}
              </div>
            )}
          </div>
        ) : (
          /* Suggested Users */
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">{t('addFriends.suggestedForYou')}</h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="bg-white/70 border border-[#ff99b3] p-4 rounded-xl animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                      </div>
                      <div className="w-20 h-8 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestedUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-700">
                <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t('addFriends.noSuggestionsAvailable')}</p>
                <p className="text-sm">{t('addFriends.trySearchingUsers')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestedUsers.map(renderUserCard)}
              </div>
            )}
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-white/70 border border-[#ff99b3] rounded-xl p-4 mt-8">
          <h3 className="font-bold mb-2">{t('addFriends.tipsTitle')}</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• {t('addFriends.tips.tip1')}</li>
            <li>• {t('addFriends.tips.tip2')}</li>
            <li>• {t('addFriends.tips.tip3')}</li>
            <li>• {t('addFriends.tips.tip4')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddFriendsScreen;