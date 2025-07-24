import { useState, useEffect } from 'react'
import { ChevronDown, Users, Check, User } from 'lucide-react'
import { timeEntriesService } from '../services/timeEntries'

export default function UserSelector({ selectedUserId, onUserChange, isAdmin }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
      // Set up periodic refresh to catch new users
      const interval = setInterval(loadUsers, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isAdmin])

  useEffect(() => {
    if (selectedUserId && users.length > 0) {
      const user = users.find(u => u.user_id === selectedUserId)
      setSelectedUser(user || null)
    } else {
      setSelectedUser(null)
    }
  }, [selectedUserId, users])

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await timeEntriesService.getUsersWithEntries()
      if (result.success) {
        console.log('Dynamically loaded users:', result.data)
        setUsers(result.data || [])
        
        // If we have fewer users than before, refresh the selection
        if (selectedUserId && !result.data.find(u => u.user_id === selectedUserId)) {
          onUserChange(null) // Reset selection if user no longer exists
        }
      } else {
        setError(result.error || 'Failed to load users')
      }
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (user) => {
    console.log('User selected:', user)
    setSelectedUser(user)
    onUserChange(user?.user_id || null)
    setIsOpen(false)
  }

  // Force refresh button for admins
  const handleRefreshUsers = () => {
    loadUsers()
  }

  // Get display name for selected user
  const getDisplayName = () => {
    if (loading) return 'Loading users...'
    if (!selectedUser) return 'All Users'
    
    const email = selectedUser.email
    const name = email.split('@')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Get user initials for avatar
  const getUserInitials = (email) => {
    const name = email.split('@')[0]
    return name.charAt(0).toUpperCase()
  }

  // Get user display name
  const getUserDisplayName = (email) => {
    const name = email.split('@')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Don't render if not admin
  if (!isAdmin) return null

  return (
    <>
      <div className="relative z-50">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center text-gray-200 text-sm font-semibold">
              <div className="w-5 h-5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-md flex items-center justify-center mr-2">
                <Users className="w-3 h-3 text-white" />
              </div>
              Select User (Admin View)
            </label>
            <button
              onClick={handleRefreshUsers}
              className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/30 transition-colors"
              title="Refresh user list"
            >
              Refresh
            </button>
          </div>
          
          <div className="relative z-50">
            {/* Main Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              disabled={loading}
              className="w-full group relative overflow-hidden rounded-2xl transition-all duration-300 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(6, 182, 212, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}
            >
              {/* Button background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex items-center justify-between p-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {selectedUser ? getUserInitials(selectedUser.email) : <Users className="w-5 h-5" />}
                  </div>
                  
                  {/* User Info */}
                  <div className="text-left min-w-0 flex-1">
                    <div className="text-white font-medium text-sm truncate">
                      {getDisplayName()}
                    </div>
                    {selectedUser && (
                      <div className="text-gray-400 text-xs truncate">
                        {selectedUser.email}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Dropdown Icon */}
                <ChevronDown className={`w-5 h-5 text-purple-400 transform transition-all duration-300 group-hover:text-purple-300 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180 scale-110' : ''}`} />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-[200] animate-fade-in-up">
                <div 
                  className="rounded-2xl border shadow-2xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,30,0.95) 25%, rgba(30,30,40,0.95) 50%, rgba(20,20,30,0.95) 75%, rgba(0,0,0,0.95) 100%)',
                    backdropFilter: 'blur(25px)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 8px 24px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* All Users Option */}
                  <button
                    onClick={() => handleUserSelect(null)}
                    className="w-full group relative overflow-hidden transition-all duration-200 hover:scale-[1.02] transform-gpu"
                  >
                    {/* Hover background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    
                    <div className="relative flex items-center justify-between p-4 border-b border-gray-700/30">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* All Users Icon */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-200" />
                        </div>
                        
                        {/* Label */}
                        <div className="text-left min-w-0 flex-1">
                          <div className="text-gray-200 group-hover:text-white font-medium text-sm transition-colors duration-200">
                            All Users
                          </div>
                          <div className="text-gray-500 group-hover:text-gray-400 text-xs transition-colors duration-200">
                            View all user entries
                          </div>
                        </div>
                      </div>
                      
                      {/* Check Mark */}
                      {!selectedUserId && (
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Individual Users */}
                  <div className="max-h-64 overflow-y-auto user-selector-scrollbar">
                    {users.length > 0 ? (
                      users.map((user, index) => (
                        <button
                          key={user.user_id}
                          onClick={() => handleUserSelect(user)}
                          className="w-full group relative overflow-hidden transition-all duration-200 hover:scale-[1.02] transform-gpu"
                        >
                          {/* Hover background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          
                          <div className="relative flex items-center justify-between p-4 border-b border-gray-700/20 last:border-b-0">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {/* User Avatar */}
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                                {getUserInitials(user.email)}
                              </div>
                              
                              {/* User Info */}
                              <div className="text-left min-w-0 flex-1">
                                <div className="text-gray-200 group-hover:text-white font-medium text-sm transition-colors duration-200 truncate">
                                  {getUserDisplayName(user.email)}
                                </div>
                                <div className="text-gray-500 group-hover:text-gray-400 text-xs transition-colors duration-200 truncate">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                            
                            {/* Check Mark */}
                            {selectedUserId === user.user_id && (
                              <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-3">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="text-gray-400 text-sm font-medium">
                          {error || 'No users found'}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {error ? 'Please try again later' : 'No time entries available'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-xs font-medium flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <span className="text-white text-xs">!</span>
                </div>
                <span className="truncate">{error}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .user-selector-scrollbar {
          overflow-x: hidden;
        }

        .user-selector-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .user-selector-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .user-selector-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, 
            rgba(139, 92, 246, 0.6) 0%, 
            rgba(236, 72, 153, 0.6) 50%, 
            rgba(6, 182, 212, 0.6) 100%);
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-selector-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, 
            rgba(139, 92, 246, 0.8) 0%, 
            rgba(236, 72, 153, 0.8) 50%, 
            rgba(6, 182, 212, 0.8) 100%);
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }

        /* Firefox scrollbar */
        .user-selector-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.6) rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </>
  )
} 