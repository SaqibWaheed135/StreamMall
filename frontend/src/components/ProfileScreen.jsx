// import React, { useState, useEffect } from "react";
// import { Heart, Settings, Share, UserCheck, UserPlus, Mail, Calendar, Shield, Play, MessageCircle, Clock, CheckCircle, X, Copy, Coins } from "lucide-react";

// const ProfileScreen = ({ userId: propUserId }) => {
//   const [user, setUser] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isOwnProfile, setIsOwnProfile] = useState(true);
//   const [loading, setLoading] = useState(true);
//   const [followLoading, setFollowLoading] = useState(false);
//   const [pointsLoading, setPointsLoading] = useState(false);
//   const [userPoints, setUserPoints] = useState(0);
//   const [showInviteModal, setShowInviteModal] = useState(false);

//   const [followStatus, setFollowStatus] = useState({
//     isFollowing: false,
//     isFollowedBy: false,
//     hasPendingRequest: false,
//     canMessage: false,
//     targetUserIsPrivate: false,
//     relationship: 'none'
//   });

//   const [followRequests, setFollowRequests] = useState([]);
//   const [showFollowRequests, setShowFollowRequests] = useState(false);

//   const API_BASE_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com/api';

//   const getAuthHeaders = () => {
//     const token = localStorage.getItem("token");
//     return {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     };
//   };

//   const Skeleton = ({ className = "", children, ...props }) => (
//     <div
//       className={`animate-pulse bg-gradient-to-r from-[#2C2C33] via-[#1f1f27] to-[#2C2C33] rounded ${className}`}
//       {...props}
//     >
//       {children}
//     </div>
//   );

//   const ProfileSkeleton = () => (
//     <div className="min-h-screen bg-[#0A0A0E] text-white">
//       <div className="sticky top-0 bg-[#0A0A0E]/95 backdrop-blur-lg border-b border-[#2C2C33] z-10 p-4">
//         <div className="flex items-center justify-between">
//           <Skeleton className="h-6 w-32" />
//           <div className="flex items-center space-x-3">
//             <Skeleton className="w-10 h-10 rounded-full" />
//             <Skeleton className="h-10 w-32 rounded-lg" />
//           </div>
//         </div>
//       </div>

//       <div className="p-4">
//         <div className="flex items-start space-x-4 mb-6">
//           <Skeleton className="w-24 h-24 rounded-full" />
//           <div className="flex-1">
//             <div className="flex items-center space-x-4 mb-4">
//               <Skeleton className="h-6 w-8" />
//               <Skeleton className="h-6 w-8" />
//               <Skeleton className="h-6 w-8" />
//             </div>
//             <Skeleton className="h-10 w-full rounded-lg" />
//           </div>
//         </div>

//         <div className="mb-6">
//           <Skeleton className="h-6 w-24 mb-3" />
//           <Skeleton className="h-4 w-full mb-2" />
//           <Skeleton className="h-4 w-3/4" />
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <Skeleton className="h-20 rounded-lg" />
//           <Skeleton className="h-20 rounded-lg" />
//         </div>
//       </div>
//     </div>
//   );

//   const fetchUserPoints = async () => {
//     if (!isOwnProfile) return;

//     try {
//       setPointsLoading(true);
//       const response = await fetch(`${API_BASE_URL}/users/points/balance`, {
//         headers: getAuthHeaders()
//       });

//       if (response.ok) {
//         const pointsData = await response.json();
//         setUserPoints(pointsData.balance || 0);
//       }
//     } catch (error) {
//       console.error('Error fetching user points:', error);
//     } finally {
//       setPointsLoading(false);
//     }
//   };

//   const fetchFollowStatus = async (targetUserId) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/follow/status/${targetUserId}`, {
//         headers: getAuthHeaders()
//       });

//       if (response.ok) {
//         const status = await response.json();
//         setFollowStatus(status);
//       }
//     } catch (error) {
//       console.error('Error fetching follow status:', error);
//     }
//   };

//   const fetchFollowRequests = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/follow/requests`, {
//         headers: getAuthHeaders()
//       });

//       if (response.ok) {
//         const requests = await response.json();
//         setFollowRequests(requests);
//       }
//     } catch (error) {
//       console.error('Error fetching follow requests:', error);
//     }
//   };

//   const handleFollowToggle = async () => {
//     if (followLoading || !user) return;
//     setFollowLoading(true);

//     try {
//       if (followStatus.isFollowing) {
//         const response = await fetch(`${API_BASE_URL}/follow/unfollow/${user._id || user.id}`, {
//           method: 'POST',
//           headers: getAuthHeaders()
//         });

//         if (response.ok) {
//           setFollowStatus(prev => ({
//             ...prev,
//             isFollowing: false,
//             canMessage: false,
//             relationship: prev.isFollowedBy ? 'follower' : 'none'
//           }));

//           setUser(prev => ({
//             ...prev,
//             followers: prev.followers?.filter(f => f !== currentUser._id) || []
//           }));
//         }
//       } else {
//         const response = await fetch(`${API_BASE_URL}/follow/request/${user._id || user.id}`, {
//           method: 'POST',
//           headers: getAuthHeaders()
//         });

//         if (response.ok) {
//           const result = await response.json();

