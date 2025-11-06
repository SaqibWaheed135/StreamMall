// import React, { useState, useEffect, useRef } from 'react';
// import { Camera, Users, Heart, MessageCircle, Send, X, AlertCircle, Clock, Eye, HeartIcon } from 'lucide-react';
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
//   const commentsEndRef = useRef(null);

//   useEffect(() => {
//     loadLiveKit().then(ready => {
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
//             ...(token && { 'Authorization': `Bearer ${token}` })
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
//       document.querySelectorAll('audio[data-participant]').forEach(el => el.remove());
//     };
//   }, [streamId]);

//   useEffect(() => {
//     if (commentsEndRef.current) {
//       commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [comments]);

//   const initializeSocket = () => {
//     console.log('Initializing socket connection...');

//     const token = localStorage.getItem('token');

//     const newSocket = io(SOCKET_URL, {
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       reconnectionAttempts: 5,
//       transports: ['websocket', 'polling'],
//       auth: token ? { token: token } : {},
//       forceNew: true
//     });

//     newSocket.on('connect', () => {
//       console.log('Socket connected! ID:', newSocket.id);
//       setSocketConnected(true);

//       newSocket.emit('join-stream', {
//         streamId: streamId,
//         isStreamer: false
//       });
//       console.log('Emitted join-stream event');
//     });

//     newSocket.on('joined-stream', (data) => {
//       console.log('Successfully joined stream');
//     });

//     newSocket.on('new-comment', (data) => {
//       console.log('New comment received:', data);
//       setComments(prev => [...prev, {
//         id: Date.now() + Math.random(),
//         username: data.username || 'Viewer',
//         text: data.text,
//         timestamp: new Date()
//       }]);
//     });

//     newSocket.on('heart-sent', (data) => {
//       console.log('Heart animation triggered');
//       const heartId = Date.now() + Math.random();
//       setHearts(prev => [...prev, {
//         id: heartId,
//         x: Math.random() * 80 + 10
//       }]);
//       setTimeout(() => {
//         setHearts(prev => prev.filter(h => h.id !== heartId));
//       }, 3000);
//     });

//     newSocket.on('product-added', (data) => {
//       if (data.streamId === streamId) {
//         setProducts(prev => [
//           ...prev,
//           { ...data.product, index: data.productIndex }
//         ]);
//       }
//     });

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

//     newSocket.on('connect_error', (error) => {
//       console.error('Socket connection error:', error);
//       setSocketConnected(false);
//       setError('Chat connection failed. Retrying...');
//     });

//     newSocket.on('error', (error) => {
//       console.error('Socket error:', error);
//       setError('Connection error: ' + (error.message || 'Unknown error'));
//     });

//     newSocket.on('disconnect', (reason) => {
//       console.log('Socket disconnected:', reason);
//       setSocketConnected(false);
//     });

//     newSocket.on('reconnect', () => {
//       console.log('Socket reconnected');
//       setSocketConnected(true);
//     });

//     setSocket(newSocket);
//   };

//   const fetchStream = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/live/${streamId}`);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.msg || 'Stream not found');
//       }

//       console.log('Stream fetched:', data);
//       setStream(data);
//       setProducts(data.products.map((p, index) => ({ ...p, index })) || []);
//       setViewerCount(data.viewers?.length || 0);

//       if (data.viewerToken && data.roomUrl) {
//         await connectToLiveKit(data.roomUrl, data.viewerToken);
//       }

//       initializeSocket();

//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const connectToLiveKit = async (roomUrl, viewerToken) => {
//     try {
//       console.log('Connecting to LiveKit as viewer...');

//       const room = new Room();
//       await room.connect(roomUrl, viewerToken);
//       setLiveKitRoom(room);
//       console.log('Connected to LiveKit room');

//       // Subscribe to host's tracks only
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
//           audioEls.forEach(el => el.remove());
//         }
//         track.detach();
//       });

//       room.on(RoomEvent.ParticipantDisconnected, (participant) => {
//         console.log('Participant left:', participant.identity);
//         const audioEls = document.querySelectorAll(`audio[data-participant="${participant.identity}"]`);
//         audioEls.forEach(el => el.remove());
//       });

//       room.on(RoomEvent.ParticipantConnected, () => {
//         setViewerCount(room.remoteParticipants.size);
//       });

//       room.on(RoomEvent.ParticipantDisconnected, () => {
//         setViewerCount(room.remoteParticipants.size);
//       });

