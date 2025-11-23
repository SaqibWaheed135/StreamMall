// import React, { useRef, useEffect, useState } from 'react';
// import { Camera, RefreshCw, AlertCircle } from 'lucide-react';

// const FaceDetection = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isCameraActive, setIsCameraActive] = useState(false);
//   const [facingMode, setFacingMode] = useState('user'); // 'user' for front, 'environment' for rear
//   const [faceDetected, setFaceDetected] = useState(false);
//   const faceMeshRef = useRef(null);
//   const animationRef = useRef(null);

//   useEffect(() => {
//     loadFaceMesh();
//     return () => {
//       stopCamera();
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//       }
//     };
//   }, []);

//   const loadFaceMesh = async () => {
//     try {
//       setIsLoading(true);
      
//       // Load MediaPipe Face Mesh
//       const script = document.createElement('script');
//       script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js';
//       script.async = true;
      
//       script.onload = async () => {
//         const FaceMesh = window.FaceMesh;
//         faceMeshRef.current = new FaceMesh({
//           locateFile: (file) => {
//             return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`;
//           }
//         });

//         faceMeshRef.current.setOptions({
//           maxNumFaces: 1,
//           refineLandmarks: true,
//           minDetectionConfidence: 0.5,
//           minTrackingConfidence: 0.5
//         });

//         faceMeshRef.current.onResults(onResults);
//         setIsLoading(false);
//       };

//       script.onerror = () => {
//         setError('Failed to load Face Mesh library');
//         setIsLoading(false);
//       };

//       document.body.appendChild(script);
//     } catch (err) {
//       setError(err.message);
//       setIsLoading(false);
//     }
//   };

//   const onResults = (results) => {
//     const canvas = canvasRef.current;
//     const video = videoRef.current;
    
//     if (!canvas || !video) return;

//     const ctx = canvas.getContext('2d');
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     // Clear canvas
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Draw video frame
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//     if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
//       setFaceDetected(true);
      
//       // Draw face mesh
//       for (const landmarks of results.multiFaceLandmarks) {
//         drawFaceMesh(ctx, landmarks, canvas.width, canvas.height);
//       }
//     } else {
//       setFaceDetected(false);
//     }
//   };

//   const drawFaceMesh = (ctx, landmarks, width, height) => {
//     // Draw face outline
//     ctx.strokeStyle = '#00ff00';
//     ctx.lineWidth = 2;
//     ctx.beginPath();

//     // Face contour indices
//     const faceOval = [
//       10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
//       397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
//       172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
//     ];

//     faceOval.forEach((idx, i) => {
//       const point = landmarks[idx];
//       const x = point.x * width;
//       const y = point.y * height;
      
//       if (i === 0) {
//         ctx.moveTo(x, y);
//       } else {
//         ctx.lineTo(x, y);
//       }
//     });
    
//     ctx.closePath();
//     ctx.stroke();

//     // Draw key facial landmarks
//     const keyPoints = [
//       10,   // Forehead
//       152,  // Chin
//       33,   // Left eye
//       263,  // Right eye
//       1,    // Nose tip
//       61,   // Left mouth corner
//       291   // Right mouth corner
//     ];

//     ctx.fillStyle = '#00ff00';
//     keyPoints.forEach(idx => {
//       const point = landmarks[idx];
//       const x = point.x * width;
//       const y = point.y * height;
      
//       ctx.beginPath();
//       ctx.arc(x, y, 3, 0, 2 * Math.PI);
//       ctx.fill();
//     });

//     // Draw forehead area for haircut placement
//     ctx.strokeStyle = '#ff00ff';
//     ctx.lineWidth = 2;
//     const hairlinePoints = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
    
//     ctx.beginPath();
//     hairlinePoints.slice(0, 18).forEach((idx, i) => {
//       const point = landmarks[idx];
//       const x = point.x * width;
//       const y = point.y * height;
      
//       if (i === 0) {
//         ctx.moveTo(x, y);
//       } else {
//         ctx.lineTo(x, y);
//       }
//     });
//     ctx.stroke();
//   };

//   const startCamera = async () => {
//     try {
//       setError(null);
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: facingMode,
//           width: { ideal: 1280 },
//           height: { ideal: 720 }
//         }
//       });

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.onloadedmetadata = () => {
//           videoRef.current.play();
//           setIsCameraActive(true);
//           detectFace();
//         };
//       }
//     } catch (err) {
//       setError('Camera access denied or not available');
//       console.error(err);
//     }
//   };

//   const stopCamera = () => {
//     if (videoRef.current && videoRef.current.srcObject) {
//       const tracks = videoRef.current.srcObject.getTracks();
//       tracks.forEach(track => track.stop());
//       videoRef.current.srcObject = null;
//       setIsCameraActive(false);
//       setFaceDetected(false);
//     }
//   };

//   const switchCamera = async () => {
//     stopCamera();
//     setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
//     setTimeout(() => startCamera(), 500);
//   };

//   const detectFace = async () => {
//     if (!videoRef.current || !faceMeshRef.current || !isCameraActive) return;

//     if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
//       await faceMeshRef.current.send({ image: videoRef.current });
//     }

//     animationRef.current = requestAnimationFrame(detectFace);
//   };

//   return (
//     <div className="fixed inset-0 bg-black">
//       {/* Video/Canvas Container - Full Screen */}
//       <div className="relative w-full h-full">
//         <video
//           ref={videoRef}
//           className="absolute inset-0 w-full h-full object-contain"
//           playsInline
//           style={{ display: isCameraActive ? 'block' : 'none' }}
//         />
//         <canvas
//           ref={canvasRef}
//           className="absolute inset-0 w-full h-full"
//           style={{ display: isCameraActive ? 'block' : 'none' }}
//         />
        
//         {/* Placeholder */}
//         {!isCameraActive && (
//           <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
//             <div className="text-center">
//               <Camera className="w-24 h-24 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-300 text-xl mb-2">Virtual Haircut Studio</p>
//               <p className="text-gray-500 text-sm">Click "Start Camera" to begin</p>
//             </div>
//           </div>
//         )}

//         {/* Loading Overlay */}
//         {isLoading && (
//           <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
//               <p className="text-white text-lg">Loading Face Detection...</p>
//             </div>
//           </div>
//         )}

//         {/* Top Status Bar */}
//         <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black via-black/80 to-transparent p-4 z-10">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
//               <span className="text-white font-medium text-sm">
//                 {faceDetected ? 'Face Detected' : 'No Face Detected'}
//               </span>
//             </div>
//             <div className="text-gray-300 text-sm bg-black/50 px-3 py-1 rounded-full">
//               {facingMode === 'user' ? 'Front Camera' : 'Rear Camera'}
//             </div>
//           </div>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="absolute top-20 left-4 right-4 bg-red-900/90 border border-red-500 rounded-lg p-4 flex items-start space-x-3 z-20 backdrop-blur-sm">
//             <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
//             <div>
//               <p className="text-red-200 font-medium">Error</p>
//               <p className="text-red-300 text-sm mt-1">{error}</p>
//             </div>
//           </div>
//         )}

//         {/* Bottom Control Panel */}
//         <div className="absolute bottom-20 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 z-10">
//           <div className="flex gap-4 justify-center items-center">
//             {!isCameraActive ? (
//               <button
//                 onClick={startCamera}
//                 disabled={isLoading}
//                 className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-lg"
//               >
//                 <Camera className="w-6 h-6" />
//                 <span>Start Camera</span>
//               </button>
//             ) : (
//               <>
//                 <button
//                   onClick={switchCamera}
//                   className="flex items-center justify-center bg-gray-700/90 text-white p-4 rounded-full hover:bg-gray-600 transition-all shadow-lg backdrop-blur-sm"
//                   title="Switch Camera"
//                 >
//                   <RefreshCw className="w-6 h-6" />
//                 </button>
//                 <button
//                   onClick={stopCamera}
//                   className="flex items-center justify-center bg-red-600/90 text-white px-8 py-4 rounded-full hover:bg-red-700 transition-all shadow-lg backdrop-blur-sm"
//                 >
//                   <span className="font-medium text-lg">Stop Camera</span>
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FaceDetection;

import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [faceDetected, setFaceDetected] = useState(false);
  const [selectedHaircut, setSelectedHaircut] = useState(0);
  const [showMesh, setShowMesh] = useState(false);
  const faceMeshRef = useRef(null);
  const animationRef = useRef(null);
  const haircutImagesRef = useRef([]);
  const currentLandmarksRef = useRef(null);

  // Haircut styles - using canvas-drawn shapes for demo
  const haircuts = [
    {
      id: 0,
      name: 'None',
      type: 'none',
      description: 'Original look'
    },
    {
      id: 1,
      name: 'Classic Fade',
      type: 'shape',
      color: '#2C1810',
      description: 'Modern fade cut',
      offsetY: -0.35,
      scale: 1.4
    },
    {
      id: 2,
      name: 'Pompadour',
      type: 'shape',
      color: '#1A0F08',
      description: 'Classic styled hair',
      offsetY: -0.45,
      scale: 1.5
    },
    {
      id: 3,
      name: 'Undercut',
      type: 'shape',
      color: '#3D2817',
      description: 'Trendy undercut style',
      offsetY: -0.38,
      scale: 1.45
    },
    {
      id: 4,
      name: 'Buzz Cut',
      type: 'shape',
      color: '#4A3428',
      description: 'Short military style',
      offsetY: -0.28,
      scale: 1.25
    },
    {
      id: 5,
      name: 'Long Wavy',
      type: 'shape',
      color: '#231612',
      description: 'Long flowing hair',
      offsetY: -0.55,
      scale: 1.7
    }
  ];

  useEffect(() => {
    loadFaceMesh();
    return () => {
      stopCamera();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const loadFaceMesh = async () => {
    try {
      setIsLoading(true);
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js';
      script.async = true;
      
      script.onload = async () => {
        const FaceMesh = window.FaceMesh;
        faceMeshRef.current = new FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`;
          }
        });

        faceMeshRef.current.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMeshRef.current.onResults(onResults);
        setIsLoading(false);
      };

      script.onerror = () => {
        setError('Failed to load Face Mesh library');
        setIsLoading(false);
      };

      document.body.appendChild(script);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const onResults = (results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      setFaceDetected(true);
      const landmarks = results.multiFaceLandmarks[0];
      currentLandmarksRef.current = landmarks;
      
      // Draw haircut overlay
      if (selectedHaircut > 0) {
        drawHaircut(ctx, landmarks, canvas.width, canvas.height);
      }

      // Draw face mesh if enabled
      if (showMesh) {
        drawFaceMesh(ctx, landmarks, canvas.width, canvas.height);
      }
    } else {
      setFaceDetected(false);
      currentLandmarksRef.current = null;
    }
  };

  const drawHaircut = (ctx, landmarks, width, height) => {
    const haircut = haircuts[selectedHaircut];
    
    if (haircut.type === 'none') return;

    // Get key facial points for positioning
    const forehead = landmarks[10];
    const leftTemple = landmarks[356];
    const rightTemple = landmarks[127];
    const chin = landmarks[152];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    // Calculate face dimensions
    const faceWidth = Math.abs(
      (rightTemple.x * width) - (leftTemple.x * width)
    );
    const faceHeight = Math.abs(
      (chin.y * height) - (forehead.y * height)
    );

    // Calculate haircut position and size
    const haircutWidth = faceWidth * (haircut.scale || 1.4);
    const haircutHeight = haircutWidth * 1.2; // Aspect ratio for hair
    
    const centerX = ((leftTemple.x + rightTemple.x) / 2) * width;
    const topY = forehead.y * height;
    
    const x = centerX - haircutWidth / 2;
    const y = topY + (faceHeight * (haircut.offsetY || -0.35));

    // Calculate rotation based on head tilt
    const angle = Math.atan2(
      rightEye.y - leftEye.y,
      rightEye.x - leftEye.x
    );

    ctx.save();
    ctx.translate(centerX, y + haircutHeight / 2);
    ctx.rotate(angle);

    // Draw different haircut shapes
    if (haircut.type === 'shape') {
      ctx.fillStyle = haircut.color;
      ctx.globalAlpha = 0.85;

      // Create hair shape based on haircut ID
      ctx.beginPath();
      
      if (haircut.id === 1) {
        // Classic Fade - rounded top
        ctx.ellipse(0, -haircutHeight * 0.2, haircutWidth * 0.45, haircutHeight * 0.4, 0, 0, Math.PI * 2);
      } else if (haircut.id === 2) {
        // Pompadour - tall and voluminous
        ctx.ellipse(0, -haircutHeight * 0.25, haircutWidth * 0.42, haircutHeight * 0.45, 0, 0, Math.PI * 2);
        ctx.ellipse(0, -haircutHeight * 0.35, haircutWidth * 0.35, haircutHeight * 0.25, 0, 0, Math.PI);
      } else if (haircut.id === 3) {
        // Undercut - shorter on sides
        ctx.ellipse(0, -haircutHeight * 0.22, haircutWidth * 0.43, haircutHeight * 0.42, 0, 0, Math.PI * 2);
      } else if (haircut.id === 4) {
        // Buzz Cut - very short
        ctx.ellipse(0, -haircutHeight * 0.15, haircutWidth * 0.48, haircutHeight * 0.35, 0, 0, Math.PI * 2);
      } else if (haircut.id === 5) {
        // Long Wavy - extended sides and back
        ctx.ellipse(0, -haircutHeight * 0.2, haircutWidth * 0.5, haircutHeight * 0.5, 0, 0, Math.PI * 2);
        // Add flowing sides
        ctx.ellipse(-haircutWidth * 0.35, haircutHeight * 0.1, haircutWidth * 0.2, haircutHeight * 0.3, 0.3, 0, Math.PI * 2);
        ctx.ellipse(haircutWidth * 0.35, haircutHeight * 0.1, haircutWidth * 0.2, haircutHeight * 0.3, -0.3, 0, Math.PI * 2);
      }
      
      ctx.fill();

      // Add some texture/shading
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(0, -haircutHeight * 0.15, haircutWidth * 0.3, haircutHeight * 0.25, 0, 0, Math.PI);
      ctx.fill();
    }

    ctx.restore();

    // Add a subtle glow/highlight
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#ffffff';
    ctx.translate(centerX, y + haircutHeight / 2);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, -haircutHeight * 0.3, haircutWidth * 0.2, haircutHeight * 0.15, 0, 0, Math.PI);
    ctx.fill();
    ctx.restore();
  };

  const drawFaceMesh = (ctx, landmarks, width, height) => {
    ctx.strokeStyle = '#00ff0050';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#00ff00';

    // Face contour
    const faceOval = [
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
      397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
      172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
    ];

    ctx.beginPath();
    faceOval.forEach((idx, i) => {
      const point = landmarks[idx];
      const x = point.x * width;
      const y = point.y * height;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();

    // Key points
    const keyPoints = [10, 152, 33, 263, 1, 61, 291];
    keyPoints.forEach(idx => {
      const point = landmarks[idx];
      const x = point.x * width;
      const y = point.y * height;
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraActive(true);
          detectFace();
        };
      }
    } catch (err) {
      setError('Camera access denied or not available');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      setFaceDetected(false);
    }
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(() => startCamera(), 500);
  };

  const detectFace = async () => {
    if (!videoRef.current || !faceMeshRef.current || !isCameraActive) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      await faceMeshRef.current.send({ image: videoRef.current });
    }

    animationRef.current = requestAnimationFrame(detectFace);
  };

  const nextHaircut = () => {
    setSelectedHaircut(prev => (prev + 1) % haircuts.length);
  };

  const prevHaircut = () => {
    setSelectedHaircut(prev => (prev - 1 + haircuts.length) % haircuts.length);
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* Video/Canvas Container - Full Screen */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain"
          playsInline
          style={{ display: isCameraActive ? 'block' : 'none' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: isCameraActive ? 'block' : 'none' }}
        />
        
        {/* Placeholder */}
        {!isCameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <div className="text-center">
              <Camera className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-xl mb-2">Virtual Haircut Studio</p>
              <p className="text-gray-500 text-sm">Click "Start Camera" to begin</p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading Face Detection...</p>
            </div>
          </div>
        )}

        {/* Top Status Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black via-black/80 to-transparent p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-white font-medium text-sm">
                {faceDetected ? 'Face Detected' : 'No Face Detected'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMesh(!showMesh)}
                className={`text-xs px-3 py-1 rounded-full transition-all ${
                  showMesh ? 'bg-green-600' : 'bg-gray-700'
                } text-white`}
              >
                {showMesh ? 'Mesh ON' : 'Mesh OFF'}
              </button>
              <div className="text-gray-300 text-sm bg-black/50 px-3 py-1 rounded-full">
                {facingMode === 'user' ? 'Front' : 'Rear'}
              </div>
            </div>
          </div>
        </div>

        {/* Haircut Selector - Only show when camera is active */}
        {isCameraActive && (
          <div className="absolute left-1/2 transform -translate-x-1/2 top-20 z-20 bg-black/70 backdrop-blur-md rounded-2xl p-4 max-w-md w-full mx-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={prevHaircut}
                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-all shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex-1 text-center">
                <h3 className="text-white font-bold text-lg">
                  {haircuts[selectedHaircut].name}
                </h3>
                <p className="text-gray-300 text-sm">
                  {haircuts[selectedHaircut].description}
                </p>
                <div className="flex gap-1 justify-center mt-2">
                  {haircuts.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === selectedHaircut
                          ? 'w-8 bg-purple-500'
                          : 'w-1.5 bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <button
                onClick={nextHaircut}
                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-all shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute top-20 left-4 right-4 bg-red-900/90 border border-red-500 rounded-lg p-4 flex items-start space-x-3 z-20 backdrop-blur-sm">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-200 font-medium">Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Bottom Control Panel */}
        <div className="absolute bottom-20 left-10 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 z-10">
          <div className="flex gap-4 justify-center items-center">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-lg"
              >
                <Camera className="w-6 h-6" />
                <span>Start Camera</span>
              </button>
            ) : (
              <>
                <button
                  onClick={switchCamera}
                  className="flex items-center justify-center bg-gray-700/90 text-white p-4 rounded-full hover:bg-gray-600 transition-all shadow-lg backdrop-blur-sm"
                  title="Switch Camera"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>
                <button
                  onClick={stopCamera}
                  className="flex items-center justify-center bg-red-600/90 text-white px-8 py-4 rounded-full hover:bg-red-700 transition-all shadow-lg backdrop-blur-sm"
                >
                  <span className="font-medium text-lg">Stop Camera</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceDetection;