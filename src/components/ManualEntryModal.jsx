import { useState, useEffect } from 'react'
import { X, Save, Calculator, Clock, Users } from 'lucide-react'
import { format } from 'date-fns'
import { timeEntriesService } from '../services/timeEntries'
import MeetingModal from './MeetingModal'

export default function ManualEntryModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  existingEntry = null, 
  onSave,
  isAdmin = false,
  targetUserId = null 
}) {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    breakIn: '',
    breakOut: ''
  })
  const [meetingEntries, setMeetingEntries] = useState([])
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [calculatedHours, setCalculatedHours] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Initialize form with existing entry data
  useEffect(() => {
    if (existingEntry) {
      setFormData({
        checkIn: existingEntry.check_in || '',
        checkOut: existingEntry.check_out || '',
        breakIn: existingEntry.break_in || '',
        breakOut: existingEntry.break_out || ''
      })
      // Load meeting data if available
      if (existingEntry.meeting_data) {
        setMeetingEntries(existingEntry.meeting_data)
      } else {
        setMeetingEntries([])
      }
    } else {
      setFormData({
        checkIn: '',
        checkOut: '',
        breakIn: '',
        breakOut: ''
      })
      setMeetingEntries([])
    }
    setError('')
    setCalculatedHours(null)
  }, [existingEntry, isOpen])

  // Auto-calculate hours when times or meetings change
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      // Calculate meeting hours
      let meetingHours = 0
      if (meetingEntries && meetingEntries.length > 0) {
        let totalMeetingMs = 0
        meetingEntries.forEach(meeting => {
          if (meeting.start && meeting.end) {
            const startTime = new Date(`1970-01-01T${meeting.start}:00`)
            const endTime = new Date(`1970-01-01T${meeting.end}:00`)
            if (endTime > startTime) {
              totalMeetingMs += endTime - startTime
            }
          }
        })
        meetingHours = Math.round((totalMeetingMs / (1000 * 60 * 60)) * 100) / 100
      }
      // Use the updated service function to include meeting hours
      const hours = timeEntriesService.calculateTotalHours(formData, meetingHours)
      setCalculatedHours(hours)
    } else {
      setCalculatedHours(null)
    }
  }, [formData, meetingEntries])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)

    try {
      // Validation
      if (!formData.checkIn || !formData.checkOut) {
        throw new Error('Check-in and check-out times are required')
      }

      // Validate break times
      if ((formData.breakIn && !formData.breakOut) || (!formData.breakIn && formData.breakOut)) {
        throw new Error('Both break-in and break-out times are required if using breaks')
      }

      // Calculate meeting hours
      let meetingHours = null
      if (meetingEntries && meetingEntries.length > 0) {
        let totalMeetingMs = 0
        meetingEntries.forEach(meeting => {
          if (meeting.start && meeting.end) {
            const startTime = new Date(`1970-01-01T${meeting.start}:00`)
            const endTime = new Date(`1970-01-01T${meeting.end}:00`)
            if (endTime > startTime) {
              totalMeetingMs += endTime - startTime
            }
          }
        })
        meetingHours = Math.round((totalMeetingMs / (1000 * 60 * 60)) * 100) / 100
      }

      const entryData = {
        ...formData,
        meetingHours,
        meetingData: meetingEntries.length > 0 ? meetingEntries : null
      }

      const result = await timeEntriesService.saveManualTimeEntry(
        entryData, 
        selectedDate, 
        targetUserId
      )

      if (result.success) {
        onSave?.(result.data)
        onClose()
      } else {
        setError(result.error || 'Failed to save entry')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date) => {
    return format(new Date(date), 'EEEE, MMMM d, yyyy')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_0_rgba(0,0,0,0.8)] border border-gray-700/50 p-8 w-full max-w-2xl transform transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.95) 50%, rgba(0,0,0,0.9) 100%)',
          boxShadow: '0 20px 50px 0 rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-xl mr-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {existingEntry ? 'Edit Time Entry' : 'New Time Entry'}
              </h2>
              <p className="text-gray-300 text-sm">{formatDate(selectedDate)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Time Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                label: 'Office In Time', 
                field: 'checkIn', 
                value: formData.checkIn,
                required: true,
                icon: '🏢'
              },
              { 
                label: 'Office Out Time', 
                field: 'checkOut', 
                value: formData.checkOut,
                required: true,
                icon: '🚪'
              },
              { 
                label: 'Break In Time', 
                field: 'breakIn', 
                value: formData.breakIn,
                icon: '☕'
              },
              { 
                label: 'Break Out Time', 
                field: 'breakOut', 
                value: formData.breakOut,
                icon: '🔄'
              }
            ].map((field, index) => (
              <div key={field.field} className="group">
                <label className="flex items-center text-gray-200 text-sm font-medium mb-2">
                  <span className="mr-2">{field.icon}</span>
                  {field.label}
                  {field.required && <span className="text-cyan-400 ml-1">*</span>}
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={field.value}
                    onChange={(e) => handleInputChange(field.field, e.target.value)}
                    className="w-full bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-gray-700/60 focus:bg-gray-700/60"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Meeting Hours Button */}
          <button
            onClick={() => setShowMeetingModal(true)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-purple-500/30 text-purple-300 font-medium hover:from-purple-500/30 hover:to-cyan-500/30 transform transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Add Meeting Hours</span>
            {meetingEntries.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-purple-500/30 rounded-full text-xs">
                {meetingEntries.length} meeting{meetingEntries.length !== 1 ? 's' : ''}
              </span>
            )}
          </button>

          {/* Calculated Hours Display */}
          {calculatedHours !== null && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calculator className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-green-300 font-medium">Calculated Working Hours</span>
                </div>
                <span className="text-white text-xl font-bold">
                  {calculatedHours}h
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/20">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 text-gray-200 font-medium hover:bg-gray-700/60 transform transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.checkIn || !formData.checkOut}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-95 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center">
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {existingEntry ? 'Update Entry' : 'Save Entry'}
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Meeting Modal */}
      <MeetingModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        onSave={(meetings) => {
          setMeetingEntries(meetings);
          setShowMeetingModal(false);
        }}
        initialMeetings={meetingEntries}
      />
    </div>
  )
} 