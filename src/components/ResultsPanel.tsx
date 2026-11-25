import { RetailLocation } from '@/types/location';
import { LocationCard } from './LocationCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, TrendingUp, MapPin, DollarSign, Users } from 'lucide-react';
import { exportToCSV } from '@/lib/calculations';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResultsPanelProps {
  locations: RetailLocation[];
  selectedLocation?: RetailLocation;
  onLocationSelect: (location: RetailLocation) => void;
}

export function ResultsPanel({ 
  locations, 
  selectedLocation, 
  onLocationSelect 
}: ResultsPanelProps) {
  if (locations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>No locations found. Try searching an area.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const stats = {
    avgScore: Math.round(
      locations.reduce((sum, loc) => sum + loc.suitabilityScore, 0) / locations.length
    ),
    avgRent: Math.round(
      locations.reduce((sum, loc) => sum + loc.rentPerSqft, 0) / locations.length
    ),
    avgTraffic: (
      locations.reduce((sum, loc) => sum + loc.footTrafficScore, 0) / locations.length
    ).toFixed(1),
    topCategory: getTopCategory(locations)
  };

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>{locations.length} locations found</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportToCSV(locations)}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Score</p>
                <p className="text-lg font-bold">{stats.avgScore}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Rent</p>
                <p className="text-lg font-bold">₹{stats.avgRent}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Traffic</p>
                <p className="text-lg font-bold">{stats.avgTraffic}/10</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Top Category</p>
                <p className="text-sm font-bold truncate">{stats.topCategory}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Locations</CardTitle>
          <CardDescription>Sorted by suitability score</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-28rem)] px-6 pb-6">
            <div className="space-y-3">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onClick={() => onLocationSelect(location)}
                  isSelected={selectedLocation?.id === location.id}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function getTopCategory(locations: RetailLocation[]): string {
  const categoryCount: Record<string, number> = {};
  
  locations.forEach(loc => {
    const categories = loc.recommendedCategories.split(',');
    categories.forEach(cat => {
      const trimmed = cat.trim();
      categoryCount[trimmed] = (categoryCount[trimmed] || 0) + 1;
    });
  });
  
  const topCategory = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])[0];
  
  return topCategory ? topCategory[0] : 'N/A';
}
