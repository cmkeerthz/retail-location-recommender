import { RetailLocation } from '@/types/location';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  DollarSign, 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  Shield,
  Car,
  Navigation
} from 'lucide-react';

interface LocationCardProps {
  location: RetailLocation;
  onClick?: () => void;
  isSelected?: boolean;
}

export function LocationCard({ location, onClick, isSelected }: LocationCardProps) {
  const categories = location.recommendedCategories.split(',');
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{location.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {location.city} • {location.address}
            </CardDescription>
          </div>
          <div className={`flex flex-col items-center px-3 py-2 rounded-lg border-2 ${getScoreBg(location.suitabilityScore)}`}>
            <span className={`text-2xl font-bold ${getScoreColor(location.suitabilityScore)}`}>
              {location.suitabilityScore}
            </span>
            <span className="text-xs text-muted-foreground">Score</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Rent/sqft</p>
              <p className="text-sm font-semibold">₹{location.rentPerSqft}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Foot Traffic</p>
              <p className="text-sm font-semibold">{location.footTrafficScore}/10</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Income</p>
              <p className="text-sm font-semibold">₹{(location.averageIncome / 1000).toFixed(0)}k</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Competition</p>
              <p className="text-sm font-semibold">{(location.competitionIndex * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Safety</span>
            </div>
            <span className="font-medium">{location.safetyScore}/10</span>
          </div>
          <Progress value={location.safetyScore * 10} className="h-1.5" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Parking</span>
          </div>
          <Badge variant={
            location.parkingAvailability === 'High' ? 'default' :
            location.parkingAvailability === 'Medium' ? 'secondary' : 'outline'
          }>
            {location.parkingAvailability}
          </Badge>
        </div>

        {location.distance && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Distance</span>
            </div>
            <span className="font-medium">{location.distance} km</span>
          </div>
        )}

        {/* Recommended Categories */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Recommended Categories</p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category.trim()}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
