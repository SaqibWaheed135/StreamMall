import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";

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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) sessionStorage.setItem("referralCode", ref);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      setLoading(false);
      return;
    }

    try {
      const referralCode = sessionStorage.getItem("referralCode");

      const res = await axios.post(
        "https://theclipstream-backend.onrender.com/api/auth/signup",
        { username, email, password, referralCode }
      );

      sessionStorage.removeItem("referralCode");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true);
    setError("");

    try {
      const idToken = response.credential;
      const res = await axios.post(
        "https://theclipstream-backend.onrender.com/api/auth/google",
        { idToken }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.msg || "Google signup failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      try {
        await loadGoogleScript();
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
          });

          const googleButtonDiv = document.getElementById("googleSignInDiv");
          if (googleButtonDiv) {
            googleButtonDiv.innerHTML = "";
            window.google.accounts.id.renderButton(googleButtonDiv, {
              theme: "filled_black",
              size: "large",
              width: "100%",
              text: "signup_with",
              shape: "rectangular",
              logo_alignment: "left",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load Google Sign-In:", error);
      }
    };

    initializeGoogleSignIn();
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0b0b0f] text-white font-[Poppins] overflow-hidden">
      {/* Left Section (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#FF2B55] to-[#6C63FF] items-center justify-center relative">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

        <div className="relative z-10 text-center p-10">
          <img
            src={logo}
            alt="StreamMall Logo"
            className="w-44 mx-auto mb-8 rounded-[12px] drop-shadow-[0_0_30px_rgba(255,43,85,0.4)] hover:drop-shadow-[0_0_40px_rgba(108,99,255,0.6)] transition-all duration-500"
          />
          <h1 className="text-4xl font-bold mb-4">Welcome to StreamMall</h1>
          <p className="text-gray-200 max-w-md mx-auto leading-relaxed">
            Buy, sell, and stream products in one futuristic marketplace.
            Experience eCommerce reimagined with live interactions.
          </p>
        </div>
      </div>

      {/* Right Section (Form) */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-[#13131a]/80 backdrop-blur-lg p-8 rounded-2xl shadow-[0_0_25px_rgba(255,43,85,0.2)]">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img
              src={logo}
              alt="StreamMall Logo"
              className="w-28 mx-auto rounded-[12px] drop-shadow-[0_0_30px_rgba(255,43,85,0.4)]"
            />
          </div>

          <h2 className="text-3xl font-semibold text-center mb-2">Create Account</h2>
          <p className="text-gray-400 text-center mb-8">Join StreamMall today</p>

          {error && (
            <div className="bg-red-900/60 border border-red-700 text-red-300 text-sm text-center rounded-lg p-3 mb-6">
              {error}
            </div>
          )}

          {/* Google Signup */}
          <div id="googleSignInDiv" className="mb-6"></div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#13131a] text-gray-400">
                Or create with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            <input
              type="text"
              placeholder="Username"
              className="w-full p-3 bg-[#1a1a22] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF2B55] outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />

            <input
              type="email"
              placeholder="Email address"
              className="w-full p-3 bg-[#1a1a22] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF2B55] outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 bg-[#1a1a22] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#6C63FF] outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            <input
              type="password"
              placeholder="Confirm password"
              className="w-full p-3 bg-[#1a1a22] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#6C63FF] outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#FF2B55] to-[#6C63FF] hover:opacity-90 rounded-lg font-medium text-white shadow-lg transition-all duration-300"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-[#FF2B55] hover:text-[#6C63FF]">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-[#FF2B55] hover:text-[#6C63FF]">
              Privacy Policy
            </Link>
          </p>

          {/* Login Redirect */}
          <p className="text-gray-400 text-center mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#FF2B55] hover:text-[#6C63FF] font-medium"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
