import React from "react";

const OrderDetailsModal = ({ order, product, onClose }) => {
  if (!order || !product) return null;

  const deliveryInfo = order.deliveryInfo || {};

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sticky top-0 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Order Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-2">Product Information</h4>
            <div className="space-y-2">
              <p><span className="text-gray-400">Product:</span> <span className="font-semibold">{product.name}</span></p>
              <p><span className="text-gray-400">Description:</span> <span>{product.description}</span></p>
              <p><span className="text-gray-400">Price:</span> <span className="font-bold text-yellow-400">${product.price}</span></p>
              <p><span className="text-gray-400">Quantity:</span> <span className="font-semibold">{order.quantity}</span></p>
            </div>
          </div>
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-3">Buyer Information</h4>
            <div className="space-y-2">
              <p><span className="text-gray-400">Name:</span> <span className="font-semibold">{order.buyer?.username || 'Unknown'}</span></p>
              <p><span className="text-gray-400">Email:</span> <span>{order.buyer?.email || 'N/A'}</span></p>
              <p><span className="text-gray-400">Status:</span> <span className={`font-semibold ${order.status === 'completed' ? 'text-green-400' : order.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>{order.status}</span></p>
              <p><span className="text-gray-400">Order Date:</span> <span>{new Date(order.orderedAt).toLocaleString()}</span></p>
            </div>
          </div>
          {deliveryInfo && Object.keys(deliveryInfo).length > 0 && (
            <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-3">Delivery Address</h4>
              <div className="space-y-2">
                <p><span className="text-gray-400">Name:</span> <span className="font-semibold">{deliveryInfo.firstName} {deliveryInfo.lastName}</span></p>
                <p><span className="text-gray-400">Address:</span> <span>{deliveryInfo.address}</span></p>
                <p><span className="text-gray-400">City:</span> <span>{deliveryInfo.city}</span></p>
                <p><span className="text-gray-400">State/Province:</span> <span>{deliveryInfo.state}</span></p>
                <p><span className="text-gray-400">ZIP/Postal Code:</span> <span className="font-semibold">{deliveryInfo.zipCode}</span></p>
                <p><span className="text-gray-400">Country:</span> <span>{deliveryInfo.country}</span></p>
                <p><span className="text-gray-400">Phone:</span> <span>{deliveryInfo.phone}</span></p>
                <p><span className="text-gray-400">Email:</span> <span>{deliveryInfo.email}</span></p>
              </div>
            </div>
          )}
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-3">Payment Information</h4>
            <div className="space-y-2">
              <p><span className="text-gray-400">Amount:</span> <span className="font-bold text-yellow-400">${product.price}</span></p>
              <p><span className="text-gray-400">Coins Earned:</span> <span className="font-bold text-yellow-300">{Math.ceil(product.price * 100)} coins</span></p>
              <p><span className="text-gray-400">Payment Method:</span> <span>Coins</span></p>
            </div>
          </div>
          <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded-lg font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;