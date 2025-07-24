import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { timeEntriesService } from '../services/timeEntries'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import Calendar from 'react-calendar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { Calendar as CalendarIcon, Clock, Users, TrendingUp, AlertTriangle, Edit, History, Plus, Trash2 } from 'lucide-react'
import ManualEntryModal from '../components/ManualEntryModal'
import EditHistoryModal from '../components/EditHistoryModal'
import UserSelector from '../components/UserSelector'

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

  // Enhanced user change handler
  const handleUserChange = (userId) => {
    console.log('Admin selected user:', userId)
    setSelectedUserId(userId)
    
    // If user is deselected or changed, reset the selected date entry
    setSelectedDateEntry(null)
  }

  // Enhanced loading with user validation
  const loadMonthlyEntries = async (date = currentMonth, userId = selectedUserId) => {
    setLoading(true)
    setError('')

    try {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      
      console.log('Loading entries for:', { year, month, userId, isAdmin })
      
      const result = await timeEntriesService.getMonthlyEntries(year, month, userId)
      if (result.success) {
        setMonthlyEntries(result.data || [])
        console.log('Loaded entries count:', result.data?.length || 0)
      } else {
        setError(result.error || 'Failed to load entries')
        setMonthlyEntries([])
      }
    } catch (err) {
      setError('Failed to load monthly entries')
      setMonthlyEntries([])
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

      {/* OPTIMIZED CONTAINER - Better space utilization */}
      <div className="relative z-10 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-12 xl:py-12 2xl:px-16 2xl:py-16 max-w-[1600px] mx-auto">
        
        {/* Header - Responsive sizing */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl mb-3 sm:mb-4">
            <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Time Dashboard
          </h1>
          <p className="text-gray-300 mt-2 text-xs sm:text-sm lg:text-base">
            Track your working hours and analyze your time patterns
          </p>
          {isAdmin && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <Users className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-yellow-400 text-sm font-medium">Admin View</span>
            </div>
          )}
        </div>

        {/* OPTIMIZED Main Dashboard Grid - Better space utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-10 xl:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
          
          {/* Left Column - Calendar & Manual Entry - Reduced width for more space */}
          <div className="lg:col-span-3 xl:col-span-3 space-y-3 sm:space-y-4">
            
            {/* Admin User Selector */}
            {isAdmin && (
              <div className="bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-gray-700/50 relative z-50"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  zIndex: 50
                }}>
                <UserSelector 
                  selectedUserId={selectedUserId}
                  onUserChange={handleUserChange}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* Calendar Section - Optimized */}
            <div className="bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-gray-700/50 relative z-40"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                zIndex: 40
              }}>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 sm:gap-0">
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-purple-400 mr-2" />
                  <h2 className="text-base sm:text-lg font-bold text-white">Select Date</h2>
                </div>
                <button
                  onClick={handleNewEntry}
                  className="w-full sm:w-auto px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm font-medium flex items-center justify-center sm:justify-start"
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
                    locale="en-US"
                    formatMonth={(locale, date) => format(date, 'MMM yyyy')}
                    navigationLabel={({ date }) => format(date, 'MMM yyyy')}
                    calendarType="iso8601"
                  />
              </div>

              {/* EXPANDED Selected Date Entry Summary - More breathing room */}
              {selectedDateEntry && (
                <div className="mt-4 bg-gradient-to-br from-gray-900/90 via-black/70 to-gray-900/90 backdrop-blur-2xl rounded-2xl p-4 border border-gray-700/50"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(20,20,20,0.95) 50%, rgba(0,0,0,0.85) 100%)',
                    boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}>
                  
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm sm:text-base font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      Entry for {format(selectedDate, 'MMM dd, yyyy')}
                    </h3>
                    <div className="flex items-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-full px-2 py-1 border border-green-500/30">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse mr-2"></div>
                      <span className="text-xs text-green-400 font-semibold uppercase tracking-wide">Active</span>
                    </div>
                  </div>
                  
                  {/* FIXED Grid - Better text handling */}
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    
                    {/* Row 1: Check-in and Check-out - Mobile optimized */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {/* Check-in Card */}
                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-xl border border-blue-500/30 p-2 sm:p-3 h-16 sm:h-18 flex flex-col justify-center items-center transition-all duration-300 hover:transform hover:scale-[1.02] group">
                        <div className="text-center w-full">
                          <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Check-in</div>
                          <div className="text-white text-sm sm:text-base font-black">{formatTime(selectedDateEntry.check_in)}</div>
                        </div>
                      </div>
                      
                      {/* Check-out Card */}
                      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-xl border border-purple-500/30 p-2 sm:p-3 h-16 sm:h-18 flex flex-col justify-center items-center transition-all duration-300 hover:transform hover:scale-[1.02] group">
                        <div className="text-center w-full">
                          <div className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Check-out</div>
                          <div className="text-white text-sm sm:text-base font-black">{formatTime(selectedDateEntry.check_out)}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Row 2: Break and Total - Mobile optimized */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {/* Break Card - Mobile optimized */}
                      <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-xl border border-orange-500/30 p-2 sm:p-3 h-16 sm:h-20 flex flex-col justify-center items-center transition-all duration-300 hover:transform hover:scale-[1.02] group">
                        <div className="text-center w-full">
                          <div className="text-orange-300 text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Break</div>
                          <div className="text-white text-xs font-bold leading-tight">
                            {selectedDateEntry.break_in && selectedDateEntry.break_out 
                              ? (
                                <div className="space-y-0.5">
                                  <div className="text-xs">{formatTime(selectedDateEntry.break_in)}</div>
                                  <div className="text-orange-400 text-xs">↓</div>
                                  <div className="text-xs">{formatTime(selectedDateEntry.break_out)}</div>
                                </div>
                              )
                              : <div className="text-gray-400 text-sm">--</div>
                            }
                          </div>
                        </div>
                      </div>
                      
                      {/* Total Hours Card */}
                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl border border-green-500/30 p-2 sm:p-3 h-16 sm:h-20 flex flex-col justify-center items-center transition-all duration-300 hover:transform hover:scale-[1.02] group">
                        <div className="text-center w-full">
                          <div className="text-green-300 text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Total</div>
                          <div className={`text-lg sm:text-xl font-black ${
                            parseFloat(selectedDateEntry.total_hours || 0) < 8.5 
                              ? 'text-orange-400' 
                              : 'text-green-400'
                          }`}>
                            {formatHours(selectedDateEntry.total_hours)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Meeting Hours (if exists) */}
                  {selectedDateEntry.meeting_hours && (
                    <div className="mb-4">
                      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl border border-indigo-500/30 p-3 h-14 flex items-center justify-between transition-all duration-300 hover:transform hover:scale-[1.01]">
                        <div className="text-indigo-300 text-sm font-bold uppercase tracking-wide">Meeting Hours</div>
                        <div className="text-indigo-400 text-lg font-black">{formatHours(selectedDateEntry.meeting_hours)}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons - Better spacing */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleEditEntry(selectedDateEntry)}
                      className="bg-gradient-to-br from-blue-500/25 to-cyan-500/25 text-blue-400 rounded-xl border border-blue-500/40 p-2 h-12 w-full flex flex-col items-center justify-center transition-all duration-300 hover:from-blue-500/40 hover:to-cyan-500/40 hover:border-blue-400/60 hover:transform hover:scale-[1.03] font-bold backdrop-blur-xl group"
                    >
                      <Edit className="w-4 h-4 mb-0.5" />
                      <span className="text-xs font-semibold">Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleShowHistory(selectedDateEntry)}
                      className="bg-gradient-to-br from-purple-500/25 to-pink-500/25 text-purple-400 rounded-xl border border-purple-500/40 p-2 h-12 w-full flex flex-col items-center justify-center transition-all duration-300 hover:from-purple-500/40 hover:to-pink-500/40 hover:border-purple-400/60 hover:transform hover:scale-[1.03] font-bold backdrop-blur-xl group"
                    >
                      <History className="w-4 h-4 mb-0.5" />
                      <span className="text-xs font-semibold">History</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteEntry(selectedDateEntry)}
                      className="bg-gradient-to-br from-red-500/25 to-rose-500/25 text-red-400 rounded-xl border border-red-500/40 p-2 h-12 w-full flex flex-col items-center justify-center transition-all duration-300 hover:from-red-500/40 hover:to-rose-500/40 hover:border-red-400/60 hover:transform hover:scale-[1.03] font-bold backdrop-blur-xl group"
                    >
                      <Trash2 className="w-4 h-4 mb-0.5" />
                      <span className="text-xs font-semibold">Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Data & Charts - More space */}
          <div className="lg:col-span-7 xl:col-span-9 space-y-4 sm:space-y-6">
            
            {/* Time Entries Table */}
            <div className="bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-700/50"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 mr-2 sm:mr-3" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Time Entries - {format(currentMonth, 'MMMM yyyy')}
                  </h2>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-300 text-sm sm:text-base">Loading entries...</span>
                </div>
              ) : error ? (
                <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/20">
                  <p className="text-red-400 text-center text-sm sm:text-base">{error}</p>
                </div>
              ) : monthlyEntries.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-400 text-sm sm:text-base">No time entries found for this month</p>
                </div>
              ) : (
                <>
                  {/* Enhanced Desktop Table View - Better spacing */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-base">
                      <thead>
                        <tr className="border-b border-gray-700/50">
                          <th className="text-left py-4 px-4 text-gray-400 font-semibold text-base">Date</th>
                          <th className="text-left py-4 px-4 text-gray-400 font-semibold text-base">Check In</th>
                          <th className="text-left py-4 px-4 text-gray-400 font-semibold text-base">Check Out</th>
                          <th className="text-left py-4 px-4 text-gray-400 font-semibold text-base">Break</th>
                          <th className="text-left py-4 px-4 text-gray-400 font-semibold text-base">Meeting Hours</th>
                          <th className="text-left py-4 px-4 text-gray-400 font-semibold text-base">Total Hours</th>
                          <th className="text-center py-4 px-4 text-gray-400 font-semibold text-base">Actions</th>
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
                              <td className="py-4 px-4 text-gray-200 font-medium text-base">
                                {format(new Date(entry.date), 'MMM dd')}
                              </td>
                              <td className="py-4 px-4 text-gray-400 font-medium text-base">
                                {formatTime(entry.check_in)}
                              </td>
                              <td className="py-4 px-4 text-gray-400 font-medium text-base">
                                {formatTime(entry.check_out)}
                              </td>
                              <td className="py-4 px-4 text-gray-400 font-medium text-base">
                                {entry.break_in && entry.break_out 
                                  ? `${formatTime(entry.break_in)} - ${formatTime(entry.break_out)}`
                                  : '--'
                                }
                              </td>
                              <td className="py-4 px-4 text-gray-400 font-medium text-base">
                                {entry.meeting_hours ? (
                                  <span className="text-indigo-300 font-medium">
                                    {formatHours(entry.meeting_hours)}
                                  </span>
                                ) : '--'}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`font-semibold text-base ${
                                  isUnder8_5 ? 'text-orange-300' : 'text-green-300'
                                }`}>
                                  {formatHours(entry.total_hours)}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditEntry(entry)
                                    }}
                                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                    title="Edit Entry"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleShowHistory(entry)
                                    }}
                                    className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                                    title="View History"
                                  >
                                    <History className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteEntry(entry)
                                    }}
                                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                    title="Delete Entry"
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

                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-3">
                    {monthlyEntries.map((entry) => {
                      const totalHours = parseFloat(entry.total_hours || 0)
                      const isUnder8_5 = totalHours < 8.5 && totalHours > 0
                      
                      return (
                        <div 
                          key={entry.id}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isUnder8_5 
                              ? 'bg-orange-500/10 border-orange-500/30' 
                              : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50'
                          }`}
                          onClick={() => setSelectedDate(new Date(entry.date))}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium text-white">
                              {format(new Date(entry.date), 'MMM dd, yyyy')}
                            </div>
                            <div className={`font-bold text-sm ${
                              isUnder8_5 ? 'text-orange-400' : 'text-green-400'
                            }`}>
                              {formatHours(entry.total_hours)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
                            <div>
                              <span className="block text-gray-400">Check In</span>
                              <span className="font-medium">{formatTime(entry.check_in)}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Check Out</span>
                              <span className="font-medium">{formatTime(entry.check_out)}</span>
                            </div>
                            {(entry.break_in && entry.break_out) && (
                              <div className="col-span-2">
                                <span className="block text-gray-400">Break</span>
                                <span className="font-medium">
                                  {formatTime(entry.break_in)} - {formatTime(entry.break_out)}
                                </span>
                              </div>
                            )}
                            {entry.meeting_hours && (
                              <div className="col-span-2">
                                <span className="block text-gray-400">Meeting Hours</span>
                                <span className="font-medium text-indigo-400">
                                  {formatHours(entry.meeting_hours)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditEntry(entry)
                              }}
                              className="flex-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-medium flex items-center justify-center"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleShowHistory(entry)
                              }}
                              className="flex-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-xs font-medium flex items-center justify-center"
                            >
                              <History className="w-3 h-3 mr-1" />
                              History
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteEntry(entry)
                              }}
                              className="flex-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-medium flex items-center justify-center"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Enhanced Chart Section */}
            {chartData.length > 0 && (
              <div className="chart-container">
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <BarChart className="w-6 h-6 text-pink-400 mr-3" />
                    <h2 className="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      Working Hours Chart
                    </h2>
                  </div>

                  <div className="h-80 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(75, 85, 99, 0.3)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9CA3AF"
                          fontSize={12}
                          fontWeight={600}
                          tick={{ fontSize: 12, fontWeight: 600 }}
                          axisLine={{ stroke: 'rgba(75, 85, 99, 0.5)' }}
                          tickLine={{ stroke: 'rgba(75, 85, 99, 0.5)' }}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          fontSize={12}
                          fontWeight={600}
                          tick={{ fontSize: 12, fontWeight: 600 }}
                          axisLine={{ stroke: 'rgba(75, 85, 99, 0.5)' }}
                          tickLine={{ stroke: 'rgba(75, 85, 99, 0.5)' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.95)',
                            border: '1px solid rgba(139, 92, 246, 0.5)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
                          }}
                          labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                          itemStyle={{ color: '#10B981' }}
                        />
                        <ReferenceLine 
                          y={8.5} 
                          stroke="#F59E0B" 
                          strokeDasharray="5 5" 
                          strokeWidth={2}
                          label={{ 
                            value: "Target: 8.5h", 
                            position: "topRight",
                            style: { fill: '#F59E0B', fontSize: '12px', fontWeight: 'bold' }
                          }}
                        />
                        <Bar 
                          dataKey="hours" 
                          radius={[4, 4, 0, 0]}
                          fill="url(#barGradient)"
                        >
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.isUnder 
                                ? 'url(#underGradient)' 
                                : 'url(#normalGradient)'
                              } 
                            />
                          ))}
                        </Bar>
                        
                        {/* Enhanced gradients for bars */}
                        <defs>
                          <linearGradient id="normalGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#059669" stopOpacity={0.7}/>
                          </linearGradient>
                          <linearGradient id="underGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#D97706" stopOpacity={0.7}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Chart Legend */}
                  <div className="flex items-center justify-center mt-4 space-x-6">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded bg-gradient-to-b from-green-500 to-green-600 mr-2"></div>
                      <span className="text-sm text-gray-300 font-medium">≥ 8.5 hours</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded bg-gradient-to-b from-orange-500 to-orange-600 mr-2"></div>
                      <span className="text-sm text-gray-300 font-medium">{"< 8.5 hours"}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-orange-400 mr-2" style={{
                        backgroundImage: 'repeating-linear-gradient(to right, #F59E0B 0, #F59E0B 5px, transparent 5px, transparent 10px)'
                      }}></div>
                      <span className="text-sm text-gray-300 font-medium">Target: 8.5h</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FIXED Calendar Styles - Perfect Alignment */}
      <style jsx global>{`
        /* Complete reset for react-calendar */
        .calendar-container .react-calendar-dark,
        .calendar-container .react-calendar-dark *,
        .calendar-container .react-calendar-dark *:before,
        .calendar-container .react-calendar-dark *:after {
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Base calendar container */
        .calendar-container .react-calendar-dark {
          background: transparent !important;
          border: none !important;
          width: 100% !important;
          color: white !important;
          font-family: inherit !important;
          position: relative !important;
          z-index: 60 !important;
          line-height: 1 !important;
        }

        /* FIXED Navigation - Simple approach for month display */
        .calendar-container .react-calendar-dark .react-calendar__navigation {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2)) !important;
          border-radius: 16px !important;
          margin-bottom: 1.5rem !important;
          padding: 10px !important;
          display: grid !important;
          grid-template-columns: 40px 40px 1fr 40px 40px !important;
          gap: 8px !important;
          align-items: center !important;
          position: relative !important;
          z-index: 70 !important;
          backdrop-filter: blur(15px) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15) !important;
          height: 64px !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Navigation buttons */
        .calendar-container .react-calendar-dark .react-calendar__navigation button {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.6)) !important;
          color: white !important;
          border: none !important;
          border-radius: 12px !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          width: 40px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          backdrop-filter: blur(10px) !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3) !important;
          flex-shrink: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation button:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 1), rgba(236, 72, 153, 0.8)) !important;
          transform: translateY(-2px) scale(1.05) !important;
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4) !important;
          border-radius: 16px !important;
        }

        /* CLEANED Month/Year label - Remove all conflicts */
        .calendar-container .react-calendar-dark .react-calendar__navigation__label {
          text-align: center !important;
          font-weight: 800 !important;
          font-size: 14px !important;
          color: white !important;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15)) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
          cursor: pointer !important;
          border-radius: 12px !important;
          transition: all 0.3s ease !important;
          backdrop-filter: blur(10px) !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          padding: 0 12px !important;
          white-space: nowrap !important;
          overflow: visible !important;
          min-width: 100px !important;
          flex: 1 !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          letter-spacing: 0.5px !important;
        }

        /* Remove ALL pseudo-elements and custom content */
        .calendar-container .react-calendar-dark .react-calendar__navigation__label::before,
        .calendar-container .react-calendar-dark .react-calendar__navigation__label::after {
          content: none !important;
          display: none !important;
        }

        /* Make sure the actual text content is visible */
        .calendar-container .react-calendar-dark .react-calendar__navigation__label span {
          display: inline !important;
          visibility: visible !important;
          opacity: 1 !important;
          color: white !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation__label:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(236, 72, 153, 0.25)) !important;
          border-color: rgba(139, 92, 246, 0.5) !important;
          transform: translateY(-1px) !important;
          border-radius: 16px !important;
        }

        /* Ensure all navigation buttons are properly sized */
        .calendar-container .react-calendar-dark .react-calendar__navigation__prev,
        .calendar-container .react-calendar-dark .react-calendar__navigation__prev2,
        .calendar-container .react-calendar-dark .react-calendar__navigation__next,
        .calendar-container .react-calendar-dark .react-calendar__navigation__next2 {
          width: 40px !important;
          height: 40px !important;
          min-width: 40px !important;
          min-height: 40px !important;
          max-width: 40px !important;
          max-height: 40px !important;
          flex-shrink: 0 !important;
          flex-grow: 0 !important;
        }

        /* Ensure calendar container has proper constraints */
        .calendar-container {
          width: 100% !important;
          max-width: 100% !important;
          overflow: visible !important;
          box-sizing: border-box !important;
        }

        .calendar-container .react-calendar-dark {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Mobile responsive fixes */
        @media (max-width: 640px) {
          .calendar-container .react-calendar-dark .react-calendar__navigation {
            grid-template-columns: 36px 36px 1fr 36px 36px !important;
            height: 56px !important;
            padding: 8px !important;
            gap: 6px !important;
          }

          .calendar-container .react-calendar-dark .react-calendar__navigation button {
            width: 36px !important;
            height: 36px !important;
            font-size: 12px !important;
          }

          .calendar-container .react-calendar-dark .react-calendar__navigation__label {
            height: 36px !important;
            font-size: 12px !important;
            padding: 0 6px !important;
          }

          .h-18 {
            height: 4rem !important; /* 64px on mobile */
          }
        }

        /* Very small screens - ensure text still fits */
        @media (max-width: 480px) {
          .calendar-container .react-calendar-dark .react-calendar__navigation {
            grid-template-columns: 32px 32px 1fr 32px 32px !important;
            height: 52px !important;
            padding: 6px !important;
            gap: 4px !important;
          }

          .calendar-container .react-calendar-dark .react-calendar__navigation button {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            min-height: 32px !important;
            max-width: 32px !important;
            max-height: 32px !important;
            font-size: 11px !important;
          }

          .calendar-container .react-calendar-dark .react-calendar__navigation__label {
            height: 32px !important;
            font-size: 12px !important;
            padding: 0 6px !important;
            min-width: 70px !important;
          }

          .calendar-container .react-calendar-dark .react-calendar__navigation__prev,
          .calendar-container .react-calendar-dark .react-calendar__navigation__prev2,
          .calendar-container .react-calendar-dark .react-calendar__navigation__next,
          .calendar-container .react-calendar-dark .react-calendar__navigation__next2 {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            min-height: 32px !important;
            max-width: 32px !important;
            max-height: 32px !important;
          }
        }

        /* FIXED Weekday headers - Perfect grid alignment */
        .calendar-container .react-calendar-dark .react-calendar__month-view__weekdays {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(20, 20, 20, 0.6)) !important;
          border-radius: 12px !important;
          margin: 0 0 12px 0 !important;
          padding: 0 !important;
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 0 !important;
          backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(75, 85, 99, 0.3) !important;
          overflow: hidden !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__month-view__weekdays__weekday {
          color: #9CA3AF !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          text-align: center !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: none !important;
          background: transparent !important;
          height: 44px !important;
          transition: all 0.2s ease !important;
          cursor: default !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__month-view__weekdays__weekday:hover {
          color: #ffffff !important;
          background: rgba(139, 92, 246, 0.2) !important;
        }

        /* FIXED Calendar grid - Perfect alignment */
        .calendar-container .react-calendar-dark .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 8px !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Enhanced calendar tiles without dots */
        .calendar-container .react-calendar-dark .react-calendar__tile {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(20, 20, 20, 0.5)) !important;
          color: #E5E7EB !important;
          border: 1px solid rgba(75, 85, 99, 0.4) !important;
          border-radius: 16px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          position: relative !important;
          backdrop-filter: blur(10px) !important;
          
          /* Perfect square */
          width: 100% !important;
          height: 0 !important;
          padding-bottom: 100% !important;
          aspect-ratio: 1 / 1 !important;
          
          overflow: hidden !important;
        }

        /* Fix content positioning inside tiles */
        .calendar-container .react-calendar-dark .react-calendar__tile > abbr {
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          text-decoration: none !important;
          font-weight: 600 !important;
          font-size: 14px !important;
        }

        /* Remove any pseudo-elements that might be adding dots */
        .calendar-container .react-calendar-dark .react-calendar__tile::before,
        .calendar-container .react-calendar-dark .react-calendar__tile::after {
          display: none !important;
        }

        /* Enhanced hover states */
        .calendar-container .react-calendar-dark .react-calendar__tile:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.3)) !important;
          border-color: rgba(139, 92, 246, 0.6) !important;
          transform: translateY(-4px) scale(1.05) !important;
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4), 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
          color: #ffffff !important;
          z-index: 2 !important;
          border-radius: 20px !important;
        }

        /* Active/selected date - perfect rounded square */
        .calendar-container .react-calendar-dark .react-calendar__tile--active {
          background: linear-gradient(135deg, #10B981, #059669) !important;
          color: white !important;
          border-color: #10B981 !important;
          font-weight: 800 !important;
          box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5), 0 0 0 3px rgba(16, 185, 129, 0.3) !important;
          transform: translateY(-2px) scale(1.02) !important;
          border-radius: 20px !important;
          animation: pulse-glow 2s infinite !important;
        }

        /* Weekend styling - enhanced rounded */
        .calendar-container .react-calendar-dark .react-calendar__month-view__days__day--weekend {
          color: #F59E0B !important;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.15)) !important;
          border-color: rgba(245, 158, 11, 0.4) !important;
          border-radius: 16px !important;
        }

        /* Adjacent months - softer rounded styling */
        .calendar-container .react-calendar-dark .react-calendar__month-view__days__day--neighboringMonth {
          color: #6B7280 !important;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.15), rgba(10, 10, 10, 0.25)) !important;
          border-color: rgba(75, 85, 99, 0.3) !important;
          opacity: 0.6 !important;
          border-radius: 14px !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__month-view__days__day--neighboringMonth:hover {
          opacity: 1 !important;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1)) !important;
          border-radius: 18px !important;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 640px) {
          .calendar-container .react-calendar-dark .react-calendar__month-view__days {
            gap: 6px !important;
          }

          .calendar-container .react-calendar-dark .react-calendar__tile {
            border-radius: 14px !important;
          }

          .calendar-container .react-calendar-dark .react-calendar__tile > abbr {
            font-size: 12px !important;
          }

          .calendar-container .react-calendar-dark .react-calendar__tile:hover {
            border-radius: 18px !important;
          }

          .calendar-container .react-calendar-dark .react-calendar__tile--active {
            border-radius: 18px !important;
          }

          .calendar-container .react-calendar-dark .react-calendar__tile--now {
            border-radius: 16px !important;
          }

          .calendar-container .react-calendar-dark .react-calendar__tile--now::after {
            bottom: 6px !important;
            right: 6px !important;
            width: 5px !important;
            height: 5px !important;
          }
        }

        /* Pulse animation for active dates */
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5), 0 0 0 3px rgba(16, 185, 129, 0.3);
          }
          50% {
            box-shadow: 0 8px 30px rgba(16, 185, 129, 0.7), 0 0 0 3px rgba(16, 185, 129, 0.5);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* FIXED Entry summary cards - Equal sizing */
        .calendar-entry-summary {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(20, 20, 20, 0.8)) !important;
          backdrop-filter: blur(15px) !important;
          border: 1px solid rgba(75, 85, 99, 0.4) !important;
          border-radius: 16px !important;
          padding: 24px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
          transition: all 0.3s ease !important;
          margin-top: 24px !important;
        }

        .calendar-entry-summary .grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 16px !important;
        }

        .calendar-entry-summary .grid > div {
          height: 80px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          padding: 16px !important;
          border-radius: 12px !important;
          backdrop-filter: blur(10px) !important;
          transition: all 0.2s ease !important;
        }

        .calendar-entry-summary .grid > div:hover {
          transform: translateY(-2px) !important;
        }

        /* Enhanced entry summary specific fixes */
        .calendar-entry-summary-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 16px !important;
        }

        .calendar-entry-summary-card {
          height: 80px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          text-align: center !important;
          padding: 16px !important;
          border-radius: 12px !important;
          backdrop-filter: blur(10px) !important;
          transition: all 0.3s ease !important;
          position: relative !important;
          overflow: hidden !important;
        }

        .calendar-entry-summary-card:hover {
          transform: translateY(-2px) scale(1.02) !important;
        }

        .calendar-action-buttons {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 12px !important;
        }

        .calendar-action-button {
          height: 56px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 12px !important;
          transition: all 0.3s ease !important;
          font-weight: 600 !important;
        }

        /* Mobile responsive entry summary */
        @media (max-width: 640px) {
          .calendar-entry-summary-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          .calendar-entry-summary-card {
            height: 70px !important;
            padding: 12px !important;
          }

          .calendar-action-buttons {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }

          .calendar-action-button {
            height: 48px !important;
            flex-direction: row !important;
            gap: 8px !important;
          }
        }

        /* Removed mobile fixes - moved to global CSS */

        /* Ensure proper grid behavior */
        .calendar-container .react-calendar-dark .react-calendar__navigation > * {
          margin: 0 !important;
          padding: 0 !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation > *:nth-child(1) {
          grid-column: 1 !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation > *:nth-child(2) {
          grid-column: 2 !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation > *:nth-child(3) {
          grid-column: 3 !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation > *:nth-child(4) {
          grid-column: 4 !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation > *:nth-child(5) {
          grid-column: 5 !important;
        }

        /* Enhanced chart container with glassmorphism */
        .chart-container {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.9)) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(75, 85, 99, 0.4) !important;
          border-radius: 24px !important;
          padding: 24px !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
          position: relative !important;
          overflow: hidden !important;
        }

        .chart-container::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.05)) !important;
          pointer-events: none !important;
        }

        /* Enhanced chart styling */
        .recharts-bar-rectangle {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) !important;
        }

        .recharts-cartesian-grid line {
          stroke: rgba(75, 85, 99, 0.3) !important;
          stroke-dasharray: 3 3 !important;
        }

        .recharts-xaxis .recharts-cartesian-axis-tick-value,
        .recharts-yaxis .recharts-cartesian-axis-tick-value {
          fill: #9CA3AF !important;
          font-size: 12px !important;
          font-weight: 600 !important;
        }

        .recharts-tooltip-wrapper {
          filter: drop-shadow(0 8px 32px rgba(0, 0, 0, 0.5)) !important;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 640px) {
          .chart-container {
            padding: 16px !important;
            border-radius: 20px !important;
          }
        }

        /* Custom height classes */
        .h-18 {
          height: 4.5rem !important; /* 72px */
        }



        /* Ensure proper grid behavior */
        .calendar-container .react-calendar-dark .react-calendar__navigation > * {
          margin: 0 !important;
          padding: 0 !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation > *:nth-child(1) {
          grid-column: 1 !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation > *:nth-child(2) {
          grid-column: 2 !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation > *:nth-child(3) {
          grid-column: 3 !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation > *:nth-child(4) {
          grid-column: 4 !important;
        }

        .calendar-container .react-calendar-dark .react-calendar__navigation > *:nth-child(5) {
          grid-column: 5 !important;
        }

        /* Enhanced chart container with glassmorphism */
        .chart-container {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.9)) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(75, 85, 99, 0.4) !important;
          border-radius: 24px !important;
          padding: 24px !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
          position: relative !important;
          overflow: hidden !important;
        }

        .chart-container::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.05)) !important;
          pointer-events: none !important;
        }

        /* Enhanced chart styling */
        .recharts-bar-rectangle {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) !important;
        }

        .recharts-cartesian-grid line {
          stroke: rgba(75, 85, 99, 0.3) !important;
          stroke-dasharray: 3 3 !important;
        }

        .recharts-xaxis .recharts-cartesian-axis-tick-value,
        .recharts-yaxis .recharts-cartesian-axis-tick-value {
          fill: #9CA3AF !important;
          font-size: 12px !important;
          font-weight: 600 !important;
        }

        .recharts-tooltip-wrapper {
          filter: drop-shadow(0 8px 32px rgba(0, 0, 0, 0.5)) !important;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 640px) {
          .chart-container {
            padding: 16px !important;
            border-radius: 20px !important;
          }
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