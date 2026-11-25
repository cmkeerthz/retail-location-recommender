import { useState, useEffect } from 'react';
import { createClient } from '@blinkdotnew/sdk';
import { LocationMap } from '@/components/LocationMap';
import { SearchPanel } from '@/components/SearchPanel';
import { ResultsPanel } from '@/components/ResultsPanel';
import { RetailLocation, SearchParams } from '@/types/location';
import { filterLocationsByRadius } from '@/lib/calculations';
import { MapPin, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const blink = createClient({
  projectId: 'retail-location-recommender-esnu6uhw',
  authRequired: false
});

function App() {
  const [allLocations, setAllLocations] = useState<RetailLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<RetailLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<RetailLocation | undefined>();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    locationName: 'Connaught Place, Delhi',
    latitude: 28.6315,
    longitude: 77.2167,
    radiusKm: 5
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load all locations on mount
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const locations = await blink.db.retailLocations.list<RetailLocation>({
        limit: 100
      });
      
      setAllLocations(locations);
      
      // Initial search with default params
      const filtered = filterLocationsByRadius(
        locations,
        searchParams.latitude,
        searchParams.longitude,
        searchParams.radiusKm
      );
      setFilteredLocations(filtered);
      
      toast.success(`Loaded ${locations.length} retail locations`);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (location: string, lat: number, lon: number, radius: number) => {
    setIsSearching(true);
    setIsMobileMenuOpen(false);
    
    try {
      const newParams: SearchParams = {
        locationName: location,
        latitude: lat,
        longitude: lon,
        radiusKm: radius
      };
      
      setSearchParams(newParams);
      
      const filtered = filterLocationsByRadius(
        allLocations,
        lat,
        lon,
        radius
      );
      
      setFilteredLocations(filtered);
      setSelectedLocation(filtered[0]);
      
      // Save search to database
      await blink.db.userSearches.create({
        id: `search_${Date.now()}`,
        locationName: location,
        latitude: lat,
        longitude: lon,
        radiusKm: radius,
        resultsCount: filtered.length
      });
      
      toast.success(`Found ${filtered.length} locations within ${radius} km`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (location: RetailLocation) => {
    setSelectedLocation(location);
    setIsMobileMenuOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <MapPin className="w-16 h-16 mx-auto text-primary animate-pulse" />
          <p className="text-lg font-medium">Loading retail locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Retail Location Recommender</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  AI-Powered Store Site Selection Platform
                </p>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Desktop Sidebar - Search Panel */}
          <aside className="hidden lg:block w-80 border-r bg-card overflow-y-auto">
            <div className="p-4">
              <SearchPanel 
                onSearch={handleSearch}
                isSearching={isSearching}
              />
            </div>
          </aside>

          {/* Mobile Sidebar - Overlay */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
              <div className="fixed inset-y-0 left-0 w-80 bg-card shadow-lg overflow-y-auto">
                <div className="p-4">
                  <SearchPanel 
                    onSearch={handleSearch}
                    isSearching={isSearching}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Map Section */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Map View */}
            <div className="flex-1 p-4">
              <LocationMap
                locations={filteredLocations}
                center={[searchParams.latitude, searchParams.longitude]}
                radius={searchParams.radiusKm}
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
              />
            </div>

            {/* Results Panel */}
            <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-card overflow-hidden">
              <div className="h-full p-4">
                <ResultsPanel
                  locations={filteredLocations}
                  selectedLocation={selectedLocation}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
