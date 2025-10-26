// import React, { useState, useEffect, useRef } from 'react';
// import { Camera, Radio, Users, X, Mic, MicOff, Video, VideoOff, MessageCircle, Heart, ChevronDown, Share2, AlertTriangle } from 'lucide-react';
// import io from 'socket.io-client';

// let Room, RoomEvent, Track, DataPacket_Kind;

// const loadLiveKit = async () => {
//   try {
//     const livekit = await import('livekit-client');
//     Room = livekit.Room;
//     RoomEvent = livekit.RoomEvent;
//     Track = livekit.Track;
//     DataPacket_Kind = livekit.DataPacket_Kind;
//     return true;
//   } catch (err) {
//     console.error('LiveKit not installed. Run: npm install livekit-client');
//     return false;
//   }
// };

// // **MOBILE DETECTION HELPER**
// const isMobile = () => {
//   return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
//     window.innerWidth <= 768;
// };

// // **MOBILE-OPTIMIZED CAMERA CONSTRAINTS**
// const getCameraConstraints = () => {
//   const mobile = isMobile();

//   return {
//     video: {
//       // Mobile-specific settings
//       ...(mobile && {
//         width: { ideal: 640 },
//         height: { ideal: 480 },
//         aspectRatio: { ideal: 16 / 9 },
//         facingMode: 'user',
//       }),
//       // Desktop/Laptop settings
//       ...(!mobile && {
//         width: { ideal: 1280 },
//         height: { ideal: 720 },
//         facingMode: 'user',
//         frameRate: { ideal: 30 }
//       }),
//     },
//     audio: {
//       echoCancellation: true,
//       noiseSuppression: true,
//       autoGainControl: true
//     }
//   };
// };

// const API_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com/api';
// const SOCKET_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com';

// const OrderDetailsModal = ({ order, product, onClose }) => {
//   if (!order || !product) return null;

//   const deliveryInfo = order.deliveryInfo || {};

//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//       <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6 sticky top-0 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
//           <h3 className="text-xl font-semibold">Order Details</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-white"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>
//         <div className="p-6 space-y-6">
//           <div className="bg-gray-700 rounded-lg p-4">
//             <h4 className="font-semibold text-lg mb-2">Product Information</h4>
//             <div className="space-y-2">
//               <p><span className="text-gray-400">Product:</span> <span className="font-semibold">{product.name}</span></p>
//               <p><span className="text-gray-400">Description:</span> <span>{product.description}</span></p>
//               <p><span className="text-gray-400">Price:</span> <span className="font-bold text-yellow-400">${product.price}</span></p>
//               <p><span className="text-gray-400">Quantity:</span> <span className="font-semibold">{order.quantity}</span></p>
//             </div>
//           </div>
//           <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
//             <h4 className="font-semibold text-lg mb-3">Buyer Information</h4>
//             <div className="space-y-2">
//               <p><span className="text-gray-400">Name:</span> <span className="font-semibold">{order.buyer?.username || 'Unknown'}</span></p>
//               <p><span className="text-gray-400">Email:</span> <span>{order.buyer?.email || 'N/A'}</span></p>
//               <p><span className="text-gray-400">Status:</span> <span className={`font-semibold ${order.status === 'completed' ? 'text-green-400' : order.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>{order.status}</span></p>
//               <p><span className="text-gray-400">Order Date:</span> <span>{new Date(order.orderedAt).toLocaleString()}</span></p>
//             </div>
//           </div>
//           {deliveryInfo && Object.keys(deliveryInfo).length > 0 && (
//             <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
//               <h4 className="font-semibold text-lg mb-3">Delivery Address</h4>
//               <div className="space-y-2">
//                 <p><span className="text-gray-400">Name:</span> <span className="font-semibold">{deliveryInfo.firstName} {deliveryInfo.lastName}</span></p>
//                 <p><span className="text-gray-400">Address:</span> <span>{deliveryInfo.address}</span></p>
//                 <p><span className="text-gray-400">City:</span> <span>{deliveryInfo.city}</span></p>
//                 <p><span className="text-gray-400">State/Province:</span> <span>{deliveryInfo.state}</span></p>
//                 <p><span className="text-gray-400">ZIP/Postal Code:</span> <span className="font-semibold">{deliveryInfo.zipCode}</span></p>
//                 <p><span className="text-gray-400">Country:</span> <span>{deliveryInfo.country}</span></p>
//                 <p><span className="text-gray-400">Phone:</span> <span>{deliveryInfo.phone}</span></p>
//                 <p><span className="text-gray-400">Email:</span> <span>{deliveryInfo.email}</span></p>
//               </div>
//             </div>
//           )}
//           <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
//             <h4 className="font-semibold text-lg mb-3">Payment Information</h4>
//             <div className="space-y-2">
//               <p><span className="text-gray-400">Amount:</span> <span className="font-bold text-yellow-400">${product.price}</span></p>
//               <p><span className="text-gray-400">Coins Earned:</span> <span className="font-bold text-yellow-300">{Math.ceil(product.price * 100)} coins</span></p>
//               <p><span className="text-gray-400">Payment Method:</span> <span>Coins</span></p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded-lg font-semibold"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // === NEW: Confirm End Stream Modal ===
// const ConfirmEndModal = ({ onConfirm, onCancel }) => {
//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//       <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="w-10 h-10 bg-yellow-600/20 rounded-full flex items-center justify-center">
//             <AlertTriangle className="w-6 h-6 text-yellow-500" />
//           </div>
//           <h3 className="text-xl font-semibold">End Live Stream?</h3>
//         </div>
//         <p className="text-gray-300 mb-6">Are you sure you want to end the live stream? This action cannot be undone.</p>
//         <div className="flex gap-3">
//           <button
//             onClick={onCancel}
//             className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg font-semibold"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold"
//           >
//             End Stream
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

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
//     link: '',
//     imageFile: null,
//     imagePreview: ''
//   });
//   const [orders, setOrders] = useState([]);
//   const [coinBalance, setCoinBalance] = useState(0);
//   const [socket, setSocket] = useState(null);
//   const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
//   const [showConfirmEnd, setShowConfirmEnd] = useState(false); // NEW

//   const videoRef = useRef(null);
//   const localVideoRef = useRef(null);
//   const commentsEndRef = useRef(null);



//   // Persist stream state in localStorage
//   const saveStreamState = () => {
//     if (isLive && streamData) {
//       localStorage.setItem('liveStreamState', JSON.stringify({
//         isLive,
//         streamData,
//         title,
//         description,
//         viewerCount,
//         isCameraOn,
//         isMicOn,
//         comments,
//         hearts,
//         products,
//         orders,
//         coinBalance
//       }));
//     }
//   };

//   const clearStreamState = () => {
//     localStorage.removeItem('liveStreamState');
//   };

//   const restoreStreamState = () => {
//     const savedState = localStorage.getItem('liveStreamState');
//     if (savedState) {
//       const state = JSON.parse(savedState);
//       setIsLive(state.isLive);
//       setStreamData(state.streamData);
//       setTitle(state.title);
//       setDescription(state.description);
//       setViewerCount(state.viewerCount);
//       setIsCameraOn(state.isCameraOn);
//       setIsMicOn(state.isMicOn);
//       setComments(state.comments);
//       setHearts(state.hearts);
//       setProducts(state.products);
//       setOrders(state.orders);
//       setCoinBalance(state.coinBalance);
//       return true;
//     }
//     return false;
//   };

//   // **NEW: Handle share functionality**
//  const handleShare = async () => {
//   if (!streamData?.streamId) {
//     setError('No stream active to share');
//     return;
//   }

//   // ✅ UPDATED: Use /stream/ route so viewers open in viewer mode
//   const shareUrl = `${window.location.origin}/stream/${streamData.streamId}`;
//   const shareData = {
//     title: streamData.stream?.title || 'Live Stream',
//     text: streamData.stream?.description || 'Join my live stream!',
//     url: shareUrl,
//   };

//   try {
//     if (navigator.share && isMobile()) {
//       await navigator.share(shareData);
//     } else {
//       await navigator.clipboard.writeText(shareUrl);
//       setError('Stream link copied to clipboard!');
//       setTimeout(() => setError(''), 3000);
//     }
//   } catch (err) {
//     console.error('Share failed:', err);
//     setError('Failed to share stream link');
//   }
// };

//   // **NEW: Add viewport meta tag for mobile**
//   useEffect(() => {
//     const viewport = document.querySelector('meta[name="viewport"]');
//     if (viewport) {
//       viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
//     } else {
//       const meta = document.createElement('meta');
//       meta.name = 'viewport';
//       meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
//       document.head.appendChild(meta);
//     }
//   }, []);

//   // Handle beforeunload event
//   useEffect(() => {
//     const handleBeforeUnload = (event) => {
//       if (isLive) {
//         event.preventDefault();
//         event.returnValue = 'You are currently live! Refreshing will end the stream. Are you sure?';
//         return event.returnValue;
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
//   }, [isLive]);

//   useEffect(() => {
//     loadLiveKit().then(setLiveKitReady);

//     const isRestoring = restoreStreamState();
//     if (isRestoring && liveKitReady) {
//       reconnectToStream();
//     }

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

//   // Save stream state whenever relevant state changes
//   useEffect(() => {
//     saveStreamState();
//   }, [isLive, streamData, title, description, viewerCount, isCameraOn, isMicOn, comments, hearts, products, orders, coinBalance]);

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

//   // **UPDATED: Mobile-optimized camera preview**
//   const startCameraPreview = async () => {
//     try {
//       const constraints = getCameraConstraints();
//       console.log('📱 Using constraints:', constraints);

//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       setLocalStream(stream);

//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//         localVideoRef.current.muted = true;
//         localVideoRef.current.style.objectFit = 'cover';
//         localVideoRef.current.style.objectPosition = 'center';
//         await localVideoRef.current.play();

//         if (isMobile()) {
//           localVideoRef.current.style.width = '100%';
//           localVideoRef.current.style.height = '100%';
//         }
//       }
//     } catch (err) {
//       console.error('Camera preview error:', err);
//       setError('Could not access camera/microphone. Please grant permissions.');
//     }
//   };

//   const reconnectToStream = async () => {
//     if (!streamData?.streamId || !liveKitReady) return;

//     setLoading(true);
//     try {
//       const constraints = getCameraConstraints();
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       setLocalStream(stream);
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//         localVideoRef.current.muted = true;
//         localVideoRef.current.style.objectFit = 'cover';
//         await localVideoRef.current.play();
//       }

//       const room = new Room({
//         adaptiveStream: true,
//         dynacast: true,
//         videoCaptureDefaults: {
//           ...(isMobile() && {
//             resolution: { width: 640, height: 480 }
//           }),
//           ...(!isMobile() && {
//             resolution: { width: 1280, height: 720, frameRate: 30 }
//           })
//         },
//         audioCaptureDefaults: {
//           echoCancellation: true,
//           noiseSuppression: true,
//         }
//       });

//       await room.connect(streamData.roomUrl, streamData.publishToken);
//       console.log('✅ Reconnected to LiveKit room');

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
//       setLiveKitRoom(room);

//       const newSocket = io(SOCKET_URL, {
//         auth: {
//           token: localStorage.getItem('token')
//         }
//       });

//       newSocket.on('connect', () => {
//         console.log('Socket reconnected');
//         newSocket.emit('join-stream', {
//           streamId: streamData.streamId,
//           isStreamer: true
//         });
//         newSocket.emit('subscribe-to-stream-earnings', {
//           streamId: streamData.streamId
//         });
//       });

//       newSocket.on('new-comment', (data) => {
//         setComments(prev => [...prev, {
//           id: Date.now() + Math.random(),
//           username: data.username || 'Viewer',
//           text: data.text,
//           timestamp: new Date()
//         }]);
//       });

