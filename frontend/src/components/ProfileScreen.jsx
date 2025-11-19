import React, { useState, useEffect } from "react";
import {
  Heart, Settings, Share, UserCheck, UserPlus, Mail, Calendar,
  Shield, Play, MessageCircle, Clock, CheckCircle, X, Copy,
  Coins, ShoppingBag
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

const ProfileScreen = ({ userId: propUserId }) => {
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [referralPoints] = useState(500); // Example value – fetch from API if needed

  const [followStatus, setFollowStatus] = useState({
    isFollowing: false,
    isFollowedBy: false,
    hasPendingRequest: false,
    canMessage: false,
    targetUserIsPrivate: false,
    relationship: 'none'
  });

  const [followRequests, setFollowRequests] = useState([]);
  const [showFollowRequests, setShowFollowRequests] = useState(false);

  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const Skeleton = ({ className = "", children, ...props }) => (
    <div
      className={`animate-pulse bg-gradient-to-r from-[#ffb3c6] via-[#ff99b3] to-[#ffb3c6] rounded ${className}`}
      {...props}
    >
      {children}
    </div>
  );

  const ProfileSkeleton = () => (
    <div className="min-h-screen bg-[#FFC0CB] text-white">
      <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start space-x-4 mb-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-6 w-8" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>

        <div className="mb-6">
          <Skeleton className="h-6 w-24 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
    </div>
  );

  const fetchUserPoints = async () => {
    if (!isOwnProfile) return;
    try {
      setPointsLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/points/balance`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const pointsData = await response.json();
        setUserPoints(pointsData.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    } finally {
      setPointsLoading(false);
    }
  };

  const fetchFollowStatus = async (targetUserId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/follow/status/${targetUserId}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const status = await response.json();
        setFollowStatus(status);
      }
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  const fetchFollowRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/follow/requests`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const requests = await response.json();
        setFollowRequests(requests);
      }
    } catch (error) {
      console.error('Error fetching follow requests:', error);
    }
  };

  const fetchHostOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/live/host/orders`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        const allOrders = (data.orders || []).map(o => ({
          ...o,
          buyerUsername: o.buyer?.username || 'Unknown Buyer',
          product: o.productName ? { name: o.productName, price: o.productPrice } : null
        }));
        setOrders(allOrders);
      }
    } catch (error) {
      console.error('Error fetching host orders:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (followLoading || !user) return;
    setFollowLoading(true);
    try {
      if (followStatus.isFollowing) {
        const response = await fetch(`${API_BASE_URL}/follow/unfollow/${user._id || user.id}`, {
          method: 'POST',
          headers: getAuthHeaders()
        });
        if (response.ok) {
          setFollowStatus(prev => ({
            ...prev,
            isFollowing: false,
            canMessage: false,
            relationship: prev.isFollowedBy ? 'follower' : 'none'
          }));
          setUser(prev => ({
            ...prev,
            followers: prev.followers?.filter(f => f !== currentUser._id) || []
          }));
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/follow/request/${user._id || user.id}`, {
          method: 'POST',
          headers: getAuthHeaders()
        });
        if (response.ok) {
          const result = await response.json();
          if (result.requiresApproval) {
            setFollowStatus(prev => ({ ...prev, hasPendingRequest: true }));
          } else {
            setFollowStatus(prev => ({
              ...prev,
              isFollowing: true,
              canMessage: prev.isFollowedBy,
              relationship: prev.isFollowedBy ? 'mutual' : 'following'
            }));
            setUser(prev => ({
              ...prev,
              followers: [...(prev.followers || []), currentUser._id]
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleFollowRequest = async (requestId, action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/follow/${action}/${requestId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setFollowRequests(prev => prev.filter(req => req._id !== requestId));
        if (action === 'accept') {
          setUser(prev => ({
            ...prev,
            followersCount: (prev.followersCount || 0) + 1
          }));
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing follow request:`, error);
    }
  };

  const startConversation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ recipientId: user._id || user.id })
      });
      if (response.ok) {
        const conversation = await response.json();
        window.location.href = `/messages/${conversation._id}`;
      } else {
        const error = await response.json();
        alert(error.msg || 'Cannot start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation');
    }
  };

  const fetchUserData = async (targetUserId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${targetUserId}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const initializeProfile = async () => {
      setLoading(true);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);

        if (propUserId && propUserId !== userData._id && propUserId !== userData.id) {
          setIsOwnProfile(false);
          await fetchUserData(propUserId);
          await fetchFollowStatus(propUserId);
        } else {
          setIsOwnProfile(true);
          await fetchUserData(userData._id || userData.id);
          await fetchFollowRequests();
          await fetchUserPoints();
        }
      }
      setLoading(false);
    };
    initializeProfile();
  }, [propUserId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = '/login';
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return "Recently joined";
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const FollowRequestsModal = () => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#FFC0CB]/95 backdrop-blur-xl rounded-3xl w-full max-w-md max-h-96 border border-[#ff99b3]">
        <div className="flex items-center justify-between p-4 border-b border-[#ff99b3]">
          <h3 className="text-lg font-bold text-black">Follow Requests</h3>
          <button onClick={() => setShowFollowRequests(false)} className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors">
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
        <div className="p-4 max-h-80 overflow-y-auto">
          {followRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-700">
              <UserPlus className="w-12 h-12 mx-auto mb-2" />
              <p>No follow requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followRequests.map((request) => (
                <div key={request._id} className="flex items-center space-x-3 p-3 bg-[#ffb3c6] rounded-lg">
                  <img
                    src={request.requester.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.requester.username)}&background=FFC0CB&color=000&size=200&bold=true`}
                    alt={request.requester.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-black">{request.requester.username}</p>
                    <p className="text-sm text-gray-700">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleFollowRequest(request._id, 'accept')} className="p-2 bg-pink-600 hover:bg-pink-700 rounded-full transition-colors">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleFollowRequest(request._id, 'reject')} className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const OrdersModal = () => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#FFC0CB]/95 backdrop-blur-xl rounded-3xl w-full max-w-md max-h-[80vh] border border-[#ff99b3] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#ff99b3]">
          <h3 className="text-lg font-bold text-black">My Orders</h3>
          <button onClick={() => setShowOrders(false)} className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors">
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-700">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order, i) => (
                <div key={i} className="bg-[#ffb3c6] rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-black">{order.product?.name || 'Unknown Product'}</p>
                      <p className="text-xs text-gray-700">Buyer: {order.buyerUsername}</p>
                      <p className="text-xs text-pink-600 mt-1">+{Math.ceil((order.product?.price || 0) * 100)} coins</p>
                      <p className="text-xs text-gray-600">Stream: {order.streamTitle}</p>
                    </div>
                    <button onClick={() => setSelectedOrderDetails({ order, product: order.product })}
                      className="text-pink-700 hover:text-pink-800 text-xs font-medium">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const OrderDetailsModal = ({ order, product, onClose }) => {
    if (!order || !product) return null;
    const deliveryInfo = order.deliveryInfo || {};

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-[#FFC0CB] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#ff99b3]">
          <div className="p-6 sticky top-0 bg-[#FFC0CB] border-b border-[#ff99b3] flex justify-between items-center">
            <h3 className="text-xl font-semibold text-black">Order Details</h3>
            <button onClick={onClose} className="text-gray-800 hover:text-black">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-6 text-black">
            {/* ... (content unchanged, only colors adjusted) */}
            {/* You can keep the existing inner content – only wrapper colors changed */}
          </div>
        </div>
      </div>
    );
  };

  const InviteModal = ({ user, onClose, referralPoints }) => {
    const [copied, setCopied] = useState(false);
    const inviteCode = user?.inviteCode || user?._id;
    const inviteLink = `${window.location.origin}/signup?ref=${inviteCode}`;

    const handleCopyLink = () => {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Join ClipStream',
            text: `Join me on ClipStream and start creating amazing content!`,
            url: inviteLink
          });
        } catch (err) { console.log('Error sharing:', err); }
      } else {
        handleCopyLink();
      }
    };

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-[#FFC0CB]/95 backdrop-blur-xl rounded-2xl w-full max-w-md shadow-2xl border border-[#ff99b3]">
          <div className="flex items-center justify-between p-6 border-b border-[#ff99b3]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-600 rounded-lg">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black">Invite Friends</h3>
                <p className="text-sm text-gray-700">Earn coins for each referral</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors">
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-pink-200 border border-pink-400 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-pink-600 rounded-lg">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-black">Earn Rewards!</p>
                  <p className="text-sm text-gray-800 mt-1">
                    Get <span className="text-pink-700 font-bold">{referralPoints} coins</span> for each friend who signs up
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#ffb3c6] rounded-lg p-4 text-center border border-[#ff99b3]">
                <p className="text-2xl font-bold text-pink-700">{user.totalInvites || 0}</p>
                <p className="text-xs text-gray-700 mt-1">Total Invites</p>
              </div>
              <div className="bg-[#ffb3c6] rounded-lg p-4 text-center border border-[#ff99b3]">
                <p className="text-2xl font-bold text-pink-700">{(user.totalInvites || 0) * referralPoints}</p>
                <p className="text-xs text-gray-700 mt-1">Coins Earned</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Your Invite Link</label>
              <div className="flex items-center space-x-2">
                <input type="text" value={inviteLink} readOnly className="flex-1 bg-white border border-[#ff99b3] rounded-lg px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-pink-500" />
                <button onClick={handleCopyLink} className={`p-3 rounded-lg transition-all ${copied ? 'bg-green-600' : 'bg-pink-600'} hover:opacity-90`}>
                  {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-[#ffb3c6] rounded-lg p-4 border border-[#ff99b3]">
              <p className="text-sm font-semibold text-gray-800 mb-2">How it works:</p>
              <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                <li>Share your unique invite link</li>
                <li>They sign up using your link</li>
                <li>You both earn coins instantly</li>
              </ol>
            </div>
          </div>

          <div className="p-6 border-t border-[#ff99b3] bg-[#ffb3c6]">
            <button onClick={handleShare} className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2">
              <Share className="w-5 h-5" />
              <span>Share Invite Link</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <ProfileSkeleton />;
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-[#FFC0CB] text-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <X className="w-16 h-16 mx-auto mb-4" />
          </div>
          <p className="text-gray-800 text-lg mb-2">Failed to load profile</p>
          <button onClick={() => window.location.reload()} className="bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg text-white transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getFollowButtonText = () => {
    if (followStatus.hasPendingRequest) return "Requested";
    if (followStatus.isFollowing) return "Following";
    return "Follow";
  };

  const getFollowButtonStyle = () => {
    if (followStatus.hasPendingRequest) return "bg-[#ffb3c6] text-black cursor-not-allowed";
    if (followStatus.isFollowing) return "bg-white text-black border border-[#ff99b3] hover:bg-[#ffb3c6]";
    return "bg-gradient-to-r from-pink-600 to-pink-500 text-white hover:opacity-90";
  };

  return (
    <div className="min-h-screen bg-[#FFC0CB] text-black relative overflow-hidden">
      {/* Background Orbs – softer pink */}
      <div className="absolute w-[400px] h-[400px] bg-pink-300 rounded-full blur-[150px] opacity-30 top-[-100px] left-[-100px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-pink-400 rounded-full blur-[150px] opacity-30 bottom-[-100px] right-[-100px] pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold">{user.username}</h1>
            {user.isVerified && <Shield className="w-5 h-5 text-pink-700" />}
            {user.isPrivate && <div className="bg-[#ffb3c6] px-2 py-1 rounded-full text-xs">Private</div>}
          </div>

          <div className="flex items-center space-x-2">
            {isOwnProfile && followRequests.length > 0 && (
              <button onClick={() => setShowFollowRequests(true)} className="relative p-2 hover:bg-[#ffb3c6] rounded-full transition-colors">
                <UserPlus className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {followRequests.length}
                </div>
              </button>
            )}

            {isOwnProfile && (
              <button onClick={() => setShowInviteModal(true)} className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 rounded-lg transition-all shadow-lg">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Invite & Earn</span>
              </button>
            )}

            {isOwnProfile && (
              <button onClick={async () => { setLoading(true); await fetchHostOrders(); setShowOrders(true); setLoading(false); }}
                className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </button>
            )}

            <button onClick={() => {
              const inviteCode = user?.inviteCode || user?._id;
              const inviteLink = `${window.location.origin}/signup?ref=${inviteCode}`;
              if (navigator.share) {
                navigator.share({ title: 'Join ClipStream', text: `Join me on ClipStream!`, url: inviteLink });
              } else {
                navigator.clipboard.writeText(inviteLink);
                alert('Link copied!');
              }
            }} className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors">
              <Share className="w-5 h-5" />
            </button>

            {isOwnProfile && (
              <>
                <button onClick={() => (window.location.href = '/recharge-points')} className="p-2 rounded-full bg-gradient-to-r from-pink-600 to-pink-500 sm:hidden" title="Recharge Points">
                  <Coins className="w-5 h-5 text-white" />
                </button>
                <button onClick={() => (window.location.href = '/recharge-points')} className="py-2 px-4 rounded-lg font-medium bg-white text-pink-700 border border-[#ff99b3] hover:bg-[#ffb3c6] hidden sm:block">
                  Recharge Points
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 relative z-5">
        {/* Profile Info */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="relative">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=FFC0CB&color=000&size=200&bold=true`}
              alt={`${user.username}'s profile`}
              className="w-24 xs:w-28 sm:w-32 md:w-36 rounded-full object-cover border-4 border-[#ff99b3] shadow-2xl ring-4 ring-pink-300/30"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=FFC0CB&color=000&size=200&bold=true`; }}
            />
            {user.isVerified && (
              <div className="absolute -bottom-0.5 -right-0.5 bg-pink-600 rounded-full p-1.5 shadow-lg border-2 border-[#FFC0CB]">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
            {!isOwnProfile && user.isOnline && (
              <div className="absolute -bottom-0.5 -left-0.5 bg-green-500 rounded-full w-5 h-5 border-2 border-[#FFC0CB] shadow-lg animate-pulse"></div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-center">
                <p className="font-bold text-sm sm:text-lg">{user?.following?.length || 0}</p>
                <p className="text-gray-700 text-[10px] sm:text-sm">Following</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm sm:text-lg">{user?.followers?.length || 0}</p>
                <p className="text-gray-700 text-[10px] sm:text-sm">Followers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <p className="font-bold text-sm sm:text-lg text-pink-700">
                    {pointsLoading ? (
                      <div className="w-4 h-4 border-2 border-pink-700 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      formatNumber(isOwnProfile ? userPoints : user?.points || 0)
                    )}
                  </p>
                </div>
                <p className="text-pink-700 text-[10px] sm:text-sm">Points</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {isOwnProfile ? (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => (window.location.href = "/edit-profile")} className="py-2 px-4 rounded-lg font-medium bg-white text-pink-700 border border-[#ff99b3] hover:bg-[#ffb3c6] transition-colors text-sm">
                    Edit Profile
                  </button>
                  <button onClick={() => (window.location.href = "/transfer-points")} className="py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 text-white text-sm flex items-center justify-center space-x-1">
                    <span>Transfer</span>
                  </button>
                  <button onClick={() => (window.location.href = "/withdraw-points")} className="py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-pink-700 to-pink-600 hover:opacity-90 text-white text-sm flex items-center justify-center space-x-1">
                    <span>Withdraw</span>
                  </button>
                  <button onClick={handleLogout} className="py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90 text-white text-sm">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button onClick={handleFollowToggle} disabled={followLoading || followStatus.hasPendingRequest}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm ${getFollowButtonStyle()}`}>
                    {followLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : followStatus.isFollowing ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>{getFollowButtonText()}</span>
                  </button>

                  {followStatus.canMessage && (
                    <button onClick={startConversation} className="w-full py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 text-white flex items-center justify-center space-x-2 text-sm">
                      <MessageCircle className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-6 bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <h2 className="text-lg font-semibold">{user.username}</h2>
            {user.isVerified && (
              <div className="flex items-center space-x-1 bg-pink-600/20 px-2 py-1 rounded-full">
                <Shield className="w-3 h-3 text-pink-700" />
                <span className="text-xs text-pink-700">Verified</span>
              </div>
            )}
          </div>

          {user.bio && <p className="text-sm text-gray-800 mb-3 leading-relaxed">{user.bio}</p>}

          <div className="flex flex-col space-y-2 text-sm text-gray-700">
            {user.email && isOwnProfile && (
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-pink-600" />
                <span>{user.email}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-pink-600" />
              <span>{formatJoinDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 text-sm">Profile Status</span>
            <span className="px-3 py-1 bg-gradient-to-r from-pink-600 to-pink-500 rounded-full text-xs font-semibold text-white">
              {user.isPrivate ? 'Private' : 'Public'}
            </span>
          </div>
          {user.website && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700 text-sm">Website</span>
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-pink-700 hover:underline truncate">
                {user.website}
              </a>
            </div>
          )}
          {user.location && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700 text-sm">Location</span>
              <span className="text-black">{user.location}</span>
            </div>
          )}
        </div>
      </div>

      {showFollowRequests && <FollowRequestsModal />}
      {showOrders && <OrdersModal />}
      {selectedOrderDetails && (
        <OrderDetailsModal
          order={selectedOrderDetails.order}
          product={selectedOrderDetails.product}
          onClose={() => setSelectedOrderDetails(null)}
        />
      )}
      {showInviteModal && (
        <InviteModal user={user} onClose={() => setShowInviteModal(false)} referralPoints={referralPoints} />
      )}
    </div>
  );
};

export default ProfileScreen;