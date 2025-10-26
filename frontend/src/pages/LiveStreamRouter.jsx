import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Radio, Users, LogIn, UserPlus } from 'lucide-react';

// Import your actual components
import HostLiveStream from '../components/HostLiveStream';
import ViewerLiveStream from '../components/ViewerLiveStream';

const LiveStreamRouter = () => {
  const navigate = useNavigate();
  const { streamId: urlStreamId } = useParams();
  const [searchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState('home');
  const [streamId, setStreamId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isLoggedIn = token && isTokenValid(token);
    setIsAuthenticated(isLoggedIn);
  }, []);

  useEffect(() => {
    // Check for stream ID from various sources
    const extractedStreamId = 
      urlStreamId || 
      searchParams.get('streamId') || 
      searchParams.get('stream');

    if (extractedStreamId) {
      console.log('Stream ID detected:', extractedStreamId);
      setStreamId(extractedStreamId);
      
      // If not authenticated, save the stream ID and show login prompt
      if (!isAuthenticated) {
        // Save the intended destination
        sessionStorage.setItem('redirectAfterLogin', `/stream/${extractedStreamId}`);
        setCurrentView('login-required');
      } else {
        setCurrentView('viewer');
      }
    }
  }, [urlStreamId, searchParams, isAuthenticated]);

  // Token validation helper
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const [, payloadBase64] = token.split('.');
      const payload = JSON.parse(atob(payloadBase64));
      const exp = payload.exp * 1000;
      return Date.now() < exp;
    } catch (e) {
      return false;
    }
  };

  const handleStartHosting = () => {
    navigate('/host-live-stream');
  };

  const handleJoinAsViewer = (id) => {
    if (id && id.trim()) {
      navigate(`/stream/${id.trim()}`);
    }
  };

  const handleBack = () => {
    navigate('/live-streams');
  };

  // If we have a stream ID, show viewer
  if (currentView === 'viewer' && streamId) {
    return <ViewerLiveStream streamId={streamId} onBack={handleBack} />;
  }

  // Landing page
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Live Streaming Platform</h1>
          <p className="text-gray-400 text-lg">Stream live or watch streams from around the world</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Host Card */}
          <div className="bg-gray-800 rounded-xl p-8 hover:bg-gray-750 transition-colors">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Radio className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-center">Start Streaming</h2>
            <p className="text-gray-400 mb-6 text-center">
              Go live and share your content with viewers worldwide
            </p>
            <button
              onClick={handleStartHosting}
              className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Live Stream
            </button>
          </div>

          {/* Viewer Card */}
          <div className="bg-gray-800 rounded-xl p-8 hover:bg-gray-750 transition-colors">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-center">Watch Streams</h2>
            <p className="text-gray-400 mb-6 text-center">
              Enter a stream ID to join an ongoing live stream
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter Stream ID"
                onChange={(e) => setStreamId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && streamId) {
                    handleJoinAsViewer(streamId);
                  }
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => streamId && handleJoinAsViewer(streamId)}
                disabled={!streamId}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-colors"
              >
                Join Stream
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-3">How it works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mb-2 text-lg font-bold">1</div>
              <p className="text-gray-400">Host starts a live stream and shares the link</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-2 text-lg font-bold">2</div>
              <p className="text-gray-400">Viewers click the link or enter Stream ID</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mb-2 text-lg font-bold">3</div>
              <p className="text-gray-400">Everyone watches and interacts in real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamRouter;