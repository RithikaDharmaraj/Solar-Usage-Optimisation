import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { MapPin, RotateCw, Building, ThermometerSun, Compass } from "lucide-react";

// Location form schema
const locationSchema = z.object({
  city: z.string().min(2, "City name must be at least 2 characters"),
  state: z.string().min(2, "State name must be at least 2 characters"),
  latitude: z.string().regex(/^-?([0-8]?[0-9]|90)(\.[0-9]{1,6})?$/, "Invalid latitude format (must be between -90 and 90)"),
  longitude: z.string().regex(/^-?((1[0-7][0-9])|([0-9]?[0-9]))(\.[0-9]{1,6})?$/, "Invalid longitude format (must be between -180 and 180)"),
  roofAngle: z.number().min(0).max(90),
  roofDirection: z.enum(["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"]),
  solarCapacity: z.number().min(0.5).max(100),
  panelEfficiency: z.number().min(10).max(30),
  weatherApiKey: z.string(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface Location extends LocationFormValues {
  id: string;
}

interface LocationSettingsProps {
  location: Location;
  onLocationChange: (location: Location) => void;
  onWeatherApiKeyChange?: (key: string) => void;
}

export default function LocationSettings({
  location,
  onLocationChange,
  onWeatherApiKeyChange,
}: LocationSettingsProps) {
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  // Initialize form with current location values
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      city: location.city,
      state: location.state,
      latitude: location.latitude,
      longitude: location.longitude,
      roofAngle: location.roofAngle,
      roofDirection: location.roofDirection,
      solarCapacity: location.solarCapacity,
      panelEfficiency: location.panelEfficiency,
      weatherApiKey: location.weatherApiKey,
    },
  });

  // Handle form submission
  const handleSubmit = (values: LocationFormValues) => {
    const updatedLocation: Location = {
      ...values,
      id: location.id,
      weatherApiKey: values.weatherApiKey || "", // Ensure weatherApiKey is never undefined
    };
    
    onLocationChange(updatedLocation);
    
    if (onWeatherApiKeyChange && values.weatherApiKey) {
      onWeatherApiKeyChange(values.weatherApiKey);
    }
    
    toast({
      title: "Location settings updated",
      description: "Your solar production forecasts will now be updated based on your location.",
    });
  };

  // Auto-detect location using browser geolocation
  const autoDetectLocation = () => {
    setIsAutoDetecting(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation. Please enter coordinates manually.",
        variant: "destructive",
      });
      setIsAutoDetecting(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update form values
        form.setValue("latitude", latitude.toFixed(6));
        form.setValue("longitude", longitude.toFixed(6));
        
        // Attempt reverse geocoding to get city and state (simplified example)
        // In a real app, you would use a geocoding service like Google Maps, Mapbox, etc.
        fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${form.getValues("weatherApiKey")}`)
          .then(response => {
            if (!response.ok) {
              throw new Error("Weather API key required for reverse geocoding");
            }
            return response.json();
          })
          .then(data => {
            if (data && data[0]) {
              form.setValue("city", data[0].name || "");
              form.setValue("state", data[0].state || "");
            }
            setIsAutoDetecting(false);
            
            toast({
              title: "Location detected",
              description: `Coordinates updated to ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            });
          })
          .catch(error => {
            console.error("Error in reverse geocoding:", error);
            setIsAutoDetecting(false);
            
            toast({
              title: "Coordinates detected",
              description: `Location set to ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Enter city and state manually.`,
            });
          });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsAutoDetecting(false);
        
        toast({
          title: "Location detection failed",
          description: "Please enter your location manually or try again.",
          variant: "destructive",
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Calculate optimal roof angle based on latitude
  const calculateOptimalAngle = () => {
    const latitude = parseFloat(form.getValues("latitude"));
    if (isNaN(latitude)) return;
    
    // Simplified formula: optimal angle ≈ latitude * 0.76 + 3.1
    // More precise calculations would consider seasonal variations
    const optimalAngle = Math.abs(latitude) * 0.76 + 3.1;
    form.setValue("roofAngle", Math.round(optimalAngle));
    
    toast({
      title: "Optimal angle calculated",
      description: `Based on your latitude, the optimal roof angle is approximately ${Math.round(optimalAngle)}°`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Settings
        </CardTitle>
        <CardDescription>
          Configure your location details for accurate solar production forecasts
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Location Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Mumbai" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Maharashtra" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input placeholder="19.0760" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input placeholder="72.8777" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={autoDetectLocation}
                    disabled={isAutoDetecting}
                    className="w-full"
                  >
                    {isAutoDetecting ? (
                      <>
                        <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Auto-Detect My Location
                      </>
                    )}
                  </Button>
                  
                  <FormField
                    control={form.control}
                    name="weatherApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weather API Key (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your API key for weather data"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Used for accurate weather-based solar predictions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Solar Panel Configuration</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="roofDirection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Compass className="h-4 w-4" />
                            Roof Direction
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select direction" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="North">North</SelectItem>
                              <SelectItem value="Northeast">Northeast</SelectItem>
                              <SelectItem value="East">East</SelectItem>
                              <SelectItem value="Southeast">Southeast</SelectItem>
                              <SelectItem value="South">South</SelectItem>
                              <SelectItem value="Southwest">Southwest</SelectItem>
                              <SelectItem value="West">West</SelectItem>
                              <SelectItem value="Northwest">Northwest</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Direction your roof/panels face
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="roofAngle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <ThermometerSun className="h-4 w-4" />
                            Roof Angle (Tilt)
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <Slider
                                min={0}
                                max={90}
                                step={1}
                                value={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                              />
                              <div className="flex justify-between items-center">
                                <span className="text-sm">{field.value}°</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={calculateOptimalAngle}
                                  className="h-8"
                                >
                                  Calculate Optimal
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Angle of your roof or solar panel installation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Solar System Details</h3>
                  
                  <FormField
                    control={form.control}
                    name="solarCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          System Capacity
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <Slider
                              min={0.5}
                              max={30}
                              step={0.5}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                            <div className="flex justify-between">
                              <span className="text-sm">0.5 kW</span>
                              <span className="text-sm font-medium">{field.value} kW</span>
                              <span className="text-sm">30 kW</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Total capacity of your solar panel system in kilowatts
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="panelEfficiency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Panel Efficiency</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <Slider
                              min={10}
                              max={30}
                              step={0.5}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                            <div className="flex justify-between">
                              <span className="text-sm">10%</span>
                              <span className="text-sm font-medium">{field.value}%</span>
                              <span className="text-sm">30%</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Efficiency rating of your solar panels
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-6 flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                form.reset({
                  city: location.city,
                  state: location.state,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  roofAngle: location.roofAngle,
                  roofDirection: location.roofDirection,
                  solarCapacity: location.solarCapacity,
                  panelEfficiency: location.panelEfficiency,
                  weatherApiKey: location.weatherApiKey,
                });
              }}
            >
              Reset
            </Button>
            <Button type="submit">
              Save Location Settings
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}