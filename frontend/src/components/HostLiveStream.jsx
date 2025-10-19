// import React, { useState, useEffect, useRef } from 'react';
// import { Camera, Radio, Users, X, Mic, MicOff, Video, VideoOff, MessageCircle, Heart, Coins, TrendingUp, Share2 } from 'lucide-react';
// import io from 'socket.io-client';

// let Room, RoomEvent, Track;

// const loadLiveKit = async () => {
//   try {
//     const livekit = await import('livekit-client');
//     Room = livekit.Room;
//     RoomEvent = livekit.RoomEvent;
//     Track = livekit.Track;
//     return true;
//   } catch (err) {
//     console.error('LiveKit not installed');
//     return false;
//   }
// };

// const API_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com/api';
// const SOCKET_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com';

// const HostLiveStream = ({ onBack }) => {
//   const [isLive, setIsLive] = useState(false);
//   const [streamData, setStreamData] = useState(null);
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [viewerCount, setViewerCount] = useState(0);
//   const [isCameraOn, setIsCameraOn] = useState(true);
//   const [isMicOn, setIsMicOn] = useState(true);
//   const [localStream, setLocalStream] = useState(null);
//   const [liveKitRoom, setLiveKitRoom] = useState(null);
//   const [liveKitReady, setLiveKitReady] = useState(false);
//   const [comments, setComments] = useState([]);
//   const [hearts, setHearts] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [newProduct, setNewProduct] = useState({
//     type: 'product',
//     name: '',
//     description: '',
//     price: 0,
//     imageUrl: '',
//     link: ''
//   });
//   const [orders, setOrders] = useState([]);
//   const [coinBalance, setCoinBalance] = useState(0);
//   const [socket, setSocket] = useState(null);
//   const [shareLink, setShareLink] = useState('');
  
//   const videoRef = useRef(null);
//   const localVideoRef = useRef(null);
//   const commentsEndRef = useRef(null);

//   useEffect(() => {
//     loadLiveKit().then(setLiveKitReady);
    
//     return () => {
//       if (localStream) {
//         localStream.getTracks().forEach(track => track.stop());
//       }
//       if (liveKitRoom) {
//         liveKitRoom.disconnect();
//       }
//       if (socket) {
//         socket.disconnect();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (!isLive) {
//       startCameraPreview();
//     }
//   }, [isLive]);

//   useEffect(() => {
//     if (commentsEndRef.current) {
//       commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [comments]);

//   useEffect(() => {
//     if (isLive && streamData?.streamId) {
//       const newSocket = io(SOCKET_URL, {
//         auth: {
//           token: localStorage.getItem('token')
//         }
//       });
      
//       newSocket.on('connect', () => {
//         console.log('Socket connected');
//         newSocket.emit('join-stream', { 
//           streamId: streamData.streamId, 
//           isStreamer: true 
//         });
//         newSocket.emit('subscribe-to-stream-earnings', {
//           streamId: streamData.streamId
//         });
//       });

//       newSocket.on('new-order', (data) => {
//         console.log('New order received:', data);
//         setOrders(prev => {
//           const orderExists = prev.some(o => 
//             o._id === data.order._id || 
//             (o.productIndex === data.order.productIndex && 
//              o.buyer === data.order.buyer)
//           );
//           return orderExists ? prev : [...prev, {
//             ...data.order,
//             buyerUsername: data.buyerUsername || data.order.buyer?.username
//           }];
//         });

//         if (data.totalEarnings !== undefined) {
//           setCoinBalance(data.totalEarnings);
//         }
//       });

//       newSocket.on('coins-updated', (data) => {
//         console.log('Coins updated:', data);
//         if (data.streamId === streamData.streamId) {
//           setCoinBalance(data.coinBalance);
//           setError(`Earned ${data.earnedAmount} coins from a purchase!`);
//           setTimeout(() => setError(''), 3000);
//         }
//       });

//       setSocket(newSocket);
//       fetchInitialOrders();
//       setProducts(streamData.stream.products?.map((p, i) => ({ ...p, index: i })) || []);
//       setCoinBalance(streamData.stream.points || 0);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [isLive, streamData?.streamId]);

//   const fetchInitialOrders = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_URL}/live/${streamData.streamId}/orders`, {
//         headers: {
//           ...(token && { 'Authorization': `Bearer ${token}` })
//         }
//       });
//       const data = await response.json();
//       if (response.ok) {
//         const ordersWithBuyerInfo = data.orders.map(o => ({
//           ...o,
//           buyerUsername: o.buyer?.username || 'Unknown Buyer'
//         })) || [];
//         setOrders(ordersWithBuyerInfo);
//       }
//     } catch (err) {
//       console.error('Failed to fetch initial orders:', err);
//     }
//   };

