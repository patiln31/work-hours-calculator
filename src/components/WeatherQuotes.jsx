import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer } from 'lucide-react';

export default function WeatherQuotes() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("Your Location");
  const [error, setError] = useState(null);

  // OpenWeatherMap API key (free tier) 
  const WEATHER_API_KEY = 'f3641d1742dc83fd4452415215c0fc4c';
  
  // Get user's location and fetch real weather
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Get location name
            const locationResponse = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const locationData = await locationResponse.json();
            const cityName = locationData.city || locationData.locality || "Your Location";
            setLocation(cityName);
            
            // Fetch real weather data
            try {
              const weatherResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
              );
              
              if (weatherResponse.ok) {
                const weatherData = await weatherResponse.json();
                
                // Map OpenWeatherMap conditions to our simplified conditions
                const getSimplifiedCondition = (weatherMain, description) => {
                  const main = weatherMain.toLowerCase();
                  const desc = description.toLowerCase();
                  
                  if (main.includes('clear') || desc.includes('clear')) return 'sunny';
                  if (main.includes('rain') || desc.includes('rain')) return 'rainy';
                  if (main.includes('snow') || desc.includes('snow')) return 'snowy';
                  if (main.includes('wind') || desc.includes('wind')) return 'windy';
                  if (main.includes('cloud') || desc.includes('cloud')) return 'cloudy';
                  return 'sunny'; // default
                };
                
                setWeather({
                  temperature: Math.round(weatherData.main.temp),
                  condition: getSimplifiedCondition(weatherData.weather[0].main, weatherData.weather[0].description),
                  location: cityName,
                  humidity: weatherData.main.humidity,
                  windSpeed: Math.round(weatherData.wind?.speed * 3.6) || 0, // Convert m/s to km/h
                  description: weatherData.weather[0].description
                });
              } else {
                throw new Error('Weather API failed');
              }
            } catch (weatherError) {
              console.log("Weather API error, using fallback:", weatherError);
              // Fallback to a realistic default
              setWeather({
                temperature: 22,
                condition: 'cloudy',
                location: cityName,
                humidity: 65,
                windSpeed: 12,
                description: 'partly cloudy'
              });
            }
            
            setLoading(false);
          } catch (error) {
            console.log("Location/Weather error:", error);
            setLocation("Your Location");
            // Set fallback weather
            setWeather({
              temperature: 22,
              condition: 'cloudy',
              location: "Your Location",
              humidity: 65,
              windSpeed: 12,
              description: 'partly cloudy'
            });
            setLoading(false);
          }
        },
        (error) => {
          console.log("Geolocation error:", error);
          setLocation("Your Location");
          // Set fallback weather without location
          setWeather({
            temperature: 22,
            condition: 'cloudy', 
            location: "Your Location",
            humidity: 65,
            windSpeed: 12,
            description: 'partly cloudy'
          });
          setLoading(false);
        }
      );
    } else {
      // Geolocation not supported
      setWeather({
        temperature: 22,
        condition: 'cloudy',
        location: "Your Location", 
        humidity: 65,
        windSpeed: 12,
        description: 'partly cloudy'
      });
      setLoading(false);
    }
  }, []);

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-yellow-400" />;
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-gray-300" />;
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-blue-400" />;
      case 'snowy':
        return <CloudSnow className="w-8 h-8 text-blue-200" />;
      case 'windy':
        return <Wind className="w-8 h-8 text-cyan-400" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-400" />;
    }
  };

  const WeatherAnimation = ({ condition }) => {
    switch (condition) {
      case 'sunny':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Sun rays around the icon - positioned to not overlap */}
            <div className="absolute top-3 left-12 w-6 h-6 animate-spin" style={{ animationDuration: '6s' }}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-2 bg-gradient-to-t from-yellow-400/60 to-orange-300/60 rounded-full"
                  style={{
                    transform: `rotate(${i * 60}deg)`,
                    transformOrigin: '50% 150%',
                    top: '-6px',
                    left: '50%',
                    marginLeft: '-1px'
                  }}
                />
              ))}
            </div>
            
            {/* Floating light particles */}
            {[...Array(4)].map((_, i) => (
              <div
                key={`light-${i}`}
                className="absolute w-1 h-1 bg-yellow-300/50 rounded-full animate-pulse"
                style={{
                  right: `${10 + i * 8}px`,
                  top: `${20 + i * 6}px`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
            
            {/* Warm glow effect - positioned away from icon */}
            <div className="absolute top-6 right-4 w-8 h-8 bg-yellow-300/10 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
          </div>
        );
      
      case 'rainy':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Rain drops positioned to not overlap icon */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-gradient-to-b from-blue-300/60 to-blue-500/40 rounded-full animate-bounce"
                style={{
                  width: '2px',
                  height: `${4 + Math.random() * 3}px`,
                  left: `${40 + (i * 4)}%`,
                  top: `${10 + (i % 5) * 8}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s',
                  transform: `rotate(15deg)`
                }}
              />
            ))}
            
            {/* Rain splash effects */}
            {[...Array(4)].map((_, i) => (
              <div
                key={`splash-${i}`}
                className="absolute w-1 h-0.5 bg-blue-400/30 rounded-full animate-ping"
                style={{
                  left: `${50 + (i * 12)}%`,
                  bottom: '8px',
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        );
      
      case 'snowy':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Snow cloud */}
            <div className="absolute top-0 left-1 w-14 h-5 bg-gradient-to-b from-gray-300/30 to-gray-500/40 rounded-full"></div>
            
            {/* Enhanced snowflakes with varied sizes and drift */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white/80 rounded-full animate-pulse"
                style={{
                  width: `${2 + Math.random() * 3}px`,
                  height: `${2 + Math.random() * 3}px`,
                  left: `${10 + (i * 7)}%`,
                  top: `${8 + (i % 5) * 12}px`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: `${1.5 + Math.random()}s`,
                  transform: `translateX(${Math.sin(i) * 10}px)`
                }}
              />
            ))}
            
            {/* Falling snow animation */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`fall-${i}`}
                className="absolute w-1 h-1 bg-white/60 rounded-full"
                style={{
                  left: `${15 + (i * 8)}%`,
                  animation: `snowfall 3s linear infinite`,
                  animationDelay: `${i * 0.5}s`,
                  top: '-5px'
                }}
              />
            ))}
          </div>
        );
      
      case 'cloudy':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating cloud wisps positioned away from icon */}
            <div className="absolute top-2 right-4 w-8 h-4 bg-gradient-to-br from-gray-400/30 to-gray-600/40 rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-6 right-8 w-6 h-3 bg-gradient-to-br from-gray-300/25 to-gray-500/35 rounded-full animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
            
            {/* Subtle mist particles */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-gray-400/15 rounded-full animate-ping"
                style={{
                  width: `${3 + i}px`,
                  height: `${2 + i/2}px`,
                  right: `${15 + (i * 8)}%`,
                  top: `${20 + i * 4}px`,
                  animationDelay: `${i * 0.6}s`,
                  animationDuration: '3s'
                }}
              />
            ))}
          </div>
        );
      
      case 'windy':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Wind lines positioned away from icon */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent rounded-full animate-ping"
                style={{
                  width: `${20 + i * 3}px`,
                  right: `${10 + (i % 2) * 8}%`,
                  top: `${18 + i * 6}px`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s',
                  transform: `rotate(${-10 + i * 4}deg)`
                }}
              />
            ))}
            
            {/* Swirling wind particles */}
            {[...Array(4)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-cyan-300/40 rounded-full"
                style={{
                  right: `${20 + (i * 10)}%`,
                  top: `${25 + Math.sin(i) * 12}px`,
                  animation: `windSwirl 2.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`
                }}
              />
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
          Weather & Stats
        </h3>
        <p className="text-gray-300 text-sm mt-2">Current conditions and insights</p>
      </div>

      {/* Weather Section */}
      <div className="relative">
        <h4 className="text-lg font-semibold text-gray-200 mb-3">Current Weather</h4>
        {loading ? (
          <div className="bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-300 text-sm">Loading weather...</span>
            </div>
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl rounded-xl p-4 border border-gray-700/50 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 50%, rgba(0,0,0,0.8) 100%)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
            
            {/* Weather Animation Background */}
            <WeatherAnimation condition={weather.condition} />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center">
                {getWeatherIcon(weather.condition)}
                <div className="ml-3">
                  <h5 className="text-white font-semibold capitalize">{weather.description || weather.condition}</h5>
                  <p className="text-gray-300 text-xs">{weather.location}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{weather.temperature}°C</div>
              </div>
            </div>
            
            <div className="relative z-10 grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="flex items-center">
                <Thermometer className="w-3 h-3 text-red-400 mr-1" />
                <span className="text-gray-300">{weather.humidity}%</span>
              </div>
              <div className="flex items-center">
                <Wind className="w-3 h-3 text-cyan-400 mr-1" />
                <span className="text-gray-300">{weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        )}
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
    </div>
  );
} 