//     } catch (err) {
//       console.error('LiveKit connection error:', err);
//       setError('Failed to connect: ' + err.message);
//     }
//   };

//   const handleTrackSubscribed = (track, publication, participant) => {
//     console.log('Track subscribed:', track.kind, 'from', participant.identity);

//     if (track.kind === Track.Kind.Video) {
//       setTimeout(() => {
//         const videoEl = document.querySelector(`video[data-participant="${participant.identity}"]`);
//         if (videoEl) {
//           track.attach(videoEl);
//           videoEl.muted = true;
//           videoEl.volume = 0;
//           videoEl.play().catch(err => console.warn('Video play error:', err));
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
//           console.log('Audio playing');
//           setAudioEnabled(true);
//         })
//         .catch((err) => {
//           console.error('Audio autoplay failed:', err);
//           setError('Click anywhere to enable audio');

//           const playOnInteraction = () => {
//             audioEl.play()
//               .then(() => {
//                 console.log('Audio started after interaction');
//                 setError('');
//                 setAudioEnabled(true);
//                 document.removeEventListener('click', playOnInteraction);
//                 document.removeEventListener('touchstart', playOnInteraction);
//               })
//               .catch(e => console.error('Audio play failed:', e));
//           };

//           document.addEventListener('click', playOnInteraction, { once: true });
//           document.addEventListener('touchstart', playOnInteraction, { once: true });
//         });
//     }
//   };

//   const sendHeart = () => {
//     if (socket && socketConnected) {
//       socket.emit('send-heart', { streamId: streamId });
//       console.log('Heart emitted via socket');
//     } else {
//       console.warn('Socket not connected, cannot send heart');
//       setError('Chat not connected. Please wait...');
//       return;
//     }

//     const heartId = Date.now() + Math.random();
//     setHearts(prev => [...prev, { id: heartId, x: Math.random() * 80 + 10 }]);
//     setTimeout(() => {
//       setHearts(prev => prev.filter(h => h.id !== heartId));
//     }, 3000);
//   };

//   const sendComment = (e) => {
//     e.preventDefault();
//     if (!comment.trim()) return;

//     if (socket && socketConnected) {
//       socket.emit('send-comment', {
//         streamId: streamId,
//         text: comment.trim()
//       });
//       console.log('Comment emitted via socket:', comment);
//     } else {
//       console.warn('Socket not connected');
//       setError('Chat not connected. Please wait...');
//       return;
//     }

//     const newComment = {
//       id: Date.now(),
//       username: 'You',
//       text: comment,
//       timestamp: new Date()
//     };

//     setComments(prev => [...prev, newComment]);
//     setComment('');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
//           <p>Connecting to live stream...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error && !stream) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
//         <div className="text-center max-w-md">
//           <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-bold mb-2">Stream Not Available</h2>
//           <p className="text-gray-400 mb-4">{error}</p>
//           <button
//             onClick={onBack}
//             className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Get host participant (should only be one)
//   const hostParticipant = liveKitRoom ? Array.from(liveKitRoom.remoteParticipants.values())[0] : null;

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       <style>{`
//         @keyframes float-up {
//           0% { transform: translateY(0) scale(1); opacity: 1; }
//           100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
//         }
//       `}</style>

//       {error && (
//         <div className="fixed top-4 left-4 right-4 bg-yellow-500/90 text-black px-4 py-3 rounded-lg text-sm z-50">
//           {error}
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

//       <div className="max-w-6xl mx-auto p-4">
//         <div className="mb-4">
//           <div className="flex items-center justify-between mb-2">
//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
//                 <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
//                 <span className="text-sm font-semibold">LIVE</span>
//               </div>
//               <div className="flex items-center gap-2 text-gray-300">
//                 <Users className="w-4 h-4" />
//                 <span className="text-sm">{viewerCount} watching</span>
//               </div>
//               {audioEnabled && (
//                 <div className="flex items-center gap-2 text-green-400 text-xs">
//                   <span>Audio enabled</span>
//                 </div>
//               )}
//             </div>
//             <button
//               onClick={onBack}
//               className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm"
//             >
//               Exit
//             </button>
//           </div>
//           <h1 className="text-2xl font-bold">{stream?.title}</h1>
//           {stream?.description && (
//             <p className="text-gray-400 mt-1">{stream.description}</p>
//           )}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
//           <div className="lg:col-span-3">
//             <div className="bg-black rounded-lg aspect-video relative overflow-hidden">
//               {!hostParticipant ? (
//                 <div className="flex items-center justify-center h-full">
//                   <div className="text-center">
//                     <div className="animate-pulse mb-4">
//                       <Camera className="w-16 h-16 mx-auto text-gray-600" />
//                     </div>
//                     <p className="text-gray-500 text-lg">Waiting for host...</p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="relative bg-gray-800 w-full h-full">
//                   <video
//                     data-participant={hostParticipant.identity}
//                     autoPlay
//                     playsInline
//                     muted
//                     className="w-full h-full object-cover"
//                   />
//                   <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-2">
//                     <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//                     <span>@{hostParticipant.identity}</span>
//                   </div>
//                 </div>
//               )}

