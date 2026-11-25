// Auto-generated from your database schema — do not edit by hand.
// Regenerates automatically whenever a table is created or altered.

export type RetailLocationsRow = {
  id: string
  name: string
  latitude: number | string
  longitude: number | string
  rentPerSqft: number | string
  populationDensity: number | string
  averageIncome: number | string
  competitionIndex: number | string
  numBusinesses: number | string
  footTrafficScore: number | string
  safetyScore: number | string
  parkingAvailability: string
  recommendedCategories: string
  suitabilityScore: number | string
  city: string
  address: string
  createdAt: string | null
  updatedAt: string | null
}

export type UserSearchesRow = {
  id: string
  userId: string | null
  locationName: string
  latitude: number | string
  longitude: number | string
  radiusKm: number | string
  resultsCount: number | string
  searchTimestamp: string | null
}
