import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Sun, Cloud } from "lucide-react";

export default function SolarProductionChart() {
  // This data would come from the machine learning prediction model
  // as described in the IEEE paper, using ARIMA, Prophet, or Random Forest
  const productionData = [
    { time: "6 AM", production: 0.2, prediction: 0.3, weather: "sunny" },
    { time: "7 AM", production: 0.8, prediction: 0.9, weather: "sunny" },
    { time: "8 AM", production: 1.5, prediction: 1.6, weather: "sunny" },
    { time: "9 AM", production: 2.4, prediction: 2.5, weather: "sunny" },
    { time: "10 AM", production: 3.2, prediction: 3.5, weather: "sunny" },
    { time: "11 AM", production: 3.8, prediction: 4.0, weather: "sunny" },
    { time: "12 PM", production: 4.2, prediction: 4.3, weather: "sunny" },
    { time: "1 PM", production: 4.0, prediction: 4.2, weather: "sunny" },
    { time: "2 PM", production: 3.5, prediction: 3.8, weather: "sunny" },
    { time: "3 PM", production: 2.8, prediction: 3.0, weather: "cloudy" },
    { time: "4 PM", production: 1.9, prediction: 2.2, weather: "cloudy" },
    { time: "5 PM", production: 1.2, prediction: 1.5, weather: "cloudy" },
    { time: "6 PM", production: 0.6, prediction: 0.8, weather: "cloudy" },
    { time: "7 PM", production: 0.2, prediction: 0.3, weather: "cloudy" },
    { time: "8 PM", production: 0, prediction: 0, weather: "cloudy" },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="p-2 bg-background/95 shadow-md border">
          <div className="flex items-center space-x-2">
            {data.weather === "sunny" ? (
              <Sun className="h-4 w-4 text-yellow-500" />
            ) : (
              <Cloud className="h-4 w-4 text-gray-500" />
            )}
            <span className="font-medium">{label}</span>
          </div>
          <div className="text-sm mt-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current:</span>
              <span className="font-medium">{data.production} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Predicted:</span>
              <span className="font-medium">{data.prediction} kWh</span>
            </div>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={productionData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="time" />
          <YAxis
            label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <defs>
            <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="production"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorProduction)"
            name="Actual Production"
          />
          <Area
            type="monotone"
            dataKey="prediction"
            stroke="#82ca9d"
            fillOpacity={1}
            fill="url(#colorPrediction)"
            name="Predicted Production"
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}