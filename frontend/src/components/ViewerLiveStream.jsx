import React, { useState, useEffect, useRef } from 'react';
import { Camera, Users, Heart, MessageCircle, Send, X, AlertCircle, Clock, Eye, HeartIcon } from 'lucide-react';
import io from 'socket.io-client';
import loadLiveKit from './globalComponents/liveKitLoad';
import CheckoutModal from './globalComponents/LiveViewerComponents/CheckoutModal';
import StreamEndedModal from './globalComponents/LiveViewerComponents/StreamEndedModal';
import { API_BASE_URL, SOCKET_URL } from '../config/api';
import { Room, RoomEvent, Track } from 'livekit-client';

const ViewerLiveStream = ({ streamId, onBack }) => {
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [hearts, setHearts] = useState([]);
  const [liveKitRoom, setLiveKitRoom] = useState(null);
  const [liveKitReady, setLiveKitReady] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [products, setProducts] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userCoinBalance, setUserCoinBalance] = useState(0);
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [showStreamEnded, setShowStreamEnded] = useState(false);
  const [endedStreamData, setEndedStreamData] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    loadLiveKit().then(ready => {
      setLiveKitReady(ready);
      if (ready && streamId) {
        fetchStream();
      }
    });

    const fetchUserCoinBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/live/user/coin-balance`, {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUserCoinBalance(data.balance || 0);
        }
      } catch (err) {
        console.error('Error fetching coin balance:', err);
      }
    };
    fetchUserCoinBalance();

    return () => {
      if (liveKitRoom) {
        liveKitRoom.disconnect();
      }
      if (socket) {
        socket.disconnect();
      }
      document.querySelectorAll('audio[data-participant]').forEach(el => el.remove());
    };
  }, [streamId]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  const initializeSocket = () => {
    console.log('Initializing socket connection...');

    const token = localStorage.getItem('token');

    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      auth: token ? { token: token } : {},
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('Socket connected! ID:', newSocket.id);
      setSocketConnected(true);

      newSocket.emit('join-stream', {
        streamId: streamId,
        isStreamer: false
      });
      console.log('Emitted join-stream event');
    });

    newSocket.on('joined-stream', (data) => {
      console.log('Successfully joined stream');
    });

    newSocket.on('new-comment', (data) => {
      console.log('New comment received:', data);
      setComments(prev => [...prev, {
        id: Date.now() + Math.random(),
        username: data.username || 'Viewer',
        text: data.text,
        timestamp: new Date()
      }]);
    });

    newSocket.on('heart-sent', (data) => {
      console.log('Heart animation triggered');
      const heartId = Date.now() + Math.random();
      setHearts(prev => [...prev, {
        id: heartId,
        x: Math.random() * 80 + 10
      }]);
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== heartId));
      }, 3000);
    });

    newSocket.on('product-added', (data) => {
      if (data.streamId === streamId) {
        setProducts(prev => [
          ...prev,
          { ...data.product, index: data.productIndex }
        ]);
      }
    });

    newSocket.on('stream-ended', (data) => {
      if (data.stream?._id === streamId) {
        setEndedStreamData({
          duration: data.duration,
          totalViews: data.stream.totalViews,
          heartsReceived: data.stream.heartsReceived
        });
        setShowStreamEnded(true);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
      setError('Chat connection failed. Retrying...');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setError('Connection error: ' + (error.message || 'Unknown error'));
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setSocketConnected(false);
    });

    newSocket.on('reconnect', () => {
      console.log('Socket reconnected');
      setSocketConnected(true);
    });

    setSocket(newSocket);
  };

  const fetchStream = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/live/${streamId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Stream not found');
      }

      console.log('Stream fetched:', data);
      setStream(data);
      setProducts(data.products.map((p, index) => ({ ...p, index })) || []);
      setViewerCount(data.viewers?.length || 0);

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
      console.log('Connecting to LiveKit as viewer...');

      const room = new Room();
      await room.connect(roomUrl, viewerToken);
      setLiveKitRoom(room);
      console.log('Connected to LiveKit room');

      // Subscribe to host's tracks only
      room.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((publication) => {
          if (publication.isSubscribed && publication.track) {
            handleTrackSubscribed(publication.track, publication, participant);
          }
        });
      });

      room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);

      room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio) {
          const audioEls = document.querySelectorAll(`audio[data-participant="${participant.identity}"]`);
          audioEls.forEach(el => el.remove());
        }
        track.detach();
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log('Participant left:', participant.identity);
        const audioEls = document.querySelectorAll(`audio[data-participant="${participant.identity}"]`);
        audioEls.forEach(el => el.remove());
      });

      room.on(RoomEvent.ParticipantConnected, () => {
        setViewerCount(room.remoteParticipants.size);
      });

      room.on(RoomEvent.ParticipantDisconnected, () => {
        setViewerCount(room.remoteParticipants.size);
      });

    } catch (err) {
      console.error('LiveKit connection error:', err);
      setError('Failed to connect: ' + err.message);
    }
  };

  const handleTrackSubscribed = (track, publication, participant) => {
    console.log('Track subscribed:', track.kind, 'from', participant.identity);

    if (track.kind === Track.Kind.Video) {
      setTimeout(() => {
        const videoEl = document.querySelector(`video[data-participant="${participant.identity}"]`);
        if (videoEl) {
          track.attach(videoEl);
          videoEl.muted = true;
          videoEl.volume = 0;
          videoEl.play().catch(err => console.warn('Video play error:', err));
        }
      }, 200);
    }

    if (track.kind === Track.Kind.Audio) {
      const existingAudio = document.querySelector(`audio[data-participant="${participant.identity}"]`);
      if (existingAudio) {
        existingAudio.remove();
      }

      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioEl.playsInline = true;
      audioEl.muted = false;
      audioEl.volume = 1.0;
      audioEl.dataset.participant = participant.identity;

      track.attach(audioEl);
      document.body.appendChild(audioEl);

      audioEl.play()
        .then(() => {
          console.log('Audio playing');
          setAudioEnabled(true);
        })
        .catch((err) => {
          console.error('Audio autoplay failed:', err);
          setError('Click anywhere to enable audio');

          const playOnInteraction = () => {
            audioEl.play()
              .then(() => {
                console.log('Audio started after interaction');
                setError('');
                setAudioEnabled(true);
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('touchstart', playOnInteraction);
              })
              .catch(e => console.error('Audio play failed:', e));
          };

          document.addEventListener('click', playOnInteraction, { once: true });
          document.addEventListener('touchstart', playOnInteraction, { once: true });
        });
    }
  };

  const sendHeart = () => {
    if (socket && socketConnected) {
      socket.emit('send-heart', { streamId: streamId });
      console.log('Heart emitted via socket');
    } else {
      console.warn('Socket not connected, cannot send heart');
      setError('Chat not connected. Please wait...');
      return;
    }

    const heartId = Date.now() + Math.random();
    setHearts(prev => [...prev, { id: heartId, x: Math.random() * 80 + 10 }]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== heartId));
    }, 3000);
  };

  const sendComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (socket && socketConnected) {
      socket.emit('send-comment', {
        streamId: streamId,
        text: comment.trim()
      });
      console.log('Comment emitted via socket:', comment);
    } else {
      console.warn('Socket not connected');
      setError('Chat not connected. Please wait...');
      return;
    }

    const newComment = {
      id: Date.now(),
      username: 'You',
      text: comment,
      timestamp: new Date()
    };

    setComments(prev => [...prev, newComment]);
    setComment('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Connecting to live stream...</p>
        </div>
      </div>
    );
  }

  if (error && !stream) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Stream Not Available</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get host participant (should only be one)
  const hostParticipant = liveKitRoom ? Array.from(liveKitRoom.remoteParticipants.values())[0] : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
        }
      `}</style>

      {error && (
        <div className="fixed top-4 left-4 right-4 bg-yellow-500/90 text-black px-4 py-3 rounded-lg text-sm z-50">
          {error}
        </div>
      )}

      {showCartModal && selectedProduct && (
        <CheckoutModal
          product={selectedProduct}
          streamId={streamId}
          onClose={() => setShowCartModal(false)}
          setError={setError}
          userCoinBalance={userCoinBalance}
        />
      )}

      {showStreamEnded && endedStreamData && (
        <StreamEndedModal streamData={endedStreamData} onNavigate={onBack} />
      )}

      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">LIVE</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="w-4 h-4" />
                <span className="text-sm">{viewerCount} watching</span>
              </div>
              {audioEnabled && (
                <div className="flex items-center gap-2 text-green-400 text-xs">
                  <span>Audio enabled</span>
                </div>
              )}
            </div>
            <button
              onClick={onBack}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm"
            >
              Exit
            </button>
          </div>
          <h1 className="text-2xl font-bold">{stream?.title}</h1>
          {stream?.description && (
            <p className="text-gray-400 mt-1">{stream.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <div className="bg-black rounded-lg aspect-video relative overflow-hidden">
              {!hostParticipant ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-pulse mb-4">
                      <Camera className="w-16 h-16 mx-auto text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-lg">Waiting for host...</p>
                  </div>
                </div>
              ) : (
                <div className="relative bg-gray-800 w-full h-full">
                  <video
                    data-participant={hostParticipant.identity}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>@{hostParticipant.identity}</span>
                  </div>
                </div>
              )}

              {hearts.map((heart) => (
                <div
                  key={heart.id}
                  className="absolute pointer-events-none text-3xl"
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

            <div className="bg-gray-800 rounded-lg p-4 mt-4">
              <h3 className="font-semibold mb-2">Featured Items</h3>
              <div className="flex overflow-x-auto gap-4 pb-4">
                {products.length === 0 ? (
                  <p className="text-gray-400 text-sm">No items available yet</p>
                ) : (
                  products.map((p, i) => (
                    <div key={i} className="min-w-[200px] bg-gray-700 rounded-lg p-3">
                      {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-32 object-cover rounded mb-2" />}
                      <h4 className="font-semibold">{p.name}</h4>
                      <p className="text-gray-400 mb-2 text-sm">{p.description}</p>
                      <p className="font-bold mb-2">${p.price}</p>
                      {p.type === 'product' ? (
                        <button
                          onClick={() => {
                            const token = localStorage.getItem('token');
                            if (!token) {
                              setError('Please log in to purchase');
                              return;
                            }
                            setSelectedProduct({ ...p, index: i });
                            setShowCartModal(true);
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg text-sm"
                        >
                          Buy Now
                        </button>
                      ) : (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm block text-center"
                        >
                          View Ad
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg h-[600px] flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Live Chat
                  {socketConnected ? (
                    <span className="text-xs bg-green-600 px-2 py-1 rounded ml-auto">Connected</span>
                  ) : (
                    <span className="text-xs bg-red-600 px-2 py-1 rounded ml-auto">Connecting...</span>
                  )}
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-semibold text-blue-400">{c.username}: </span>
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

              <div className="p-4 border-t border-gray-700">
                <form onSubmit={sendComment} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={socketConnected ? "Say something..." : "Connecting..."}
                    maxLength={200}
                    disabled={!socketConnected}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!socketConnected}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <button
                  onClick={sendHeart}
                  disabled={!socketConnected}
                  className="w-full bg-pink-600 hover:bg-pink-700 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-semibold">Send Heart</span>
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


// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Camera,
//   Users,
//   Heart,
//   MessageCircle,
//   Send,
//   X,
//   DollarSign,
//   Gift,
//   Lock
// } from 'lucide-react';
// import io from 'socket.io-client';
// import loadLiveKit from './globalComponents/liveKitLoad';
// import CheckoutModal from './globalComponents/LiveViewerComponents/CheckoutModal';
// import StreamEndedModal from './globalComponents/LiveViewerComponents/StreamEndedModal';
// import { API_BASE_URL, SOCKET_URL } from '../config/api';
// import { Room, RoomEvent, Track } from 'livekit-client';

// const ViewerLiveStream = ({ streamId, onBack }) => {
//   const [stream, setStream] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [comment, setComment] = useState('');
//   const [comments, setComments] = useState([]);
//   const [hearts, setHearts] = useState([]);
//   const [liveKitRoom, setLiveKitRoom] = useState(null);
//   const [liveKitReady, setLiveKitReady] = useState(false);
//   const [audioEnabled, setAudioEnabled] = useState(false);
//   const [products, setProducts] = useState([]);
//   const [showCartModal, setShowCartModal] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [userCoinBalance, setUserCoinBalance] = useState(0);
//   const [socket, setSocket] = useState(null);
//   const [socketConnected, setSocketConnected] = useState(false);
//   const [showStreamEnded, setShowStreamEnded] = useState(false);
//   const [endedStreamData, setEndedStreamData] = useState(null);
//   const [viewerCount, setViewerCount] = useState(0);

//   // NEW: Payment & Tipping States
//   const [hasAccess, setHasAccess] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [showTipModal, setShowTipModal] = useState(false);
//   const [paymentProcessing, setPaymentProcessing] = useState(false);

//   const commentsEndRef = useRef(null);

//   const gifts = [
//     { type: 'rose', icon: '🌹', cost: 10, label: 'Rose' },
//     { type: 'heart', icon: '❤️', cost: 20, label: 'Heart' },
//     { type: 'star', icon: '⭐', cost: 50, label: 'Star' },
//     { type: 'diamond', icon: '💎', cost: 100, label: 'Diamond' },
//     { type: 'crown', icon: '👑', cost: 200, label: 'Crown' }
//   ];

//   useEffect(() => {
//     loadLiveKit().then((ready) => {
//       setLiveKitReady(ready);
//       if (ready && streamId) {
//         fetchStream();
//       }
//     });

//     const fetchUserCoinBalance = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch(`${API_BASE_URL}/live/user/coin-balance`, {
//           headers: {
//             ...(token && { Authorization: `Bearer ${token}` })
//           }
//         });
//         const data = await response.json();
//         if (response.ok) {
//           setUserCoinBalance(data.balance || 0);
//         }
//       } catch (err) {
//         console.error('Error fetching coin balance:', err);
//       }
//     };
//     fetchUserCoinBalance();

//     return () => {
//       if (liveKitRoom) {
//         liveKitRoom.disconnect();
//       }
//       if (socket) {
//         socket.disconnect();
//       }
//       document.querySelectorAll('audio[data-participant]').forEach((el) => el.remove());
//     };
//   }, [streamId]);

//   useEffect(() => {
//     if (commentsEndRef.current) {
//       commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [comments]);

//   const initializeSocket = () => {
//     const token = localStorage.getItem('token');

//     const newSocket = io(SOCKET_URL, {
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       reconnectionAttempts: 5,
//       transports: ['websocket', 'polling'],
//       auth: token ? { token } : {},
//       forceNew: true
//     });

//     newSocket.on('connect', () => {
//       setSocketConnected(true);

//       if (hasAccess) {
//         newSocket.emit('join-stream', {
//           streamId,
//           isStreamer: false
//         });
//       }
//     });

//     newSocket.on('access-denied', () => {
//       setShowPaymentModal(true);
//       setHasAccess(false);
//     });

//     newSocket.on('payment-success', (data) => {
//       setUserCoinBalance(data.remainingBalance);
//       setHasAccess(true);
//       setShowPaymentModal(false);

//       newSocket.emit('join-stream', {
//         streamId,
//         isStreamer: false
//       });
//     });

//     newSocket.on('tip-sent', (data) => {
//       setUserCoinBalance(data.remainingBalance);
//       setError('Gift sent successfully! 🎁');
//       setTimeout(() => setError(''), 3000);
//     });

//     newSocket.on('tip-received', (data) => {
//       const heartId = Date.now() + Math.random();
//       setHearts((prev) => [
//         ...prev,
//         {
//           id: heartId,
//           x: Math.random() * 80 + 10,
//           icon: getGiftIcon(data.giftType)
//         }
//       ]);
//       setTimeout(() => {
//         setHearts((prev) => prev.filter((h) => h.id !== heartId));
//       }, 3000);
//     });

//     newSocket.on('joined-stream', () => {
//       setHasAccess(true);
//     });

//     // newSocket.on('new-comment', (data) => {
//     //   setComments((prev) => [
//     //     ...prev,
//     //     {
//     //       id: Date.now() + Math.random(),
//     //       username: data.username || 'Viewer',
//     //       text: data.text,
//     //       timestamp: new Date(),
//     //       replies: [] // Add replies array

//     //     }
//     //   ]);
//     // });

//     // Add NEW listener for replies

//     newSocket.on('new-comment', (data) => {
//       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//       console.log('📨 New comment received on VIEWER:', data);
//       console.log('Comment _id:', data._id);
//       console.log('Comment id:', data.id);

//       const newComment = {
//         _id: data._id || data.id, // ✅ PRIMARY: Use MongoDB _id
//         id: data.id || data._id,   // ✅ FALLBACK: Include legacy id
//         username: data.username || 'Viewer',
//         text: data.text,
//         timestamp: new Date(data.timestamp || Date.now()),
//         replies: [] // ✅ Initialize empty replies array
//       };

//       console.log('Storing comment with IDs:', {
//         _id: newComment._id,
//         id: newComment.id
//       });

//       setComments(prev => {
//         console.log('Current comments before add:', prev.length);
//         return [...prev, newComment];
//       });

//       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     });

//     // newSocket.on('new-reply', (data) => {
//     //   setComments(prev => prev.map(comment =>
//     //     comment._id === data.commentId || comment.id === data.commentId
//     //       ? {
//     //         ...comment,
//     //         replies: [...(comment.replies || []), {
//     //           _id: data.reply._id,
//     //           username: data.reply.username,
//     //           text: data.reply.text,
//     //           timestamp: new Date(data.reply.timestamp),
//     //           isHost: data.reply.isHost
//     //         }]
//     //       }
//     //       : comment
//     //   ));
//     // });


//     // Add NEW reply listener to ViewerLiveStream.jsx
//    // In ViewerLiveStream.jsx - Replace the new-reply listener in initializeSocket()

// newSocket.on('new-reply', (data) => {
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//   console.log('💬 Reply received on VIEWER');
//   console.log('Comment ID to match:', data.commentId);
//   console.log('Reply data:', data.reply);

//   setComments(prev => {
//     console.log('Current viewer comments:', prev.length);
//     console.log('Looking for comment with ID:', data.commentId);

//     // Log all comment IDs for debugging
//     prev.forEach((comment, index) => {
//       console.log(`Comment ${index}: _id=${comment._id}, id=${comment.id}`);
//     });

//     let foundMatch = false;

//     const updated = prev.map(comment => {
//       // ✅ CRITICAL FIX: Match using string comparison for both _id and id
//       const commentIdStr = String(comment._id || comment.id);
//       const targetIdStr = String(data.commentId);
      
//       const isMatch = commentIdStr === targetIdStr;

//       if (isMatch) {
//         foundMatch = true;
//         console.log('✅ MATCH FOUND! Adding reply to comment');
//         console.log('Existing replies:', comment.replies?.length || 0);

//         return {
//           ...comment,
//           replies: [...(comment.replies || []), {
//             _id: data.reply._id,
//             username: data.reply.username,
//             text: data.reply.text,
//             timestamp: new Date(data.reply.timestamp),
//             isHost: data.reply.isHost
//           }]
//         };
//       }
//       return comment;
//     });

//     if (!foundMatch) {
//       console.error('❌ NO MATCH FOUND for commentId:', data.commentId);
//       console.error('Available comment IDs:', prev.map(c => ({ _id: c._id, id: c.id })));
//     } else {
//       console.log('✅ Reply successfully added on viewer side');
//     }

//     console.log('Updated comments count:', updated.length);
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     return updated;
//   });
// });

//     newSocket.on('heart-sent', () => {
//       const heartId = Date.now() + Math.random();
//       setHearts((prev) => [
//         ...prev,
//         { id: heartId, x: Math.random() * 80 + 10, icon: '❤️' }
//       ]);
//       setTimeout(() => {
//         setHearts((prev) => prev.filter((h) => h.id !== heartId));
//       }, 3000);
//     });

//    // In ViewerLiveStream.jsx - Replace the product-added listener in initializeSocket()

// newSocket.on('product-added', (data) => {
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//   console.log('🎁 Product received on VIEWER');
//   console.log('Stream ID match:', data.streamId === streamId);
//   console.log('Product data:', data.product);
//   console.log('Product has imageUrl:', !!data.product.imageUrl);
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

//   if (data.streamId === streamId) {
//     setProducts((prev) => {
//       // Check if product already exists to avoid duplicates
//       const exists = prev.some(p => p.index === data.productIndex);
//       if (exists) {
//         console.log('⚠️ Product already exists, skipping');
//         return prev;
//       }

//       console.log('✅ Adding new product to viewer products list');
//       return [
//         ...prev,
//         { 
//           ...data.product, 
//           index: data.productIndex,
//           imageUrl: data.product.imageUrl // ✅ Ensure imageUrl is included
//         }
//       ];
//     });
//   }
// });

//     newSocket.on('stream-ended', (data) => {
//       if (data.stream?._id === streamId) {
//         setEndedStreamData({
//           duration: data.duration,
//           totalViews: data.stream.totalViews,
//           heartsReceived: data.stream.heartsReceived
//         });
//         setShowStreamEnded(true);
//       }
//     });

//     newSocket.on('connect_error', () => {
//       setSocketConnected(false);
//       setError('Chat connection failed. Retrying...');
//     });

//     newSocket.on('error', (socketError) => {
//       setError(`Connection error: ${socketError.message || 'Unknown error'}`);
//     });

//     newSocket.on('disconnect', () => {
//       setSocketConnected(false);
//     });

//     newSocket.on('reconnect', () => {
//       setSocketConnected(true);
//     });

//     setSocket(newSocket);
//   };

//   const getGiftIcon = (type) => {
//     const icons = {
//       rose: '🌹',
//       heart: '❤️',
//       star: '⭐',
//       diamond: '💎',
//       crown: '👑'
//     };
//     return icons[type] || '🎁';
//   };

//   const fetchStream = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_BASE_URL}/live/${streamId}`, {
//         headers: {
//           ...(token && { Authorization: `Bearer ${token}` })
//         }
//       });
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.msg || 'Stream not found');
//       }

//       setStream(data);
//       setProducts(data.products?.map((p, index) => ({ ...p, index })) || []);
//       setViewerCount(data.viewers?.length || 0);

//       if (data.entryFee && data.entryFee > 0) {
//         const accessResponse = await fetch(`${API_BASE_URL}/live/${streamId}/check-access`, {
//           headers: {
//             ...(token && { Authorization: `Bearer ${token}` })
//           }
//         });
//         const accessData = await accessResponse.json();

//         if (accessData.hasAccess) {
//           setHasAccess(true);
//           if (data.viewerToken && data.roomUrl) {
//             await connectToLiveKit(data.roomUrl, data.viewerToken);
//           }
//           initializeSocket();
//         } else {
//           setHasAccess(false);
//           setShowPaymentModal(true);
//         }
//       } else {
//         setHasAccess(true);
//         if (data.viewerToken && data.roomUrl) {
//           await connectToLiveKit(data.roomUrl, data.viewerToken);
//         }
//         initializeSocket();
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePayEntry = async () => {
//     if (!stream?.entryFee) return;

//     if (userCoinBalance < stream.entryFee) {
//       setError('Insufficient coins! Please purchase more coins.');
//       return;
//     }

//     setPaymentProcessing(true);

//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_BASE_URL}/live/${streamId}/pay-entry`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token && { Authorization: `Bearer ${token}` })
//         }
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setUserCoinBalance(data.remainingBalance);
//         setHasAccess(true);
//         setShowPaymentModal(false);

//         if (stream.viewerToken && stream.roomUrl) {
//           await connectToLiveKit(stream.roomUrl, stream.viewerToken);
//         }
//         initializeSocket();

//         setError('Payment successful! Welcome to the stream 🎉');
//         setTimeout(() => setError(''), 3000);
//       } else {
//         setError(data.msg || 'Payment failed');
//       }
//     } catch (err) {
//       setError('Payment failed. Please try again.');
//     } finally {
//       setPaymentProcessing(false);
//     }
//   };

//   const handleSendGift = async (gift) => {
//     if (userCoinBalance < gift.cost) {
//       setError('Insufficient coins! Please purchase more coins.');
//       setTimeout(() => setError(''), 3000);
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_BASE_URL}/live/${streamId}/send-tip`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token && { Authorization: `Bearer ${token}` })
//         },
//         body: JSON.stringify({
//           amount: gift.cost,
//           giftType: gift.type
//         })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setUserCoinBalance(data.remainingBalance);
//         setShowTipModal(false);
//         setError(`You sent a ${gift.label}! 🎁`);
//         setTimeout(() => setError(''), 3000);
//       } else {
//         setError(data.msg || 'Failed to send gift');
//       }
//     } catch (err) {
//       setError('Failed to send gift. Please try again.');
//     }
//   };

//   const connectToLiveKit = async (roomUrl, viewerToken) => {
//     try {
//       const room = new Room();
//       await room.connect(roomUrl, viewerToken);
//       setLiveKitRoom(room);

//       room.remoteParticipants.forEach((participant) => {
//         participant.trackPublications.forEach((publication) => {
//           if (publication.isSubscribed && publication.track) {
//             handleTrackSubscribed(publication.track, publication, participant);
//           }
//         });
//       });

//       room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);

//       room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
//         if (track.kind === Track.Kind.Audio) {
//           const audioEls = document.querySelectorAll(`audio[data-participant="${participant.identity}"]`);
//           audioEls.forEach((el) => el.remove());
//         }
//         track.detach();
//       });

//       room.on(RoomEvent.ParticipantDisconnected, (participant) => {
//         const audioEls = document.querySelectorAll(`audio[data-participant="${participant.identity}"]`);
//         audioEls.forEach((el) => el.remove());
//       });

//       room.on(RoomEvent.ParticipantConnected, () => {
//         setViewerCount(room.remoteParticipants.size);
//       });

//       room.on(RoomEvent.ParticipantDisconnected, () => {
//         setViewerCount(room.remoteParticipants.size);
//       });
//     } catch (err) {
//       setError(`Failed to connect: ${err.message}`);
//     }
//   };

//   const handleTrackSubscribed = (track, publication, participant) => {
//     if (track.kind === Track.Kind.Video) {
//       setTimeout(() => {
//         const videoEl = document.querySelector(`video[data-participant="${participant.identity}"]`);
//         if (videoEl) {
//           track.attach(videoEl);
//           videoEl.muted = true;
//           videoEl.volume = 0;
//           videoEl.play().catch((err) => console.warn('Video play error:', err));
//         }
//       }, 200);
//     }

//     if (track.kind === Track.Kind.Audio) {
//       const existingAudio = document.querySelector(`audio[data-participant="${participant.identity}"]`);
//       if (existingAudio) {
//         existingAudio.remove();
//       }

//       const audioEl = document.createElement('audio');
//       audioEl.autoplay = true;
//       audioEl.playsInline = true;
//       audioEl.muted = false;
//       audioEl.volume = 1.0;
//       audioEl.dataset.participant = participant.identity;

//       track.attach(audioEl);
//       document.body.appendChild(audioEl);

//       audioEl.play()
//         .then(() => {
//           setAudioEnabled(true);
//         })
//         .catch((err) => {
//           setError('Click anywhere to enable audio');

//           const playOnInteraction = () => {
//             audioEl.play()
//               .then(() => {
//                 setError('');
//                 setAudioEnabled(true);
//                 document.removeEventListener('click', playOnInteraction);
//                 document.removeEventListener('touchstart', playOnInteraction);
//               })
//               .catch((e) => console.error('Audio play failed:', e));
//           };

//           document.addEventListener('click', playOnInteraction, { once: true });
//           document.addEventListener('touchstart', playOnInteraction, { once: true });
//         });
//     }
//   };

//   const sendHeart = () => {
//     if (socket && socketConnected) {
//       socket.emit('send-heart', { streamId });
//     } else {
//       setError('Chat not connected. Please wait...');
//       return;
//     }

//     const heartId = Date.now() + Math.random();
//     setHearts((prev) => [...prev, { id: heartId, x: Math.random() * 80 + 10, icon: '❤️' }]);
//     setTimeout(() => {
//       setHearts((prev) => prev.filter((h) => h.id !== heartId));
//     }, 3000);
//   };

//   const sendComment = (e) => {
//     e.preventDefault();
//     if (!comment.trim()) return;

//     if (socket && socketConnected) {
//       console.log('📤 Sending comment from viewer:', comment.trim());

//       socket.emit('send-comment', {
//         streamId,
//         text: comment.trim()
//       });
//     } else {
//       setError('Chat not connected. Please wait...');
//       return;
//     }

//     const newComment = {
//       id: Date.now(),
//       username: 'You',
//       text: comment,
//       timestamp: new Date()
//     };

//     setComments((prev) => [...prev, newComment]);
//     setComment('');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-[#FFC0CB] via-[#ffb3c6] to-[#ff99b3] text-gray-900 flex items-center justify-center">
//         <div className="text-center bg-white/80 backdrop-blur-2xl px-10 py-8 rounded-3xl shadow-2xl border border-white/70">
//           <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
//           <p className="text-pink-700 font-semibold">Connecting to live stream...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error && !stream) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-[#FFC0CB] via-[#ffb3c6] to-[#ff99b3] text-gray-900 flex items-center justify-center p-4">
//         <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/70 p-10 max-w-lg w-full text-center">
//           <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
//             <X className="w-10 h-10 text-white" />
//           </div>
//           <h2 className="text-2xl font-bold text-pink-700 mb-3">Stream Not Available</h2>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <button
//             onClick={onBack}
//             className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:shadow-lg hover:shadow-pink-200 px-6 py-3 rounded-xl text-white font-semibold transition-all"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!hasAccess && showPaymentModal && stream) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-[#FFC0CB] via-[#ffb3c6] to-[#ff99b3] text-gray-900 flex items-center justify-center p-4">
//         <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/70 p-8 sm:p-10 max-w-lg w-full">
//           <div className="text-center mb-8">
//             <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
//               <Lock className="w-12 h-12 text-white" />
//             </div>
//             <h2 className="text-3xl font-bold text-pink-700 mb-2">{stream?.title}</h2>
//             <p className="text-gray-600 mb-6">by @{stream?.streamer?.username}</p>

//             <div className="bg-white/80 border border-[#ffb3c6] rounded-2xl p-5 mb-5 shadow-inner">
//               <p className="text-sm text-gray-600 mb-2 uppercase tracking-wide">Entry Fee</p>
//               <p className="text-4xl font-extrabold text-pink-600">{stream?.entryFee} coins</p>
//             </div>

//             <div className="bg-white/70 border border-[#ffb3c6] rounded-2xl p-4 mb-6">
//               <p className="text-sm text-gray-600">Your Balance</p>
//               <p className="text-2xl font-semibold text-pink-600">{userCoinBalance} coins</p>
//             </div>
//           </div>

//           {userCoinBalance >= stream?.entryFee ? (
//             <>
//               <button
//                 onClick={handlePayEntry}
//                 disabled={paymentProcessing}
//                 className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:shadow-lg hover:shadow-pink-200 disabled:opacity-70 disabled:cursor-not-allowed py-3.5 rounded-xl font-semibold text-white transition-all mb-3"
//               >
//                 {paymentProcessing ? 'Processing...' : 'Pay & Enter Stream'}
//               </button>
//               <button
//                 onClick={onBack}
//                 disabled={paymentProcessing}
//                 className="w-full bg-white text-pink-600 border border-[#ff99b3] hover:bg-[#ffe0ea] py-3.5 rounded-xl font-semibold transition-all"
//               >
//                 Cancel
//               </button>
//             </>
//           ) : (
//             <>
//               <div className="bg-[#ffe4e6] border border-[#fb7185] text-[#be123c] rounded-xl p-4 mb-4 text-sm">
//                 ⚠️ Insufficient coins. You need {stream?.entryFee - userCoinBalance} more coins.
//               </div>
//               <button
//                 onClick={() => alert('Redirecting to purchase coins...')}
//                 className="w-full bg-gradient-to-r from-amber-400 to-amber-300 hover:shadow-lg hover:shadow-amber-200 py-3.5 rounded-xl font-semibold text-amber-900 mb-3 transition-all"
//               >
//                 Purchase Coins
//               </button>
//               <button
//                 onClick={onBack}
//                 className="w-full bg-white text-pink-600 border border-[#ff99b3] hover:bg-[#ffe0ea] py-3.5 rounded-xl font-semibold transition-all"
//               >
//                 Go Back
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     );
//   }

//   const hostParticipant = liveKitRoom ? Array.from(liveKitRoom.remoteParticipants.values())[0] : null;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#FFC0CB] via-[#ffb3c6] to-[#ff99b3] text-gray-900">
//       <style>{`
//         @keyframes float-up {
//           0% { transform: translateY(0) scale(1); opacity: 1; }
//           100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
//         }
//       `}</style>

//       {error && (
//         <div className="fixed top-4 left-4 right-4 flex justify-center z-50">
//           <div className="bg-white/90 backdrop-blur-xl border border-[#ffb3c6] text-pink-700 px-5 py-3 rounded-2xl text-sm shadow-lg">
//             {error}
//           </div>
//         </div>
//       )}

//       {showTipModal && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//           <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-[#ffb3c6] shadow-2xl p-6 sm:p-8 max-w-lg w-full">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-2xl font-bold text-pink-700">Send a Gift 🎁</h3>
//               <button
//                 onClick={() => setShowTipModal(false)}
//                 className="text-pink-400 hover:text-pink-600 transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="bg-white/80 border border-[#ffb3c6] rounded-2xl p-4 mb-5">
//               <p className="text-sm text-gray-600">Your Balance</p>
//               <p className="text-2xl font-semibold text-pink-600">{userCoinBalance} coins</p>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               {gifts.map((gift) => (
//                 <button
//                   key={gift.type}
//                   onClick={() => handleSendGift(gift)}
//                   disabled={userCoinBalance < gift.cost}
//                   className={`bg-white/85 border border-[#ffb3c6] rounded-2xl p-4 text-left transition-all transform hover:scale-[1.02] ${userCoinBalance < gift.cost ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
//                     }`}
//                 >
//                   <div className="text-4xl mb-2">{gift.icon}</div>
//                   <p className="text-sm font-semibold text-gray-800">{gift.label}</p>
//                   <p className="text-xs text-pink-600">{gift.cost} coins</p>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {showCartModal && selectedProduct && (
//         <CheckoutModal
//           product={selectedProduct}
//           streamId={streamId}
//           onClose={() => setShowCartModal(false)}
//           setError={setError}
//           userCoinBalance={userCoinBalance}
//         />
//       )}

//       {showStreamEnded && endedStreamData && (
//         <StreamEndedModal streamData={endedStreamData} onNavigate={onBack} />
//       )}

//       <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
//         <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-3xl shadow-2xl p-5 sm:p-8 mb-8 transition-all">
//           <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
//             <div className="flex flex-wrap items-center gap-3 sm:gap-4">
//               <div className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white px-3 py-1.5 rounded-full shadow">
//                 <div className="w-2 h-2 bg-white rounded-full animate-ping" />
//                 <span className="text-sm font-semibold tracking-wide">LIVE</span>
//               </div>
//               <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-full border border-[#ffb3c6] text-pink-700">
//                 <Users className="w-4 h-4" />
//                 <span className="text-sm font-semibold">{viewerCount} watching</span>
//               </div>
//               <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-full border border-[#ffb3c6] text-pink-700">
//                 <span className="text-sm font-semibold">Your Balance: {userCoinBalance}</span>
//               </div>
//             </div>
//             <button
//               onClick={onBack}
//               className="bg-white text-pink-600 border border-[#ff99b3] hover:bg-[#ffe0ea] px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
//             >
//               Exit
//             </button>
//           </div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-pink-700 mb-2">{stream?.title}</h1>
//           {stream?.description && (
//             <p className="text-gray-600">{stream.description}</p>
//           )}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           <div className="lg:col-span-3 space-y-6">
//             <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-3xl shadow-2xl overflow-hidden aspect-video relative">
//               {!hostParticipant ? (
//                 <div className="flex items-center justify-center h-full">
//                   <div className="text-center">
//                     <div className="animate-pulse mb-4">
//                       <Camera className="w-16 h-16 mx-auto text-pink-400" />
//                     </div>
//                     <p className="text-pink-600 text-lg font-medium">Waiting for host...</p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="relative w-full h-full bg-black">
//                   <video
//                     data-participant={hostParticipant.identity}
//                     autoPlay
//                     playsInline
//                     muted
//                     className="w-full h-full object-cover"
//                   />
//                   <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-sm text-white flex items-center gap-2 shadow">
//                     <div className="w-2 h-2 bg-green-400 rounded-full" />
//                     <span>@{hostParticipant.identity}</span>
//                   </div>
//                 </div>
//               )}

//               {hearts.map((heart) => (
//                 <div
//                   key={heart.id}
//                   className="absolute pointer-events-none text-3xl drop-shadow"
//                   style={{
//                     left: `${heart.x}%`,
//                     bottom: '0',
//                     animation: 'float-up 3s ease-out forwards'
//                   }}
//                 >
//                   {heart.icon}
//                 </div>
//               ))}
//             </div>

//             <button
//               onClick={() => setShowTipModal(true)}
//               className="w-full bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 hover:shadow-lg hover:shadow-pink-200 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-white transition-all transform hover:scale-[1.01]"
//             >
//               <Gift className="w-5 h-5" />
//               Send a Gift
//             </button>

//             <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-3xl shadow-2xl p-5 sm:p-6">
//               <h3 className="font-semibold text-pink-700 text-lg mb-4">Featured Items</h3>
//               <div className="flex overflow-x-auto gap-4 pb-2">
//                 {products.length === 0 ? (
//                   <p className="text-gray-600 text-sm">No items available yet</p>
//                 ) : (
//                   products.map((p, i) => (
//                     <div
//                       key={i}
//                       className="min-w-[200px] bg-white/85 border border-[#ffb3c6] rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all"
//                     >
//                       {p.imageUrl && (
//                         <img
//                           src={p.imageUrl}
//                           alt={p.name}
//                           className="w-full h-32 object-cover rounded-xl mb-3"
//                         />
//                       )}
//                       <h4 className="font-semibold text-gray-800">{p.name}</h4>
//                       <p className="text-gray-600 text-sm mb-3 line-clamp-2">{p.description}</p>
//                       <p className="font-bold text-pink-600 mb-3">${p.price}</p>
//                       {p.type === 'product' ? (
//                         <button
//                           onClick={() => {
//                             const token = localStorage.getItem('token');
//                             if (!token) {
//                               setError('Please log in to purchase');
//                               setTimeout(() => setError(''), 3000);
//                               return;
//                             }
//                             setSelectedProduct({ ...p, index: i });
//                             setShowCartModal(true);
//                           }}
//                           className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:shadow-lg hover:shadow-pink-200 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
//                         >
//                           Buy Now
//                         </button>
//                       ) : (
//                         <a
//                           href={p.link}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="w-full bg-white text-pink-600 border border-[#ff99b3] hover:bg-[#ffe0ea] py-2.5 rounded-xl text-sm font-semibold transition-all block text-center"
//                         >
//                           View Ad
//                         </a>
//                       )}
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="lg:col-span-1">
//             <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-3xl shadow-2xl h-[600px] flex flex-col overflow-hidden">
//               <div className="p-5 border-b border-[#ffb3c6]/70 bg-white/70">
//                 <h3 className="font-semibold text-pink-700 flex items-center gap-2">
//                   <MessageCircle className="w-5 h-5" />
//                   Live Chat
//                   {socketConnected ? (
//                     <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
//                       Connected
//                     </span>
//                   ) : (
//                     <span className="ml-auto text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full">
//                       Connecting...
//                     </span>
//                   )}
//                 </h3>
//               </div>

//               {/* <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/60">
//                 {comments.map((c) => (
//                   <div key={c.id} className="text-sm bg-white/90 border border-[#ffb3c6]/60 rounded-2xl px-4 py-2 shadow-sm">
//                     <span className="font-semibold text-pink-600">{c.username}: </span>
//                     <span className="text-gray-700">{c.text}</span>
//                   </div>
//                 ))}
//                 {comments.length === 0 && (
//                   <div className="text-center text-gray-500 mt-20">
//                     <MessageCircle className="w-12 h-12 mx-auto mb-3 text-pink-300" />
//                     <p className="text-sm">Be the first to comment!</p>
//                   </div>
//                 )}
//                 <div ref={commentsEndRef} />
//               </div> */}

//               <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/60">
//                 {comments.map((c) => (
//                   <div key={c.id} className="space-y-2">
//                     {/* Main Comment */}
//                     <div className="text-sm bg-white/90 border border-[#ffb3c6]/60 rounded-2xl px-4 py-2 shadow-sm">
//                       <span className="font-semibold text-pink-600">{c.username}: </span>
//                       <span className="text-gray-700">{c.text}</span>
//                     </div>

//                     {/* Replies Section */}
//                     {c.replies && c.replies.length > 0 && (
//                       <div className="ml-6 space-y-2">
//                         {c.replies.map((reply) => (
//                           <div
//                             key={reply._id || reply.id}
//                             className={`text-sm rounded-xl px-3 py-2 shadow-sm ${reply.isHost
//                               ? 'bg-pink-50 border-2 border-pink-400'
//                               : 'bg-white/90 border border-[#ffb3c6]/50'
//                               }`}
//                           >
//                             <div className="flex items-start gap-1">
//                               {reply.isHost && <span className="text-pink-600">👑</span>}
//                               <span className={`font-semibold ${reply.isHost ? 'text-pink-700' : 'text-pink-600'
//                                 }`}>
//                                 {reply.username}:
//                               </span>
//                               <span className="text-gray-700">{reply.text}</span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//                 {comments.length === 0 && (
//                   <div className="text-center text-gray-500 mt-20">
//                     <MessageCircle className="w-12 h-12 mx-auto mb-3 text-pink-300" />
//                     <p className="text-sm">Be the first to comment!</p>
//                   </div>
//                 )}
//                 <div ref={commentsEndRef} />
//               </div>

//               <div className="p-4 border-t border-[#ffb3c6]/70 bg-white/70">
//                 <form onSubmit={sendComment} className="flex gap-2 mb-3">
//                   <input
//                     type="text"
//                     value={comment}
//                     onChange={(e) => setComment(e.target.value)}
//                     placeholder={socketConnected ? 'Say something...' : 'Connecting...'}
//                     maxLength={200}
//                     disabled={!socketConnected}
//                     className="flex-1 bg-white/90 border border-[#ffb3c6] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-60"
//                   />
//                   <button
//                     type="submit"
//                     disabled={!socketConnected}
//                     className="bg-gradient-to-r from-pink-600 to-pink-500 hover:shadow-lg hover:shadow-pink-200 p-2.5 rounded-xl text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all"
//                   >
//                     <Send className="w-4 h-4" />
//                   </button>
//                 </form>
//                 <button
//                   onClick={sendHeart}
//                   disabled={!socketConnected}
//                   className="w-full bg-white text-pink-600 border border-[#ff99b3] hover:bg-[#ffe0ea] py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
//                 >
//                   <Heart className="w-4 h-4" />
//                   Send Heart
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewerLiveStream;
