"use client";
import Link from "next/link";
import { useAuth } from "./context/authContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/20 bg-white/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center transform rotate-12 shadow-lg">
                <svg
                  className="w-6 h-6 text-white transform -rotate-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                LinkSnip
              </span>
            </div>

            {/* Navigation Buttons */}
            {!isAuthenticated && (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors duration-200 rounded-lg hover:bg-white/50"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight">
              Shorten your links,
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                amplify your reach
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto font-light">
              Transform long, complex URLs into short, memorable links. Track
              clicks, analyze performance, and share with confidence.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/home"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 text-lg"
              >
                Get Started Free
              </Link>
              <button className="px-8 py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:border-slate-400 hover:bg-white/50 transition-all duration-200 text-lg">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Lightning Fast
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Create shortened links in milliseconds. Our optimized
                infrastructure ensures your links are always fast and reliable.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Analytics
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Track every click with detailed analytics. Understand your
                audience with location, device, and referrer insights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Secure</h3>
              <p className="text-slate-600 leading-relaxed">
                Your links are protected with enterprise-grade security. SSL
                encryption and spam protection included by default.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-800 mb-4">
              How it works
            </h2>
            <p className="text-xl text-slate-600 font-light">
              Simple, fast, and effective
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold rounded-full items-center justify-center mb-6 shadow-xl">
                1
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Paste your link
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Copy your long URL and paste it into our shortener. Works with
                any valid web address.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold rounded-full items-center justify-center mb-6 shadow-xl">
                2
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Get your short link
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Instantly receive a shortened URL that's easy to share and
                remember.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 text-white text-2xl font-bold rounded-full items-center justify-center mb-6 shadow-xl">
                3
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Share & track
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Share your link anywhere and track performance with real-time
                analytics.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust LinkSnip for their URL
              shortening needs. Start for free today.
            </p>
            <Link
              href="/register"
              className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 bg-white/40 backdrop-blur-md mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center transform rotate-12">
                  <svg
                    className="w-5 h-5 text-white transform -rotate-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-slate-800">
                  LinkSnip
                </span>
              </div>
              <p className="text-slate-600 text-sm">
                The simple way to shorten, share, and track your links.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-3">Product</h4>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-3">Company</h4>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>
                  <a href="#" className="hover:text-slate-900">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-3">Legal</h4>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-slate-600 text-sm">
            <p>&copy; 2024 LinkSnip. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
