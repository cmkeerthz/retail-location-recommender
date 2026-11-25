import { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SearchPanelProps {
  onSearch: (location: string, lat: number, lon: number, radius: number) => void;
  isSearching: boolean;
}

const PRESET_LOCATIONS = [
  { name: 'Connaught Place, Delhi', lat: 28.6315, lon: 77.2167 },
  { name: 'Indiranagar, Bangalore', lat: 12.9716, lon: 77.6412 },
  { name: 'Bandra, Mumbai', lat: 19.0596, lon: 72.8295 },
  { name: 'Park Street, Kolkata', lat: 22.5545, lon: 88.3515 },
  { name: 'T Nagar, Chennai', lat: 13.0418, lon: 80.2341 },
];

export function SearchPanel({ onSearch, isSearching }: SearchPanelProps) {
  const [locationInput, setLocationInput] = useState('');
  const [radius, setRadius] = useState([5]);

  const handleSearch = () => {
    if (!locationInput.trim()) return;

    // Try to match with preset locations
    const preset = PRESET_LOCATIONS.find(loc => 
      loc.name.toLowerCase().includes(locationInput.toLowerCase()) ||
      locationInput.toLowerCase().includes(loc.name.toLowerCase().split(',')[0])
    );

    if (preset) {
      onSearch(preset.name, preset.lat, preset.lon, radius[0]);
    } else {
      // Use first preset as fallback with user's location name
      onSearch(locationInput, PRESET_LOCATIONS[0].lat, PRESET_LOCATIONS[0].lon, radius[0]);
    }
  };

  const handlePresetClick = (preset: typeof PRESET_LOCATIONS[0]) => {
    setLocationInput(preset.name);
    onSearch(preset.name, preset.lat, preset.lon, radius[0]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Location Search
        </CardTitle>
        <CardDescription>
          Find optimal retail locations in your target area
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Input */}
        <div className="space-y-2">
          <Label htmlFor="location">Location Name</Label>
          <div className="flex gap-2">
            <Input
              id="location"
              placeholder="Enter city or area name..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !locationInput.trim()}
              className="min-w-[100px]"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search Radius */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Search Radius</Label>
            <span className="text-sm font-medium text-primary">
              {radius[0]} km
            </span>
          </div>
          <Slider
            value={radius}
            onValueChange={setRadius}
            min={1}
            max={20}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 km</span>
            <span>20 km</span>
          </div>
        </div>

        {/* Preset Locations */}
        <div className="space-y-2">
          <Label>Quick Search</Label>
          <div className="grid grid-cols-1 gap-2">
            {PRESET_LOCATIONS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset)}
                disabled={isSearching}
                className="justify-start text-left h-auto py-2"
              >
                <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                <span className="truncate">{preset.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