//       newSocket.on('heart-sent', (data) => {
//         const heartId = Date.now() + Math.random();
//         setHearts(prev => [...prev, {
//           id: heartId,
//           x: Math.random() * 80 + 10,
//           from: data.username
//         }]);
//         setTimeout(() => {
//           setHearts(prev => prev.filter(h => h.id !== heartId));
//         }, 3000);
//       });

//       newSocket.on('new-order', (data) => {
//         setOrders(prev => {
//           const orderExists = prev.some(o =>
//             o._id === data.order._id ||
//             (o.productIndex === data.order.productIndex &&
//               o.buyer === data.order.buyer)
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
//         if (data.streamId === streamData.streamId) {
//           setCoinBalance(data.coinBalance);
//           setError(`Earned ${data.earnedAmount} coins from a purchase!`);
//           setTimeout(() => setError(''), 3000);
//         }
//       });

//       newSocket.on('error', (error) => {
//         console.error('Socket error:', error);
//       });

//       setSocket(newSocket);
//       fetchInitialOrders();
//     } catch (err) {
//       console.error('Reconnection failed:', err);
//       setError('Failed to reconnect to the stream. Please try again.');
//       clearStreamState();
//       setIsLive(false);
//     } finally {
//       setLoading(false);
//     }
//   };

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

//       newSocket.on('new-comment', (data) => {
//         setComments(prev => [...prev, {
//           id: Date.now() + Math.random(),
//           username: data.username || 'Viewer',
//           text: data.text,
//           timestamp: new Date()
//         }]);
//       });

//       newSocket.on('heart-sent', (data) => {
//         const heartId = Date.now() + Math.random();
//         setHearts(prev => [...prev, {
//           id: heartId,
//           x: Math.random() * 80 + 10,
//           from: data.username
//         }]);
//         setTimeout(() => {
//           setHearts(prev => prev.filter(h => h.id !== heartId));
//         }, 3000);
//       });

//       newSocket.on('new-order', (data) => {
//         setOrders(prev => {
//           const orderExists = prev.some(o =>
//             o._id === data.order._id ||
//             (o.productIndex === data.order.productIndex &&
//               o.buyer === data.order.buyer)
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
//         if (data.streamId === streamData.streamId) {
//           setCoinBalance(data.coinBalance);
//           setError(`Earned ${data.earnedAmount} coins from a purchase!`);
//           setTimeout(() => setError(''), 3000);
//         }
//       });

//       newSocket.on('error', (error) => {
//         console.error('Socket error:', error);
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

//   // **UPDATED: Mobile-optimized stream start**
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

//       const room = new Room({
//         adaptiveStream: true,
//         dynacast: true,
//         videoCaptureDefaults: {
//           ...(isMobile() && {
//             resolution: { width: 640, height: 480 }
//           }),
//           ...(!isMobile() && {
//             resolution: { width: 1280, height: 720, frameRate: 30 }
//           })
//         },
//         audioCaptureDefaults: {
//           echoCancellation: true,
//           noiseSuppression: true,
//         }
//       });

//       await room.connect(data.roomUrl, data.publishToken);
//       console.log('✅ Connected to LiveKit room');

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
//       console.log('✅ Camera and microphone enabled');

//       room.on(RoomEvent.LocalTrackPublished, (publication) => {
//         if (publication.source === Track.Source.Camera) {
//           const localVideoTrack = publication.track;
//           if (localVideoTrack && localVideoTrack.mediaStreamTrack) {
//             const mediaStream = new MediaStream([localVideoTrack.mediaStreamTrack]);
//             if (videoRef.current) {
//               videoRef.current.srcObject = mediaStream;
//               videoRef.current.muted = true;
//               videoRef.current.style.objectFit = 'cover';
//               videoRef.current.style.objectPosition = 'center';
//               videoRef.current.play()
//                 .then(() => {
//                   console.log('✅ LiveKit video playing');
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
//           videoRef.current.style.objectFit = 'cover';
//           videoRef.current.style.objectPosition = 'center';
//           videoRef.current.play()
//             .then(() => {
//               if (localVideoRef.current) {
//                 localVideoRef.current.style.display = 'none';
//               }
//             })
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
//   // Handle browser back button
//   useEffect(() => {
//     // Only run when the stream is LIVE
//     if (!isLive) return;

//     // 1. Prevent the default “unsaved changes” warning
//     const handleBeforeUnload = (e) => {
//       e.preventDefault();
//       e.returnValue = ''; // Required for Chrome
//     };
//     window.addEventListener('beforeunload', handleBeforeUnload);

//     // 2. Catch the browser back button (popstate)
//     const onPopState = (e) => {
//       e.preventDefault();               // Block navigation
//       setShowConfirmEnd(true);          // Show YOUR modal

//       // Push the current URL again so the next back press works
//       window.history.pushState(null, '', window.location.href);
//     };
//     window.addEventListener('popstate', onPopState);

//     // 3. Push ONE dummy state so the first back press triggers popstate
//     window.history.pushState(null, '', window.location.href);

//     // Cleanup
//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       window.removeEventListener('popstate', onPopState);
//     };
//   }, [isLive]);

//   const endStream = async () => {
//     if (!streamData?.streamId) return;

//     const token = localStorage.getItem('token');
//     const streamId = streamData.streamId;

//     try {
//       // ---- 1. Tell backend to end the stream ----
//       const response = await fetch(`${API_URL}/live/${streamId}/end`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token && { Authorization: `Bearer ${token}` })
//         }
//       });

//       if (!response.ok) {
//         const err = await response.json();
//         throw new Error(err.msg || 'Failed to end stream');
//       }

//       // ---- 2. Clean up local media & LiveKit ----
//       if (liveKitRoom) {
//         await liveKitRoom.disconnect();
//         setLiveKitRoom(null);
//       }

//       if (localStream) {
//         localStream.getTracks().forEach(track => track.stop());
//         setLocalStream(null);
//       }

