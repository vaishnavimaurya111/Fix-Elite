import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Phone, MessageSquare, Clock, CheckCircle2, ChevronUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";
import { Badge } from "../components/ui/badge";

// --- Math & Geo Utils ---

// Haversine formula to calculate distance in km
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate quadratic Bezier curve waypoints
function generateBezierRoute(start: [number, number], end: [number, number], numPoints = 10) {
  // Control point is offset perpendicular to the midpoint to create an organic curve
  const midX = (start[0] + end[0]) / 2;
  const midY = (start[1] + end[1]) / 2;
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  
  // Randomize offset direction
  const offsetScale = 0.3;
  const cx = midX - dy * offsetScale;
  const cy = midY + dx * offsetScale;

  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const invT = 1 - t;
    const x = invT * invT * start[0] + 2 * invT * t * cx + t * t * end[0];
    const y = invT * invT * start[1] + 2 * invT * t * cy + t * t * end[1];
    points.push([x, y]);
  }
  return points;
}

// Calculate total distance of a route path
function getRouteLength(route: [number, number][]) {
  let len = 0;
  for (let i = 0; i < route.length - 1; i++) {
    len += getDistanceInKm(route[i][0], route[i][1], route[i+1][0], route[i+1][1]);
  }
  return len;
}

// --- Tracking Component ---

export default function Tracking() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { currentBooking, selectedWorker } = useApp();
  
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const [workerProgress, setWorkerProgress] = useState(0);
  const [status, setStatus] = useState<"on-way" | "nearby" | "arrived" | "in-progress">("on-way");
  const [distanceRemaining, setDistanceRemaining] = useState<number>(0);
  const [etaMins, setEtaMins] = useState<number>(0);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Leaflet dynamically
  useEffect(() => {
    if (!currentBooking || !selectedWorker) {
      navigate("/");
      return;
    }

    const leafletCss = document.createElement("link");
    leafletCss.rel = "stylesheet";
    leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    
    const leafletJs = document.createElement("script");
    leafletJs.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    leafletJs.async = true;

    leafletJs.onload = () => setMapLoaded(true);

    document.head.appendChild(leafletCss);
    document.head.appendChild(leafletJs);

    return () => {
      document.head.removeChild(leafletCss);
      document.head.removeChild(leafletJs);
    };
  }, [currentBooking, selectedWorker, navigate]);

  // Init Map & Animation
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;

    // 1. Geolocate User
    navigator.geolocation.getCurrentPosition(
      (pos) => setupMap(L, pos.coords.latitude, pos.coords.longitude),
      (err) => {
        console.warn("Geolocation denied/failed. Using fallback.", err);
        setupMap(L, 19.0760, 72.8777); // Fallback: Mumbai
      }
    );

    let animationFrameId: number;

    function setupMap(L: any, userLat: number, userLng: number) {
      if (mapRef.current) {
        mapRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([userLat, userLng], 14);
      mapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      // Create Markers
      const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10">
            <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
            <div class="relative w-8 h-8 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg z-10 text-sm">
              🏠
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const plumberIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center w-12 h-12 transition-transform duration-100 ease-linear" id="plumber-marker-icon">
            <div class="absolute inset-2 bg-orange-500 rounded-full blur-md opacity-50"></div>
            <div class="relative w-10 h-10 bg-orange-500 border-[3px] border-white rounded-full flex items-center justify-center shadow-xl z-10 text-lg">
              🪠
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
      
      // Generate plumber start position (~2km away)
      const offsetLat = (Math.random() - 0.5) * 0.03;
      const offsetLng = (Math.random() - 0.5) * 0.03;
      const plumberStart: [number, number] = [userLat + offsetLat, userLng + offsetLng];
      
      const plumberMarker = L.marker(plumberStart, { icon: plumberIcon }).addTo(map);

      // Generate Route
      const routePoints = generateBezierRoute(plumberStart, [userLat, userLng], 15);
      const totalRouteLength = getRouteLength(routePoints);
      
      // Draw Planned Route (dashed)
      L.polyline(routePoints, {
        color: '#93c5fd', // blue-300
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.8
      }).addTo(map);

      // Traveled Path (solid)
      const traveledLine = L.polyline([routePoints[0]], {
        color: '#2563eb', // blue-600
        weight: 5,
        opacity: 0.9,
        lineCap: 'round'
      }).addTo(map);

      // Fit bounds to show entire route
      map.fitBounds(L.polyline(routePoints).getBounds(), { padding: [50, 50] });

      // Animation variables
      const DURATION = 45000; // 45 seconds total
      let startTime: number | null = null;
      let currentStatus = "on-way";

      function animate(timestamp: number) {
        if (!startTime) startTime = timestamp;
        let progress = (timestamp - startTime) / DURATION;
        if (progress > 1) progress = 1;

        setWorkerProgress(progress * 100);

        // Find position along route
        const currentRouteLen = progress * totalRouteLength;
        let accumLen = 0;
        let currentPos = routePoints[0];
        let traveledPoints = [routePoints[0]];

        for (let i = 0; i < routePoints.length - 1; i++) {
          const segLen = getDistanceInKm(
            routePoints[i][0], routePoints[i][1], 
            routePoints[i+1][0], routePoints[i+1][1]
          );
          if (accumLen + segLen >= currentRouteLen) {
            const segProgress = (currentRouteLen - accumLen) / segLen;
            currentPos = [
              routePoints[i][0] + (routePoints[i+1][0] - routePoints[i][0]) * segProgress,
              routePoints[i][1] + (routePoints[i+1][1] - routePoints[i][1]) * segProgress
            ];
            traveledPoints.push(currentPos);
            
            // Calculate heading for rotation
            const dy = routePoints[i+1][0] - routePoints[i][0];
            const dx = routePoints[i+1][1] - routePoints[i][1];
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            const iconEl = document.getElementById('plumber-marker-icon');
            if (iconEl) {
               iconEl.style.transform = `rotate(${angle}deg)`;
            }
            break;
          }
          accumLen += segLen;
          traveledPoints.push(routePoints[i+1]);
        }

        // Update map elements
        plumberMarker.setLatLng(currentPos);
        traveledLine.setLatLngs(traveledPoints);

        // Update HUD
        const remainingDist = Math.max(0, totalRouteLength - currentRouteLen);
        setDistanceRemaining(remainingDist);
        setEtaMins(Math.ceil(remainingDist * 7)); // ~7 mins per km city driving

        // Update Status
        if (progress >= 1 && currentStatus !== "arrived") {
          currentStatus = "arrived";
          setStatus("arrived");
          setTimeout(() => {
            setStatus("in-progress");
            setTimeout(() => navigate(`/invoice/${bookingId}`), 3000);
          }, 3000);
        } else if (progress >= 0.75 && progress < 1 && currentStatus !== "nearby") {
          currentStatus = "nearby";
          setStatus("nearby");
        }

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapLoaded, navigate, bookingId]);

  if (!currentBooking || !selectedWorker) return null;

  const statusConfig = {
    "on-way": { text: "On the way", color: "bg-orange-500 text-white", ring: "ring-orange-500/30" },
    "nearby": { text: "Almost there", color: "bg-purple-500 text-white", ring: "ring-purple-500/30" },
    "arrived": { text: "Arrived", color: "bg-green-600 text-white", ring: "ring-green-600/30" },
    "in-progress": { text: "Work Started", color: "bg-pink-600 text-white", ring: "ring-pink-600/30" },
  };

  return (
    <div className="fixed inset-0 bg-zinc-50 dark:bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-0 inset-x-0 z-[1000] p-4 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg rounded-2xl p-3 flex gap-4 border border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex flex-col items-center px-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">{etaMins}</span>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">min</span>
          </div>
          <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex flex-col items-center px-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">{distanceRemaining.toFixed(1)}</span>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">km</span>
          </div>
        </div>

        <div className="pointer-events-auto flex gap-2">
          <ThemeToggle />
          <Badge className="bg-green-500 text-white hover:bg-green-600 shadow-lg px-3 py-1 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            LIVE
          </Badge>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-zinc-200 dark:bg-zinc-800" ref={mapContainerRef} />

      {/* Status Progress Indicator (Absolute positioned above bottom panel) */}
      <div className="absolute bottom-[280px] sm:bottom-[300px] left-0 right-0 z-[1000] px-4 transition-all duration-300 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="flex justify-center"
          >
            <Badge className={`${statusConfig[status].color} shadow-lg shadow-black/10 px-4 py-1.5 text-sm font-medium border-2 border-white dark:border-zinc-900 pointer-events-auto ring-4 ${statusConfig[status].ring}`}>
              {statusConfig[status].text}
            </Badge>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gradient Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 z-[1001] bg-zinc-200 dark:bg-zinc-800">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-orange-500 transition-all duration-100 ease-linear"
          style={{ width: `${workerProgress}%` }}
        />
      </div>

      {/* Collapsible Worker Panel */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-[1000] bg-white dark:bg-zinc-950 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)] border-t border-zinc-200 dark:border-zinc-800"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div 
          className="w-full flex justify-center pt-3 pb-1 cursor-pointer"
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
        >
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

        <div className="px-6 pb-6 pt-2">
          {/* Worker Header */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-orange-500 shadow-md">
                <AvatarImage src={selectedWorker.avatar} />
                <AvatarFallback>{selectedWorker.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                {selectedWorker.name}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                {currentBooking.service} • ⭐ {selectedWorker.rating}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button size="icon" variant="outline" className="rounded-full shadow-sm w-12 h-12 border-zinc-200 dark:border-zinc-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20">
                <MessageSquare className="w-5 h-5" />
              </Button>
              <Button size="icon" className="rounded-full shadow-md w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white">
                <Phone className="w-5 h-5 fill-current" />
              </Button>
            </div>
          </div>

          {/* Expandable Content */}
          <AnimatePresence>
            {isPanelExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-zinc-100 dark:border-zinc-800 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 mb-1">Completed</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">124 Jobs</p>
                  </div>
                  <div className="text-center border-x border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">Vehicle</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">MH 02 AB 1234</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 mb-1">Total</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{currentBooking.estimate.estimatedCost}</p>
                  </div>
                </div>

                {/* Vertical Timeline */}
                <div className="space-y-4 px-2">
                  {[
                    { id: 'confirmed', label: "Booking Confirmed", active: workerProgress >= 0 },
                    { id: 'assigned', label: "Worker Assigned", active: workerProgress >= 0 },
                    { id: 'on-way', label: "On the Way", active: workerProgress > 0 },
                    { id: 'nearby', label: "Almost There", active: workerProgress >= 75 },
                    { id: 'arrived', label: "Arrived", active: workerProgress >= 100 },
                  ].map((step, i, arr) => {
                    const isCurrent = (
                      (step.id === 'on-way' && status === 'on-way') ||
                      (step.id === 'nearby' && status === 'nearby') ||
                      (step.id === 'arrived' && status === 'arrived') ||
                      (step.id === 'assigned' && workerProgress === 0)
                    );
                    const isPast = step.active && !isCurrent;

                    return (
                      <div key={step.id} className="relative flex items-center gap-4">
                        {/* Connecting Line */}
                        {i < arr.length - 1 && (
                          <div className={`absolute left-3 top-6 w-0.5 h-6 ${
                            step.active && arr[i+1].active ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'
                          }`} />
                        )}
                        
                        {/* Node */}
                        <div className="relative z-10 w-6 h-6 flex items-center justify-center shrink-0">
                          {isPast ? (
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          ) : isCurrent ? (
                            <div className="relative flex items-center justify-center w-6 h-6">
                              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30" />
                              <div className="w-3 h-3 bg-blue-600 rounded-full ring-4 ring-blue-100 dark:ring-blue-900/30" />
                            </div>
                          ) : (
                            <div className="w-3 h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                          )}
                        </div>

                        {/* Label */}
                        <div className="flex-1 flex justify-between items-center">
                          <span className={`text-sm ${
                            isCurrent ? "font-bold text-blue-600 dark:text-blue-400" :
                            isPast ? "font-medium text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600"
                          }`}>
                            {step.label}
                          </span>
                          {isCurrent && (
                            <Badge variant="outline" className="text-[10px] uppercase text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
