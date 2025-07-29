import { createContext, useContext, useState, useEffect } from 'react'

const AnimationContext = createContext({})

export const useAnimation = () => {
  const context = useContext(AnimationContext)
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider')
  }
  return context
}

export const AnimationProvider = ({ children }) => {
  const [animationEnabled, setAnimationEnabled] = useState(() => {
    // Check localStorage for saved preference, default to true
    const saved = localStorage.getItem('animationEnabled')
    return saved !== null ? JSON.parse(saved) : true
  })

  const [performanceMode, setPerformanceMode] = useState(() => {
    // Auto-detect low-end devices
    const isLowEndDevice = 
      navigator.hardwareConcurrency < 4 || 
      navigator.deviceMemory < 4 ||
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    const saved = localStorage.getItem('performanceMode')
    return saved !== null ? JSON.parse(saved) : isLowEndDevice
  })

  const toggleAnimation = () => {
    const newValue = !animationEnabled
    setAnimationEnabled(newValue)
    localStorage.setItem('animationEnabled', JSON.stringify(newValue))
  }

  const togglePerformanceMode = () => {
    const newValue = !performanceMode
    setPerformanceMode(newValue)
    localStorage.setItem('performanceMode', JSON.stringify(newValue))
  }

  // Determine if animation should actually run
  const shouldShowAnimation = animationEnabled && !performanceMode

  const value = {
    animationEnabled,
    performanceMode,
    shouldShowAnimation,
    toggleAnimation,
    togglePerformanceMode,
  }

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  )
} 