import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, AlertCircle } from 'lucide-react';

const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front, 'environment' for rear
  const [faceDetected, setFaceDetected] = useState(false);
  const faceMeshRef = useRef(null);
  const animationRef = useRef(null);

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
      
      // Load MediaPipe Face Mesh
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

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      setFaceDetected(true);
      
      // Draw face mesh
      for (const landmarks of results.multiFaceLandmarks) {
        drawFaceMesh(ctx, landmarks, canvas.width, canvas.height);
      }
    } else {
      setFaceDetected(false);
    }
  };

  const drawFaceMesh = (ctx, landmarks, width, height) => {
    // Draw face outline
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Face contour indices
    const faceOval = [
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
      397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
      172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
    ];

    faceOval.forEach((idx, i) => {
      const point = landmarks[idx];
      const x = point.x * width;
      const y = point.y * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.stroke();

    // Draw key facial landmarks
    const keyPoints = [
      10,   // Forehead
      152,  // Chin
      33,   // Left eye
      263,  // Right eye
      1,    // Nose tip
      61,   // Left mouth corner
      291   // Right mouth corner
    ];

    ctx.fillStyle = '#00ff00';
    keyPoints.forEach(idx => {
      const point = landmarks[idx];
      const x = point.x * width;
      const y = point.y * height;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw forehead area for haircut placement
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    const hairlinePoints = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
    
    ctx.beginPath();
    hairlinePoints.slice(0, 18).forEach((idx, i) => {
      const point = landmarks[idx];
      const x = point.x * width;
      const y = point.y * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <h1 className="text-3xl font-bold text-white text-center">Virtual Haircut Studio</h1>
          <p className="text-white text-center mt-2 opacity-90">Face Detection System</p>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Status Bar */}
          <div className="mb-4 flex items-center justify-between bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-white font-medium">
                {faceDetected ? 'Face Detected' : 'No Face Detected'}
              </span>
            </div>
            <div className="text-gray-300 text-sm">
              Camera: {facingMode === 'user' ? 'Front' : 'Rear'}
            </div>
          </div>

          {/* Video/Canvas Container */}
          <div className="relative bg-black rounded-xl overflow-hidden shadow-lg mb-4" style={{ aspectRatio: '16/9' }}>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
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
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Camera is off</p>
                  <p className="text-gray-500 text-sm mt-2">Click "Start Camera" to begin</p>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-white">Loading Face Detection...</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-200 font-medium">Error</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                <Camera className="w-5 h-5" />
                <span>Start Camera</span>
              </button>
            ) : (
              <>
                <button
                  onClick={stopCamera}
                  className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-all shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                  <span>Stop Camera</span>
                </button>
                <button
                  onClick={switchCamera}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Switch Camera</span>
                </button>
              </>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">How it works:</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Green outline shows detected face mesh</li>
              <li>• Green dots mark key facial landmarks</li>
              <li>• Pink line indicates hairline area for haircut placement</li>
              <li>• Switch between front/rear camera as needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceDetection;