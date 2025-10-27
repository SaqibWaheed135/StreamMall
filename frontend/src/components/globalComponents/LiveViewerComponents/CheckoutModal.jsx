import React from "react";

const CheckoutModal = ({ product, streamId, onClose, setError, userCoinBalance }) => {
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [step, setStep] = useState('delivery');

  const [deliveryInfo, setDeliveryInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const coinCost = Math.ceil(product.price * 100);

  const validateDeliveryInfo = () => {
    const { firstName, lastName, email, phone, address, city, state, zipCode, country } = deliveryInfo;

    if (!firstName.trim() || !lastName.trim()) {
      setPurchaseError('First and last name are required');
      return false;
    }

    if (!email.trim() || !email.includes('@')) {
      setPurchaseError('Valid email is required');
      return false;
    }

    if (!phone.trim()) {
      setPurchaseError('Phone number is required');
      return false;
    }

    if (!address.trim()) {
      setPurchaseError('Address is required');
      return false;
    }

    if (!city.trim()) {
      setPurchaseError('City is required');
      return false;
    }

    if (!state.trim()) {
      setPurchaseError('State/Province is required');
      return false;
    }

    if (!zipCode.trim()) {
      setPurchaseError('ZIP/Postal code is required');
      return false;
    }

    if (!country.trim()) {
      setPurchaseError('Country is required');
      return false;
    }

    return true;
  };

  const handleDeliveryChange = (field, value) => {
    setDeliveryInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setPurchaseError('');
  };

  const handleContinue = () => {
    if (validateDeliveryInfo()) {
      setStep('confirmation');
      setPurchaseError('');
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setPurchaseLoading(true);
    setPurchaseError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/live/${streamId}/purchase-with-coins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          productIndex: product.index,
          coinCost,
          deliveryInfo: deliveryInfo
        })
      });

      const data = await response.json();
      if (response.ok) {
        onClose();
        setError('Purchase successful! Your order has been placed. Check your email for confirmation.');
        setTimeout(() => setError(''), 5000);
      } else {
        setPurchaseError(data.msg || 'Failed to complete purchase');
      }
    } catch (err) {
      setPurchaseError('Purchase failed: ' + err.message);
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sticky top-0 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold">
            {step === 'delivery' ? 'Delivery Information' : 'Confirm Purchase'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'delivery' ? (
            <form className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-lg">{product.name}</h4>
                <p className="text-gray-300 text-sm mt-1">{product.description}</p>
                <p className="font-bold text-yellow-400 mt-2">${product.price} ({coinCost} coins)</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    value={deliveryInfo.firstName}
                    onChange={(e) => handleDeliveryChange('firstName', e.target.value)}
                    placeholder="First name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={deliveryInfo.lastName}
                    onChange={(e) => handleDeliveryChange('lastName', e.target.value)}
                    placeholder="Last name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={deliveryInfo.email}
                  onChange={(e) => handleDeliveryChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={deliveryInfo.phone}
                  onChange={(e) => handleDeliveryChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <input
                  type="text"
                  value={deliveryInfo.address}
                  onChange={(e) => handleDeliveryChange('address', e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    value={deliveryInfo.city}
                    onChange={(e) => handleDeliveryChange('city', e.target.value)}
                    placeholder="City"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State/Province *</label>
                  <input
                    type="text"
                    value={deliveryInfo.state}
                    onChange={(e) => handleDeliveryChange('state', e.target.value)}
                    placeholder="State"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP/Postal Code *</label>
                  <input
                    type="text"
                    value={deliveryInfo.zipCode}
                    onChange={(e) => handleDeliveryChange('zipCode', e.target.value)}
                    placeholder="12345"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country *</label>
                  <input
                    type="text"
                    value={deliveryInfo.country}
                    onChange={(e) => handleDeliveryChange('country', e.target.value)}
                    placeholder="Country"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {purchaseError && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm">
                  {purchaseError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold"
                >
                  Continue
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePurchase} className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-lg">{product.name}</h4>
                <p className="text-gray-300 text-sm">{product.description}</p>

                <div className="border-t border-gray-600 pt-3 mt-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Product Price:</span>
                    <span>${product.price}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Coin Cost:</span>
                    <span className="text-yellow-400 font-semibold">{coinCost} coins</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Your Balance:</span>
                    <span className={userCoinBalance >= coinCost ? 'text-green-400' : 'text-red-400'}>
                      {userCoinBalance} coins
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                <h5 className="font-semibold text-sm mb-2">Delivery To:</h5>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>{deliveryInfo.firstName} {deliveryInfo.lastName}</p>
                  <p>{deliveryInfo.address}</p>
                  <p>{deliveryInfo.city}, {deliveryInfo.state} {deliveryInfo.zipCode}</p>
                  <p>{deliveryInfo.country}</p>
                  <p className="pt-2 text-gray-400">Email: {deliveryInfo.email}</p>
                  <p className="text-gray-400">Phone: {deliveryInfo.phone}</p>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                <h5 className="font-semibold text-sm mb-2">Payment Method:</h5>
                <div className="text-sm text-yellow-300">
                  <p>Coins: {coinCost}</p>
                  <p className="text-xs text-yellow-400 mt-1">Deducted from your account balance</p>
                </div>
              </div>

              {purchaseError && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm">
                  {purchaseError}
                </div>
              )}

              {userCoinBalance < coinCost && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm">
                  Insufficient coins. You need {coinCost - userCoinBalance} more coins.
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('delivery')}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={purchaseLoading || userCoinBalance < coinCost}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 rounded-lg font-semibold"
                >
                  {purchaseLoading ? 'Processing...' : 'Confirm Purchase'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal