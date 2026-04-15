import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TourFilterPanelProps {
  onFiltersChange: (filters: {
    countryIds: number[];
    stateIds: number[];
    cityIds: number[];
  }) => void;
}

export function TourFilterPanel({ onFiltersChange }: TourFilterPanelProps) {
  const [selectedCountries, setSelectedCountries] = useState<number[]>([]);
  const [selectedStates, setSelectedStates] = useState<number[]>([]);
  const [selectedCities, setSelectedCities] = useState<number[]>([]);

  // Fetch countries
  const { data: countries = [] } = trpc.tours.getCountries.useQuery();

  // Fetch states for selected countries
  const { data: availableStates = [] } = trpc.tours.getStatesByCountry.useQuery(
    { countryId: selectedCountries[0] || 0 },
    { enabled: selectedCountries.length > 0 }
  );

  // Fetch cities for selected state
  const { data: availableCities = [] } = trpc.tours.getCitiesByState.useQuery(
    { stateId: selectedStates[0] || 0 },
    { enabled: selectedStates.length > 0 }
  );

  // Get country name for display
  const getCountryName = (id: number) => {
    return countries.find((c) => c.id === id)?.name || "";
  };

  // Get state name for display
  const getStateName = (id: number) => {
    return availableStates.find((s) => s.id === id)?.name || "";
  };

  // Get city name for display
  const getCityName = (id: number) => {
    return availableCities.find((c) => c.id === id)?.name || "";
  };

  // Handle country selection
  const handleCountryChange = (countryId: string) => {
    const id = parseInt(countryId);
    if (selectedCountries.includes(id)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== id));
    } else {
      setSelectedCountries([...selectedCountries, id]);
    }
    // Reset states and cities when country changes
    setSelectedStates([]);
    setSelectedCities([]);
  };

  // Handle state selection
  const handleStateChange = (stateId: string) => {
    const id = parseInt(stateId);
    if (selectedStates.includes(id)) {
      setSelectedStates(selectedStates.filter((s) => s !== id));
    } else {
      setSelectedStates([...selectedStates, id]);
    }
    // Reset cities when state changes
    setSelectedCities([]);
  };

  // Handle city selection
  const handleCityChange = (cityId: string) => {
    const id = parseInt(cityId);
    if (selectedCities.includes(id)) {
      setSelectedCities(selectedCities.filter((c) => c !== id));
    } else {
      setSelectedCities([...selectedCities, id]);
    }
  };

  // Remove country filter
  const removeCountry = (id: number) => {
    setSelectedCountries(selectedCountries.filter((c) => c !== id));
    setSelectedStates([]);
    setSelectedCities([]);
  };

  // Remove state filter
  const removeState = (id: number) => {
    setSelectedStates(selectedStates.filter((s) => s !== id));
    setSelectedCities([]);
  };

  // Remove city filter
  const removeCity = (id: number) => {
    setSelectedCities(selectedCities.filter((c) => c !== id));
  };

  // Apply filters
  const handleApplyFilters = () => {
    onFiltersChange({
      countryIds: selectedCountries,
      stateIds: selectedStates,
      cityIds: selectedCities,
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCountries([]);
    setSelectedStates([]);
    setSelectedCities([]);
    onFiltersChange({
      countryIds: [],
      stateIds: [],
      cityIds: [],
    });
  };

  return (
    <div className="w-full bg-card border border-border rounded-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Filter Tours by Location</h3>

        {/* Country Selection */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium">Countries</label>
          <Select value="" onValueChange={handleCountryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a country..." />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id.toString()}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Countries */}
        {selectedCountries.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCountries.map((countryId) => (
              <Badge
                key={countryId}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {getCountryName(countryId)}
                <button
                  onClick={() => removeCountry(countryId)}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* State Selection */}
        {selectedCountries.length > 0 && (
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium">States/Provinces</label>
            <Select value="" onValueChange={handleStateChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a state..." />
              </SelectTrigger>
              <SelectContent>
                {availableStates.map((state) => (
                  <SelectItem key={state.id} value={state.id.toString()}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selected States */}
        {selectedStates.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedStates.map((stateId) => (
              <Badge
                key={stateId}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {getStateName(stateId)}
                <button
                  onClick={() => removeState(stateId)}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* City Selection */}
        {selectedStates.length > 0 && (
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium">Cities</label>
            <Select value="" onValueChange={handleCityChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a city..." />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selected Cities */}
        {selectedCities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCities.map((cityId) => (
              <Badge
                key={cityId}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {getCityName(cityId)}
                <button
                  onClick={() => removeCity(cityId)}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={handleClearFilters}
          disabled={
            selectedCountries.length === 0 &&
            selectedStates.length === 0 &&
            selectedCities.length === 0
          }
        >
          Clear Filters
        </Button>
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  );
}
