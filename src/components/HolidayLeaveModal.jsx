import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Calendar, FileText, CheckCircle, AlertCircle, Save, Trash2 } from 'lucide-react'
import { holidayLeaveService } from '../services/holidayLeaveService'

export default function HolidayLeaveModal({ 
  isOpen, 
  onClose, 
  selectedDate = new Date(), 
  existingEntry = null, 
  onSave, 
  isAdmin = false,
  targetUserId = null 
}) {
  const [formData, setFormData] = useState({
    date: format(selectedDate, 'yyyy-MM-dd'),
    type: 'leave',
    title: '',
    description: '',
    isApproved: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (existingEntry) {
      setFormData({
        date: existingEntry.date,
        type: existingEntry.type,
        title: existingEntry.title || '',
        description: existingEntry.description || '',
        isApproved: existingEntry.is_approved || false
      })
    } else {
      setFormData({
        date: format(selectedDate, 'yyyy-MM-dd'),
        type: 'leave',
        title: '',
        description: '',
        isApproved: false
      })
    }
    setError('')
  }, [existingEntry, selectedDate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      if (existingEntry) {
        result = await holidayLeaveService.updateHolidayLeave(
          existingEntry.id, 
          formData, 
          targetUserId
        )
      } else {
        result = await holidayLeaveService.addHolidayLeave(formData, targetUserId)
      }

      if (result.success) {
        onSave(result.data)
        onClose()
      } else {
        setError(result.error || 'Failed to save holiday/leave')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingEntry || !window.confirm('Are you sure you want to delete this holiday/leave?')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await holidayLeaveService.deleteHolidayLeave(existingEntry.id, targetUserId)
      if (result.success) {
        onSave(null) // Signal deletion
        onClose()
      } else {
        setError(result.error || 'Failed to delete holiday/leave')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-2xl rounded-2xl border border-gray-700/50 w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {existingEntry ? 'Edit' : 'Add'} {formData.type === 'holiday' ? 'Holiday' : 'Leave'}
              </h2>
              <p className="text-sm text-gray-400">
                {format(new Date(formData.date), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'holiday' }))}
                className={`p-3 rounded-xl border-2 transition-all ${
                  formData.type === 'holiday'
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Holiday
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'leave' }))}
                className={`p-3 rounded-xl border-2 transition-all ${
                  formData.type === 'leave'
                    ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                    : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Leave
                </div>
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={formData.type === 'holiday' ? 'e.g., Independence Day' : 'e.g., Personal Leave'}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={formData.type === 'leave' ? 'Reason for leave...' : 'Additional details...'}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Approval Status (Admin only) */}
          {isAdmin && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isApproved}
                  onChange={(e) => setFormData(prev => ({ ...prev, isApproved: e.target.checked }))}
                  className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300">Approved</span>
              </label>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {existingEntry && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {existingEntry ? 'Update' : 'Save'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 