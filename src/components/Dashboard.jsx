import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { timeEntriesService } from '../services/timeEntries'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import Calendar from 'react-calendar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Calendar as CalendarIcon, Clock, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import 'react-calendar/dist/Calendar.css'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [monthlyEntries, setMonthlyEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load monthly entries
  const loadMonthlyEntries = async (date = currentMonth) => {
    setLoading(true)
    setError('')

    try {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      
      const result = await timeEntriesService.getMonthlyEntries(year, month)
      if (result.success) {
        setMonthlyEntries(result.data || [])
      } else {
        setError(result.error || 'Failed to load entries')
      }
    } catch (err) {
      setError('Failed to load monthly entries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMonthlyEntries()
  }, [currentMonth])

  // Handle month navigation
  const handleMonthChange = (date) => {
    setCurrentMonth(date)
    setSelectedDate(date)
  }

  // Calculate monthly statistics
  const monthlyStats = timeEntriesService.calculateMonthlyStats(monthlyEntries)

  // Prepare chart data
  const chartData = monthlyEntries
    .filter(entry => entry.total_hours != null)
    .map(entry => ({
      date: format(new Date(entry.date), 'MM/dd'),
      hours: parseFloat(entry.total_hours || 0),
      isUnder: parseFloat(entry.total_hours || 0) < 8.5
    }))
    .reverse() // Show oldest to newest

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '--'
    return timeStr
  }

  // Format hours for display
  const formatHours = (hours) => {
    if (hours == null) return '--'
    return `${parseFloat(hours).toFixed(1)}h`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 w-96 h-96 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-60 -left-60 w-96 h-96 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl mb-4">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Time Dashboard
          </h1>
          <p className="text-gray-300 mt-2">
            Track your working hours and analyze your time patterns
          </p>
          {isAdmin && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <Users className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-yellow-400 text-sm font-medium">Admin View</span>
            </div>
          )}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-3xl p-6 border border-gray-700/50"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}>
              
              <div className="flex items-center mb-4">
                <CalendarIcon className="w-6 h-6 text-purple-400 mr-2" />
                <h2 className="text-xl font-bold text-white">Select Date</h2>
              </div>

              <div className="calendar-container">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  onActiveStartDateChange={({ activeStartDate }) => handleMonthChange(activeStartDate)}
                  className="react-calendar-dark"
                />
              </div>

              {/* Monthly Summary */}
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Monthly Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Days Worked</span>
                    <span className="text-cyan-400 font-semibold">{monthlyStats.totalDaysWorked}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Hours</span>
                    <span className="text-purple-400 font-semibold">{monthlyStats.totalHours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Average Hours</span>
                    <span className="text-pink-400 font-semibold">{monthlyStats.averageHours.toFixed(1)}h</span>
                  </div>
                  {monthlyStats.daysUnder8_5 > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 flex items-center">
                        <AlertTriangle className="w-4 h-4 text-orange-400 mr-1" />
                        Days Under 8.5h
                      </span>
                      <span className="text-orange-400 font-semibold">{monthlyStats.daysUnder8_5}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Data Tables and Chart */}
          <div className="lg:col-span-2 space-y-8">
            {/* Time Entries Table */}
            <div className="bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-3xl p-6 border border-gray-700/50"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}>
              
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-cyan-400 mr-2" />
                <h2 className="text-xl font-bold text-white">
                  Time Entries - {format(currentMonth, 'MMMM yyyy')}
                </h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-300">Loading entries...</span>
                </div>
              ) : error ? (
                <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/20">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : monthlyEntries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No time entries found for this month</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="text-left py-3 px-2 text-gray-300 font-semibold">Date</th>
                        <th className="text-left py-3 px-2 text-gray-300 font-semibold">Check In</th>
                        <th className="text-left py-3 px-2 text-gray-300 font-semibold">Check Out</th>
                        <th className="text-left py-3 px-2 text-gray-300 font-semibold">Break</th>
                        <th className="text-left py-3 px-2 text-gray-300 font-semibold">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyEntries.map((entry) => {
                        const totalHours = parseFloat(entry.total_hours || 0)
                        const isUnder8_5 = totalHours < 8.5 && totalHours > 0
                        
                        return (
                          <tr 
                            key={entry.id} 
                            className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                              isUnder8_5 ? 'bg-orange-500/10' : ''
                            }`}
                          >
                            <td className="py-3 px-2 text-white">
                              {format(new Date(entry.date), 'MMM dd')}
                            </td>
                            <td className="py-3 px-2 text-gray-300">
                              {formatTime(entry.check_in)}
                            </td>
                            <td className="py-3 px-2 text-gray-300">
                              {formatTime(entry.check_out)}
                            </td>
                            <td className="py-3 px-2 text-gray-300">
                              {entry.break_in && entry.break_out 
                                ? `${formatTime(entry.break_in)} - ${formatTime(entry.break_out)}`
                                : '--'
                              }
                            </td>
                            <td className="py-3 px-2">
                              <span className={`font-semibold ${
                                isUnder8_5 ? 'text-orange-400' : 'text-green-400'
                              }`}>
                                {formatHours(entry.total_hours)}
                                {isUnder8_5 && (
                                  <AlertTriangle className="w-4 h-4 inline ml-1" />
                                )}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bar Chart */}
            {chartData.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-3xl p-6 border border-gray-700/50"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                
                <div className="flex items-center mb-4">
                  <BarChart className="w-6 h-6 text-pink-400 mr-2" />
                  <h2 className="text-xl font-bold text-white">Working Hours Chart</h2>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.9)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '12px',
                          color: 'white'
                        }}
                        formatter={(value) => [`${value}h`, 'Hours Worked']}
                      />
                      <ReferenceLine y={8.5} stroke="#f59e0b" strokeDasharray="5 5" />
                      <Bar 
                        dataKey="hours" 
                        fill="url(#gradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .calendar-container .react-calendar-dark {
          background: transparent;
          border: none;
          width: 100%;
          color: white;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 12px;
          margin-bottom: 1rem;
          padding: 0.5rem;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation button {
          background: transparent;
          color: #a855f7;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation button:hover {
          background: rgba(139, 92, 246, 0.2);
          color: #c084fc;
        }

        .calendar-container .react-calendar-dark .react-calendar__month-view__weekdays {
          background: rgba(6, 182, 212, 0.1);
          border-radius: 8px;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .calendar-container .react-calendar-dark .react-calendar__month-view__weekdays__weekday {
          color: #06b6d4;
          font-weight: 600;
          font-size: 0.875rem;
          text-align: center;
          padding: 0.5rem;
        }

        .calendar-container .react-calendar-dark .react-calendar__tile {
          background: rgba(31, 41, 55, 0.3);
          color: #d1d5db;
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 8px;
          margin: 2px;
          padding: 0.75rem 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .calendar-container .react-calendar-dark .react-calendar__tile:hover {
          background: rgba(139, 92, 246, 0.2);
          color: white;
          transform: scale(1.05);
        }

        .calendar-container .react-calendar-dark .react-calendar__tile--active {
          background: linear-gradient(45deg, #ec4899, #8b5cf6, #06b6d4);
          color: white;
          font-weight: 700;
        }

        .calendar-container .react-calendar-dark .react-calendar__tile--now {
          background: rgba(236, 72, 153, 0.2);
          color: #f9a8d4;
          border: 1px solid rgba(236, 72, 153, 0.5);
        }
      `}</style>
    </div>
  )
} 