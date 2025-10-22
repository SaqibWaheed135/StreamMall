// import React, { useState, useEffect, useRef } from 'react';
// import { Camera, Radio, Users, X, Mic, MicOff, Video, VideoOff, MessageCircle, Heart, ChevronDown, Share2 } from 'lucide-react';
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
//          window.innerWidth <= 768;
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
//         aspectRatio: { ideal: 16/9 },
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
//   const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

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
//   const handleShare = async () => {
//     if (!streamData?.streamId) {
//       setError('No stream active to share');
//       return;
//     }

//     const shareUrl = `${window.location.origin}/live/${streamData.streamId}`;
//     const shareData = {
//       title: streamData.stream?.title || 'Live Stream',
//       text: streamData.stream?.description || 'Join my live stream!',
//       url: shareUrl,
//     };

//     try {
//       if (navigator.share && isMobile()) {
//         await navigator.share(shareData);
//       } else {
//         await navigator.clipboard.writeText(shareUrl);
//         setError('Stream link copied to clipboard!');
//         setTimeout(() => setError(''), 3000);
//       }
//     } catch (err) {
//       console.error('Share failed:', err);
//       setError('Failed to share stream link');
//     }
//   };

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
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
//                   <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
//                   <span className="text-sm font-semibold">LIVE</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-gray-300">
//                   <Users className="w-4 h-4" />
//                   <span className="text-sm">{viewerCount} viewers</span>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={handleShare}
//                   className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
//                 >
//                   <Share2 className="w-4 h-4" />
//                   Share
//                 </button>
//                 <button
//                   onClick={endStream}
//                   className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2"
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
//                   onChange={(e) => setNewProduct({...newProduct, type: e.target.value})}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:border-blue-500"
//                 >
//                   <option value="product">Product</option>
//                   <option value="ad">Ad</option>
//                 </select>
//                 <input
//                   placeholder="Name"
//                   value={newProduct.name}
//                   onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:border-blue-500"
//                 />
//                 <input
//                   placeholder="Description"
//                   value={newProduct.description}
//                   onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:border-blue-500"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Price"
//                   value={newProduct.price}
//                   onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:border-blue-500"
//                 />
//                 <input
//                   placeholder="Image URL"
//                   value={newProduct.imageUrl}
//                   onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:border-blue-500"
//                 />
//                 <input
//                   placeholder="Link (for ad or product)"
//                   value={newProduct.link}
//                   onChange={(e) => setNewProduct({...newProduct, link: e.target.value})}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:border-blue-500"
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
//                   className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold mt-2"
//                 >
//                   Add
//                 </button>
//                 <div className="mt-4">
//                   <h4 className="font-semibold mb-2">Added Items</h4>
//                   {products.map((p, i) => (
//                     <div key={i} className="bg-gray-700 rounded-lg p-2 mb-2">
//                       <span>{p.name} - ${p.price} ({Math.ceil(p.price * 100)} coins)</span>
//                     </div>
//                   ))}
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
//         onClick={onBack}
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
//                 className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
//                   isCameraOn ? 'bg-black/50 hover:bg-black/70' : 'bg-red-500 hover:bg-red-600'
//                 }`}
//               >
//                 {isCameraOn ? <Camera className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
//               </button>
//               <button
//                 onClick={toggleMic}
//                 className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
//                   isMicOn ? 'bg-black/50 hover:bg-black/70' : 'bg-red-500 hover:bg-red-600'
//                 }`}
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
//     </div>
//   );
// };

// export default HostLiveStream;

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Radio, Users, X, Mic, MicOff, Video, VideoOff, MessageCircle, Heart, ChevronDown, Share2, UserPlus, UserCheck, UserX } from 'lucide-react';

