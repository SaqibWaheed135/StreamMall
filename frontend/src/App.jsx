import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Home, Search, User, CircleDot, Bell, MessageSquare, FileText } from "lucide-react";
import axios from "axios";

import logo from "./assets/logo.png";
import AdBanner from "./components/AdBanner.jsx";
import HomeScreen from "./components/HomeScreen.jsx";
import SearchScreen from "./components/SearchScreen.jsx";
import LiveScreen from "./components/LiveStream.jsx";
import ProfileScreen from "./components/ProfileScreen.jsx";
import LiveBrowse from "./pages/LiveBrowse.jsx";
import EditProfileScreen from "./components/EditProfileScreen.jsx";
import AddFriendsScreen from "./components/AddFriendScreen.jsx";
import PointsTransfer from "./components/PointsTransfer.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/SignUp.jsx";
import MessagingScreen from "./components/MessagingScreen.jsx";
import PointsRechargeScreen from "./components/PointsRechargeScreen.jsx";
import NotificationsScreen from "./components/NotificationsScreen.jsx";
import FollowRequestsScreen from "./components/FollowRequestScreen.jsx";
import PointsWithdrawalScreen from "./components/PointsWithdrawalScreen.jsx";
import HostLiveStream from "./components/HostLiveStream.jsx";
import ViewerLiveStream from "./components/ViewerLiveStream.jsx";
import LiveStreamsListing from './components/LiveStream.jsx';
import LiveStreamRouter from "./pages/LiveStreamRouter.jsx";
import FaceDetection from "./components/FaceCamera.jsx";
import PolicyScreens from "./components/PolicyScreen.jsx";


// ✅ Load Poppins font dynamically
const poppinsLink = document.createElement("link");
poppinsLink.href =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
poppinsLink.rel = "stylesheet";
document.head.appendChild(poppinsLink);

