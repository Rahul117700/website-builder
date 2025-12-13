'use client';

import { useEffect, useRef, useState } from 'react';

interface UserLocation {
  city: string;
  state: string;
  lng: number; // Longitude
  lat: number; // Latitude
  sales: number;
}

// Actual India map coordinates (longitude, latitude)
const indiaCoordinates = [
  [68,23],[69,24],[70,25],[71,26],[72,27],
  [73,28],[74,29],[75,30],[76,31],[77,32],
  [78,33],[79,34],[80,34],[81,33],[82,32],
  [83,31],[84,30],[85,29],[86,28],[87,27],
  [88,26],[89,25],[90,24],[91,23],
  [92,22],[91,21],[90,20],[89,19],[88,18],
  [87,17],[86,16],[85,15],[84,14],[83,13],
  [82,12],[81,11],[80,10],[79,9],[78,8],
  [77,9],[76,10],[75,11],[74,12],[73,13],
  [72,14],[71,15],[70,16],[69,17],[68,18],
  [68,23]
];

const indianCities: UserLocation[] = [
  { city: 'Mumbai', state: 'Maharashtra', lng: 72.8777, lat: 19.0760, sales: 245 },
  { city: 'Delhi', state: 'Delhi', lng: 77.1025, lat: 28.7041, sales: 198 },
  { city: 'Bangalore', state: 'Karnataka', lng: 77.5946, lat: 12.9716, sales: 312 },
  { city: 'Hyderabad', state: 'Telangana', lng: 78.4867, lat: 17.3850, sales: 167 },
  { city: 'Chennai', state: 'Tamil Nadu', lng: 80.2707, lat: 13.0827, sales: 143 },
  { city: 'Kolkata', state: 'West Bengal', lng: 88.3639, lat: 22.5726, sales: 128 },
  { city: 'Pune', state: 'Maharashtra', lng: 73.8567, lat: 18.5204, sales: 156 },
  { city: 'Ahmedabad', state: 'Gujarat', lng: 72.5714, lat: 23.0225, sales: 134 },
  { city: 'Jaipur', state: 'Rajasthan', lng: 75.7873, lat: 26.9124, sales: 98 },
  { city: 'Lucknow', state: 'Uttar Pradesh', lng: 80.9462, lat: 26.8467, sales: 87 },
];

// Function to convert lat/lng to SVG coordinates
const projectToSVG = (lng: number, lat: number, width: number, height: number) => {
  // India bounds: lng 68-92, lat 8-34
  const minLng = 68, maxLng = 92;
  const minLat = 8, maxLat = 34;
  
  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  const y = height - ((lat - minLat) / (maxLat - minLat)) * height; // Invert Y axis
  
  return { x, y };
};

export default function IndiaGlobe() {
  const [activeCity, setActiveCity] = useState<number>(0);
  const [pulseRings, setPulseRings] = useState<Array<{ id: number; cityIndex: number }>>([]);

  useEffect(() => {
    // Cycle through cities
    const cityInterval = setInterval(() => {
      setActiveCity((prev) => (prev + 1) % indianCities.length);
    }, 3000);

    // Create pulse animations
    const pulseInterval = setInterval(() => {
      const randomCity = Math.floor(Math.random() * indianCities.length);
      const newPulse = { id: Date.now(), cityIndex: randomCity };
      setPulseRings((prev) => [...prev, newPulse]);
      
      // Remove pulse after animation
      setTimeout(() => {
        setPulseRings((prev) => prev.filter(p => p.id !== newPulse.id));
      }, 2000);
    }, 1500);

    return () => {
      clearInterval(cityInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Globe Grid Background */}
      <div className="absolute inset-0 opacity-20">
        {/* Latitude lines */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`lat-${i}`}
            className="absolute w-full border-t border-indigo-300"
            style={{ top: `${(i + 1) * 11}%` }}
          />
        ))}
        {/* Longitude lines */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`lng-${i}`}
            className="absolute h-full border-l border-indigo-300"
            style={{ left: `${(i + 1) * 11}%` }}
          />
        ))}
      </div>

      {/* Continents in background (faded) */}
      <div className="absolute inset-0 opacity-5">
        <svg viewBox="0 0 800 600" className="w-full h-full">
          {/* World map outlines - very faded */}
          <path d="M 100 200 Q 150 180 200 200 L 250 220 L 280 200 L 250 180 L 200 190 L 150 170 L 100 190 Z" fill="#94A3B8" />
          <path d="M 550 250 Q 600 230 650 250 L 680 280 L 650 300 L 600 290 L 550 280 Z" fill="#94A3B8" />
        </svg>
      </div>

      {/* Title: "India" */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-white to-green-500 bg-clip-text text-transparent drop-shadow-lg">
            🇮🇳 INDIA
          </div>
          <div className="text-sm text-indigo-700 font-semibold mt-1">Pan-India Digital Marketplace</div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full max-w-4xl aspect-[4/3]">
        {/* India Map SVG */}
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <svg viewBox="0 0 600 650" className="w-full h-full drop-shadow-2xl" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="indiaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF9933" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#138808" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="indiaGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#4F46E5" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#4338CA" stopOpacity="0.95" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="shadow">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3"/>
              </filter>
            </defs>

            {/* India Map Outline - Using actual coordinates */}
            <g className="india-map" filter="url(#shadow)">
              {/* Main India landmass from coordinates */}
              <path
                d={(() => {
                  const svgWidth = 500;
                  const svgHeight = 550;
                  const offsetX = 50;
                  const offsetY = 50;
                  
                  return indiaCoordinates.map((coord, i) => {
                    const { x, y } = projectToSVG(coord[0], coord[1], svgWidth, svgHeight);
                    return `${i === 0 ? 'M' : 'L'} ${x + offsetX} ${y + offsetY}`;
                  }).join(' ') + ' Z';
                })()}
                fill="url(#indiaGradient2)"
                stroke="#FF9933"
                strokeWidth="5"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="animate-pulse-slow"
                filter="url(#glow)"
              />
              
              {/* Andaman & Nicobar Islands */}
              <ellipse cx="520" cy="450" rx="6" ry="30" 
                fill="url(#indiaGradient2)" 
                stroke="#FF9933" 
                strokeWidth="2"
                opacity="0.95"
                filter="url(#glow)" />
              
              {/* Lakshadweep */}
              <circle cx="70" cy="520" r="3" fill="url(#indiaGradient2)" stroke="#FF9933" strokeWidth="1.5" filter="url(#glow)" />
              <circle cx="65" cy="530" r="2.5" fill="url(#indiaGradient2)" stroke="#FF9933" strokeWidth="1.5" filter="url(#glow)" />
            </g>
            
            {/* Tricolor border highlight (animated) */}
            <g className="india-border">
              <path
                d={(() => {
                  const svgWidth = 500;
                  const svgHeight = 550;
                  const offsetX = 50;
                  const offsetY = 50;
                  
                  return indiaCoordinates.map((coord, i) => {
                    const { x, y } = projectToSVG(coord[0], coord[1], svgWidth, svgHeight);
                    return `${i === 0 ? 'M' : 'L'} ${x + offsetX} ${y + offsetY}`;
                  }).join(' ') + ' Z';
                })()}
                fill="none"
                stroke="#138808"
                strokeWidth="3"
                opacity="0.7"
                strokeDasharray="15,5"
                className="animate-dash"
              />
            </g>

            {/* Outer glow effect */}
            <path
              d={(() => {
                const svgWidth = 500;
                const svgHeight = 550;
                const offsetX = 50;
                const offsetY = 50;
                
                return indiaCoordinates.map((coord, i) => {
                  const { x, y } = projectToSVG(coord[0], coord[1], svgWidth, svgHeight);
                  return `${i === 0 ? 'M' : 'L'} ${x + offsetX} ${y + offsetY}`;
                }).join(' ') + ' Z';
              })()}
              fill="none"
              stroke="#FF9933"
              strokeWidth="10"
              opacity="0.2"
              className="animate-pulse"
            />

            {/* City Markers */}
            {indianCities.map((city, index) => {
              const svgWidth = 500;
              const svgHeight = 550;
              const offsetX = 50;
              const offsetY = 50;
              const { x, y } = projectToSVG(city.lng, city.lat, svgWidth, svgHeight);
              const finalX = x + offsetX;
              const finalY = y + offsetY;
              const isActive = index === activeCity;

              return (
                <g key={city.city}>
                  {/* Pulse Rings */}
                  {pulseRings.filter(p => p.cityIndex === index).map((pulse) => (
                    <circle
                      key={pulse.id}
                      cx={finalX}
                      cy={finalY}
                      r="10"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="3"
                      opacity="0"
                      className="animate-ping-once"
                    />
                  ))}

                  {/* City Glow */}
                  {isActive && (
                    <circle
                      cx={finalX}
                      cy={finalY}
                      r="15"
                      fill="#F59E0B"
                      opacity="0.4"
                      className="animate-pulse"
                    />
                  )}

                  {/* City Dot */}
                  <circle
                    cx={finalX}
                    cy={finalY}
                    r={isActive ? "9" : "6"}
                    fill={isActive ? "#F59E0B" : "#EF4444"}
                    stroke="white"
                    strokeWidth="2.5"
                    className={`transition-all duration-300 cursor-pointer ${isActive ? 'animate-bounce-slow' : ''}`}
                    onMouseEnter={() => setActiveCity(index)}
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                  >
                    <animate
                      attributeName="opacity"
                      values="1;0.7;1"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Connection Lines to nearby cities */}
                  {index < indianCities.length - 1 && (
                    (() => {
                      const nextCity = indianCities[(index + 1) % indianCities.length];
                      const { x: x2, y: y2 } = projectToSVG(nextCity.lng, nextCity.lat, svgWidth, svgHeight);
                      return (
                        <line
                          x1={finalX}
                          y1={finalY}
                          x2={x2 + offsetX}
                          y2={y2 + offsetY}
                          stroke="#6366F1"
                          strokeWidth="2"
                          opacity="0.3"
                          strokeDasharray="10,5"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="0"
                            to="15"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                        </line>
                      );
                    })()
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Floating City Cards */}
        <div className="absolute inset-0 pointer-events-none px-8">
          {indianCities.map((city, index) => {
            const isActive = index === activeCity;
            if (!isActive) return null;

            // Calculate position based on actual coordinates
            const svgWidth = 500;
            const svgHeight = 550;
            const containerWidth = 600;
            const containerHeight = 650;
            const { x, y } = projectToSVG(city.lng, city.lat, svgWidth, svgHeight);
            
            // Convert to percentage (accounting for SVG offset and container size)
            const leftPos = ((x + 50) / containerWidth) * 100;
            const topPos = ((y + 50) / containerHeight) * 100;

            return (
              <div
                key={`card-${city.city}`}
                className="absolute animate-fade-in pointer-events-auto z-30"
                style={{
                  left: `${leftPos}%`,
                  top: `${topPos}%`,
                  transform: 'translate(-50%, -130%)'
                }}
              >
                <div className="bg-white rounded-xl shadow-2xl px-5 py-3 min-w-[220px] border-3 border-orange-500 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg" />
                    <div className="text-sm font-bold text-gray-900">{city.city}, {city.state}</div>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ₹{city.sales.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">Live Sales Today 🔥</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        <div className="bg-gradient-to-r from-white via-orange-50 to-green-50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border-2 border-orange-300">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {indianCities.length}+
              </div>
              <div className="text-xs font-semibold text-gray-700 mt-2">Major Cities</div>
            </div>
            <div className="text-center border-l border-r border-orange-200">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ₹{indianCities.reduce((sum, city) => sum + city.sales, 0).toLocaleString()}
              </div>
              <div className="text-xs font-semibold text-gray-700 mt-2">Sales Today 💰</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {Math.floor(Math.random() * 50 + 150)}+
              </div>
              <div className="text-xs font-semibold text-gray-700 mt-2">Active Users 🔥</div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: Math.random() > 0.5 ? '#6366F1' : '#F59E0B',
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Region Labels */}
      <div className="absolute inset-0 pointer-events-none z-10 px-8">
        <div className="absolute text-sm font-bold text-orange-600 bg-white/70 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-md border border-orange-200" style={{ left: '40%', top: '20%' }}>
          North India 🏔️
        </div>
        <div className="absolute text-sm font-bold text-orange-600 bg-white/70 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-md border border-orange-200" style={{ left: '22%', top: '50%' }}>
          West 🌊
        </div>
        <div className="absolute text-sm font-bold text-orange-600 bg-white/70 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-md border border-orange-200" style={{ left: '62%', top: '48%' }}>
          East 🌾
        </div>
        <div className="absolute text-sm font-bold text-orange-600 bg-white/70 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-md border border-orange-200" style={{ left: '35%', top: '75%' }}>
          South India 🌴
        </div>
      </div>

      <style jsx>{`
        @keyframes ping-once {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-120px) translateX(${Math.random() * 50 - 25}px);
            opacity: 0;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -120%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -120%) scale(1);
          }
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: -30;
          }
        }
        
        .animate-ping-once {
          animation: ping-once 2s cubic-bezier(0, 0, 0.2, 1);
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-dash {
          animation: dash 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

