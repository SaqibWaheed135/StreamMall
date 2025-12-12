import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Radio,
  Users,
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageCircle,
  Heart,
  ChevronDown,
  Share2,
  AlertTriangle,
  DollarSign,
  Gift,
  TrendingUp,
  Reply,
  Send
} from 'lucide-react';

import {
  FaWhatsapp,
  FaTelegramPlane,
  FaFacebookF,
  FaTwitter,
  FaFacebookMessenger,
  FaCopy,
  FaTimes
} from 'react-icons/fa';

import io from 'socket.io-client';
import loadLiveKit from './globalComponents/liveKitLoad';
import OrderDetailsModal from './globalComponents/hostStreamComponents/OrderDetailsModal';
import ConfirmEndModal from './globalComponents/hostStreamComponents/ConfirmEndModal';
import { API_BASE_URL, SOCKET_URL } from '../config/api';
import { Room, RoomEvent, Track } from 'livekit-client';

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

const HostLiveStream = ({ onBack }) => {
  const [isLive, setIsLive] = useState(false);
  const [streamData, setStreamData] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [entryFee, setEntryFee] = useState(0);
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [tips, setTips] = useState([]);
  const [paidViewersCount, setPaidViewersCount] = useState(0);
  const [showTipNotification, setShowTipNotification] = useState(null);
  const [showEarningsModal, setShowEarningsModal] = useState(false);

  // NEW: Reply state
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const videoRef = useRef(null);
  const localVideoRef = useRef(null);
  const commentsEndRef = useRef(null);
  const replyInputRef = useRef(null);  // Add this line


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

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const ShareModal = ({ isOpen, stream, onClose }) => {
    if (!isOpen) return null;

    const shareUrl = `${window.location.origin}/stream/${stream?.streamId}`;
    const shareText = encodeURIComponent(stream?.stream?.title || "Live Stream");

    const shareLinks = {
      whatsapp: `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`,
      messenger: `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`,
    };

    const handleCopy = async () => {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    };

    const handleShareClick = (platform) => {
      if (!platform) {
        handleCopy();
        return;
      }
      window.open(platform, "_blank");
    };

    return (
      <div className="fixed inset-0 bg-white/90 bg-opacity-60 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-80 animate-fadeIn relative">
          <button className="absolute top-3 right-3 text-gray-600 hover:text-black" onClick={onClose}>
            <FaTimes size={18} />
          </button>

          <h2 className="text-xl font-bold text-center mb-4 text-gray-900">Share Live Stream</h2>

          <div className="grid grid-cols-3 gap-4 text-center">
            <button className="share-btn bg-green-500" onClick={() => handleShareClick(shareLinks.whatsapp)}>
              <FaWhatsapp size={22} />
              <span>WhatsApp</span>
            </button>

            <button className="share-btn bg-blue-500" onClick={() => handleShareClick(shareLinks.telegram)}>
              <FaTelegramPlane size={22} />
              <span>Telegram</span>
            </button>

            <button className="share-btn bg-blue-700" onClick={() => handleShareClick(shareLinks.facebook)}>
              <FaFacebookF size={22} />
              <span>Facebook</span>
            </button>

            <button className="share-btn bg-sky-500" onClick={() => handleShareClick(shareLinks.twitter)}>
              <FaTwitter size={22} />
              <span>Twitter</span>
            </button>

            <button className="share-btn bg-indigo-500" onClick={() => handleShareClick(shareLinks.messenger)}>
              <FaFacebookMessenger size={22} />
              <span>Messenger</span>
            </button>

            <button className="share-btn bg-gray-600" onClick={handleCopy}>
              <FaCopy size={22} />
              <span>Copy</span>
            </button>
          </div>
        </div>

        <style>{`
          .share-btn {
            display: flex;
            flex-direction: column;
            gap: 4px;
            align-items: center;
            justify-content: center;
            padding: 10px;
            border-radius: 12px;
            color: white;
            font-size: 12px;
            font-weight: 500;
            transition: 0.2s ease;
          }

          .share-btn:hover {
            filter: brightness(0.9);
            transform: scale(1.05);
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }

          .animate-fadeIn {
            animation: fadeIn 0.25s ease-in-out;
          }
        `}</style>
      </div>
    );
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
    if (replyingTo && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyingTo]);

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

  const setupSocketListeners = (socket) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 HOST: Setting up socket listeners');
    console.log('Socket ID:', socket.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // In the socket listener setup
    socket.on('new-comment', (data) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 HOST: New comment received');
    console.log('Comment data:', JSON.stringify(data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      setComments(prev => [...prev, {
        _id: data._id || data.id, // ✅ Use _id or fall back to id
        id: data.id || data._id,   // ✅ Include both for compatibility
        username: data.username || 'Viewer',
        text: data.text,
        timestamp: new Date(),
        replies: [] // ✅ Initialize replies array
      }

    ]);

    });

    // ✅ ENHANCED reply listener with debugging
    socket.on('new-reply', (data) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💬 HOST: Reply received');
    console.log('Comment ID to match:', data.commentId);
    console.log('Reply data:', JSON.stringify(data.reply, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      setComments(prev => {
        console.log('Looking through comments to find match...');

        const updated = prev.map(comment => {
          console.log(`Checking comment: _id=${comment._id}, id=${comment.id}`);

          // Match by either _id or id
          if (comment._id === data.commentId || comment.id === data.commentId) {
            console.log('✅ MATCH FOUND! Adding reply to this comment');

            return {
              ...comment,
              replies: [...(comment.replies || []), {
                _id: data.reply._id,
                username: data.reply.username,
                text: data.reply.text,
                timestamp: new Date(data.reply.timestamp),
                isHost: data.reply.isHost
              }]
            };
          }
          return comment;
        });

        console.log('Updated comments:', updated);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return updated;
      });
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

    socket.on('entry-fee-received', (data) => {
      setPaidViewersCount(prev => prev + 1);
      setCoinBalance(prev => prev + data.amount);
      setError(`${data.viewer.username} joined! +${data.amount} coins`);
      setTimeout(() => setError(''), 3000);
    });

    socket.on('tip-received', (data) => {
      setTips(prev => [...prev, {
        id: Date.now() + Math.random(),
        username: data.tipper.username,
        amount: data.amount,
        giftType: data.giftType,
        timestamp: data.timestamp
      }]);
      setCoinBalance(prev => prev + data.amount);

      setShowTipNotification({
        username: data.tipper.username,
        amount: data.amount,
        giftType: data.giftType
      });

      setTimeout(() => setShowTipNotification(null), 4000);
    });

    socket.on('coins-updated', (data) => {
      if (data.streamId === streamData?.streamId) {
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
      setPaidViewersCount(streamData.stream.paidViewers?.length || 0);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isLive, streamData?.streamId]);

  // NEW: Handle reply submission
  // const handleSendReply = () => {
  //   if (!replyText.trim() || !replyingTo || !socket) return;

  //   socket.emit('send-reply', {
  //     streamId: streamData.streamId,
  //     commentId: replyingTo._id || replyingTo.id,
  //     text: replyText.trim()
  //   });

  //   setReplyText('');
  //   setReplyingTo(null);
  // };

  const handleSendReply = () => {
    if (!replyText.trim() || !replyingTo || !socket) return;

    console.log('🔄 Sending reply...');
    console.log('Comment ID:', replyingTo._id || replyingTo.id);
    console.log('Reply text:', replyText.trim());

    socket.emit('send-reply', {
      streamId: streamData.streamId,
      commentId: replyingTo._id || replyingTo.id, // ✅ Use _id or id
      text: replyText.trim()
    });

    setReplyText('');
    setReplyingTo(null);
  };
  const fetchInitialOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/live/${streamData.streamId}/orders`, {
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

    if (entryFee < 0) {
      setError('Entry fee cannot be negative');
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
      const response = await fetch(`${API_BASE_URL}/live/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          privacy: 'public',
          entryFee: parseInt(entryFee) || 0
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

    const blockBackNavigation = () => {
      window.history.pushState(null, '', window.location.href);
      setShowConfirmEnd(true);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', blockBackNavigation);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', blockBackNavigation);
    };
  }, [isLive]);

  const endStream = async () => {
    if (!streamData?.streamId) return;

    const token = localStorage.getItem('token');
    const streamId = streamData.streamId;

    try {
      const response = await fetch(`${API_BASE_URL}/live/${streamId}/end`, {
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

      setIsLive(false);
      setStreamData(null);
      setTitle('');
      setDescription('');
      setEntryFee(0);
      setComments([]);
      setHearts([]);
      setProducts([]);
      setOrders([]);
      setCoinBalance(0);
      setTips([]);
      setPaidViewersCount(0);

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
      <div className="min-h-screen bg-[#FFC0CB] text-black p-4">
        <style>{`
          @keyframes float-up {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>

        {showTipNotification && (
          <div
            className="fixed top-20 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-3"
            style={{ animation: 'slideIn 0.3s ease-out' }}
          >
            <Gift className="w-6 h-6" />
            <div>
              <p className="font-bold">{showTipNotification.username} sent {getGiftIcon(showTipNotification.giftType)}!</p>
              <p className="text-sm">+{showTipNotification.amount} coins</p>
            </div>
          </div>
        )}

        {showEarningsModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFC0CB] border border-[#ff99b3] rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  Stream Earnings
                </h3>
                <button
                  onClick={() => setShowEarningsModal(false)}
                  className="text-gray-700 hover:text-black"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white/70 border border-[#ff99b3] rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-yellow-600">{coinBalance} coins</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/70 border border-[#ff99b3] rounded-lg p-3">
                    <p className="text-xs text-gray-700 mb-1">Paid Viewers</p>
                    <p className="text-xl font-semibold">{paidViewersCount}</p>
                  </div>
                  <div className="bg-white/70 border border-[#ff99b3] rounded-lg p-3">
                    <p className="text-xs text-gray-700 mb-1">Tips Received</p>
                    <p className="text-xl font-semibold">{tips.length}</p>
                  </div>
                </div>

                <div className="bg-white/70 border border-[#ff99b3] rounded-lg p-3 max-h-40 overflow-y-auto">
                  <p className="text-sm font-semibold mb-2">Recent Tips</p>
                  {tips.slice(-5).reverse().map((tip) => (
                    <div key={tip.id} className="flex items-center justify-between py-1 text-sm">
                      <span>{tip.username}</span>
                      <span className="text-yellow-700">+{tip.amount}</span>
                    </div>
                  ))}
                  {tips.length === 0 && (
                    <p className="text-gray-700 text-xs">No tips yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          <div className="bg-white/70 border border-[#ff99b3] rounded-lg p-4 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 w-full">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-white">LIVE</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{viewerCount} viewers</span>
                </div>

                <button
                  onClick={() => setShowEarningsModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:shadow-md px-3.5 py-1.5 rounded-full text-amber-900 font-semibold transition"
                >
                  <span className="text-sm font-semibold">{coinBalance} coins</span>
                </button>

                {streamData?.stream?.entryFee > 0 && (
                  <div className="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full">
                    <span className="text-xs font-semibold">Entry: {streamData.stream.entryFee} coins</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleShareClick}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-white text-sm"
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

              <div className="bg-white/70 border border-[#ff99b3] rounded-lg p-4 mb-4 flex items-center justify-center gap-4">
                <button
                  onClick={toggleCamera}
                  className={`p-4 rounded-full transition-colors ${isCameraOn ? 'bg-white border border-[#ff99b3] hover:bg-[#ffb3c6]' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                  {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
                <button
                  onClick={toggleMic}
                  className={`p-4 rounded-full transition-colors ${isMicOn ? 'bg-white border border-[#ff99b3] hover:bg-[#ffb3c6]' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                  {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>
              </div>

              <div className="bg-white/70 border border-[#ff99b3] rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-4">Add Product/Ad</h3>

                <select
                  value={newProduct.type}
                  onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                  className="w-full bg-white border border-[#ff99b3] rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="product">Product</option>
                  <option value="ad">Ad</option>
                </select>

                <input
                  placeholder="Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-white border border-[#ff99b3] rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />

                <input
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-white border border-[#ff99b3] rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  className="w-full bg-white border border-[#ff99b3] rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-gradient-to-r from-pink-600 to-pink-500 file:text-white hover:file:shadow-lg"

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
                  className="w-full bg-white border border-[#ffb3c6] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"

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
                      const response = await fetch(`${API_BASE_URL}/live/${streamData.streamId}/add-product`, {
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
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:shadow-lg hover:shadow-pink-200 text-white py-3 rounded-xl font-semibold transition mt-5"
                >
                  Add Item
                </button>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Added Items</h4>

                  {products.length === 0 ? (
                    <p className="text-gray-400 text-sm">No items added yet</p>
                  ) : (
                    products.map((p, i) => (
                      <div key={i} className="bg-white/80 rounded-lg p-2 mb-2 flex items-center gap-3">
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

              <div className="bg-white/80 border border-white/70 rounded-3xl shadow-lg p-6">
                <h3 className="font-semibold text-pink-700 flex items-center gap-2 mb-4">

                  <Gift className="w-5 h-5 text-amber-500" />
                  Recent Tips ({tips.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tips.slice(-5).reverse().map((tip) => (
                    <div key={tip.id} className="bg-white border border-[#ffb3c6] rounded-2xl px-4 py-2 flex items-center justify-between text-sm shadow-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-2xl">{getGiftIcon(tip.giftType)}</span>
                        <span className="text-sm text-gray-300">{tip.username}</span>
                      </div>
                      <span className="text-pink-600 font-semibold">+{tip.amount}</span>

                    </div>
                  ))}
                  {tips.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No tips yet</p>
                  )}
                </div>
              </div>

            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white/80 border border-white/70 rounded-3xl shadow-lg p-6 max-h-[400px] overflow-y-auto">

                <h3 className="font-semibold text-pink-700 flex items-center gap-2 mb-4">

                  📦 Orders ({orders.length})
                </h3>
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-sm">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order, i) => (
                      <div key={i} className="bg-white border border-[#ffb3c6] rounded-2xl p-3 shadow-sm">
                        <button
                          onClick={() => {
                            const product = products[order.productIndex];
                            setSelectedOrderDetails({
                              order,
                              product
                            });
                          }}
                          className="w-full text-left hover:bg-[#ffe0ea]/60 p-3 rounded-2xl transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">
                                {products[order.productIndex]?.name}</p>
                              <p className="text-xs text-gray-500">By: {order.buyer?.username || order.buyerUsername}</p>
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

              <div className="bg-white/80 border border-white/70 rounded-3xl shadow-lg h-[400px] flex flex-col">

                <div className="p-5 border-b border-[#ffb3c6]/70 bg-white/70 rounded-t-3xl">
                  <h3 className="font-semibold text-pink-700 flex items-center gap-2">

                    <MessageCircle className="w-5 h-5" />
                    Live Chat
                  </h3>
                </div>
                {/* <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/60">

                  {comments.map((c) => (
                    <div key={c.id}
                      className="text-sm bg-white border border-[#ffb3c6]/70 rounded-2xl px-4 py-2 shadow-sm"

                    >
                      <span className="font-semibold text-pink-600">@{c.username}: </span>

                      <span className="text-gray-700">{c.text}</span>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center text-gray-500 mt-20">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-pink-300" />

                      <p className="text-sm">Waiting for comments...</p>
                    </div>
                  )}
                  <div ref={commentsEndRef} />
                </div> */}

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/60">
                  {comments.map((c) => (
                    <div key={c.id} className="space-y-2">
                      {/* Main Comment */}
                      <div className="bg-white border border-[#ffb3c6]/70 rounded-2xl px-4 py-2 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <span className="font-semibold text-pink-600">@{c.username}: </span>
                            <span className="text-gray-700 text-sm">{c.text}</span>
                          </div>
                          <button
                            onClick={() => setReplyingTo(c)}
                            className="flex-shrink-0 text-pink-500 hover:text-pink-700 p-1 rounded hover:bg-pink-50 transition"
                            title="Reply to this comment"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Replies Section */}
                      {c.replies && c.replies.length > 0 && (
                        <div className="ml-6 space-y-2">
                          {c.replies.map((reply) => (
                            <div
                              key={reply._id || reply.id}
                              className={`text-sm rounded-xl px-3 py-2 shadow-sm ${reply.isHost
                                ? 'bg-pink-50 border-2 border-pink-400'
                                : 'bg-white/90 border border-[#ffb3c6]/50'
                                }`}
                            >
                              <div className="flex items-start gap-1">
                                {reply.isHost && <span className="text-pink-600">👑</span>}
                                <span className={`font-semibold ${reply.isHost ? 'text-pink-700' : 'text-pink-600'
                                  }`}>
                                  @{reply.username}:
                                </span>
                                <span className="text-gray-700">{reply.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <div className="text-center text-gray-500 mt-20">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-pink-300" />
                      <p className="text-sm">Waiting for comments...</p>
                    </div>
                  )}
                  <div ref={commentsEndRef} />
                </div>
                <div className="p-4 border-t border-[#ffb3c6]/70 bg-white/70 rounded-b-3xl">
                  {replyingTo && (
                    <div className="mb-2 flex items-center justify-between bg-pink-50 border border-pink-300 rounded-lg px-3 py-2">
                      <span className="text-sm text-pink-700">
                        Replying to <span className="font-semibold">@{replyingTo.username}</span>
                      </span>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="text-pink-600 hover:text-pink-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      ref={replyInputRef}
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && replyingTo) {
                          handleSendReply();
                        }
                      }}
                      placeholder={replyingTo ? "Type your reply..." : "Click reply button on a comment"}
                      disabled={!replyingTo}
                      className="flex-1 bg-white border border-[#ffb3c6] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || !replyingTo}
                      className="bg-gradient-to-r from-pink-600 to-pink-500 text-white p-2 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>

                  {!replyingTo && (
                    <p className="text-xs text-gray-500 mt-2">
                      <Heart className="w-3 h-3 inline text-pink-500" /> Click the reply icon on any comment to respond
                    </p>
                  )}
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
        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            stream={streamData}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFC0CB] via-[#ffb3c6] to-[#ff99b3] text-gray-900 p-4 sm:p-6">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 bg-white text-pink-600 border border-[#ff99b3] hover:bg-[#ffe0ea] px-4 py-2 rounded-xl font-semibold transition mb-6 shadow-sm"
      >

        ← Back to Streams
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white/80 border border-white/70 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          <h1 className="text-3xl font-bold text-pink-700 mb-6 flex items-center gap-3">
            <Radio className="w-8 h-8 text-pink-500" />
            Start Live Stream
          </h1>

          {error && (
            <div className="bg-[#ffe4e6] border border-[#fb7185] text-[#be123c] px-4 py-3 rounded-2xl text-sm font-medium mb-4">
              {error}
            </div>
          )}


          {!liveKitReady && (
            <div className="bg-amber-100 border border-amber-300 text-amber-700 px-4 py-3 rounded-2xl text-sm font-medium mb-4">
              ⚠️ LiveKit not loaded. Run: <code className="bg-white px-1 rounded">npm install livekit-client</code>
            </div>
          )}


          <div
            className="relative bg-black rounded-3xl mb-6 overflow-hidden shadow-lg"

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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${isCameraOn
                  ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                  : 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg'
                  }`}
              >

                {isCameraOn ? <Camera className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleMic}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${isMicOn
                  ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                  : 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg'
                  }`}
              >

                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </div>

            {!localStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">

                <div className="text-center text-white/80">
                  <Camera className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="font-medium text-sm">Requesting camera access...</p>
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
                className="w-full bg-white border border-[#ffb3c6] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
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
                className="w-full bg-white border border-[#ffb3c6] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 transition resize-none"

                rows={3}
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Entry Fee (coins) *
              </label>
              <input
                type="number"
                value={entryFee}
                onChange={(e) => setEntryFee(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0 = Free to watch"
                className="w-full bg-white border border-[#ffb3c6] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                min="0"
              />
              <p className="text-xs text-gray-400 mt-1">
                {entryFee === 0 ? '✅ Free stream - anyone can watch' : `💰 Viewers need ${entryFee} coins to enter`}
              </p>
            </div>

            <button
              onClick={startStream}
              disabled={loading || !liveKitReady}
              className="w-full bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 hover:shadow-xl hover:shadow-pink-200 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-lg transition-all"
            >
              {loading ? 'Starting…' : '🔴 Go LIVE'}
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