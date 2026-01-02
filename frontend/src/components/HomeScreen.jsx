import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  Zap,
  Users,
  Radio,
  Coins,
  Menu,
  X,
  User,
  LogOut,
  WifiOff,
  Banknote,
  Wallet,
  UserPlus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import HostLiveStream from "./HostLiveStream";
import PointsTransfer from "./PointsTransfer";
import Logo from "../assets/logo.jpeg";
import { useNavigate, useRoutes } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import LanguageSwitcher from "./LanguageSwitcher";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export default function StreamMallHome() {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState("discover");
  const [liveRooms, setLiveRooms] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [pointsLoading, setPointsLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    fetchLiveRooms();
    fetchUserFriends();
    fetchUserPoints();
  }, []);

  const fetchUserPoints = async () => {
    try {
      setPointsLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/points/balance`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const pointsData = await response.json();
        setUserCoins(pointsData.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching user points:", error);
    } finally {
      setPointsLoading(false);
    }
  };

  const fetchLiveRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/live`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to fetch streams');
      }
      
      // Filter out the current user's own streams
      const userData = localStorage.getItem("user");
      let currentUserId = null;
      if (userData) {
        try {
          const user = JSON.parse(userData);
          currentUserId = user._id || user.id;
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
      
      const filteredData = currentUserId 
        ? data.filter(stream => {
            const streamerId = stream.streamer?._id || stream.streamer?.id || stream.streamer;
            return streamerId !== currentUserId;
          })
        : data;
      
      setLiveRooms(filteredData);

    } catch (error) {
      console.error("Error fetching live rooms:", error);
    }
  };

  const fetchUserFriends = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/follow/friends`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const friends = await response.json();
        setFriendsList(friends.data || friends);
      } else {
        const [followersRes, followingRes] = await Promise.all([
          fetch(`${API_BASE_URL}/follow/followers`, {
            headers: getAuthHeaders(),
          }),
          fetch(`${API_BASE_URL}/follow/following`, {
            headers: getAuthHeaders(),
          }),
        ]);
        if (followersRes.ok && followingRes.ok) {
          const followers = await followersRes.json();
          const following = await followingRes.json();
          const mutualFriends = following.data.filter((followed) =>
            followers.data.some((follower) => follower._id === followed._id)
          );
          setFriendsList(mutualFriends);
        }
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Clear active host stream when user logs out
    localStorage.removeItem("activeHostStream");
    window.location.href = "/login";
  };

const LiveRoomCard = ({ room }) => {
  const navigate = useNavigate();
  const streamer = room.streamer || {};
  const streamerAvatar = streamer.avatar || '';
  const streamerUsername = streamer.username || 'Unknown Host';
  const title = room.title || 'Live Stream';
  const description = room.description || '';
  const currentViewers = room.currentViewers || room.viewers?.length || 0;
  const products = room.products || [];

  const handleJoinLive = () => {
    navigate(`/viewer-live-stream/${room._id}`);
  };

  return (
    <div className="group cursor-pointer relative">
      <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg border border-white/10">
        {/* Thumbnail Placeholder */}
        <div className="w-full aspect-[9/16] bg-gradient-to-br from-[#FF2B55]/30 via-[#7B2FF7]/30 to-[#00CFFF]/30 flex items-center justify-center relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF2B55] via-[#7B2FF7] to-[#00CFFF] opacity-10" />
          
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF2B55] to-[#7B2FF7] rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {streamerUsername[0]?.toUpperCase()}
              </span>
            </div>
            <p className="text-white/60 text-sm font-semibold">Live Stream</p>
          </div>
          
          {/* Hover effect */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* LIVE Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-white text-xs font-bold">LIVE</span>
        </div>
        
        {/* Viewer Count */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1 z-10">
          <Users className="w-3 h-3 text-white" />
          <span className="text-white text-xs font-semibold">
            {currentViewers.toLocaleString()}
          </span>
        </div>
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-5" />
        
        {/* Content - visible on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 z-10">
          {/* Streamer Info */}
          <div className="flex items-center gap-3 mb-4">
            {streamerAvatar ? (
              <img
                src={streamerAvatar}
                alt={streamerUsername}
                className="w-10 h-10 rounded-full border-2 border-white object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[#FF2B55] to-[#7B2FF7] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {streamerUsername[0]?.toUpperCase()}
                </span>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">
                {streamerUsername}
              </p>
              {description && (
                <p className="text-gray-300 text-xs truncate">{description}</p>
              )}
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-white font-bold text-sm mb-3 line-clamp-2">
            {title}
          </h3>
          
          {/* Products */}
          {products.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {products.slice(0, 2).map((product) => (
                <div
                  key={product._id}
                  className="bg-white/10 backdrop-blur px-2 py-1 rounded-lg flex-shrink-0"
                >
                  <p className="text-white text-xs font-semibold truncate">
                    {product.name}
                  </p>
                  <p className="text-yellow-400 text-xs font-bold">
                    ${product.price}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {/* Join Button */}
          <button 
            onClick={handleJoinLive}
            className="w-full bg-gradient-to-r from-[#FF2B55] via-[#7B2FF7] to-[#00CFFF] hover:from-[#FF2B55]/80 hover:via-[#7B2FF7]/80 hover:to-[#00CFFF]/80 text-white font-bold py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(255,43,85,0.4)]">
            {t('home.joinLive')}
          </button>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-[#FFC0CB] text-black font-[Poppins]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FFC0CB]/95 backdrop-blur border-b border-[#ff99b3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <img
            src={Logo}
            alt="StreamMall Logo"
            className="w-20 sm:w-28 rounded-xl drop-shadow-[0_0_30px_rgba(255,43,85,0.4)]"
          />

          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="light" className="!bg-white/20 !border-white/30" />
            
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#ff99b3]">
              <Coins className="w-5 h-5 text-pink-700" />
              {pointsLoading ? (
                <span className="font-bold text-gray-700">{t('common.loading')}</span>
              ) : (
                <span className="font-bold text-black">{userCoins}</span>
              )}
            </div>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-[#ffb3c6] rounded-lg transition-colors"
            >
              {showMenu ? (
                <X className="w-6 h-6 text-pink-700" />
              ) : (
                <Menu className="w-6 h-6 text-pink-700" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Drawer */}
        {showMenu && (
          <div className="bg-[#FFC0CB] backdrop-blur border-t border-[#ff99b3] p-4 space-y-3">
            <button className="w-full flex items-center gap-3 p-3 hover:bg-[#ffb3c6] rounded-lg transition-colors text-left">
              <User className="w-5 h-5 text-pink-700" />
              <span>{t('navbar.profile')}</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-[#ffb3c6] rounded-lg transition-colors text-left" onClick={() => (window.location.href = '/search')}>
              <Users className="w-5 h-5 text-pink-700" />
              <span>{t('home.friends')}</span>
            </button>

            <button className="w-full flex items-center gap-3 p-3 hover:bg-[#ffb3c6] rounded-lg transition-colors text-left" onClick={() => (window.location.href = '/recharge-points')}
            >
              <Coins className="w-5 h-5 text-pink-700" />
              <span>{t('profile.rechargePoints')}</span>
            </button>

            <button className="w-full flex items-center gap-3 p-3 hover:bg-[#ffb3c6] rounded-lg transition-colors text-left" onClick={() => (window.location.href = '/withdraw-points')}
            >
              <Wallet className="w-5 h-5 text-pink-700" />
              <span>{t('profile.withdraw')} {t('home.points')}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 hover:bg-red-100 rounded-lg transition-colors text-left text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="sticky top-[73px] z-30 bg-[#FFC0CB]/90 backdrop-blur border-b border-[#ff99b3]">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto whitespace-nowrap">
          {[
            { id: "discover", label: `🔥 ${t('home.discover')}`, icon: Zap },
            { id: "friends", label: `👥 ${t('home.friends')}`, icon: Users },
            { id: "create", label: `📡 ${t('home.goLive')}`, icon: Radio },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`py-4 px-4 font-semibold border-b-2 transition-all ${currentTab === tab.id
                ? "border-pink-600 text-black"
                : "border-transparent text-gray-700 hover:text-black"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Discover Tab */}
        {currentTab === "discover" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">{t('common.live')} {t('common.now')}</h2>

            {liveRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-white/70 p-6 rounded-2xl border border-[#ff99b3] shadow-lg">
                  <WifiOff className="w-12 h-12 text-pink-700 mb-4" />
                  <h3 className="text-lg font-bold text-black">
                    {t('home.noStreams')}
                  </h3>
                  <p className="text-gray-700 text-sm mt-2">
                    {t('home.startStreaming')}
                  </p>
                  <button
                    onClick={() => setCurrentTab("create")}
                    className="mt-4 bg-gradient-to-r from-pink-600 to-pink-500 px-5 py-2 rounded-xl text-white font-semibold hover:scale-105 transition-all"
                  >
                    {t('home.goLive')} 🚀
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {liveRooms.map((room) => (
                  <LiveRoomCard key={room._id} room={room} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friends Tab */}
        {currentTab === "friends" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">{t('home.friends')} & {t('chat.chat')}</h2>
            <div className="bg-white/70 backdrop-blur border border-[#ff99b3] rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-700" />
                {t('home.myFriends')}
              </h3>
              <div className="space-y-3">
                {friendsList.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between p-3 bg-white border border-[#ff99b3] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-pink-500 rounded-full" />
                      <span className="font-semibold">{friend.username}</span>
                    </div>
                    <button className="text-pink-700 hover:opacity-80 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/add-friends")}
                className="w-full mt-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white py-2 rounded-lg font-bold hover:shadow-lg transition-all"
              >
                {t('home.addFriend')}
              </button>
            </div>
          </div>
        )}

        {/* Go Live Tab */}
        {currentTab === "create" && (
          <HostLiveStream onBack={() => setCurrentTab("discover")} />
        )}
      </div>
    </div>
  );
}
