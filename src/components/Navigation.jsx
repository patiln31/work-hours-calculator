import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Clock, BarChart3, LogOut, User, Menu, X } from 'lucide-react'
import LoginModal from './LoginModal'

export default function Navigation() {
  const { user, signOut, isAdmin } = useAuth()
  const location = useLocation()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowMobileMenu(false)
  }

  const navItems = [
    { path: '/', label: 'Calculator', icon: Clock },
    ...(user ? [{ path: '/dashboard', label: 'Dashboard', icon: BarChart3 }] : [])
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
                TimeTrap
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 text-white border border-purple-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/60 rounded-xl border border-gray-600/50">
                    <User className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-white truncate max-w-32">
                      {user.email}
                    </span>
                    {isAdmin && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-md">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transform transition-all duration-300 hover:scale-[1.02]"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl bg-gray-800/60 border border-gray-600/50 text-gray-300 hover:text-white transition-colors"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-700/50">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 text-white border border-purple-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
                
                {/* Mobile User Section */}
                <div className="pt-4 border-t border-gray-700/50 mt-4">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 px-4 py-3 bg-gray-800/60 rounded-xl border border-gray-600/50">
                        <User className="w-5 h-5 text-purple-400" />
                        <div className="flex-1">
                          <div className="text-white text-sm truncate">{user.email}</div>
                          {isAdmin && (
                            <div className="text-xs text-yellow-400">Admin User</div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowLoginModal(true)
                        setShowMobileMenu(false)
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white rounded-xl font-semibold"
                    >
                      <User className="w-5 h-5" />
                      <span>Sign In</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />
    </>
  )
} 