//   const startCameraPreview = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//           facingMode: 'user',
//           frameRate: { ideal: 30 }
//         },
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true
//         }
//       });

//       setLocalStream(stream);
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//         localVideoRef.current.muted = true;
//         await localVideoRef.current.play();
//       }
//     } catch (err) {
//       console.error('Camera preview error:', err);
//       setError('Could not access camera/microphone. Please grant permissions.');
//     }
//   };

//   const startStream = async () => {
//     if (!title.trim()) {
//       setError('Please enter a title');
//       return;
//     }

//     if (!liveKitReady) {
//       setError('LiveKit not loaded. Install: npm install livekit-client');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       if (!localStream) {
//         await startCameraPreview();
//       }

//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_URL}/live/create`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token && { 'Authorization': `Bearer ${token}` })
//         },
//         body: JSON.stringify({
//           title: title.trim(),
//           description: description.trim(),
//           privacy: 'public'
//         })
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.msg || 'Failed to create stream');
//       }

//       setStreamData(data);
//       setShareLink(`${window.location.origin}/live/${data.streamId}`);

//       const room = new Room({
//         adaptiveStream: true,
//         dynacast: true,
//         videoCaptureDefaults: {
//           resolution: { width: 1280, height: 720, frameRate: 30 }
//         },
//         audioCaptureDefaults: {
//           echoCancellation: true,
//           noiseSuppression: true,
//         }
//       });

//       await room.connect(data.roomUrl, data.publishToken);

//       room.on(RoomEvent.DataReceived, (payload, participant) => {
//         const decoder = new TextDecoder();
//         const message = JSON.parse(decoder.decode(payload));
        
//         if (message.type === 'comment') {
//           setComments(prev => [...prev, {
//             id: Date.now() + Math.random(),
//             username: participant?.identity || 'Viewer',
//             text: message.text,
//             timestamp: new Date()
//           }]);
//         } else if (message.type === 'heart') {
//           const heartId = Date.now() + Math.random();
//           setHearts(prev => [...prev, { 
//             id: heartId, 
//             x: Math.random() * 80 + 10,
//             from: participant?.identity 
//           }]);
//           setTimeout(() => {
//             setHearts(prev => prev.filter(h => h.id !== heartId));
//           }, 3000);
//         }
//       });

//       room.on(RoomEvent.ParticipantConnected, () => {
//         setViewerCount(room.remoteParticipants.size);
//       });

//       room.on(RoomEvent.ParticipantDisconnected, () => {
//         setViewerCount(room.remoteParticipants.size);
//       });

//       await room.localParticipant.enableCameraAndMicrophone();

//       room.on(RoomEvent.LocalTrackPublished, (publication) => {
//         if (publication.source === Track.Source.Camera) {
//           const localVideoTrack = publication.track;
//           if (localVideoTrack && localVideoTrack.mediaStreamTrack) {
//             const mediaStream = new MediaStream([localVideoTrack.mediaStreamTrack]);
            
//             if (videoRef.current) {
//               videoRef.current.srcObject = mediaStream;
//               videoRef.current.muted = true;
//               videoRef.current.play()
//                 .then(() => {
//                   setTimeout(() => {
//                     if (localVideoRef.current) {
//                       localVideoRef.current.style.display = 'none';
//                     }
//                   }, 300);
//                 })
//                 .catch(err => console.error('Video play error:', err));
//             }
//           }
//         }
//       });

//       setTimeout(() => {
//         const camPublication = room.localParticipant.getTrackPublication(Track.Source.Camera);
//         if (camPublication && camPublication.track && videoRef.current) {
//           const mediaStream = new MediaStream([camPublication.track.mediaStreamTrack]);
//           videoRef.current.srcObject = mediaStream;
//           videoRef.current.muted = true;
//           videoRef.current.play()
//             .catch(err => console.error('Manual attach error:', err));
//         }
//       }, 1000);

//       setLiveKitRoom(room);
//       setViewerCount(room.remoteParticipants.size);
//       setIsLive(true);
      
//     } catch (err) {
//       console.error('Error starting stream:', err);
//       setError(err.message);
//       if (localStream) {
//         localStream.getTracks().forEach(track => track.stop());
//         setLocalStream(null);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const endStream = async () => {
//     if (!streamData?.streamId) return;

//     try {
//       const token = localStorage.getItem('token');
//       await fetch(`${API_URL}/live/${streamData.streamId}/end`, {
//         method: 'POST',
//         headers: {
//           ...(token && { 'Authorization': `Bearer ${token}` })
//         }
//       });

//       if (liveKitRoom) {
//         await liveKitRoom.disconnect();
//         setLiveKitRoom(null);
//       }

//       if (localStream) {
//         localStream.getTracks().forEach(track => track.stop());
//         setLocalStream(null);
//       }

//       if (localVideoRef.current) {
//         localVideoRef.current.style.display = 'block';
//       }

//       if (socket) {
//         socket.disconnect();
//       }

//       setIsLive(false);
//       setStreamData(null);
//       setTitle('');
//       setDescription('');
//       setComments([]);
//       setHearts([]);
//       setProducts([]);
//       setOrders([]);
//       setCoinBalance(0);
      
//       onBack();
//     } catch (err) {
//       console.error('Error ending stream:', err);
//     }
//   };

//   const toggleCamera = async () => {
//     if (liveKitRoom && isLive) {
//       const isEnabled = liveKitRoom.localParticipant.isCameraEnabled;
//       await liveKitRoom.localParticipant.setCameraEnabled(!isEnabled);
//       setIsCameraOn(!isEnabled);
//     } else if (localStream) {
//       const videoTrack = localStream.getVideoTracks()[0];
//       if (videoTrack) {
//         videoTrack.enabled = !videoTrack.enabled;
//         setIsCameraOn(videoTrack.enabled);
//       }
//     }
//   };

//   const toggleMic = async () => {
//     if (liveKitRoom && isLive) {
//       const isEnabled = liveKitRoom.localParticipant.isMicrophoneEnabled;
//       await liveKitRoom.localParticipant.setMicrophoneEnabled(!isEnabled);
//       setIsMicOn(!isEnabled);
//     } else if (localStream) {
//       const audioTrack = localStream.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setIsMicOn(audioTrack.enabled);
//       }
//     }
//   };

//   if (isLive) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-4">
//         <style>{`
//           @keyframes float-up {
//             0% { transform: translateY(0) scale(1); opacity: 1; }
//             100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
//           }
//         `}</style>

//         {error && (
//           <div className="fixed top-4 left-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-lg z-50">
//             {error}
//           </div>
//         )}

