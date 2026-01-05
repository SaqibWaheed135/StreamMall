import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle, X } from "lucide-react";
import logo from "../assets/logo.jpeg";
import { API_BASE_URL } from "../config/api";

// Load Poppins font dynamically
const poppinsLink = document.createElement("link");
poppinsLink.href =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
poppinsLink.rel = "stylesheet";
document.head.appendChild(poppinsLink);

// Load Google Script
const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve(window.google);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function Signup() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showReferralBonus, setShowReferralBonus] = useState(false);
  const [referralBonusAmount, setReferralBonusAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) sessionStorage.setItem("referralCode", ref);
  }, []);


  const handleSignUpSuccess = (token) => {
    // Save token
    localStorage.setItem('token', token);

    // Check for redirect URL
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');

    if (redirectUrl) {
      // Clear the stored redirect
      sessionStorage.removeItem('redirectAfterLogin');
      // Navigate to the stream
      navigate(redirectUrl);
    } else {
      // Default navigation to home
      navigate('/');
    }
  };


  // Email/Password Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError(t('signup.errors.passwordsDontMatch'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('signup.errors.passwordMinLength'));
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError(t('signup.errors.usernameMinLength'));
      setLoading(false);
      return;
    }

    try {
      const referralCode = sessionStorage.getItem("referralCode");

      const res = await axios.post(
        `${API_BASE_URL}/auth/signup`,
        { username, email, password, referralCode }
      );

      sessionStorage.removeItem("referralCode");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Show referral bonus snackbar if received
      if (res.data.referralBonus && res.data.referralBonus.received) {
        setReferralBonusAmount(res.data.referralBonus.amount);
        setShowReferralBonus(true);
        // Hide snackbar after 5 seconds
        setTimeout(() => setShowReferralBonus(false), 5000);
      }

      // ✅ Check for redirect
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');

      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.msg || t('signup.errors.signupFailed'));
    } finally {
      setLoading(false);
    }
  };


  // Google Signup
  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true);
    setError("");
    try {
      const idToken = response.credential;
      const referralCode = sessionStorage.getItem("referralCode");
      const res = await axios.post(
        `${API_BASE_URL}/auth/google`,
        { idToken, referralCode }
      );
      sessionStorage.removeItem("referralCode");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Show referral bonus snackbar if received
      if (res.data.referralBonus && res.data.referralBonus.received) {
        setReferralBonusAmount(res.data.referralBonus.amount);
        setShowReferralBonus(true);
        // Hide snackbar after 5 seconds
        setTimeout(() => setShowReferralBonus(false), 5000);
      }

      // ✅ Check for redirect
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');

      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("Google signup error:", err);
      setError(err.response?.data?.msg || t('signup.errors.googleSignupFailed'));
    } finally {
      setGoogleLoading(false);
    }
  };

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        console.warn("VITE_GOOGLE_CLIENT_ID not found in environment variables");
        return;
      }

      try {
        await loadGoogleScript();

        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false
          });

          const googleButtonDiv = document.getElementById("googleSignInDiv");
          if (googleButtonDiv) {
            googleButtonDiv.innerHTML = '';

            window.google.accounts.id.renderButton(googleButtonDiv, {
              theme: "outline",
              size: "large",
              width: "100%",
              text: "signup_with",
              shape: "rectangular",
              logo_alignment: "left"
            });
          }
        }
      } catch (error) {
        console.error("Failed to load Google Sign-In:", error);
        const googleButtonDiv = document.getElementById("googleSignInDiv");
        if (googleButtonDiv) {
          googleButtonDiv.innerHTML = `
            <div className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed">
              <span className="text-sm">${t('signup.errors.googleSignInUnavailable')}</span>
            </div>
          `;
        }
      }
    };

    initializeGoogleSignIn();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row bg-[#FFC0CB] text-black font-[Poppins] overflow-hidden relative"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Background Orbs */}
      <div className="absolute w-[600px] h-[600px] bg-pink-400 rounded-full blur-[200px] opacity-30 top-[-100px] left-[-200px]" />
      <div className="absolute w-[600px] h-[600px] bg-pink-300 rounded-full blur-[200px] opacity-30 bottom-[-200px] right-[-200px]" />

      {/* ===== Desktop Layout ===== */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center text-center relative z-10">
        <img
          src={logo}
          alt="StreamMall Logo"
          className="w-44 mb-6 drop-shadow-[0_0_30px_rgba(255,43,85,0.4)] rounded-[12px]"
        />
        <h1 className="text-4xl font-semibold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
          {t('signup.welcomeToClipStream')}
        </h1>
        <p className="text-gray-700 mt-3 text-lg max-w-sm">
          {t('signup.tagline')}
        </p>
      </div>

      {/* ===== Signup Card ===== */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-3xl border border-[#ff99b3] p-10 shadow-[0_0_30px_rgba(255,192,203,0.4)]">
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <img src={logo} alt="StreamMall Logo" className="w-20 mb-3 rounded-[12px]" />
            <h1 className="text-2xl font-semibold text-black">{t('signup.createAccount')}</h1>
            <p className="text-gray-700 text-sm">{t('signup.joinClipStream')}</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block mb-8">
            <h2 className="text-3xl font-semibold text-center mb-2">{t('signup.createAccount')}</h2>
            <p className="text-gray-700 text-center">{t('signup.joinClipStream')}</p>
          </div>

          {error && (
            <div className="bg-[#ffb3c6]/40 border border-[#ff99b3] rounded-lg p-3 mb-6 text-center text-pink-800">
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <div className="mb-6">
            <div
              id="googleSignInDiv"
              className={`${googleLoading ? 'opacity-50 pointer-events-none' : ''}`}
            ></div>
            {googleLoading && (
              <div className="flex items-center justify-center mt-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                <span className="text-gray-700 text-sm ml-2">{t('signup.signingUpWithGoogle')}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-6 relative flex items-center">
            <div className="flex-grow border-t border-[#ff99b3]" />
            <span className="mx-3 text-gray-700 text-sm">{t('signup.or')}</span>
            <div className="flex-grow border-t border-[#ff99b3]" />
          </div>

          {/* Email Form */}
          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label htmlFor="username" className="block text-sm text-gray-700 mb-1">
                {t('signup.username')}
              </label>
              <input
                id="username"
                type="text"
                className="w-full bg-white border border-[#ff99b3] rounded-lg p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                placeholder={t('signup.usernamePlaceholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                {t('signup.emailAddress')}
              </label>
              <input
                id="email"
                type="email"
                className="w-full bg-white border border-[#ff99b3] rounded-lg p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                placeholder={t('signup.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
                {t('signup.password')}
              </label>
              <input
                id="password"
                type="password"
                className="w-full bg-white border border-[#ff99b3] rounded-lg p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                placeholder={t('signup.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-gray-700 mb-1">
                {t('signup.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full bg-white border border-[#ff99b3] rounded-lg p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                placeholder={t('signup.passwordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(255,192,203,0.4)]"
              disabled={loading}
            >
              {loading ? t('signup.creatingAccount') : t('signup.signUp')}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-700 text-center mt-6">
            {t('signup.byCreatingAccount')}{" "}
            <Link to="/terms" className="text-pink-700 hover:text-pink-600 transition">
              {t('signup.terms')}
            </Link>{" "}
            {t('signup.and')}{" "}
            <Link to="/privacy" className="text-pink-700 hover:text-pink-600 transition">
              {t('signup.privacyPolicy')}
            </Link>
          </p>

          {/* Login Link */}
          <p className="text-gray-700 text-center mt-4">
            {t('signup.alreadyHaveAccount')}{" "}
            <Link
              to="/login"
              className="text-pink-700 hover:text-pink-600 font-medium transition"
            >
              {t('signup.logIn')}
            </Link>
          </p>
        </div>
      </div>

      {/* Referral Bonus Snackbar */}
      {showReferralBonus && (
        <div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-3 animate-slide-up max-w-md w-[90%]"
          style={{
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <CheckCircle className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm sm:text-base">
              {t('signup.referralBonusReceived', { amount: referralBonusAmount })}
            </p>
          </div>
          <button
            onClick={() => setShowReferralBonus(false)}
            className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}