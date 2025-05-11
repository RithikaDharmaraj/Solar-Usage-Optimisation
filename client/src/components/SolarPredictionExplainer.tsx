import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Sun, 
  CloudSun, 
  Brain, 
  AreaChart, 
  RadioTower, 
  Compass, 
  CalendarClock 
} from "lucide-react";

export default function SolarPredictionExplainer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Solar Prediction Methods</CardTitle>
        <CardDescription>
          Understanding how our system predicts solar energy production
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="methods">Prediction Methods</TabsTrigger>
            <TabsTrigger value="factors">Influencing Factors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="flex items-start gap-4">
              <Sun className="h-10 w-10 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-lg">How We Predict Solar Production</h3>
                <p className="text-muted-foreground mt-1">
                  Our system uses a combination of machine learning algorithms and weather data to
                  provide accurate predictions of solar energy production. We process multiple data
                  points to determine the optimal times for running your appliances.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">Machine Learning Models</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our system combines multiple prediction models including ARIMA, Prophet, and
                  Random Forest algorithms to ensure high accuracy in diverse conditions.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AreaChart className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">Historical Analysis</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  We analyze your historical solar production data to identify patterns and
                  improve prediction accuracy specific to your location and setup.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CloudSun className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">Weather Integration</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Real-time and forecast weather data are integrated to adjust predictions
                  based on cloud cover, temperature, and other meteorological factors.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">Adaptive Learning</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our system continuously learns from prediction errors, improving accuracy
                  over time as it adapts to your specific conditions.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="methods" className="mt-4 space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">ARIMA (Autoregressive Integrated Moving Average)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                ARIMA models use time series analysis to capture temporal patterns in solar
                production data. This statistical approach identifies trends, seasonality, and
                autocorrelation in historical data to make short-term predictions.
              </p>
              <div className="text-sm">
                <span className="font-medium">Key Strengths:</span>
                <ul className="list-disc ml-5 mt-1 text-muted-foreground">
                  <li>Effective for capturing daily and weekly patterns</li>
                  <li>Works well with consistent weather conditions</li>
                  <li>Computationally efficient for real-time adjustments</li>
                </ul>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Prophet Model</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Prophet is designed to handle time series data with strong seasonal effects and
                historical trends. It's particularly effective at modeling solar production,
                which follows daily and yearly seasonal patterns.
              </p>
              <div className="text-sm">
                <span className="font-medium">Key Strengths:</span>
                <ul className="list-disc ml-5 mt-1 text-muted-foreground">
                  <li>Handles missing data and outliers robustly</li>
                  <li>Excellent at capturing seasonal variations</li>
                  <li>Automatically detects changepoints in trends</li>
                </ul>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Random Forest Regression</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                This ensemble machine learning approach uses multiple decision trees to capture
                non-linear relationships between weather variables and solar output. It excels
                at incorporating multiple predictive features.
              </p>
              <div className="text-sm">
                <span className="font-medium">Key Strengths:</span>
                <ul className="list-disc ml-5 mt-1 text-muted-foreground">
                  <li>Handles complex interactions between variables</li>
                  <li>Less sensitive to outliers than single models</li>
                  <li>Can incorporate both numerical and categorical features</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="factors" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CloudSun className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium">Weather Variables</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground mt-2">
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Cloud Cover:</span> 
                    <span>Reduces production by blocking direct sunlight</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Temperature:</span> 
                    <span>Affects panel efficiency (higher temps can reduce output)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Humidity:</span> 
                    <span>Impacts light scattering and absorption</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Precipitation:</span> 
                    <span>Reduces energy production during rainy periods</span>
                  </li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-indigo-500" />
                  <h4 className="font-medium">Solar Position Factors</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground mt-2">
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Solar Angle:</span> 
                    <span>Changes throughout day affecting intensity</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Day Length:</span> 
                    <span>Varies by season affecting total production</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Azimuth:</span> 
                    <span>Direction relative to sun impacts generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Shading:</span> 
                    <span>Location-specific obstacles affecting production</span>
                  </li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium">Temporal Factors</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground mt-2">
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Time of Day:</span> 
                    <span>Peak production typically occurs at midday</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Season:</span> 
                    <span>Summer months generally have higher production</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Historical:</span> 
                    <span>Past patterns help predict future generation</span>
                  </li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <RadioTower className="h-5 w-5 text-red-500" />
                  <h4 className="font-medium">System Factors</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground mt-2">
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Panel Type:</span> 
                    <span>Different types have varying efficiency levels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Orientation:</span> 
                    <span>Roof angle and direction affect production</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Age:</span> 
                    <span>Panel efficiency decreases over time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 font-medium">Maintenance:</span> 
                    <span>Dust and dirt can reduce production</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}