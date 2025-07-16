# 🕐 Punch'd

A beautiful, responsive web application for tracking working hours with precision. Features real-time weather integration, interactive animations, and a stunning glassmorphism UI design.

![Punch'd Desktop](./public/screenshots/desktop-showcase.png)

## ✨ Features

### 🎯 **Core Functionality**
- **Precise Time Tracking**: Calculate working hours with break management
- **Smart Calculations**: Automatic time until 8.5 hours completion
- **Expected Leave Time**: Real-time calculation of when you can leave
- **Live Status Tracking**: Dynamic status updates with visual indicators

### 🌤️ **Real Weather Integration**
- **Live Weather Data**: Integrated with OpenWeatherMap API
- **Location Detection**: Automatic geolocation with city display
- **Weather Animations**: Beautiful condition-based animations
  - ☀️ Sunny: Rotating sun rays with floating particles
  - 🌧️ Rainy: Animated raindrops with splash effects
  - ☁️ Cloudy: Layered cloud formations with mist
  - ❄️ Snowy: Falling snowflakes with varied patterns
  - 💨 Windy: Swirling wind lines and particles

### 🎨 **Modern UI Design**
- **Glassmorphism Effects**: Beautiful translucent design with backdrop blur
- **Gradient Themes**: Stunning cyan-purple-pink color schemes
- **Interactive Hover Effects**: Smooth animations and transformations
- **Responsive Layout**: Optimized for all device sizes

### 📱 **Responsive Experience**
- **Mobile-First Design**: Stacked layout for mobile devices
- **Adaptive Time Display**: 
  - Mobile: Minimal centered design
  - Desktop: Full glassmorphism with date
- **Three-Column Desktop**: Weather & Stats | Calculator | Work-Life Balance
- **Touch-Friendly**: Optimized for mobile interactions

### 💡 **Work-Life Balance Features**
- **Daily Insights**: 8 rotating work-life balance facts
- **Inspirational Quotes**: Famous quotes from leaders (Churchill, Jobs, Gandhi, etc.)
- **Quick Stats**: Optimal work hours, sleep recommendations, break frequency
- **Auto-Rotation**: Content changes every 8-12 seconds

### ⏰ **Real-Time Features**
- **Live Current Time**: Always-updated time display
- **Dynamic Calculations**: Real-time working hour updates
- **Status Indicators**: Visual feedback with pulsing animations
- **Auto-Refresh**: Calculations update as time progresses

## 🚀 Live Demo

**[View Live Application](https://patiln31.github.io/work-hours-calculator/)**

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom glassmorphism
- **Icons**: Lucide React
- **Weather API**: OpenWeatherMap
- **Geolocation**: Browser Geolocation API + BigDataCloud reverse geocoding
- **Deployment**: GitHub Pages
- **Build Tool**: Vite with hot module replacement

## 📱 Device Support

### Desktop (≥1024px)
- Three-column layout with full feature set
- Rich glassmorphism effects and hover animations
- Complete weather animations and detailed stats

### Mobile (<1024px)
- Stacked vertical layout for optimal mobile experience
- Simplified but themed interface
- All core functionality maintained

## 🎯 Default Settings

- **Check-in Time**: 10:00 AM
- **Break Period**: 2:00 PM - 2:30 PM (30 minutes)
- **Target Hours**: 8.5 hours per day
- **Weather Updates**: Real-time based on location

## 🔧 Installation & Development

```bash
# Clone the repository
git clone https://github.com/patiln31/work-hours-calculator.git

# Navigate to project directory
cd work-hours-calculator

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🌐 Environment Setup

To use real weather data, you'll need an OpenWeatherMap API key:

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Update the `WEATHER_API_KEY` in `src/components/WeatherQuotes.jsx`

## 🎨 Design Philosophy

This application combines functionality with beauty, featuring:

- **Glassmorphism**: Modern translucent design language
- **Responsive Design**: Seamless experience across all devices
- **Real-World Integration**: Live weather and location data
- **User-Centric**: Intuitive interface with helpful insights
- **Performance**: Optimized animations and efficient rendering

## 📈 Key Features Showcase

### Time Calculation Cards
- **Hover Effects**: Scale, lift, and glow animations
- **Color-Coded**: Each card has unique gradient themes
- **Icon Animations**: Rotating and scaling micro-interactions
- **Real-Time Updates**: Live calculation refresh

### Weather Integration
- **Accurate Data**: Real weather from your location
- **Visual Feedback**: Condition-based animations
- **Performance**: Efficient API calls with caching
- **Fallback Handling**: Graceful degradation if location/API fails

### Work-Life Balance
- **Educational Content**: Research-backed productivity tips
- **Inspiration**: Motivational quotes from successful leaders
- **Rotation System**: Fresh content every few seconds
- **Visual Design**: Consistent with overall app theme

## 🚀 Deployment

The application is automatically deployed to GitHub Pages using:
- **GitHub Actions**: Automated deployment pipeline
- **Vite Build**: Optimized production builds
- **Custom Domain Support**: Ready for custom domain setup

## 🤝 Contributing

Feel free to contribute to this project! Whether it's:
- 🐛 Bug fixes
- ✨ New features
- 🎨 UI improvements
- 📖 Documentation updates

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **OpenWeatherMap** for weather data API
- **BigDataCloud** for reverse geocoding
- **Lucide** for beautiful icons
- **Tailwind CSS** for styling framework
- **Vite** for blazing fast development experience

---

**Built with ❤️ for productivity and beautiful user experiences**