//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = null;
//         localVideoRef.current.style.display = 'none';
//       }

//       // ---- 3. Disconnect socket (optional – backend will kick) ----
//       if (socket) {
//         socket.emit('leave-stream', { streamId }); // optional grace
//         socket.disconnect();
//       }

//       // ---- 4. Reset UI state ----
//       clearStreamState();
//       setIsLive(false);
//       setStreamData(null);
//       setTitle('');
//       setDescription('');
//       setComments([]);
//       setHearts([]);
//       setProducts([]);
//       setOrders([]);
//       setCoinBalance(0);

//       // ---- 5. Navigate back ----
//       onBack();

//     } catch (err) {
//       console.error('Error ending stream:', err);
//       setError(err.message || 'Could not end stream');
//     }
//   };

//   const handleBack = () => {
//     if (isLive) {
//       setShowConfirmEnd(true);
//     } else {
//       onBack();
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

//   // **LIVE STREAM UI (with mobile fixes and share button)**
//   if (isLive) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-white p-4">
//         <style>{`
//           @keyframes float-up {
//             0% { transform: translateY(0) scale(1); opacity: 1; }
//             100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
//           }
//         `}</style>

//         <div className="max-w-7xl mx-auto">
//           <div className="bg-gray-800 rounded-lg p-4 mb-4">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 w-full">
//               {/* Left Section */}
//               <div className="flex flex-wrap items-center gap-3">
//                 {/* Live Indicator */}
//                 <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
//                   <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
//                   <span className="text-sm font-semibold text-white">LIVE</span>
//                 </div>

//                 {/* Viewer Count */}
//                 <div className="flex items-center gap-2 text-gray-300">
//                   <Users className="w-4 h-4" />
//                   <span className="text-sm">{viewerCount} viewers</span>
//                 </div>
//               </div>

//               {/* Right Section (Buttons) */}
//               <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
//                 <button
//                   onClick={handleShare}
//                   className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-white text-sm"
//                 >
//                   <Share2 className="w-4 h-4" />
//                   Share
//                 </button>

//                 <button
//                   onClick={() => setShowConfirmEnd(true)}
//                   className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-white text-sm"
//                 >
//                   <X className="w-4 h-4" />
//                   End Stream
//                 </button>
//               </div>
//             </div>

//             <h2 className="text-xl font-bold mt-3">{streamData?.stream?.title}</h2>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
//             <div className="lg:col-span-3">
//               <div
//                 className="bg-black rounded-lg mb-4 relative overflow-hidden"
//                 style={{
//                   aspectRatio: '16/9',
//                   width: '100%'
//                 }}
//               >
//                 <video
//                   ref={videoRef}
//                   autoPlay
//                   playsInline
//                   muted
//                   className="w-full h-full"
//                   style={{
//                     objectFit: 'cover',
//                     objectPosition: 'center',
//                     width: '100%',
//                     height: '100%'
//                   }}
//                 />
//                 <video
//                   ref={localVideoRef}
//                   autoPlay
//                   playsInline
//                   muted
//                   className="w-full h-full"
//                   style={{
//                     objectFit: 'cover',
//                     objectPosition: 'center',
//                     width: '100%',
//                     height: '100%'
//                   }}
//                 />
//                 {!isCameraOn && (
//                   <div className="absolute inset-0 flex items-center justify-center bg-gray-900" style={{ zIndex: 10 }}>
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

//               <div className="bg-gray-800 rounded-lg p-4 mb-4 flex items-center justify-center gap-4">
//                 <button
//                   onClick={toggleCamera}
//                   className={`p-4 rounded-full transition-colors ${isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
//                 >
//                   {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
//                 </button>
//                 <button
//                   onClick={toggleMic}
//                   className={`p-4 rounded-full transition-colors ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
//                 >
//                   {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
//                 </button>
//               </div>

//               <div className="bg-gray-800 rounded-lg p-4">
//                 <h3 className="font-semibold mb-4">Add Product/Ad</h3>

//                 <select
//                   value={newProduct.type}
//                   onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2"
//                 >
//                   <option value="product">Product</option>
//                   <option value="ad">Ad</option>
//                 </select>

//                 <input
//                   placeholder="Name"
//                   value={newProduct.name}
//                   onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2"
//                 />

//                 <input
//                   placeholder="Description"
//                   value={newProduct.description}
//                   onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2"
//                 />

//                 <input
//                   type="number"
//                   placeholder="Price"
//                   value={newProduct.price}
//                   onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2"
//                 />

//                 {/* ✅ IMAGE FILE UPLOAD + PREVIEW */}
//                 <div className="mb-2">
//                   <label className="block text-sm font-medium mb-1">Image</label>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (!file) return;

//                       setNewProduct({ ...newProduct, imageFile: file });
//                       const reader = new FileReader();
//                       reader.onloadend = () => {
//                         setNewProduct((prev) => ({ ...prev, imagePreview: reader.result }));
//                       };
//                       reader.readAsDataURL(file);
//                     }}
//                     className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
//                   />

//                   {newProduct.imagePreview && (
//                     <img
//                       src={newProduct.imagePreview}
//                       alt="Preview"
//                       className="mt-2 w-full h-48 object-cover rounded-lg border border-gray-600"
//                     />
//                   )}
//                 </div>

//                 <input
//                   placeholder="Link (optional for product/ad)"
//                   value={newProduct.link}
//                   onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2"
//                 />

//                 <button
//                   onClick={async () => {
//                     if (!newProduct.name || !newProduct.price || !newProduct.imageFile) {
//                       setError("Name, price and image are required");
//                       return;
//                     }

//                     const formData = new FormData();
//                     formData.append("type", newProduct.type);
//                     formData.append("name", newProduct.name);
//                     formData.append("description", newProduct.description);
//                     formData.append("price", newProduct.price.toString());
//                     formData.append("file", newProduct.imageFile); // ✅ FILE KEY NAME FIXED

//                     if (newProduct.link) formData.append("link", newProduct.link);

//                     try {
//                       const token = localStorage.getItem("token");
//                       const response = await fetch(`${API_URL}/live/${streamData.streamId}/add-product`, {
//                         method: "POST",
//                         headers: { ...(token && { Authorization: `Bearer ${token}` }) },
//                         body: formData,
//                       });

//                       const data = await response.json();

//                       if (response.ok) {
//                         // ✅ Always use signed URL returned from server
//                         setProducts([...products, data.product]);
//                         setNewProduct({
//                           type: "product",
//                           name: "",
//                           description: "",
//                           price: 0,
//                           imageFile: null,
//                           imagePreview: "",
//                           link: "",
//                         });
//                         setError("");
//                       } else {
//                         setError(data.msg || "Failed to add product");
//                       }
//                     } catch {
//                       setError("Failed to add product");
//                     }
//                   }}
//                   className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold mt-2"
//                 >
//                   Add
//                 </button>

//                 <div className="mt-4">
//                   <h4 className="font-semibold mb-2">Added Items</h4>

//                   {products.length === 0 ? (
//                     <p className="text-gray-400 text-sm">No items added yet</p>
//                   ) : (
//                     products.map((p, i) => (
//                       <div key={i} className="bg-gray-700 rounded-lg p-2 mb-2 flex items-center gap-3">
//                         {p.imageUrl && (
//                           <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded" />
//                         )}
//                         <div className="flex-1">
//                           <p className="font-medium">{p.name}</p>
//                           <p className="text-sm text-gray-400">${p.price}</p>
//                           {p.link && (
//                             <a
//                               href={p.link}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-xs text-blue-400 underline"
//                             >
//                               View Link
//                             </a>
//                           )}
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>

//             </div>

//             <div className="lg:col-span-2 space-y-4">
//               <div className="bg-gray-800 rounded-lg p-4 max-h-[400px] overflow-y-auto">
//                 <h3 className="font-semibold mb-3 flex items-center gap-2">
//                   📦 Orders ({orders.length})
//                 </h3>
//                 {orders.length === 0 ? (
//                   <p className="text-gray-400 text-sm">No orders yet</p>
//                 ) : (
//                   <div className="space-y-2">
//                     {orders.map((order, i) => (
//                       <div key={i} className="bg-gray-700 rounded-lg p-3">
//                         <button
//                           onClick={() => {
//                             const product = products[order.productIndex];
//                             setSelectedOrderDetails({
//                               order,
//                               product
//                             });
//                           }}
//                           className="w-full text-left hover:bg-gray-600 p-2 rounded transition-colors"
//                         >
//                           <div className="flex items-center justify-between">
//                             <div className="flex-1">
//                               <p className="font-semibold text-sm">{products[order.productIndex]?.name}</p>
//                               <p className="text-xs text-gray-400">By: {order.buyer?.username || order.buyerUsername}</p>
//                               <p className="text-xs text-yellow-300 mt-1">+{Math.ceil((products[order.productIndex]?.price || 0) * 100)} coins</p>
//                             </div>
//                             <ChevronDown className="w-4 h-4 text-gray-400" />
//                           </div>
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div className="bg-gray-800 rounded-lg h-[400px] flex flex-col">
//                 <div className="p-4 border-b border-gray-700">
//                   <h3 className="font-semibold flex items-center gap-2">
//                     <MessageCircle className="w-5 h-5" />
//                     Live Chat
//                   </h3>
//                 </div>
//                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
//                   {comments.map((c) => (
//                     <div key={c.id} className="text-sm">
//                       <span className="font-semibold text-blue-400">@{c.username}: </span>
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
//                 <div className="p-4 border-t border-gray-700">
//                   <div className="flex items-center gap-2 text-gray-400 text-xs">
//                     <Heart className="w-4 h-4 text-pink-500" />
//                     <span>Viewers can send hearts and comments</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {selectedOrderDetails && (
//           <OrderDetailsModal
//             order={selectedOrderDetails.order}
//             product={selectedOrderDetails.product}
//             onClose={() => setSelectedOrderDetails(null)}
//           />
//         )}

//         {/* NEW: Confirm Modal */}
//         {showConfirmEnd && (
//           <ConfirmEndModal
//             onConfirm={() => {
//               setShowConfirmEnd(false);
//               endStream();
//             }}
//             onCancel={() => setShowConfirmEnd(false)}
//           />
//         )}

//         {error && (
//           <div className="fixed top-4 left-4 right-4 bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm z-50">
//             {error}
//           </div>
//         )}
//       </div>
//     );
//   }

//   // **PREVIEW UI (with mobile fixes)**
//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-4">
//       <button
//         onClick={handleBack}
//         className="mb-4 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg"
//       >
//         ← Back to Streams
//       </button>

//       <div className="max-w-md mx-auto mt-10">
//         <div className="bg-gray-800 rounded-lg p-6">
//           <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
//             <Radio className="w-6 h-6 text-red-500" />
//             Start Live Stream
//           </h1>

//           {error && (
//             <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
//               {error}
//             </div>
//           )}

//           {!liveKitReady && (
//             <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-500 p-3 rounded mb-4 text-sm">
//               ⚠️ LiveKit not loaded. Run: <code className="bg-black/30 px-1 rounded">npm install livekit-client</code>
//             </div>
//           )}

//           <div
//             className="relative bg-black rounded-lg mb-6 overflow-hidden"
//             style={{
//               aspectRatio: '16/9',
//               width: '100%',
//               maxWidth: '100vw'
//             }}
//           >
//             <video
//               ref={localVideoRef}
//               autoPlay
//               muted
//               playsInline
//               className="w-full h-full"
//               style={{
//                 objectFit: 'cover',
//                 objectPosition: 'center',
//                 width: '100%',
//                 height: '100%'
//               }}
//             />

//             {isMobile() && (
//               <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs z-10">
//                 📱 Rotate to landscape for best view
//               </div>
//             )}

//             <div className="absolute top-4 right-4 flex space-x-2 z-10">
//               <button
//                 onClick={toggleCamera}
//                 className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${isCameraOn ? 'bg-black/50 hover:bg-black/70' : 'bg-red-500 hover:bg-red-600'
//                   }`}
//               >
//                 {isCameraOn ? <Camera className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
//               </button>
//               <button
//                 onClick={toggleMic}
//                 className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${isMicOn ? 'bg-black/50 hover:bg-black/70' : 'bg-red-500 hover:bg-red-600'
//                   }`}
//               >
//                 {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
//               </button>
//             </div>

//             {!localStream && (
//               <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-5">
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
//                 className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
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
//                 className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 resize-none"
//                 rows={3}
//                 maxLength={500}
//               />
//             </div>

//             <button
//               onClick={startStream}
//               disabled={loading || !liveKitReady}
//               className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-colors"
//             >
//               {loading ? 'Starting...' : '🔴 Go LIVE'}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* NEW: Confirm Modal for preview back (but only if live – shouldn't happen) */}
//       {showConfirmEnd && (
//         <ConfirmEndModal
//           onConfirm={() => {
//             setShowConfirmEnd(false);
//             endStream();
//           }}
//           onCancel={() => setShowConfirmEnd(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default HostLiveStream;


import React, { useState, useEffect, useRef } from 'react';
import { Camera, Radio, Users, X, Mic, MicOff, Video, VideoOff, MessageCircle, Heart, ChevronDown, Share2, AlertTriangle } from 'lucide-react';
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
    console.error('LiveKit not installed. Run: npm install livekit-client');
    return false;
  }
};

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768;
};

const getCameraConstraints = () => {
  const mobile = isMobile();

  return {
    video: {
      ...(mobile && {
        width: { ideal: 640 },
        height: { ideal: 480 },
        aspectRatio: { ideal: 16 / 9 },
        facingMode: 'user',
      }),
      ...(!mobile && {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
        frameRate: { ideal: 30 }
      }),
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  };
};

const API_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com/api';
const SOCKET_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com';

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
    link: '',
    imageFile: null,
    imagePreview: ''
  });
  const [orders, setOrders] = useState([]);
  const [coinBalance, setCoinBalance] = useState(0);
  const [socket, setSocket] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  const videoRef = useRef(null);
  const localVideoRef = useRef(null);
  const commentsEndRef = useRef(null);

  const saveStreamState = () => {
    if (isLive && streamData) {
      localStorage.setItem('liveStreamState', JSON.stringify({
        isLive,
        streamData,
        title,
        description,
        viewerCount,
        isCameraOn,
        isMicOn,
        comments,
        hearts,
        products,
        orders,
        coinBalance
      }));
    }
  };

  const clearStreamState = () => {
    localStorage.removeItem('liveStreamState');
  };

  const restoreStreamState = () => {
    const savedState = localStorage.getItem('liveStreamState');
    if (savedState) {
      const state = JSON.parse(savedState);
      setIsLive(state.isLive);
      setStreamData(state.streamData);
      setTitle(state.title);
      setDescription(state.description);
      setViewerCount(state.viewerCount);
      setIsCameraOn(state.isCameraOn);
      setIsMicOn(state.isMicOn);
      setComments(state.comments);
      setHearts(state.hearts);
      setProducts(state.products);
      setOrders(state.orders);
      setCoinBalance(state.coinBalance);
      return true;
    }
    return false;
  };

  const handleShare = async () => {
    if (!streamData?.streamId) {
      setError('No stream active to share');
      return;
    }

    const shareUrl = `${window.location.origin}/stream/${streamData.streamId}`;
    const shareData = {
      title: streamData.stream?.title || 'Live Stream',
      text: streamData.stream?.description || 'Join my live stream!',
      url: shareUrl,
    };

    try {
      if (navigator.share && isMobile()) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setError('Stream link copied to clipboard!');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Share failed:', err);
      setError('Failed to share stream link');
    }
  };

  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isLive) {
        event.preventDefault();
        event.returnValue = 'You are currently live! Refreshing will end the stream. Are you sure?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLive]);

  useEffect(() => {
    loadLiveKit().then(setLiveKitReady);

    const isRestoring = restoreStreamState();
    if (isRestoring && liveKitReady) {
      reconnectToStream();
    }

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
    saveStreamState();
  }, [isLive, streamData, title, description, viewerCount, isCameraOn, isMicOn, comments, hearts, products, orders, coinBalance]);

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

  const startCameraPreview = async () => {
    try {
      const constraints = getCameraConstraints();
      console.log('📱 Using constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.style.objectFit = 'cover';
        localVideoRef.current.style.objectPosition = 'center';
        await localVideoRef.current.play();

        if (isMobile()) {
          localVideoRef.current.style.width = '100%';
          localVideoRef.current.style.height = '100%';
        }
      }
    } catch (err) {
      console.error('Camera preview error:', err);
      setError('Could not access camera/microphone. Please grant permissions.');
    }
  };

  const reconnectToStream = async () => {
    if (!streamData?.streamId || !liveKitReady) return;

    setLoading(true);
    try {
      const constraints = getCameraConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.style.objectFit = 'cover';
        await localVideoRef.current.play();
      }

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          ...(isMobile() && {
            resolution: { width: 640, height: 480 }
          }),
          ...(!isMobile() && {
            resolution: { width: 1280, height: 720, frameRate: 30 }
          })
        },
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      await room.connect(streamData.roomUrl, streamData.publishToken);
      console.log('✅ Reconnected to LiveKit room');

      room.on(RoomEvent.ParticipantConnected, () => {
        // Only count actual viewers, not the host
        setViewerCount(room.remoteParticipants.size);
      });

      room.on(RoomEvent.ParticipantDisconnected, () => {
        setViewerCount(room.remoteParticipants.size);
      });

      await room.localParticipant.enableCameraAndMicrophone();
      setLiveKitRoom(room);

      const newSocket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket reconnected');
        newSocket.emit('join-stream', {
          streamId: streamData.streamId,
          isStreamer: true
        });
        newSocket.emit('subscribe-to-stream-earnings', {
          streamId: streamData.streamId
        });
      });

      setupSocketListeners(newSocket);
      setSocket(newSocket);
      fetchInitialOrders();
    } catch (err) {
      console.error('Reconnection failed:', err);
      setError('Failed to reconnect to the stream. Please try again.');
      clearStreamState();
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = (socket) => {
    socket.on('new-comment', (data) => {
      setComments(prev => [...prev, {
        id: Date.now() + Math.random(),
        username: data.username || 'Viewer',
        text: data.text,
        timestamp: new Date()
      }]);
    });

    socket.on('heart-sent', (data) => {
      const heartId = Date.now() + Math.random();
      setHearts(prev => [...prev, {
        id: heartId,
        x: Math.random() * 80 + 10,
        from: data.username
      }]);
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== heartId));
      }, 3000);
    });

    socket.on('new-order', (data) => {
      setOrders(prev => {
        const orderExists = prev.some(o =>
          o._id === data.order._id ||
          (o.productIndex === data.order.productIndex &&
            o.buyer === data.order.buyer)
        );
        return orderExists ? prev : [...prev, {
          ...data.order,
          buyerUsername: data.buyerUsername || data.order.buyer?.username
        }];
      });
      if (data.totalEarnings !== undefined) {
        setCoinBalance(data.totalEarnings);
      }
    });

    socket.on('coins-updated', (data) => {
      if (data.streamId === streamData.streamId) {
        setCoinBalance(data.coinBalance);
        setError(`Earned ${data.earnedAmount} coins from a purchase!`);
        setTimeout(() => setError(''), 3000);
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  };

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

      setupSocketListeners(newSocket);
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
          buyerUsername: o.buyer?.username || 'Unknown Buyer'
        })) || [];
        setOrders(ordersWithBuyerInfo);
      }
    } catch (err) {
      console.error('Failed to fetch initial orders:', err);
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

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          ...(isMobile() && {
            resolution: { width: 640, height: 480 }
          }),
          ...(!isMobile() && {
            resolution: { width: 1280, height: 720, frameRate: 30 }
          })
        },
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      await room.connect(data.roomUrl, data.publishToken);
      console.log('✅ Connected to LiveKit room as host');

      room.on(RoomEvent.ParticipantConnected, () => {
        setViewerCount(room.remoteParticipants.size);
      });

      room.on(RoomEvent.ParticipantDisconnected, () => {
        setViewerCount(room.remoteParticipants.size);
      });

      await room.localParticipant.enableCameraAndMicrophone();
      console.log('✅ Camera and microphone enabled');

      room.on(RoomEvent.LocalTrackPublished, (publication) => {
        if (publication.source === Track.Source.Camera) {
          const localVideoTrack = publication.track;
          if (localVideoTrack && localVideoTrack.mediaStreamTrack) {
            const mediaStream = new MediaStream([localVideoTrack.mediaStreamTrack]);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
              videoRef.current.muted = true;
              videoRef.current.style.objectFit = 'cover';
              videoRef.current.style.objectPosition = 'center';
              videoRef.current.play()
                .then(() => {
                  console.log('✅ LiveKit video playing');
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
          videoRef.current.style.objectFit = 'cover';
          videoRef.current.style.objectPosition = 'center';
          videoRef.current.play()
            .then(() => {
              if (localVideoRef.current) {
                localVideoRef.current.style.display = 'none';
              }
            })
            .catch(err => console.error('Manual attach error:', err));
        }
      }, 1000);

      setLiveKitRoom(room);
      setViewerCount(0);
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

  useEffect(() => {
    if (!isLive) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const onPopState = (e) => {
      e.preventDefault();
      setShowConfirmEnd(true);
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', onPopState);

    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', onPopState);
    };
  }, [isLive]);

  const endStream = async () => {
    if (!streamData?.streamId) return;

    const token = localStorage.getItem('token');
    const streamId = streamData.streamId;

    try {
      const response = await fetch(`${API_URL}/live/${streamId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || 'Failed to end stream');
      }

      if (liveKitRoom) {
        await liveKitRoom.disconnect();
        setLiveKitRoom(null);
      }

      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
        localVideoRef.current.style.display = 'none';
      }

      if (socket) {
        socket.emit('leave-stream', { streamId });
        socket.disconnect();
      }

      clearStreamState();
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
      setError(err.message || 'Could not end stream');
    }
  };

  const handleBack = () => {
    if (isLive) {
      setShowConfirmEnd(true);
    } else {
      onBack();
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
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <style>{`
          @keyframes float-up {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
          }
        `}</style>

        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 w-full">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-white">LIVE</span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{viewerCount} viewers</span>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleShare}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-white text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>

                <button
                  onClick={() => setShowConfirmEnd(true)}
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-white text-sm"
                >
                  <X className="w-4 h-4" />
                  End Stream
                </button>
              </div>
            </div>

            <h2 className="text-xl font-bold mt-3">{streamData?.stream?.title}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <div
                className="bg-black rounded-lg mb-4 relative overflow-hidden"
                style={{
                  aspectRatio: '16/9',
                  width: '100%'
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                />
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                />
                {!isCameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900" style={{ zIndex: 10 }}>
                    <VideoOff className="w-16 h-16 text-gray-600" />
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
                      zIndex: 20
                    }}
                  >
                    ❤️
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 rounded-lg p-4 mb-4 flex items-center justify-center gap-4">
                <button
                  onClick={toggleCamera}
                  className={`p-4 rounded-full transition-colors ${isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
                <button
                  onClick={toggleMic}
                  className={`p-4 rounded-full transition-colors ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Add Product/Ad</h3>

                <select
                  value={newProduct.type}
                  onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2"
                >
                  <option value="product">Product</option>
                  <option value="ad">Ad</option>
                </select>

                <input
                  placeholder="Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2"
                />

                <input
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2"
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2"
                />

                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setNewProduct({ ...newProduct, imageFile: file });
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewProduct((prev) => ({ ...prev, imagePreview: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />

                  {newProduct.imagePreview && (
                    <img
                      src={newProduct.imagePreview}
                      alt="Preview"
                      className="mt-2 w-full h-48 object-cover rounded-lg border border-gray-600"
                    />
                  )}
                </div>

                <input
                  placeholder="Link (optional for product/ad)"
                  value={newProduct.link}
                  onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2"
                />

                <button
                  onClick={async () => {
                    if (!newProduct.name || !newProduct.price || !newProduct.imageFile) {
                      setError("Name, price and image are required");
                      return;
                    }

                    const formData = new FormData();
                    formData.append("type", newProduct.type);
                    formData.append("name", newProduct.name);
                    formData.append("description", newProduct.description);
                    formData.append("price", newProduct.price.toString());
                    formData.append("file", newProduct.imageFile);

                    if (newProduct.link) formData.append("link", newProduct.link);

                    try {
                      const token = localStorage.getItem("token");
                      const response = await fetch(`${API_URL}/live/${streamData.streamId}/add-product`, {
                        method: "POST",
                        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
                        body: formData,
                      });

                      const data = await response.json();

                      if (response.ok) {
                        setProducts([...products, data.product]);
                        setNewProduct({
                          type: "product",
                          name: "",
                          description: "",
                          price: 0,
                          imageFile: null,
                          imagePreview: "",
                          link: "",
                        });
                        setError("");
                      } else {
                        setError(data.msg || "Failed to add product");
                      }
                    } catch {
                      setError("Failed to add product");
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold mt-2"
                >
                  Add
                </button>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Added Items</h4>

                  {products.length === 0 ? (
                    <p className="text-gray-400 text-sm">No items added yet</p>
                  ) : (
                    products.map((p, i) => (
                      <div key={i} className="bg-gray-700 rounded-lg p-2 mb-2 flex items-center gap-3">
                        {p.imageUrl && (
                          <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-gray-400">${p.price}</p>
                          {p.link && (
                            <a
                              href={p.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 underline"
                            >
                              View Link
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  📦 Orders ({orders.length})
                </h3>
                {orders.length === 0 ? (
                  <p className="text-gray-400 text-sm">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {orders.map((order, i) => (
                      <div key={i} className="bg-gray-700 rounded-lg p-3">
                        <button
                          onClick={() => {
                            const product = products[order.productIndex];
                            setSelectedOrderDetails({
                              order,
                              product
                            });
                          }}
                          className="w-full text-left hover:bg-gray-600 p-2 rounded transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{products[order.productIndex]?.name}</p>
                              <p className="text-xs text-gray-400">By: {order.buyer?.username || order.buyerUsername}</p>
                              <p className="text-xs text-yellow-300 mt-1">+{Math.ceil((products[order.productIndex]?.price || 0) * 100)} coins</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-800 rounded-lg h-[400px] flex flex-col">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Live Chat
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="text-sm">
                      <span className="font-semibold text-blue-400">@{c.username}: </span>
                      <span className="text-gray-300">{c.text}</span>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center text-gray-500 mt-20">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-sm">Waiting for comments...</p>
                    </div>
                  )}
                  <div ref={commentsEndRef} />
                </div>
                <div className="p-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span>Viewers can send hearts and comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedOrderDetails && (
          <OrderDetailsModal
            order={selectedOrderDetails.order}
            product={selectedOrderDetails.product}
            onClose={() => setSelectedOrderDetails(null)}
          />
        )}

        {showConfirmEnd && (
          <ConfirmEndModal
            onConfirm={() => {
              setShowConfirmEnd(false);
              endStream();
            }}
            onCancel={() => setShowConfirmEnd(false)}
          />
        )}

        {error && (
          <div className="fixed top-4 left-4 right-4 bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm z-50">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <button
        onClick={handleBack}
        className="mb-4 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg"
      >
        ← Back to Streams
      </button>

      <div className="max-w-md mx-auto mt-10">
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-500" />
            Start Live Stream
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {!liveKitReady && (
            <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-500 p-3 rounded mb-4 text-sm">
              ⚠️ LiveKit not loaded. Run: <code className="bg-black/30 px-1 rounded">npm install livekit-client</code>
            </div>
          )}

          <div
            className="relative bg-black rounded-lg mb-6 overflow-hidden"
            style={{
              aspectRatio: '16/9',
              width: '100%',
              maxWidth: '100vw'
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                width: '100%',
                height: '100%'
              }}
            />

            {isMobile() && (
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs z-10">
                📱 Rotate to landscape for best view
              </div>
            )}

            <div className="absolute top-4 right-4 flex space-x-2 z-10">
              <button
                onClick={toggleCamera}
                className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${isCameraOn ? 'bg-black/50 hover:bg-black/70' : 'bg-red-500 hover:bg-red-600'
                  }`}
              >
                {isCameraOn ? <Camera className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleMic}
                className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${isMicOn ? 'bg-black/50 hover:bg-black/70' : 'bg-red-500 hover:bg-red-600'
                  }`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </div>

            {!localStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-5">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400 text-sm">Requesting camera access...</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stream Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your stream about?"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                maxLength={100}
              />
              <p className="text-gray-400 text-xs mt-1">{title.length}/100</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
                maxLength={500}
              />
            </div>

            <button
              onClick={startStream}
              disabled={loading || !liveKitReady}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Starting...' : '🔴 Go LIVE'}
            </button>
          </div>
        </div>
      </div>

      {showConfirmEnd && (
        <ConfirmEndModal
          onConfirm={() => {
            setShowConfirmEnd(false);
            endStream();
          }}
          onCancel={() => setShowConfirmEnd(false)}
        />
      )}
    </div>
  );
};

export default HostLiveStream;