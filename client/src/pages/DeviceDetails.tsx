import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, Lock, WifiOff } from "lucide-react";
import { apiRequest } from "@/lib/api";
import DeviceVulnerabilities from "@/components/DeviceVulnerabilities";

interface DeviceDetailsProps {
  id?: string;
}

interface Device {
  id: number;
  ip_address: string;
  mac_address: string;
  hostname: string;
  device_type: string;
  manufacturer: string;
  os: string;
  firmware_version: string;
  is_vulnerable: boolean;
  is_solar_device: boolean;
  last_seen: string;
  scan_id: number;
  open_ports: Record<string, string>;
  vulnerabilities: Vulnerability[];
}

interface Vulnerability {
  id: number;
  name: string;
  description: string;
  severity: string;
  cvss_score: number;
  cve_id: string;
  status: string;
  remediation: string;
}

interface FirewallRule {
  name: string;
  description: string;
  source_ip: string;
  destination_ip: string;
  protocol: string;
  port_range: string;
  action: string;
  priority: number;
}

export default function DeviceDetails({ id }: DeviceDetailsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const {
    data: device,
    isLoading,
    error
  } = useQuery<{
    device: Device;
    recommended_rules: FirewallRule[];
  }>({
    queryKey: [`/api/devices/${id}`],
    queryFn: async () => {
      const res = await apiRequest(`/api/devices/${id}`, 'GET');
      return res.json();
    }
  });

  const applyFirewallRule = async (rule: FirewallRule) => {
    try {
      const response = await apiRequest("/api/firewall/rules", "POST", { rule_data: rule });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Firewall rule applied successfully",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to apply firewall rule",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred when applying the firewall rule",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Device Details</h1>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardContent className="h-64 mt-6"></CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardContent className="h-64 mt-6"></CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Device Details</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>Error loading device details. Please try again later.</p>
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
          <h1 className="text-2xl font-semibold text-white">Device Details</h1>
          <p className="text-muted-foreground">
            {device.device.hostname 
              ? `${device.device.hostname} (${device.device.ip_address})`
              : device.device.ip_address}
          </p>
        </div>
        <div className="mt-3 md:mt-0">
          <Button 
            variant="outline"
            onClick={() => setLocation(`/scan/${device.device.scan_id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Scan
          </Button>
        </div>
      </div>

      {/* Device Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Device Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">IP Address</p>
                <p className="font-mono mt-1">{device.device.ip_address}</p>
              </div>
              {device.device.mac_address && (
                <div>
                  <p className="text-sm text-muted-foreground">MAC Address</p>
                  <p className="font-mono mt-1">{device.device.mac_address}</p>
                </div>
              )}
              {device.device.hostname && (
                <div>
                  <p className="text-sm text-muted-foreground">Hostname</p>
                  <p className="mt-1">{device.device.hostname}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Device Type</p>
                <p className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs 
                    ${device.device.is_solar_device 
                      ? 'bg-warning/20 text-warning' 
                      : device.device.device_type === 'iot' 
                        ? 'bg-info/20 text-info' 
                        : 'bg-primary-600/20 text-primary-400'}`}
                  >
                    {device.device.is_solar_device 
                      ? 'Solar Device' 
                      : device.device.device_type 
                        ? device.device.device_type.charAt(0).toUpperCase() + device.device.device_type.slice(1) 
                        : 'Unknown'}
                  </span>
                </p>
              </div>
              {device.device.manufacturer && (
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturer</p>
                  <p className="mt-1">{device.device.manufacturer}</p>
                </div>
              )}
              {device.device.os && (
                <div>
                  <p className="text-sm text-muted-foreground">Operating System</p>
                  <p className="mt-1">{device.device.os}</p>
                </div>
              )}
              {device.device.firmware_version && (
                <div>
                  <p className="text-sm text-muted-foreground">Firmware Version</p>
                  <p className="mt-1">{device.device.firmware_version}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Security Status</p>
                <p className="mt-1">
                  {device.device.is_vulnerable ? (
                    <span className="px-2 py-1 bg-destructive/20 text-destructive rounded-full">Vulnerable</span>
                  ) : (
                    <span className="px-2 py-1 bg-success/20 text-success rounded-full">Secure</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Seen</p>
                <p className="mt-1">{new Date(device.device.last_seen).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {/* Vulnerabilities */}
          <DeviceVulnerabilities vulnerabilities={device.device.vulnerabilities} />

          {/* Open Ports */}
          {device.device.open_ports && Object.keys(device.device.open_ports).length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Open Ports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Object.entries(device.device.open_ports).map(([port, service]) => (
                    <div 
                      key={port} 
                      className="bg-secondary-700 p-3 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-medium">{port}</span>
                        <span className={`text-xs ${['21', '23', '3389', '20', '25', '137', '138', '139', '445'].includes(port) ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {service}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Firewall Rules */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Recommended Firewall Rules</CardTitle>
            </CardHeader>
            <CardContent>
              {device.recommended_rules && device.recommended_rules.length > 0 ? (
                <div className="space-y-4">
                  {device.recommended_rules.map((rule, index) => (
                    <div key={index} className="bg-secondary-700 p-4 rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-medium">{rule.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <Button 
                            size="sm" 
                            onClick={() => applyFirewallRule(rule)}
                          >
                            Apply Rule
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="flex">
                          <span className="text-muted-foreground mr-2">Source:</span>
                          <span className="font-mono">{rule.source_ip}</span>
                        </div>
                        <div className="flex">
                          <span className="text-muted-foreground mr-2">Destination:</span>
                          <span className="font-mono">{rule.destination_ip}</span>
                        </div>
                        <div className="flex">
                          <span className="text-muted-foreground mr-2">Protocol:</span>
                          <span>{rule.protocol}</span>
                        </div>
                        <div className="flex">
                          <span className="text-muted-foreground mr-2">Port(s):</span>
                          <span>{rule.port_range}</span>
                        </div>
                        <div className="flex">
                          <span className="text-muted-foreground mr-2">Action:</span>
                          <span className={rule.action === 'deny' ? 'text-destructive' : 'text-success'}>
                            {rule.action.charAt(0).toUpperCase() + rule.action.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <p>No firewall rules recommended for this device</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