//           if (result.requiresApproval) {
//             setFollowStatus(prev => ({
//               ...prev,
//               hasPendingRequest: true
//             }));
//           } else {
//             setFollowStatus(prev => ({
//               ...prev,
//               isFollowing: true,
//               canMessage: prev.isFollowedBy,
//               relationship: prev.isFollowedBy ? 'mutual' : 'following'
//             }));

//             setUser(prev => ({
//               ...prev,
//               followers: [...(prev.followers || []), currentUser._id]
//             }));
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Error toggling follow:', error);
//     } finally {
//       setFollowLoading(false);
//     }
//   };

//   const handleFollowRequest = async (requestId, action) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/follow/${action}/${requestId}`, {
//         method: 'POST',
//         headers: getAuthHeaders()
//       });

//       if (response.ok) {
//         setFollowRequests(prev => prev.filter(req => req._id !== requestId));

//         if (action === 'accept') {
//           setUser(prev => ({
//             ...prev,
//             followersCount: (prev.followersCount || 0) + 1
//           }));
//         }
//       }
//     } catch (error) {
//       console.error(`Error ${action}ing follow request:`, error);
//     }
//   };

//   const startConversation = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
//         method: 'POST',
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ recipientId: user._id || user.id })
//       });

//       if (response.ok) {
//         const conversation = await response.json();
//         window.location.href = `/messages/${conversation._id}`;
//       } else {
//         const error = await response.json();
//         alert(error.msg || 'Cannot start conversation');
//       }
//     } catch (error) {
//       console.error('Error starting conversation:', error);
//       alert('Failed to start conversation');
//     }
//   };

//   const fetchUserData = async (targetUserId) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/users/${targetUserId}`, {
//         headers: getAuthHeaders()
//       });

//       if (response.ok) {
//         const userData = await response.json();
//         setUser(userData);
//       } else {
//         console.error('Failed to fetch user data');
//       }
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//     }
//   };

//   useEffect(() => {
//     const initializeProfile = async () => {
//       setLoading(true);
//       const storedUser = localStorage.getItem("user");

//       if (storedUser) {
//         const userData = JSON.parse(storedUser);
//         setCurrentUser(userData);

//         if (propUserId && propUserId !== userData._id && propUserId !== userData.id) {
//           setIsOwnProfile(false);
//           await fetchUserData(propUserId);
//           await fetchFollowStatus(propUserId);
//         } else {
//           setIsOwnProfile(true);
//           await fetchUserData(userData._id || userData.id);
//           await fetchFollowRequests();
//           await fetchUserPoints();
//         }
//       }
//       setLoading(false);
//     };

//     initializeProfile();
//   }, [propUserId]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     window.location.href = '/login';
//   };

//   const formatJoinDate = (dateString) => {
//     if (!dateString) return "Recently joined";
//     const date = new Date(dateString);
//     return `Joined ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
//   };

//   const formatNumber = (num) => {
//     if (num >= 1000000) {
//       return `${(num / 1000000).toFixed(1)}M`;
//     } else if (num >= 1000) {
//       return `${(num / 1000).toFixed(0)}K`;
//     }
//     return num.toString();
//   };

//   const FollowRequestsModal = () => (
//     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//       <div className="bg-[#16161A]/95 backdrop-blur-xl rounded-3xl w-full max-w-md max-h-96 border border-[#2C2C33]">
//         <div className="flex items-center justify-between p-4 border-b border-[#2C2C33]">
//           <h3 className="text-lg font-bold">Follow Requests</h3>
//           <button
//             onClick={() => setShowFollowRequests(false)}
//             className="p-2 hover:bg-[#2C2C33] rounded-full transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="p-4 max-h-80 overflow-y-auto">
//           {followRequests.length === 0 ? (
//             <div className="text-center py-8 text-gray-400">
//               <UserPlus className="w-12 h-12 mx-auto mb-2" />
//               <p>No follow requests</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {followRequests.map((request) => (
//                 <div key={request._id} className="flex items-center space-x-3 p-3 bg-[#2C2C33] rounded-lg">
//                   <img
//                     src={request.requester.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.requester.username)}&background=random&color=fff&size=200&bold=true`}
//                     alt={request.requester.username}
//                     className="w-12 h-12 rounded-full object-cover"
//                   />
//                   <div className="flex-1">
//                     <p className="font-semibold">{request.requester.username}</p>
//                     <p className="text-sm text-gray-400">
//                       {new Date(request.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                   <div className="flex space-x-2">
//                     <button
//                       onClick={() => handleFollowRequest(request._id, 'accept')}
//                       className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
//                     >
//                       <CheckCircle className="w-4 h-4" />
//                     </button>
//                     <button
//                       onClick={() => handleFollowRequest(request._id, 'reject')}
//                       className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   const InviteModal = ({ user, onClose }) => {
//     const [copied, setCopied] = useState(false);

//     const inviteCode = user?.inviteCode || user?._id;
//     const inviteLink = `${window.location.origin}/signup?ref=${inviteCode}`;

//     const handleCopyLink = () => {
//       navigator.clipboard.writeText(inviteLink);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     };

//     const handleShare = async () => {
//       if (navigator.share) {
//         try {
//           await navigator.share({
//             title: 'Join ClipStream',
//             text: `Join me on ClipStream and start creating amazing content!`,
//             url: inviteLink
//           });
//         } catch (err) {
//           console.log('Error sharing:', err);
//         }
//       } else {
//         handleCopyLink();
//       }
//     };

