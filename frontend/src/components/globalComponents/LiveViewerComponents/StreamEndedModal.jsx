import React from "react";
import { AlertCircle, Clock, Eye, HeartIcon } from 'lucide-react';

const StreamEndedModal = ({ streamData, onNavigate }) => {
  useEffect(() => {
    const timer = setTimeout(() => onNavigate(), 4000);
    return () => clearTimeout(timer);
  }, [onNavigate]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-700">
        <div className="mx-auto w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-5">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Stream Ended</h2>
        <p className="text-gray-300 mb-5">The host has ended the live stream.</p>

        <div className="bg-gray-700/50 rounded-xl p-4 space-y-3 text-left">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Duration
            </span>
            <span className="font-semibold text-white">
              {formatDuration(streamData.duration)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Total Views
            </span>
            <span className="font-semibold text-white">
              {streamData.totalViews || 0}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-2">
              <HeartIcon className="w-4 h-4" /> Hearts
            </span>
            <span className="font-semibold text-pink-400">
              {streamData.heartsReceived || 0}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-5">Redirecting in 4s...</p>
      </div>
    </div>
  );
};

export default StreamEndedModal;