import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, User, UserCheck, UserX, Clock, Heart, MessageCircle, UserPlus, DollarSign, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config/api';

const NotificationsScreen = ({ onBack }) => {
  const { t } = useTranslation();
  const [followRequests, setFollowRequests] = useState([]);
  const [withdrawalNotifications, setWithdrawalNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch follow requests and withdrawal notifications
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [followResponse, withdrawalResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/follow/requests`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/notifications/withdrawals`, { headers: getAuthHeaders() })
        ]);

        if (followResponse.ok) {
          const requests = await followResponse.json();
          setFollowRequests(requests);
        } else {
          console.error('Failed to fetch follow requests');
        }

        if (withdrawalResponse.ok) {
          const notifications = await withdrawalResponse.json();
          setWithdrawalNotifications(notifications);
        } else {
          console.error('Failed to fetch withdrawal notifications');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Accept follow request
  const acceptRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const response = await fetch(`${API_BASE_URL}/follow/accept/${requestId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setFollowRequests(prev => prev.filter(req => req._id !== requestId));
      } else {
        const error = await response.json();
        alert(error.msg || t('notifications.errors.failedToAccept'));
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert(t('notifications.errors.failedToAccept'));
    } finally {
      setProcessingRequest(null);
    }
  };

  // Reject follow request
  const rejectRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const response = await fetch(`${API_BASE_URL}/follow/reject/${requestId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setFollowRequests(prev => prev.filter(req => req._id !== requestId));
      } else {
        const error = await response.json();
        alert(error.msg || t('notifications.errors.failedToReject'));
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(t('notifications.errors.failedToReject'));
    } finally {
      setProcessingRequest(null);
    }
  };

  // Navigate to user profile
  const goToProfile = (userId) => {
    window.location.href = `/profile/${userId}`;
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const requestDate = new Date(date);
    const diffInMs = now - requestDate;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return t('notifications.timeAgo.justNow');
    if (diffInMinutes < 60) return t('notifications.timeAgo.minutesAgo', { minutes: diffInMinutes });
    if (diffInHours < 24) return t('notifications.timeAgo.hoursAgo', { hours: diffInHours });
    if (diffInDays < 7) return t('notifications.timeAgo.daysAgo', { days: diffInDays });
    return requestDate.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#FFC0CB] text-black">
      {/* Header */}
      <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10">
        <div className="flex items-center p-4">
          <button
            onClick={onBack}
            className="mr-3 p-2 hover:bg-[#ffb3c6] rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6" />
            <h1 className="text-xl font-bold">{t('notifications.notifications')}</h1>
            {(followRequests.length + withdrawalNotifications.length) > 0 && (
              <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                {followRequests.length + withdrawalNotifications.length}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="bg-white/70 border border-[#ff99b3] p-4 rounded-xl animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-20 h-8 bg-gray-700 rounded"></div>
                    <div className="w-20 h-8 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (followRequests.length + withdrawalNotifications.length) === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="bg-white border border-[#ff99b3] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t('notifications.noNotificationsYet')}</h2>
            <p className="text-gray-700">{t('notifications.emptyStateMessage')}</p>
          </div>
        ) : (
          // Notifications list
          <div>
            {/* Follow Requests */}
            {followRequests.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-pink-700" />
                  {t('notifications.followRequests')} ({followRequests.length})
                </h2>
                <div className="space-y-3">
                  {followRequests.map((request) => (
                    <div key={request._id} className="bg-white/70 border border-[#ff99b3] p-4 rounded-xl hover:bg-[#ffb3c6] transition-colors">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => goToProfile(request.requester._id)}
                          className="flex items-center space-x-3 flex-1"
                        >
                          <img
                            src={request.requester.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.requester.username)}&background=random&color=fff&size=200&bold=true`}
                            alt={request.requester.username}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(request.requester.username)}&background=random&color=fff&size=200&bold=true`;
                            }}
                          />
                          <div className="text-left">
                            <p className="font-bold text-pink-700">{request.requester.username}</p>
                            <p className="text-gray-700 text-sm">{t('notifications.wantsToFollowYou')}</p>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(request.createdAt)}
                            </div>
                          </div>
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => acceptRequest(request._id)}
                            disabled={processingRequest === request._id}
                            className="bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 disabled:opacity-50"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>{t('notifications.accept')}</span>
                          </button>
                          <button
                            onClick={() => rejectRequest(request._id)}
                            disabled={processingRequest === request._id}
                            className="bg-white border border-[#ff99b3] hover:bg-[#ffb3c6] text-black px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 disabled:opacity-50"
                          >
                            <UserX className="w-4 h-4" />
                            <span>{t('notifications.reject')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Withdrawal Notifications */}
            {withdrawalNotifications.length > 0 && (
              <div className={followRequests.length > 0 ? 'mt-8' : ''}>
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  {t('notifications.withdrawalNotifications')} ({withdrawalNotifications.length})
                </h2>
                <div className="space-y-3">
                  {withdrawalNotifications.map((notification) => (
                    <div key={notification._id} className="bg-white/70 border border-[#ff99b3] p-4 rounded-xl hover:bg-[#ffb3c6] transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full border border-green-200 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-black">{t('notifications.withdrawalApproved')}</p>
                          <p className="text-gray-700 text-sm">
                            {t('notifications.withdrawalApprovedMessage', { 
                              amount: notification.withdrawalAmount, 
                              method: notification.method 
                            })}
                          </p>
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgo(notification.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Future notifications section placeholder */}
        {!loading && (
          <div className="mt-8 p-4 bg-white/70 border border-[#ff99b3] rounded-xl">
            <div className="flex items-center space-x-2 text-gray-700 mb-2">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{t('notifications.otherNotifications')}</span>
            </div>
            <p className="text-xs text-gray-600">{t('notifications.comingSoon')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;