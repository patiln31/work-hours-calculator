import { useState } from 'react'
import { useAnimation } from '../contexts/AnimationContext'
import { Settings as SettingsIcon, Waves, Zap, Monitor, Smartphone, Info, Check, X } from 'lucide-react'

export default function Settings() {
  const { 
    animationEnabled, 
    performanceMode, 
    shouldShowAnimation,
    toggleAnimation, 
    togglePerformanceMode 
  } = useAnimation()

  const [showInfo, setShowInfo] = useState({})

  const toggleInfo = (key) => {
    setShowInfo(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const settingSections = [
    {
      id: 'animation',
      title: 'Animation Settings',
      icon: Waves,
      description: 'Control visual effects and animations',
      settings: [
        {
          id: 'cursor-animation',
          title: 'Cursor Animation',
          description: 'Interactive fluid animation that follows your cursor',
          value: animationEnabled,
          toggle: toggleAnimation,
          info: 'Beautiful WebGL fluid simulation that creates colorful trails as you move your cursor. May impact performance on older devices.'
        },
        {
          id: 'performance-mode',
          title: 'Performance Mode',
          description: 'Reduce animations for better performance',
          value: performanceMode,
          toggle: togglePerformanceMode,
          info: 'Automatically detected based on your device capabilities. Enable to improve battery life and performance.'
        }
      ]
    },
    {
      id: 'future',
      title: 'Coming Soon',
      icon: Zap,
      description: 'Future configuration options',
      settings: [
        {
          id: 'theme',
          title: 'Theme Settings',
          description: 'Dark mode, color schemes, and visual preferences',
          value: false,
          toggle: () => {},
          disabled: true,
          info: 'Customize the appearance of the application with different themes and color schemes.'
        },
        {
          id: 'notifications',
          title: 'Notifications',
          description: 'Break reminders and work hour alerts',
          value: false,
          toggle: () => {},
          disabled: true,
          info: 'Get notified about break times, work hour completion, and productivity insights.'
        },
        {
          id: 'data',
          title: 'Data & Privacy',
          description: 'Export settings and privacy controls',
          value: false,
          toggle: () => {},
          disabled: true,
          info: 'Manage your data, export time entries, and control privacy settings.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 w-96 h-96 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-60 -left-60 w-96 h-96 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8 mt-15">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl mb-4 transform hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 cursor-pointer group">
            <SettingsIcon className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-default">
            Settings
          </h1>
          <p className="text-gray-300 mt-2 hover:text-gray-200 transition-colors duration-200">
            Customize your TimeTrap experience
          </p>
        </div>

        {/* Current Animation Status */}
        <div className="mb-8 p-4 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-2xl border border-gray-700/50 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/30 cursor-pointer group"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${shouldShowAnimation ? 'bg-green-400' : 'bg-red-400'} animate-pulse group-hover:scale-125 transition-transform duration-300`}></div>
              <span className="text-white font-medium group-hover:text-cyan-300 transition-colors duration-200">
                Animation Status: {shouldShowAnimation ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
              <Monitor className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              <span>{performanceMode ? 'Performance Mode' : 'Standard Mode'}</span>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section) => {
            const SectionIcon = section.icon
            return (
                             <div 
                 key={section.id}
                 className="bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-2xl p-6 border border-gray-700/50 transform hover:scale-[1.01] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/30 group"
                 style={{
                   background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
                   boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                 }}
               >
                                 {/* Section Header */}
                 <div className="flex items-center space-x-3 mb-6">
                   <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/25">
                     <SectionIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-200">{section.title}</h2>
                     <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-200">{section.description}</p>
                   </div>
                 </div>

                {/* Settings */}
                <div className="space-y-4">
                  {section.settings.map((setting) => (
                                         <div 
                       key={setting.id}
                       className={`p-4 rounded-xl border transition-all duration-300 ${
                         setting.disabled 
                           ? 'border-gray-700/30 bg-gray-800/20' 
                           : 'border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50 hover:scale-[1.005] hover:shadow-lg hover:shadow-gray-900/50 hover:border-gray-600/60'
                       }`}
                     >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className={`font-semibold ${setting.disabled ? 'text-gray-500' : 'text-white'}`}>
                              {setting.title}
                            </h3>
                                                         <button
                               onClick={() => toggleInfo(setting.id)}
                               className="p-1 rounded-full hover:bg-gray-700/50 transition-all duration-200 hover:scale-110 hover:shadow-sm"
                             >
                               <Info className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors duration-200" />
                             </button>
                          </div>
                          <p className={`text-sm mt-1 ${setting.disabled ? 'text-gray-600' : 'text-gray-400'}`}>
                            {setting.description}
                          </p>
                          
                                                     {/* Info Box */}
                           {showInfo[setting.id] && (
                             <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg transform animate-in slide-in-from-top-2 duration-300 hover:scale-[1.01] hover:bg-blue-500/15 transition-all">
                               <p className="text-sm text-blue-300 hover:text-blue-200 transition-colors duration-200">{setting.info}</p>
                             </div>
                           )}
                        </div>

                                                 {/* Toggle Switch */}
                         <div className="ml-4">
                           <button
                             onClick={setting.disabled ? undefined : setting.toggle}
                             disabled={setting.disabled}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:scale-110 hover:shadow-lg ${
                               setting.disabled
                                 ? 'bg-gray-700 cursor-not-allowed'
                                 : setting.value
                                 ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-purple-500/50'
                                 : 'bg-gray-600 hover:bg-gray-500 hover:shadow-gray-500/30'
                             }`}
                           >
                             <span
                               className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 hover:scale-110 ${
                                 setting.value ? 'translate-x-6' : 'translate-x-1'
                               }`}
                             />
                           </button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Settings are automatically saved to your browser's local storage
          </p>
        </div>
      </div>
    </div>
  )
} 