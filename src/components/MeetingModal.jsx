import { useState, useEffect } from 'react'
import { Clock, Plus, Trash2, X, Save } from 'lucide-react'

export default function MeetingModal({ isOpen, onClose, onSave, initialMeetings = [] }) {
  const [meetings, setMeetings] = useState([])
  const [errors, setErrors] = useState({})

  // Initialize meetings from props
  useEffect(() => {
    if (isOpen) {
      setMeetings(initialMeetings.length > 0 ? [...initialMeetings] : [{ start: '', end: '' }])
      setErrors({})
    }
  }, [isOpen, initialMeetings])

  const addMeeting = () => {
    setMeetings([...meetings, { start: '', end: '' }])
  }

  const removeMeeting = (index) => {
    if (meetings.length > 1) {
      const newMeetings = meetings.filter((_, i) => i !== index)
      setMeetings(newMeetings)
      // Clear error for removed meeting
      const newErrors = { ...errors }
      delete newErrors[`start-${index}`]
      delete newErrors[`end-${index}`]
      setErrors(newErrors)
    }
  }

  const updateMeeting = (index, field, value) => {
    const newMeetings = [...meetings]
    newMeetings[index][field] = value
    setMeetings(newMeetings)
    
    // Clear error when user starts typing
    if (errors[`${field}-${index}`]) {
      const newErrors = { ...errors }
      delete newErrors[`${field}-${index}`]
      setErrors(newErrors)
    }
  }

  const validateMeetings = () => {
    const newErrors = {}
    
    meetings.forEach((meeting, index) => {
      if (!meeting.start) {
        newErrors[`start-${index}`] = 'Start time is required'
      }
      if (!meeting.end) {
        newErrors[`end-${index}`] = 'End time is required'
      }
      
      if (meeting.start && meeting.end) {
        const startTime = new Date(`1970-01-01T${meeting.start}:00`)
        const endTime = new Date(`1970-01-01T${meeting.end}:00`)
        
        if (endTime <= startTime) {
          newErrors[`end-${index}`] = 'End time must be after start time'
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateMeetings()) {
      // Filter out empty meetings
      const validMeetings = meetings.filter(meeting => meeting.start && meeting.end)
      onSave(validMeetings)
      onClose()
    }
  }

  const handleClose = () => {
    setMeetings([])
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-2xl rounded-3xl border border-gray-700/50 shadow-2xl transform transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.95) 50%, rgba(0,0,0,0.95) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Meeting Hours
              </h3>
              <p className="text-xs text-gray-400">Add your meeting times for today</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {meetings.map((meeting, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">
                  Meeting {index + 1}
                </span>
                {meetings.length > 1 && (
                  <button
                    onClick={() => removeMeeting(index)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={meeting.start}
                    onChange={(e) => updateMeeting(index, 'start', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-800/60 border rounded-xl text-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                      errors[`start-${index}`] 
                        ? 'border-red-500/50 focus:ring-red-500/20' 
                        : 'border-gray-600/50 focus:ring-purple-500/20 focus:border-purple-500/50'
                    }`}
                  />
                  {errors[`start-${index}`] && (
                    <p className="text-xs text-red-400 mt-1">{errors[`start-${index}`]}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={meeting.end}
                    onChange={(e) => updateMeeting(index, 'end', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-800/60 border rounded-xl text-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                      errors[`end-${index}`] 
                        ? 'border-red-500/50 focus:ring-red-500/20' 
                        : 'border-gray-600/50 focus:ring-purple-500/20 focus:border-purple-500/50'
                    }`}
                  />
                  {errors[`end-${index}`] && (
                    <p className="text-xs text-red-400 mt-1">{errors[`end-${index}`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add More Button */}
          <button
            onClick={addMeeting}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-300 rounded-xl hover:from-pink-500/30 hover:via-purple-500/30 hover:to-cyan-500/30 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Another Meeting</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t border-gray-700/50">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>Save Meetings</span>
          </button>
        </div>
      </div>
    </div>
  )
} 