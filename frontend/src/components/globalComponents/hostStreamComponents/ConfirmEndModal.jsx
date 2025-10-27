import React from "react";

const ConfirmEndModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-600/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold">End Live Stream?</h3>
        </div>
        <p className="text-gray-300 mb-6">Are you sure you want to end the live stream? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg font-semibold">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold">
            End Stream
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEndModal