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
    <div className="fixed inset-0 bg-gradient-to-br from-[#FFC0CB] via-[#ffb3c6] to-[#ff99b3] flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-[#ff99b3]/50">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-400 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <AlertCircle className="w-14 h-14 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-pink-700 mb-3">Stream Ended</h2>
        <p className="text-gray-700 mb-6 text-lg">The host has ended the live stream.</p>

        <div className="bg-white/70 border border-[#ffb3c6] rounded-2xl p-5 space-y-4 text-left shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 flex items-center gap-2 font-medium">
              <Clock className="w-5 h-5 text-pink-600" /> Duration
            </span>
            <span className="font-bold text-pink-700 text-lg">
              {formatDuration(streamData.duration)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 flex items-center gap-2 font-medium">
              <Eye className="w-5 h-5 text-pink-600" /> Total Views
            </span>
            <span className="font-bold text-pink-700 text-lg">
              {streamData.totalViews || 0}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 flex items-center gap-2 font-medium">
              <HeartIcon className="w-5 h-5 text-pink-600" /> Hearts
            </span>
            <span className="font-bold text-pink-600 text-lg">
              {streamData.heartsReceived || 0}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-6 font-medium">Redirecting in 4s...</p>
      </div>
    </div>
  );
};

export default StreamEndedModal;