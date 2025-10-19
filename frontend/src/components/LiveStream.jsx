import React, { useState, useEffect } from 'react';
import { Radio, Users, Eye, Clock, Search, Filter, X, Play } from 'lucide-react';

const API_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com/api';

const LiveStreamsListing = ({ onJoinStream, onStartStream }) => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLiveStreams();
    const interval = setInterval(fetchLiveStreams, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStreams = async () => {
    try {
      const response = await fetch(`${API_URL}/live`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to fetch streams');
      }

      setStreams(data);
      setError('');
    } catch (err) {
      console.error('Fetch streams error:', err);
      setError('Could not load live streams');
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
    <div className="bg-[#16161A] border border-[#2C2C33] rounded-xl overflow-hidden animate-pulse">
      <div className="bg-gradient-to-r from-[#2C2C33] to-[#3C3C43] aspect-video" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#2C2C33] rounded w-3/4" />
        <div className="h-4 bg-[#2C2C33] rounded w-1/2" />
        <div className="flex gap-3 mt-2">
          <div className="h-3 bg-[#2C2C33] rounded w-1/3" />
          <div className="h-3 bg-[#2C2C33] rounded w-1/3" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0E] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#FF2B55] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Loading live streams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0E] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2 sm:gap-3">
                <Radio className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF2B55]" />
                Live Streams
              </h1>
              <p className="text-sm sm:text-base text-gray-400 mt-2">
                {streams.length} {streams.length === 1 ? 'stream' : 'streams'} live now
              </p>
            </div>
            <button
              onClick={onStartStream}
              className="w-full sm:w-auto bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] hover:opacity-90 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"

            >
              <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
              Go Live
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search streams or creators..."
                className="w-full bg-[#16161A] border border-[#2C2C33] rounded-lg pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-[#FF2B55] focus:ring-1 focus:ring-[#FF2B55] transition-colors"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'popular', 'new'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${filter === filterOption
                      ? 'bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] text-white'
                      : 'bg-[#16161A] text-gray-300 hover:bg-[#2C2C33] border border-[#2C2C33]'
                    }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-[#FF2B55]/20 border border-[#FF2B55] text-[#FF9CAE] p-4 rounded-lg mb-6 flex items-start gap-3">
            <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* No Streams Message */}
        {filteredStreams.length === 0 && !loading && (
          <div className="text-center py-12 sm:py-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-[#16161A] flex items-center justify-center">
              <Radio className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">No Live Streams</h2>
            <p className="text-sm sm:text-base text-gray-400 mb-6">
              {searchQuery ? 'No streams match your search' : 'Be the first to go live!'}
            </p>
            <button
              onClick={onStartStream}
              className="bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] hover:opacity-90 px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all transform hover:scale-105"
            >
              Start Streaming
            </button>
          </div>
        )}

        {/* Streams Grid */}
        {filteredStreams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredStreams.map((stream) => (
              <div
                key={stream._id}
                className="bg-[#16161A] border border-[#2C2C33] rounded-xl overflow-hidden hover:border-[#FF2B55] transition-all cursor-pointer group"
                onClick={() => onJoinStream(stream._id)}
              >
                {/* Thumbnail */}
                <div className="relative bg-gradient-to-br from-[#2C2C33] to-[#16161A] aspect-video overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <div className="text-center group-hover:scale-110 transition-transform">
                      <Play className="w-12 h-12 sm:w-16 sm:h-16 text-white/70 mx-auto mb-2" />
                      <p className="text-gray-500 text-xs sm:text-sm">Live Stream</p>
                    </div>
                  </div>

                  {/* Live Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#FF2B55] px-2 sm:px-3 py-1 rounded-full z-10">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-semibold">LIVE</span>
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-semibold">{stream.viewers?.length || 0}</span>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{getStreamDuration(stream.startedAt)}</span>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF2B55] to-[#7B2FF7] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold">
                        {stream.streamer?.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white group-hover:text-[#FF2B55] transition-colors line-clamp-2 text-sm sm:text-base">
                        {stream.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1 truncate">
                        @{stream.streamer?.username}
                      </p>
                    </div>
                  </div>

                  {stream.description && (
                    <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mb-3">
                      {stream.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 pt-3 border-t border-[#2C2C33]">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{stream.totalViews || 0} views</span>
                    </div>
                    {stream.streams?.length > 1 && (
                      <div className="flex items-center gap-1">
                        <Radio className="w-3 h-3" />
                        <span>{stream.streams.length} hosts</span>
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
              className="bg-[#16161A] hover:bg-[#2C2C33] border border-[#2C2C33] hover:border-[#FF2B55] px-6 py-3 rounded-lg font-medium transition-all"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreamsListing;