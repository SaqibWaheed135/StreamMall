import React, { useState, useEffect, useRef } from 'react';
import { Camera, Users, Heart, MessageCircle, Send, X, ShoppingBag, Coins, TrendingUp } from 'lucide-react';
import io from 'socket.io-client';

let Room, RoomEvent, Track;

const loadLiveKit = async () => {
  try {
    const livekit = await import('livekit-client');
    Room = livekit.Room;
    RoomEvent = livekit.RoomEvent;
    Track = livekit.Track;
    return true;
  } catch (err) {
    console.error('LiveKit not installed');
    return false;
  }
};

const API_URL = 'https://theclipstream-backend.onrender.com/api';
const SOCKET_URL = 'https://theclipstream-backend.onrender.com';

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
    
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || 
        !address.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
      setPurchaseError('All fields are required');
      return false;
    }
    if (!email.includes('@')) {
      setPurchaseError('Valid email is required');
      return false;
    }
    return true;
  };

  const handleDeliveryChange = (field, value) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
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
        setError('✓ Purchase successful! Check your email for confirmation.');
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sticky top-0 bg-black border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
            {step === 'delivery' ? 'Delivery Info' : 'Confirm Order'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'delivery' ? (
            <form className="space-y-4">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-lg text-white">{product.name}</h4>
                <p className="text-gray-300 text-sm mt-1">{product.description}</p>
                <p className="font-bold text-yellow-400 mt-2">${product.price} ({coinCost} coins)</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">First Name *</label>
                  <input
                    type="text"
                    value={deliveryInfo.firstName}
                    onChange={(e) => handleDeliveryChange('firstName', e.target.value)}
                    placeholder="First"
                    className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Last Name *</label>
                  <input
                    type="text"
                    value={deliveryInfo.lastName}
                    onChange={(e) => handleDeliveryChange('lastName', e.target.value)}
                    placeholder="Last"
                    className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Email *</label>
                <input
                  type="email"
                  value={deliveryInfo.email}
                  onChange={(e) => handleDeliveryChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Phone *</label>
                <input
                  type="tel"
                  value={deliveryInfo.phone}
                  onChange={(e) => handleDeliveryChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Address *</label>
                <input
                  type="text"
                  value={deliveryInfo.address}
                  onChange={(e) => handleDeliveryChange('address', e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">City *</label>
                  <input
                    type="text"
                    value={deliveryInfo.city}
                    onChange={(e) => handleDeliveryChange('city', e.target.value)}
                    placeholder="City"
                    className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">State *</label>
                  <input
                    type="text"
                    value={deliveryInfo.state}
                    onChange={(e) => handleDeliveryChange('state', e.target.value)}
                    placeholder="State"
                    className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">ZIP Code *</label>
                  <input
                    type="text"
                    value={deliveryInfo.zipCode}
                    onChange={(e) => handleDeliveryChange('zipCode', e.target.value)}
                    placeholder="12345"
                    className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Country *</label>
                  <input
                    type="text"
                    value={deliveryInfo.country}
                    onChange={(e) => handleDeliveryChange('country', e.target.value)}
                    placeholder="Country"
                    className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {purchaseError && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded text-sm">{purchaseError}</div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 py-2 rounded-lg font-bold"
                >
                  Continue
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePurchase} className="space-y-4">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg p-4">
                <h4 className="font-bold text-lg text-white">{product.name}</h4>
                <div className="border-t border-white/10 mt-3 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Price:</span>
                    <span>${product.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Coins:</span>
                    <span className="text-yellow-400 font-bold">{coinCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Balance:</span>
                    <span className={userCoinBalance >= coinCost ? 'text-green-400' : 'text-red-400'}>
                      {userCoinBalance} coins
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                <h5 className="font-bold text-sm mb-2 text-blue-300">Delivery To:</h5>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>{deliveryInfo.firstName} {deliveryInfo.lastName}</p>
                  <p>{deliveryInfo.address}</p>
                  <p>{deliveryInfo.city}, {deliveryInfo.state} {deliveryInfo.zipCode}</p>
                  <p>{deliveryInfo.country}</p>
                  <p className="pt-2 text-gray-400 text-xs">Email: {deliveryInfo.email}</p>
                </div>
              </div>

              {purchaseError && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded text-sm">{purchaseError}</div>
              )}

              {userCoinBalance < coinCost && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded text-sm">
                  Need {coinCost - userCoinBalance} more coins
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('delivery')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={purchaseLoading || userCoinBalance < coinCost}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-lg font-bold transition-all"
                >
                  {purchaseLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const ViewerLiveStream = ({ streamId, onBack }) => {
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [hearts, setHearts] = useState([]);
  const [liveKitRoom, setLiveKitRoom] = useState(null);
  const [liveKitReady, setLiveKitReady] = useState(false);
  const [products, setProducts] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userCoinBalance, setUserCoinBalance] = useState(0);
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const commentsEndRef = useRef(null);

  useEffect(() => {
    loadLiveKit().then(ready => {
      setLiveKitReady(ready);
      if (ready && streamId) {
        fetchStream();
      }
    });

    const fetchUserBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/live/user/coin-balance`, {
          headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
        });
        const data = await response.json();
        if (response.ok) setUserCoinBalance(data.balance || 0);
      } catch (err) {
        console.error('Error fetching balance:', err);
      }
    };
    fetchUserBalance();

    return () => {
      if (liveKitRoom) liveKitRoom.disconnect();
      if (socket) socket.disconnect();
    };
  }, [streamId]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      auth: token ? { token } : {},
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
      newSocket.emit('join-stream', { streamId, isStreamer: false });
    });

    newSocket.on('new-comment', (data) => {
      setComments(prev => [...prev, {
        id: Date.now() + Math.random(),
        username: data.username || 'Viewer',
        text: data.text,
        timestamp: new Date()
      }]);
    });

    newSocket.on('heart-sent', () => {
      const heartId = Date.now() + Math.random();
      setHearts(prev => [...prev, { id: heartId, x: Math.random() * 80 + 10 }]);
      setTimeout(() => setHearts(prev => prev.filter(h => h.id !== heartId)), 3000);
    });

    newSocket.on('connect_error', () => {
      setSocketConnected(false);
      setError('Chat connecting...');
    });

    newSocket.on('disconnect', () => {
      setSocketConnected(false);
    });

    setSocket(newSocket);
  };

  const fetchStream = async () => {
    try {
      const response = await fetch(`${API_URL}/live/${streamId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Stream not found');
      
      setStream(data);
      setProducts(data.products?.map((p, i) => ({ ...p, index: i })) || []);
      
      if (data.viewerToken && data.roomUrl) {
        await connectToLiveKit(data.roomUrl, data.viewerToken);
      }
      
      initializeSocket();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const connectToLiveKit = async (roomUrl, viewerToken) => {
    try {
      const room = new Room();
      await room.connect(roomUrl, viewerToken);
      setLiveKitRoom(room);

      room.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((publication) => {
          if (publication.isSubscribed && publication.track) {
            handleTrackSubscribed(publication.track);
          }
        });
      });

      room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    } catch (err) {
      console.error('LiveKit error:', err);
      setError('Failed to connect to stream');
    }
  };

  const handleTrackSubscribed = (track) => {
    if (track.kind === Track.Kind.Video) {
      setTimeout(() => {
        const videoEl = document.querySelector(`video[data-participant]`);
        if (videoEl) {
          track.attach(videoEl);
          videoEl.play().catch(err => console.warn('Video play error:', err));
        }
      }, 200);
    }
  };

  const sendHeart = () => {
    if (!socketConnected) {
      setError('Chat not connected');
      return;
    }
    socket?.emit('send-heart', { streamId });
    const heartId = Date.now() + Math.random();
    setHearts(prev => [...prev, { id: heartId, x: Math.random() * 80 + 10 }]);
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== heartId)), 3000);
  };

  const sendComment = (e) => {
    e.preventDefault();
    if (!comment.trim() || !socketConnected) return;
    
    socket?.emit('send-comment', { streamId, text: comment.trim() });
    setComments(prev => [...prev, {
      id: Date.now(),
      username: 'You',
      text: comment,
      timestamp: new Date()
    }]);
    setComment('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gradient-to-r from-pink-500 to-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Connecting to live stream...</p>
        </div>
      </div>
    );
  }

  if (error && !stream) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Stream Unavailable</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={onBack} className="bg-gradient-to-r from-pink-500 to-cyan-500 px-6 py-2 rounded-lg font-bold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white">
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
        }
      `}</style>
      
      {error && (
        <div className="fixed top-4 left-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-lg z-50 text-sm font-medium">
          {error}
        </div>
      )}

      {showCheckout && selectedProduct && (
        <CheckoutModal
          product={selectedProduct}
          streamId={streamId}
          onClose={() => setShowCheckout(false)}
          setError={setError}
          userCoinBalance={userCoinBalance}
        />
      )}

      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-bold">LIVE</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="w-4 h-4" />
                <span className="text-sm">{stream?.viewers?.length || 0} watching</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-400">
                <Coins className="w-4 h-4" />
                <span className="text-sm font-bold">{userCoinBalance}</span>
              </div>
            </div>
            <button
              onClick={onBack}
              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm border border-white/20 transition-all"
            >
              Exit
            </button>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">{stream?.title}</h1>
          {stream?.description && <p className="text-gray-400 mt-1">{stream.description}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <div className="bg-black rounded-xl aspect-video relative overflow-hidden border border-white/20 mb-4">
              <video
                data-participant="host"
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {hearts.map((heart) => (
                <div
                  key={heart.id}
                  className="absolute pointer-events-none text-4xl"
                  style={{
                    left: `${heart.x}%`,
                    bottom: '0',
                    animation: 'float-up 3s ease-out forwards',
                  }}
                >
                  ❤️
                </div>
              ))}
            </div>

            {products.length > 0 && (
              <div className="bg-black/50 backdrop-blur border border-white/10 rounded-xl p-4">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-pink-400" />
                  Featured Items
                </h3>
                <div className="flex overflow-x-auto gap-4 pb-4">
                  {products.map((p, i) => (
                    <div key={i} className="min-w-[220px] bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-lg p-4">
                      {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-32 object-cover rounded mb-3" />}
                      <h4 className="font-bold text-sm mb-2">{p.name}</h4>
                      <p className="text-gray-400 text-xs mb-2">{p.description}</p>
                      <p className="font-bold text-yellow-400 mb-3">${p.price}</p>
                      {p.type === 'product' ? (
                        <button 
                          onClick={() => {
                            const token = localStorage.getItem('token');
                            if (!token) {
                              setError('Please log in to purchase');
                              return;
                            }
                            setSelectedProduct({ ...p, index: i });
                            setShowCheckout(true);
                          }}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-2 rounded-lg text-sm font-bold transition-all"
                        >
                          Buy Now
                        </button>
                      ) : (
                        <a 
                          href={p.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-2 rounded-lg text-sm font-bold block text-center transition-all"
                        >
                          View Ad
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-black/50 backdrop-blur border border-white/10 rounded-xl h-[600px] flex flex-col">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-bold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-cyan-400" />
                  Live Chat
                  {socketConnected ? (
                    <span className="text-xs bg-green-500/50 px-2 py-1 rounded ml-auto border border-green-400/50">Connected</span>
                  ) : (
                    <span className="text-xs bg-red-500/50 px-2 py-1 rounded ml-auto border border-red-400/50">Connecting...</span>
                  )}
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-semibold text-cyan-400">@{c.username}: </span>
                    <span className="text-gray-300">{c.text}</span>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center text-gray-500 mt-20">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-sm">Be the first to comment!</p>
                  </div>
                )}
                <div ref={commentsEndRef} />
              </div>

              <div className="p-4 border-t border-white/10">
                <form onSubmit={sendComment} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={socketConnected ? "Say something..." : "Connecting..."}
                    maxLength={200}
                    disabled={!socketConnected}
                    className="flex-1 bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!socketConnected || !comment.trim()}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <button
                  onClick={sendHeart}
                  disabled={!socketConnected}
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-lg flex items-center justify-center gap-2 transition-all font-bold text-sm"
                >
                  <Heart className="w-4 h-4" />
                  Send Heart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerLiveStream;