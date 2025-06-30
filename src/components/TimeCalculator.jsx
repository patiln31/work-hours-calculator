import { useState } from 'react';
import { Clock, PlayCircle, PauseCircle, Calculator, Timer } from 'lucide-react';

export default function TimeCalculator() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [breakIn, setBreakIn] = useState('');
  const [breakOut, setBreakOut] = useState('');
  const [totalTime, setTotalTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [expectedLeaveTime, setExpectedLeaveTime] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const WORKDAY_HOURS = 8.5; // 8 hours and 30 minutes
  const WORKDAY_MS = WORKDAY_HOURS * 60 * 60 * 1000; // Convert to milliseconds

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateTime = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const toDate = (time) => time ? new Date(`1970-01-01T${time}:00`) : null;
      const start = toDate(checkIn);
      const bIn = toDate(breakIn);
      const bOut = toDate(breakOut);
      const end = toDate(checkOut);

      if (!start) {
        setTotalTime("⚠️ Please enter check-in time");
        setTimeRemaining(null);
        setExpectedLeaveTime(null);
        setIsCalculating(false);
        return;
      }

      // Calculate expected leave time
      const now = new Date();
      const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startTimeToday = new Date(currentDate);
      startTimeToday.setHours(start.getHours(), start.getMinutes(), 0);

      let totalBreakMs = 0;
      if (bIn && bOut && bOut > bIn) {
        totalBreakMs = bOut - bIn;
      }

      // Calculate expected leave time (start time + 8.5 hours + break time)
      const expectedLeave = new Date(startTimeToday.getTime() + WORKDAY_MS + totalBreakMs);
      setExpectedLeaveTime(formatTime(expectedLeave));

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

      // Calculate total worked time including breaks
      const totalWorkedMs = workedMs;
      
      // Calculate actual worked time (excluding breaks)
      if (bIn && bOut && bOut > bIn) {
        workedMs -= totalBreakMs;
      }

      if (workedMs < 0) {
        setTotalTime("❌ Invalid time range");
        setTimeRemaining(null);
        setExpectedLeaveTime(null);
        setIsCalculating(false);
        return;
      }

      const seconds = Math.floor((workedMs / 1000) % 60);
      const minutes = Math.floor((workedMs / (1000 * 60)) % 60);
      const hours = Math.floor((workedMs / (1000 * 60 * 60)));

      // Calculate remaining time until 8.5 hours (excluding breaks)
      const remainingMs = WORKDAY_MS - workedMs;
      if (remainingMs > 0) {
        const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${remainingHours}h ${remainingMinutes}m`);
      } else {
        setTimeRemaining("Completed workday! 🎉");
      }

      setTotalTime(`${hours}h ${minutes}m ${seconds}s`);
      setIsCalculating(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 p-10 w-full max-w-2xl transform transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_0_rgba(31,38,135,0.5)]">
        {/* Header with animated icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl mb-4 transform transition-all duration-300 hover:rotate-12 hover:scale-110">
            <Clock className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
            Time Calculator
          </h2>
          <p className="text-white/60 mt-2">Track your working hours with precision ⚡</p>
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
              <label className="flex items-center text-white/80 text-sm font-medium mb-3">
                <field.icon className="w-4 h-4 mr-2 text-cyan-400" />
                {field.label}
                {field.required && <span className="text-pink-400 ml-1">*</span>}
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:bg-white/20 focus:bg-white/20"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Clear Button */}
        <button
          onClick={() => {
            setCheckIn('');
            setCheckOut('');
            setBreakIn('');
            setBreakOut('');
            setTotalTime(null);
            setTimeRemaining(null);
            setExpectedLeaveTime(null);
          }}
          className="w-full mt-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 font-medium hover:bg-white/20 transform transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          Clear All Fields
        </button>

        {/* Calculate Button with loading animation */}
        <button
          onClick={calculateTime}
          disabled={isCalculating}
          className="w-full mt-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-95 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-1 gap-6">
                {/* Total Time */}
                <div>
                  <p className="text-white/70 text-sm font-medium mb-2">Total Time (incl. breaks)</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                    {totalTime}
                  </p>
                </div>

                {/* Time Remaining and Expected Leave Time */}
                {timeRemaining && expectedLeaveTime && !totalTime.includes('⚠️') && !totalTime.includes('❌') && (
                  <>
                    <div className="h-px bg-white/10"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-white/70 text-sm font-medium mb-2">Time Until 8h 30m</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                          {timeRemaining}
                        </p>
                        <p className="text-xs text-white/50 mt-1">(Excluding breaks)</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm font-medium mb-2">Expected Leave Time</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                          {expectedLeaveTime}
                        </p>
                        <p className="text-xs text-white/50 mt-1">(Including breaks)</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full transform scale-x-0 animate-scale-x"></div>
                
                {/* Additional stats */}
                {totalTime && !totalTime.includes('⚠️') && !totalTime.includes('❌') && (
                  <div className="pt-4 border-t border-white/10">
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