//               {hearts.map((heart) => (
//                 <div
//                   key={heart.id}
//                   className="absolute pointer-events-none text-3xl"
//                   style={{
//                     left: `${heart.x}%`,
//                     bottom: '0',
//                     animation: 'float-up 3s ease-out forwards',
//                   }}
//                 >
//                   ❤️
//                 </div>
//               ))}
//             </div>

//             <div className="bg-gray-800 rounded-lg p-4 mt-4">
//               <h3 className="font-semibold mb-2">Featured Items</h3>
//               <div className="flex overflow-x-auto gap-4 pb-4">
//                 {products.length === 0 ? (
//                   <p className="text-gray-400 text-sm">No items available yet</p>
//                 ) : (
//                   products.map((p, i) => (
//                     <div key={i} className="min-w-[200px] bg-gray-700 rounded-lg p-3">
//                       {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-32 object-cover rounded mb-2" />}
//                       <h4 className="font-semibold">{p.name}</h4>
//                       <p className="text-gray-400 mb-2 text-sm">{p.description}</p>
//                       <p className="font-bold mb-2">${p.price}</p>
//                       {p.type === 'product' ? (
//                         <button
//                           onClick={() => {
//                             const token = localStorage.getItem('token');
//                             if (!token) {
//                               setError('Please log in to purchase');
//                               return;
//                             }
//                             setSelectedProduct({ ...p, index: i });
//                             setShowCartModal(true);
//                           }}
//                           className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg text-sm"
//                         >
//                           Buy Now
//                         </button>
//                       ) : (
//                         <a
//                           href={p.link}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm block text-center"
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
//             <div className="bg-gray-800 rounded-lg h-[600px] flex flex-col">
//               <div className="p-4 border-b border-gray-700">
//                 <h3 className="font-semibold flex items-center gap-2">
//                   <MessageCircle className="w-5 h-5" />
//                   Live Chat
//                   {socketConnected ? (
//                     <span className="text-xs bg-green-600 px-2 py-1 rounded ml-auto">Connected</span>
//                   ) : (
//                     <span className="text-xs bg-red-600 px-2 py-1 rounded ml-auto">Connecting...</span>
//                   )}
//                 </h3>
//               </div>

//               <div className="flex-1 overflow-y-auto p-4 space-y-3">
//                 {comments.map((c) => (
//                   <div key={c.id} className="text-sm">
//                     <span className="font-semibold text-blue-400">{c.username}: </span>
//                     <span className="text-gray-300">{c.text}</span>
//                   </div>
//                 ))}
//                 {comments.length === 0 && (
//                   <div className="text-center text-gray-500 mt-20">
//                     <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
//                     <p className="text-sm">Be the first to comment!</p>
//                   </div>
//                 )}
//                 <div ref={commentsEndRef} />
//               </div>

//               <div className="p-4 border-t border-gray-700">
//                 <form onSubmit={sendComment} className="flex gap-2 mb-2">
//                   <input
//                     type="text"
//                     value={comment}
//                     onChange={(e) => setComment(e.target.value)}
//                     placeholder={socketConnected ? "Say something..." : "Connecting..."}
//                     maxLength={200}
//                     disabled={!socketConnected}
//                     className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
//                   />
//                   <button
//                     type="submit"
//                     disabled={!socketConnected}
//                     className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     <Send className="w-4 h-4" />
//                   </button>
//                 </form>
//                 <button
//                   onClick={sendHeart}
//                   disabled={!socketConnected}
//                   className="w-full bg-pink-600 hover:bg-pink-700 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <Heart className="w-4 h-4" />
//                   <span className="text-sm font-semibold">Send Heart</span>
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


import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Users, Heart, MessageCircle, Send, X, 
  AlertCircle, Gift, DollarSign, Lock, Coins 
} from 'lucide-react';