//     return (
//       <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
//         <div className="bg-[#16161A]/95 backdrop-blur-xl rounded-2xl w-full max-w-md shadow-2xl border border-[#2C2C33]">
//           <div className="flex items-center justify-between p-6 border-b border-[#2C2C33]">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-gradient-to-br from-[#FF2B55] to-[#7B2FF7] rounded-lg">
//                 <UserPlus className="w-6 h-6" />
//               </div>
//               <div>
//                 <h3 className="text-xl font-bold">Invite Friends</h3>
//                 <p className="text-sm text-gray-400">Earn coins for each referral</p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-[#2C2C33] rounded-full transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="p-6 space-y-6">
//             <div className="bg-gradient-to-r from-[#FF2B55]/20 to-[#7B2FF7]/20 border border-[#FF2B55]/30 rounded-xl p-4">
//               <div className="flex items-start space-x-3">
//                 <div className="p-2 bg-yellow-500 rounded-lg">
//                   <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div className="flex-1">
//                   <p className="font-semibold text-white">Earn Rewards!</p>
//                   <p className="text-sm text-gray-300 mt-1">
//                     Get <span className="text-yellow-400 font-bold">10 coins</span> for each friend who signs up
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-[#2C2C33]/50 rounded-lg p-4 text-center border border-[#2C2C33]">
//                 <p className="text-2xl font-bold text-[#FF2B55]">{user.totalInvites || 0}</p>
//                 <p className="text-xs text-gray-400 mt-1">Total Invites</p>
//               </div>
//               <div className="bg-[#2C2C33]/50 rounded-lg p-4 text-center border border-[#2C2C33]">
//                 <p className="text-2xl font-bold text-[#7B2FF7]">{(user.totalInvites || 0) * 10}</p>
//                 <p className="text-xs text-gray-400 mt-1">Coins Earned</p>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-2">
//                 Your Invite Link
//               </label>
//               <div className="flex items-center space-x-2">
//                 <input
//                   type="text"
//                   value={inviteLink}
//                   readOnly
//                   className="flex-1 bg-[#0D0D0F] border border-[#2C2C33] rounded-lg px-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7B2FF7]"
//                 />
//                 <button
//                   onClick={handleCopyLink}
//                   className={`p-3 rounded-lg transition-all ${copied
//                     ? 'bg-green-600 hover:bg-green-700'
//                     : 'bg-[#FF2B55] hover:bg-[#FF2B55]/90'
//                     }`}
//                 >
//                   {copied ? (
//                     <CheckCircle className="w-5 h-5" />
//                   ) : (
//                     <Copy className="w-5 h-5" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <div className="bg-[#2C2C33]/30 rounded-lg p-4 border border-[#2C2C33]">
//               <p className="text-sm font-semibold text-gray-300 mb-2">How it works:</p>
//               <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
//                 <li>Share your unique invite link</li>
//                 <li>They sign up using your link</li>
//                 <li>You both earn coins instantly</li>
//               </ol>
//             </div>
//           </div>

//           <div className="p-6 border-t border-[#2C2C33] bg-[#0D0D0F]/50">
//             <button
//               onClick={handleShare}
//               className="w-full bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
//             >
//               <Share className="w-5 h-5" />
//               <span>Share Invite Link</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return <ProfileSkeleton />;
//   }

//   if (!loading && !user) {
//     return (
//       <div className="min-h-screen bg-[#0A0A0E] text-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-red-500 mb-4">
//             <X className="w-16 h-16 mx-auto mb-4" />
//           </div>
//           <p className="text-gray-400 text-lg mb-2">Failed to load profile</p>
//           <p className="text-gray-500 text-sm mb-4">Unable to fetch user data</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-[#FF2B55] hover:bg-[#FF2B55]/90 px-6 py-2 rounded-lg transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const getFollowButtonText = () => {
//     if (followStatus.hasPendingRequest) return "Requested";
//     if (followStatus.isFollowing) return "Following";
//     return "Follow";
//   };

//   const getFollowButtonStyle = () => {
//     if (followStatus.hasPendingRequest) {
//       return "bg-[#2C2C33] text-white cursor-not-allowed";
//     }
//     if (followStatus.isFollowing) {
//       return "bg-[#0D0D0F] text-white border border-[#2C2C33] hover:bg-[#16161A]";
//     }
//     return "bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] text-white hover:opacity-90";
//   };

//   return (
//     <div className="min-h-screen bg-[#0A0A0E] text-white relative overflow-hidden">
//       {/* Background Orbs */}
//       <div className="absolute w-[400px] h-[400px] bg-[#FF2B55] rounded-full blur-[150px] opacity-10 top-[-100px] left-[-100px] pointer-events-none" />
//       <div className="absolute w-[400px] h-[400px] bg-[#7B2FF7] rounded-full blur-[150px] opacity-10 bottom-[-100px] right-[-100px] pointer-events-none" />

//       <style jsx>{`
//         @keyframes shimmer {
//           0% { background-position: -200% 0; }
//           100% { background-position: 200% 0; }
//         }

//         .animate-shimmer {
//           animation: shimmer 2s infinite linear;
//         }
//       `}</style>

//       {/* Header */}
//       <div className="sticky top-0 bg-[#0A0A0E]/95 backdrop-blur-lg border-b border-[#2C2C33] z-10 p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <h1 className="text-xl font-bold">{user.username}</h1>
//             {user.isVerified && (
//               <Shield className="w-5 h-5 text-blue-500" />
//             )}
//             {user.isPrivate && (
//               <div className="bg-[#2C2C33] px-2 py-1 rounded-full">
//                 <span className="text-xs">Private</span>
//               </div>
//             )}
//           </div>

//           <div className="flex items-center space-x-2">
//             {isOwnProfile && followRequests.length > 0 && (
//               <button
//                 onClick={() => setShowFollowRequests(true)}
//                 className="relative p-2 hover:bg-[#2C2C33] rounded-full transition-colors"
//               >
//                 <UserPlus className="w-5 h-5" />
//                 <div className="absolute -top-1 -right-1 bg-[#FF2B55] text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                   {followRequests.length}
//                 </div>
//               </button>
//             )}

//             {isOwnProfile && (
//               <button
//                 onClick={() => setShowInviteModal(true)}
//                 className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] hover:opacity-90 rounded-lg transition-all shadow-lg"
//               >
//                 <UserPlus className="w-4 h-4" />
//                 <span className="text-sm font-medium hidden sm:inline">Invite & Earn</span>
//               </button>
//             )}

//             <button
//               onClick={() => {
//                 const inviteCode = user?.inviteCode || user?._id;
//                 const inviteLink = `${window.location.origin}/signup?ref=${inviteCode}`;
//                 if (navigator.share) {
//                   navigator.share({
//                     title: 'Join ClipStream',
//                     text: `Join me on ClipStream!`,
//                     url: inviteLink
//                   });
//                 } else {
//                   navigator.clipboard.writeText(inviteLink);
//                   alert('Link copied!');
//                 }
//               }}
//               className="p-2 hover:bg-[#2C2C33] rounded-full transition-colors"
//             >
//               <Share className="w-5 h-5" />
//             </button>

//             {isOwnProfile && (
//               <>
//                 {/* Mobile (icon only) */}
//                 <button
//                   onClick={() => (window.location.href = '/recharge-points')}
//                   className="p-2 rounded-full bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] sm:hidden"
//                   title="Recharge Points"
//                 >
//                   <Coins className="w-5 h-5 text-white" />
//                 </button>
//                 {/* Desktop (full button) */}
//                 <button
//                   onClick={() => (window.location.href = '/recharge-points')}
//                   className="py-2 px-4 rounded-lg font-medium bg-[#0D0D0F] text-white border border-[#2C2C33] hover:bg-[#16161A] transition-colors hidden sm:block"
//                 >
//                   Recharge Points
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="p-4 relative z-5">
//         {/* Profile Info */}
//         <div className="flex items-start space-x-4 mb-6">
//           <div className="relative">
//             <img
//               src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=200&bold=true`}
//               alt={`${user.username}'s profile`}
//               className="w-24 xs:w-28 sm:w-32 md:w-36 rounded-full object-cover border-3 border-[#2C2C33] shadow-2xl ring-2 ring-[#FF2B55]/20"
//               onError={(e) => {
//                 e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=200&bold=true`;
//               }}
//             />
//             {user.isVerified && (
//               <div className="absolute -bottom-0.5 -right-0.5 xs:-bottom-1 xs:-right-1 bg-blue-500 rounded-full p-1 xs:p-1.5 shadow-lg border-2 border-[#0A0A0E]">
//                 <Shield className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
//               </div>
//             )}
//             {!isOwnProfile && user.isOnline && (
//               <div className="absolute -bottom-0.5 -left-0.5 xs:-bottom-1 xs:-left-1 bg-green-500 rounded-full w-4 h-4 xs:w-5 xs:h-5 border-2 border-[#0A0A0E] shadow-lg animate-pulse"></div>
//             )}
//           </div>

//           <div className="flex-1">
//             <div className="flex items-center space-x-3 mb-4">
//               <div className="text-center">
//                 <p className="font-bold text-sm sm:text-lg">{user?.following?.length || 0}</p>
//                 <p className="text-gray-400 text-[10px] sm:text-sm">Following</p>
//               </div>

//               <div className="text-center">
//                 <p className="font-bold text-sm sm:text-lg">{user?.followers?.length || 0}</p>
//                 <p className="text-gray-400 text-[10px] sm:text-sm">Followers</p>
//               </div>

//               <div className="text-center">
//                 <div className="flex items-center justify-center mb-1">
//                   <p className="font-bold text-sm sm:text-lg text-yellow-400">
//                     {pointsLoading ? (
//                       <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
//                     ) : (
//                       formatNumber(isOwnProfile ? userPoints : user?.points || 0)
//                     )}
//                   </p>
//                 </div>
//                 <p className="text-yellow-400 text-[10px] sm:text-sm">Points</p>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-col space-y-3">
//               {isOwnProfile ? (
//                 <div className="grid grid-cols-2 gap-2">
//                   <button
//                     onClick={() => (window.location.href = "/edit-profile")}
//                     className="py-2 px-4 rounded-lg font-medium bg-[#0D0D0F] text-white border border-[#2C2C33] hover:bg-[#16161A] transition-colors text-sm"
//                   >
//                     Edit Profile
//                   </button>
//                   <button
//                     onClick={() => (window.location.href = "/transfer-points")}
//                     className="py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 transition-colors text-sm flex items-center justify-center space-x-1"
//                   >
//                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5" />
//                     </svg>
//                     <span>Transfer</span>
//                   </button>
//                   <button
//                     onClick={() => (window.location.href = "/withdraw-points")}
//                     className="py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-yellow-600 to-amber-600 hover:opacity-90 transition-colors text-sm flex items-center justify-center space-x-1"
//                   >
//                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
//                     </svg>
//                     <span>Withdraw</span>
//                   </button>
//                   <button
//                     onClick={handleLogout}
//                     className="py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90 transition-colors text-sm"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   <button
//                     onClick={handleFollowToggle}
//                     disabled={followLoading || followStatus.hasPendingRequest}
//                     className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm ${getFollowButtonStyle()}`}
//                   >
//                     {followLoading ? (
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     ) : followStatus.isFollowing ? (
//                       <UserCheck className="w-4 h-4" />
//                     ) : (
//                       <UserPlus className="w-4 h-4" />
//                     )}
//                     <span>{getFollowButtonText()}</span>
//                   </button>

//                   {followStatus.canMessage && (
//                     <button
//                       onClick={startConversation}
//                       className="w-full py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 transition-colors text-white flex items-center justify-center space-x-2 text-sm"
//                     >
//                       <MessageCircle className="w-4 h-4" />
//                       <span>Message</span>
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Bio Section */}
//         <div className="mb-6 bg-[#16161A]/50 backdrop-blur-sm border border-[#2C2C33] rounded-2xl p-4">
//           <div className="flex items-center space-x-2 mb-3">
//             <h2 className="text-lg font-semibold">{user.username}</h2>
//             {user.isVerified && (
//               <div className="flex items-center space-x-1 bg-blue-500/20 px-2 py-1 rounded-full">
//                 <Shield className="w-3 h-3 text-blue-400" />
//                 <span className="text-xs text-blue-400">Verified</span>
//               </div>
//             )}
//             {followStatus.relationship === 'mutual' && !isOwnProfile && (
//               <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-full">
//                 <Heart className="w-3 h-3 text-green-400" />
//                 <span className="text-xs text-green-400">Mutual</span>
//               </div>
//             )}
//           </div>

