"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

export default function Page() {
  const { param } = useParams();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (param && param !== "login" && param !== "register") {
      handleLinkSearch(param);
    }
  }, [param]);

  function handleLinkSearch(value) {
    setIsRedirecting(true);

    const redirectUrl = `${process.env.NEXT_PUBLIC_LINK_API_URL}/${value}`;

    window.location.replace(redirectUrl);
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Compact Professional Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-slate-900 text-lg">LinkHub</span>
            </div>
          </div>
        </header>

        {/* Main Content - Centered Redirect State */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-6">
            {/* Animated Loader */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
            </div>

            {/* Status Text */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">
                Redirecting you now
              </h2>
              <p className="text-slate-600 text-sm">
                Please wait while we take you to your destination
              </p>
            </div>

            {/* Link Preview Card */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-900">Short Link</p>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      /{param}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs text-slate-500">
              Secure link redirection powered by LinkHub
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return null;
}