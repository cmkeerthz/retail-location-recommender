export interface RetailLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rentPerSqft: number;
  populationDensity: number;
  averageIncome: number;
  competitionIndex: number;
  numBusinesses: number;
  footTrafficScore: number;
  safetyScore: number;
  parkingAvailability: string;
  recommendedCategories: string;
  suitabilityScore: number;
  city: string;
  address: string;
  distance?: number;
}

export interface SearchParams {
  locationName: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export interface LocationStats {
  totalLocations: number;
  avgSuitabilityScore: number;
  avgRent: number;
  avgFootTraffic: number;
  topCategory: string;
}
