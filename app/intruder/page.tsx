"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertTriangle, Shield, Eye, Zap } from "lucide-react";

export default function IntruderDetectedPage() {
  const router = useRouter();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGoBack = () => {
    // Clear any intruder flags and redirect to dashboard
    if (typeof window !== 'undefined') {
      localStorage.removeItem('intruder_attempts');
      localStorage.removeItem('intruder_detected');
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-red-400/5 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-yellow-500/10 rounded-full animate-bounce"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Alert Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/20 rounded-full mb-6 relative">
            <AlertTriangle className="h-12 w-12 text-red-400 animate-pulse" />
            <div className="absolute inset-0 border-4 border-red-500/30 rounded-full animate-spin"></div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-red-400 font-mono mb-4 animate-pulse">
            🚨 INTRUDER DETECTED! 🚨
          </h1>
          
          <div className="text-2xl md:text-3xl font-bold text-red-300 font-mono mb-6">
            CAUGHT YOU RED-HANDED! 😂🕵️‍♂️
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-gray-900/90 border-2 border-red-500/50 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          {/* Animated Security Icons */}
          <div className="flex justify-center gap-4 mb-8">
            <Shield className={`h-8 w-8 text-red-400 ${animationStep === 0 ? 'animate-bounce' : ''}`} />
            <Eye className={`h-8 w-8 text-yellow-400 ${animationStep === 1 ? 'animate-bounce' : ''}`} />
            <Zap className={`h-8 w-8 text-blue-400 ${animationStep === 2 ? 'animate-bounce' : ''}`} />
            <AlertTriangle className={`h-8 w-8 text-red-400 ${animationStep === 3 ? 'animate-bounce' : ''}`} />
          </div>

          {/* Funny Messages */}
          <div className="space-y-6 text-center">
            <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-red-300 mb-4 font-mono">
                🎭 SECURITY BREACH DETECTED! 🎭
              </h2>
              <p className="text-lg text-gray-300 mb-4">
                Oh my! Someone tried to break into our super secure system! 🤣
              </p>
              <div className="text-6xl mb-4">👮‍♂️🚔💨</div>
              <p className="text-yellow-300 font-mono text-sm">
                Our digital police officers are on their way! 🚨
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-3xl mb-2">🕵️‍♂️</div>
                <h3 className="font-bold text-yellow-300 mb-2 font-mono">DETECTIVE SAYS:</h3>
                <p className="text-sm text-gray-300">
                  "Hmm, 3 wrong passwords? That's suspicious! Are you sure you're not a hacker? 🤔"
                </p>
              </div>

              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-bold text-blue-300 mb-2 font-mono">AI SAYS:</h3>
                <p className="text-sm text-gray-300">
                  "ERROR 404: Password.exe not found in your brain! 🧠💻"
                </p>
              </div>
            </div>

            <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-6">
              <div className="text-4xl mb-4">🎪🤡</div>
              <h3 className="text-xl font-bold text-purple-300 mb-3 font-mono">
                WELCOME TO THE HALL OF SHAME! 
              </h3>
              <p className="text-gray-300 mb-4">
                Congratulations! You've officially joined our exclusive club of people who can't remember passwords! 🏆
              </p>
              <div className="text-sm text-gray-400 font-mono">
                <p>📊 Statistics:</p>
                <p>• Failed Attempts: 3 ❌</p>
                <p>• Success Rate: 0% 📉</p>
                <p>• Recommended Action: Remember your password next time! 📝</p>
              </div>
            </div>

            {/* Fun Facts */}
            <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-4">
              <div className="text-3xl mb-2">💡</div>
              <h3 className="font-bold text-green-300 mb-2 font-mono">FUN FACT:</h3>
              <p className="text-sm text-gray-300">
                The most common password is still "password123". Yours wasn't even that creative! 😅
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Button
              onClick={handleGoBack}
              className="bg-blue-600 hover:bg-blue-700 font-mono text-lg px-8 py-3"
            >
              😔 I PROMISE TO REMEMBER NEXT TIME
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/login')}
              className="border-gray-500 text-gray-300 hover:bg-gray-800 font-mono px-8 py-3"
            >
              🔐 TRY LOGGING IN AGAIN
            </Button>
          </div>

          {/* Footer Message */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 font-mono">
              This message will self-destruct in... just kidding! 😂 But seriously, remember your password next time! 
            </p>
            <div className="mt-2 text-2xl">🤣🎉🔒</div>
          </div>
        </div>

        {/* Bottom Animation */}
        <div className="text-center mt-8">
          <div className="text-4xl animate-bounce">👻</div>
          <p className="text-sm text-gray-400 font-mono mt-2">
            The password ghost is watching you... 👀
          </p>
        </div>
      </div>
    </div>
  );
}
