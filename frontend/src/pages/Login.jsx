import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "https://streammall-backend-73a4b072d5eb.herokuapp.com/api/auth/login",
        { email, password }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
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
        "https://streammall-backend-73a4b072d5eb.herokuapp.com/api/auth/google",
        { idToken }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.response?.data?.msg || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        console.warn("Missing Google Client ID");
        return;
      }
      try {
        await loadGoogleScript();
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
          });
          const googleButtonDiv = document.getElementById("googleSignInDiv");
          if (googleButtonDiv) {
            googleButtonDiv.innerHTML = "";
            window.google.accounts.id.renderButton(googleButtonDiv, {
              theme: "outline",
              size: "large",
              width: "100%",
            });
          }
        }
      } catch (error) {
        console.error("Google Sign-In Error:", error);
      }
    };
    initializeGoogleSignIn();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row bg-[#0A0A0E] text-white font-[Poppins] overflow-hidden relative"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Background Orbs */}
      <div className="absolute w-[600px] h-[600px] bg-[#FF2B55] rounded-full blur-[200px] opacity-30 top-[-100px] left-[-200px]" />
      <div className="absolute w-[600px] h-[600px] bg-[#7B2FF7] rounded-full blur-[200px] opacity-30 bottom-[-200px] right-[-200px]" />

      {/* ===== Desktop Layout ===== */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center text-center relative z-10">
        <img
          src={logo}
          alt="StreamMall Logo"
          className="w-44 mb-6 drop-shadow-[0_0_30px_rgba(255,43,85,0.4)] rounded-[12px]"
        />
        <h1 className="text-4xl font-semibold bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] bg-clip-text text-transparent">
          Welcome to StreamMall
        </h1>
        <p className="text-gray-400 mt-3 text-lg max-w-sm">
          Stream, shop, and connect in the most futuristic live platform.
        </p>
      </div>

      {/* ===== Login Card ===== */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-md bg-[#16161A]/70 backdrop-blur-2xl rounded-3xl border border-[#2C2C33] p-10 shadow-[0_0_30px_rgba(155,27,255,0.2)]">
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <img src={logo} alt="StreamMall Logo" className="w-20 mb-3 rounded-[12px]" />
            <h1 className="text-2xl font-semibold text-white">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Sign in to StreamMall</p>
          </div>

          {error && (
            <div className="bg-[#3B0B0F] border border-[#FF4655] rounded-lg p-3 mb-6 text-center text-[#FFBABA]">
              {error}
            </div>
          )}

          {/* Email Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full bg-[#0D0D0F] border border-[#2C2C33] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7B2FF7] transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-400 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full bg-[#0D0D0F] border border-[#2C2C33] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF2B55] transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-[#7B2FF7] hover:text-[#FF2B55] transition"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#FF2B55] to-[#7B2FF7] text-white font-semibold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(123,47,247,0.4)]"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative flex items-center">
            <div className="flex-grow border-t border-[#2C2C33]" />
            <span className="mx-3 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-[#2C2C33]" />
          </div>

          {/* Google Sign-In */}
          <div className="flex flex-col items-center space-y-3">
            <div id="googleSignInDiv" className="hidden" />
            <button
              onClick={() => {
                const googleDiv = document.getElementById("googleSignInDiv");
                if (googleDiv) googleDiv.querySelector("div")?.click();
              }}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border border-[#2C2C33] bg-[#fff] hover:bg-[#1C1C22] text-black hover:text-white py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="w-5 h-5"
              />
              {googleLoading ? "Signing in with Google..." : "Sign in with Google"}
            </button>
          </div>

          {/* Signup Link */}
          <p className="text-gray-400 text-center mt-6">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-[#7B2FF7] hover:text-[#FF2B55] font-medium transition"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