// Mock components and utilities
const getCameraConstraints = () => ({
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

const CoHostRequestModal = ({ requests, onApprove, onReject, onClose }) => {
  if (requests.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Co-Host Requests ({requests.length})
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          {requests.map((request) => (
            <div key={request.userId} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {request.avatar ? (
                  <img src={request.avatar} alt={request.username} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {request.username[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{request.username}</p>
                  <p className="text-xs text-gray-400">Wants to join as co-host</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onApprove(request.userId)}
                  className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition-colors"
                  title="Approve"
                >
                  <UserCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onReject(request.userId)}
                  className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-colors"
                  title="Reject"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CoHostsPanel = ({ coHosts, onRemoveCoHost }) => {
  if (coHosts.length === 0) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Active Co-Hosts ({coHosts.length})
      </h3>
      <div className="space-y-2">
        {coHosts.map((coHost) => (
          <div key={coHost.userId} className="bg-gray-700 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {coHost.avatar ? (
                <img src={coHost.avatar} alt={coHost.username} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {coHost.username[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{coHost.username}</p>
                <p className="text-xs text-gray-400">Co-Host</p>
              </div>
            </div>
            <button
              onClick={() => onRemoveCoHost(coHost.userId)}
              className="text-red-400 hover:text-red-300 p-1"
              title="Remove co-host"
            >
              <UserX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const MultiParticipantVideoGrid = ({ participants, localVideoRef, isCameraOn }) => {
  const getGridClass = (count) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  return (
    <div className={`grid ${getGridClass(participants.length + 1)} gap-2 h-full`}>
      {/* Main Host Video */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!isCameraOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <VideoOff className="w-12 h-12 text-gray-600" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs">
          You (Host)
        </div>
      </div>

      {/* Co-Host Videos */}
      {participants.map((participant, index) => (
        <div key={participant.userId} className="relative bg-gray-800 rounded-lg overflow-hidden">
          <video
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            id={`cohost-video-${participant.userId}`}
          />
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center gap-1">
            {participant.username}
            {participant.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
          </div>
        </div>
      ))}
    </div>
  );
};

const HostLiveStream = ({ onBack }) => {
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [comments, setComments] = useState([]);
  const [hearts, setHearts] = useState([]);
  
  // Co-host related states
  const [coHostRequests, setCoHostRequests] = useState([]);
  const [activeCoHosts, setActiveCoHosts] = useState([]);
  const [showCoHostRequests, setShowCoHostRequests] = useState(false);
  const [maxCoHosts] = useState(8); // TikTok allows up to 8 co-hosts

  const localVideoRef = useRef(null);
  const commentsEndRef = useRef(null);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate incoming co-host requests
    const mockRequests = [
      { userId: '1', username: 'sarah_jones', avatar: null },
      { userId: '2', username: 'mike_chen', avatar: null },
    ];
    
    if (isLive && Math.random() > 0.7) {
      setCoHostRequests(mockRequests);
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
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play();
      }
    } catch (err) {
      console.error('Camera preview error:', err);
      setError('Could not access camera/microphone. Please grant permissions.');
    }
  };

  useEffect(() => {
    if (!isLive) {
      startCameraPreview();
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isLive]);

  const startStream = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!localStream) {
        await startCameraPreview();
      }

      // Simulate stream start
      setTimeout(() => {
        setIsLive(true);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const endStream = async () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    setIsLive(false);
    setTitle('');
    setDescription('');
    setComments([]);
    setHearts([]);
    setCoHostRequests([]);
    setActiveCoHosts([]);
    onBack();
  };

  const handleApproveCoHost = (userId) => {
    const request = coHostRequests.find(r => r.userId === userId);
    if (!request) return;

    if (activeCoHosts.length >= maxCoHosts) {
      setError(`Maximum ${maxCoHosts} co-hosts allowed`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setActiveCoHosts(prev => [...prev, { ...request, joinedAt: new Date() }]);
    setCoHostRequests(prev => prev.filter(r => r.userId !== userId));
    setError(`${request.username} joined as co-host!`);
    setTimeout(() => setError(''), 3000);
  };

  const handleRejectCoHost = (userId) => {
    setCoHostRequests(prev => prev.filter(r => r.userId !== userId));
  };

  const handleRemoveCoHost = (userId) => {
    const coHost = activeCoHosts.find(c => c.userId === userId);
    setActiveCoHosts(prev => prev.filter(c => c.userId !== userId));
    if (coHost) {
      setError(`${coHost.username} removed from co-hosts`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const toggleCamera = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/live/demo-stream`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setError('Stream link copied to clipboard!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError('Failed to share stream link');
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
          {/* Header */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">LIVE</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{viewerCount} viewers</span>
                </div>
                {activeCoHosts.length > 0 && (
                  <div className="flex items-center gap-2 bg-green-600/20 border border-green-600 px-3 py-1 rounded-full">
                    <UserCheck className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">{activeCoHosts.length} Co-hosts</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {coHostRequests.length > 0 && (
                  <button
                    onClick={() => setShowCoHostRequests(true)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 relative"
                  >
                    <UserPlus className="w-4 h-4" />
                    Requests
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {coHostRequests.length}
                    </span>
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={endStream}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  End Stream
                </button>
              </div>
            </div>
            <h2 className="text-xl font-bold mt-3">{title}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Main Video Area */}
            <div className="lg:col-span-3">
              <div 
                className="bg-black rounded-lg mb-4 relative overflow-hidden"
                style={{ 
                  aspectRatio: '16/9',
                  minHeight: '400px'
                }}
              >
                <MultiParticipantVideoGrid
                  participants={activeCoHosts}
                  localVideoRef={localVideoRef}
                  isCameraOn={isCameraOn}
                />

                {/* Hearts Animation */}
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

              {/* Controls */}
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

              {/* Co-Hosts Panel */}
              <CoHostsPanel 
                coHosts={activeCoHosts} 
                onRemoveCoHost={handleRemoveCoHost}
              />
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-2 space-y-4">
              {/* Live Chat */}
              <div className="bg-gray-800 rounded-lg h-[500px] flex flex-col">
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
              </div>
            </div>
          </div>
        </div>

        {/* Co-Host Requests Modal */}
        {showCoHostRequests && (
          <CoHostRequestModal
            requests={coHostRequests}
            onApprove={handleApproveCoHost}
            onReject={handleRejectCoHost}
            onClose={() => setShowCoHostRequests(false)}
          />
        )}

        {/* Error/Success Toast */}
        {error && (
          <div className="fixed top-4 left-4 right-4 bg-blue-500/20 border border-blue-500 text-blue-400 px-4 py-3 rounded-lg text-sm z-50">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Preview UI
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <button
        onClick={onBack}
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

          <div 
            className="relative bg-black rounded-lg mb-6 overflow-hidden"
            style={{ aspectRatio: '16/9' }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
              <button
                onClick={toggleCamera}
                className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                  isCameraOn ? 'bg-black/50 hover:bg-black/70' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isCameraOn ? <Camera className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleMic}
                className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                  isMicOn ? 'bg-black/50 hover:bg-black/70' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </div>
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

            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-3 text-sm">
              <p className="text-blue-400 font-semibold mb-1">💡 Multi Co-Host Feature</p>
              <p className="text-gray-300">Allow up to {maxCoHosts} viewers to join your stream as co-hosts!</p>
            </div>

            <button
              onClick={startStream}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Starting...' : '🔴 Go LIVE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo wrapper
const App = () => {
  const [showStream, setShowStream] = useState(true);
  
  return (
    <div className="min-h-screen bg-gray-900">
      {showStream ? (
        <HostLiveStream onBack={() => setShowStream(false)} />
      ) : (
        <div className="min-h-screen flex items-center justify-center text-white">
          <button
            onClick={() => setShowStream(true)}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold"
          >
            Start Streaming Demo
          </button>
        </div>
      )}
    </div>
  );
};

export default App;