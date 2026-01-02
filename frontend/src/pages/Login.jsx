import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
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

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();


  const handleLoginSuccess = (token) => {
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
 
 // Email/Password Login
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      { email, password }
    );
    
    // ✅ UPDATED: Use response.data instead of response.json()
    localStorage.setItem('token', response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    // ✅ Check for redirect
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');

    if (redirectUrl) {
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectUrl);
    } else {
      navigate('/');
    }

  } catch (err) {
    setError(err.response?.data?.msg || t('login.errors.loginFailed'));
  } finally {
    setLoading(false);
  }
};

  // Google Login
const handleGoogleResponse = async (response) => {
  setGoogleLoading(true);
  setError("");
  try {
    const idToken = response.credential;
    const res = await axios.post(
      `${API_BASE_URL}/auth/google`,
      { idToken }
    );
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    
    // ✅ Check for redirect
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');

    if (redirectUrl) {
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectUrl);
    } else {
      navigate('/');
    }
  } catch (err) {
    console.error("Google login error:", err);
    setError(err.response?.data?.msg || t('login.errors.googleLoginFailed'));
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
              text: "signin_with",
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
              <span className="text-sm">${t('login.googleSignInUnavailable')}</span>
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
          {t('login.welcomeToClipStream')}
        </h1>
        <p className="text-gray-700 mt-3 text-lg max-w-sm">
          {t('login.tagline')}
        </p>
      </div>

      {/* ===== Login Card ===== */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-3xl border border-[#ff99b3] p-10 shadow-[0_0_30px_rgba(255,192,203,0.4)]">
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <img src={logo} alt="StreamMall Logo" className="w-20 mb-3 rounded-[12px]" />
            <h1 className="text-2xl font-semibold text-black">{t('login.welcomeBack')}</h1>
            <p className="text-gray-700 text-sm">{t('login.signInToStreamMall')}</p>
          </div>

          {error && (
            <div className="bg-[#ffb3c6]/40 border border-[#ff99b3] rounded-lg p-3 mb-6 text-center text-pink-800">
              {error}
            </div>
          )}

          {/* Email Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                {t('login.emailAddress')}
              </label>
              <input
                id="email"
                type="email"
                className="w-full bg-white border border-[#ff99b3] rounded-lg p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
                {t('login.password')}
              </label>
              <input
                id="password"
                type="password"
                className="w-full bg-white border border-[#ff99b3] rounded-lg p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-pink-700 hover:text-pink-600 transition"
              >
                {t('login.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(255,192,203,0.4)]"
              disabled={loading}
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative flex items-center">
            <div className="flex-grow border-t border-[#ff99b3]" />
            <span className="mx-3 text-gray-700 text-sm">{t('login.or')}</span>
            <div className="flex-grow border-t border-[#ff99b3]" />
          </div>

          {/* Google Sign-In */}
          <div className="mb-6">
            <div
              id="googleSignInDiv"
              className={`${googleLoading ? 'opacity-50 pointer-events-none' : ''}`}
            ></div>
            {googleLoading && (
              <div className="flex items-center justify-center mt-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                <span className="text-gray-700 text-sm ml-2">{t('login.signingInWithGoogle')}</span>
              </div>
            )}
          </div>


          {/* Signup Link */}
          <p className="text-gray-700 text-center mt-6">
            {t('login.dontHaveAccount')}{" "}
            <Link
              to="/signup"
              className="text-pink-700 hover:text-pink-600 font-medium transition"
            >
              {t('login.createOne')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
