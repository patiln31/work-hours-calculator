import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { timeEntriesService } from '../services/timeEntries'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import Calendar from 'react-calendar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Calendar as CalendarIcon, Clock, Users, TrendingUp, AlertTriangle, Edit, History, Plus, Trash2 } from 'lucide-react'
import ManualEntryModal from '../components/ManualEntryModal'
import EditHistoryModal from '../components/EditHistoryModal'
import UserSelector from '../components/UserSelector'
import 'react-calendar/dist/Calendar.css'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [monthlyEntries, setMonthlyEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // New state for enhanced features
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showManualEntryModal, setShowManualEntryModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [historyEntry, setHistoryEntry] = useState(null)
  const [selectedDateEntry, setSelectedDateEntry] = useState(null)

  // Load monthly entries
  const loadMonthlyEntries = async (date = currentMonth, userId = selectedUserId) => {
    setLoading(true)
    setError('')

    try {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      
      const result = await timeEntriesService.getMonthlyEntries(year, month, userId)
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
  }, [currentMonth, selectedUserId])

  // Load entry for selected date
  useEffect(() => {
    loadSelectedDateEntry()
  }, [selectedDate, selectedUserId])

  const loadSelectedDateEntry = async () => {
    try {
      const result = await timeEntriesService.getEntryByDate(selectedDate, selectedUserId)
      if (result.success) {
        setSelectedDateEntry(result.data)
      } else {
        setSelectedDateEntry(null)
      }
    } catch (err) {
      setSelectedDateEntry(null)
    }
  }

  // Handle month navigation
  const handleMonthChange = (date) => {
    setCurrentMonth(date)
    setSelectedDate(date)
  }

  // Handle user selection (admin only)
  const handleUserChange = (userId) => {
    setSelectedUserId(userId)
  }

  // Handle manual entry creation/editing
  const handleNewEntry = () => {
    setEditingEntry(null)
    setShowManualEntryModal(true)
  }

  const handleEditEntry = (entry) => {
    setSelectedDate(new Date(entry.date))
    setEditingEntry(entry)
    setShowManualEntryModal(true)
  }

  const handleDeleteEntry = async (entry) => {
    if (!window.confirm(`Are you sure you want to delete the time entry for ${format(new Date(entry.date), 'MMM dd, yyyy')}?`)) {
      return
    }

    try {
      const result = await timeEntriesService.deleteTimeEntry(entry.id)
      if (result.success) {
        await loadMonthlyEntries()
        await loadSelectedDateEntry()
      } else {
        setError(result.error || 'Failed to delete entry')
      }
    } catch (err) {
      setError('Failed to delete entry')
    }
  }

  const handleShowHistory = (entry) => {
    setHistoryEntry(entry)
    setShowHistoryModal(true)
  }

  const handleEntrySaved = async (savedEntry) => {
    await loadMonthlyEntries()
    await loadSelectedDateEntry()
  }

  const handleHistoryUndo = async (updatedEntry) => {
    await loadMonthlyEntries()
    await loadSelectedDateEntry()
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
          {/* Left Column - Calendar & Manual Entry */}
          <div className="lg:col-span-1 space-y-6">
            {/* Admin User Selector */}
            {isAdmin && (
              <div className="bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-3xl p-6 border border-gray-700/50"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                <UserSelector 
                  selectedUserId={selectedUserId}
                  onUserChange={handleUserChange}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* Calendar Section */}
            <div className="bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-3xl p-6 border border-gray-700/50"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CalendarIcon className="w-6 h-6 text-purple-400 mr-2" />
                  <h2 className="text-xl font-bold text-white">Select Date</h2>
                </div>
                <button
                  onClick={handleNewEntry}
                  className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Entry
                </button>
              </div>

              <div className="calendar-container">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  onActiveStartDateChange={({ activeStartDate }) => handleMonthChange(activeStartDate)}
                  className="react-calendar-dark"
                />
              </div>

              {/* Selected Date Entry Summary */}
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h3>
                {selectedDateEntry ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Check In:</span>
                      <span className="text-cyan-400">{formatTime(selectedDateEntry.check_in)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Check Out:</span>
                      <span className="text-cyan-400">{formatTime(selectedDateEntry.check_out)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Total Hours:</span>
                      <span className="text-purple-400 font-semibold">{formatHours(selectedDateEntry.total_hours)}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEditEntry(selectedDateEntry)}
                        className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-200 text-xs font-medium flex items-center justify-center"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleShowHistory(selectedDateEntry)}
                        className="flex-1 px-3 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all duration-200 text-xs font-medium flex items-center justify-center"
                      >
                        <History className="w-3 h-3 mr-1" />
                        History
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">No entry for this date</p>
                    <button
                      onClick={handleNewEntry}
                      className="mt-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 text-sm font-medium"
                    >
                      Create Entry
                    </button>
                  </div>
                )}
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
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-cyan-400 mr-3" />
                  <h2 className="text-xl font-bold text-white">
                    Time Entries - {format(currentMonth, 'MMMM yyyy')}
                  </h2>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-300">Loading entries...</span>
                </div>
              ) : error ? (
                <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/20">
                  <p className="text-red-400 text-center">{error}</p>
                </div>
              ) : monthlyEntries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No time entries found for this month</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="text-left py-4 px-3 text-gray-300 font-semibold">Date</th>
                        <th className="text-left py-4 px-3 text-gray-300 font-semibold">Check In</th>
                        <th className="text-left py-4 px-3 text-gray-300 font-semibold">Check Out</th>
                        <th className="text-left py-4 px-3 text-gray-300 font-semibold">Break</th>
                        <th className="text-left py-4 px-3 text-gray-300 font-semibold">Meeting Hours</th>
                        <th className="text-left py-4 px-3 text-gray-300 font-semibold">Total Hours</th>
                        <th className="text-center py-4 px-3 text-gray-300 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyEntries.map((entry) => {
                        const totalHours = parseFloat(entry.total_hours || 0)
                        const isUnder8_5 = totalHours < 8.5 && totalHours > 0
                        
                        return (
                          <tr 
                            key={entry.id} 
                            className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                              isUnder8_5 ? 'bg-orange-500/10' : ''
                            }`}
                            onClick={() => setSelectedDate(new Date(entry.date))}
                          >
                            <td className="py-4 px-3 text-white font-medium">
                              {format(new Date(entry.date), 'MMM dd')}
                            </td>
                            <td className="py-4 px-3 text-gray-300">
                              {formatTime(entry.check_in)}
                            </td>
                            <td className="py-4 px-3 text-gray-300">
                              {formatTime(entry.check_out)}
                            </td>
                            <td className="py-4 px-3 text-gray-300">
                              {entry.break_in && entry.break_out 
                                ? `${formatTime(entry.break_in)} - ${formatTime(entry.break_out)}`
                                : '--'
                              }
                            </td>
                            <td className="py-4 px-3 text-gray-300">
                              {entry.meeting_hours ? (
                                <span className="text-indigo-400 font-medium">
                                  {formatHours(entry.meeting_hours)}
                                </span>
                              ) : '--'}
                            </td>
                            <td className="py-4 px-3">
                              <span className={`font-semibold ${
                                isUnder8_5 ? 'text-orange-400' : 'text-green-400'
                              }`}>
                                {formatHours(entry.total_hours)}
                                {isUnder8_5 && (
                                  <AlertTriangle className="w-4 h-4 inline ml-1" />
                                )}
                              </span>
                            </td>
                            <td className="py-4 px-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditEntry(entry)
                                  }}
                                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                                  title="Edit entry"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShowHistory(entry)
                                  }}
                                  className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-lg transition-all duration-200"
                                  title="View history"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteEntry(entry)
                                  }}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                                  title="Delete entry"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
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
                
                <div className="flex items-center mb-6">
                  <BarChart className="w-6 h-6 text-pink-400 mr-3" />
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

      {/* Modals */}
      <ManualEntryModal
        isOpen={showManualEntryModal}
        onClose={() => {
          setShowManualEntryModal(false)
          setEditingEntry(null)
        }}
        selectedDate={selectedDate}
        existingEntry={editingEntry}
        onSave={handleEntrySaved}
        isAdmin={isAdmin}
        targetUserId={selectedUserId}
      />

      <EditHistoryModal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false)
          setHistoryEntry(null)
        }}
        timeEntry={historyEntry}
        onUndo={handleHistoryUndo}
      />
    </div>
  )
} 