// Gift types configuration
const GIFT_TYPES = [
  { type: 'rose', icon: '🌹', name: 'Rose', price: 10 },
  { type: 'heart', icon: '💗', name: 'Heart', price: 50 },
  { type: 'star', icon: '⭐', name: 'Star', price: 100 },
  { type: 'diamond', icon: '💎', name: 'Diamond', price: 500 },
  { type: 'crown', icon: '👑', name: 'Crown', price: 1000 }
];

const ViewerLiveStream = ({ streamId, onBack }) => {
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [hearts, setHearts] = useState([]);
  const [products, setProducts] = useState([]);
  const [userCoinBalance, setUserCoinBalance] = useState(0);
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  
  // NEW: Monetization states
  const [hasAccess, setHasAccess] = useState(false);
  const [requiresPayment, setRequiresPayment] = useState(false);
  const [entryFee, setEntryFee] = useState(0);
  const [payingEntry, setPayingEntry] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [sendingGift, setSendingGift] = useState(false);
  const [customTipAmount, setCustomTipAmount] = useState('');
  
  const commentsEndRef = useRef(null);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  // Fetch user coin balance
  const fetchUserCoinBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/live/user/coin-balance', {
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

  // Check access to stream
  const checkStreamAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      
      const response = await fetch(`/api/live/${streamId}/check-access`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setHasAccess(data.hasAccess);
        setEntryFee(data.entryFee || 0);
        setRequiresPayment(!data.hasAccess && data.entryFee > 0);
      }
    } catch (err) {
      console.error('Error checking access:', err);
    }
  };

  // Pay entry fee via HTTP
  const payEntryFee = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to access this stream');
      return;
    }

    setPayingEntry(true);
    setError('');

    try {
      const response = await fetch(`/api/live/${streamId}/pay-entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setHasAccess(true);
        setRequiresPayment(false);
        setUserCoinBalance(data.remainingBalance);
        fetchStream();
      } else {
        setError(data.msg || 'Payment failed');
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setPayingEntry(false);
    }
  };

  // Send gift via socket
  const sendGift = async (giftType, amount) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to send gifts');
      return;
    }

    if (userCoinBalance < amount) {
      setError(`Insufficient coins. You need ${amount} coins.`);
      return;
    }

    if (!socket || !socketConnected) {
      setError('Connection error. Please wait...');
      return;
    }

    setSendingGift(true);

    socket.emit('send-tip', {
      streamId: streamId,
      amount: amount,
      giftType: giftType
    });

    socket.once('tip-sent', (data) => {
      setUserCoinBalance(data.remainingBalance);
      setShowGiftPanel(false);
      setSendingGift(false);
      
      const giftIcon = GIFT_TYPES.find(g => g.type === giftType)?.icon || '🎁';
      setComments(prev => [...prev, {
        id: Date.now(),
        username: 'You',
        text: `sent ${giftIcon} ${giftType}!`,
        timestamp: new Date(),
        isGift: true
      }]);
    });

    socket.once('tip-failed', (data) => {
      setError(data.message || 'Failed to send gift');
      setSendingGift(false);
    });
  };

  // Send custom tip amount
  const sendCustomTip = () => {
    const amount = parseInt(customTipAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    sendGift(null, amount);
    setCustomTipAmount('');
  };

  // Setup socket with NEW monetization listeners
  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    const newSocket = io(window.SOCKET_URL || 'http://localhost:5000', {
      auth: token ? { token } : {}
    });

    newSocket.on('connect', () => {
      setSocketConnected(true);
      newSocket.emit('join-stream', {
        streamId: streamId,
        isStreamer: false
      });
    });

    newSocket.on('access-denied', (data) => {
      setRequiresPayment(true);
      setEntryFee(data.entryFee);
      setError(data.message);
    });

    newSocket.on('payment-success', (data) => {
      setHasAccess(true);
      setRequiresPayment(false);
      setUserCoinBalance(data.remainingBalance);
    });

    newSocket.on('tip-received', (data) => {
      const giftIcon = GIFT_TYPES.find(g => g.type === data.giftType)?.icon || '🎁';
      
      setComments(prev => [...prev, {
        id: Date.now() + Math.random(),
        username: data.tipper.username,
        text: `sent ${giftIcon} ${data.giftType || 'gift'} (${data.amount} coins)`,
        timestamp: new Date(),
        isGift: true
      }]);

      const heartId = Date.now() + Math.random();
      setHearts(prev => [...prev, {
        id: heartId,
        x: Math.random() * 80 + 10,
        icon: giftIcon
      }]);
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== heartId));
      }, 3000);
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
      setHearts(prev => [...prev, {
        id: heartId,
        x: Math.random() * 80 + 10,
        icon: '❤️'
      }]);
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== heartId));
      }, 3000);
    });

    setSocket(newSocket);
  };

  const fetchStream = async () => {
    try {
      const response = await fetch(`/api/live/${streamId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Stream not found');
      }

      setStream(data);
      setProducts(data.products?.map((p, index) => ({ ...p, index })) || []);
      setViewerCount(data.viewers?.length || 0);

      if (data.entryFee > 0) {
        await checkStreamAccess();
      } else {
        setHasAccess(true);
      }

      initializeSocket();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCoinBalance();
    fetchStream();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [streamId]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim() || !socket || !socketConnected) return;
    
    socket.emit('send-comment', { streamId, text: comment.trim() });
    setComment('');
  };

  const handleSendHeart = () => {
    if (!socket || !socketConnected) return;
    socket.emit('send-heart', { streamId });
  };

  if (requiresPayment) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-6">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Premium Stream</h2>
            <p className="text-gray-400">This stream requires payment to watch</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Entry Fee:</span>
              <span className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                <Coins className="w-6 h-6" />
                {entryFee}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Your Balance:</span>
              <span className={`text-lg font-semibold ${userCoinBalance >= entryFee ? 'text-green-400' : 'text-red-400'}`}>
                {userCoinBalance} coins
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {userCoinBalance < entryFee && (
            <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 p-3 rounded mb-4 text-sm">
              Insufficient coins. You need {entryFee - userCoinBalance} more coins.
            </div>
          )}

          <button
            onClick={payEntryFee}
            disabled={payingEntry || userCoinBalance < entryFee}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-semibold mb-3"
          >
            {payingEntry ? 'Processing...' : `Pay ${entryFee} Coins to Watch`}
          </button>

          <button
            onClick={onBack}
            className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center gap-1 bg-yellow-600 px-2 py-1 rounded-full">
                <Coins className="w-3 h-3" />
                <span className="text-xs font-semibold">{userCoinBalance}</span>
              </div>
            </div>
            <button
              onClick={onBack}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm"
            >
              Exit
            </button>
          </div>
          <h1 className="text-2xl font-bold">{stream?.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <div className="bg-black rounded-lg aspect-video relative overflow-hidden">
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
                  className="absolute pointer-events-none text-3xl"
                  style={{
                    left: `${heart.x}%`,
                    bottom: '0',
                    animation: 'float-up 3s ease-out forwards',
                  }}
                >
                  {heart.icon}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg h-[500px] flex flex-col mb-4">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Live Chat
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className={`text-sm ${c.isGift ? 'bg-pink-900/30 p-2 rounded' : ''}`}>
                    <span className={`font-semibold ${c.isGift ? 'text-pink-400' : 'text-blue-400'}`}>
                      {c.username}:{' '}
                    </span>
                    <span className="text-gray-300">{c.text}</span>
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>

              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(e)}
                    placeholder="Say something..."
                    maxLength={200}
                    disabled={!socketConnected}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                  />
                  <button 
                    onClick={handleCommentSubmit} 
                    disabled={!socketConnected} 
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleSendHeart}
                  disabled={!socketConnected}
                  className="w-full bg-pink-600 hover:bg-pink-700 py-2 rounded-lg flex items-center justify-center gap-2 mb-2"
                >
                  <Heart className="w-4 h-4" />
                  Send Heart
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <button
                onClick={() => setShowGiftPanel(!showGiftPanel)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold mb-3"
              >
                <Gift className="w-5 h-5" />
                Send Gift
              </button>

              {showGiftPanel && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 mb-2">Choose a gift:</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {GIFT_TYPES.map((gift) => (
                      <button
                        key={gift.type}
                        onClick={() => sendGift(gift.type, gift.price)}
                        disabled={sendingGift || userCoinBalance < gift.price}
                        className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 p-3 rounded-lg transition-colors"
                      >
                        <div className="text-2xl mb-1">{gift.icon}</div>
                        <div className="text-xs font-semibold">{gift.name}</div>
                        <div className="text-xs text-yellow-400">{gift.price} coins</div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Custom amount:</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={customTipAmount}
                        onChange={(e) => setCustomTipAmount(e.target.value)}
                        placeholder="Enter coins"
                        min="1"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                      />
                      <button
                        onClick={sendCustomTip}
                        disabled={sendingGift}
                        className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerLiveStream;