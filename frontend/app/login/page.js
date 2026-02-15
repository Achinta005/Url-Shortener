"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAccessToken, setIsAuthenticated,isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }
      if (data.data.session) {
        setAccessToken(data.data.session.access_token);
        setIsAuthenticated(true);

        setTimeout(() => {
          router.push("/home");
        }, 300);
      }
    } catch (error) {}
  };

  const handleOAuthLogin = (provider) => {
    console.log("🚀 Initiating OAuth login:", provider);

    // Main server will handle the redirect
    window.location.href = `${process.env.NEXT_PUBLIC_SERVER_API_URL}/auth/oauth/${provider}`;
  };

useEffect(() => {
  if(isAuthenticated){
    router.push('/home')
  }
}, [isAuthenticated])


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 relative z-10">
        {/* Left side - Branding */}
        <div className="hidden md:flex flex-col justify-center p-12 text-slate-800">
          <div className="space-y-6">
            <h1 className="text-6xl font-light tracking-tight leading-none">
              Welcome
              <br />
              <span className="font-serif italic text-7xl">back</span>
            </h1>
            <p className="text-lg text-slate-600 font-light max-w-md leading-relaxed">
              Continue your journey with us. Sign in to access your personalized
              dashboard and explore new possibilities.
            </p>
            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-px bg-amber-400"></div>
                <span className="text-sm text-slate-500 font-light">
                  Secure authentication
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-px bg-rose-400"></div>
                <span className="text-sm text-slate-500 font-light">
                  Multiple sign-in options
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-px bg-slate-400"></div>
                <span className="text-sm text-slate-500 font-light">
                  Fast and reliable
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
          <div className="mb-8">
            <h2 className="text-3xl font-light text-slate-800 mb-2">Sign in</h2>
            <p className="text-slate-500 font-light">
              Choose your preferred method
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-8">
            <button
              onClick={() => handleOAuthLogin("google")}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium text-slate-700 group-hover:text-slate-900">
                Continue with Google
              </span>
            </button>

            <button
              onClick={() => handleOAuthLogin("github")}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="font-medium group-hover:text-white">
                Continue with GitHub
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-slate-500 font-light">
                or sign in with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-2 border-slate-300 rounded focus:ring-2 focus:ring-amber-400"
                />
                <span className="text-slate-600 group-hover:text-slate-900">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white py-3.5 rounded-xl font-medium hover:from-amber-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign in
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 font-light">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
