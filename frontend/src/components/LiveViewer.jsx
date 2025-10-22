// import React, { useState, useEffect, useRef } from 'react';
// import { Heart, MessageCircle, Share2, Users, Send, ArrowLeft, Camera } from 'lucide-react';
// import io from 'socket.io-client';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Room, RoomEvent, Track } from 'livekit-client';

// const LiveViewer = () => {
//   const { streamId } = useParams();
//   const navigate = useNavigate();

//   const [stream, setStream] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [viewers, setViewers] = useState(0);
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState('');
//   const [hearts, setHearts] = useState([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const [error, setError] = useState(null);
//   const [hasRequestedCohost, setHasRequestedCohost] = useState(false);
//   const [liveKitRoom, setLiveKitRoom] = useState(null);

//   const socketRef = useRef(null);
//   const videoRefs = useRef({});
//   const commentsEndRef = useRef(null);

//   const LIVEKIT_URL =
//     process.env.REACT_APP_LIVEKIT_URL || 'wss://theclipstream-q0jt88zr.livekit.cloud';

//   // Initialize socket and join stream
//   useEffect(() => {
//     const initializeStream = async () => {
//       try {
//         setIsLoading(true);

//         const response = await fetch(
//           `https://streammall-backend-73a4b072d5eb.herokuapp.com/api/live/${streamId}`,
//           { credentials: 'include' }
//         );

//         if (!response.ok) throw new Error('Stream not found');

//         const streamData = await response.json();
//         console.log('Fetched stream data:', streamData);
//         setStream(streamData);

//         const token = localStorage.getItem('token');
//         socketRef.current = io('https://streammall-backend-73a4b072d5eb.herokuapp.com', {
//           withCredentials: true,
//           auth: token ? { token } : {},
//         });

//         socketRef.current.on('connect', () => {
//           console.log('Socket connected');
//           setIsConnected(true);
//           socketRef.current.emit('join-stream', { streamId, isStreamer: false });
//         });

//         socketRef.current.on('disconnect', () => {
//           setIsConnected(false);
//         });

//         socketRef.current.on('joined-stream', async (data) => {
//           console.log('Joined stream data:', data);
//           setViewers(data.viewerCount);
//           setStream(data.stream);
//           setIsLoading(false);

//           const viewerToken = streamData.viewerToken || data.stream?.viewerToken;
//           const roomUrl = streamData.roomUrl || data.stream?.roomUrl || LIVEKIT_URL;

//           if (viewerToken) {
//             await connectToLiveKitRoom(roomUrl, viewerToken);
//           } else {
//             await fetchViewerToken();
//           }
//         });

//         socketRef.current.on('viewer-joined', (data) => setViewers(data.viewerCount));
//         socketRef.current.on('viewer-left', (data) => setViewers(data.viewerCount));
//         socketRef.current.on('new-comment', (comment) =>
//           setComments((prev) => [...prev, comment])
//         );
//         socketRef.current.on('heart-sent', () => addHeart());

//         socketRef.current.on('stream-ended', () => {
//           setError('This live stream has ended');
//           setTimeout(() => navigate('/'), 3000);
//         });

//         if (streamData.viewerToken) {
//           const roomUrl = streamData.roomUrl || LIVEKIT_URL;
//           await connectToLiveKitRoom(roomUrl, streamData.viewerToken);
//           setIsLoading(false);
//         }
//       } catch (err) {
//         console.error('Stream initialization error:', err);
//         setError(err.message);
//         setIsLoading(false);
//       }
//     };

//     initializeStream();

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.emit('leave-stream', { streamId });
//         socketRef.current.disconnect();
//       }
//       if (liveKitRoom) {
//         liveKitRoom.disconnect();
//       }
//       // Clean up audio elements
//       document.querySelectorAll('audio[data-participant]').forEach(el => el.remove());
//     };
//   }, [streamId, navigate]);

//   const fetchViewerToken = async () => {
//     try {
//       const response = await fetch(
//         `https://streammall-backend-73a4b072d5eb.herokuapp.com/api/live/${streamId}/token`,
//         { credentials: 'include' }
//       );
//       if (response.ok) {
//         const data = await response.json();
//         console.log('Fetched viewer token:', data);
//         await connectToLiveKitRoom(data.roomUrl, data.viewerToken);
//       }
//     } catch (error) {
//       console.error('Error fetching viewer token:', error);
//     }
//   };

//   // const connectToLiveKitRoom = async (roomUrl, viewerToken) => {
//   //   try {
//   //     if (!viewerToken || typeof viewerToken !== 'string') {
//   //       console.error('Invalid viewer token:', viewerToken);
//   //       setError('Invalid viewer token');
//   //       return;
//   //     }

//   //     console.log('Connecting to LiveKit as viewer:', {
//   //       roomUrl,
//   //       tokenLength: viewerToken.length,
//   //     });

//   //     const room = new Room();
//   //     await room.connect(roomUrl, viewerToken);
//   //     setLiveKitRoom(room);

//   //     // Subscribe to new remote tracks with FIXED AUDIO HANDLING
//   //     room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
//   //       console.log(
//   //         'Subscribed to track from:',
//   //         participant.identity,
//   //         'Kind:',
//   //         track.kind,
//   //         'Track enabled:',
//   //         track.mediaStreamTrack?.enabled
//   //       );

//   //       if (track.kind === Track.Kind.Video) {
//   //         let videoEl = videoRefs.current[participant.identity];
//   //         if (!videoEl) {
//   //           const containers = document.querySelectorAll('[data-participant-video]');
//   //           const availableContainer = Array.from(containers).find(
//   //             (c) => !c.querySelector('video[data-participant]')
//   //           );

//   //           if (availableContainer) {
//   //             videoEl = availableContainer.querySelector('video');
//   //             if (videoEl) {
//   //               videoEl.setAttribute('data-participant', participant.identity);
//   //               videoRefs.current[participant.identity] = videoEl;
//   //             }
//   //           }
//   //         }

//   //         if (videoEl) {
//   //           track.attach(videoEl);
//   //           videoEl.muted = false;
//   //           videoEl.volume = 1.0;
//   //           videoEl.play().catch((err) => {
//   //             console.warn('Video autoplay failed:', err);
//   //             videoEl.muted = true;
//   //             videoEl.play().then(() => {
//   //               setTimeout(() => { videoEl.muted = false; }, 100);
//   //             }).catch(console.error);
//   //           });
//   //         }
//   //       }

//   //       // 🔊 FIXED AUDIO TRACK HANDLING
//   //       if (track.kind === Track.Kind.Audio) {
//   //         // Remove any existing audio element for this participant
//   //         const existingAudio = document.querySelector(
//   //           `audio[data-participant="${participant.identity}"]`
//   //         );
//   //         if (existingAudio) {
//   //           existingAudio.remove();
//   //         }

//   //         const audioEl = document.createElement('audio');
//   //         audioEl.autoplay = true;
//   //         audioEl.playsInline = true;
//   //         audioEl.muted = false;
//   //         audioEl.volume = 1.0;
//   //         audioEl.dataset.participant = participant.identity;

//   //         track.attach(audioEl);
//   //         document.body.appendChild(audioEl);

//   //         audioEl.play()
//   //           .then(() => console.log('✅ Audio track playing for', participant.identity))
//   //           .catch((err) => {
//   //             console.error('❌ Audio autoplay failed:', err);
//   //             // Try to play on next user interaction
//   //             const playOnClick = () => {
//   //               audioEl.play()
//   //                 .then(() => {
//   //                   console.log('✅ Audio started after user interaction');
//   //                   document.removeEventListener('click', playOnClick);
//   //                 })
//   //                 .catch(console.error);
//   //             };
//   //             document.addEventListener('click', playOnClick, { once: true });
//   //           });
//   //       }
//   //     });

//   //     room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
//   //       console.log('Unsubscribed from track:', participant.identity);

//   //       if (track.kind === Track.Kind.Video) {
//   //         track.detach();
//   //         const videoEl = videoRefs.current[participant.identity];
//   //         if (videoEl) {
//   //           videoEl.removeAttribute('data-participant');
//   //           videoEl.srcObject = null;
//   //         }
//   //       }

//   //       if (track.kind === Track.Kind.Audio) {
//   //         const audioEls = document.querySelectorAll(
//   //           `audio[data-participant="${participant.identity}"]`
//   //         );
//   //         audioEls.forEach((el) => el.remove());
//   //         track.detach();
//   //       }
//   //     });

//   //     room.on(RoomEvent.ParticipantConnected, (participant) => {
//   //       console.log('New participant joined:', participant.identity);
//   //       subscribeToNewTracks();
//   //     });

//   //     room.on(RoomEvent.ParticipantDisconnected, (participant) => {
//   //       console.log('Participant left:', participant.identity);
//   //       const videoEl = videoRefs.current[participant.identity];
//   //       if (videoEl) {
//   //         videoEl.removeAttribute('data-participant');
//   //         videoEl.srcObject = null;
//   //       }
//   //       delete videoRefs.current[participant.identity];

//   //       // Remove audio elements
//   //       const audioEls = document.querySelectorAll(
//   //         `audio[data-participant="${participant.identity}"]`
//   //       );
//   //       audioEls.forEach((el) => el.remove());
//   //     });

//   //     const subscribeToNewTracks = () => {
//   //       room.remoteParticipants.forEach((participant) => {
//   //         participant.trackPublications.forEach((pub) => {
//   //           if (pub.isSubscribed && pub.track?.kind === Track.Kind.Video) {
//   //             const track = pub.track;
//   //             const videoEl = videoRefs.current[participant.identity];
//   //             if (videoEl && !videoEl.srcObject) {
//   //               track.attach(videoEl);
//   //               videoEl.play().catch(console.error);
//   //             }
//   //           }
//   //         });
//   //       });
//   //     };

//   //     subscribeToNewTracks();

//   //     console.log('LiveKit room connected as viewer');
//   //   } catch (error) {
//   //     console.error('LiveKit viewer connection error:', error);
//   //     setError('Failed to connect to live stream: ' + error.message);
//   //   }
//   // };

//   const connectToLiveKitRoom = async (roomUrl, viewerToken) => {
//     try {
//       if (!viewerToken || typeof viewerToken !== 'string') {
//         console.error('Invalid viewer token:', viewerToken);
//         setError('Invalid viewer token');
//         return;
//       }

//       console.log('Connecting to LiveKit as viewer:', {
//         roomUrl,
//         tokenLength: viewerToken.length,
//       });

//       const room = new Room();
//       await room.connect(roomUrl, viewerToken);
//       setLiveKitRoom(room);

//       room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
//         console.log(
//           'Subscribed to track from:',
//           participant.identity,
//           'Kind:',
//           track.kind,
//           'Track enabled:',
//           track.mediaStreamTrack?.enabled
//         );

//         if (track.kind === Track.Kind.Video) {
//           let videoEl = videoRefs.current[participant.identity];
//           if (!videoEl) {
//             const containers = document.querySelectorAll('[data-participant-video]');
//             const availableContainer = Array.from(containers).find(
//               (c) => !c.querySelector('video[data-participant]')
//             );

//             if (availableContainer) {
//               videoEl = availableContainer.querySelector('video');
//               if (videoEl) {
//                 videoEl.setAttribute('data-participant', participant.identity);
//                 videoRefs.current[participant.identity] = videoEl;
//               }
//             }
//           }

//           if (videoEl) {
//             track.attach(videoEl);
//             videoEl.muted = true; // Video elements should not handle audio
//             videoEl.volume = 0;
//             videoEl.play().catch((err) => {
//               console.warn('Video autoplay failed:', err);
//               videoEl.play().catch(console.error);
//             });
//           }
//         }

//         // if (track.kind === Track.Kind.Audio) {
//         //   // Remove any existing audio element for this participant
//         //   const existingAudio = document.querySelector(
//         //     `audio[data-participant="${participant.identity}"]`
//         //   );
//         //   if (existingAudio) {
//         //     existingAudio.remove();
//         //   }

//         //   const audioEl = document.createElement('audio');
//         //   audioEl.autoplay = true;
//         //   audioEl.playsInline = true;
//         //   audioEl.muted = false;
//         //   audioEl.volume = 1.0;
//         //   audioEl.dataset.participant = participant.identity;

//         //   track.attach(audioEl);
//         //   document.body.appendChild(audioEl);

//         //   audioEl.play()
//         //     .then(() => console.log('✅ Audio track playing for', participant.identity))
//         //     .catch((err) => {
//         //       console.error('❌ Audio autoplay failed:', err);
//         //       setError('Please click anywhere to enable audio');
//         //       const playOnClick = () => {
//         //         audioEl.play()
//         //           .then(() => {
//         //             console.log('✅ Audio started after user interaction');
//         //             setError(null);
//         //             document.removeEventListener('click', playOnClick);
//         //           })
//         //           .catch((e) => console.error('Audio play failed after click:', e));
//         //       };
//         //       document.addEventListener('click', playOnClick, { once: true });
//         //     });
//         // }

//         if (track.kind === Track.Kind.Audio) {
//   console.log('🎵 Audio track received from', participant.identity);

//   // Remove any existing audio element for this participant
//   const existingAudio = document.querySelector(
//     `audio[data-participant="${participant.identity}"]`
//   );
//   if (existingAudio) {
//     console.log('Removing existing audio element');
//     existingAudio.remove();
//   }

//   const audioEl = document.createElement('audio');
//   audioEl.autoplay = true;
//   audioEl.playsInline = true;
//   audioEl.muted = false;
//   audioEl.volume = 1.0;
//   audioEl.dataset.participant = participant.identity;

//   console.log('Attaching audio track to new audio element');
//   track.attach(audioEl);
//   document.body.appendChild(audioEl);

//   console.log('Audio element created:', {
//     muted: audioEl.muted,
//     volume: audioEl.volume,
//     autoplay: audioEl.autoplay,
//     srcObject: audioEl.srcObject
//   });

//   audioEl.play()
//     .then(() => {
//       console.log('✅ Audio track PLAYING for', participant.identity);
//       console.log('Audio element state:', {
//         paused: audioEl.paused,
//         muted: audioEl.muted,
//         volume: audioEl.volume
//       });
//     })
//     .catch((err) => {
//       console.error('❌ Audio autoplay failed:', err.name, err.message);
//       alert('Click anywhere on the screen to enable audio!');

//       const playOnClick = () => {
//         console.log('User clicked, attempting audio play...');
//         audioEl.play()
//           .then(() => {
//             console.log('✅ Audio started after user interaction');
//             document.removeEventListener('click', playOnClick);
//             document.removeEventListener('touchstart', playOnClick);
//           })
//           .catch((e) => console.error('Audio play failed after click:', e));
//       };

//       document.addEventListener('click', playOnClick, { once: true });
//       document.addEventListener('touchstart', playOnClick, { once: true });
//     });
// }
//       });

//       room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
//         console.log('Unsubscribed from track:', participant.identity);

//         if (track.kind === Track.Kind.Video) {
//           track.detach();
//           const videoEl = videoRefs.current[participant.identity];
//           if (videoEl) {
//             videoEl.removeAttribute('data-participant');
//             videoEl.srcObject = null;
//           }
//         }

//         if (track.kind === Track.Kind.Audio) {
//           const audioEls = document.querySelectorAll(
//             `audio[data-participant="${participant.identity}"]`
//           );
//           audioEls.forEach((el) => el.remove());
//           track.detach();
//         }
//       });

//       room.on(RoomEvent.ParticipantConnected, (participant) => {
//         console.log('New participant joined:', participant.identity);
//         subscribeToNewTracks();
//       });

//       room.on(RoomEvent.ParticipantDisconnected, (participant) => {
//         console.log('Participant left:', participant.identity);
//         const videoEl = videoRefs.current[participant.identity];
//         if (videoEl) {
//           videoEl.removeAttribute('data-participant');
//           videoEl.srcObject = null;
//         }
//         delete videoRefs.current[participant.identity];

//         const audioEls = document.querySelectorAll(
//           `audio[data-participant="${participant.identity}"]`
//         );
//         audioEls.forEach((el) => el.remove());
//       });

//       const subscribeToNewTracks = () => {
//         room.remoteParticipants.forEach((participant) => {
//           participant.trackPublications.forEach((pub) => {
//             if (pub.isSubscribed && pub.track?.kind === Track.Kind.Video) {
//               const track = pub.track;
//               const videoEl = videoRefs.current[participant.identity];
//               if (videoEl && !videoEl.srcObject) {
//                 track.attach(videoEl);
//                 videoEl.muted = true; // Ensure video element is muted
//                 videoEl.play().catch(console.error);
//               }
//             }
//           });
//         });
//       };

//       subscribeToNewTracks();

//       console.log('LiveKit room connected as viewer');
//     } catch (error) {
//       console.error('LiveKit viewer connection error:', error);
//       setError('Failed to connect to live stream: ' + error.message);
//     }
//   };

//   const addHeart = () => {
//     const heartId = Date.now() + Math.random();
//     setHearts((prev) => [...prev, { id: heartId, x: Math.random() * 80 + 10 }]);
//     setTimeout(() => {
//       setHearts((prev) => prev.filter((h) => h.id !== heartId));
//     }, 3000);
//   };

//   const sendComment = (e) => {
//     e.preventDefault();
//     if (!newComment.trim() || !socketRef.current || !isConnected) return;
//     socketRef.current.emit('send-comment', { streamId, text: newComment.trim() });
//     setNewComment('');
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center text-white">
//         <p>Connecting to live stream...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center text-white">
//         <p>{error}</p>
//         <button onClick={() => navigate('/')}>Go Back</button>
//       </div>
//     );
//   }

//   const participants = liveKitRoom
//     ? Array.from(liveKitRoom.remoteParticipants.values())
//     : [];

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {error && (
//         <div className="absolute top-4 left-4 bg-red-500/80 px-4 py-2 rounded text-white text-sm">
//           {error}
//         </div>
//       )}
//       <div
//         className={`relative aspect-[9/16] bg-gray-900 grid ${participants.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
//           }`}
//       >
//         {participants.length === 0 ? (
//           <div className="flex items-center justify-center">
//             <p>Waiting for host...</p>
//           </div>
//         ) : (
//           participants.map((p) => {
//             const camPub = p.getTrackPublication(Track.Source.Camera);
//             const micPub = p.getTrackPublication(Track.Source.Microphone);

//             const hasCamera = camPub?.isSubscribed && camPub?.track;
//             const hasMic = micPub?.isSubscribed && micPub?.track;

//             return (
//               <div key={p.identity} className="relative bg-gray-800" data-participant-video>
//                 <video
//                   autoPlay
//                   playsInline
//                   muted={false}
//                   controls={false}
//                   className="absolute inset-0 w-full h-full object-cover"
//                   ref={(el) => {
//                     if (el) {
//                       videoRefs.current[p.identity] = el;
//                       el.muted = false;
//                       el.volume = 1.0;
//                       if (hasCamera) {
//                         camPub.track.attach(el);
//                         el.play().catch((err) => {
//                           console.warn('Video play failed:', err);
//                           el.muted = true;
//                           el.play().then(() => {
//                             setTimeout(() => { el.muted = false; }, 100);
//                           }).catch(console.error);
//                         });
//                       }
//                     }
//                   }}
//                 />

//                 <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-sm flex items-center gap-2">
//                   <span>@{p.identity}</span>
//                   {hasMic && <span className="text-green-400">🎤</span>}
//                 </div>

//                 {!hasCamera && (
//                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-400">
//                     <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold">
//                       {p.identity[0]?.toUpperCase()}
//                     </div>
//                     <p className="mt-2 text-sm">@{p.identity}</p>
//                     {hasMic ? (
//                       <p className="text-xs italic">🎤 Audio only</p>
//                     ) : (
//                       <p className="text-xs italic">No video yet…</p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })
//         )}
//       </div>

//       <div className="absolute inset-0 pointer-events-none overflow-hidden">
//         {error && (
//           <div className="absolute top-4 left-4 bg-red-500/80 px-4 py-2 rounded text-white text-sm">
//             {error}
//           </div>
//         )}
//         {hearts.map((heart) => (
//           <div
//             key={heart.id}
//             className="absolute bottom-32"
//             style={{
//               left: `${heart.x}%`,
//               animation: 'heartFloat 3s ease-out forwards',
//             }}
//           >
//             <Heart className="w-8 h-8 text-red-500 fill-red-500" />
//           </div>
//         ))}
//       </div>

//       <div className="bg-gray-900 border-t border-gray-800">
//         <div className="h-64 overflow-y-auto p-4 space-y-3">
//           {comments.map((c, i) => (
//             <div key={i} className="text-sm">
//               <strong>{c.username || 'User'}:</strong> {c.text}
//             </div>
//           ))}
//           <div ref={commentsEndRef} />
//         </div>
//         <form onSubmit={sendComment} className="p-4 flex">
//           <input
//             className="flex-1 p-2 rounded bg-gray-800"
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//             placeholder="Say something..."
//           />
//           <button type="submit" className="ml-2 px-4 py-2 bg-red-500 rounded">
//             <Send className="w-4 h-4" />
//           </button>
//         </form>
//       </div>

//       <style>{`
//         @keyframes heartFloat {
//           0% { transform: translateY(0) scale(1); opacity: 1; }
//           50% { transform: translateY(-100px) scale(1.2); opacity: 0.8; }
//           100% { transform: translateY(-200px) scale(0.8); opacity: 0; }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default LiveViewer;
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Users, Send, ShoppingBag, ExternalLink, AlertCircle } from 'lucide-react';
import io from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { Room, RoomEvent, Track } from 'livekit-client';

const LiveViewer = () => {
  const { streamId } = useParams();
  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewers, setViewers] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [hearts, setHearts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [liveKitRoom, setLiveKitRoom] = useState(null);
  const [products, setProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);

  const socketRef = useRef(null);
  const videoRefs = useRef({});
  const commentsEndRef = useRef(null);

  const API_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com/api';
  const SOCKET_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com';
  const LIVEKIT_URL = process.env.REACT_APP_LIVEKIT_URL || 'wss://theclipstream-q0jt88zr.livekit.cloud';

  // Initialize socket and join stream
  useEffect(() => {
    const initializeStream = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${API_URL}/live/${streamId}`, {
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Stream not found');

        const streamData = await response.json();
        console.log('Fetched stream data:', streamData);
        setStream(streamData);
        setProducts(streamData.products || []);

        const token = localStorage.getItem('token');
        socketRef.current = io(SOCKET_URL, {
          withCredentials: true,
          auth: token ? { token } : {},
        });

        socketRef.current.on('connect', () => {
          console.log('Socket connected');
          setIsConnected(true);
          socketRef.current.emit('join-stream', { streamId, isStreamer: false });
        });

        socketRef.current.on('disconnect', () => {
          setIsConnected(false);
        });

        socketRef.current.on('joined-stream', async (data) => {
          console.log('Joined stream data:', data);
          setViewers(data.viewerCount);
          setStream(data.stream);
          setProducts(data.stream?.products || []);
          setIsLoading(false);

          const viewerToken = streamData.viewerToken || data.stream?.viewerToken;
          const roomUrl = streamData.roomUrl || data.stream?.roomUrl || LIVEKIT_URL;

          if (viewerToken) {
            await connectToLiveKitRoom(roomUrl, viewerToken);
          } else {
            await fetchViewerToken();
          }
        });

        socketRef.current.on('viewer-joined', (data) => setViewers(data.viewerCount));
        socketRef.current.on('viewer-left', (data) => setViewers(data.viewerCount));
        
        socketRef.current.on('new-comment', (comment) => {
          setComments((prev) => [...prev, comment]);
        });
        
        socketRef.current.on('heart-sent', () => addHeart());

        // Real-time product updates
        socketRef.current.on('product-added', (data) => {
          console.log('New product added:', data);
          setProducts(prev => [...prev, { ...data.product, index: data.productIndex }]);
          setError('New product available! 🛍️');
          setTimeout(() => setError(null), 3000);
        });

        // Stream ended event
        socketRef.current.on('stream-ended', (data) => {
          console.log('Stream ended:', data);
          
          // Update stream status
          setStream(prev => ({
            ...prev,
            status: 'ended',
            duration: data.duration,
            totalViews: data.stream?.totalViews || prev?.totalViews,
            heartsReceived: data.stream?.heartsReceived || prev?.heartsReceived,
            formattedDuration: data.stream?.formattedDuration || prev?.formattedDuration,
            endedAt: data.stream?.endedAt || new Date()
          }));
          
          // Disconnect from LiveKit
          if (liveKitRoom) {
            liveKitRoom.disconnect();
            setLiveKitRoom(null);
          }
          
          // Clean up audio elements
          document.querySelectorAll('audio[data-participant]').forEach(el => el.remove());
        });

        if (streamData.viewerToken) {
          const roomUrl = streamData.roomUrl || LIVEKIT_URL;
          await connectToLiveKitRoom(roomUrl, streamData.viewerToken);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Stream initialization error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeStream();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-stream', { streamId });
        socketRef.current.disconnect();
      }
      if (liveKitRoom) {
        liveKitRoom.disconnect();
      }
      document.querySelectorAll('audio[data-participant]').forEach(el => el.remove());
    };
  }, [streamId, navigate]);

  const fetchViewerToken = async () => {
    try {
      const response = await fetch(`${API_URL}/live/${streamId}/token`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched viewer token:', data);
        await connectToLiveKitRoom(data.roomUrl, data.viewerToken);
      }
    } catch (error) {
      console.error('Error fetching viewer token:', error);
    }
  };

  const connectToLiveKitRoom = async (roomUrl, viewerToken) => {
    try {
      if (!viewerToken || typeof viewerToken !== 'string') {
        console.error('Invalid viewer token:', viewerToken);
        setError('Invalid viewer token');
        return;
      }

      console.log('Connecting to LiveKit as viewer');

      const room = new Room();
      await room.connect(roomUrl, viewerToken);
      setLiveKitRoom(room);

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log('Subscribed to track from:', participant.identity, 'Kind:', track.kind);

        if (track.kind === Track.Kind.Video) {
          let videoEl = videoRefs.current[participant.identity];
          if (!videoEl) {
            const containers = document.querySelectorAll('[data-participant-video]');
            const availableContainer = Array.from(containers).find(
              (c) => !c.querySelector('video[data-participant]')
            );

            if (availableContainer) {
              videoEl = availableContainer.querySelector('video');
              if (videoEl) {
                videoEl.setAttribute('data-participant', participant.identity);
                videoRefs.current[participant.identity] = videoEl;
              }
            }
          }

          if (videoEl) {
            track.attach(videoEl);
            videoEl.muted = true;
            videoEl.volume = 0;
            videoEl.play().catch(console.error);
          }
        }

        if (track.kind === Track.Kind.Audio) {
          console.log('🎵 Audio track received from', participant.identity);
          
          const existingAudio = document.querySelector(
            `audio[data-participant="${participant.identity}"]`
          );
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
            .then(() => console.log('✅ Audio playing for', participant.identity))
            .catch((err) => {
              console.error('❌ Audio autoplay failed:', err);
              const playOnClick = () => {
                audioEl.play()
                  .then(() => {
                    console.log('✅ Audio started after user interaction');
                    document.removeEventListener('click', playOnClick);
                    document.removeEventListener('touchstart', playOnClick);
                  })
                  .catch(console.error);
              };
              document.addEventListener('click', playOnClick, { once: true });
              document.addEventListener('touchstart', playOnClick, { once: true });
            });
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Video) {
          track.detach();
          const videoEl = videoRefs.current[participant.identity];
          if (videoEl) {
            videoEl.removeAttribute('data-participant');
            videoEl.srcObject = null;
          }
        }

        if (track.kind === Track.Kind.Audio) {
          const audioEls = document.querySelectorAll(
            `audio[data-participant="${participant.identity}"]`
          );
          audioEls.forEach((el) => el.remove());
          track.detach();
        }
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log('Participant left:', participant.identity);
        const videoEl = videoRefs.current[participant.identity];
        if (videoEl) {
          videoEl.removeAttribute('data-participant');
          videoEl.srcObject = null;
        }
        delete videoRefs.current[participant.identity];

        const audioEls = document.querySelectorAll(
          `audio[data-participant="${participant.identity}"]`
        );
        audioEls.forEach((el) => el.remove());
      });

      console.log('LiveKit room connected as viewer');
    } catch (error) {
      console.error('LiveKit viewer connection error:', error);
      setError('Failed to connect to live stream: ' + error.message);
    }
  };

  const addHeart = () => {
    const heartId = Date.now() + Math.random();
    setHearts((prev) => [...prev, { id: heartId, x: Math.random() * 80 + 10 }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 3000);
  };

  const sendComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !socketRef.current || !isConnected) return;
    socketRef.current.emit('send-comment', { streamId, text: newComment.trim() });
    setNewComment('');
  };

  const sendHeart = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-heart', { streamId });
      addHeart();
    }
  };

  const handleProductClick = (product, index) => {
    if (product.type === 'ad' && product.link) {
      window.open(product.link, '_blank', 'noopener,noreferrer');
    } else if (product.type === 'product') {
      // Navigate to purchase page or emit order event
      if (socketRef.current) {
        socketRef.current.emit('place-order', {
          streamId,
          productIndex: index,
          quantity: 1
        });
        setError('Order placed! Check your orders.');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Connecting to live stream...</p>
        </div>
      </div>
    );
  }

  // Error state (no stream found)
  if (error && !stream) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-20 h-20 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Unable to Connect</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Stream ended state
  if (stream?.status === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center text-white p-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6 animate-pulse">🎬</div>
          <h1 className="text-3xl font-bold mb-3">Stream Has Ended</h1>
          <h2 className="text-xl text-gray-300 mb-2">{stream.title}</h2>
          <p className="text-gray-500 text-sm mb-8">
            Thank you for watching! The host has ended this live stream.
          </p>
          
          {/* Stream Statistics */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Stream Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-2">
                  <span>⏱️</span>
                  Duration:
                </span>
                <span className="font-semibold text-white">
                  {stream.formattedDuration || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Views:
                </span>
                <span className="font-semibold text-white">
                  {stream.totalViews || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  Hearts:
                </span>
                <span className="font-semibold text-red-400">
                  {stream.heartsReceived || 0}
                </span>
              </div>
              {stream.endedAt && (
                <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-700">
                  <span className="text-gray-500">Ended at:</span>
                  <span className="text-gray-400">
                    {new Date(stream.endedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            >
              Browse Live Streams
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="w-full bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const participants = liveKitRoom
    ? Array.from(liveKitRoom.remoteParticipants.values())
    : [];

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Error/Success Toast */}
      {error && stream?.status !== 'ended' && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 backdrop-blur-sm px-6 py-3 rounded-lg text-white text-sm z-50 shadow-xl animate-fade-in">
          {error}
        </div>
      )}
      
      {/* Video Section */}
      <div className="relative aspect-[9/16] max-h-screen bg-gray-900">
        <div className={`h-full grid ${participants.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Waiting for host to start...</p>
            </div>
          ) : (
            participants.map((p) => {
              const camPub = p.getTrackPublication(Track.Source.Camera);
              const micPub = p.getTrackPublication(Track.Source.Microphone);
              const hasCamera = camPub?.isSubscribed && camPub?.track;
              const hasMic = micPub?.isSubscribed && micPub?.track;

              return (
                <div key={p.identity} className="relative bg-gray-800 h-full" data-participant-video>
                  <video
                    autoPlay
                    playsInline
                    muted={false}
                    controls={false}
                    className="absolute inset-0 w-full h-full object-cover"
                    ref={(el) => {
                      if (el) {
                        videoRefs.current[p.identity] = el;
                        el.muted = false;
                        el.volume = 1.0;
                        if (hasCamera) {
                          camPub.track.attach(el);
                          el.play().catch(console.error);
                        }
                      }
                    }}
                  />

                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                    <span className="font-medium">@{p.identity}</span>
                    {hasMic && <span className="text-green-400">🎤</span>}
                  </div>

                  {!hasCamera && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400">
                      <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-3xl font-bold mb-3">
                        {p.identity[0]?.toUpperCase()}
                      </div>
                      <p className="text-base font-medium">@{p.identity}</p>
                      {hasMic ? (
                        <p className="text-sm italic mt-1 flex items-center gap-1">
                          <span className="text-green-400">🎤</span> Audio only
                        </p>
                      ) : (
                        <p className="text-sm italic mt-1">Camera off</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Hearts Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {hearts.map((heart) => (
            <div
              key={heart.id}
              className="absolute bottom-24"
              style={{
                left: `${heart.x}%`,
                animation: 'heartFloat 3s ease-out forwards',
              }}
            >
              <Heart className="w-10 h-10 text-red-500 fill-red-500 drop-shadow-lg" />
            </div>
          ))}
        </div>

        {/* Stream Info Overlay */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent p-4 pb-20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-bold">LIVE</span>
              </div>
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Users className="w-4 h-4" />
                <span className="text-sm font-semibold">{viewers}</span>
              </div>
            </div>
          </div>
          <h2 className="text-lg font-bold drop-shadow-lg">{stream?.title}</h2>
          {stream?.streamer && (
            <p className="text-sm text-gray-300 mt-1">by @{stream.streamer.username}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-24 right-4 flex flex-col gap-3">
          <button
            onClick={sendHeart}
            className="bg-red-500/90 hover:bg-red-600 backdrop-blur-sm p-4 rounded-full shadow-lg transition-all hover:scale-110"
          >
            <Heart className="w-6 h-6 text-white fill-white" />
          </button>
          
          {products.length > 0 && (
            <button
              onClick={() => setShowProducts(!showProducts)}
              className="bg-blue-500/90 hover:bg-blue-600 backdrop-blur-sm p-4 rounded-full shadow-lg transition-all hover:scale-110 relative"
            >
              <ShoppingBag className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {products.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Products Drawer */}
      {showProducts && products.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-end" onClick={() => setShowProducts(false)}>
          <div 
            className="bg-gray-900 w-full max-h-[70vh] rounded-t-3xl overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Available Products
              </h3>
              <button 
                onClick={() => setShowProducts(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(70vh-80px)]">
              {products.map((product, index) => (
                <div 
                  key={index} 
                  className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors cursor-pointer"
                  onClick={() => handleProductClick(product, index)}
                >
                  <div className="flex gap-3">
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-base truncate">{product.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          product.type === 'product' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {product.type === 'product' ? '🛍️ Product' : '📢 Ad'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xl font-bold text-yellow-400">${product.price}</span>
                        {product.type === 'product' ? (
                          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1">
                            <ShoppingBag className="w-4 h-4" />
                            Buy Now
                          </button>
                        ) : (
                          <button className="bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1">
                            <ExternalLink className="w-4 h-4" />
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((c, i) => (
              <div key={i} className="text-sm bg-gray-800/50 rounded-lg p-2">
                <strong className="text-blue-400">@{c.username || 'Viewer'}</strong>
                <span className="text-gray-300 ml-2">{c.text}</span>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>
        
        <form onSubmit={sendComment} className="p-4 flex gap-2 border-t border-gray-800">
          <input
            className="flex-1 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Say something..."
            maxLength={200}
          />
          <button 
            type="submit" 
            disabled={!newComment.trim()}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes heartFloat {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-120px) scale(1.3); opacity: 0.8; }
          100% { transform: translateY(-240px) scale(0.8); opacity: 0; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default LiveViewer;