//           {user.bio && (
//             <p className="text-sm text-gray-300 mb-3 leading-relaxed">
//               {user.bio}
//             </p>
//           )}

//           <div className="flex flex-col space-y-2 text-sm text-gray-400">
//             {user.email && isOwnProfile && (
//               <div className="flex items-center space-x-2">
//                 <Mail className="w-4 h-4 text-[#FF2B55]" />
//                 <span>{user.email}</span>
//               </div>
//             )}

//             <div className="flex items-center space-x-2">
//               <Calendar className="w-4 h-4 text-[#FF2B55]" />
//               <span>{formatJoinDate(user.createdAt)}</span>
//             </div>

//             {!isOwnProfile && !user.isOnline && user.lastSeen && (
//               <div className="flex items-center space-x-2">
//                 <Clock className="w-4 h-4 text-[#FF2B55]" />
//                 <span>Last seen {new Date(user.lastSeen).toLocaleDateString()}</span>
//               </div>
//             )}
//           </div>
//         </div>



//         {/* Additional Info Section */}
//         <div className="bg-[#16161A]/50 backdrop-blur-sm border border-[#2C2C33] rounded-2xl p-4 space-y-3">
//           <div className="flex items-center justify-between">
//             <span className="text-gray-400 text-sm">Profile Status</span>
//             <span className="px-3 py-1 bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] rounded-full text-xs font-semibold">
//               {user.isPrivate ? 'Private' : 'Public'}
//             </span>
//           </div>

