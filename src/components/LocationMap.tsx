import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RetailLocation } from '@/types/location';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMapProps {
  locations: RetailLocation[];
  center: [number, number];
  radius: number;
  onLocationSelect: (location: RetailLocation) => void;
  selectedLocation?: RetailLocation;
}

export function LocationMap({
  locations,
  center,
  radius,
  onLocationSelect,
  selectedLocation
}: LocationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current).setView(center, 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Clear existing circle
    if (circleRef.current) {
      circleRef.current.remove();
    }

    // Update map center
    mapRef.current.setView(center, 12);

    // Draw search radius circle
    const circle = L.circle(center, {
      radius: radius * 1000, // Convert km to meters
      color: 'hsl(173, 80%, 40%)',
      fillColor: 'hsl(173, 80%, 50%)',
      fillOpacity: 0.1,
      weight: 2,
    }).addTo(mapRef.current);
    circleRef.current = circle;

    // Add markers for locations
    locations.forEach((location) => {
      const isSelected = selectedLocation?.id === location.id;
      
      // Color code based on suitability score
      let markerColor = '#10b981'; // green
      if (location.suitabilityScore < 70) markerColor = '#f59e0b'; // orange
      if (location.suitabilityScore < 50) markerColor = '#ef4444'; // red

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${isSelected ? '#0d9488' : markerColor};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: 14px;
            ">${Math.round(location.suitabilityScore)}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([location.latitude, location.longitude], {
        icon: customIcon
      })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${location.name}</h3>
            <p style="margin-bottom: 4px;"><strong>Score:</strong> ${location.suitabilityScore}/100</p>
            <p style="margin-bottom: 4px;"><strong>Rent:</strong> ₹${location.rentPerSqft}/sqft</p>
            <p style="margin-bottom: 4px;"><strong>Foot Traffic:</strong> ${location.footTrafficScore}/10</p>
            <p style="margin-bottom: 4px;"><strong>Categories:</strong> ${location.recommendedCategories}</p>
            ${location.distance ? `<p style="margin-bottom: 4px;"><strong>Distance:</strong> ${location.distance} km</p>` : ''}
          </div>
        `)
        .on('click', () => {
          onLocationSelect(location);
        });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.latitude, loc.longitude] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, center, radius, selectedLocation, onLocationSelect]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-lg overflow-hidden border border-border"
      style={{ minHeight: '500px' }}
    />
  );
}
