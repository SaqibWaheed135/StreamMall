import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio, Users, Eye, Clock, Search, Filter, X, Play } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const LiveStreamsListing = ({ onJoinStream, onStartStream }) => {
  const { t } = useTranslation();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get current user ID
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserId(user._id || user.id);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    
    fetchLiveStreams();
    const interval = setInterval(fetchLiveStreams, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStreams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/live`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || t('liveStreams.failedToFetch'));
      }

      // Filter out the current user's own streams
      const userData = localStorage.getItem("user");
      let userId = currentUserId;
      if (!userId && userData) {
        try {
          const user = JSON.parse(userData);
          userId = user._id || user.id;
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
      
      const filteredData = userId 
        ? data.filter(stream => {
            const streamerId = stream.streamer?._id || stream.streamer?.id || stream.streamer;
            return streamerId !== userId;
          })
        : data;

      setStreams(filteredData);
      setError('');
    } catch (err) {
      console.error('Fetch streams error:', err);
      setError(t('liveStreams.couldNotLoad'));
    } finally {
      setLoading(false);
    }
  };

  const filteredStreams = streams.filter(stream => {
    const matchesSearch = stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.streamer?.username.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'popular') return matchesSearch && stream.viewers?.length > 10;
    if (filter === 'new') return matchesSearch;

    return matchesSearch;
  });

  const getStreamDuration = (startedAt) => {
    const diff = Date.now() - new Date(startedAt).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const StreamSkeleton = () => (
    <div className="bg-white/70 border border-[#ff99b3] rounded-xl overflow-hidden animate-pulse">
      <div className="bg-gradient-to-r from-[#ffb3c6] to-[#FFC0CB] aspect-video" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#ffb3c6] rounded w-3/4" />
        <div className="h-4 bg-[#ffb3c6] rounded w-1/2" />
        <div className="flex gap-3 mt-2">
          <div className="h-3 bg-[#ffb3c6] rounded w-1/3" />
          <div className="h-3 bg-[#ffb3c6] rounded w-1/3" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFC0CB] text-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700">{t('liveStreams.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFC0CB] text-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2 sm:gap-3">
                <Radio className="w-6 h-6 sm:w-8 sm:h-8 text-pink-700" />
                {t('liveStreams.title')}
              </h1>
              <p className="text-sm sm:text-base text-gray-700 mt-2">
                {filteredStreams.length} {filteredStreams.length === 1 ? t('liveStreams.stream') : t('liveStreams.streams')} {t('liveStreams.liveNow')}
              </p>
            </div>
            <button
              onClick={onStartStream}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all transform hover:scale-105"

            >
              <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('liveStreams.goLive')}
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('liveStreams.searchPlaceholder')}
                className="w-full bg-white border border-[#ff99b3] rounded-lg pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base text-black placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'popular', 'new'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${filter === filterOption
                      ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-[#ffb3c6] border border-[#ff99b3]'
                    }`}
                >
                  {filterOption === 'all' ? t('liveStreams.all') : filterOption === 'popular' ? t('liveStreams.popular') : t('liveStreams.new')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-[#ffb3c6]/40 border border-[#ff99b3] text-pink-800 p-4 rounded-lg mb-6 flex items-start gap-3">
            <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* No Streams Message */}
        {filteredStreams.length === 0 && !loading && (
          <div className="text-center py-12 sm:py-20 text-black">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-white border border-[#ff99b3] flex items-center justify-center">
              <Radio className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">{t('liveStreams.noLiveStreams')}</h2>
            <p className="text-sm sm:text-base text-gray-700 mb-6">
              {searchQuery ? t('liveStreams.noStreamsMatch') : t('liveStreams.beFirstToGoLive')}
            </p>
            <button
              onClick={onStartStream}
              className="bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all transform hover:scale-105 text-white"
            >
              {t('liveStreams.startStreaming')}
            </button>
          </div>
        )}

        {/* Streams Grid */}
        {filteredStreams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredStreams.map((stream) => (
              <div
                key={stream._id}
                className="bg-white/70 border border-[#ff99b3] rounded-xl overflow-hidden hover:border-pink-600 transition-all cursor-pointer group"
                onClick={() => onJoinStream(stream._id)}
              >
                {/* Thumbnail */}
                <div className="relative bg-gradient-to-br from-[#FFC0CB] to-[#ffb3c6] aspect-video overflow-hidden">
                  {/* User Avatar as Background */}
                  {stream.streamer?.avatar ? (
                    <img
                      src={stream.streamer.avatar}
                      alt={stream.streamer?.username || 'Streamer'}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0 w-full h-full flex items-center justify-center"
                      style={{
                        background: `url(https://ui-avatars.com/api/?name=${encodeURIComponent(stream.streamer?.username || 'User')}&background=FFC0CB&color=000&size=400&bold=true)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                  )}
                  
                  {/* Overlay with Play Icon */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <div className="text-center group-hover:scale-110 transition-transform">
                      <Play className="w-12 h-12 sm:w-16 sm:h-16 text-white/90 mx-auto mb-2 drop-shadow-lg" />
                      <p className="text-white/90 text-xs sm:text-sm font-semibold drop-shadow-md">{t('liveStreams.liveStream')}</p>
                    </div>
                  </div>

                  {/* Live Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-pink-600 text-white px-2 sm:px-3 py-1 rounded-full z-10">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-semibold">{t('liveStreams.live')}</span>
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/80 border border-[#ff99b3] backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-semibold">{stream.viewers?.length || 0}</span>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/80 border border-[#ff99b3] backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{getStreamDuration(stream.startedAt)}</span>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={stream.streamer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(stream.streamer?.username || 'User')}&background=FFC0CB&color=000&size=200&bold=true`}
                      alt={stream.streamer?.username || 'Streamer'}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0 border-2 border-pink-500"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(stream.streamer?.username || 'User')}&background=FFC0CB&color=000&size=200&bold=true`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black group-hover:text-pink-700 transition-colors line-clamp-2 text-sm sm:text-base">
                        {stream.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-700 mt-1 truncate">
                        @{stream.streamer?.username}
                      </p>
                    </div>
                  </div>

                  {stream.description && (
                    <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 mb-3">
                      {stream.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-700 pt-3 border-t border-[#ff99b3]">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{stream.totalViews || 0} {t('liveStreams.views')}</span>
                    </div>
                    {stream.streams?.length > 1 && (
                      <div className="flex items-center gap-1">
                        <Radio className="w-3 h-3" />
                        <span>{stream.streams.length} {t('liveStreams.hosts')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredStreams.length > 0 && filteredStreams.length % 20 === 0 && (
          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={fetchLiveStreams}
              className="bg-white border border-[#ff99b3] hover:bg-[#ffb3c6] hover:border-pink-600 px-6 py-3 rounded-lg font-medium transition-all"
            >
              {t('liveStreams.loadMore')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreamsListing;