import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  BarChart, 
  Zap, 
  Battery, 
  LightbulbIcon, 
  Refrigerator,
  Tv,
  Airplay,
  WashingMachine,
  Fan,
  Info,
  Settings,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import SolarProductionChart from "@/components/SolarProductionChart";
import DeviceOptimizationTable from "@/components/DeviceOptimizationTable";
import WeatherForecast from "@/components/WeatherForecast";
import ApplianceManagement from "@/components/ApplianceManagement";
import SolarPredictionExplainer from "@/components/SolarPredictionExplainer";
import LocationSettings from "@/components/LocationSettings";
import DeviceSchedulePlanner from "@/components/DeviceSchedulePlanner";
import { Helmet } from "react-helmet";

export default function SolarProduction() {
  const [selectedTab, setSelectedTab] = useState("forecast");
  const [electricityRate, setElectricityRate] = useState(7.0); // Default rate in Indian Rupees
  const [appliances, setAppliances] = useState<any[]>([
    { id: "1", name: "Air Conditioner", consumption: 1.5, runTime: 6, priority: "High", flexibility: "Medium", optimalHours: "10:00 AM - 4:00 PM", status: "Scheduled" },
    { id: "2", name: "Washing Machine", consumption: 1.2, runTime: 2, priority: "Medium", flexibility: "High", optimalHours: "11:00 AM - 1:00 PM", status: "Scheduled" },
    { id: "3", name: "Fan", consumption: 0.1, runTime: 10, priority: "Medium", flexibility: "Low", optimalHours: "All Day", status: "Scheduled" },
  ]);
  type RoofDirection = "North" | "Northeast" | "East" | "Southeast" | "South" | "Southwest" | "West" | "Northwest";
  
  interface LocationData {
    id: string;
    city: string;
    state: string;
    latitude: string;
    longitude: string;
    roofAngle: number;
    roofDirection: RoofDirection;
    solarCapacity: number;
    panelEfficiency: number;
    weatherApiKey: string;
  }
  
  const [location, setLocation] = useState<LocationData>({
    id: "default",
    city: "Mumbai",
    state: "Maharashtra",
    latitude: "19.0760", 
    longitude: "72.8777",
    roofAngle: 20,
    roofDirection: "South",
    solarCapacity: 5,
    panelEfficiency: 18,
    weatherApiKey: "",
  });
  
  // Fetch solar production data from API with location parameters
  const { data: solarData, isLoading, refetch } = useQuery({ 
    queryKey: ['/api/solar/production', location],
    queryFn: async () => {
      const params = new URLSearchParams({
        latitude: location.latitude,
        longitude: location.longitude,
        roofAngle: location.roofAngle.toString(),
        roofDirection: location.roofDirection,
        solarCapacity: location.solarCapacity.toString(),
        panelEfficiency: location.panelEfficiency.toString()
      });
      
      const response = await fetch(`/api/solar/production?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch solar production data');
      }
      return response.json();
    },
    retry: false,
  });
  
  // Refetch data when location changes
  useEffect(() => {
    refetch();
  }, [location, refetch]);

  // Use data from API if available, otherwise use defaults
  const currentEnergy = solarData?.currentGeneration || 4.2; // kWh
  const predictedEnergy = solarData?.dailyPrediction || 26.8; // kWh
  const batteryLevel = solarData?.batteryStatus?.percentage || 72; // percentage
  const optimalTime = solarData?.optimalUsagePeriod || "10:00 AM - 2:00 PM";
  
  // Convert appliances to the format expected by DeviceOptimizationTable
  const consumptionByDevice = appliances.map(appliance => ({
    device: appliance.name,
    consumption: appliance.consumption * appliance.runTime, // Total consumption (kWh * hours)
    optimalHours: appliance.optimalHours || optimalTime,
    priority: appliance.priority,
    status: appliance.status || "Pending"
  }));
  
  // Calculate savings potential in Indian Rupees
  const dailyConsumption = appliances.reduce(
    (total, appliance) => total + appliance.consumption * appliance.runTime,
    0
  );
  
  const savingsPercentage = 0.32; // 32% savings from optimization
  const savingsAmount = dailyConsumption * savingsPercentage; // kWh saved
  const costSavings = savingsAmount * electricityRate; // Rupees saved
  
  useEffect(() => {
    // Update the device status and optimal hours based on solar prediction
    if (solarData) {
      const updatedAppliances = appliances.map(appliance => {
        // Determine optimal hours based on solar production and device flexibility
        let optimalHours = optimalTime;
        
        // High flexibility devices can run during peak production
        if (appliance.flexibility === "High") {
          optimalHours = optimalTime;
        } 
        // Medium flexibility devices can run slightly offset from peak
        else if (appliance.flexibility === "Medium") {
          // Adjust based on priority
          if (appliance.priority === "High") {
            optimalHours = optimalTime;
          } else {
            optimalHours = "9:00 AM - 1:00 PM";
          }
        } 
        // Low flexibility devices run according to user needs
        else {
          optimalHours = "User Defined";
        }
        
        return {
          ...appliance,
          optimalHours,
          status: appliance.flexibility !== "Low" ? "Scheduled" : "Manual"
        };
      });
      
      setAppliances(updatedAppliances);
    }
  }, [solarData, optimalTime]);

  const getWeatherIcon = (condition: string) => {
    switch(condition) {
      case "sunny": return <Sun className="h-8 w-8 text-yellow-500" />;
      case "cloudy": return <Cloud className="h-8 w-8 text-gray-500" />;
      case "rainy": return <CloudRain className="h-8 w-8 text-blue-500" />;
      default: return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Solar Production Forecasting | SecuritySentinel</title>
        <meta name="description" content="Optimize your energy usage with our solar production forecasting and device scheduling system. Maximize solar energy utilization and reduce costs." />
      </Helmet>
      
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Solar Production Forecasting</h1>
            <p className="text-muted-foreground">Optimize your energy usage based on solar production predictions</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Current Generation</CardTitle>
              <CardDescription>Live solar output</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sun className="h-10 w-10 text-yellow-500 mr-4" />
                  <div>
                    <p className="text-3xl font-bold">{currentEnergy} kWh</p>
                    <p className="text-sm text-muted-foreground">Current output</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Today's Prediction</CardTitle>
              <CardDescription>Machine learning forecast</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart className="h-10 w-10 text-primary mr-4" />
                  <div>
                    <p className="text-3xl font-bold">{predictedEnergy} kWh</p>
                    <p className="text-sm text-muted-foreground">Expected total generation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Cost Savings</CardTitle>
              <CardDescription>Optimization potential</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Zap className="h-10 w-10 text-green-500 mr-4" />
                  <div>
                    <p className="text-3xl font-bold">₹{costSavings.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Daily savings (<span className="font-medium">{savingsAmount.toFixed(2)} kWh</span>)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-5">
            <TabsTrigger value="forecast">Solar Forecast</TabsTrigger>
            <TabsTrigger value="optimization">Device Optimization</TabsTrigger>
            <TabsTrigger value="scheduler">Schedule Planner</TabsTrigger>
            <TabsTrigger value="appliances">Manage Appliances</TabsTrigger>
            <TabsTrigger value="location">Location Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="forecast" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Solar Production Forecast</CardTitle>
                <CardDescription>
                  Hourly prediction based on weather forecast and historical data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SolarProductionChart />
                
                <div className="mt-6">
                  <Alert className="bg-primary/10 border-primary/20">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Optimal Energy Usage Time</AlertTitle>
                    <AlertDescription>
                      The best time to run high-consumption appliances today is between {optimalTime}
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            
            {/* Weather analysis card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Weather Impact Analysis</CardTitle>
                <CardDescription>
                  See how weather conditions affect your solar production
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeatherForecast />
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Weather-Based Recommendations</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center mb-2">
                        <Sun className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="font-medium">Clear Weather Period (10 AM - 2 PM)</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Schedule high-power appliances like washing machines and dishwashers during this period.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center mb-2">
                        <Cloud className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="font-medium">Cloudy Period (After 3 PM)</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reduce energy consumption during this period. Consider using battery storage if available.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="optimization" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Smart Device Optimization</CardTitle>
                <CardDescription>
                  Schedule your devices to run during peak solar production times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeviceOptimizationTable devices={consumptionByDevice} />
                
                <div className="mt-6 space-y-4">
                  <Alert className="bg-green-50 border-green-100">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>Energy Saving Potential</AlertTitle>
                    <AlertDescription>
                      Following this schedule could save approximately ₹{costSavings.toFixed(2)} on your energy costs today.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <Button className="flex-1">Apply Recommended Schedule</Button>
                    <Button variant="outline" className="flex-1" onClick={() => setSelectedTab("appliances")}>
                      <Settings className="h-4 w-4 mr-2" />
                      Customize Appliances
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Energy Optimization Tips</CardTitle>
                <CardDescription>Maximize your solar energy utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <LightbulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      Smart Lighting
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Use natural light during the day and schedule smart lights to dim during peak solar production.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <Refrigerator className="h-5 w-5 text-blue-500 mr-2" />
                      Cooling Devices
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Pre-cool your refrigerator and freezer during peak solar hours to reduce energy use later.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <WashingMachine className="h-5 w-5 text-indigo-500 mr-2" />
                      Laundry Management
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Schedule washing machines and dryers to run during midday when solar production is highest.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <Tv className="h-5 w-5 text-gray-500 mr-2" />
                      Entertainment Devices
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Charge laptops and mobile devices during solar peak hours and unplug when not in use.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appliances" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Appliance Management</CardTitle>
                <CardDescription>
                  Add and manage your home appliances for energy optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApplianceManagement 
                  appliances={appliances}
                  onAppliancesChange={setAppliances}
                  electricityRate={electricityRate}
                  onElectricityRateChange={setElectricityRate}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scheduler" className="mt-4">
            <DeviceSchedulePlanner
              devices={appliances}
              onDevicesChange={setAppliances}
              hourlyProduction={solarData?.hourlyData || []}
            />
          </TabsContent>
          
          <TabsContent value="location" className="mt-4">
            <LocationSettings 
              location={location}
              onLocationChange={(newLocation) => setLocation(newLocation)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}