// --------------------
// Bottom Navigation
// --------------------
const BottomNavigation = ({ currentScreen, navigate }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'live', icon: CircleDot, label: 'LIVE', path: '/live-streams' },
    { id: 'search', icon: Search, label: 'Discover', path: '/search' },
    { id: 'messages', icon: MessageSquare, label: 'Messages', path: '/messaging' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
    { id: 'Policies', icon: FileText, label: 'Policies', path: '/terms-policies' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 font-[Poppins]">
      <div className="mx-auto max-w-5xl px-2 pb-4">
        <div className="bg-white/90 border border-white/70 rounded-3xl shadow-[0_12px_40px_rgba(255,153,179,0.35)] backdrop-blur-xl overflow-hidden px-2">
          <div className="flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="flex-1 py-3 px-1 flex flex-col items-center justify-center min-h-[64px] transition-all"
                >
                  <div
                    className={`w-10 h-10 mb-1 flex items-center justify-center rounded-2xl transition-all ${isActive
                      ? 'bg-gradient-to-br from-pink-600 via-pink-500 to-rose-400 text-white shadow-lg shadow-pink-200 scale-105'
                      : 'text-pink-500/60 hover:text-pink-600'
                      }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-xs tracking-wide transition-all ${isActive ? 'text-pink-600 font-semibold' : 'text-gray-500'
                      }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------
// Token Check
// --------------------
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    const exp = payload.exp * 1000;
    return Date.now() < exp;
  } catch (e) {
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const valid = isTokenValid(token);
  if (!valid) {
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
  return children;
};

// --------------------
// Wrapper for ViewerLiveStream (OLD - for backward compatibility)
// --------------------
const ViewerLiveStreamWrapper = ({ onBack }) => {
  const { streamId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/live-streams');
  };

  return <ViewerLiveStream streamId={streamId} onBack={handleBack} />;
};

// --------------------
// App Component
// --------------------
const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState(location.pathname);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);


  useEffect(() => {
    setCurrentScreen(location.pathname);
  }, [location]);

  // Check if app is already installed (running in standalone mode)
  useEffect(() => {
    const checkStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(checkStandalone);
  }, []);

  // PWA & iOS install handling
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user hasn't dismissed install prompt permanently
      const installDismissed = localStorage.getItem("pwaInstallDismissed");
      if (!installDismissed && !isStandalone) {
        setShowInstallButton(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isStandalone]);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(
      window.navigator.userAgent.toLowerCase()
    );
    const isInStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;

    if (isIos && !isInStandalone) {
      const dismissedUntil = localStorage.getItem("iosBannerDismissedUntil");
      const permanentlyDismissed = localStorage.getItem("iosBannerPermanentlyDismissed");
      const now = Date.now();

      if (!permanentlyDismissed && (!dismissedUntil || now > Number(dismissedUntil))) {
        // Show banner after a short delay for better UX
        setTimeout(() => setShowIosBanner(true), 2000);
      }
    }
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA installed');
        }
        setDeferredPrompt(null);
        setShowInstallButton(false);
      });
    }
  };

  const handleDismissInstall = () => {
    setShowInstallButton(false);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    localStorage.setItem("pwaInstallDismissed", expiresAt.toString());
  };

  const handleDismissIosBanner = (permanent = false) => {
    setShowIosBanner(false);
    if (permanent) {
      localStorage.setItem("iosBannerPermanentlyDismissed", "true");
    } else {
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      localStorage.setItem("iosBannerDismissedUntil", expiresAt.toString());
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0A0A0E] text-white font-[Poppins]"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(255,43,85,0.08), rgba(123,47,247,0.08))",
      }}
    >
      <main className="pb-[120px] bg-[#FFC0CB]">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected */}
          <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchScreen /></ProtectedRoute>} />
          <Route path="/live" element={<ProtectedRoute><LiveScreen /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfileScreen /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsScreen /></ProtectedRoute>} />
          <Route path="/follow-requests" element={<ProtectedRoute><FollowRequestsScreen /></ProtectedRoute>} />
          <Route path="/add-friends" element={<ProtectedRoute><AddFriendsScreen /></ProtectedRoute>} />
          <Route path="/recharge-points" element={<ProtectedRoute><PointsRechargeScreen /></ProtectedRoute>} />
          <Route path="/withdraw-points" element={<ProtectedRoute><PointsWithdrawalScreen /></ProtectedRoute>} />
          <Route path="/transfer-points" element={<ProtectedRoute><PointsTransfer /></ProtectedRoute>} />
          <Route path="/messaging" element={<ProtectedRoute><MessagingScreen /></ProtectedRoute>} />
          <Route path="/messages/:conversationId" element={<ProtectedRoute><MessagingScreen /></ProtectedRoute>} />
          <Route path="/live-browse" element={<ProtectedRoute><LiveBrowse /></ProtectedRoute>} />
          <Route path="/face-detection" element={<ProtectedRoute><FaceDetection /></ProtectedRoute>} />
          <Route path="/terms-policies" element={<PolicyScreens />} />


          {/* ✅ UPDATED: Live Stream Routes with LiveStreamRouter */}

          {/* Main live streams listing page */}
          <Route path="/live-streams" element={
            <ProtectedRoute>
              <LiveStreamsListing
                onStartStream={() => navigate('/host-live-stream')}
                onJoinStream={(streamId) => navigate(`/stream/${streamId}`)}
              />
            </ProtectedRoute>
          } />

          {/* Host live stream */}
          <Route
            path="/host-live-stream"
            element={
              <ProtectedRoute>
                <HostLiveStream onBack={() => navigate('/live-streams')} />
              </ProtectedRoute>
            }
          />

          {/* ✅ NEW: Shareable stream link - Handles auth internally */}
          <Route
            path="/stream/:streamId"
            element={<LiveStreamRouter />}
          />

          {/* Alternative routes (for backward compatibility) */}
          <Route
            path="/watch/:streamId"
            element={<LiveStreamRouter />}
          />

          {/* Old viewer route - kept for backward compatibility */}
          <Route
            path="/viewer-live-stream/:streamId"
            element={
              <ProtectedRoute>
                <ViewerLiveStreamWrapper />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Android Install Button */}
      {showInstallButton && !isStandalone && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-slideUp">
          <div className="bg-gradient-to-br from-white to-pink-50 border-2 border-pink-200 rounded-2xl shadow-2xl p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-2 flex-shrink-0">
                <img src={logo} alt="StreamMall" className="w-10 h-10 rounded-lg" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  Install StreamMall
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get quick access from your home screen
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    Install
                  </button>
                  <button
                    onClick={handleDismissInstall}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS Add to Home Banner */}
      {showIosBanner && !isStandalone && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-slideUp">
          <div className="bg-gradient-to-br from-white to-pink-50 border-2 border-pink-200 rounded-2xl shadow-2xl p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-2 flex-shrink-0">
                <img src={logo} alt="StreamMall" className="w-10 h-10 rounded-lg" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base mb-1 flex items-center gap-1">
                  📱 Install StreamMall
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Add to your home screen for the best experience:
                </p>
                <ol className="text-sm text-gray-700 mb-3 space-y-1 bg-pink-50 rounded-lg p-2">
                  <li className="flex items-center gap-2">
                    <span className="font-bold text-pink-600">1.</span>
                    Tap the <span className="inline-flex items-center px-2 py-0.5 bg-white rounded border border-pink-200 text-xs font-semibold">Share</span> button below
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-bold text-pink-600">2.</span>
                    Select <span className="font-semibold">"Add to Home Screen"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-bold text-pink-600">3.</span>
                    Tap <span className="font-semibold">"Add"</span>
                  </li>
                </ol>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDismissIosBanner(true)}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg text-sm"
                  >
                    Got it!
                  </button>
                  <button
                    onClick={() => handleDismissIosBanner(false)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {localStorage.getItem("token") && (
        <BottomNavigation currentScreen={currentScreen} navigate={navigate} />
      )}
    </div>
  );
};

export default App;