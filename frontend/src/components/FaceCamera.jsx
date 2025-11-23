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

  // Haircut styles with image URLs
  const haircuts = [
    {
      id: 0,
      name: 'None',
      url: null,
      description: 'Original look'
    },
    {
      id: 1,
      name: 'Classic Fade',
      url: 'data:image/jpeg;base64,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eQXFe0uWznNPwXPqSs8/jUc+jk7yeV3K1li1EgJs3ggkIORu925Whoc4P3clx1cSAZngcwut9hTfHi3Tux+q5C51pBbguz9hkVqHFJSPelYPyWuP1K6kiIuzIqHcVVEHz72xUPs221TMG2bVRRS35kNyH/YFq+A4e+urIoQ0kPIC6T270f8A1GE1YGjmvicfKxH1Xn9kmEmqqxO/3IjcX5rln5NdNhwrs2Mjb1UjWssLC9ytywHZbD8FaDTxgv8AvEL3GDK23JXLp4xNUCqiKoIiICIiAiIgIiICIiCKdrXMObkua7UbIVGJd73crXF7r9V05wzCxVvdM+6PkpZq64FU9nVfTtc6Njw8C4JF1qVdhdTh8uWpDr9Rqvql8THts5gIWj7f7IxYnROqILNnjaXbvessXiuuCNbeS+/ou7disGTZWae2stS75AALiFdSy0NYY5RZw3iy+hey+nEGw+GkC3etdIfVx+llOE9lbXwREXVkQoiDnvbVS99spHOBcwVLXX5A6fVY3Y6xrcNkAGuf9ltW3uGyYrsliNJAzPKY8zG8yNVqHY5I7uZ43C1tbLH9L06giItoIiICIiAiIgIiICIiAiIgIiICjnYHxlpFwQpFQ6oPnTtRhbS404s8IbFmPy/ou9bN0wotn8NpgLd1Sxtt1yhcT7Rqc1+1JhLXEPcIyGNuSDpoOJ13LvkX8NumXTdyWOP2rVyIi2giIgody1DAcK+y9rsSbC0Nglb3jQBoLm9vmStwKhMLfae++LJk/NQTBERUEREBERAREQEREBERAREQEREBUPBVVCg0LBsG9o29r62Zgcyj0YXDe4jet9G5QU1OyKSd7WgGV13EcVkKQERFQREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQf//Z',
      description: 'Modern fade cut',
      offsetY: -0.35,
      scale: 1.4
    },
    {
      id: 2,
      name: 'Pompadour',
      url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400',
      description: 'Classic styled hair',
      offsetY: -0.4,
      scale: 1.5
    },
    {
      id: 3,
      name: 'Undercut',
      url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400',
      description: 'Trendy undercut style',
      offsetY: -0.38,
      scale: 1.45
    },
    {
      id: 4,
      name: 'Buzz Cut',
      url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=400',
      description: 'Short military style',
      offsetY: -0.3,
      scale: 1.3
    },
    {
      id: 5,
      name: 'Long Wavy',
      url: 'https://images.unsplash.com/photo-1560264280-88b68371db39?w=400',
      description: 'Long flowing hair',
      offsetY: -0.5,
      scale: 1.6
    }
  ];

  useEffect(() => {
    loadFaceMesh();
    preloadHaircutImages();
    return () => {
      stopCamera();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const preloadHaircutImages = () => {
    haircuts.forEach((haircut, index) => {
      if (haircut.url) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = haircut.url;
        haircutImagesRef.current[index] = img;
      }
    });
  };

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
    const img = haircutImagesRef.current[selectedHaircut];
    
    if (!img || !img.complete) return;

    // Get key facial points for positioning
    const forehead = landmarks[10];
    const leftTemple = landmarks[356];
    const rightTemple = landmarks[127];
    const chin = landmarks[152];

    // Calculate face dimensions
    const faceWidth = Math.abs(
      (rightTemple.x * width) - (leftTemple.x * width)
    );
    const faceHeight = Math.abs(
      (chin.y * height) - (forehead.y * height)
    );

    // Calculate haircut position and size
    const haircutWidth = faceWidth * (haircut.scale || 1.4);
    const haircutHeight = haircutWidth * (img.height / img.width);
    
    const centerX = ((leftTemple.x + rightTemple.x) / 2) * width;
    const topY = forehead.y * height;
    
    const x = centerX - haircutWidth / 2;
    const y = topY + (faceHeight * (haircut.offsetY || -0.35));

    // Apply smooth rendering
    ctx.save();
    ctx.globalAlpha = 0.95;
    
    // Optional: Add rotation based on head tilt
    const angle = Math.atan2(
      rightTemple.y - leftTemple.y,
      rightTemple.x - leftTemple.x
    );
    
    ctx.translate(centerX, y + haircutHeight / 2);
    ctx.rotate(angle);
    ctx.drawImage(
      img,
      -haircutWidth / 2,
      -haircutHeight / 2,
      haircutWidth,
      haircutHeight
    );
    
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
        <div className="absolute bottom-20 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 z-10">
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