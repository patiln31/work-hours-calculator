import { useState, useEffect } from 'react'
import TimeCalculator from './components/TimeCalculator'
import WorkLifeFacts from './components/WorkLifeFacts'
import WeatherQuotes from './components/WeatherQuotes'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Vibrant flowing background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 w-96 h-96 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-60 -left-60 w-96 h-96 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-bl from-yellow-400 via-orange-500 to-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-tr from-green-400 via-teal-500 to-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Mobile Time Display - Minimal & Centered */}
      <div className="lg:hidden absolute top-3 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-gradient-to-r from-gray-900/70 via-black/60 to-gray-900/70 backdrop-blur-lg rounded-lg px-4 py-2 border border-gray-600/40"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(20,20,20,0.8) 50%, rgba(0,0,0,0.7) 100%)',
            boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
          <div className="text-sm font-semibold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Time Display - Full Glassmorphism */}
      <div className="hidden lg:block absolute top-6 right-6 z-20">
        <div className="bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-2xl p-4 border border-gray-700/50 transform hover:scale-105 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
          
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs text-gray-300 mt-1">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content - Responsive Layout */}
      <div className="min-h-screen relative z-10">
        
        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden flex flex-col">
          {/* Mobile Time Calculator */}
          <div className="flex-1 px-4 py-6">
            <TimeCalculator />
          </div>
          
          {/* Mobile Weather & Stats */}
          <div className="px-4 py-4">
            <WeatherQuotes />
          </div>
          
          {/* Mobile Work Life Balance */}
          <div className="px-4 py-4 pb-8">
            <WorkLifeFacts />
          </div>
        </div>

        {/* Desktop Layout - Three Columns */}
        <div className="hidden lg:grid lg:grid-cols-[320px_1fr_320px] min-h-screen">
          {/* Left Side Panel - Weather & Stats */}
          <div className="flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div className="flex flex-col justify-center min-h-full py-8">
                <WeatherQuotes />
              </div>
            </div>
          </div>
          
          {/* Main Calculator - Center */}
          <div className="flex items-center justify-center px-8 py-8">
            <div className="w-full max-w-4xl">
              <TimeCalculator />
            </div>
          </div>
          
          {/* Right Side Panel - Work Life Balance */}
          <div className="flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div className="flex flex-col justify-center min-h-full py-8">
                <WorkLifeFacts />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
