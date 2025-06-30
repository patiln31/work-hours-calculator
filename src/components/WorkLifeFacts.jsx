import React, { useState, useEffect } from 'react';
import { Heart, Brain, Zap, Coffee, Moon, Users, Award, TrendingUp } from 'lucide-react';

export default function WorkLifeFacts() {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  const facts = [
    {
      icon: Heart,
      title: "Health First",
      fact: "Studies show that working more than 55 hours per week increases the risk of heart disease by 13%.",
      tip: "Take regular breaks to keep your heart healthy!"
    },
    {
      icon: Brain,
      title: "Mental Clarity",
      fact: "The average human brain can only focus intensely for 90-120 minutes before needing a break.",
      tip: "Use the Pomodoro Technique for better focus."
    },
    {
      icon: Zap,
      title: "Peak Productivity",
      fact: "Most people experience peak productivity during the first 2-3 hours of their workday.",
      tip: "Schedule your most important tasks early!"
    },
    {
      icon: Coffee,
      title: "Break Benefits",
      fact: "Taking a 15-20 minute break every 2 hours can increase productivity by up to 23%.",
      tip: "Don't skip your breaks - they're investments!"
    },
    {
      icon: Moon,
      title: "Sleep Matters",
      fact: "Getting 7-9 hours of sleep can improve work performance by 13% and reduce errors by 23%.",
      tip: "Prioritize your sleep for better work days."
    },
    {
      icon: Users,
      title: "Work-Life Balance",
      fact: "Employees with good work-life balance are 21% more productive and 10% more engaged.",
      tip: "Balance isn't selfish - it's strategic!"
    },
    {
      icon: Award,
      title: "Quality over Quantity",
      fact: "Countries with shorter work weeks often have higher productivity rates per hour worked.",
      tip: "Work smarter, not just harder."
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      fact: "Taking time off and maintaining boundaries leads to 40% less burnout and better career longevity.",
      tip: "Sustainable pace wins the marathon."
    }
  ];

  // Auto-rotate facts every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
    }, 8000);
    
    return () => clearInterval(timer);
  }, [facts.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Work-Life Balance
        </h3>
        <p className="text-gray-300 text-sm mt-2">Daily insights for better work habits</p>
      </div>

      {/* Current Featured Fact */}
      <div className="relative">
        <div className="bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] border border-gray-700/50 p-6 transform transition-all duration-500 hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3">
                {React.createElement(facts[currentFactIndex].icon, { className: "w-6 h-6 text-white" })}
              </div>
              <h4 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {facts[currentFactIndex].title}
              </h4>
            </div>
            <div className="text-xs text-gray-400">
              {currentFactIndex + 1}/{facts.length}
            </div>
          </div>
          
          <p className="text-gray-200 text-sm leading-relaxed mb-4">
            {facts[currentFactIndex].fact}
          </p>
          
          <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg p-3 border border-purple-500/20">
            <p className="text-cyan-300 text-xs font-medium">
              💡 {facts[currentFactIndex].tip}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex space-x-1 mt-4 justify-center">
            {facts.map((_, index) => (
              <div
                key={index}
                className={`h-1 w-6 rounded-full transition-all duration-300 ${
                  index === currentFactIndex 
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-400' 
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-200 mb-3">Quick Stats</h4>
        
        <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Optimal Work Week</p>
              <p className="text-white text-lg font-bold">40 hours</p>
            </div>
            <div className="text-green-400 text-2xl">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Recommended Sleep</p>
              <p className="text-white text-lg font-bold">7-9 hours</p>
            </div>
            <div className="text-blue-400 text-2xl">😴</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">Break Frequency</p>
              <p className="text-white text-lg font-bold">Every 2 hours</p>
            </div>
            <div className="text-orange-400 text-2xl">⏰</div>
          </div>
        </div>
      </div>

      {/* Navigation dots for manual control */}
      <div className="text-center">
        <p className="text-gray-400 text-xs mb-2">Tap to navigate</p>
        <div className="flex justify-center space-x-2">
          {facts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentFactIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentFactIndex 
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-400 scale-125' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 