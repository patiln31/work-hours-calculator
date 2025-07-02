import { useState, useEffect } from 'react'
import { ChevronDown, Users, Check } from 'lucide-react'
import { timeEntriesService } from '../services/timeEntries'

export default function UserSelector({ selectedUserId, onUserChange, isAdmin }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const result = await timeEntriesService.getUsersWithEntries()
      if (result.success) {
        setUsers(result.data || [])
      } else {
        setError(result.error || 'Failed to load users')
      }
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (userId) => {
    onUserChange(userId)
    setIsOpen(false)
  }

  // Don't render if not admin
  if (!isAdmin) return null

  return (
    <div className="relative">
      <div className="mb-4">
        <label className="flex items-center text-gray-200 text-sm font-medium mb-2">
          <Users className="w-4 h-4 mr-2 text-purple-400" />
          Select User (Admin View)
        </label>
        
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={loading}
            className="w-full bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl px-4 py-3 text-left text-white hover:bg-gray-700/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span>
                {loading ? 'Loading users...' : selectedUserId ? `User: ${selectedUserId.slice(0, 8)}...` : 'All Users'}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-xl shadow-2xl z-10 max-h-64 overflow-y-auto">
              {/* All Users Option */}
              <button
                onClick={() => handleUserSelect(null)}
                className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700/50 flex items-center justify-between transition-colors duration-200"
              >
                <span>All Users</span>
                {selectedUserId === null && (
                  <Check className="w-4 h-4 text-green-400" />
                )}
              </button>

              {/* Individual Users */}
              {users.length > 0 ? (
                users.map((userId) => (
                  <button
                    key={userId}
                    onClick={() => handleUserSelect(userId)}
                    className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700/50 flex items-center justify-between transition-colors duration-200"
                  >
                    <div>
                      <div className="font-medium">User {userId.slice(0, 8)}...</div>
                      <div className="text-xs text-gray-400">{userId}</div>
                    </div>
                    {selectedUserId === userId && (
                      <Check className="w-4 h-4 text-green-400" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-400 text-sm">
                  {error || 'No users found'}
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-xs mt-1">{error}</p>
        )}
      </div>
    </div>
  )
} 