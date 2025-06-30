import { useState } from 'react';
import { Clock, PlayCircle, PauseCircle, Calculator } from 'lucide-react';

export default function TimeCalculator() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [breakIn, setBreakIn] = useState('');
  const [breakOut, setBreakOut] = useState('');
  const [totalTime, setTotalTime] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateTime = () => {
    setIsCalculating(true);
    
    // Add animation delay for better UX
    setTimeout(() => {
      const toDate = (time) => time ? new Date(`1970-01-01T${time}:00`) : null;
      const start = toDate(checkIn);
      const bIn = toDate(breakIn);
      const bOut = toDate(breakOut);
      const end = toDate(checkOut);

      if (!start) {
        setTotalTime("⚠️ Please enter check-in time");
        setIsCalculating(false);
        return;
      }

      // Use current time if checkout is not provided
      const fallbackEnd = new Date(start.getTime());
      if (!end) {
        const now = new Date();
        fallbackEnd.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      }

      const actualEnd = end || fallbackEnd;
      let workedMs = actualEnd - start;

      // Handle overnight shifts
      if (workedMs < 0) {
        workedMs += 24 * 60 * 60 * 1000; // Add 24 hours
      }

      // Subtract break time if both break times are provided
      if (bIn && bOut && bOut > bIn) {
        workedMs -= (bOut - bIn);
      }

      if (workedMs < 0) {
        setTotalTime("❌ Invalid time range");
        setIsCalculating(false);
        return;
      }

      const seconds = Math.floor((workedMs / 1000) % 60);
      const minutes = Math.floor((workedMs / (1000 * 60)) % 60);
      const hours = Math.floor((workedMs / (1000 * 60 * 60)));

      setTotalTime(`${hours}h ${minutes}m ${seconds}s`);
      setIsCalculating(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Vibrant flowing background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 w-96 h-96 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-60 -left-60 w-96 h-96 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-bl from-yellow-400 via-orange-500 to-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-tr from-green-400 via-teal-500 to-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="relative bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] border border-gray-700/50 p-10 w-full max-w-2xl transform transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_0_rgba(0,0,0,0.8)]"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
        {/* Header with animated icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl mb-4 transform transition-all duration-300 hover:rotate-12 hover:scale-110 shadow-lg">
            <Clock className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Time Calculator
          </h2>
          <p className="text-gray-300 mt-2">Track your working hours with precision ⚡</p>
        </div>

        {/* Input Grid with staggered animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Check-in Time', value: checkIn, setter: setCheckIn, icon: PlayCircle, required: true },
            { label: 'Check-out Time', value: checkOut, setter: setCheckOut, icon: PauseCircle },
            { label: 'Break-in Time', value: breakIn, setter: setBreakIn, icon: PlayCircle },
            { label: 'Break-out Time', value: breakOut, setter: setBreakOut, icon: PauseCircle }
          ].map((field, index) => (
            <div 
              key={field.label}
              className="group transform transition-all duration-300 hover:-translate-y-1"
              style={{animationDelay: `${index * 100}ms`}}
            >
              <label className="flex items-center text-gray-200 text-sm font-medium mb-3">
                <field.icon className="w-4 h-4 mr-2 text-pink-400" />
                {field.label}
                {field.required && <span className="text-cyan-400 ml-1">*</span>}
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  className="w-full bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 hover:bg-gray-700/60 focus:bg-gray-700/60"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Clear Button */}
        {/* Calculate Button with loading animation */}
        <button
          onClick={() => {
            setCheckIn('');
            setCheckOut('');
            setBreakIn('');
            setBreakOut('');
            setTotalTime(null);
          }}
          className="w-full mt-4 py-3 rounded-xl bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 text-gray-200 font-medium hover:bg-gray-700/60 transform transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          Clear All Fields
        </button>
        <button
          onClick={calculateTime}
          disabled={isCalculating}
          className="w-full mt-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-95 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center">
            {isCalculating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5 mr-2" />
                Calculate Working Time
              </>
            )}
          </div>
        </button>

        {/* Results with entrance animation */}
        {totalTime && (
          <div className="mt-10 text-center transform transition-all duration-500 animate-fade-in-up">
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-all duration-300">
              <p className="text-white/70 text-sm font-medium mb-2">Total Worked Time</p>
              <p className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                {totalTime}
              </p>
              <div className="mt-4 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full transform scale-x-0 animate-scale-x"></div>
              
              {/* Additional stats */}
              {totalTime && !totalTime.includes('⚠️') && !totalTime.includes('❌') && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm text-white/60">
                    <span>Status:</span>
                    <span className="text-green-400">✓ Calculated</span>
                  </div>
                  {!checkOut && (
                    <div className="flex justify-between text-sm text-white/60 mt-1">
                      <span>Mode:</span>
                      <span className="text-yellow-400">⏰ Live tracking</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-x {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-scale-x {
          animation: scale-x 0.8s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}