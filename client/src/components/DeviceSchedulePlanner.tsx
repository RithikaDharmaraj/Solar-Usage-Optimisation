import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { InfoIcon, AlertTriangle, CheckCircle2 } from "lucide-react";

// Types for devices and energy data
interface Device {
  id: string;
  name: string;
  consumption: number; // kWh per hour
  runTime: number; // total hours needed to run
  priority: string; // High, Medium, Low
  flexibility: string; // High, Medium, Low
  status?: string; // Active, Scheduled, Manual, Off
  optimalHours?: string;
  startTime?: number; // Hour of day (0-23)
  endTime?: number; // Hour of day (0-23)
}

interface HourlyEnergy {
  hour: number;
  production: number;
  totalConsumption: number;
  availableEnergy: number;
  devices: string[]; // IDs of devices running
}

interface DeviceSchedulePlannerProps {
  devices: Device[];
  onDevicesChange: (devices: Device[]) => void;
  hourlyProduction: { time: string; production: number; weather: string }[];
}

export default function DeviceSchedulePlanner({
  devices,
  onDevicesChange,
  hourlyProduction,
}: DeviceSchedulePlannerProps) {
  const [scheduledDevices, setScheduledDevices] = useState<Device[]>([]);
  const [hourlyEnergyData, setHourlyEnergyData] = useState<HourlyEnergy[]>([]);
  const [showConflicts, setShowConflicts] = useState(true);
  const [timeWindow, setTimeWindow] = useState<[number, number]>([6, 20]); // 6 AM to 8 PM
  const [currentView, setCurrentView] = useState<"schedule" | "timeline">("schedule");

  // Parse hour from time string (e.g., "10 AM" -> 10, "2 PM" -> 14)
  const parseHour = (timeStr: string): number => {
    const parts = timeStr.split(" ");
    const hour = parseInt(parts[0], 10);
    const isPM = parts[1] === "PM" && hour !== 12;
    const isAM = parts[1] === "AM" && hour === 12;
    
    if (isPM) return hour + 12;
    if (isAM) return 0;
    return hour;
  };

  // Convert hour number to display format (e.g., 14 -> "2 PM")
  const formatHour = (hour: number): string => {
    if (hour === 0 || hour === 24) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  // Normalize hourly production data to 24-hour format
  const normalizeHourlyData = () => {
    // Create 24-hour energy production array
    const hourlyEnergy: HourlyEnergy[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      production: 0,
      totalConsumption: 0,
      availableEnergy: 0,
      devices: [],
    }));

    // Fill in production values from hourly production data
    hourlyProduction.forEach((data) => {
      const hour = parseHour(data.time);
      if (hour >= 0 && hour < 24) {
        hourlyEnergy[hour].production = data.production;
        hourlyEnergy[hour].availableEnergy = data.production;
      }
    });

    return hourlyEnergy;
  };

  // Initialize hourly energy data
  useEffect(() => {
    const hourlyEnergy = normalizeHourlyData();
    setHourlyEnergyData(hourlyEnergy);
  }, [hourlyProduction]);

  // Automatically schedule devices when devices or hourlyEnergyData changes
  useEffect(() => {
    if (devices.length > 0 && hourlyEnergyData.length > 0) {
      scheduleDevices();
    }
  }, [devices, hourlyEnergyData]);

  // Schedule devices based on priority, flexibility, and available energy
  const scheduleDevices = () => {
    // Reset hourly energy data for new schedule
    const hourlyEnergy = normalizeHourlyData();
    
    // Sort devices by priority and flexibility
    const sortedDevices = [...devices].sort((a, b) => {
      // Sort by priority first (High > Medium > Low)
      const priorityOrder: { [key: string]: number } = { High: 0, Medium: 1, Low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      // Then sort by flexibility (Low > Medium > High)
      const flexibilityOrder: { [key: string]: number } = { Low: 0, Medium: 1, High: 2 };
      return flexibilityOrder[a.flexibility] - flexibilityOrder[b.flexibility];
    });
    
    // Schedule each device
    const scheduled: Device[] = [];
    
    sortedDevices.forEach((device) => {
      // Find optimal time window for device
      const optimalWindow = findOptimalTimeWindow(device, hourlyEnergy);
      
      if (optimalWindow) {
        const [startHour, endHour] = optimalWindow;
        
        // Update device with scheduled time
        const scheduledDevice: Device = {
          ...device,
          startTime: startHour,
          endTime: endHour,
          status: "Scheduled",
        };
        
        // Update hourly energy data
        for (let hour = startHour; hour < endHour; hour++) {
          hourlyEnergy[hour].totalConsumption += device.consumption;
          hourlyEnergy[hour].availableEnergy -= device.consumption;
          hourlyEnergy[hour].devices.push(device.id);
        }
        
        scheduled.push(scheduledDevice);
      } else {
        // Couldn't schedule the device
        scheduled.push({
          ...device,
          status: "Manual",
        });
      }
    });
    
    setScheduledDevices(scheduled);
    setHourlyEnergyData(hourlyEnergy);
    onDevicesChange(scheduled);
  };

  // Find the optimal time window for a device
  const findOptimalTimeWindow = (
    device: Device,
    hourlyEnergy: HourlyEnergy[]
  ): [number, number] | null => {
    const runtime = device.runTime;
    const consumption = device.consumption;
    
    // Only consider hours within the time window
    const [minHour, maxHour] = timeWindow;
    
    // For low flexibility devices, try to schedule during peak production
    if (device.flexibility === "Low") {
      // Find hours with highest production
      const sortedHours = [...hourlyEnergy]
        .filter((h) => h.hour >= minHour && h.hour < maxHour)
        .sort((a, b) => b.production - a.production);
      
      // Take the top 'runtime' hours
      const bestHours = sortedHours.slice(0, runtime);
      
      // Check if there's enough energy in each hour
      if (bestHours.every((h) => h.availableEnergy >= consumption)) {
        // Convert to sequential hours if possible
        const startHour = Math.min(...bestHours.map((h) => h.hour));
        return [startHour, startHour + runtime];
      }
    }
    
    // For medium and high flexibility devices, find consecutive hours
    for (let startHour = minHour; startHour <= maxHour - runtime; startHour++) {
      // Check if there's enough energy in each hour of this window
      let canSchedule = true;
      
      for (let hour = startHour; hour < startHour + runtime; hour++) {
        if (hourlyEnergy[hour].availableEnergy < consumption) {
          canSchedule = false;
          break;
        }
      }
      
      if (canSchedule) {
        return [startHour, startHour + runtime];
      }
    }
    
    // If we couldn't find an optimal window with solar energy, 
    // try to schedule during off-peak hours if device is highly flexible
    if (device.flexibility === "High") {
      return [Math.max(19, minHour), Math.max(19, minHour) + runtime];
    }
    
    // Couldn't schedule the device
    return null;
  };

  // Update device scheduling
  const updateDeviceSchedule = (deviceId: string, startHour: number, endHour: number) => {
    const updatedDevices = scheduledDevices.map((device) => {
      if (device.id === deviceId) {
        return {
          ...device,
          startTime: startHour,
          endTime: endHour,
          status: "Scheduled",
        };
      }
      return device;
    });
    
    setScheduledDevices(updatedDevices);
    onDevicesChange(updatedDevices);
    
    // Recalculate hourly energy data
    recalculateHourlyEnergy(updatedDevices);
  };

  // Recalculate hourly energy consumption based on scheduled devices
  const recalculateHourlyEnergy = (devices: Device[]) => {
    // Reset hourly energy data
    const hourlyEnergy = normalizeHourlyData();
    
    // Update with new device schedules
    devices.forEach((device) => {
      if (device.startTime !== undefined && device.endTime !== undefined) {
        for (let hour = device.startTime; hour < device.endTime; hour++) {
          if (hour >= 0 && hour < 24) {
            hourlyEnergy[hour].totalConsumption += device.consumption;
            hourlyEnergy[hour].availableEnergy -= device.consumption;
            hourlyEnergy[hour].devices.push(device.id);
          }
        }
      }
    });
    
    setHourlyEnergyData(hourlyEnergy);
  };

  // Toggle device scheduling status
  const toggleDeviceStatus = (deviceId: string) => {
    const updatedDevices = scheduledDevices.map((device) => {
      if (device.id === deviceId) {
        const newStatus = device.status === "Scheduled" ? "Manual" : "Scheduled";
        
        // If changing to Manual, remove the schedule
        if (newStatus === "Manual") {
          return {
            ...device,
            startTime: undefined,
            endTime: undefined,
            status: newStatus,
          };
        }
        
        // If changing to Scheduled, find a new schedule
        const deviceCopy = { ...device };
        const optimalWindow = findOptimalTimeWindow(deviceCopy, hourlyEnergyData);
        
        if (optimalWindow) {
          const [startHour, endHour] = optimalWindow;
          return {
            ...device,
            startTime: startHour,
            endTime: endHour,
            status: "Scheduled",
          };
        }
        
        // Couldn't schedule
        return {
          ...device,
          status: "Manual",
        };
      }
      return device;
    });
    
    setScheduledDevices(updatedDevices);
    onDevicesChange(updatedDevices);
    
    // Recalculate hourly energy data
    recalculateHourlyEnergy(updatedDevices);
  };

  // Calculate energy balance (production - consumption)
  const calculateEnergyBalance = () => {
    const totalProduction = hourlyEnergyData.reduce(
      (sum, hour) => sum + hour.production,
      0
    );
    
    const totalConsumption = hourlyEnergyData.reduce(
      (sum, hour) => sum + hour.totalConsumption,
      0
    );
    
    return {
      totalProduction,
      totalConsumption,
      balance: totalProduction - totalConsumption,
    };
  };

  // Format time range (e.g. "10 AM - 2 PM")
  const formatTimeRange = (startHour?: number, endHour?: number) => {
    if (startHour === undefined || endHour === undefined) {
      return "Not scheduled";
    }
    return `${formatHour(startHour)} - ${formatHour(endHour)}`;
  };

  // Check if there's an energy conflict during any hour
  const hasEnergyConflict = () => {
    return hourlyEnergyData.some((hour) => hour.availableEnergy < 0);
  };

  // Render the schedule view
  const renderScheduleView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Device</TableHead>
          <TableHead>Usage (kWh)</TableHead>
          <TableHead>Run Time</TableHead>
          <TableHead>Scheduled Time</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scheduledDevices.map((device) => (
          <TableRow key={device.id}>
            <TableCell className="font-medium">{device.name}</TableCell>
            <TableCell>{device.consumption} kWh/hr</TableCell>
            <TableCell>{device.runTime} hours</TableCell>
            <TableCell>
              {formatTimeRange(device.startTime, device.endTime)}
            </TableCell>
            <TableCell>
              <Badge
                className={
                  device.priority === "High"
                    ? "bg-red-500"
                    : device.priority === "Medium"
                    ? "bg-amber-500"
                    : "bg-green-500"
                }
              >
                {device.priority}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  device.status === "Scheduled"
                    ? "text-green-500 border-green-500"
                    : "text-amber-500 border-amber-500"
                }
              >
                {device.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end items-center gap-2">
                <Switch
                  checked={device.status === "Scheduled"}
                  onCheckedChange={() => toggleDeviceStatus(device.id)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={device.status !== "Scheduled"}
                  onClick={() => {
                    if (device.startTime && device.endTime) {
                      const adjustedStart = (device.startTime + 1) % 24;
                      const adjustedEnd = adjustedStart + device.runTime;
                      updateDeviceSchedule(device.id, adjustedStart, adjustedEnd);
                    }
                  }}
                >
                  Adjust
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // Render the timeline view
  const renderTimelineView = () => {
    const visibleHours = Array.from(
      { length: timeWindow[1] - timeWindow[0] },
      (_, i) => timeWindow[0] + i
    );

    return (
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <h3 className="text-sm font-medium">Energy Production vs Consumption</h3>
          </div>
          <div className="relative h-20 border rounded-lg overflow-hidden">
            {/* Production bars */}
            <div className="absolute top-0 left-0 w-full h-full flex">
              {visibleHours.map((hour, index) => {
                const hourData = hourlyEnergyData[hour];
                const productionHeight = hourData
                  ? `${Math.min((hourData.production / 5) * 100, 100)}%`
                  : "0%";
                
                return (
                  <div
                    key={`production-${hour}`}
                    className="flex-1 h-full flex flex-col-reverse"
                  >
                    <div
                      className="bg-green-500/30 border-t border-green-500"
                      style={{ height: productionHeight }}
                    ></div>
                  </div>
                );
              })}
            </div>
            
            {/* Consumption bars - overlay on top of production */}
            <div className="absolute top-0 left-0 w-full h-full flex">
              {visibleHours.map((hour, index) => {
                const hourData = hourlyEnergyData[hour];
                const consumptionHeight = hourData
                  ? `${Math.min((hourData.totalConsumption / 5) * 100, 100)}%`
                  : "0%";
                
                return (
                  <div
                    key={`consumption-${hour}`}
                    className="flex-1 h-full flex flex-col-reverse"
                  >
                    <div
                      className={`border-t ${
                        hourData && hourData.availableEnergy < 0
                          ? "bg-red-500/50 border-red-500"
                          : "bg-blue-500/50 border-blue-500"
                      }`}
                      style={{ height: consumptionHeight }}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Hour labels */}
          <div className="flex mt-1">
            {visibleHours.map((hour) => (
              <div key={`hour-${hour}`} className="flex-1 text-center">
                <span className="text-xs text-muted-foreground">
                  {formatHour(hour).replace(" ", "")}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500/30 border border-green-500"></div>
              <span className="text-xs text-muted-foreground">Production</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500/50 border border-blue-500"></div>
              <span className="text-xs text-muted-foreground">Consumption</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500/50 border border-red-500"></div>
              <span className="text-xs text-muted-foreground">Overload</span>
            </div>
          </div>
        </div>
        
        {/* Device timeline */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-secondary/20 p-2 flex">
            <div className="w-32 font-medium text-sm">Device</div>
            <div className="flex-1 relative">
              {visibleHours.map((hour) => (
                <div
                  key={`timeline-hour-${hour}`}
                  className="absolute top-0 bottom-0 border-l border-gray-200"
                  style={{
                    left: `${
                      ((hour - timeWindow[0]) / (timeWindow[1] - timeWindow[0])) * 100
                    }%`,
                  }}
                >
                  <span className="text-xs text-muted-foreground absolute -top-0 -left-2">
                    {hour}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {scheduledDevices.map((device) => (
            <div key={`timeline-${device.id}`} className="p-2 flex border-t">
              <div className="w-32 text-sm font-medium truncate">{device.name}</div>
              <div className="flex-1 relative h-6">
                {device.startTime !== undefined && device.endTime !== undefined && (
                  <div
                    className={`absolute h-full rounded-full ${
                      device.status === "Scheduled"
                        ? "bg-primary/70"
                        : "bg-gray-300"
                    }`}
                    style={{
                      left: `${
                        ((Math.max(device.startTime, timeWindow[0]) - timeWindow[0]) /
                          (timeWindow[1] - timeWindow[0])) *
                        100
                      }%`,
                      width: `${
                        ((Math.min(device.endTime, timeWindow[1]) -
                          Math.max(device.startTime, timeWindow[0])) /
                          (timeWindow[1] - timeWindow[0])) *
                        100
                      }%`,
                    }}
                  >
                    <span className="text-xs absolute inset-0 flex items-center justify-center text-white font-medium">
                      {device.consumption} kWh
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const { totalProduction, totalConsumption, balance } = calculateEnergyBalance();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>Advanced Device Scheduling</span>
          <div className="flex items-center gap-2">
            <Button
              variant={currentView === "schedule" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentView("schedule")}
            >
              Schedule
            </Button>
            <Button
              variant={currentView === "timeline" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentView("timeline")}
            >
              Timeline
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Optimize device usage based on solar energy availability
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Energy summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium text-muted-foreground">
              Solar Production
            </div>
            <div className="text-2xl font-bold text-green-600">
              {totalProduction.toFixed(2)} kWh
            </div>
          </div>
          
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium text-muted-foreground">
              Device Consumption
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {totalConsumption.toFixed(2)} kWh
            </div>
          </div>
          
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium text-muted-foreground">
              Energy Balance
            </div>
            <div
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {balance.toFixed(2)} kWh
            </div>
          </div>
        </div>
        
        {/* Scheduling time window */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Scheduling Time Window</h3>
            <span className="text-sm text-muted-foreground">
              {formatHour(timeWindow[0])} - {formatHour(timeWindow[1])}
            </span>
          </div>
          
          <Slider
            value={[timeWindow[0], timeWindow[1]]}
            min={0}
            max={24}
            step={1}
            onValueChange={(value) => setTimeWindow([value[0], value[1]])}
            className="mt-2"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>12 AM</span>
          </div>
        </div>
        
        {/* Conflicts warning */}
        {hasEnergyConflict() && showConflicts && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Scheduling Conflicts</h4>
              <p className="text-sm text-amber-700 mt-1">
                Some hours have more devices scheduled than available solar energy.
                Consider rescheduling devices or extending your time window.
              </p>
            </div>
          </div>
        )}
        
        {/* Schedule content */}
        <div className="mt-6">
          {currentView === "schedule" ? renderScheduleView() : renderTimelineView()}
        </div>
      </CardContent>
      
      <CardFooter className="justify-between border-t pt-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="show-conflicts"
            checked={showConflicts}
            onCheckedChange={setShowConflicts}
          />
          <Label htmlFor="show-conflicts">Show scheduling conflicts</Label>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={scheduleDevices}>
            Recalculate Schedule
          </Button>
          <Button>Apply Schedule</Button>
        </div>
      </CardFooter>
    </Card>
  );
}