import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface Device {
  device: string;
  consumption: number;
  optimalHours: string;
  priority: string;
  status: string;
}

interface DeviceOptimizationTableProps {
  devices: Device[];
}

export default function DeviceOptimizationTable({ devices }: DeviceOptimizationTableProps) {
  const [enabledDevices, setEnabledDevices] = useState<{ [key: string]: boolean }>(
    Object.fromEntries(devices.map(device => [device.device, device.status === "Scheduled"]))
  );

  const handleToggle = (deviceName: string) => {
    setEnabledDevices(prev => ({
      ...prev,
      [deviceName]: !prev[deviceName]
    }));
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-500 hover:bg-red-600">{priority}</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{priority}</Badge>;
      case "Low":
        return <Badge className="bg-green-500 hover:bg-green-600">{priority}</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <Table>
      <TableCaption>Smart scheduling based on solar production forecast</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Device</TableHead>
          <TableHead>Energy Consumption (kWh)</TableHead>
          <TableHead>Optimal Hours</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead className="text-right">Schedule</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {devices.map((device) => (
          <TableRow key={device.device}>
            <TableCell className="font-medium">{device.device}</TableCell>
            <TableCell>{device.consumption}</TableCell>
            <TableCell>{device.optimalHours}</TableCell>
            <TableCell>{getPriorityBadge(device.priority)}</TableCell>
            <TableCell className="text-right">
              <Switch 
                checked={enabledDevices[device.device]} 
                onCheckedChange={() => handleToggle(device.device)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}