//         <div className="max-w-6xl mx-auto">
//           <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4 mb-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 px-3 py-1 rounded-full">
//                   <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
//                   <span className="text-sm font-semibold">LIVE</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-gray-300">
//                   <Users className="w-4 h-4" />
//                   <span className="text-sm">{viewerCount} viewers</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-yellow-400">
//                   <Coins className="w-4 h-4" />
//                   <span className="text-sm font-bold">{coinBalance} coins</span>
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => {
//                     navigator.clipboard.writeText(shareLink);
//                     setError('Share link copied!');
//                     setTimeout(() => setError(''), 2000);
//                   }}
//                   className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
//                 >
//                   <Share2 className="w-4 h-4" />
//                   Share
//                 </button>
//                 <button
//                   onClick={endStream}
//                   className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 px-4 py-2 rounded-lg flex items-center gap-2"
//                 >
//                   <X className="w-4 h-4" />
//                   End
//                 </button>
//               </div>
//             </div>
//             <h2 className="text-xl font-bold mt-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-cyan-400">{streamData?.stream?.title}</h2>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
//             <div className="lg:col-span-3">
//               <div className="bg-black rounded-lg aspect-video mb-4 relative overflow-hidden border border-white/10">
//                 <video
//                   ref={videoRef}
//                   autoPlay
//                   playsInline
//                   muted
//                   className="w-full h-full object-cover"
//                   style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}
//                 />
//                 <video
//                   ref={localVideoRef}
//                   autoPlay
//                   playsInline
//                   muted
//                   className="w-full h-full object-cover"
//                   style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
//                 />
//                 {!isCameraOn && (
//                   <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80" style={{ zIndex: 10 }}>
//                     <VideoOff className="w-16 h-16 text-gray-600" />
//                   </div>
//                 )}

//                 {hearts.map((heart) => (
//                   <div
//                     key={heart.id}
//                     className="absolute pointer-events-none text-3xl"
//                     style={{
//                       left: `${heart.x}%`,
//                       bottom: '0',
//                       animation: 'float-up 3s ease-out forwards',
//                       zIndex: 20
//                     }}
//                   >
//                     ❤️
//                   </div>
//                 ))}
//               </div>

//               <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4 mb-4 flex items-center justify-center gap-4">
//                 <button
//                   onClick={toggleCamera}
//                   className={`p-4 rounded-full transition-all ${isCameraOn ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/50 hover:to-blue-500/50' : 'bg-gradient-to-r from-pink-500/30 to-red-500/30 hover:from-pink-500/50 hover:to-red-500/50'}`}
//                 >
//                   {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
//                 </button>
//                 <button
//                   onClick={toggleMic}
//                   className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/50 hover:to-blue-500/50' : 'bg-gradient-to-r from-pink-500/30 to-red-500/30 hover:from-pink-500/50 hover:to-red-500/50'}`}
//                 >
//                   {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
//                 </button>
//               </div>

//               <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4 mb-4">
//                 <h3 className="font-semibold mb-4 flex items-center gap-2">
//                   <TrendingUp className="w-5 h-5 text-yellow-400" />
//                   Add Product/Ad
//                 </h3>
//                 <select 
//                   value={newProduct.type}
//                   onChange={(e) => setNewProduct({...newProduct, type: e.target.value})}
//                   className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:border-pink-500 text-white"
//                 >
//                   <option value="product">Product</option>
//                   <option value="ad">Ad</option>
//                 </select>
//                 <input
//                   placeholder="Name"
//                   value={newProduct.name}
//                   onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
//                   className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:border-pink-500 text-white placeholder-gray-400"
//                 />
//                 <input
//                   placeholder="Description"
//                   value={newProduct.description}
//                   onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
//                   className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:border-pink-500 text-white placeholder-gray-400"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Price"
//                   value={newProduct.price}
//                   onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
//                   className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:border-pink-500 text-white placeholder-gray-400"
//                 />
//                 <input
//                   placeholder="Image URL"
//                   value={newProduct.imageUrl}
//                   onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
//                   className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:border-pink-500 text-white placeholder-gray-400"
//                 />
//                 <button
//                   onClick={async () => {
//                     try {
//                       const token = localStorage.getItem('token');
//                       const response = await fetch(`${API_URL}/live/${streamData.streamId}/add-product`, {
//                         method: 'POST',
//                         headers: {
//                           'Content-Type': 'application/json',
//                           ...(token && { 'Authorization': `Bearer ${token}` })
//                         },
//                         body: JSON.stringify(newProduct)
//                       });
//                       const data = await response.json();
//                       if (response.ok) {
//                         setProducts([...products, { ...data.product, index: products.length }]);
//                         setNewProduct({type: 'product', name: '', description: '', price: 0, imageUrl: '', link: ''});
//                       } else {
//                         setError(data.msg);
//                       }
//                     } catch (err) {
//                       setError('Failed to add product');
//                     }
//                   }}
//                   className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 py-2 rounded-lg font-semibold mt-2 transition-all"
//                 >
//                   Add Item
//                 </button>
                
//                 <div className="mt-4">
//                   <h4 className="font-semibold mb-2 text-sm">Added Items ({products.length})</h4>
//                   {products.map((p, i) => (
//                     <div key={i} className="bg-white/5 rounded-lg p-2 mb-2 border border-white/10">
//                       <span className="text-sm">{p.name} - ${p.price}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4">
//                 <h3 className="font-semibold mb-2 flex items-center gap-2">
//                   <Coins className="w-5 h-5 text-yellow-400" />
//                   Orders ({orders.length})
//                 </h3>
//                 {orders.length === 0 ? (
//                   <p className="text-gray-400">No orders yet</p>
//                 ) : (
//                   orders.map((o, i) => (
//                     <div key={i} className="bg-white/5 rounded-lg p-2 mb-2 border border-white/10 text-sm">
//                       <span>{products[o.productIndex]?.name} - Qty: {o.quantity} by {o.buyerUsername}</span>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>

//             <div className="lg:col-span-1">
//               <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg h-[600px] flex flex-col">
//                 <div className="p-4 border-b border-white/10">
//                   <h3 className="font-semibold flex items-center gap-2">
//                     <MessageCircle className="w-5 h-5 text-cyan-400" />
//                     Live Chat
//                   </h3>
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
//                   {comments.map((c) => (
//                     <div key={c.id} className="text-sm">
//                       <span className="font-semibold text-cyan-400">@{c.username}: </span>
//                       <span className="text-gray-300">{c.text}</span>
//                     </div>
//                   ))}
//                   {comments.length === 0 && (
//                     <div className="text-center text-gray-500 mt-20">
//                       <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
//                       <p className="text-sm">Waiting for comments...</p>
//                     </div>
//                   )}
//                   <div ref={commentsEndRef} />
//                 </div>

//                 <div className="p-4 border-t border-white/10">
//                   <div className="flex items-center gap-2 text-gray-400 text-xs">
//                     <Heart className="w-4 h-4 text-pink-500" />
//                     <span>Viewers sending hearts & comments</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-4">
//       <button
//         onClick={onBack}
//         className="mb-4 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg border border-white/20 transition-all"
//       >
//         ← Back
//       </button>

//       <div className="max-w-md mx-auto mt-10">
//         <div className="bg-black/50 backdrop-blur border border-white/20 rounded-2xl p-8">
//           <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
//             <Radio className="w-8 h-8 text-pink-500" />
//             Go Live
//           </h1>
//           <p className="text-gray-400 mb-6">Start streaming and earn coins</p>

//           {error && (
//             <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-sm">
//               {error}
//             </div>
//           )}

//           {!liveKitReady && (
//             <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 p-3 rounded-lg mb-4 text-sm">
//               Installing LiveKit...
//             </div>
//           )}

//           <div className="relative bg-black rounded-xl aspect-video mb-6 overflow-hidden border border-white/20">
//             <video
//               ref={localVideoRef}
//               autoPlay
//               muted
//               playsInline
//               className="w-full h-full object-cover"
//             />
//             <div className="absolute top-4 right-4 flex space-x-2">
//               <button
//                 onClick={toggleCamera}
//                 className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all ${isCameraOn ? 'bg-gradient-to-r from-cyan-500/50 to-blue-500/50' : 'bg-gradient-to-r from-pink-500/50 to-red-500/50'}`}
//               >
//                 {isCameraOn ? <Camera className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
//               </button>
//               <button
//                 onClick={toggleMic}
//                 className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-gradient-to-r from-cyan-500/50 to-blue-500/50' : 'bg-gradient-to-r from-pink-500/50 to-red-500/50'}`}
//               >
//                 {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
//               </button>
//             </div>
//             {!localStream && (
//               <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
//                 <div className="text-center">
//                   <Camera className="w-12 h-12 mx-auto mb-3 text-gray-600" />
//                   <p className="text-gray-400 text-sm">Requesting camera access...</p>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">Stream Title *</label>
//               <input
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="What's your stream about?"
//                 className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
//                 maxLength={100}
//               />
//               <p className="text-gray-400 text-xs mt-1">{title.length}/100</p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Description (optional)</label>
//               <textarea
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 placeholder="Add more details..."
//                 className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
//                 rows={3}
//                 maxLength={500}
//               />
//             </div>

//             <button
//               onClick={startStream}
//               disabled={loading || !liveKitReady}
//               className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-bold transition-all transform hover:shadow-lg hover:shadow-pink-500/50"
//             >
//               {loading ? 'Starting...' : '🔴 Go LIVE'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HostLiveStream;


import React, { useState, useEffect, useRef } from 'react';
import { Camera, Radio, Users, X, Mic, MicOff, Video, VideoOff, MessageCircle, Heart, Coins, TrendingUp, Share2, ChevronDown } from 'lucide-react';
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

const API_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com/api';
const SOCKET_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com';

const HostLiveStream = ({ onBack }) => {
  const [isLive, setIsLive] = useState(false);
  const [streamData, setStreamData] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [liveKitRoom, setLiveKitRoom] = useState(null);
  const [liveKitReady, setLiveKitReady] = useState(false);
  const [comments, setComments] = useState([]);
  const [hearts, setHearts] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    type: 'product',
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    link: ''
  });
  const [orders, setOrders] = useState([]);
  const [coinBalance, setCoinBalance] = useState(0);
  const [socket, setSocket] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  const videoRef = useRef(null);
  const localVideoRef = useRef(null);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    loadLiveKit().then(setLiveKitReady);
    
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (liveKitRoom) {
        liveKitRoom.disconnect();
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!isLive) {
      startCameraPreview();
    }
  }, [isLive]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  useEffect(() => {
    if (isLive && streamData?.streamId) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token')
        }
      });
      
      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join-stream', { 
          streamId: streamData.streamId, 
          isStreamer: true 
        });
        newSocket.emit('subscribe-to-stream-earnings', {
          streamId: streamData.streamId
        });
      });

      newSocket.on('new-order', (data) => {
        console.log('New order received:', data);
        setOrders(prev => {
          const orderExists = prev.some(o => 
            o._id === data.order._id || 
            (o.productIndex === data.order.productIndex && 
             o.buyer === data.order.buyer)
          );
          return orderExists ? prev : [...prev, {
            ...data.order,
            buyerUsername: data.buyerUsername || data.order.buyer?.username,
            deliveryInfo: data.order.deliveryInfo
          }];
        });

        if (data.totalEarnings !== undefined) {
          setCoinBalance(data.totalEarnings);
        }

        setError(`New order from ${data.buyerUsername}!`);
        setTimeout(() => setError(''), 3000);
      });

      newSocket.on('coins-updated', (data) => {
        console.log('Coins updated:', data);
        if (data.streamId === streamData.streamId) {
          setCoinBalance(data.coinBalance);
          setError(`Earned ${data.earnedAmount} coins from a purchase!`);
          setTimeout(() => setError(''), 3000);
        }
      });

      setSocket(newSocket);
      fetchInitialOrders();
      setProducts(streamData.stream.products?.map((p, i) => ({ ...p, index: i })) || []);
      setCoinBalance(streamData.stream.points || 0);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isLive, streamData?.streamId]);

  const fetchInitialOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/live/${streamData.streamId}/orders`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      const data = await response.json();
      if (response.ok) {
        const ordersWithBuyerInfo = data.orders.map(o => ({
          ...o,
          buyerUsername: o.buyer?.username || 'Unknown Buyer',
          deliveryInfo: o.deliveryInfo
        })) || [];
        setOrders(ordersWithBuyerInfo);
      }
    } catch (err) {
      console.error('Failed to fetch initial orders:', err);
    }
  };

  const startCameraPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        await localVideoRef.current.play();
      }
    } catch (err) {
      console.error('Camera preview error:', err);
      setError('Could not access camera/microphone. Please grant permissions.');
    }
  };

  const startStream = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!liveKitReady) {
      setError('LiveKit not loaded. Install: npm install livekit-client');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!localStream) {
        await startCameraPreview();
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/live/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          privacy: 'public'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to create stream');
      }

      setStreamData(data);
      setShareLink(`${window.location.origin}/live/${data.streamId}`);

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: { width: 1280, height: 720, frameRate: 30 }
        },
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      await room.connect(data.roomUrl, data.publishToken);

      room.on(RoomEvent.DataReceived, (payload, participant) => {
        const decoder = new TextDecoder();
        const message = JSON.parse(decoder.decode(payload));
        
        if (message.type === 'comment') {
          setComments(prev => [...prev, {
            id: Date.now() + Math.random(),
            username: participant?.identity || 'Viewer',
            text: message.text,
            timestamp: new Date()
          }]);
        } else if (message.type === 'heart') {
          const heartId = Date.now() + Math.random();
          setHearts(prev => [...prev, { 
            id: heartId, 
            x: Math.random() * 80 + 10,
            from: participant?.identity 
          }]);
          setTimeout(() => {
            setHearts(prev => prev.filter(h => h.id !== heartId));
          }, 3000);
        }
      });

      room.on(RoomEvent.ParticipantConnected, () => {
        setViewerCount(room.remoteParticipants.size);
      });

      room.on(RoomEvent.ParticipantDisconnected, () => {
        setViewerCount(room.remoteParticipants.size);
      });

      await room.localParticipant.enableCameraAndMicrophone();

      room.on(RoomEvent.LocalTrackPublished, (publication) => {
        if (publication.source === Track.Source.Camera) {
          const localVideoTrack = publication.track;
          if (localVideoTrack && localVideoTrack.mediaStreamTrack) {
            const mediaStream = new MediaStream([localVideoTrack.mediaStreamTrack]);
            
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
              videoRef.current.muted = true;
              videoRef.current.play()
                .then(() => {
                  setTimeout(() => {
                    if (localVideoRef.current) {
                      localVideoRef.current.style.display = 'none';
                    }
                  }, 300);
                })
                .catch(err => console.error('Video play error:', err));
            }
          }
        }
      });

      setTimeout(() => {
        const camPublication = room.localParticipant.getTrackPublication(Track.Source.Camera);
        if (camPublication && camPublication.track && videoRef.current) {
          const mediaStream = new MediaStream([camPublication.track.mediaStreamTrack]);
          videoRef.current.srcObject = mediaStream;
          videoRef.current.muted = true;
          videoRef.current.play()
            .catch(err => console.error('Manual attach error:', err));
        }
      }, 1000);

      setLiveKitRoom(room);
      setViewerCount(room.remoteParticipants.size);
      setIsLive(true);
      
    } catch (err) {
      console.error('Error starting stream:', err);
      setError(err.message);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const endStream = async () => {
    if (!streamData?.streamId) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/live/${streamData.streamId}/end`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (liveKitRoom) {
        await liveKitRoom.disconnect();
        setLiveKitRoom(null);
      }

      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      if (localVideoRef.current) {
        localVideoRef.current.style.display = 'block';
      }

      if (socket) {
        socket.disconnect();
      }

      setIsLive(false);
      setStreamData(null);
      setTitle('');
      setDescription('');
      setComments([]);
      setHearts([]);
      setProducts([]);
      setOrders([]);
      setCoinBalance(0);
      
      onBack();
    } catch (err) {
      console.error('Error ending stream:', err);
    }
  };

  const toggleCamera = async () => {
    if (liveKitRoom && isLive) {
      const isEnabled = liveKitRoom.localParticipant.isCameraEnabled;
      await liveKitRoom.localParticipant.setCameraEnabled(!isEnabled);
      setIsCameraOn(!isEnabled);
    } else if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = async () => {
    if (liveKitRoom && isLive) {
      const isEnabled = liveKitRoom.localParticipant.isMicrophoneEnabled;
      await liveKitRoom.localParticipant.setMicrophoneEnabled(!isEnabled);
      setIsMicOn(!isEnabled);
    } else if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  if (isLive) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #0f172a, #1f2937, #000)',
        color: '#fff',
        padding: '1rem'
      }}>
        <style>{`
          @keyframes float-up {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
          }
        `}</style>

        {error && (
          <div style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            right: '1rem',
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            zIndex: 50
          }}>
            {error}
          </div>
        )}

        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(to right, #ec4899, #ef4444)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px'
                }}>
                  <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    background: '#fff',
                    borderRadius: '50%',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}></div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>LIVE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d1d5db' }}>
                  <Users style={{ width: '1rem', height: '1rem' }} />
                  <span style={{ fontSize: '0.875rem' }}>{viewerCount} viewers</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#facc15' }}>
                  <Coins style={{ width: '1rem', height: '1rem' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{coinBalance} coins</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    setError('Share link copied!');
                    setTimeout(() => setError(''), 2000);
                  }}
                  style={{
                    background: 'linear-gradient(to right, #06b6d4, #0284c7)',
                    color: '#fff',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <Share2 style={{ width: '1rem', height: '1rem' }} />
                  Share
                </button>
                <button
                  onClick={endStream}
                  style={{
                    background: 'linear-gradient(to right, #ec4899, #ef4444)',
                    color: '#fff',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <X style={{ width: '1rem', height: '1rem' }} />
                  End
                </button>
              </div>
            </div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginTop: '0.75rem',
              background: 'linear-gradient(to right, #ec4899, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {streamData?.stream?.title}
            </h2>
          </div>

          {/* Main Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {/* Main Content */}
            <div style={{
              gridColumn: 'span 2'
            }}>
              {/* Video */}
              <div style={{
                background: '#000',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '16 / 9'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 2
                  }}
                />
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1
                  }}
                />
                {!isCameraOn && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(17, 24, 39, 0.8)',
                    zIndex: 10
                  }}>
                    <VideoOff style={{ width: '4rem', height: '4rem', color: '#4b5563' }} />
                  </div>
                )}

                {hearts.map((heart) => (
                  <div
                    key={heart.id}
                    style={{
                      position: 'absolute',
                      left: `${heart.x}%`,
                      bottom: '0',
                      fontSize: '1.875rem',
                      pointerEvents: 'none',
                      animation: 'float-up 3s ease-out forwards',
                      zIndex: 20
                    }}
                  >
                    ❤️
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem'
              }}>
                <button
                  onClick={toggleCamera}
                  style={{
                    padding: '1rem',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    background: isCameraOn
                      ? 'linear-gradient(to right, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))'
                      : 'linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(239, 68, 68, 0.3))',
                    color: '#fff',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isCameraOn ? <Video style={{ width: '1.5rem', height: '1.5rem' }} /> : <VideoOff style={{ width: '1.5rem', height: '1.5rem' }} />}
                </button>
                <button
                  onClick={toggleMic}
                  style={{
                    padding: '1rem',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    background: isMicOn
                      ? 'linear-gradient(to right, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))'
                      : 'linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(239, 68, 68, 0.3))',
                    color: '#fff',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isMicOn ? <Mic style={{ width: '1.5rem', height: '1.5rem' }} /> : <MicOff style={{ width: '1.5rem', height: '1.5rem' }} />}
                </button>
              </div>

              {/* Orders Section */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}>
                <h3 style={{
                  fontWeight: '600',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Coins style={{ width: '1.25rem', height: '1.25rem', color: '#facc15' }} />
                  Orders ({orders.length})
                </h3>
                {orders.length === 0 ? (
                  <p style={{ color: '#9ca3af' }}>No orders yet</p>
                ) : (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {orders.map((o, i) => (
                      <div
                        key={i}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.5rem',
                          padding: '0.75rem',
                          marginBottom: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => setExpandedOrderId(expandedOrderId === i ? null : i)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                              {products[o.productIndex]?.name} × {o.quantity}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                              {o.buyerUsername}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#fbbf24' }}>
                              {o.quantity * (products[o.productIndex]?.price || 0) * 100} coins
                            </p>
                            <ChevronDown
                              style={{
                                width: '1rem',
                                height: '1rem',
                                transform: expandedOrderId === i ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                              }}
                            />
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedOrderId === i && o.deliveryInfo && (
                          <div style={{
                            marginTop: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '0.75rem',
                            color: '#d1d5db',
                            lineHeight: 1.6
                          }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                              <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Delivery To:</p>
                              <p>{o.deliveryInfo.firstName} {o.deliveryInfo.lastName}</p>
                              <p>{o.deliveryInfo.address}</p>
                              <p>{o.deliveryInfo.city}, {o.deliveryInfo.state} {o.deliveryInfo.zipCode}</p>
                              <p>{o.deliveryInfo.country}</p>
                            </div>
                            <div>
                              <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Contact:</p>
                              <p>Email: {o.deliveryInfo.email}</p>
                              <p>Phone: {o.deliveryInfo.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Sidebar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              minHeight: '600px'
            }}>
              <div style={{
                padding: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <MessageCircle style={{ width: '1.25rem', height: '1.25rem', color: '#06b6d4' }} />
                  Live Chat
                </h3>
              </div>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {comments.map((c) => (
                  <div key={c.id} style={{ fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: '600', color: '#06b6d4' }}>@{c.username}: </span>
                    <span style={{ color: '#d1d5db' }}>{c.text}</span>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    color: '#9ca3af',
                    marginTop: '5rem'
                  }}>
                    <MessageCircle style={{
                      width: '3rem',
                      height: '3rem',
                      margin: '0 auto 0.75rem',
                      color: '#4b5563'
                    }} />
                    <p style={{ fontSize: '0.875rem' }}>Waiting for comments...</p>
                  </div>
                )}
                <div ref={commentsEndRef} />
              </div>

              <div style={{
                padding: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#9ca3af',
                  fontSize: '0.75rem'
                }}>
                  <Heart style={{ width: '1rem', height: '1rem', color: '#ec4899' }} />
                  <span>Viewers sending hearts & comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-stream form
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #0f172a, #1f2937, #000)',
      color: '#fff',
      padding: '1rem'
    }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: '1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        ← Back
      </button>

      <div style={{
        maxWidth: '448px',
        margin: '2.5rem auto 0'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1rem',
          padding: '2rem'
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(to right, #ec4899, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            <Radio style={{ width: '2rem', height: '2rem', color: '#ec4899' }} />
            Go Live
          </h1>
          <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Start streaming and earn coins</p>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {!liveKitReady && (
            <div style={{
              background: 'rgba(234, 179, 8, 0.2)',
              border: '1px solid rgba(234, 179, 8, 0.5)',
              color: '#fef08a',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              Installing LiveKit...
            </div>
          )}

          {/* Camera Preview */}
          <div style={{
            position: 'relative',
            background: '#000',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            aspectRatio: '16 / 9'
          }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button
                onClick={toggleCamera}
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  background: isCameraOn
                    ? 'linear-gradient(to right, rgba(6, 182, 212, 0.5), rgba(59, 130, 246, 0.5))'
                    : 'linear-gradient(to right, rgba(236, 72, 153, 0.5), rgba(239, 68, 68, 0.5))',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {isCameraOn ? <Camera style={{ width: '1.25rem', height: '1.25rem' }} /> : <VideoOff style={{ width: '1.25rem', height: '1.25rem' }} />}
              </button>
              <button
                onClick={toggleMic}
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  background: isMicOn
                    ? 'linear-gradient(to right, rgba(6, 182, 212, 0.5), rgba(59, 130, 246, 0.5))'
                    : 'linear-gradient(to right, rgba(236, 72, 153, 0.5), rgba(239, 68, 68, 0.5))',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {isMicOn ? <Mic style={{ width: '1.25rem', height: '1.25rem' }} /> : <MicOff style={{ width: '1.25rem', height: '1.25rem' }} />}
              </button>
            </div>
            {!localStream && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(17, 24, 39, 0.8)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <Camera style={{
                    width: '3rem',
                    height: '3rem',
                    margin: '0 auto 0.75rem',
                    color: '#4b5563'
                  }} />
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Requesting camera access...</p>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Stream Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your stream about?"
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                color: '#fff',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              maxLength={100}
              onFocus={(e) => e.target.style.borderColor = 'rgba(236, 72, 153, 1)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            />
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>{title.length}/100</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                color: '#fff',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
                resize: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              rows={3}
              maxLength={500}
              onFocus={(e) => e.target.style.borderColor = 'rgba(236, 72, 153, 1)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={startStream}
            disabled={loading || !liveKitReady}
            style={{
              width: '100%',
              background: loading || !liveKitReady
                ? 'linear-gradient(to right, rgba(236, 72, 153, 0.5), rgba(168, 85, 247, 0.5), rgba(6, 182, 212, 0.5))'
                : 'linear-gradient(to right, #ec4899, #a855f7, #06b6d4)',
              color: '#fff',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              fontSize: '1rem',
              border: 'none',
              cursor: loading || !liveKitReady ? 'not-allowed' : 'pointer',
              opacity: loading || !liveKitReady ? 0.5 : 1,
              transition: 'all 0.2s ease',
              boxShadow: loading || !liveKitReady ? 'none' : '0 0 20px rgba(236, 72, 153, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!loading && liveKitReady) {
                e.target.style.boxShadow = '0 0 30px rgba(236, 72, 153, 0.5)';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && liveKitReady) {
                e.target.style.boxShadow = '0 0 20px rgba(236, 72, 153, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? 'Starting...' : '🔴 Go LIVE'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostLiveStream;
