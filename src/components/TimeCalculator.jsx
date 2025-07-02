import { useState, useEffect } from 'react';
import { Clock, PlayCircle, PauseCircle, Calculator, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { timeEntriesService } from '../services/timeEntries';
import LoginModal from './LoginModal';

export default function TimeCalculator() {
    // Set default times
    const [checkIn, setCheckIn] = useState('10:00');
    const [checkOut, setCheckOut] = useState('');
    const [breakIn, setBreakIn] = useState('14:00');  // 2:00 PM in 24-hour format
    const [breakOut, setBreakOut] = useState('14:30'); // 2:30 PM in 24-hour format
    const [calculationResults, setCalculationResults] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', or null
    const [pendingTimeData, setPendingTimeData] = useState(null);
    const REQUIRED_HOURS = 8.5; // 8.5 hours required work time
    const STANDARD_BREAK_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

    const { user } = useAuth();

    // Real-time updates every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
            // Auto-recalculate if results exist and no check-out time (live tracking)
            if (calculationResults && !checkOut) {
                calculateTimeRealtime();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [calculationResults, checkOut, checkIn, breakIn, breakOut]);

    // Format time function - available globally in component
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
            second: '2-digit',
            hour12: true
        });
    };

    const formatLeaveTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const isPM = hours >= 12;
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

        if (minutes === 0) {
            return `${displayHours}h ${isPM ? 'PM' : 'AM'}`;
        } else {
            return `${displayHours}h ${minutes}m ${isPM ? 'PM' : 'AM'}`;
        }
    };

    // Handle saving time entries
    const handleSaveTimeEntry = async () => {
        if (!calculationResults || calculationResults.error) return;

        const timeData = timeEntriesService.parseCalculatorData(calculationResults, {
            checkIn,
            checkOut,
            breakIn,
            breakOut
        });

        if (!timeData) return;

        // If user is not logged in, show login modal
        if (!user) {
            setPendingTimeData(timeData);
            setShowLoginModal(true);
            return;
        }

        // Show confirmation dialog
        if (!window.confirm('This data will be stored to improve your time records. Continue?')) {
            return;
        }

        setIsSaving(true);
        setSaveStatus(null);

        try {
            const result = await timeEntriesService.saveTimeEntry(timeData);
            if (result.success) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus(null), 5000);
            }
        } catch (error) {
            console.error('Error saving time entry:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle successful login
    const handleLoginSuccess = async () => {
        if (pendingTimeData) {
            setShowLoginModal(false);
            
            // Show confirmation dialog after login
            if (window.confirm('This data will be stored to improve your time records. Continue?')) {
                setIsSaving(true);
                setSaveStatus(null);

                try {
                    const result = await timeEntriesService.saveTimeEntry(pendingTimeData);
                    if (result.success) {
                        setSaveStatus('success');
                        setTimeout(() => setSaveStatus(null), 3000);
                    } else {
                        setSaveStatus('error');
                        setTimeout(() => setSaveStatus(null), 5000);
                    }
                } catch (error) {
                    console.error('Error saving time entry after login:', error);
                    setSaveStatus('error');
                    setTimeout(() => setSaveStatus(null), 5000);
                } finally {
                    setIsSaving(false);
                    setPendingTimeData(null);
                }
            } else {
                setPendingTimeData(null);
            }
        }
    };

    // Real-time calculation function (without animation delay)
    const calculateTimeRealtime = () => {
        try {
            const toDate = (time) => time ? new Date(`1970-01-01T${time}:00`) : null;
            const start = toDate(checkIn);
            const bIn = toDate(breakIn);
            const bOut = toDate(breakOut);
            const end = toDate(checkOut);

            if (!start) return;

            // Use current time if checkout is not provided
            const fallbackEnd = new Date(start.getTime());
            if (!end) {
                const now = currentTime;
                fallbackEnd.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
            }

            const actualEnd = end || fallbackEnd;
            let workedMs = actualEnd - start;

            // Handle overnight shifts
            if (workedMs < 0) {
                workedMs += 24 * 60 * 60 * 1000; // Add 24 hours
            }

            // Calculate break duration and break credit system
            let actualBreakDuration = 0;
            let breakCredit = 0;
            let breakInfo = null;

            if (bIn && bOut && bOut > bIn) {
                // Calculate the planned break duration
                const plannedBreakDuration = bOut - bIn;

                // Validate break duration is reasonable (less than 4 hours)
                if (plannedBreakDuration > 0 && plannedBreakDuration < 4 * 60 * 60 * 1000) {
                    // Check if break times are within the work period (break has actually happened)
                    const workStart = start;
                    const workEnd = actualEnd;

                    if (bIn >= workStart && bOut <= workEnd) {
                        // Break has actually happened
                        actualBreakDuration = plannedBreakDuration;
                        workedMs -= actualBreakDuration;
                    } else if (bIn >= workStart && bIn <= workEnd && bOut > workEnd) {
                        // Break started but not finished yet (ongoing break)
                        actualBreakDuration = workEnd - bIn;
                        workedMs -= actualBreakDuration;
                    }

                    // Calculate break credit based on planned break (regardless of whether it happened yet)
                    if (plannedBreakDuration < STANDARD_BREAK_DURATION && plannedBreakDuration > 0) {
                        breakCredit = STANDARD_BREAK_DURATION - plannedBreakDuration;
                        breakInfo = {
                            actualBreak: plannedBreakDuration,
                            standardBreak: STANDARD_BREAK_DURATION,
                            credit: breakCredit
                        };
                    }
                }
            }

            // Add break credit to worked time (if you take shorter break, you can leave early)
            workedMs += breakCredit;

            if (workedMs < 0) return;

            const workedHours = workedMs / (1000 * 60 * 60);
            const remainingHours = Math.max(0, REQUIRED_HOURS - workedHours);

            // Calculate expected leave time with break credit
            let expectedLeaveTime;
            if (breakCredit > 0) {
                // You have break credit, so you can leave earlier
                const totalRequiredTime = REQUIRED_HOURS * 60 * 60 * 1000; // 8.5 hours in ms
                const standardBreakTime = STANDARD_BREAK_DURATION; // 30 minutes in ms
                const totalDayTime = totalRequiredTime + standardBreakTime - breakCredit; // Subtract break credit
                expectedLeaveTime = new Date(start.getTime() + totalDayTime);
            } else if (actualBreakDuration > 0) {
                // Break taken but no credit (break >= 30 mins)
                expectedLeaveTime = new Date(start.getTime() + (REQUIRED_HOURS * 60 * 60 * 1000) + actualBreakDuration);
            } else {
                // No break planned or taken, use standard break assumption
                expectedLeaveTime = new Date(start.getTime() + (REQUIRED_HOURS * 60 * 60 * 1000) + STANDARD_BREAK_DURATION);
            }

            setCalculationResults({
                totalWorked: formatTime(workedMs),
                remainingTime: formatTime(remainingHours * 60 * 60 * 1000),
                expectedLeaveTime: formatLeaveTime(expectedLeaveTime),
                expectedLeaveTimeRaw: expectedLeaveTime, // Add raw Date object for database
                breakInfo: breakInfo,
                isLive: !end
            });

        } catch (error) {
            console.error('Error in real-time calculation:', error);
        }
    };

    const calculateTime = () => {
        setIsCalculating(true);

        // Add animation delay for better UX
        setTimeout(() => {
            try {
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

                // Calculate break duration and break credit system
                let actualBreakDuration = 0;
                let breakCredit = 0;
                let breakInfo = null;

                if (bIn && bOut && bOut > bIn) {
                    // Calculate the planned break duration
                    const plannedBreakDuration = bOut - bIn;

                    // Validate break duration is reasonable (less than 4 hours)
                    if (plannedBreakDuration > 0 && plannedBreakDuration < 4 * 60 * 60 * 1000) {
                        // Check if break times are within the work period (break has actually happened)
                        const workStart = start;
                        const workEnd = actualEnd;

                        if (bIn >= workStart && bOut <= workEnd) {
                            // Break has actually happened
                            actualBreakDuration = plannedBreakDuration;
                            workedMs -= actualBreakDuration;
                        } else if (bIn >= workStart && bIn <= workEnd && bOut > workEnd) {
                            // Break started but not finished yet (ongoing break)
                            actualBreakDuration = workEnd - bIn;
                            workedMs -= actualBreakDuration;
                        }

                        // Calculate break credit based on planned break (regardless of whether it happened yet)
                        if (plannedBreakDuration < STANDARD_BREAK_DURATION && plannedBreakDuration > 0) {
                            breakCredit = STANDARD_BREAK_DURATION - plannedBreakDuration;
                            breakInfo = {
                                actualBreak: plannedBreakDuration,
                                standardBreak: STANDARD_BREAK_DURATION,
                                credit: breakCredit
                            };
                        }
                    }
                }

                // Add break credit to worked time (if you take shorter break, you can leave early)
                workedMs += breakCredit;

                if (workedMs < 0) {
                    setCalculationResults({
                        error: "❌ Invalid time range"
                    });
                    setIsCalculating(false);
                    return;
                }

                const workedHours = workedMs / (1000 * 60 * 60);
                const remainingHours = Math.max(0, REQUIRED_HOURS - workedHours);

                // Calculate expected leave time with break credit
                let expectedLeaveTime;
                if (breakCredit > 0) {
                    // You have break credit, so you can leave earlier
                    const totalRequiredTime = REQUIRED_HOURS * 60 * 60 * 1000; // 8.5 hours in ms
                    const standardBreakTime = STANDARD_BREAK_DURATION; // 30 minutes in ms
                    const totalDayTime = totalRequiredTime + standardBreakTime - breakCredit; // Subtract break credit
                    expectedLeaveTime = new Date(start.getTime() + totalDayTime);
                } else if (actualBreakDuration > 0) {
                    // Break taken but no credit (break >= 30 mins)
                    expectedLeaveTime = new Date(start.getTime() + (REQUIRED_HOURS * 60 * 60 * 1000) + actualBreakDuration);
                } else {
                    // No break planned or taken, use standard break assumption
                    expectedLeaveTime = new Date(start.getTime() + (REQUIRED_HOURS * 60 * 60 * 1000) + STANDARD_BREAK_DURATION);
                }

                setCalculationResults({
                    totalWorked: formatTime(workedMs),
                    remainingTime: formatTime(remainingHours * 60 * 60 * 1000),
                    expectedLeaveTime: formatLeaveTime(expectedLeaveTime),
                    expectedLeaveTimeRaw: expectedLeaveTime, // Add raw Date object for database
                    breakInfo: breakInfo,
                    isLive: !end
                });

                setIsCalculating(false);
            } catch (error) {
                console.error('Error in calculation:', error);
                setCalculationResults({
                    error: "❌ Calculation error occurred"
                });
                setIsCalculating(false);
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 relative">

            <div className="relative bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] border border-gray-700/50 p-8 w-full max-w-2xl transform transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_0_rgba(0,0,0,0.8)]"
                style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>

                {/* Header with animated icon */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl mb-6 transform transition-all duration-300 hover:rotate-12 hover:scale-110 shadow-lg">
                        <Clock className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                        Time Calculator
                    </h2>
                    <p className="text-gray-300 text-lg">Track your working hours with precision ⚡</p>
                </div>

                {/* Input Grid with staggered animations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {[
                        { label: 'Check-in Time', value: checkIn, setter: setCheckIn, icon: PlayCircle, required: true },
                        { label: 'Check-out Time', value: checkOut, setter: setCheckOut, icon: PauseCircle },
                        { label: 'Break-in Time', value: breakIn, setter: setBreakIn, icon: PlayCircle },
                        { label: 'Break-out Time', value: breakOut, setter: setBreakOut, icon: PauseCircle }
                    ].map((field, index) => (
                        <div
                            key={field.label}
                            className="group transform transition-all duration-300 hover:-translate-y-1"
                            style={{ animationDelay: `${index * 100}ms` }}
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
                    className="w-full py-3 rounded-xl bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 text-gray-200 font-medium hover:bg-gray-700/60 transform transition-all duration-300 hover:scale-[1.02] active:scale-95 mb-6"
                >
                    Clear All Fields
                </button>

                {/* Calculate Button with loading animation */}
                <button
                    onClick={calculateTime}
                    disabled={isCalculating}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-95 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed mb-4"
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

                {/* Log Today's Entry Button */}
                {calculationResults && !calculationResults.error && (
                    <button
                        onClick={handleSaveTimeEntry}
                        disabled={isSaving}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-95 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    Saving Entry...
                                </>
                            ) : saveStatus === 'success' ? (
                                <>
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Entry Saved Successfully!
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Log Today's Entry
                                </>
                            )}
                        </div>
                    </button>
                )}

                {/* Save Status Messages */}
                {saveStatus === 'error' && (
                    <div className="mt-4 bg-red-500/20 backdrop-blur-sm rounded-xl p-3 border border-red-500/20">
                        <p className="text-red-400 text-sm text-center">Failed to save entry. Please try again.</p>
                    </div>
                )}

                {/* Results with entrance animation */}
                {calculationResults && (
                    <div className="mt-8 transform transition-all duration-500 animate-fade-in-up">
                        {calculationResults.error ? (
                            <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/20">
                                <p className="text-lg font-bold text-red-400 text-center">{calculationResults.error}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Expected Leave Time */}
                                <div className="group relative bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-400/40 cursor-pointer">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-purple-300 text-sm font-medium group-hover:text-purple-200 transition-colors duration-300 mb-1">Expected Leave Time</p>
                                            <p className="text-white text-xl font-bold group-hover:text-purple-100 transition-all duration-500 transform group-hover:scale-105 group-hover:tracking-wide relative">
                                                <span className="inline-block animate-pulse group-hover:animate-none transition-all duration-300 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text group-hover:from-purple-200 group-hover:via-white group-hover:to-purple-200 bg-[length:200%_100%] animate-gradient-x">
                                                    {calculationResults.expectedLeaveTime}
                                                </span>
                                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10"></div>
                                            </p>
                                        </div>
                                        <div className="text-purple-400 text-3xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 flex items-center justify-center w-12 h-12">🚪</div>
                                    </div>
                                    {/* Hover glow effect */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>

                                {/* Total Worked Time */}
                                <div className="group relative bg-gradient-to-r from-cyan-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl p-5 border border-cyan-500/20 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-400/40 cursor-pointer">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-cyan-300 text-sm font-medium group-hover:text-cyan-200 transition-colors duration-300 mb-1">Total Worked Time</p>
                                            <p className="text-white text-xl font-bold group-hover:text-cyan-100 transition-all duration-500 transform group-hover:scale-105 group-hover:tracking-wide relative">
                                                <span className="inline-block animate-bounce group-hover:animate-pulse transition-all duration-300 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text group-hover:from-cyan-200 group-hover:via-white group-hover:to-cyan-200 bg-[length:200%_100%] animate-gradient-x">
                                                    {calculationResults.totalWorked}
                                                </span>
                                                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10"></div>
                                            </p>
                                        </div>
                                        <div className="text-cyan-400 text-3xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 flex items-center justify-center w-12 h-12">⏰</div>
                                    </div>
                                    {/* Hover glow effect */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>

                                {/* Time Remaining */}
                                <div className="group relative bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-5 border border-pink-500/20 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20 hover:border-pink-400/40 cursor-pointer">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-pink-300 text-sm font-medium group-hover:text-pink-200 transition-colors duration-300 mb-1">Time Until {REQUIRED_HOURS} Hours</p>
                                            <p className="text-white text-xl font-bold group-hover:text-pink-100 transition-all duration-500 transform group-hover:scale-105 group-hover:tracking-wide relative">
                                                <span className="inline-block animate-pulse group-hover:animate-bounce transition-all duration-300 bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text group-hover:from-pink-200 group-hover:via-white group-hover:to-pink-200 bg-[length:200%_100%] animate-gradient-x">
                                                    {calculationResults.remainingTime}
                                                </span>
                                                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10"></div>
                                            </p>
                                        </div>
                                        <div className="text-pink-400 text-3xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 flex items-center justify-center w-12 h-12">⏳</div>
                                    </div>
                                    {/* Hover glow effect */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>

                                {/* Break Credit Information */}
                                {calculationResults.breakInfo && (
                                    <div className="group relative bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm rounded-xl p-5 border border-orange-500/20 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/20 hover:border-orange-400/40 cursor-pointer">
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-orange-300 text-sm font-medium group-hover:text-orange-200 transition-colors duration-300 mb-1">Break Credit (Leave Early)</p>
                                                <p className="text-white text-xl font-bold group-hover:text-orange-100 transition-all duration-500 transform group-hover:scale-105 group-hover:tracking-wide relative">
                                                    <span className="inline-block animate-pulse group-hover:animate-bounce transition-all duration-300 bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text group-hover:from-orange-200 group-hover:via-white group-hover:to-orange-200 bg-[length:200%_100%] animate-gradient-x">
                                                        {formatTime(calculationResults.breakInfo.credit)}
                                                    </span>
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10"></div>
                                                </p>
                                                <p className="text-orange-200/70 text-xs mt-2">
                                                    Took {formatTime(calculationResults.breakInfo.actualBreak)} of {formatTime(calculationResults.breakInfo.standardBreak)} break
                                                </p>
                                            </div>
                                            <div className="text-orange-400 text-3xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 flex items-center justify-center w-12 h-12">⚡</div>
                                        </div>
                                        {/* Hover glow effect */}
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400/10 to-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                )}

                                {/* Status Information */}
                                {calculationResults.isLive && (
                                    <div className="group relative bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-5 border border-green-500/20 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/20 hover:border-green-400/40 cursor-pointer">
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-green-300 text-sm font-medium group-hover:text-green-200 transition-colors duration-300 flex items-center mb-1">
                                                    Status
                                                    <span className="ml-2 relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>
                                                </p>
                                                <p className="text-white text-xl font-bold group-hover:text-green-100 transition-all duration-500 transform group-hover:scale-105 group-hover:tracking-wide relative">
                                                    <span className="inline-block animate-pulse transition-all duration-300 bg-gradient-to-r from-white via-green-100 to-white bg-clip-text group-hover:from-green-200 group-hover:via-white group-hover:to-green-200 bg-[length:200%_100%] animate-gradient-x">
                                                        Live Tracking • Updates Every Second
                                                    </span>
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10"></div>
                                                </p>
                                                <p className="text-green-200/70 text-xs mt-2 transition-all duration-300 group-hover:text-green-100/80">
                                                    Current time: <span className="font-mono animate-pulse">{formatTimeOfDay(currentTime)}</span>
                                                </p>
                                            </div>
                                            <div className="text-green-400 text-3xl group-hover:scale-110 animate-pulse transition-transform duration-300 flex items-center justify-center w-12 h-12">🔴</div>
                                        </div>
                                        {/* Hover glow effect */}
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="mt-10 w-full max-w-2xl">
                <div className="group relative bg-gradient-to-r from-gray-900/60 via-black/40 to-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/30 transform transition-all duration-500 hover:scale-[1.01] hover:border-purple-500/40"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(20,20,20,0.7) 50%, rgba(0,0,0,0.6) 100%)',
                        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}>
                    
                    {/* Animated gradient border effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    
                    <div className="relative z-10 text-center">
                        <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent font-medium group-hover:from-pink-300 group-hover:via-purple-300 group-hover:to-cyan-300 transition-all duration-300">
                                A subtle reminder that you're still at work. 😬
                            </span>
                        </p>
                        <p className="text-gray-400 text-sm mt-2 group-hover:text-gray-300 transition-colors duration-300">
                            – Created by{" "}
                            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-semibold group-hover:from-cyan-300 group-hover:to-purple-300 transition-all duration-300">
                                Nilesh Patil
                            </span>
                        </p>
                    </div>
                    
                    {/* Subtle pulse animation on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500 pointer-events-none"></div>
                </div>
            </footer>

            {/* Login Modal */}
            <LoginModal 
                isOpen={showLoginModal}
                onClose={() => {
                    setShowLoginModal(false);
                    setPendingTimeData(null);
                }}
                onSuccess={handleLoginSuccess}
            />

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

        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes number-glow {
          0%, 100% {
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
          }
          50% {
            text-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 0 25px rgba(255, 255, 255, 0.4);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-scale-x {
          animation: scale-x 0.8s ease-out 0.3s both;
        }

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 200%;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-number-glow {
          animation: number-glow 2s ease-in-out infinite;
        }

        /* Enhanced time display animations */
        .time-display {
          position: relative;
          overflow: hidden;
        }

        .time-display::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.2), 
            transparent
          );
          transition: left 0.8s;
        }

        .time-display:hover::before {
          left: 100%;
        }

        /* Custom time picker styling with glassmorphism clock icon */
        input[type="time"]::-webkit-calendar-picker-indicator {
          background: linear-gradient(135deg, 
            rgba(236, 72, 153, 0.8) 0%, 
            rgba(139, 92, 246, 0.8) 50%, 
            rgba(6, 182, 212, 0.8) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 6px;
          cursor: pointer;
          filter: brightness(0.9);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 4px 12px rgba(139, 92, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
          
          /* Custom clock icon using background image */
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='12,6 12,12 16,14'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
          background-size: 16px 16px;
          min-width: 28px;
          min-height: 28px;
        }

        input[type="time"]::-webkit-calendar-picker-indicator:hover {
          filter: brightness(1.1);
          transform: scale(1.05) rotate(5deg);
          box-shadow: 
            0 6px 20px rgba(139, 92, 246, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 0 1px rgba(139, 92, 246, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        input[type="time"]::-webkit-calendar-picker-indicator:active {
          transform: scale(0.95);
          filter: brightness(1.2);
        }

        /* Enhanced glassmorphism effect for focused time inputs */
        input[type="time"]:focus::-webkit-calendar-picker-indicator {
          box-shadow: 
            0 8px 24px rgba(139, 92, 246, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            0 0 0 2px rgba(139, 92, 246, 0.5);
          border: 1px solid rgba(139, 92, 246, 0.6);
        }

        /* Time picker dropdown styling */
        input[type="time"]::-webkit-datetime-edit {
          color: white;
          padding: 0;
        }

        input[type="time"]::-webkit-datetime-edit-fields-wrapper {
          background: transparent;
        }

        input[type="time"]::-webkit-datetime-edit-text {
          color: #9ca3af;
          padding: 0 4px;
        }

        input[type="time"]::-webkit-datetime-edit-hour-field,
        input[type="time"]::-webkit-datetime-edit-minute-field {
          background: rgba(139, 92, 246, 0.1);
          color: white;
          border-radius: 4px;
          padding: 2px 6px;
          margin: 0 1px;
          transition: all 0.2s ease;
        }

        input[type="time"]::-webkit-datetime-edit-hour-field:focus,
        input[type="time"]::-webkit-datetime-edit-minute-field:focus {
          background: rgba(139, 92, 246, 0.3);
          outline: none;
          box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.3);
        }

        input[type="time"]::-webkit-datetime-edit-ampm-field {
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
          border-radius: 4px;
          padding: 2px 6px;
          margin-left: 4px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        input[type="time"]::-webkit-datetime-edit-ampm-field:focus {
          background: rgba(6, 182, 212, 0.3);
          outline: none;
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.3);
        }

        /* Time picker dropdown list styling */
        input[type="time"]::-webkit-list-button {
          background: linear-gradient(45deg, #ec4899, #8b5cf6, #06b6d4);
          border-radius: 6px;
          padding: 4px;
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        input[type="time"]::-webkit-list-button:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        /* Style the dropdown options container */
        input[type="time"] + datalist,
        input[type="time"]::-webkit-calendar-picker-indicator + div {
          background: rgba(17, 24, 39, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          color: white !important;
          font-family: inherit !important;
        }

        /* Global dropdown styling for webkit browsers */
        ::-webkit-calendar-picker-indicator ~ div,
        ::-webkit-calendar-picker-indicator + div {
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.9) 50%, rgba(17, 24, 39, 0.95) 100%) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
          border-radius: 12px !important;
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.6), 
            0 10px 10px -5px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          font-family: inherit !important;
          padding: 8px !important;
          margin-top: 4px !important;
        }

        /* Time dropdown option items */
        option {
          background: rgba(31, 41, 55, 0.8) !important;
          color: white !important;
          padding: 8px 12px !important;
          border-radius: 6px !important;
          margin: 2px 4px !important;
          transition: all 0.2s ease !important;
        }

        option:hover,
        option:focus,
        option:checked {
          background: linear-gradient(45deg, rgba(236, 72, 153, 0.3), rgba(139, 92, 246, 0.3)) !important;
          color: #f3f4f6 !important;
          outline: none !important;
        }

        /* Additional styling for the dropdown container */
        select,
        datalist {
          background: rgba(17, 24, 39, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
          border-radius: 12px !important;
          color: white !important;
          font-family: inherit !important;
        }

        /* Force dark theme for time picker dropdown on all browsers */
        input[type="time"] {
          color-scheme: dark;
        }
        
        /* Firefox time picker styling */
        input[type="time"]::-moz-calendar-picker-indicator {
          background: linear-gradient(45deg, #ec4899, #8b5cf6, #06b6d4);
          border-radius: 6px;
          padding: 4px;
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        input[type="time"]::-moz-calendar-picker-indicator:hover {
          opacity: 1;
          transform: scale(1.1);
        }
      `}</style>
        </div>
    );
}