import TimeCalculator from './components/TimeCalculator'
import WorkLifeFacts from './components/WorkLifeFacts'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex relative overflow-hidden">
      {/* Vibrant flowing background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 w-96 h-96 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-60 -left-60 w-96 h-96 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-bl from-yellow-400 via-orange-500 to-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-tr from-green-400 via-teal-500 to-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>
      
      {/* Main Calculator - Left Side */}
      <div className="flex-1 max-w-4xl relative z-10">
        <TimeCalculator />
      </div>
      
      {/* Work Life Balance Facts - Right Side */}
      <div className="w-80 p-6 hidden lg:block relative z-10">
        <WorkLifeFacts />
      </div>
    </div>
  )
}

export default App