//           {user.website && (
//             <div className="flex items-center justify-between">
//               <span className="text-gray-400 text-sm">Website</span>
//               <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-[#FF2B55] text-sm hover:underline truncate">
//                 {user.website}
//               </a>
//             </div>
//           )}

//           {user.location && (
//             <div className="flex items-center justify-between">
//               <span className="text-gray-400 text-sm">Location</span>
//               <span className="text-white text-sm">{user.location}</span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Follow Requests Modal */}
//       {showFollowRequests && <FollowRequestsModal />}
//       {/* Invite Modal */}
//       {showInviteModal && (
//         <InviteModal
//           user={user}
//           onClose={() => setShowInviteModal(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default ProfileScreen;

import React, { useState, useEffect } from "react";
import { Heart, Settings, Share, UserCheck, UserPlus, Mail, Calendar, Shield, Play, MessageCircle, Clock, CheckCircle, X, Copy, Coins, ShoppingBag } from "lucide-react";

const ProfileScreen = ({ userId: propUserId }) => {
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);

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

  const API_BASE_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const Skeleton = ({ className = "", children, ...props }) => (
    <div
      className={`animate-pulse bg-gradient-to-r from-[#2C2C33] via-[#1f1f27] to-[#2C2C33] rounded ${className}`}
      {...props}
    >
      {children}
    </div>
  );

  const ProfileSkeleton = () => (
    <div className="min-h-screen bg-[#0A0A0E] text-white">
      <div className="sticky top-0 bg-[#0A0A0E]/95 backdrop-blur-lg border-b border-[#2C2C33] z-10 p-4">
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

        // Flatten orders if needed, or use as-is
        const allOrders = (data.orders || []).map(o => ({
          ...o,
          buyerUsername: o.buyer?.username || 'Unknown Buyer',
          product: o.productName ? { name: o.productName, price: o.productPrice } : null
        }));

        setOrders(allOrders);
      } else {
        console.error('Failed to fetch host orders');
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
            setFollowStatus(prev => ({
              ...prev,
              hasPendingRequest: true
            }));
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
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // useEffect(() => {
  //   const initializeProfile = async () => {
  //     setLoading(true);
  //     const storedUser = localStorage.getItem("user");

  //     if (storedUser) {
  //       const userData = JSON.parse(storedUser);
  //       setCurrentUser(userData);

  //       if (propUserId && propUserId !== userData._id && propUserId !== userData.id) {
  //         setIsOwnProfile(false);
  //         await fetchUserData(propUserId);
  //         await fetchFollowStatus(propUserId);
  //       } else {
  //         setIsOwnProfile(true);
  //         await fetchUserData(userData._id || userData.id);
  //         await fetchFollowRequests();
  //         await fetchUserPoints();
  //       }
  //     }
  //     setLoading(false);
  //   };

  //   initializeProfile();
  // }, [propUserId]);

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

        // Fetch referral points setting
        await fetchReferralPoints();
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
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const FollowRequestsModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#16161A]/95 backdrop-blur-xl rounded-3xl w-full max-w-md max-h-96 border border-[#2C2C33]">
        <div className="flex items-center justify-between p-4 border-b border-[#2C2C33]">
          <h3 className="text-lg font-bold">Follow Requests</h3>
          <button
            onClick={() => setShowFollowRequests(false)}
            className="p-2 hover:bg-[#2C2C33] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-80 overflow-y-auto">
          {followRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <UserPlus className="w-12 h-12 mx-auto mb-2" />
              <p>No follow requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followRequests.map((request) => (
                <div key={request._id} className="flex items-center space-x-3 p-3 bg-[#2C2C33] rounded-lg">
                  <img
                    src={request.requester.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.requester.username)}&background=random&color=fff&size=200&bold=true`}
                    alt={request.requester.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{request.requester.username}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFollowRequest(request._id, 'accept')}
                      className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFollowRequest(request._id, 'reject')}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                    >
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#16161A]/95 backdrop-blur-xl rounded-3xl w-full max-w-md max-h-[80vh] border border-[#2C2C33] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#2C2C33]">
          <h3 className="text-lg font-bold">My Orders</h3>
          <button
            onClick={() => setShowOrders(false)}
            className="p-2 hover:bg-[#2C2C33] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order, i) => (
                <div key={i} className="bg-[#2C2C33] rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{order.product?.name || 'Unknown Product'}</p>
                      <p className="text-xs text-gray-400">Buyer: {order.buyerUsername}</p>
                      <p className="text-xs text-yellow-300 mt-1">+{Math.ceil((order.product?.price || 0) * 100)} coins</p>
                      <p className="text-xs text-gray-500">Stream: {order.streamTitle}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrderDetails({ order, product: order.product })}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                    >
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
        <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 sticky top-0 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-xl font-semibold">Order Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-2">Product Information</h4>
              <div className="space-y-2">
                <p><span className="text-gray-400">Product:</span> <span className="font-semibold">{product.name}</span></p>
                <p><span className="text-gray-400">Description:</span> <span>{product.description}</span></p>
                <p><span className="text-gray-400">Price:</span> <span className="font-bold text-yellow-400">${product.price}</span></p>
                <p><span className="text-gray-400">Quantity:</span> <span className="font-semibold">{order.quantity}</span></p>
              </div>
            </div>
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-3">Buyer Information</h4>
              <div className="space-y-2">
                <p><span className="text-gray-400">Name:</span> <span className="font-semibold">{order.buyer?.username || 'Unknown'}</span></p>
                <p><span className="text-gray-400">Email:</span> <span>{order.buyer?.email || 'N/A'}</span></p>
                <p><span className="text-gray-400">Status:</span> <span className={`font-semibold ${order.status === 'completed' ? 'text-green-400' : order.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>{order.status}</span></p>
                <p><span className="text-gray-400">Order Date:</span> <span>{new Date(order.orderedAt).toLocaleString()}</span></p>
              </div>
            </div>
            {deliveryInfo && Object.keys(deliveryInfo).length > 0 && (
              <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-3">Delivery Address</h4>
                <div className="space-y-2">
                  <p><span className="text-gray-400">Name:</span> <span className="font-semibold">{deliveryInfo.firstName} {deliveryInfo.lastName}</span></p>
                  <p><span className="text-gray-400">Address:</span> <span>{deliveryInfo.address}</span></p>
                  <p><span className="text-gray-400">City:</span> <span>{deliveryInfo.city}</span></p>
                  <p><span className="text-gray-400">State/Province:</span> <span>{deliveryInfo.state}</span></p>
                  <p><span className="text-gray-400">ZIP/Postal Code:</span> <span className="font-semibold">{deliveryInfo.zipCode}</span></p>
                  <p><span className="text-gray-400">Country:</span> <span>{deliveryInfo.country}</span></p>
                  <p><span className="text-gray-400">Phone:</span> <span>{deliveryInfo.phone}</span></p>
                  <p><span className="text-gray-400">Email:</span> <span>{deliveryInfo.email}</span></p>
                </div>
              </div>
            )}
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-3">Payment Information</h4>
              <div className="space-y-2">
                <p><span className="text-gray-400">Amount:</span> <span className="font-bold text-yellow-400">${product.price}</span></p>
                <p><span className="text-gray-400">Coins Earned:</span> <span className="font-bold text-yellow-300">{Math.ceil(product.price * 100)} coins</span></p>
                <p><span className="text-gray-400">Payment Method:</span> <span>Coins</span></p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded-lg font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Updated InviteModal component with dynamic referral points

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
        } catch (err) {
          console.log('Error sharing:', err);
        }
      } else {
        handleCopyLink();
      }
    };

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-[#16161A]/95 backdrop-blur-xl rounded-2xl w-full max-w-md shadow-2xl border border-[#2C2C33]">
          <div className="flex items-center justify-between p-6 border-b border-[#2C2C33]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-[#FF2B55] to-[#7B2FF7] rounded-lg">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Invite Friends</h3>
                <p className="text-sm text-gray-400">Earn coins for each referral</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2C2C33] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-[#FF2B55]/20 to-[#7B2FF7]/20 border border-[#FF2B55]/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">Earn Rewards!</p>
                  <p className="text-sm text-gray-300 mt-1">
                    Get <span className="text-yellow-400 font-bold">{referralPoints} coins</span> for each friend who signs up
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2C2C33]/50 rounded-lg p-4 text-center border border-[#2C2C33]">
                <p className="text-2xl font-bold text-[#FF2B55]">{user.totalInvites || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Total Invites</p>
              </div>
              <div className="bg-[#2C2C33]/50 rounded-lg p-4 text-center border border-[#2C2C33]">
                <p className="text-2xl font-bold text-[#7B2FF7]">{(user.totalInvites || 0) * referralPoints}</p>
                <p className="text-xs text-gray-400 mt-1">Coins Earned</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Invite Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 bg-[#0D0D0F] border border-[#2C2C33] rounded-lg px-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7B2FF7]"
                />
                <button
                  onClick={handleCopyLink}
                  className={`p-3 rounded-lg transition-all ${copied
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-[#FF2B55] hover:bg-[#FF2B55]/90'
                    }`}
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-[#2C2C33]/30 rounded-lg p-4 border border-[#2C2C33]">
              <p className="text-sm font-semibold text-gray-300 mb-2">How it works:</p>
              <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                <li>Share your unique invite link</li>
                <li>They sign up using your link</li>
                <li>You both earn coins instantly</li>
              </ol>
            </div>
          </div>

          <div className="p-6 border-t border-[#2C2C33] bg-[#0D0D0F]/50">
            <button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Share className="w-5 h-5" />
              <span>Share Invite Link</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0E] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <X className="w-16 h-16 mx-auto mb-4" />
          </div>
          <p className="text-gray-400 text-lg mb-2">Failed to load profile</p>
          <p className="text-gray-500 text-sm mb-4">Unable to fetch user data</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#FF2B55] hover:bg-[#FF2B55]/90 px-6 py-2 rounded-lg transition-colors"
          >
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
    if (followStatus.hasPendingRequest) {
      return "bg-[#2C2C33] text-white cursor-not-allowed";
    }
    if (followStatus.isFollowing) {
      return "bg-[#0D0D0F] text-white border border-[#2C2C33] hover:bg-[#16161A]";
    }
    return "bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] text-white hover:opacity-90";
  };

  return (
    <div className="min-h-screen bg-[#0A0A0E] text-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute w-[400px] h-[400px] bg-[#FF2B55] rounded-full blur-[150px] opacity-10 top-[-100px] left-[-100px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-[#7B2FF7] rounded-full blur-[150px] opacity-10 bottom-[-100px] right-[-100px] pointer-events-none" />

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 bg-[#0A0A0E]/95 backdrop-blur-lg border-b border-[#2C2C33] z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold">{user.username}</h1>
            {user.isVerified && (
              <Shield className="w-5 h-5 text-blue-500" />
            )}
            {user.isPrivate && (
              <div className="bg-[#2C2C33] px-2 py-1 rounded-full">
                <span className="text-xs">Private</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isOwnProfile && followRequests.length > 0 && (
              <button
                onClick={() => setShowFollowRequests(true)}
                className="relative p-2 hover:bg-[#2C2C33] rounded-full transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 bg-[#FF2B55] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {followRequests.length}
                </div>
              </button>
            )}

            {isOwnProfile && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] hover:opacity-90 rounded-lg transition-all shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Invite & Earn</span>
              </button>
            )}

            {isOwnProfile && (
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    await fetchHostOrders(); // Calls the new /live/host/orders API
                    setShowOrders(true);
                  } catch (error) {
                    console.error('Error loading orders:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="p-2 hover:bg-[#2C2C33] rounded-full transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
            )}


            <button
              onClick={() => {
                const inviteCode = user?.inviteCode || user?._id;
                const inviteLink = `${window.location.origin}/signup?ref=${inviteCode}`;
                if (navigator.share) {
                  navigator.share({
                    title: 'Join ClipStream',
                    text: `Join me on ClipStream!`,
                    url: inviteLink
                  });
                } else {
                  navigator.clipboard.writeText(inviteLink);
                  alert('Link copied!');
                }
              }}
              className="p-2 hover:bg-[#2C2C33] rounded-full transition-colors"
            >
              <Share className="w-5 h-5" />
            </button>

            {isOwnProfile && (
              <>
                {/* Mobile (icon only) */}
                <button
                  onClick={() => (window.location.href = '/recharge-points')}
                  className="p-2 rounded-full bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] sm:hidden"
                  title="Recharge Points"
                >
                  <Coins className="w-5 h-5 text-white" />
                </button>
                {/* Desktop (full button) */}
                <button
                  onClick={() => (window.location.href = '/recharge-points')}
                  className="py-2 px-4 rounded-lg font-medium bg-[#0D0D0F] text-white border border-[#2C2C33] hover:bg-[#16161A] transition-colors hidden sm:block"
                >
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
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=200&bold=true`}
              alt={`${user.username}'s profile`}
              className="w-24 xs:w-28 sm:w-32 md:w-36 rounded-full object-cover border-3 border-[#2C2C33] shadow-2xl ring-2 ring-[#FF2B55]/20"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=200&bold=true`;
              }}
            />
            {user.isVerified && (
              <div className="absolute -bottom-0.5 -right-0.5 xs:-bottom-1 xs:-right-1 bg-blue-500 rounded-full p-1 xs:p-1.5 shadow-lg border-2 border-[#0A0A0E]">
                <Shield className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
              </div>
            )}
            {!isOwnProfile && user.isOnline && (
              <div className="absolute -bottom-0.5 -left-0.5 xs:-bottom-1 xs:-left-1 bg-green-500 rounded-full w-4 h-4 xs:w-5 xs:h-5 border-2 border-[#0A0A0E] shadow-lg animate-pulse"></div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-center">
                <p className="font-bold text-sm sm:text-lg">{user?.following?.length || 0}</p>
                <p className="text-gray-400 text-[10px] sm:text-sm">Following</p>
              </div>

              <div className="text-center">
                <p className="font-bold text-sm sm:text-lg">{user?.followers?.length || 0}</p>
                <p className="text-gray-400 text-[10px] sm:text-sm">Followers</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <p className="font-bold text-sm sm:text-lg text-yellow-400">
                    {pointsLoading ? (
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      formatNumber(isOwnProfile ? userPoints : user?.points || 0)
                    )}
                  </p>
                </div>
                <p className="text-yellow-400 text-[10px] sm:text-sm">Points</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {isOwnProfile ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => (window.location.href = "/edit-profile")}
                    className="py-2 px-4 rounded-lg font-medium bg-[#0D0D0F] text-white border border-[#2C2C33] hover:bg-[#16161A] transition-colors text-sm"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => (window.location.href = "/transfer-points")}
                    className="py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5" />
                    </svg>
                    <span>Transfer</span>
                  </button>
                  <button
                    onClick={() => (window.location.href = "/withdraw-points")}
                    className="py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-yellow-600 to-amber-600 hover:opacity-90 transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Withdraw</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90 transition-colors text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading || followStatus.hasPendingRequest}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm ${getFollowButtonStyle()}`}
                  >
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
                    <button
                      onClick={startConversation}
                      className="w-full py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 transition-colors text-white flex items-center justify-center space-x-2 text-sm"
                    >
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
        <div className="mb-6 bg-[#16161A]/50 backdrop-blur-sm border border-[#2C2C33] rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <h2 className="text-lg font-semibold">{user.username}</h2>
            {user.isVerified && (
              <div className="flex items-center space-x-1 bg-blue-500/20 px-2 py-1 rounded-full">
                <Shield className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400">Verified</span>
              </div>
            )}
            {followStatus.relationship === 'mutual' && !isOwnProfile && (
              <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-full">
                <Heart className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">Mutual</span>
              </div>
            )}
          </div>

          {user.bio && (
            <p className="text-sm text-gray-300 mb-3 leading-relaxed">
              {user.bio}
            </p>
          )}

          <div className="flex flex-col space-y-2 text-sm text-gray-400">
            {user.email && isOwnProfile && (
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#FF2B55]" />
                <span>{user.email}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#FF2B55]" />
              <span>{formatJoinDate(user.createdAt)}</span>
            </div>

            {!isOwnProfile && !user.isOnline && user.lastSeen && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#FF2B55]" />
                <span>Last seen {new Date(user.lastSeen).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>



        {/* Additional Info Section */}
        <div className="bg-[#16161A]/50 backdrop-blur-sm border border-[#2C2C33] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Profile Status</span>
            <span className="px-3 py-1 bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] rounded-full text-xs font-semibold">
              {user.isPrivate ? 'Private' : 'Public'}
            </span>
          </div>

          {user.website && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Website</span>
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-[#FF2B55] text-sm hover:underline truncate">
                {user.website}
              </a>
            </div>
          )}

          {user.location && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Location</span>
              <span className="text-white text-sm">{user.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Follow Requests Modal */}
      {showFollowRequests && <FollowRequestsModal />}
      {/* Orders Modal */}
      {showOrders && <OrdersModal />}
      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <OrderDetailsModal
          order={selectedOrderDetails.order}
          product={selectedOrderDetails.product}
          onClose={() => setSelectedOrderDetails(null)}
        />
      )}
      {/* Invite Modal */}
      // Update the InviteModal component call to pass referralPoints:
      {showInviteModal && (
        <InviteModal
          user={user}
          onClose={() => setShowInviteModal(false)}
          referralPoints={referralPoints}
        />
      )}
    </div>
  );
};

export default ProfileScreen;