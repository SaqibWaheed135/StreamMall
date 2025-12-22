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
  Send,
  Maximize,
  Minimize
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
import screenfull from 'screenfull';
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

// Key used to persist the host's active live session so they can return
const ACTIVE_HOST_STREAM_KEY = 'activeHostStream';

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
  const [showFullscreenToast, setShowFullscreenToast] = useState(false);
  const [fullscreenComment, setFullscreenComment] = useState('');
const fullscreenInputRef = useRef(null); // For iPhone fullscreen input

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

  // Fullscreen and overlay comments state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [overlayComments, setOverlayComments] = useState([]);
  const [showFullscreenControls, setShowFullscreenControls] = useState(false);
  const [activeFullscreenTab, setActiveFullscreenTab] = useState('chat'); // 'chat', 'products', 'orders'
  const videoContainerRef = useRef(null);

  const videoRef = useRef(null);
  const localVideoRef = useRef(null);
  const commentsEndRef = useRef(null);
  const replyInputRef = useRef(null);  // Add this line
  const trackCheckIntervalRef = useRef(null);
  const isBlockingNavigationRef = useRef(false);

  // Handle iOS viewport height changes
  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Initial calculation
    handleResize();

    // Update on resize and orientation change
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Auto-fullscreen for iPhone when going live (only iPhone, not other devices)
  useEffect(() => {
    // Only detect iPhone specifically (not iPad or other iOS devices)
    const isIPhone = /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    console.log('🔍 Auto-fullscreen check:', { isLive, isIPhone, isFullscreen });

    // Only auto-fullscreen on iPhone when going live
    if (isLive && isIPhone && !isFullscreen) {
      console.log('📱 iPhone detected - attempting auto-fullscreen');
      // Show toast notification
      setShowFullscreenToast(true);

      // Function to attempt fullscreen with retries
      const attemptFullscreen = (attempts = 0) => {
        const container = videoContainerRef.current;
        console.log(`🔄 Fullscreen attempt ${attempts}:`, { container: !!container });
        
        // Check if already in fullscreen to avoid duplicate calls
        if (container && container.classList.contains('ios-fullscreen')) {
          console.log('✅ Already in fullscreen');
          setIsFullscreen(true);
          return;
        }
        
        if (!container && attempts < 20) {
          // Retry if container not ready yet (up to 4 seconds)
          setTimeout(() => attemptFullscreen(attempts + 1), 200);
          return;
        }

        if (container && !container.classList.contains('ios-fullscreen')) {
          console.log('🎬 Applying iPhone fullscreen');
          
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            // Apply iPhone fullscreen directly
            window.scrollTo(0, 1);

            // Add fullscreen classes
            container.classList.add('ios-fullscreen');
            document.body.classList.add('ios-fullscreen-active');
            document.documentElement.classList.add('ios-fullscreen-active');

            // Apply aggressive inline styles to container to break out of parent
            container.style.cssText = `
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              height: calc(var(--vh, 1vh) * 100) !important;
              max-width: 100vw !important;
              max-height: 100vh !important;
              margin: 0 !important;
              padding: 0 !important;
              z-index: 2147483647 !important;
              border-radius: 0 !important;
              background: #000 !important;
              transform: none !important;
              -webkit-transform: translate3d(0,0,0) !important;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            `;

            // Force viewport height calculation
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);

            // Prevent body scroll
            document.body.style.position = 'fixed';
            document.body.style.top = '0';
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.bottom = '0';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            document.body.style.overflow = 'hidden';

            // Also set on html
            document.documentElement.style.position = 'fixed';
            document.documentElement.style.width = '100%';
            document.documentElement.style.height = '100%';
            document.documentElement.style.overflow = 'hidden';

            setIsFullscreen(true);
            console.log('✅ Fullscreen applied with inline styles');

            // Focus input to open keyboard immediately on iPhone - using multiple techniques
            const triggerKeyboard = () => {
              const input = fullscreenInputRef.current;
              if (!input) return;

              // Technique 1: Temporarily change input type to 'tel' (always shows keyboard on iOS), then change back
              const originalType = input.type;
              if (originalType === 'text') {
                input.type = 'tel';
                // Force reflow
                void input.offsetHeight;
                input.type = 'text';
              }

              // Technique 2: Programmatic click event (iOS responds better to this)
              try {
                const clickEvent = new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window
                });
                input.dispatchEvent(clickEvent);
              } catch (e) {
                console.log('Click event dispatch failed:', e);
              }

              // Technique 3: Direct focus
              input.focus();
              
              // Technique 4: Click method (iOS sometimes needs this)
              if (input.click) {
                input.click();
              }
              
              // Technique 5: Set selection range (makes input more "active" on iOS)
              if (input.setSelectionRange) {
                try {
                  const len = input.value.length || 0;
                  input.setSelectionRange(len, len);
                } catch (e) {
                  // Ignore errors for inputs that don't support selection
                }
              }

              // Technique 6: Force blur then focus with click (sometimes triggers keyboard)
              setTimeout(() => {
                input.blur();
                setTimeout(() => {
                  try {
                    const clickEvent = new MouseEvent('click', {
                      bubbles: true,
                      cancelable: true,
                      view: window
                    });
                    input.dispatchEvent(clickEvent);
                  } catch (e) {}
                  input.focus();
                  if (input.click) {
                    input.click();
                  }
                }, 10);
              }, 50);
              
              console.log('⌨️ Attempted to show keyboard with multiple techniques');
            };

            // Try multiple times with increasing delays
            setTimeout(triggerKeyboard, 100);
            setTimeout(triggerKeyboard, 300);
            setTimeout(triggerKeyboard, 500);
            setTimeout(triggerKeyboard, 800);
            setTimeout(triggerKeyboard, 1000);

            // Request orientation lock if available
            if (screen.orientation && screen.orientation.lock) {
              screen.orientation.lock('landscape').catch(() => {
                console.log('Orientation lock not available');
              });
            }

            // Hide toast after fullscreen is activated
            setTimeout(() => {
              setShowFullscreenToast(false);
            }, 2000);
          });
        } else if (!container) {
          console.warn('⚠️ Container not found after all retries');
        }
      };

      // Start attempting fullscreen after a delay to ensure DOM is ready
      const timer = setTimeout(() => {
        attemptFullscreen();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLive]); // Only trigger when isLive changes (removed isFullscreen to avoid re-triggers)

  // Auto-focus input to show keyboard when iPhone enters fullscreen mode
  useEffect(() => {
    const isIPhone = /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isFullscreen && isIPhone && isLive) {
      // Aggressive focus with multiple techniques for iOS
      const triggerKeyboard = () => {
        const input = fullscreenInputRef.current;
        if (!input) return;

        // Technique 1: Temporarily change input type to 'tel' (always shows keyboard on iOS), then change back
        const originalType = input.type;
        if (originalType === 'text') {
          input.type = 'tel';
          // Force reflow
          void input.offsetHeight;
          input.type = 'text';
        }

        // Technique 2: Programmatic click event (iOS responds better to this)
        try {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          input.dispatchEvent(clickEvent);
        } catch (e) {
          console.log('Click event dispatch failed:', e);
        }

        // Technique 3: Direct focus
        input.focus();
        
        // Technique 4: Click method (iOS sometimes needs this)
        if (typeof input.click === 'function') {
          input.click();
        }
        
        // Technique 5: Set selection range
        if (typeof input.setSelectionRange === 'function') {
          try {
            const len = input.value.length || 0;
            input.setSelectionRange(len, len);
          } catch (e) {
            // Ignore errors
          }
        }
        
        // Technique 6: Force blur then focus with click (sometimes triggers keyboard)
        setTimeout(() => {
          input.blur();
          setTimeout(() => {
            try {
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              input.dispatchEvent(clickEvent);
            } catch (e) {}
            input.focus();
            if (typeof input.click === 'function') {
              input.click();
            }
          }, 10);
        }, 50);
        
        console.log('⌨️ Auto-focused input to show keyboard in iPhone fullscreen mode');
      };

      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        triggerKeyboard();
      });
      
      // Multiple attempts with increasing delays
      const timeouts = [
        setTimeout(triggerKeyboard, 100),
        setTimeout(triggerKeyboard, 300),
        setTimeout(triggerKeyboard, 500),
        setTimeout(triggerKeyboard, 800),
        setTimeout(triggerKeyboard, 1000),
        setTimeout(triggerKeyboard, 1500),
      ];

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [isFullscreen, isLive]);

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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg max-w-sm w-full animate-fadeIn relative my-auto">
          <button className="absolute top-3 right-3 text-gray-600 hover:text-black transition" onClick={onClose} aria-label="Close">
            <FaTimes size={18} />
          </button>

          <h2 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-5 text-gray-900 pr-6 break-words">Share Live Stream</h2>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
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
    loadLiveKit().then(setLiveKitReady);

    return () => {
      // Cleanup function - ensure all resources are properly released
      // NOTE: this only runs when leaving the host screen entirely.
      // The logical "end" of a stream is controlled by endStream().
      try {
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }
        if (liveKitRoom) {
          liveKitRoom.disconnect().catch(err => console.error('Error disconnecting LiveKit:', err));
        }
        if (socket) {
          socket.disconnect();
        }
        if (trackCheckIntervalRef.current) {
          clearInterval(trackCheckIntervalRef.current);
          trackCheckIntervalRef.current = null;
        }
      } catch (error) {
        console.error('Cleanup error:', error);
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
      const newComment = {
        _id: data._id || data.id, // ✅ Use _id or fall back to id
        id: data.id || data._id,   // ✅ Include both for compatibility
        username: data.username || 'Viewer',
        text: data.text,
        timestamp: new Date(),
        replies: [] // ✅ Initialize replies array
      };

      // Add to sidebar comments
      setComments(prev => [...prev, newComment]);

      // Add to overlay comments (for video screen display)
      setOverlayComments(prev => {
        const updated = [...prev, { ...newComment, overlayId: Date.now() + Math.random() }];
        // Keep only last 10 comments in overlay to avoid clutter
        return updated.slice(-10);
      });
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

  const persistActiveHostStream = (payload) => {
    try {
      localStorage.setItem(ACTIVE_HOST_STREAM_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not persist active host stream:', e);
    }
  };

  const clearActiveHostStream = () => {
    try {
      localStorage.removeItem(ACTIVE_HOST_STREAM_KEY);
    } catch (e) {
      console.warn('Could not clear active host stream:', e);
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

      // Enhanced LocalTrackPublished handler for camera
      room.on(RoomEvent.LocalTrackPublished, (publication) => {
        if (publication.source === Track.Source.Camera) {
          console.log('📹 Camera track published');
          const localVideoTrack = publication.track;
          if (localVideoTrack && localVideoTrack.mediaStreamTrack && videoRef.current) {
            // Use the helper function to attach video
            attachVideoStream(localVideoTrack);
          }
        }
      });

      // Also listen for track updates (when camera is toggled)
      room.on(RoomEvent.LocalTrackUnpublished, (publication) => {
        if (publication.source === Track.Source.Camera) {
          console.log('📹 Camera track unpublished');
          // Don't clear the video, keep last frame
        }
      });

      // Fallback: Ensure video is attached after a delay (in case event didn't fire)
      setTimeout(() => {
        const camPublication = room.localParticipant.getTrackPublication(Track.Source.Camera);
        if (camPublication && camPublication.track && camPublication.track.mediaStreamTrack) {
          // Use the helper function for consistency
          attachVideoStream(camPublication.track);
        }
      }, 1000);

      // Store room reference for camera toggle
      setLiveKitRoom(room);

      // Set up listener for track updates when camera is toggled
      const updateVideoOnTrackChange = () => {
        const camPublication = room.localParticipant.getTrackPublication(Track.Source.Camera);
        if (camPublication && camPublication.track && camPublication.track.mediaStreamTrack && videoRef.current) {
          const isEnabled = !camPublication.isMuted && camPublication.track.mediaStreamTrack.enabled;
          if (isEnabled) {
            // Use the helper function to attach video
            attachVideoStream(camPublication.track);
          }
        }
      };

      // Poll for track changes when camera is toggled (LiveKit doesn't always fire events reliably)
      // Reduced interval for faster response
      trackCheckIntervalRef.current = setInterval(updateVideoOnTrackChange, 300);

      // Cleanup interval on disconnect
      room.on(RoomEvent.Disconnected, () => {
        if (trackCheckIntervalRef.current) {
          clearInterval(trackCheckIntervalRef.current);
          trackCheckIntervalRef.current = null;
        }
      });
      setViewerCount(0);
      setIsLive(true);

      // Persist session so host can return to this stream after navigating away
      persistActiveHostStream({
        streamId: data.streamId,
        roomUrl: data.roomUrl,
        publishToken: data.publishToken,
        title: data.stream?.title || title.trim(),
        startedAt: Date.now()
      });
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

    // Handle page refresh/close (works on desktop and mobile browsers)
    const handleBeforeUnload = (e) => {
      // Modern browsers require preventDefault and returnValue
      e.preventDefault();
      // Custom message (most browsers show their own generic message, but we set this for compatibility)
      const message = 'You are currently live! Leaving this page will end your stream. Are you sure you want to leave?';
      e.returnValue = message;
      return message;
    };

    // Handle browser back button (works on mobile and desktop)
    const blockBackNavigation = (e) => {
      if (isBlockingNavigationRef.current) {
        // Already showing modal, don't push another state
        return;
      }
      isBlockingNavigationRef.current = true;
      // Push a new state to prevent navigation
      window.history.pushState(null, '', window.location.href);
      // Show confirmation modal
      setShowConfirmEnd(true);
      // Reset blocking flag after a short delay to allow for future back button presses
      setTimeout(() => {
        isBlockingNavigationRef.current = false;
      }, 100);
    };

    // Add history state to track back button when going live
    window.history.pushState(null, '', window.location.href);

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', blockBackNavigation);

    // For mobile browsers, also handle pagehide (iOS Safari)
    const handlePageHide = (e) => {
      if (isLive) {
        // On iOS, we can't prevent navigation, but we can show a warning
        // The beforeunload should handle most cases
        console.warn('Page is being hidden - stream may end');
      }
    };

    window.addEventListener('pagehide', handlePageHide);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', blockBackNavigation);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isLive]);

  // Auto-resume hosting if there is an active host session saved.
  // This lets the host navigate to other tabs (e.g. Profile) and come back.
  useEffect(() => {
    const saved = localStorage.getItem(ACTIVE_HOST_STREAM_KEY);
    if (!saved || isLive || !liveKitReady) return;

    const resume = async () => {
      try {
        const session = JSON.parse(saved);
        if (!session?.streamId || !session?.roomUrl || !session?.publishToken) {
          clearActiveHostStream();
          return;
        }

        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');

        // Fetch latest stream details so UI is up to date
        const streamRes = await fetch(`${API_BASE_URL}/live/${session.streamId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });

        if (!streamRes.ok) {
          clearActiveHostStream();
          return;
        }

        const streamInfo = await streamRes.json();
        // Ensure streamData has streamId field (API might return _id)
        const normalizedStreamData = {
          ...streamInfo,
          streamId: streamInfo.streamId || streamInfo._id || session.streamId,
          stream: streamInfo.stream || streamInfo,
          // Preserve other fields that might be needed
          roomUrl: session.roomUrl,
          publishToken: session.publishToken
        };
        console.log('✅ Resuming stream with data:', normalizedStreamData);
        setStreamData(normalizedStreamData);

        if (!localStream) {
          await startCameraPreview();
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

        await room.connect(session.roomUrl, session.publishToken);
        console.log('✅ Reconnected to LiveKit room as host (resume)');

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
            if (localVideoTrack && localVideoTrack.mediaStreamTrack && videoRef.current) {
              attachVideoStream(localVideoTrack);
            }
          }
        });

        room.on(RoomEvent.LocalTrackUnpublished, (publication) => {
          if (publication.source === Track.Source.Camera) {
            // keep last frame
          }
        });

        const updateVideoOnTrackChange = () => {
          const camPublication = room.localParticipant.getTrackPublication(Track.Source.Camera);
          if (camPublication && camPublication.track && camPublication.track.mediaStreamTrack && videoRef.current) {
            const enabled = !camPublication.isMuted && camPublication.track.mediaStreamTrack.enabled;
            if (enabled) {
              attachVideoStream(camPublication.track);
            }
          }
        };

        trackCheckIntervalRef.current = setInterval(updateVideoOnTrackChange, 300);
        room.on(RoomEvent.Disconnected, () => {
          if (trackCheckIntervalRef.current) {
            clearInterval(trackCheckIntervalRef.current);
            trackCheckIntervalRef.current = null;
          }
        });

        setLiveKitRoom(room);
        setIsLive(true);
      } catch (err) {
        console.error('Error resuming host stream:', err);
        clearActiveHostStream();
      } finally {
        setLoading(false);
      }
    };

    resume();
  }, [isLive, liveKitReady]);

  const endStream = async () => {
    console.log('🛑 endStream function called');
    console.log('Current state:', { isLive, streamData: !!streamData, liveKitRoom: !!liveKitRoom });
    
    // Get streamId from streamData or fallback to localStorage session
    let streamId = streamData?.streamId || streamData?._id;

    if (!streamId) {
      console.log('⚠️ streamId not found in streamData, checking localStorage...');
      // Fallback: try to get from saved session
      const saved = localStorage.getItem(ACTIVE_HOST_STREAM_KEY);
      if (saved) {
        try {
          const session = JSON.parse(saved);
          streamId = session.streamId;
          console.log('✅ Found streamId in localStorage:', streamId);
        } catch (e) {
          console.error('Failed to parse saved session:', e);
        }
      }
    }

    if (!streamId) {
      console.error('❌ Cannot end stream: streamId not found');
      console.error('streamData:', streamData);
      setError('Cannot end stream: stream ID not found');
      return;
    }

    console.log('🛑 Ending stream with streamId:', streamId);
    const token = localStorage.getItem('token');

    try {
      console.log('📡 Sending end stream request to:', `${API_BASE_URL}/live/${streamId}/end`);
      const response = await fetch(`${API_BASE_URL}/live/${streamId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      console.log('📡 Response status:', response.status, response.ok);

      if (!response.ok) {
        const err = await response.json();
        console.error('❌ Failed to end stream:', err);
        throw new Error(err.msg || 'Failed to end stream');
      }

      console.log('✅ Stream ended successfully on server');

      if (liveKitRoom) {
        console.log('🔌 Disconnecting from LiveKit room...');
        // Cleanup track check interval
        if (trackCheckIntervalRef.current) {
          clearInterval(trackCheckIntervalRef.current);
          trackCheckIntervalRef.current = null;
        }
        await liveKitRoom.disconnect();
        setLiveKitRoom(null);
        console.log('✅ LiveKit room disconnected');
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
        // Emit leave-stream before disconnecting to notify viewers
        socket.emit('leave-stream', { streamId });
        // Small delay to ensure the event is sent before disconnecting
        setTimeout(() => {
          socket.disconnect();
          setSocket(null);
        }, 100);
      } else {
        setSocket(null);
      }

      // Reset all state
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
      setOverlayComments([]);

      // Clear saved host session so the app stops showing the "return to live" UI
      clearActiveHostStream();

      // Navigate back after a small delay to ensure cleanup completes
      setTimeout(() => {
        onBack();
      }, 200);

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

  const attachVideoStream = (track) => {
    if (!videoRef.current || !track || !track.mediaStreamTrack) return false;

    try {
      const mediaStream = new MediaStream([track.mediaStreamTrack]);

      // Check if this is the same track already attached
      const currentSrc = videoRef.current.srcObject;
      if (currentSrc && currentSrc.getTracks().length > 0) {
        const currentTrackId = currentSrc.getTracks()[0].id;
        const newTrackId = track.mediaStreamTrack.id;
        if (currentTrackId === newTrackId) {
          console.log('✅ Same track already attached, skipping');
          return true;
        }
      }

      // Clear previous stream tracks (but don't stop them, LiveKit manages that)
      if (currentSrc) {
        currentSrc.getTracks().forEach(t => {
          if (t.id !== track.mediaStreamTrack.id) {
            t.stop();
          }
        });
      }

      // Set new stream
      videoRef.current.srcObject = mediaStream;
      videoRef.current.muted = true;
      videoRef.current.style.objectFit = 'cover';
      videoRef.current.style.objectPosition = 'center';

      // Play the video
      videoRef.current.play()
        .then(() => {
          console.log('✅ Video stream attached and playing');
          if (localVideoRef.current) {
            localVideoRef.current.style.display = 'none';
          }
        })
        .catch(err => {
          console.error('Video play error:', err);
          // Retry play after a short delay
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.play().catch(e => console.error('Retry play error:', e));
            }
          }, 100);
        });

      return true;
    } catch (error) {
      console.error('Error attaching video stream:', error);
      return false;
    }
  };

  const toggleCamera = async () => {
    if (liveKitRoom && isLive) {
      try {
        const isEnabled = liveKitRoom.localParticipant.isCameraEnabled;
        const newState = !isEnabled;

        console.log(`📹 Toggling camera: ${isEnabled ? 'OFF' : 'ON'}`);

        // Update state immediately for UI responsiveness
        setIsCameraOn(newState);

        // Toggle camera in LiveKit
        await liveKitRoom.localParticipant.setCameraEnabled(newState);

        // If camera is being enabled, wait for track and attach
        if (newState) {
          // Use multiple strategies to ensure we get the track
          let attempts = 0;
          const maxAttempts = 15;
          let attached = false;

          const tryAttachVideo = () => {
            if (attached) return; // Already attached, stop retrying

            attempts++;
            const camPublication = liveKitRoom.localParticipant.getTrackPublication(Track.Source.Camera);

            if (camPublication && camPublication.track && camPublication.track.mediaStreamTrack) {
              const track = camPublication.track;
              const isTrackEnabled = track.mediaStreamTrack.enabled && !camPublication.isMuted;

              if (isTrackEnabled) {
                const success = attachVideoStream(track);
                if (success) {
                  console.log('✅ Camera enabled and video attached');
                  attached = true;
                  return;
                }
              } else {
                console.log('⏳ Track not yet enabled, waiting...');
              }
            } else {
              console.log(`⏳ Track not available yet (attempt ${attempts}/${maxAttempts})`);
            }

            // Retry if not successful and haven't exceeded max attempts
            if (attempts < maxAttempts && !attached) {
              setTimeout(tryAttachVideo, 150);
            } else if (!attached) {
              console.warn('⚠️ Could not attach video after multiple attempts, trying final recovery...');
              // Final recovery attempt with longer delay
              setTimeout(() => {
                const finalPublication = liveKitRoom.localParticipant.getTrackPublication(Track.Source.Camera);
                if (finalPublication && finalPublication.track && finalPublication.track.mediaStreamTrack) {
                  const finalTrack = finalPublication.track;
                  if (finalTrack.mediaStreamTrack.enabled && !finalPublication.isMuted) {
                    attachVideoStream(finalTrack);
                  }
                }
              }, 800);
            }
          };

          // Start trying with progressive delays
          setTimeout(tryAttachVideo, 50);
          setTimeout(tryAttachVideo, 200);
          setTimeout(tryAttachVideo, 400);
          setTimeout(tryAttachVideo, 600);
        } else {
          // Camera is being disabled
          console.log('📹 Camera disabled');
          // Keep the last frame visible, don't clear the video
          // The video element will show the last frame
        }
      } catch (error) {
        console.error('Error toggling camera:', error);
        setError('Failed to toggle camera. Please try again.');
        // Revert state on error
        const currentState = liveKitRoom.localParticipant.isCameraEnabled;
        setIsCameraOn(currentState);
      }
    } else if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);

        // If camera is being enabled, ensure video element is visible and playing
        if (videoTrack.enabled && localVideoRef.current) {
          localVideoRef.current.style.display = 'block';
          localVideoRef.current.play().catch(err => console.error('Video play error:', err));
        }
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

  // Detect iOS device
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // const toggleFullscreen = async () => {
  //   if (!videoContainerRef.current) return;

  //   try {
  //     if (!isFullscreen) {
  //       // For iOS, use CSS-based fullscreen since container fullscreen API doesn't work
  //       if (isIOS) {
  //         // iOS doesn't support container fullscreen API, use CSS approach
  //         videoContainerRef.current.classList.add('ios-fullscreen');
  //         document.body.style.overflow = 'hidden';
  //         setIsFullscreen(true);
  //         return;
  //       }

  //       // For other browsers, use native fullscreen API
  //       if (videoContainerRef.current.requestFullscreen) {
  //         await videoContainerRef.current.requestFullscreen();
  //       } else if (videoContainerRef.current.webkitRequestFullscreen) {
  //         await videoContainerRef.current.webkitRequestFullscreen();
  //       } else if (videoContainerRef.current.mozRequestFullScreen) {
  //         await videoContainerRef.current.mozRequestFullScreen();
  //       } else if (videoContainerRef.current.msRequestFullscreen) {
  //         await videoContainerRef.current.msRequestFullscreen();
  //       } else {
  //         // Fallback to CSS-based fullscreen if API not available
  //         videoContainerRef.current.classList.add('ios-fullscreen');
  //         document.body.style.overflow = 'hidden';
  //       }
  //       setIsFullscreen(true);
  //     } else {
  //       // Exit fullscreen
  //       if (isIOS) {
  //         // Remove CSS-based fullscreen for iOS
  //         videoContainerRef.current.classList.remove('ios-fullscreen');
  //         document.body.style.overflow = '';
  //         setIsFullscreen(false);
  //         return;
  //       }

  //       // For other browsers, use native exit fullscreen
  //       if (document.exitFullscreen) {
  //         await document.exitFullscreen();
  //       } else if (document.webkitExitFullscreen) {
  //         await document.webkitExitFullscreen();
  //       } else if (document.mozCancelFullScreen) {
  //         await document.mozCancelFullScreen();
  //       } else if (document.msExitFullscreen) {
  //         await document.msExitFullscreen();
  //       } else {
  //         // Fallback: remove CSS-based fullscreen
  //         videoContainerRef.current.classList.remove('ios-fullscreen');
  //         document.body.style.overflow = '';
  //       }
  //       setIsFullscreen(false);
  //     }
  //   } catch (error) {
  //     console.error('Fullscreen error:', error);
  //     // Fallback to CSS-based fullscreen on error
  //     if (!isFullscreen) {
  //       videoContainerRef.current.classList.add('ios-fullscreen');
  //       document.body.style.overflow = 'hidden';
  //       setIsFullscreen(true);
  //     } else {
  //       videoContainerRef.current.classList.remove('ios-fullscreen');
  //       document.body.style.overflow = '';
  //       setIsFullscreen(false);
  //     }
  //   }
  // };

  const toggleFullscreen = async () => {
    const container = videoContainerRef.current;
    const videoEl = videoRef.current || localVideoRef.current;

    if (!container && !videoEl) return;

    // More specific iOS detection (excludes iPad and Mac with touchscreen)
    const isIPhone = /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isIPad = /iPad/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    try {
      if (!isFullscreen) {
        // iPhone-specific: Use enhanced CSS fullscreen
        if (isIPhone) {
          // Scroll to top first to hide address bar
          window.scrollTo(0, 1);

          // Add fullscreen classes
          container.classList.add('ios-fullscreen');
          document.body.classList.add('ios-fullscreen-active');
          document.documentElement.classList.add('ios-fullscreen-active');

          // Force viewport height calculation
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty('--vh', `${vh}px`);

          // Prevent body scroll
          document.body.style.position = 'fixed';
          document.body.style.top = '0';
          document.body.style.left = '0';
          document.body.style.right = '0';
          document.body.style.bottom = '0';

          setIsFullscreen(true);

          // Request orientation lock if available
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {
              console.log('Orientation lock not available');
            });
          }

          return;
        }

        // iPad and desktop: Try native fullscreen first
        if (screenfull.isEnabled && container) {
          await screenfull.toggle(container);
          setIsFullscreen(screenfull.isFullscreen);
          return;
        }

        // Standard fullscreen API
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          await container.webkitRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
          await container.mozRequestFullScreen();
        } else if (container.msRequestFullscreen) {
          await container.msRequestFullscreen();
        }

        setIsFullscreen(true);

      } else {
        // Exit fullscreen
        if (isIPhone) {
          container.classList.remove('ios-fullscreen');
          document.body.classList.remove('ios-fullscreen-active');
          document.documentElement.classList.remove('ios-fullscreen-active');

          // Restore body scroll
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.left = '';
          document.body.style.right = '';
          document.body.style.bottom = '';

          // Unlock orientation
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }

          setIsFullscreen(false);
          return;
        }

        if (screenfull.isEnabled && screenfull.isFullscreen) {
          await screenfull.exit();
          setIsFullscreen(false);
          return;
        }

        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }

        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Listen for fullscreen changes and ESC key
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    const handleKeyDown = (e) => {
      // Exit fullscreen on ESC key
      if (e.key === 'Escape') {
        const isCurrentlyFullscreen = !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
        );
        if (isCurrentlyFullscreen) {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
        } else if (isFullscreen && isIOS) {
          // Exit iOS CSS-based fullscreen
          if (videoContainerRef.current) {
            videoContainerRef.current.classList.remove('ios-fullscreen');
            document.body.style.overflow = '';
            setIsFullscreen(false);
          }
        }
      }
    };

    // Standard fullscreen events for all browsers (including iOS)
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);

      // Cleanup iOS fullscreen on unmount
      if (videoContainerRef.current && isIOS) {
        document.body.classList.remove('ios-fullscreen-active');
        videoContainerRef.current.classList.remove('ios-fullscreen');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    };
  }, [isFullscreen, isIOS]);

  // Auto-remove overlay comments after 5 seconds
  useEffect(() => {
    if (overlayComments.length === 0) return;

    const timeouts = overlayComments.map((comment) => {
      return setTimeout(() => {
        setOverlayComments(prev => prev.filter(c => c.overlayId !== comment.overlayId));
      }, 5000); // Remove after 5 seconds
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [overlayComments.length]);

  // Debug: Log when showConfirmEnd changes
  useEffect(() => {
    console.log('🔔 showConfirmEnd state changed:', showConfirmEnd);
  }, [showConfirmEnd]);

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
  @keyframes slideInRight {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideInLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
  }
  
  /* Comment bubble animation - appears then fades out after 5 seconds */
  .comment-bubble {
    animation: slideInLeft 0.3s ease-out, fadeOut 0.5s ease-in 4.5s forwards !important;
  }
  
  /* Native fullscreen styles for desktop/iPad */
  :fullscreen {
    background: #000;
  }
  :-webkit-full-screen {
    background: #000;
  }
  :-moz-full-screen {
    background: #000;
  }
  :-ms-fullscreen {
    background: #000;
  }
  
  .fullscreen-video-container:fullscreen,
  .fullscreen-video-container:-webkit-full-screen,
  .fullscreen-video-container:-moz-full-screen,
  .fullscreen-video-container:-ms-fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    border-radius: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    z-index: 9999 !important;
  }
  
  .fullscreen-video-container:fullscreen video,
  .fullscreen-video-container:-webkit-full-screen video,
  .fullscreen-video-container:-moz-full-screen video,
  .fullscreen-video-container:-ms-fullscreen video {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
    position: relative;
  }
  
  /* iPhone-specific CSS fullscreen */
  html.ios-fullscreen-active {
    overflow: hidden !important;
    position: fixed !important;
    width: 100% !important;
    height: 100% !important;
    -webkit-overflow-scrolling: touch !important;
  }
  
  body.ios-fullscreen-active {
    overflow: hidden !important;
    position: fixed !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    -webkit-overflow-scrolling: touch !important;
  }
  
  .fullscreen-video-container.ios-fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    height: calc(var(--vh, 1vh) * 100) !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    margin: 0 !important;
    padding: 0 !important;
    z-index: 2147483647 !important; /* Maximum z-index */
    border-radius: 0 !important;
    background: #000 !important;
    transform: none !important;
    -webkit-transform: translate3d(0,0,0) !important;
    transform: translate3d(0,0,0) !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
  }
  
  .fullscreen-video-container.ios-fullscreen video {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: cover !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    -webkit-transform: translate3d(0,0,0) !important;
    transform: translate3d(0,0,0) !important;
    pointer-events: none !important;
  }
  
  /* Ensure buttons are above video */
  .fullscreen-video-container.ios-fullscreen button {
    pointer-events: auto !important;
  }
  
  /* Ensure all overlays work in iOS fullscreen with maximum z-index */
  .fullscreen-video-container.ios-fullscreen > * {
    position: relative !important;
    z-index: 2147483646 !important;
  }
  
  .fullscreen-video-container.ios-fullscreen .absolute {
    position: absolute !important;
    z-index: 2147483646 !important;
  }
  
  /* Comment overlay specific */
  .fullscreen-video-container.ios-fullscreen .comment-overlay {
    position: absolute !important;
    z-index: 2147483646 !important;
    -webkit-transform: translate3d(0,0,0) !important;
    transform: translate3d(0,0,0) !important;
  }
  
  /* Buttons in fullscreen */
  .fullscreen-video-container.ios-fullscreen button {
    position: absolute !important;
    z-index: 2147483647 !important;
    pointer-events: auto !important;
    -webkit-transform: translate3d(0,0,0) !important;
    transform: translate3d(0,0,0) !important;
    -webkit-tap-highlight-color: transparent !important;
    touch-action: manipulation !important;
  }
  
  /* Ensure End Stream button is always clickable */
  .fullscreen-video-container.ios-fullscreen button[title="End Stream"] {
    z-index: 2147483647 !important;
    pointer-events: auto !important;
    cursor: pointer !important;
    -webkit-user-select: none !important;
    user-select: none !important;
  }
  
  /* Safari-specific height handling */
  @supports (-webkit-touch-callout: none) {
    .ios-fullscreen-active {
      height: 100vh;
      height: -webkit-fill-available;
    }
    
    .fullscreen-video-container.ios-fullscreen {
      height: 100vh;
      height: -webkit-fill-available;
      min-height: -webkit-fill-available;
    }
  }
  
  /* Prevent iOS Safari from adding extra space */
  @media screen and (max-width: 768px) {
    .fullscreen-video-container.ios-fullscreen {
      -webkit-overflow-scrolling: touch;
    }
  }
  
  /* Ensure parent containers don't interfere with iPhone fullscreen */
  html.ios-fullscreen-active,
  body.ios-fullscreen-active {
    height: 100vh !important;
    height: calc(var(--vh, 1vh) * 100) !important;
    overflow: hidden !important;
    position: fixed !important;
    width: 100% !important;
  }
  
  /* Hide all content except the fullscreen video container on iPhone */
  body.ios-fullscreen-active > div.min-h-screen {
    overflow: hidden !important;
  }
  
  body.ios-fullscreen-active .max-w-7xl {
    display: none !important;
  }
  
  body.ios-fullscreen-active .bg-white\\/70 {
    display: none !important;
  }
  
  /* Ensure modals are always on top of fullscreen container */
  body.ios-fullscreen-active [class*="fixed"][class*="inset-0"] {
    z-index: 2147483647 !important;
    position: fixed !important;
    pointer-events: auto !important;
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-[#FFC0CB] border border-[#ff99b3] rounded-2xl p-4 sm:p-6 max-w-md w-full my-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 pr-2 break-words">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
                  Stream Earnings
                </h3>
                <button
                  onClick={() => setShowEarningsModal(false)}
                  className="text-gray-700 hover:text-black transition flex-shrink-0" aria-label="Close"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white/70 border border-[#ff99b3] rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-700 mb-1">Total Earnings</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600 break-words">{coinBalance} coins</p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-white/70 border border-[#ff99b3] rounded-lg p-2.5 sm:p-3">
                    <p className="text-xs text-gray-700 mb-1">Paid Viewers</p>
                    <p className="text-lg sm:text-xl font-semibold">{paidViewersCount}</p>
                  </div>
                  <div className="bg-white/70 border border-[#ff99b3] rounded-lg p-2.5 sm:p-3">
                    <p className="text-xs text-gray-700 mb-1">Tips Received</p>
                    <p className="text-lg sm:text-xl font-semibold">{tips.length}</p>
                  </div>
                </div>

                <div className="bg-white/70 border border-[#ff99b3] rounded-lg p-3 max-h-40 overflow-y-auto">
                  <p className="text-xs sm:text-sm font-semibold mb-2">Recent Tips</p>
                  {tips.slice(-5).reverse().map((tip) => (
                    <div key={tip.id} className="flex items-center justify-between py-1 text-xs sm:text-sm">
                      <span className="break-words pr-2">{tip.username}</span>
                      <span className="text-yellow-700 flex-shrink-0">+{tip.amount}</span>
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
                ref={videoContainerRef}
                className="bg-black rounded-lg mb-4 relative overflow-hidden fullscreen-video-container"
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

                {/* Fullscreen Button - Top Right */}
                {/* Fullscreen Button - Top Right - Hidden on iPhone since it auto-opens */}
                {!(/iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) && (
                  <button
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 z-50 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all backdrop-blur-md shadow-lg border border-white/20"
                    style={{ zIndex: 50 }}
                    title={isFullscreen ? 'Exit Fullscreen (Press ESC)' : 'Enter Fullscreen'}
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                )}

                {/* Live Chat Indicator */}
                {overlayComments.length > 0 && (
                  <div className="absolute top-4 left-4 z-25 bg-gradient-to-r from-pink-600 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Live Chat</span>
                  </div>
                )}

                {/* Comments Overlay - Instagram style - Show for iPhone fullscreen too */}
                {isFullscreen && !showFullscreenControls && (
                  <div
                    className="comment-overlay"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '320px',
                      maxWidth: '85%',
                      maxHeight: '70%',
                      padding: '1rem',
                      overflow: 'hidden',
                      zIndex: 2147483646,
                      pointerEvents: 'none',
                      transform: 'translate3d(0,0,0)',
                      WebkitTransform: 'translate3d(0,0,0)'
                    }}
                  >
                    <div className="flex flex-col gap-2 items-start">
                      {overlayComments.map((comment, index) => (
                        <div
                          key={comment.overlayId || comment.id}
                          className="bg-black/75 backdrop-blur-md text-white px-3 py-2 rounded-full pointer-events-auto shadow-lg border border-white/10 comment-bubble"
                          style={{
                            animation: 'slideInLeft 0.3s ease-out, fadeOut 0.5s ease-in 4.5s forwards',
                            maxWidth: '100%',
                            fontSize: '0.9rem',
                            transform: 'translate3d(0,0,0)',
                            WebkitTransform: 'translate3d(0,0,0)'
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {comment.username?.charAt(0)?.toUpperCase() || 'V'}
                            </div>
                            <span className="font-semibold text-pink-300">{comment.username}</span>
                            <span className="text-white/90">{comment.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* iPhone Fullscreen Controls Panel */}
                {isFullscreen && (/iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) && (
                  <>
                
    {/* Floating Comment Input - Always Visible with Keyboard */}
         {/* Floating Comment Input - Always Visible with Keyboard */}
<div 
  className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/20 p-3 z-50"
  style={{ zIndex: 2147483647 }}
  // Make whole bar tappable → focuses input → opens keyboard
  onClick={(e) => {
    if (fullscreenInputRef.current && e.target !== fullscreenInputRef.current) {
      fullscreenInputRef.current.focus();
      fullscreenInputRef.current.click();
    }
  }}
>
  <div className="flex items-center gap-2">
    <input
      ref={fullscreenInputRef}
      type="text"
      inputMode="text"
      enterKeyHint="send"
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck="false"
      value={fullscreenComment}
      onChange={(e) => setFullscreenComment(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && fullscreenComment.trim() && socket) {
          e.preventDefault();
          socket.emit('send-comment', {
            streamId: streamData.streamId,
            text: fullscreenComment.trim()
          });
          setFullscreenComment('');
        }
      }}
      placeholder="Type a message..."
      className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
      // Remove autoFocus – it can interfere on iOS
    />
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent parent onClick from re-focusing
        if (fullscreenComment.trim() && socket) {
          socket.emit('send-comment', {
            streamId: streamData.streamId,
            text: fullscreenComment.trim()
          });
          setFullscreenComment('');
          // Refocus after sending
          setTimeout(() => fullscreenInputRef.current?.focus(), 100);
        }
      }}
      disabled={!fullscreenComment.trim()}
      className="bg-pink-600 text-white p-2.5 rounded-full hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0"
    >
      <Send className="w-5 h-5" />
    </button>
  </div>
</div>

    {/* Rest of iPhone controls continue here... */}
                    {/* Floating Menu Button */}
                    <button
  onClick={() => {
    setShowFullscreenControls(!showFullscreenControls);
    // When opening chat, immediately focus the input to trigger keyboard
    if (!showFullscreenControls && fullscreenInputRef.current) {
      setTimeout(() => {
        fullscreenInputRef.current?.focus();
        fullscreenInputRef.current?.click(); // Extra trigger for iOS
      }, 100);
    }
  }}
  className="absolute top-4 right-4 z-50 bg-black/80 hover:bg-black/90 text-white p-3 rounded-full transition-all backdrop-blur-md shadow-lg border border-white/20"
  style={{ zIndex: 2147483646 }}
>
  {showFullscreenControls ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
</button>

                    {/* Camera/Mic Controls - Always Visible */}
                    <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-3" style={{ zIndex: 2147483646 }}>
                      <button
                        onClick={toggleCamera}
                        className={`p-3 rounded-full transition-colors backdrop-blur-md shadow-lg border border-white/20 ${
                          isCameraOn ? 'bg-black/70 hover:bg-black/90 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                        title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                      >
                        {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={toggleMic}
                        className={`p-3 rounded-full transition-colors backdrop-blur-md shadow-lg border border-white/20 ${
                          isMicOn ? 'bg-black/70 hover:bg-black/90 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                        title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
                      >
                        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* End Stream Button - More Prominent */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('End Stream button clicked');
                        // On iPhone, directly end stream without confirmation modal (modal might not show in fullscreen)
                        const isIPhone = /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                        if (isIPhone && isFullscreen) {
                          console.log('iPhone fullscreen detected - ending stream directly');
                          endStream();
                        } else {
                          console.log('Setting showConfirmEnd to true');
                          setShowConfirmEnd(true);
                        }
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('End Stream button touched');
                        // On iPhone, directly end stream without confirmation modal
                        const isIPhone = /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                        if (isIPhone && isFullscreen) {
                          console.log('iPhone fullscreen detected - ending stream directly');
                          endStream();
                        } else {
                          console.log('Setting showConfirmEnd to true');
                          setShowConfirmEnd(true);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="absolute top-4 left-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-2 rounded-full transition-all backdrop-blur-md shadow-lg border-2 border-white/30 flex items-center gap-2 font-semibold"
                      style={{ 
                        zIndex: 2147483647,
                        pointerEvents: 'auto',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                        cursor: 'pointer',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                      }}
                      title="End Stream"
                      aria-label="End Stream"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm">End Stream</span>
                    </button>

                    {/* Control Panel - Slides in from right */}
                    {/* Control Panel - Slides in from right */}
                    {showFullscreenControls && (
                      <div
                        className="absolute top-0 right-0 h-full w-full max-w-md bg-black/95 backdrop-blur-xl text-white z-50 flex flex-col"
                        style={{
                          zIndex: 2147483647,
                          animation: 'slideInRight 0.3s ease-out',
                          transform: 'translate3d(0,0,0)',
                          WebkitTransform: 'translate3d(0,0,0)',
                          overflow: 'hidden'
                        }}
                      >
                        <div className="p-4 border-b border-white/20">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold">Stream Controls</h3>
                            <button
                              onClick={() => setShowFullscreenControls(false)}
                              className="p-2 hover:bg-white/10 rounded-full transition"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          {/* Coins Earned Display */}
                          <div className="bg-white/10 border border-white/20 rounded-lg p-2 mt-2">
                            <p className="text-xs text-white/70">Total Coins Earned</p>
                            <p className="text-lg font-semibold text-yellow-400">{coinBalance} coins</p>
                          </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-white/20">
                          <button
                            onClick={() => setActiveFullscreenTab('chat')}
                            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                              activeFullscreenTab === 'chat' ? 'bg-white/10 border-b-2 border-pink-500' : 'hover:bg-white/5'
                            }`}
                          >
                            <MessageCircle className="w-4 h-4 inline mr-2" />
                            Chat
                          </button>
                          <button
                            onClick={() => setActiveFullscreenTab('products')}
                            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                              activeFullscreenTab === 'products' ? 'bg-white/10 border-b-2 border-pink-500' : 'hover:bg-white/5'
                            }`}
                          >
                            <Gift className="w-4 h-4 inline mr-2" />
                            Products
                          </button>
                          <button
                            onClick={() => setActiveFullscreenTab('orders')}
                            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                              activeFullscreenTab === 'orders' ? 'bg-white/10 border-b-2 border-pink-500' : 'hover:bg-white/5'
                            }`}
                          >
                            📦 Orders
                          </button>
                          <button
                            onClick={() => setActiveFullscreenTab('gifts')}
                            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                              activeFullscreenTab === 'gifts' ? 'bg-white/10 border-b-2 border-pink-500' : 'hover:bg-white/5'
                            }`}
                          >
                            🎁 Gifts
                          </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto" style={{ 
                          WebkitOverflowScrolling: 'touch',
                          paddingBottom: 'env(safe-area-inset-bottom)'
                        }}>
                          <div className="p-4">
                          {/* Chat Tab */}
                          {activeFullscreenTab === 'chat' && (
                            <div className="space-y-4 h-full flex flex-col">
                              <div className="flex-1 overflow-y-auto space-y-3" style={{ 
                                maxHeight: 'calc(100vh - 350px)',
                                WebkitOverflowScrolling: 'touch'
                              }}>
                                {comments.map((c) => (
                                  <div key={c.id} className="space-y-2">
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <span className="font-semibold text-pink-300">@{c.username}: </span>
                                          <span className="text-white/90 text-sm">{c.text}</span>
                                        </div>
                                        <button
                                          onClick={() => setReplyingTo(c)}
                                          className="flex-shrink-0 text-pink-400 hover:text-pink-300 p-1 rounded transition"
                                        >
                                          <Reply className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                    {c.replies && c.replies.length > 0 && (
                                      <div className="ml-6 space-y-2">
                                        {c.replies.map((reply) => (
                                          <div
                                            key={reply._id || reply.id}
                                            className={`text-sm rounded-xl px-3 py-2 ${
                                              reply.isHost ? 'bg-pink-500/20 border border-pink-500/50' : 'bg-white/5'
                                            }`}
                                          >
                                            <div className="flex items-start gap-1">
                                              {reply.isHost && <span>👑</span>}
                                              <span className="font-semibold text-pink-300">@{reply.username}:</span>
                                              <span className="text-white/90">{reply.text}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {comments.length === 0 && (
                                  <div className="text-center text-white/50 py-8">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Waiting for comments...</p>
                                  </div>
                                )}
                                <div ref={commentsEndRef} />
                              </div>

                              {replyingTo && (
                                <div className="mb-2 flex items-center justify-between bg-pink-500/20 border border-pink-500/50 rounded-lg px-3 py-2">
                                  <span className="text-sm text-pink-300">
                                    Replying to <span className="font-semibold">@{replyingTo.username}</span>
                                  </span>
                                  <button
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyText('');
                                    }}
                                    className="text-pink-300 hover:text-pink-200"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              <div className="flex items-center gap-2 sticky bottom-0 bg-black/95 py-3 px-4 -mx-4">
                                <input
                                  ref={replyInputRef}
                                  type="text"
                                  inputMode="text"
                                  autoComplete="off"
                                  autoCapitalize="off"
                                  autoCorrect="off"
                                  spellCheck="false"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && replyingTo) {
                                      handleSendReply();
                                    }
                                  }}
                                  onFocus={(e) => {
                                    // Scroll input into view when focused on iPhone
                                    setTimeout(() => {
                                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }, 300);
                                  }}
                                  placeholder={replyingTo ? "Type your reply..." : "Click reply button on a comment"}
                                  disabled={!replyingTo}
                                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                                />
                                <button
                                  onClick={handleSendReply}
                                  disabled={!replyText.trim() || !replyingTo}
                                  className="bg-pink-600 text-white p-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                  <Send className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Products Tab */}
                          {activeFullscreenTab === 'products' && (
                            <div className="space-y-4 pb-8">
                              <h4 className="font-semibold text-lg mb-4">Add Product/Ad</h4>
                              
                              <select
                                value={newProduct.type}
                                onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 mb-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                              >
                                <option value="product" className="bg-black">Product</option>
                                <option value="ad" className="bg-black">Ad</option>
                              </select>

                              <input
                                placeholder="Name"
                                inputMode="text"
                                autoComplete="off"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                onFocus={(e) => {
                                  setTimeout(() => {
                                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }, 300);
                                }}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 mb-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                              />

                              <input
                                placeholder="Description"
                                inputMode="text"
                                autoComplete="off"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                onFocus={(e) => {
                                  setTimeout(() => {
                                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }, 300);
                                }}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 mb-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                              />

                              <input
                                type="number"
                                inputMode="decimal"
                                placeholder="Price"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                                onFocus={(e) => {
                                  setTimeout(() => {
                                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }, 300);
                                }}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 mb-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                              />

                              <div className="mb-2">
                                <label className="block text-sm font-medium mb-1 text-white/80">Image</label>
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
                                  className="w-full text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-pink-600 file:text-white"
                                />
                                {newProduct.imagePreview && (
                                  <img
                                    src={newProduct.imagePreview}
                                    alt="Preview"
                                    className="mt-2 w-full h-48 object-cover rounded-lg"
                                  />
                                )}
                              </div>

                              <input
                                placeholder="Link (optional)"
                                inputMode="url"
                                autoComplete="off"
                                value={newProduct.link}
                                onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })}
                                onFocus={(e) => {
                                  setTimeout(() => {
                                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }, 300);
                                }}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 mb-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-semibold transition"
                              >
                                Add Item
                              </button>

                              <div className="mt-4">
                                <h5 className="font-semibold mb-2 text-white/80">Added Items ({products.length})</h5>
                                {products.length === 0 ? (
                                  <p className="text-white/50 text-sm">No items added yet</p>
                                ) : (
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {products.map((p, i) => (
                                      <div key={i} className="bg-white/10 rounded-lg p-2 flex items-center gap-3">
                                        {p.imageUrl && (
                                          <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded" />
                                        )}
                                        <div className="flex-1">
                                          <p className="font-medium text-white">{p.name}</p>
                                          <p className="text-sm text-white/70">${p.price}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Orders Tab - Keep as is */}
                          {/* Gifts Tab - Keep as is */}
                        </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="bg-white/70 border border-[#ff99b3] rounded-lg p-4 mb-4 flex items-center justify-center gap-4">
                <button
                  onClick={toggleCamera}
                  className={`p-4 rounded-full transition-colors ${isCameraOn ? 'bg-white border border-[#ff99b3] hover:bg-[#ffb3c6]' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                  title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
                <button
                  onClick={toggleMic}
                  className={`p-4 rounded-full transition-colors ${isMicOn ? 'bg-white border border-[#ff99b3] hover:bg-[#ffb3c6]' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                  title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>

                {/* Only show fullscreen toggle on non-iPhone devices */}
                {!(/iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) && (
                  <button
                    onClick={toggleFullscreen}
                    className="p-4 rounded-full transition-colors bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white shadow-lg"
                    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                  </button>
                )}
              </div>
              {/* iOS Fullscreen Indicator */}
              {isFullscreen && /iPad|iPhone|iPod/.test(navigator.userAgent) && (
                <div className="absolute top-16 right-4 z-50 bg-black/70 text-white px-3 py-2 rounded-full text-xs">
                  Swipe down to exit
                </div>
              )}

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
              console.log('✅ ConfirmEndModal onConfirm called');
              isBlockingNavigationRef.current = false;
              setShowConfirmEnd(false);
              endStream();
            }}
            onCancel={() => {
              console.log('❌ ConfirmEndModal onCancel called');
              isBlockingNavigationRef.current = false;
              setShowConfirmEnd(false);
            }}
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
            isBlockingNavigationRef.current = false;
            setShowConfirmEnd(false);
            endStream();
          }}
          onCancel={() => {
            isBlockingNavigationRef.current = false;
            setShowConfirmEnd(false);
          }}
        />
      )}
      {/* iPhone Fullscreen Toast */}
      {showFullscreenToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 backdrop-blur-md">
          <Maximize className="w-4 h-4" />
          <span className="text-sm font-medium">Opening in fullscreen...</span>
        </div>
      )}
    </div>

  );
};

export default HostLiveStream;