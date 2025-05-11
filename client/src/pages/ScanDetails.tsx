import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, ArrowLeft, FileOutput, Link } from "lucide-react";
import { apiRequest } from "@/lib/api";
import SolarScoreCard from "@/components/SolarScoreCard";
import { useState } from "react";

interface ScanDetailsProps {
  id?: string;
}

interface Scan {
  id: number;
  name: string;
  network_range: string;
  scan_type: string;
  status: string;
  total_devices: number;
  vulnerable_devices: number;
  start_time: string;
  end_time: string;
  devices: Device[];
  solar_assessment?: SolarAssessment;
  vulnerability_stats: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface Device {
  id: number;
  ip_address: string;
  hostname: string;
  device_type: string;
  manufacturer: string;
  os: string;
  firmware_version: string;
  is_vulnerable: boolean;
  is_solar_device: boolean;
  vulnerability_count: number;
}

interface SolarAssessment {
  id: number;
  security_score: number;
  authentication_strength: string;
  encryption_status: string;
  firmware_status: string;
  network_isolation_score: number;
}

export default function ScanDetails({ id }: ScanDetailsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: scan,
    isLoading,
    error
  } = useQuery<Scan>({
    queryKey: [`/api/scans/${id}`],
    queryFn: async () => {
      const res = await apiRequest(`/api/scans/${id}`, 'GET');
      return res.json();
    }
  });

  const generateReport = async () => {
    if (!id) return;
    
    try {
      const response = await apiRequest(`/api/scans/${id}/report`, 'POST');
      
      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: "Success",
          description: "Report generated successfully",
        });
        
        // Download the report
        window.location.href = data.report_url;
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to generate report",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred when generating the report",
        variant: "destructive",
      });
    }
  };

  const getStatusIndicator = (status: string) => {
    if (status === 'running') return "bg-info text-info";
    if (status === 'completed') return "bg-success text-success";
    if (status === 'failed') return "bg-destructive text-destructive";
    return "bg-muted text-muted-foreground";
  };

  const getScanTypeLabel = (type: string) => {
    switch (type) {
      case 'standard':
        return "Standard Scan";
      case 'deep':
        return "Deep Scan";
      case 'solar_focused':
        return "Solar Focused Scan";
      default:
        return "Unknown";
    }
  };

  const filteredDevices = scan?.devices.filter(device => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      device.ip_address.toLowerCase().includes(term) ||
      (device.hostname && device.hostname.toLowerCase().includes(term)) ||
      (device.device_type && device.device_type.toLowerCase().includes(term)) ||
      (device.os && device.os.toLowerCase().includes(term))
    );
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Scan Details</h1>
        </div>
        <div className="animate-pulse space-y-6">
          <Card>
            <CardContent className="h-24 mt-6"></CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1">
              <CardContent className="h-64 mt-6"></CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardContent className="h-64 mt-6"></CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Scan Details</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>Error loading scan details. Please try again later.</p>
            <Button 
              variant="secondary" 
              className="mt-4"
              onClick={() => setLocation("/scanner")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scanner
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Scan Details</h1>
          <p className="text-muted-foreground">{scan.name} - {scan.network_range}</p>
        </div>
        <div className="mt-3 md:mt-0 flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setLocation("/scanner")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Scanner
          </Button>
          <Button 
            onClick={generateReport}
            disabled={scan.status !== 'completed'}
          >
            <FileOutput className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Scan Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="flex items-center mt-1">
                <span className={`w-3 h-3 rounded-full mr-2 ${getStatusIndicator(scan.status)}`}></span>
                <p className="font-medium capitalize">{scan.status}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Scan Type</p>
              <p className="font-medium mt-1">{getScanTypeLabel(scan.scan_type)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Start Time</p>
              <p className="font-medium mt-1">{new Date(scan.start_time).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">End Time</p>
              <p className="font-medium mt-1">
                {scan.end_time ? new Date(scan.end_time).toLocaleString() : "In Progress"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devices and Vulnerabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Scan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-semibold mt-1">{scan.total_devices}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vulnerable Devices</p>
                <p className="text-2xl font-semibold mt-1 text-destructive">{scan.vulnerable_devices}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Vulnerabilities</p>
                <p className="text-xl font-semibold mt-1 text-destructive">{scan.vulnerability_stats.critical}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Vulnerabilities</p>
                <p className="text-xl font-semibold mt-1 text-warning">{scan.vulnerability_stats.high}</p>
              </div>
            </CardContent>
          </Card>

          {/* Solar Assessment Summary (if available) */}
          {scan.solar_assessment && (
            <SolarScoreCard assessment={scan.solar_assessment} />
          )}
        </div>

        <div className="lg:col-span-3">
          {/* Device List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Discovered Devices</CardTitle>
              <div className="relative w-64">
                <Input
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-700 text-left">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Hostname/IP</th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">OS/Firmware</th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Vulnerabilities</th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices && filteredDevices.length > 0 ? (
                    filteredDevices.map((device) => (
                      <tr key={device.id} className="border-b border-secondary-700 hover:bg-secondary-700/50">
                        <td className="px-5 py-4 text-sm">
                          <div className="flex items-center">
                            {device.hostname ? (
                              <span>{device.hostname} <span className="text-muted-foreground">({device.ip_address})</span></span>
                            ) : (
                              <span>{device.ip_address}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs 
                            ${device.is_solar_device 
                              ? 'bg-warning/20 text-warning' 
                              : device.device_type === 'iot' 
                                ? 'bg-info/20 text-info' 
                                : 'bg-primary-600/20 text-primary-400'}`}
                          >
                            {device.is_solar_device 
                              ? 'Solar' 
                              : device.device_type 
                                ? device.device_type.charAt(0).toUpperCase() + device.device_type.slice(1) 
                                : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {device.os || device.firmware_version || "Unknown"}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {device.vulnerability_count > 0 ? (
                            <span className="text-destructive">{device.vulnerability_count}</span>
                          ) : (
                            <span className="text-success">0</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {device.is_vulnerable ? (
                            <span className="px-2 py-1 bg-destructive/20 text-destructive rounded-full text-xs">Vulnerable</span>
                          ) : (
                            <span className="px-2 py-1 bg-success/20 text-success rounded-full text-xs">Secure</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <Button variant="link" size="sm" asChild>
                            <a href={`/device/${device.id}`}>
                              Details
                            </a>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-4 text-center text-muted-foreground">
                        {searchTerm ? "No devices match your search criteria." : "No devices found in this scan."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
