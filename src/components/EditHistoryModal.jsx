import { useState, useEffect } from 'react'
import { X, History, Undo, Clock, User } from 'lucide-react'
import { format } from 'date-fns'
import { timeEntriesService } from '../services/timeEntries'

export default function EditHistoryModal({ 
  isOpen, 
  onClose, 
  timeEntry,
  onUndo
}) {
  const [editHistory, setEditHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [undoing, setUndoing] = useState(false)

  useEffect(() => {
    if (isOpen && timeEntry) {
      loadEditHistory()
    }
  }, [isOpen, timeEntry])

  const loadEditHistory = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await timeEntriesService.getEditHistory(timeEntry.id)
      if (result.success) {
        setEditHistory(result.data || [])
      } else {
        setError(result.error || 'Failed to load edit history')
      }
    } catch (err) {
      setError('Failed to load edit history')
    } finally {
      setLoading(false)
    }
  }

  const handleUndo = async () => {
    if (!timeEntry || editHistory.length === 0) return

    setUndoing(true)
    try {
      const result = await timeEntriesService.undoLastEdit(timeEntry.id)
      if (result.success) {
        onUndo?.(result.data)
        onClose()
      } else {
        setError(result.error || 'Failed to undo last edit')
      }
    } catch (err) {
      setError('Failed to undo last edit')
    } finally {
      setUndoing(false)
    }
  }

  const formatDateTime = (dateTime) => {
    return format(new Date(dateTime), 'MMM dd, yyyy hh:mm a')
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return '--'
    return timeStr
  }

  const renderTimeComparison = (field, oldValue, newValue, label) => {
    const hasChanged = oldValue !== newValue
    
    return (
      <div className="flex justify-between items-center py-1">
        <span className="text-gray-400 text-xs">{label}</span>
        <div className="flex items-center space-x-1.5">
          <span className={`text-xs ${hasChanged ? 'text-red-400 line-through' : 'text-gray-400'}`}>
            {formatTime(oldValue)}
          </span>
          {hasChanged && (
            <>
              <span className="text-gray-500 text-xs">→</span>
              <span className="text-green-400 text-xs font-medium">
                {formatTime(newValue)}
              </span>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_0_rgba(0,0,0,0.8)] border border-gray-700/50 p-6 w-full max-w-3xl max-h-[85vh] flex flex-col transform transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.95) 50%, rgba(0,0,0,0.9) 100%)',
          boxShadow: '0 20px 50px 0 rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-lg mr-3">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Edit History
              </h2>
              <p className="text-gray-400 text-sm">
                {timeEntry && format(new Date(timeEntry.date), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editHistory.length > 0 && (
              <button
                onClick={handleUndo}
                disabled={undoing}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  {undoing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5"></div>
                      Undoing...
                    </>
                  ) : (
                    <>
                      <Undo className="w-3 h-3 mr-1.5" />
                      Undo Last
                    </>
                  )}
                </div>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(85vh-120px)] pr-2 -mr-2 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-300">Loading edit history...</span>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/20">
              <p className="text-red-400">{error}</p>
            </div>
          ) : editHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No edit history found</p>
              <p className="text-gray-500 text-sm">This entry hasn't been modified since creation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {editHistory.map((edit, index) => {
                const previousData = edit.previous_data
                const newData = edit.new_data
                const isLatest = index === 0

                return (
                  <div 
                    key={edit.id}
                    className={`relative bg-gradient-to-r backdrop-blur-sm rounded-lg p-4 border transition-all duration-300 ${
                      isLatest 
                        ? 'from-purple-500/15 to-pink-500/15 border-purple-500/25' 
                        : 'from-gray-800/30 to-gray-700/30 border-gray-600/25'
                    }`}
                  >
                    {isLatest && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                        Latest
                      </div>
                    )}

                    {/* Edit Metadata */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1.5 text-purple-400" />
                        <span>Edited on {formatDateTime(edit.created_at)}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="w-3 h-3 mr-1" />
                        <span>Edit #{editHistory.length - index}</span>
                      </div>
                    </div>

                    {/* Changes */}
                    <div className="space-y-1">
                      {renderTimeComparison('check_in', previousData.check_in, newData.check_in, 'Check In')}
                      {renderTimeComparison('check_out', previousData.check_out, newData.check_out, 'Check Out')}
                      {renderTimeComparison('break_in', previousData.break_in, newData.break_in, 'Break In')}
                      {renderTimeComparison('break_out', previousData.break_out, newData.break_out, 'Break Out')}
                      
                      {/* Total Hours */}
                      <div className="flex justify-between items-center py-1 border-t border-gray-700/30 mt-2 pt-2">
                        <span className="text-gray-300 text-xs font-medium">Total Hours</span>
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-xs ${
                            previousData.total_hours !== newData.total_hours 
                              ? 'text-red-400 line-through' 
                              : 'text-gray-400'
                          }`}>
                            {previousData.total_hours ? `${previousData.total_hours}h` : '--'}
                          </span>
                          {previousData.total_hours !== newData.total_hours && (
                            <>
                              <span className="text-gray-500 text-xs">→</span>
                              <span className="text-green-400 text-xs font-medium">
                                {newData.total_hours ? `${newData.total_hours}h` : '--'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 