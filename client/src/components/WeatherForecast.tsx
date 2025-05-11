import { Card, CardContent } from "@/components/ui/card";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from "lucide-react";

export default function WeatherForecast() {
  // This would come from a weather API in a real implementation
  const weatherData = [
    { time: "8 AM", condition: "sunny", temperature: 65, solarImpact: "High", production: 1.5 },
    { time: "10 AM", condition: "sunny", temperature: 70, solarImpact: "Excellent", production: 3.2 },
    { time: "12 PM", condition: "sunny", temperature: 75, solarImpact: "Excellent", production: 4.2 },
    { time: "2 PM", condition: "sunny", temperature: 77, solarImpact: "High", production: 3.5 },
    { time: "4 PM", condition: "cloudy", temperature: 73, solarImpact: "Moderate", production: 1.9 },
    { time: "6 PM", condition: "cloudy", temperature: 68, solarImpact: "Low", production: 0.6 },
  ];

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case "cloudy":
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case "rainy":
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case "snowy":
        return <CloudSnow className="h-8 w-8 text-blue-200" />;
      case "stormy":
        return <CloudLightning className="h-8 w-8 text-purple-500" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Excellent":
        return "text-green-600";
      case "High":
        return "text-green-500";
      case "Moderate":
        return "text-yellow-500";
      case "Low":
        return "text-orange-500";
      case "Poor":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {weatherData.map((item, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium mb-2">{item.time}</p>
              {getWeatherIcon(item.condition)}
              <p className="text-lg font-semibold mt-2">{item.temperature}°F</p>
              <div className="mt-2 text-center">
                <p className="text-xs text-muted-foreground">Solar Impact</p>
                <p className={`text-sm font-medium ${getImpactColor(item.solarImpact)}`}>
                  {item.solarImpact}
                </p>
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs text-muted-foreground">Production</p>
                <p className="text-sm font-medium">{item.production} kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}