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
import { Camera, Users, Heart, MessageCircle, Send, X, DollarSign, Gift, Lock } from 'lucide-react';
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
  
  // NEW: Payment & Tipping States
  const [hasAccess, setHasAccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const commentsEndRef = useRef(null);

  const gifts = [
    { type: 'rose', icon: '🌹', cost: 10, label: 'Rose' },
    { type: 'heart', icon: '❤️', cost: 20, label: 'Heart' },
    { type: 'star', icon: '⭐', cost: 50, label: 'Star' },
    { type: 'diamond', icon: '💎', cost: 100, label: 'Diamond' },
    { type: 'crown', icon: '👑', cost: 200, label: 'Crown' }
  ];

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

      // Check access before joining
      if (hasAccess) {
        newSocket.emit('join-stream', {
          streamId: streamId,
          isStreamer: false
        });
        console.log('Emitted join-stream event');
      }
    });

    // NEW: Handle access denied
    newSocket.on('access-denied', (data) => {
      console.log('Access denied:', data);
      setShowPaymentModal(true);
      setHasAccess(false);
    });

    // NEW: Handle payment success
    newSocket.on('payment-success', (data) => {
      console.log('Payment successful:', data);
      setUserCoinBalance(data.remainingBalance);
      setHasAccess(true);
      setShowPaymentModal(false);
      
      // Join stream after payment
      newSocket.emit('join-stream', {
        streamId: streamId,
        isStreamer: false
      });
    });

    // NEW: Handle tip sent confirmation
    newSocket.on('tip-sent', (data) => {
      console.log('Tip sent successfully:', data);
      setUserCoinBalance(data.remainingBalance);
      setError(`Gift sent successfully! 🎁`);
      setTimeout(() => setError(''), 3000);
    });

    // NEW: Listen for tip notifications (from all viewers)
    newSocket.on('tip-received', (data) => {
      console.log('Tip received in stream:', data);
      // Show animation for everyone
      const heartId = Date.now() + Math.random();
      setHearts(prev => [...prev, {
        id: heartId,
        x: Math.random() * 80 + 10,
        icon: getGiftIcon(data.giftType)
      }]);
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== heartId));
      }, 3000);
    });

    newSocket.on('joined-stream', (data) => {
      console.log('Successfully joined stream');
      setHasAccess(true);
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
        x: Math.random() * 80 + 10,
        icon: '❤️'
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

  const getGiftIcon = (type) => {
    const icons = {
      rose: '🌹',
      heart: '❤️',
      star: '⭐',
      diamond: '💎',
      crown: '👑'
    };
    return icons[type] || '🎁';
  };

  const fetchStream = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/live/${streamId}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Stream not found');
      }

      console.log('Stream fetched:', data);
      setStream(data);
      setProducts(data.products?.map((p, index) => ({ ...p, index })) || []);
      setViewerCount(data.viewers?.length || 0);

      // NEW: Check if stream requires payment
      if (data.entryFee && data.entryFee > 0) {
        // Check if user has already paid
        const accessResponse = await fetch(`${API_BASE_URL}/live/${streamId}/check-access`, {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });
        const accessData = await accessResponse.json();
        
        if (accessData.hasAccess) {
          setHasAccess(true);
          // Connect to LiveKit and socket
          if (data.viewerToken && data.roomUrl) {
            await connectToLiveKit(data.roomUrl, data.viewerToken);
          }
          initializeSocket();
        } else {
          setHasAccess(false);
          setShowPaymentModal(true);
        }
      } else {
        // Free stream
        setHasAccess(true);
        if (data.viewerToken && data.roomUrl) {
          await connectToLiveKit(data.roomUrl, data.viewerToken);
        }
        initializeSocket();
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayEntry = async () => {
    if (!stream?.entryFee) return;
    
    if (userCoinBalance < stream.entryFee) {
      setError('Insufficient coins! Please purchase more coins.');
      return;
    }

    setPaymentProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/live/${streamId}/pay-entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUserCoinBalance(data.remainingBalance);
        setHasAccess(true);
        setShowPaymentModal(false);
        
        // Connect to stream
        if (stream.viewerToken && stream.roomUrl) {
          await connectToLiveKit(stream.roomUrl, stream.viewerToken);
        }
        initializeSocket();
        
        setError('Payment successful! Welcome to the stream 🎉');
        setTimeout(() => setError(''), 3000);
      } else {
        setError(data.msg || 'Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleSendGift = async (gift) => {
    if (userCoinBalance < gift.cost) {
      setError('Insufficient coins! Please purchase more coins.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/live/${streamId}/send-tip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          amount: gift.cost,
          giftType: gift.type
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUserCoinBalance(data.remainingBalance);
        setShowTipModal(false);
        setError(`You sent a ${gift.label}! 🎁`);
        setTimeout(() => setError(''), 3000);
      } else {
        setError(data.msg || 'Failed to send gift');
      }
    } catch (err) {
      console.error('Send gift error:', err);
      setError('Failed to send gift. Please try again.');
    }
  };

  const connectToLiveKit = async (roomUrl, viewerToken) => {
    try {
      console.log('Connecting to LiveKit as viewer...');

      const room = new Room();
      await room.connect(roomUrl, viewerToken);
      setLiveKitRoom(room);
      console.log('Connected to LiveKit room');

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
    setHearts(prev => [...prev, { id: heartId, x: Math.random() * 80 + 10, icon: '❤️' }]);
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

  // NEW: Payment Modal
  if (!hasAccess && showPaymentModal && stream) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{stream?.title}</h2>
            <p className="text-gray-400 mb-4">by @{stream?.streamer?.username}</p>
            
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-400 mb-2">Entry Fee</p>
              <p className="text-4xl font-bold text-yellow-400">{stream?.entryFee} coins</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-400">Your Balance</p>
              <p className="text-2xl font-semibold text-green-400">{userCoinBalance} coins</p>
            </div>
          </div>

          {userCoinBalance >= stream?.entryFee ? (
            <>
              <button
                onClick={handlePayEntry}
                disabled={paymentProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed py-3 rounded-lg font-semibold mb-3 transition-colors"
              >
                {paymentProcessing ? 'Processing...' : 'Pay & Enter Stream'}
              </button>
              <button
                onClick={onBack}
                disabled={paymentProcessing}
                className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">
                  ⚠️ Insufficient coins. You need {stream?.entryFee - userCoinBalance} more coins.
                </p>
              </div>
              <button
                onClick={() => alert('Redirecting to purchase coins...')}
                className="w-full bg-yellow-600 hover:bg-yellow-700 py-3 rounded-lg font-semibold mb-3 transition-colors"
              >
                Purchase Coins
              </button>
              <button
                onClick={onBack}
                className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors"
              >
                Go Back
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

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

      {/* NEW: Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Send a Gift 🎁</h3>
              <button
                onClick={() => setShowTipModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gray-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-400">Your Balance</p>
              <p className="text-2xl font-semibold text-green-400">{userCoinBalance} coins</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {gifts.map((gift) => (
                <button
                  key={gift.type}
                  onClick={() => handleSendGift(gift)}
                  disabled={userCoinBalance < gift.cost}
                  className={`bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg p-4 transition-all transform hover:scale-105 ${
                    userCoinBalance < gift.cost ? 'opacity-50' : ''
                  }`}
                >
                  <div className="text-4xl mb-2">{gift.icon}</div>
                  <p className="text-sm font-semibold">{gift.label}</p>
                  <p className="text-xs text-yellow-400">{gift.cost} coins</p>
                </button>
              ))}
            </div>
          </div>
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
              <div className="flex items-center gap-2 bg-green-600 px-3 py-1 rounded-full">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-semibold">{userCoinBalance}</span>
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
                  {heart.icon}
                </div>
              ))}
            </div>

            {/* NEW: Gift Button */}
            <div className="mt-4">
              <button
                onClick={() => setShowTipModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all transform hover:scale-105"
              >
                <Gift className="w-5 h-5" />
                Send a Gift
              </button>
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
                      <p className="text-gray-400 mb-2 text-sm line-clamp-2">{p.description}</p>
                      <p className="font-bold mb-2">${p.price}</p>
                      {p.type === 'product' ? (
                        <button
                          onClick={() => {
                            const token = localStorage.getItem('token');
                            if (!token) {
                              setError('Please log in to purchase');
                              setTimeout(() => setError(''), 3000);
                              return;
                            }
                            setSelectedProduct({ ...p, index: i });
                            setShowCartModal(true);
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg text-sm transition-colors"
                        >
                          Buy Now
                        </button>
                      ) : (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm block text-center transition-colors"
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