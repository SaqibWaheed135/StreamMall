import { X } from 'lucide-react';
import React, { useState } from "react";

const OrderDetailsModal = ({ order, product, onClose }) => {
  if (!order || !product) return null;

  const deliveryInfo = order.deliveryInfo || {};

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 border border-[#ffb3c6] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-xl">
        <div className="p-6 sticky top-0 bg-white/85 border-b border-[#ffb3c6]/60 flex justify-between items-center rounded-t-3xl">
          <h3 className="text-2xl font-bold text-pink-700">Order Details</h3>
          <button onClick={onClose} className="text-pink-500 hover:text-pink-700 transition">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6 text-gray-700">
          <div className="bg-white border border-[#ffb3c6] rounded-2xl p-5 shadow-sm">
            <h4 className="font-semibold text-lg text-pink-700 mb-3">Product Information</h4>
            <div className="space-y-2">
              <p><span className="text-gray-500">Product:</span> <span className="font-semibold text-gray-900">{product.name}</span></p>
              <p><span className="text-gray-500">Description:</span> <span>{product.description}</span></p>
              <p><span className="text-gray-500">Price:</span> <span className="font-bold text-pink-600">${product.price}</span></p>
              <p><span className="text-gray-500">Quantity:</span> <span className="font-semibold text-gray-900">{order.quantity}</span></p>
            </div>
          </div>
          <div className="bg-white border border-[#b3d7ff] rounded-2xl p-5 shadow-sm">
            <h4 className="font-semibold text-lg text-blue-500 mb-3">Buyer Information</h4>
            <div className="space-y-2">
              <p><span className="text-gray-500">Name:</span> <span className="font-semibold text-gray-900">{order.buyer?.username || 'Unknown'}</span></p>
              <p><span className="text-gray-500">Email:</span> <span>{order.buyer?.email || 'N/A'}</span></p>
              <p>
                <span className="text-gray-500">Status:</span>{' '}
                <span
                  className={`font-semibold ${
                    order.status === 'completed'
                      ? 'text-green-500'
                      : order.status === 'pending'
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }`}
                >
                  {order.status}
                </span>
              </p>
              <p><span className="text-gray-500">Order Date:</span> <span>{new Date(order.orderedAt).toLocaleString()}</span></p>
            </div>
          </div>
          {deliveryInfo && Object.keys(deliveryInfo).length > 0 && (
            <div className="bg-white border border-[#c8f7d4] rounded-2xl p-5 shadow-sm">
              <h4 className="font-semibold text-lg text-emerald-500 mb-3">Delivery Address</h4>
              <div className="space-y-2">
                <p><span className="text-gray-500">Name:</span> <span className="font-semibold text-gray-900">{deliveryInfo.firstName} {deliveryInfo.lastName}</span></p>
                <p><span className="text-gray-500">Address:</span> <span>{deliveryInfo.address}</span></p>
                <p><span className="text-gray-500">City:</span> <span>{deliveryInfo.city}</span></p>
                <p><span className="text-gray-500">State/Province:</span> <span>{deliveryInfo.state}</span></p>
                <p><span className="text-gray-500">ZIP/Postal Code:</span> <span className="font-semibold text-gray-900">{deliveryInfo.zipCode}</span></p>
                <p><span className="text-gray-500">Country:</span> <span>{deliveryInfo.country}</span></p>
                <p><span className="text-gray-500">Phone:</span> <span>{deliveryInfo.phone}</span></p>
                <p><span className="text-gray-500">Email:</span> <span>{deliveryInfo.email}</span></p>
              </div>
            </div>
          )}
          <div className="bg-white border border-[#ffe0a3] rounded-2xl p-5 shadow-sm">
            <h4 className="font-semibold text-lg text-amber-500 mb-3">Payment Information</h4>
            <div className="space-y-2">
              <p><span className="text-gray-500">Amount:</span> <span className="font-bold text-pink-600">${product.price}</span></p>
              <p><span className="text-gray-500">Coins Earned:</span> <span className="font-bold text-amber-500">{Math.ceil(product.price * 100)} coins</span></p>
              <p><span className="text-gray-500">Payment Method:</span> <span>Coins</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 hover:shadow-lg hover:shadow-pink-200 text-white py-3 rounded-xl font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;