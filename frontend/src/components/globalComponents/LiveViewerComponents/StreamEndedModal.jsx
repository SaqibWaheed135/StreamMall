import React, { useState, useEffect } from "react";
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
    <div className="fixed inset-0 bg-gradient-to-br from-[#FFC0CB] via-[#ffb3c6] to-[#ff99b3] flex items-center justify-center z-[100] p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-[#ff99b3]/50 my-auto">
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-pink-500 to-pink-400 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
          <AlertCircle className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-pink-700 mb-2 sm:mb-3 break-words">Stream Ended</h2>
        <p className="text-gray-700 mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed">The host has ended the live stream.</p>

        <div className="bg-white/70 border border-[#ffb3c6] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 text-left shadow-lg">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-gray-700 flex items-center gap-2 font-medium text-sm sm:text-base">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 flex-shrink-0" /> Duration
            </span>
            <span className="font-bold text-pink-700 text-base sm:text-lg">
              {formatDuration(streamData.duration)}
            </span>
          </div>

          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-gray-700 flex items-center gap-2 font-medium text-sm sm:text-base">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 flex-shrink-0" /> Total Views
            </span>
            <span className="font-bold text-pink-700 text-base sm:text-lg">
              {streamData.totalViews || 0}
            </span>
          </div>

          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-gray-700 flex items-center gap-2 font-medium text-sm sm:text-base">
              <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 flex-shrink-0" /> Hearts
            </span>
            <span className="font-bold text-pink-600 text-base sm:text-lg">
              {streamData.heartsReceived || 0}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6 font-medium">Redirecting in 4s...</p>
      </div>
    </div>
  );
};

export default StreamEndedModal;