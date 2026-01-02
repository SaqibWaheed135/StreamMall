import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  User,
  Calendar,
  Filter,
  TrendingUp,
  Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config/api';

const PointsTransfer = () => {
  const { t } = useTranslation();
  // Transfer form state
  const [recipient, setRecipient] = useState('');
  const [points, setPoints] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // History and stats state
  const [transfers, setTransfers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({ sent: { amount: 0, count: 0 }, received: { amount: 0, count: 0 } });
  const [currentBalance, setCurrentBalance] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    type: 'all', // all, credit, debit
    page: 1,
    limit: 20
  });

  // Friends and search state
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);

  const [historyLoading, setHistoryLoading] = useState(true);

  // API call helper function
  const makeAPICall = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...defaultOptions,
        ...options
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error('API call failed:', err);
      throw err;
    }
  };

  // Fetch current balance
  const fetchBalance = async () => {
    try {
      const data = await makeAPICall('/points/balance');
      setCurrentBalance(data.balance || 0);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  // Fetch transfer history
  const fetchTransferHistory = async (page = 1, type = 'all') => {
    try {
      setHistoryLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: filters.limit.toString() });
      if (type !== 'all') params.append('type', type);

      const data = await makeAPICall(`/points/transfer/history?${params}`);

      if (data.transfers) {
        setTransfers(data.transfers);
        setPagination(data.pagination || {});
      } else {
        setTransfers([]);
        setPagination({});
      }
    } catch (err) {
      console.error('Failed to fetch transfer history:', err);
      setError(t('transfer.validation.failedToFetchHistory'));
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch transfer statistics
  const fetchStats = async () => {
    try {
      const data = await makeAPICall('/points/transfer/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch friends
  const fetchFriends = async () => {
    try {
      setFriendsLoading(true);
      const data = await makeAPICall('/points/transfer/friends?page=1&limit=50');
      setFriends(data.friends || []);
    } catch (err) {
      console.error('Failed to fetch friends:', err);
      setError(t('transfer.validation.failedToFetchFriends'));
    } finally {
      setFriendsLoading(false);
    }
  };

  // Search users
  const searchUsers = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const data = await makeAPICall(`/points/transfer/users/search?query=${encodeURIComponent(query)}`);
      setSearchResults(data.users || []);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Failed to search users:', err);
      setError(t('transfer.validation.failedToSearchUsers'));
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle clicking outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial data loading
  useEffect(() => {
    fetchBalance();
    fetchTransferHistory();
    fetchStats();
    fetchFriends();
  }, []);

  // Handle filter changes
  useEffect(() => {
    fetchTransferHistory(filters.page, filters.type);
  }, [filters]);

  // Handle recipient search input
  const handleRecipientChange = (e) => {
    const value = e.target.value;
    setRecipient(value);
    searchUsers(value);
  };

  // Handle selecting a user from search results or friends
  const handleSelectUser = (user) => {
    setRecipient(user.username);
    setShowSearchResults(false);
  };

  // Handle transfer submission
  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!recipient.trim() || !points) {
      setError(t('transfer.validation.recipientAndPointsRequired'));
      setLoading(false);
      return;
    }

    const pointsNum = parseFloat(points);
    if (pointsNum <= 0 || Number.isNaN(pointsNum)) {
      setError(t('transfer.validation.pointsMustBeValid'));
      setLoading(false);
      return;
    }

    if (pointsNum > currentBalance) {
      setError(t('transfer.validation.insufficientBalance'));
      setLoading(false);
      return;
    }

    if (!window.confirm(t('transfer.messages.transferConfirm', { points: pointsNum, recipient }))) {
      setLoading(false);
      return;
    }

    try {
      const data = await makeAPICall('/points/transfer/transfer', {
        method: 'POST',
        body: JSON.stringify({
          recipient: recipient.trim(),
          points: pointsNum,
          message: message.trim()
        })
      });

      if (data.msg) {
        setSuccess(t('transfer.messages.transferSuccess', { points: pointsNum, recipient }));
        setRecipient('');
        setPoints('');
        setMessage('');

        // Refresh data
        fetchTransferHistory();
        fetchBalance();
        fetchStats();
      }
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err.message || t('transfer.validation.failedToTransfer'));
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  // Handle page changes
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Handle filter changes
  const handleFilterChange = (type) => {
    setFilters((prev) => ({ ...prev, type, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFC0CB] via-[#ffb3c6] to-[#ff99b3] text-gray-900 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/70 p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-pink-700">{t('transfer.transferPoints')}</h1>

        {/* Balance and Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-white/70 shadow-lg ring-1 ring-white/60">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">{t('transfer.currentBalance')}</h3>
              <TrendingUp className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-2xl font-bold text-pink-600 mt-2">{currentBalance.toLocaleString()} {t('recharge.pointsLabel')}</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-white/70 shadow-lg ring-1 ring-white/60">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">{t('transfer.pointsSent')}</h3>
              <ArrowUpRight className="w-5 h-5 text-[#e11d48]" />
            </div>
            <p className="text-2xl font-bold text-[#e11d48] mt-2">{stats.sent.amount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{stats.sent.count} {t('transfer.transfers')}</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-white/70 shadow-lg ring-1 ring-white/60">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">{t('transfer.pointsReceived')}</h3>
              <ArrowDownLeft className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <p className="text-2xl font-bold text-[#7c3aed] mt-2">{stats.received.amount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{stats.received.count} {t('transfer.transfers')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transfer Form */}
          <div className="bg-white/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/60 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-pink-700">{t('transfer.sendPoints')}</h2>

            <div className="space-y-4" ref={searchRef}>
              <div className="relative">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {t('transfer.recipient')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipient}
                    onChange={handleRecipientChange}
                    onFocus={() => setShowSearchResults(true)}
                    className="w-full p-3 bg-white/90 border border-[#ff99b3] rounded-xl text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 pl-10 transition"
                    placeholder={t('transfer.enterUsernameOrEmail')}
                    disabled={loading}
                  />
                  <Search className="w-5 h-5 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && (searchResults.length > 0 || searchLoading) && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#ff99b3] rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-3 flex items-center space-x-2 text-pink-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('transfer.searching')}</span>
                      </div>
                    ) : (
                      searchResults.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => handleSelectUser(user)}
                          className="p-3 hover:bg-[#ffe0ea] cursor-pointer flex items-center space-x-2 transition"
                        >
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                          ) : (
                            <User className="w-8 h-8 text-pink-400" />
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{user.username}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">{t('transfer.pointsToTransfer')}</label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full p-3 bg-white/90 border border-[#ff99b3] rounded-xl text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                  placeholder={t('transfer.enterPointsAmount')}
                  min="1"
                  max={currentBalance}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">{t('transfer.messageOptional')}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 bg-white/90 border border-[#ff99b3] rounded-xl text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                  placeholder={t('transfer.addMessage')}
                  rows="3"
                  maxLength="200"
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleTransfer}
                disabled={loading || currentBalance <= 0}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 px-6 py-3 rounded-xl font-semibold text-base text-white transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('transfer.transferring')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('transfer.transferPointsButton')}</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-[#ffe4e6] border border-[#fb7185] rounded-2xl p-4 flex items-center space-x-2 text-[#be123c]">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 bg-[#ecfdf5] border border-[#34d399] rounded-2xl p-4 flex items-center space-x-2 text-[#047857]">
                <CheckCircle className="w-5 h-5" />
                <p>{success}</p>
              </div>
            )}
          </div>

          {/* Transfer History and Friends */}
          <div className="space-y-8">
            {/* Friends List */}
            <div className="bg-white/85 backdrop-blur-xl p-6 sm:px-8 sm:py-8 rounded-3xl border border-white/60 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-pink-700">{t('transfer.yourFriends')}</h2>
                <User className="w-5 h-5 text-pink-400" />
              </div>

              {friendsLoading ? (
                <div className="flex items-center justify-center py-8 text-pink-500">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">{t('transfer.loadingFriends')}</span>
                </div>
              ) : friends.length === 0 ? (
                <p className="text-pink-700/70 text-center py-8">{t('transfer.noFriendsFound')}</p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      onClick={() => handleSelectUser(friend)}
                      className="p-3 bg-white/90 border border-[#ffb3c6] rounded-2xl hover:bg-[#ffe0ea] cursor-pointer flex items-center space-x-3 transition"
                    >
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.username} className="w-10 h-10 rounded-full" />
                      ) : (
                        <User className="w-10 h-10 text-pink-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{friend.username}</p>
                        <p className="text-sm text-gray-500">{friend.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transfer History */}
            <div className="bg-white/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/60 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-pink-700">{t('transfer.transferHistory')}</h2>
                <Filter className="w-5 h-5 text-pink-400" />
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['all', 'debit', 'credit'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleFilterChange(type)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm ${
                      filters.type === type
                        ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-md'
                        : 'bg-white/80 text-pink-600 border border-transparent hover:border-pink-200'
                    }`}
                  >
                    {type === 'all' ? t('transfer.all') : type === 'debit' ? t('transfer.sent') : t('transfer.received')}
                  </button>
                ))}
              </div>

              {historyLoading ? (
                <div className="flex items-center justify-center py-8 text-pink-500">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">{t('transfer.loadingHistory')}</span>
                </div>
              ) : transfers.length === 0 ? (
                <p className="text-pink-700/70 text-center py-8">{t('transfer.noTransferHistory')}</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {transfers.map((transfer) => (
                    <div key={transfer._id} className="bg-white/90 p-4 rounded-2xl border border-[#ffb3c6] shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {transfer.type === 'debit' ? (
                            <ArrowUpRight className="w-5 h-5 text-[#e11d48]" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5 text-[#16a34a]" />
                          )}
                          <div>
                            <p className="font-medium text-gray-800">
                              {transfer.type === 'debit' ? t('transfer.sentTo') : t('transfer.receivedFrom')}{' '}
                              {transfer.counterparty?.username || t('transfer.unknownUser')}
                            </p>
                            <p className="text-sm text-gray-500">{formatDate(transfer.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              transfer.type === 'debit' ? 'text-[#e11d48]' : 'text-[#16a34a]'
                            }`}
                          >
                            {transfer.type === 'debit' ? '-' : '+'}
                            {transfer.amount.toLocaleString()} {t('transfer.points')}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{transfer.status}</p>
                        </div>
                      </div>
                      {transfer.message && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{transfer.message}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#ffb3c6]">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-4 py-1.5 bg-white/85 border border-[#ffb3c6] rounded-full text-sm text-pink-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffe0ea] transition"
                  >
                    {t('transfer.previous')}
                  </button>
                  <span className="text-sm text-gray-600">
                    {t('transfer.page')} {pagination.page} {t('transfer.of')} {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-4 py-1.5 bg-white/85 border border-[#ffb3c6] rounded-full text-sm text-pink-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffe0ea] transition"
                  >
                    {t('transfer.next')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsTransfer;