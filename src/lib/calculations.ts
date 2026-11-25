import { RetailLocation } from '@/types/location';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimals
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate retail suitability score based on multiple factors
 * Score range: 0-100 (higher is better)
 */
export function calculateSuitabilityScore(
  footTraffic: number,
  averageIncome: number,
  populationDensity: number,
  competitionIndex: number,
  rentPerSqft: number,
  safetyScore: number
): number {
  // Normalize factors to 0-10 scale
  const normalizedFootTraffic = footTraffic; // Already 0-10
  const normalizedIncome = Math.min((averageIncome / 10000), 10);
  const normalizedDensity = Math.min((populationDensity / 5000), 10);
  const normalizedSafety = safetyScore; // Already 0-10
  
  // Competition and rent are negative factors
  const competitionPenalty = competitionIndex * 10; // 0-10
  const rentPenalty = Math.min((rentPerSqft / 50), 10); // 0-10
  
  // Weighted calculation
  const positiveScore = 
    (normalizedFootTraffic * 0.30) +
    (normalizedIncome * 0.25) +
    (normalizedDensity * 0.15) +
    (normalizedSafety * 0.10);
  
  const negativeScore = 
    (competitionPenalty * 0.15) +
    (rentPenalty * 0.05);
  
  const finalScore = (positiveScore - negativeScore) * 10;
  
  return Math.max(0, Math.min(100, Math.round(finalScore)));
}

/**
 * Filter locations within a given radius
 */
export function filterLocationsByRadius(
  locations: RetailLocation[],
  centerLat: number,
  centerLon: number,
  radiusKm: number
): RetailLocation[] {
  return locations
    .map(location => ({
      ...location,
      distance: calculateDistance(
        centerLat,
        centerLon,
        location.latitude,
        location.longitude
      )
    }))
    .filter(location => location.distance! <= radiusKm)
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

/**
 * Export locations data to CSV format
 */
export function exportToCSV(locations: RetailLocation[]): void {
  const headers = [
    'Name',
    'City',
    'Address',
    'Suitability Score',
    'Rent/sqft',
    'Foot Traffic',
    'Competition Index',
    'Avg Income',
    'Safety Score',
    'Recommended Categories',
    'Distance (km)'
  ];
  
  const rows = locations.map(loc => [
    loc.name,
    loc.city,
    loc.address,
    loc.suitabilityScore,
    loc.rentPerSqft,
    loc.footTrafficScore,
    loc.competitionIndex,
    loc.averageIncome,
    loc.safetyScore,
    loc.recommendedCategories,
    loc.distance || 0
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `retail-locations-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}
