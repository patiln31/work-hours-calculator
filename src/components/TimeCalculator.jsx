import { useState, useEffect } from 'react';
import { Clock, PlayCircle, PauseCircle, Calculator } from 'lucide-react';

export default function TimeCalculator() {
  // Set default times
  const [checkIn, setCheckIn] = useState('10:00');
  const [checkOut, setCheckOut] = useState('');
  const [breakIn, setBreakIn] = useState('14:00');  // 2:00 PM in 24-hour format
  const [breakOut, setBreakOut] = useState('14:30'); // 2:30 PM in 24-hour format
  const [calculationResults, setCalculationResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const REQUIRED_HOURS = 8.5; // 8.5 hours required work time

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format current time with seconds
  const formatCurrentTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

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
        setCalculationResults({
          error: "⚠️ Please enter check-in time"
        });
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

      // Calculate break duration
      let breakDuration = 0;
      if (bIn && bOut && bOut > bIn) {
        breakDuration = bOut - bIn;
        workedMs -= breakDuration;
      }

      if (workedMs < 0) {
        setCalculationResults({
          error: "❌ Invalid time range"
        });
        setIsCalculating(false);
        return;
      }

      const workedHours = workedMs / (1000 * 60 * 60);
      const remainingHours = Math.max(0, REQUIRED_HOURS - workedHours);
      
      // Calculate expected leave time
      const expectedLeaveTime = new Date(start.getTime() + (REQUIRED_HOURS * 60 * 60 * 1000) + breakDuration);
      
      // Format times
      const formatTime = (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
      };

      const formatTimeOfDay = (date) => {
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      };

      setCalculationResults({
        totalWorked: formatTime(workedMs),
        remainingTime: formatTime(remainingHours * 60 * 60 * 1000),
        expectedLeaveTime: formatTimeOfDay(expectedLeaveTime),
        isLive: !end
      });
      
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
        {/* Current Time Display */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-gray-900/60 to-black/60 backdrop-blur-md rounded-xl px-4 py-2 border border-gray-700/30">
          <p className="text-sm text-gray-400 mb-1">Current Time</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {formatCurrentTime(currentTime)}
          </p>
        </div>

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
        <button
          onClick={() => {
            setCheckIn('10:00');
            setCheckOut('');
            setBreakIn('14:00');
            setBreakOut('14:30');
            setCalculationResults(null);
          }}
          className="w-full mt-4 py-3 rounded-xl bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 text-gray-200 font-medium hover:bg-gray-700/60 transform transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          Clear All Fields
        </button>

        {/* Calculate Button with loading animation */}
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
        {calculationResults && (
          <div className="mt-10 text-center transform transition-all duration-500 animate-fade-in-up">
            {calculationResults.error ? (
              <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
                <p className="text-2xl font-bold text-red-400">{calculationResults.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Total Worked Time */}
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-all duration-300">
                  <p className="text-white/70 text-sm font-medium mb-2">Total Worked Time</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {calculationResults.totalWorked}
                  </p>
                </div>

                {/* Time Remaining */}
                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-all duration-300">
                  <p className="text-white/70 text-sm font-medium mb-2">Time Until {REQUIRED_HOURS} Hours</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {calculationResults.remainingTime}
                  </p>
                </div>

                {/* Expected Leave Time */}
                <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-all duration-300">
                  <p className="text-white/70 text-sm font-medium mb-2">Expected Leave Time</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    {calculationResults.expectedLeaveTime}
                  </p>
                </div>

                {/* Status Information */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm text-white/60">
                    <span>Status:</span>
                    <span className="text-green-400">✓ Calculated</span>
                  </div>
                  {calculationResults.isLive && (
                    <div className="flex justify-between text-sm text-white/60 mt-1">
                      <span>Mode:</span>
                      <span className="text-yellow-400">⏰ Live tracking</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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