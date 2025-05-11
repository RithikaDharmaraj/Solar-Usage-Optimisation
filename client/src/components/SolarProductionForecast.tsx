import { useState, useEffect } from "react";
import { Sun, BatteryFull, Zap, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ApplianceUsage {
  name: string;
  powerConsumption: number; // in watts
  recommendedTime: string;
  priority: 'high' | 'medium' | 'low';
}

interface DailyForecast {
  date: string;
  production: number; // kWh
  peakHours: string[];
  weather: string;
}

export default function SolarProductionForecast() {
  const [selectedDay, setSelectedDay] = useState<string>("today");
  
  // Sample forecast data (in a real app, this would come from an API)
  const forecastData: Record<string, DailyForecast> = {
    today: {
      date: new Date().toLocaleDateString(),
      production: 24.5,
      peakHours: ["10:00 AM - 2:00 PM"],
      weather: "Sunny"
    },
    tomorrow: {
      date: new Date(Date.now() + 86400000).toLocaleDateString(),
      production: 22.8,
      peakHours: ["11:00 AM - 3:00 PM"],
      weather: "Partly Cloudy"
    },
    day3: {
      date: new Date(Date.now() + 2 * 86400000).toLocaleDateString(),
      production: 18.2,
      peakHours: ["12:00 PM - 2:00 PM"],
      weather: "Cloudy"
    }
  };
  
  // Sample appliance recommendations (in a real app, this would be calculated based on the forecast)
  const applianceRecommendations: ApplianceUsage[] = [
    {
      name: "Electric Vehicle Charging",
      powerConsumption: 7500,
      recommendedTime: "10:00 AM - 2:00 PM",
      priority: "high"
    },
    {
      name: "Washing Machine",
      powerConsumption: 1200,
      recommendedTime: "11:00 AM - 3:00 PM",
      priority: "medium"
    },
    {
      name: "Dishwasher",
      powerConsumption: 1500,
      recommendedTime: "12:00 PM - 3:00 PM",
      priority: "medium"
    },
    {
      name: "Air Conditioner",
      powerConsumption: 3500,
      recommendedTime: "Use during peak production hours",
      priority: "high"
    },
    {
      name: "Water Heater",
      powerConsumption: 4000,
      recommendedTime: "10:00 AM - 1:00 PM",
      priority: "medium"
    },
    {
      name: "Pool Pump",
      powerConsumption: 1100,
      recommendedTime: "10:00 AM - 4:00 PM",
      priority: "low"
    }
  ];
  
  // Calculate battery storage based on production (simplified calculation)
  const calculateBatteryStorage = (production: number) => {
    // Assume 40% of daily production goes to battery
    return production * 0.4;
  };
  
  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-green-500">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-blue-500">Medium Priority</Badge>;
      case "low":
        return <Badge className="bg-gray-500">Low Priority</Badge>;
      default:
        return null;
    }
  };
  
  const selectedForecast = forecastData[selectedDay];
  const batteryStorage = calculateBatteryStorage(selectedForecast.production);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Solar Production & Energy Optimization</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Sun className="mr-2 h-5 w-5 text-yellow-500" />
              Production Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today" onValueChange={setSelectedDay}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                <TabsTrigger value="day3">Day 3</TabsTrigger>
              </TabsList>
              <TabsContent value="today" className="pt-4">
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{forecastData.today.production} kWh</p>
                  <p className="text-sm text-muted-foreground">Weather: {forecastData.today.weather}</p>
                  <p className="text-sm">Peak Hours: {forecastData.today.peakHours.join(", ")}</p>
                </div>
              </TabsContent>
              <TabsContent value="tomorrow" className="pt-4">
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{forecastData.tomorrow.production} kWh</p>
                  <p className="text-sm text-muted-foreground">Weather: {forecastData.tomorrow.weather}</p>
                  <p className="text-sm">Peak Hours: {forecastData.tomorrow.peakHours.join(", ")}</p>
                </div>
              </TabsContent>
              <TabsContent value="day3" className="pt-4">
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{forecastData.day3.production} kWh</p>
                  <p className="text-sm text-muted-foreground">Weather: {forecastData.day3.weather}</p>
                  <p className="text-sm">Peak Hours: {forecastData.day3.peakHours.join(", ")}</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <BatteryFull className="mr-2 h-5 w-5 text-green-500" />
              Battery Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-3xl font-bold">{batteryStorage.toFixed(1)} kWh</p>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Charge Level</span>
                  <span>80%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-200 rounded-full">
                  <div className="h-2.5 bg-green-500 rounded-full" style={{ width: "80%" }}></div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Estimated backup time: ~8 hours
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-500" />
              Energy Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium mb-1">Daily Generation</p>
                <p className="text-2xl font-bold">{selectedForecast.production} kWh</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Estimated Consumption</p>
                <p className="text-2xl font-bold">18.2 kWh</p>
              </div>
              <div className="pt-2">
                <p className="text-sm font-medium text-green-500">
                  {selectedForecast.production > 18.2 
                    ? `${(selectedForecast.production - 18.2).toFixed(1)} kWh surplus` 
                    : `${(18.2 - selectedForecast.production).toFixed(1)} kWh deficit`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Recommended Appliance Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applianceRecommendations.map((appliance, index) => (
              <div key={index} className="flex items-start border p-4 rounded-lg">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{appliance.name}</h4>
                    {getPriorityBadge(appliance.priority)}
                  </div>
                  <p className="text-sm text-muted-foreground">{appliance.powerConsumption} watts</p>
                  <p className="text-sm font-medium">Best Time: {appliance.recommendedTime}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-medium mb-2">Energy Optimization Tips</h4>
            <ul className="text-sm space-y-1">
              <li>• Run high-consumption appliances during peak solar production hours</li>
              <li>• Consider setting your EV to charge when solar production is highest</li>
              <li>• Use smart plugs to automatically schedule appliances based on solar production</li>
              <li>• Pre-cool your home during peak production to reduce evening energy use</li>
              <li>• Schedule battery charging during production peaks and discharge during high-rate periods</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}