import {
  AlertTriangle
} from 'lucide-react';
import React from "react";


const ConfirmEndModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 border border-[#ffb3c6] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-300 to-amber-400 rounded-full flex items-center justify-center shadow">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-pink-700">End Live Stream?</h3>
        </div>
        <p className="text-gray-600 mb-8">
          Are you sure you want to end the live stream? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-white text-pink-600 border border-[#ff99b3] hover:bg-[#ffe0ea] py-3 rounded-xl font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 hover:shadow-lg hover:shadow-pink-200 text-white py-3 rounded-xl font-semibold transition"
          >
            End Stream
          </button>
        </div>
      </div>
    </div>
  );
};


export default ConfirmEndModal;