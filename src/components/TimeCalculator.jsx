import { useState, useEffect } from 'react';
import { Clock, PlayCircle, PauseCircle, Calculator, Save, CheckCircle, Users, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { timeEntriesService } from '../services/timeEntries';
import LoginModal from './LoginModal';
import MeetingModal from './MeetingModal';

// Predefined sarcastic motivational quotes
const quotes = [
  "Congrats, you survived another day of logging.",
  "Your boss will totally read this.",
  "Hours logged. Motivation: not found.",
  "Another productive log nobody cares about.",
  "Impressive! You've successfully clocked in without crying.",
  "You've been online too long. But go off.",
  "Time flies when you're pretending to care.",
  "Another log for the corporate overlords.",
  "Well done, you've logged another snooze-fest.",
  "Your paycheck thanks you for this log.",
  "Logged in. Sanity: questionable.",
  "Another masterpiece of time-wasting logged.",
  "You've officially outlasted your coffee break.",
  "Congrats on logging without a meltdown.",
  "Time tracked. Soul: sold.",
  "Another day, another log to ignore.",
  "You're a logging legend—barely.",
  "Clocked in. Now where's the exit?",
  "Logged hours: proof you exist.",
  "Another log to bore the archives.",
  "You've mastered the art of logging naps.",
  "Time logged. Productivity: TBD.",
  "Congrats, you've logged past lunch!",
  "Your log is now HR's problem.",
  "Another day of logging survival unlocked.",
  "Logged in. Brain: on standby.",
  "You've logged enough to fake it.",
  "Time tracked, enthusiasm lost.",
  "Another log for the 'I tried' file.",
  "You've clocked in like a champ—sort of.",
  "Logged hours: a cry for help.",
  "Another day, another log to forget.",
  "You've survived logging purgatory.",
  "Time logged. Coffee consumed: all of it.",
  "Congrats on logging without quitting.",
  "Your log is now a corporate artifact.",
  "Another hour logged, another victory—kinda.",
  "You've survived the logging grind again.",
  "Logged in. Motivation: on vacation.",
  "Another log to add to the chaos."
];

// Updated working GIF URLs - now with 15 different GIFs for more variety
const gifUrls = [
    // Original GIFs
    "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmp2eHR2Mm1qdWs5NnBra3pmajd0N21ubG84cWdkNHZieWJkM3ZjYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7kn27lnYSAE9O/giphy.gif",
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHB0MnQ1b3U0bjQ3ZnUxNXh1bnJjcjB3NmY0b2p5MnE4cXU2NzE5cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/uzRClpaS8q7lOBcdxf/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWFsb3k5dTRqMDUwY3d6djdvNThkcGZ1ZWcyM25kd3k2cmxwOGc1ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Rng7sDG4dkmyWev2qx/giphy.gif",
    "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2VyMzRlbXJlNGlmZWVjdmhjYzQxaGF3OWs2b2xrZTg5NnhsN3locCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9sEmlm8kV4PSM/giphy.gif",
    "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHEyc3EwODR6enRoNXprNTB6M2FtMHVkcnMxdTI0NmdnODAyeXI5ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/duh9qIgB0Ghfif8uPE/giphy.gif",
    "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjducTRhdGd3ZXd3NXlhNXczdzkxcDJ4azZzNHZzNWhwbWM0YzdhaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZYE6pw8tktY0N1GaEV/giphy.gif",
    
    // New GIFs you provided
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3g2andwaXJzemEzdHkzcW01ODg3MnUzYTN1b3o0b2NmNjlnYjJzeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l1KVaj5UcbHwrBMqI/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDg2NHprMGU5dTQ1NGtvenRjeTdreTkwbmY2NmtndXR1Y2s0NjBoeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d2lcHJTG5Tscg/giphy.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDhvZm80b3BuNWZ4eHhzbGVqbmgxZDF2emRjd3BmNGJuMml0M3NqaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/c9Dc3WfvF6itUKAhgX/giphy.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2cxMzB1OGNuZ2Y4b3RqamJ5OGRtZGI4dXBhYXVkYTlxcDRiajRsYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IejVI3NqwKEG78skNG/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHN6YmlzaTh3aWlvcXdudnVmaGp6d2VsbjkyMjZzYTZhYThobTUyMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kEKcOWl8RMLde/giphy.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExd25pNnlxNG1kNjVmc2dkY2hpcDE2aDYyaXczM2ZraTBrbW81dW12aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3orifbyEPffgtYnnA4/giphy.gif",
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXV4a3lwZzQxM21odnpndW04YWtqd25vZHRoc2Z5MDBsODFxNmc1MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jxrjnm4vRCfyIKdzfl/giphy.gif",
    "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnlrc2lkOHR4bDFodG1jdHJqaG16cmd2MTNodzFpZ3RtbzZheGtjZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8Wub2WCMscABvWt3DP/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGRiZnkwNzFtbndvMzFxMm0zcDR0eWdmYXJzcjFuZW1lMjFlZTJrZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/haEpZ7eLjtZM4/giphy.gif"
];

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
    const [meetingEntries, setMeetingEntries] = useState([]);
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    // Quote display state
    const [currentQuote, setCurrentQuote] = useState('');
    const [showQuote, setShowQuote] = useState(false);
    const [currentEffects, setCurrentEffects] = useState({
        icon: '💬',
        emoji1: '🙄',
        emoji2: '😏',
        sparkle1: '✨',
        sparkle2: '💫',
        sparkle3: '⭐'
    });
    const [quoteTimeout, setQuoteTimeout] = useState(null);
    const REQUIRED_HOURS = 8.5; // 8.5 hours required work time
    const STANDARD_BREAK_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

    // Simplified state for random GIF
    const [currentGif, setCurrentGif] = useState('');
    const [showGif, setShowGif] = useState(false);
    const [gifTimeout, setGifTimeout] = useState(null);
    const [lastGifTime, setLastGifTime] = useState(0);

    const { user } = useAuth();

    // Function to show a random quote
    const showRandomQuote = () => {
        // Clear any existing timeout
        if (quoteTimeout) {
            clearTimeout(quoteTimeout);
        }
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const effects = getQuoteEffects(randomQuote);
        setCurrentQuote(randomQuote);
        setCurrentEffects(effects);
        setShowQuote(true);
        
        // Auto-dismiss after 8 seconds (increased from 4 seconds)
        const newTimeout = setTimeout(() => {
            setShowQuote(false);
        }, 8000);
        
        setQuoteTimeout(newTimeout);
    };

    // Function to get random effects based on quote content
    const getQuoteEffects = (quote) => {
        const effects = {
            icon: '💬',
            emoji1: '🙄',
            emoji2: '😏',
            sparkle1: '✨',
            sparkle2: '💫',
            sparkle3: '⭐',
            cardAnimation: 'animate-sarcastic-card',
            textAnimation: 'animate-sarcastic-text',
            subtitleAnimation: 'animate-sarcastic-subtitle'
        };

        // Different effect sets based on quote keywords
        if (quote.toLowerCase().includes('boss') || quote.toLowerCase().includes('hr')) {
            effects.icon = '👔';
            effects.emoji1 = '😤';
            effects.emoji2 = '🤦';
            effects.sparkle1 = '💼';
            effects.sparkle2 = '📊';
            effects.sparkle3 = '📈';
        } else if (quote.toLowerCase().includes('coffee') || quote.toLowerCase().includes('break')) {
            effects.icon = '☕';
            effects.emoji1 = '😴';
            effects.emoji2 = '🥱';
            effects.sparkle1 = '☕';
            effects.sparkle2 = '🍵';
            effects.sparkle3 = '💤';
        } else if (quote.toLowerCase().includes('sanity') || quote.toLowerCase().includes('soul')) {
            effects.icon = '🧠';
            effects.emoji1 = '😵';
            effects.emoji2 = '🤯';
            effects.sparkle1 = '💭';
            effects.sparkle2 = '🌀';
            effects.sparkle3 = '💫';
        } else if (quote.toLowerCase().includes('survive') || quote.toLowerCase().includes('survival')) {
            effects.icon = '🛡️';
            effects.emoji1 = '😰';
            effects.emoji2 = '😅';
            effects.sparkle1 = '⚡';
            effects.sparkle2 = '🔥';
            effects.sparkle3 = '💪';
        } else if (quote.toLowerCase().includes('paycheck') || quote.toLowerCase().includes('money')) {
            effects.icon = '💰';
            effects.emoji1 = '🤑';
            effects.emoji2 = '💸';
            effects.sparkle1 = '💎';
            effects.sparkle2 = '💵';
            effects.sparkle3 = '🏦';
        } else if (quote.toLowerCase().includes('crying') || quote.toLowerCase().includes('meltdown')) {
            effects.icon = '😭';
            effects.emoji1 = '😢';
            effects.emoji2 = '🥺';
            effects.sparkle1 = '💧';
            effects.sparkle2 = '🌧️';
            effects.sparkle3 = '☔';
        } else if (quote.toLowerCase().includes('productivity') || quote.toLowerCase().includes('work')) {
            effects.icon = '⚙️';
            effects.emoji1 = '😤';
            effects.emoji2 = '💪';
            effects.sparkle1 = '🔧';
            effects.sparkle2 = '⚡';
            effects.sparkle3 = '🚀';
        } else if (quote.toLowerCase().includes('boring') || quote.toLowerCase().includes('boredom')) {
            effects.icon = '😴';
            effects.emoji1 = '🥱';
            effects.emoji2 = '😑';
            effects.sparkle1 = '💤';
            effects.sparkle2 = '🛏️';
            effects.sparkle3 = '🌙';
        } else if (quote.toLowerCase().includes('legend') || quote.toLowerCase().includes('champ')) {
            effects.icon = '🏆';
            effects.emoji1 = '😎';
            effects.emoji2 = '🤴';
            effects.sparkle1 = '👑';
            effects.sparkle2 = '🏅';
            effects.sparkle3 = '💎';
        } else if (quote.toLowerCase().includes('chaos') || quote.toLowerCase().includes('madness')) {
            effects.icon = '🌀';
            effects.emoji1 = '🤪';
            effects.emoji2 = '😵‍💫';
            effects.sparkle1 = '💫';
            effects.sparkle2 = '🌪️';
            effects.sparkle3 = '⚡';
        } else if (quote.toLowerCase().includes('time') || quote.toLowerCase().includes('clock')) {
            effects.icon = '⏰';
            effects.emoji1 = '😵';
            effects.emoji2 = '🤔';
            effects.sparkle1 = '🕐';
            effects.sparkle2 = '⏳';
            effects.sparkle3 = '⌛';
        } else if (quote.toLowerCase().includes('corporate') || quote.toLowerCase().includes('overlords')) {
            effects.icon = '🏢';
            effects.emoji1 = '😈';
            effects.emoji2 = '👹';
            effects.sparkle1 = '💼';
            effects.sparkle2 = '📊';
            effects.sparkle3 = '📈';
        } else if (quote.toLowerCase().includes('archive') || quote.toLowerCase().includes('forget')) {
            effects.icon = '🗄️';
            effects.emoji1 = '🤷';
            effects.emoji2 = '😶';
            effects.sparkle1 = '📁';
            effects.sparkle2 = '🗂️';
            effects.sparkle3 = '📋';
        }

        return effects;
    };

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

    // Cleanup timeout on component unmount
    useEffect(() => {
        return () => {
            if (quoteTimeout) {
                clearTimeout(quoteTimeout);
            }
        };
    }, [quoteTimeout]);

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
            breakOut,
            meetingEntries
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

            // Calculate meeting hours
            let totalMeetingHours = 0;
            let outsideWorkMeetings = 0;
            
            if (meetingEntries && meetingEntries.length > 0) {
                meetingEntries.forEach(meeting => {
                    if (meeting.start && meeting.end) {
                        const meetingStart = toDate(meeting.start);
                        const meetingEnd = toDate(meeting.end);
                        
                        if (meetingStart && meetingEnd && meetingEnd > meetingStart) {
                            const meetingDuration = meetingEnd - meetingStart;
                            totalMeetingHours += meetingDuration;
                            
                                                            // Check if meeting is outside work hours (before check-in or after expected work end)
                                // If no check-out time, assume standard 8.5 hour workday
                                const expectedWorkEnd = end ? actualEnd : new Date(start.getTime() + (REQUIRED_HOURS * 60 * 60 * 1000) + STANDARD_BREAK_DURATION);
                                
                                if (meetingStart < start || meetingEnd > expectedWorkEnd) {
                                    outsideWorkMeetings += meetingDuration;
                                }
                        }
                    }
                });
            }

            // Add break credit to worked time (if you take shorter break, you can leave early)
            workedMs += breakCredit;

            if (workedMs < 0) return;

            // Add meeting hours to total worked time
            const totalWorkedWithMeetings = workedMs + totalMeetingHours;
            
            // Adjust required hours if meetings are outside work hours
            const adjustedRequiredHours = REQUIRED_HOURS - (outsideWorkMeetings / (1000 * 60 * 60));
            const effectiveRequiredHours = Math.max(0, adjustedRequiredHours);
            
            const workedHours = totalWorkedWithMeetings / (1000 * 60 * 60);
            const remainingHours = Math.max(0, effectiveRequiredHours - workedHours);

            // Calculate expected leave time with break credit and meeting adjustments
            let expectedLeaveTime;
            
            // Start with the base required time (8.5 hours)
            const baseRequiredTime = REQUIRED_HOURS * 60 * 60 * 1000; // 8.5 hours in ms
            
            // Calculate the total time needed at work (including break)
            let totalWorkTime;
            if (breakCredit > 0) {
                // You have break credit, so you can leave earlier
                const standardBreakTime = STANDARD_BREAK_DURATION; // 30 minutes in ms
                totalWorkTime = baseRequiredTime + standardBreakTime - breakCredit; // Subtract break credit
            } else if (actualBreakDuration > 0) {
                // Break taken but no credit (break >= 30 mins)
                totalWorkTime = baseRequiredTime + actualBreakDuration;
            } else {
                // No break planned or taken, use standard break assumption
                totalWorkTime = baseRequiredTime + STANDARD_BREAK_DURATION;
            }
            
            // Calculate expected leave time from check-in
            expectedLeaveTime = new Date(start.getTime() + totalWorkTime);
            
            // Subtract outside-work meetings from expected leave time
            if (outsideWorkMeetings > 0) {
                expectedLeaveTime = new Date(expectedLeaveTime.getTime() - outsideWorkMeetings);
            }
            
            // Debug logging for meeting calculations (realtime)
            if (meetingEntries && meetingEntries.length > 0) {
                console.log('Realtime Meeting Calculation Debug:', {
                    totalMeetingHours: formatTime(totalMeetingHours),
                    outsideWorkMeetings: formatTime(outsideWorkMeetings),
                    baseExpectedLeave: formatLeaveTime(new Date(start.getTime() + totalWorkTime)),
                    adjustedExpectedLeave: formatLeaveTime(expectedLeaveTime),
                    meetings: meetingEntries
                });
            }

            setCalculationResults({
                totalWorked: formatTime(totalWorkedWithMeetings),
                remainingTime: formatTime(remainingHours * 60 * 60 * 1000),
                expectedLeaveTime: formatLeaveTime(expectedLeaveTime),
                expectedLeaveTimeRaw: expectedLeaveTime, // Add raw Date object for database
                breakInfo: breakInfo,
                meetingHours: totalMeetingHours,
                isLive: !end
            });

        } catch (error) {
            console.error('Error in real-time calculation:', error);
        }
    };

        const calculateTime = () => {
        setIsCalculating(true);
        
        // Show random quote when calculation starts
        showRandomQuote();
        
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

                // Calculate meeting hours
                let totalMeetingHours = 0;
                let outsideWorkMeetings = 0;
                
                if (meetingEntries && meetingEntries.length > 0) {
                    meetingEntries.forEach(meeting => {
                        if (meeting.start && meeting.end) {
                            const meetingStart = toDate(meeting.start);
                            const meetingEnd = toDate(meeting.end);
                            
                            if (meetingStart && meetingEnd && meetingEnd > meetingStart) {
                                const meetingDuration = meetingEnd - meetingStart;
                                totalMeetingHours += meetingDuration;
                                
                                // Check if meeting is outside work hours (before check-in or after expected work end)
                                // If no check-out time, assume standard 8.5 hour workday
                                const expectedWorkEnd = end ? actualEnd : new Date(start.getTime() + (REQUIRED_HOURS * 60 * 60 * 1000) + STANDARD_BREAK_DURATION);
                                
                                if (meetingStart < start || meetingEnd > expectedWorkEnd) {
                                    outsideWorkMeetings += meetingDuration;
                                }
                            }
                        }
                    });
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

                // Add meeting hours to total worked time
                const totalWorkedWithMeetings = workedMs + totalMeetingHours;
                
                // Adjust required hours if meetings are outside work hours
                const adjustedRequiredHours = REQUIRED_HOURS - (outsideWorkMeetings / (1000 * 60 * 60));
                const effectiveRequiredHours = Math.max(0, adjustedRequiredHours);
                
                const workedHours = totalWorkedWithMeetings / (1000 * 60 * 60);
                const remainingHours = Math.max(0, effectiveRequiredHours - workedHours);

                // Calculate expected leave time with break credit and meeting adjustments
                let expectedLeaveTime;
                
                // Start with the base required time (8.5 hours)
                const baseRequiredTime = REQUIRED_HOURS * 60 * 60 * 1000; // 8.5 hours in ms
                
                // Calculate the total time needed at work (including break)
                let totalWorkTime;
                if (breakCredit > 0) {
                    // You have break credit, so you can leave earlier
                    const standardBreakTime = STANDARD_BREAK_DURATION; // 30 minutes in ms
                    totalWorkTime = baseRequiredTime + standardBreakTime - breakCredit; // Subtract break credit
                } else if (actualBreakDuration > 0) {
                    // Break taken but no credit (break >= 30 mins)
                    totalWorkTime = baseRequiredTime + actualBreakDuration;
                } else {
                    // No break planned or taken, use standard break assumption
                    totalWorkTime = baseRequiredTime + STANDARD_BREAK_DURATION;
                }
                
                // Calculate expected leave time from check-in
                expectedLeaveTime = new Date(start.getTime() + totalWorkTime);
                
                // Subtract outside-work meetings from expected leave time
                if (outsideWorkMeetings > 0) {
                    expectedLeaveTime = new Date(expectedLeaveTime.getTime() - outsideWorkMeetings);
                }
                
                // Debug logging for meeting calculations
                if (meetingEntries && meetingEntries.length > 0) {
                    console.log('Meeting Calculation Debug:', {
                        totalMeetingHours: formatTime(totalMeetingHours),
                        outsideWorkMeetings: formatTime(outsideWorkMeetings),
                        baseExpectedLeave: formatLeaveTime(new Date(start.getTime() + totalWorkTime)),
                        adjustedExpectedLeave: formatLeaveTime(expectedLeaveTime),
                        meetings: meetingEntries
                    });
                }

                setCalculationResults({
                    totalWorked: formatTime(totalWorkedWithMeetings),
                    remainingTime: formatTime(remainingHours * 60 * 60 * 1000),
                    expectedLeaveTime: formatLeaveTime(expectedLeaveTime),
                    expectedLeaveTimeRaw: expectedLeaveTime, // Add raw Date object for database
                    breakInfo: breakInfo,
                    meetingHours: totalMeetingHours,
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

    // Optimized function to show random GIF
    const showRandomGif = () => {
        // Clear any existing timeout
        if (gifTimeout) {
            clearTimeout(gifTimeout);
        }
        
        const randomGif = gifUrls[Math.floor(Math.random() * gifUrls.length)];
        setCurrentGif(randomGif);
        setShowGif(true);
        setLastGifTime(Date.now());
        
        // Auto-hide after 10 seconds
        const newTimeout = setTimeout(() => {
            setShowGif(false);
        }, 10000);
        
        setGifTimeout(newTimeout);
    };

    // Function to handle calculate button click with GIF logic
    const handleCalculateClick = () => {
        calculateTime();
        
        const currentTime = Date.now();
        const timeSinceLastGif = currentTime - lastGifTime;
        
        // Show new GIF if:
        // 1. No GIF is currently showing, OR
        // 2. Last GIF was shown more than 2.5 seconds ago
        if (!showGif || timeSinceLastGif > 2500) {
            if (Math.random() < 0.7) { // 70% chance
                showRandomGif();
            }
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (gifTimeout) {
                clearTimeout(gifTimeout);
            }
        };
    }, [gifTimeout]);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
            
            {/* Optimized Random GIF Component */}
            {showGif && (
                <div className="fixed top-32 left-6 z-50 transition-all duration-300 ease-out">
                    <div className="relative">
                        {/* Simplified glassmorphism container */}
                        <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl p-4 transform transition-all duration-300 hover:scale-105">
                            {/* Close button */}
                            <button
                                onClick={() => {
                                    setShowGif(false);
                                    if (gifTimeout) {
                                        clearTimeout(gifTimeout);
                                    }
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-200 hover:scale-110 z-10"
                            >
                                <X className="w-3 h-3" />
                            </button>
                            
                            {/* GIF with optimized size */}
                            <img 
                                src={currentGif} 
                                alt="Random motivation GIF"
                                className="w-56 h-40 object-cover rounded-xl shadow-lg"
                                onError={(e) => {
                                    console.log('GIF failed to load, hiding component');
                                    setShowGif(false);
                                    if (gifTimeout) {
                                        clearTimeout(gifTimeout);
                                    }
                                }}
                            />
                            
                            {/* Minimal glow effect - only on hover */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main calculator card */}
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
                        TimeTrap Calculator
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

                {/* Meeting Hours Button - Style Option 3: Gradient Border with Animation */}
                <button
                    onClick={() => setShowMeetingModal(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-md text-purple-200 font-semibold hover:text-purple-100 transform transition-all duration-300 hover:scale-[1.02] active:scale-95 mb-4 flex items-center justify-center space-x-2 relative overflow-hidden group"
                    style={{
                        background: 'linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(0,0,0,0.8) 100%)',
                        border: '2px solid transparent',
                        backgroundClip: 'padding-box'
                    }}
                >
                    {/* Animated gradient border */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x" style={{backgroundSize: '200% 200%'}}></div>
                    
                    {/* Inner background */}
                    <div className="absolute inset-[2px] rounded-xl bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-md"></div>
                    
                    {/* Floating particles effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute top-2 left-4 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
                        <div className="absolute top-4 right-6 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                        <div className="absolute bottom-3 left-8 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                    </div>
                    
                    <div className="relative flex items-center justify-center space-x-2">
                        <div className="relative">
                            <Users className="w-5 h-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 text-purple-300 group-hover:text-purple-200" />
                            <div className="absolute -inset-2 bg-purple-500/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                        </div>
                        <span className="group-hover:text-purple-100 transition-colors duration-300 font-bold">Add Meeting Hours</span>
                        {meetingEntries.length > 0 && (
                            <span className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-500/80 to-pink-500/80 rounded-full text-xs text-white font-bold shadow-lg border border-purple-300/30 group-hover:from-purple-400/90 group-hover:to-pink-400/90 transition-all duration-300">
                                {meetingEntries.length} meeting{meetingEntries.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </button>

                {/* Optimized Clear Button */}
                <button
                    onClick={() => {
                        setCheckIn('10:00');
                        setCheckOut('');
                        setBreakIn('14:00');
                        setBreakOut('14:30');
                        setMeetingEntries([]);
                        setCalculationResults(null);
                    }}
                    className="group relative w-full py-3 rounded-xl bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 backdrop-blur-sm border border-red-400/30 text-white font-medium transform transition-all duration-300 hover:scale-[1.02] active:scale-95 mb-6 overflow-hidden"
                >
                    {/* Simplified background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Reduced particle effects */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-2 left-4 w-1 h-1 bg-red-400 rounded-full animate-ping"></div>
                        <div className="absolute bottom-2 right-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                    </div>
                    
                    {/* Button content */}
                    <div className="relative flex items-center justify-center z-10">
                        <span className="mr-2 text-lg group-hover:rotate-12 transition-transform duration-300">🧹</span>
                        <span className="text-white font-semibold group-hover:text-red-100 transition-all duration-300 relative z-10">
                            Clear All Fields
                        </span>
                        <span className="ml-2 text-lg group-hover:-rotate-12 transition-transform duration-300">✨</span>
                    </div>
                    
                    {/* Simplified border animation */}
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-border opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                {/* Calculate Button with loading animation - Enhanced GIF trigger */}
                <button
                    onClick={handleCalculateClick}
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
                                <div className="group relative bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-400/40 cursor-pointer min-h-[100px]">
                                    <div className="relative z-10 flex items-center justify-between h-full">
                                        <div className="flex-1 flex flex-col justify-center">
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
                                <div className="group relative bg-gradient-to-r from-cyan-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl p-5 border border-cyan-500/20 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-400/40 cursor-pointer min-h-[100px]">
                                    <div className="relative z-10 flex items-center justify-between h-full">
                                        <div className="flex-1 flex flex-col justify-center">
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
                                <div className="group relative bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-5 border border-pink-500/20 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20 hover:border-pink-400/40 cursor-pointer min-h-[100px]">
                                    <div className="relative z-10 flex items-center justify-between h-full">
                                        <div className="flex-1 flex flex-col justify-center">
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

                                {/* Meeting Hours */}
                                {calculationResults.meetingHours > 0 && (
                                    <div className="group relative bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-5 border border-indigo-500/20 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-400/40 cursor-pointer min-h-[100px]">
                                        <div className="relative z-10 flex items-center justify-between h-full">
                                            <div className="flex-1 flex flex-col justify-center">
                                                <p className="text-indigo-300 text-sm font-medium group-hover:text-indigo-200 transition-colors duration-300 mb-1">Meeting Hours</p>
                                                <p className="text-white text-xl font-bold group-hover:text-indigo-100 transition-all duration-500 transform group-hover:scale-105 group-hover:tracking-wide relative">
                                                    <span className="inline-block animate-pulse group-hover:animate-bounce transition-all duration-300 bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text group-hover:from-indigo-200 group-hover:via-white group-hover:to-indigo-200 bg-[length:200%_100%] animate-gradient-x">
                                                        {formatTime(calculationResults.meetingHours)}
                                                    </span>
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10"></div>
                                                </p>
                                                {meetingEntries.length > 0 && (
                                                    <p className="text-indigo-200/70 text-xs mt-2">
                                                        {meetingEntries.length} meeting{meetingEntries.length !== 1 ? 's' : ''} scheduled
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-indigo-400 text-3xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 flex items-center justify-center w-12 h-12">👥</div>
                                        </div>
                                        {/* Hover glow effect */}
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                )}

                                {/* Break Credit Information */}
                                {calculationResults.breakInfo && (
                                    <div className="group relative bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm rounded-xl p-5 border border-orange-500/20 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/20 hover:border-orange-400/40 cursor-pointer min-h-[100px]">
                                        <div className="relative z-10 flex items-center justify-between h-full">
                                            <div className="flex-1 flex flex-col justify-center">
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
                                    <div className="group relative bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-5 border border-green-500/20 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/20 hover:border-green-400/40 cursor-pointer min-h-[100px]">
                                        <div className="relative z-10 flex items-center justify-between h-full">
                                            <div className="flex-1 flex flex-col justify-center">
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

            {/* Meeting Modal */}
            <MeetingModal
                isOpen={showMeetingModal}
                onClose={() => setShowMeetingModal(false)}
                onSave={(meetings) => {
                    setMeetingEntries(meetings);
                    setShowMeetingModal(false);
                    // Recalculate if we have existing results
                    if (calculationResults) {
                        calculateTime();
                    }
                }}
                initialMeetings={meetingEntries}
            />

            {/* Floating Quote Display */}
            {showQuote && (
                <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 max-w-sm md:max-w-md transform transition-all duration-500 animate-fade-in-up">
                    {/* Smoke Effects */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Smoke particles */}
                        <div className="absolute -top-2 -left-2 w-2 h-2 bg-gray-400/30 rounded-full animate-smoke-1"></div>
                        <div className="absolute -top-4 left-4 w-1.5 h-1.5 bg-gray-300/40 rounded-full animate-smoke-2"></div>
                        <div className="absolute -top-6 left-8 w-1 h-1 bg-gray-500/35 rounded-full animate-smoke-3"></div>
                        <div className="absolute -top-3 right-4 w-1.5 h-1.5 bg-gray-400/30 rounded-full animate-smoke-4"></div>
                        <div className="absolute -top-5 right-8 w-1 h-1 bg-gray-300/40 rounded-full animate-smoke-5"></div>
                        <div className="absolute -top-8 left-12 w-1 h-1 bg-gray-500/35 rounded-full animate-smoke-6"></div>
                        <div className="absolute -top-10 right-12 w-1 h-1 bg-gray-400/30 rounded-full animate-smoke-7"></div>
                        <div className="absolute -top-12 left-16 w-1 h-1 bg-gray-300/40 rounded-full animate-smoke-8"></div>
                        
                        {/* Additional smoke wisps */}
                        <div className="absolute -top-4 left-2 w-3 h-1 bg-gradient-to-r from-transparent via-gray-400/20 to-transparent rounded-full animate-smoke-wisp-1"></div>
                        <div className="absolute -top-6 right-2 w-2 h-1 bg-gradient-to-r from-transparent via-gray-300/25 to-transparent rounded-full animate-smoke-wisp-2"></div>
                        <div className="absolute -top-8 left-6 w-2.5 h-1 bg-gradient-to-r from-transparent via-gray-500/15 to-transparent rounded-full animate-smoke-wisp-3"></div>
                    </div>
                    
                    <div className="relative bg-gradient-to-br from-gray-900/90 via-black/80 to-gray-900/90 backdrop-blur-2xl rounded-2xl p-6 md:p-8 border border-gray-700/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] transform hover:scale-105 transition-all duration-300 animate-sarcastic-card"
                        style={{
                            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.95) 50%, rgba(0,0,0,0.9) 100%)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}>
                        
                        {/* Sarcastic eye roll effect */}
                        <div className="absolute -top-1 -left-1 md:-top-2 md:-left-2 text-xl md:text-2xl animate-eye-roll">{currentEffects.emoji1}</div>
                        <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 text-xl md:text-2xl animate-eye-roll-delayed">{currentEffects.emoji2}</div>
                        
                        {/* Sarcastic sparkles */}
                        <div className="absolute top-1 left-1/4 md:top-2 md:left-1/4 text-base md:text-lg animate-sparkle-1">{currentEffects.sparkle1}</div>
                        <div className="absolute top-3 right-1/3 md:top-4 md:right-1/3 text-base md:text-lg animate-sparkle-2">{currentEffects.sparkle2}</div>
                        <div className="absolute bottom-1 left-1/3 md:bottom-2 md:left-1/3 text-base md:text-lg animate-sparkle-3">{currentEffects.sparkle3}</div>
                        
                        {/* Close button */}
                        <button
                            onClick={() => {
                                if (quoteTimeout) {
                                    clearTimeout(quoteTimeout);
                                    setQuoteTimeout(null);
                                }
                                setShowQuote(false);
                            }}
                            className="absolute top-3 right-3 md:top-4 md:right-4 p-1.5 md:p-2 rounded-full bg-gray-800/60 hover:bg-gray-700/60 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
                        >
                            <X className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        
                        {/* Quote content */}
                        <div className="text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 md:mb-6 transform transition-all duration-300 hover:rotate-12 hover:scale-110 animate-bounce">
                                <span className="text-2xl md:text-3xl animate-pulse">{currentEffects.icon}</span>
                            </div>
                            <p className="text-white text-lg md:text-xl font-medium leading-relaxed bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3 md:mb-4 animate-sarcastic-text">
                                "{currentQuote}"
                            </p>
                            <div className="text-xs md:text-sm text-gray-400 animate-sarcastic-subtitle">
                                TimeTrap Wisdom
                            </div>
                        </div>
                        
                        {/* Animated gradient border */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 animate-gradient-x pointer-events-none"></div>
                    </div>
                </div>
            )}

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