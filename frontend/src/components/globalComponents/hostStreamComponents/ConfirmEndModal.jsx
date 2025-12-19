import {
  AlertTriangle
} from 'lucide-react';
import React, { useState } from "react";


const ConfirmEndModal = ({ onConfirm, onCancel }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      style={{ 
        zIndex: 2147483647,
        position: 'fixed',
        pointerEvents: 'auto'
      }}
    >
      <div className="bg-white/90 border border-[#ffb3c6] rounded-3xl max-w-md w-full p-4 sm:p-6 md:p-7 shadow-2xl backdrop-blur-xl my-auto">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-300 to-amber-400 rounded-full flex items-center justify-center shadow flex-shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-pink-700 break-words">End Live Stream?</h3>
        </div>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
          Are you sure you want to end the live stream? This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-white text-pink-600 border border-[#ff99b3] hover:bg-[#ffe0ea] py-2.5 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 hover:shadow-lg hover:shadow-pink-200 text-white py-2.5 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base min-h-[44px]"
          >
            End Stream
          </button>
        </div>
      </div>
    </div>
  );
};


export default ConfirmEndModal;