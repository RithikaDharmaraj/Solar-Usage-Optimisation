import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Play, ArrowLeft, Eye, FileOutput, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import ScanForm from "@/components/ScanForm";

interface Scan {
  id: number;
  name: string;
  network_range: string;
  scan_type: string;
  status: string;
  total_devices: number;
  start_time: string;
}

interface DeviceDetailsProps {
  id?: string;
}

export default function Scanner({ id }: DeviceDetailsProps) {
  const [showScanForm, setShowScanForm] = useState(false);
  const { toast } = useToast();

  const {
    data: scans,
    isLoading,
    error,
    refetch
  } = useQuery<Scan[]>({
    queryKey: ['/api/scans'],
    queryFn: async () => {
      const res = await apiRequest('/api/scans', 'GET');
      return res.json();
    }
  });

  const handleScanFormSubmit = async (formData: any) => {
    try {
      const response = await apiRequest('/api/scans', 'POST', formData);
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `Scan "${formData.scan_name}" started successfully`,
        });
        
        // Hide form and refresh list
        setShowScanForm(false);
        refetch();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to start scan",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred when starting the scan",
        variant: "destructive",
      });
    }
  };

  const handleDeleteScan = async (scanId: number) => {
    if (!confirm("Are you sure you want to delete this scan? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await apiRequest(`/api/scans/${scanId}`, 'DELETE');
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Scan deleted successfully",
        });
        
        // Refresh list
        refetch();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to delete scan",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred when deleting the scan",
        variant: "destructive",
      });
    }
  };

  const generateReport = async (scanId: number) => {
    try {
      const response = await apiRequest(`/api/scans/${scanId}/report`, 'POST');
      
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

  const getScanTypeLabel = (type: string) => {
    switch (type) {
      case 'standard':
        return <span className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs">Standard</span>;
      case 'deep':
        return <span className="px-2 py-1 bg-info/20 text-info rounded-full text-xs">Deep</span>;
      case 'solar_focused':
        return <span className="px-2 py-1 bg-warning/20 text-warning rounded-full text-xs">Solar</span>;
      default:
        return <span className="px-2 py-1 bg-muted/20 text-muted-foreground rounded-full text-xs">Unknown</span>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'running':
        return <span className="px-2 py-1 bg-info/20 text-info rounded-full text-xs">Running</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-success/20 text-success rounded-full text-xs">Completed</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-destructive/20 text-destructive rounded-full text-xs">Failed</span>;
      default:
        return <span className="px-2 py-1 bg-secondary-600/20 text-gray-400 rounded-full text-xs">Pending</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Network Scanner</h1>
        </div>
        <Card className="animate-pulse">
          <CardContent className="h-32 flex items-center justify-center">
            <p>Loading scan history...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Network Scanner</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>Error loading scan history. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold text-white">Network Scanner</h1>
        <Button 
          onClick={() => setShowScanForm(!showScanForm)}
          className="mt-3 md:mt-0"
          size="sm"
        >
          <Play className="mr-2 h-4 w-4" />
          {showScanForm ? "Cancel" : "Start Scan"}
        </Button>
      </div>

      {showScanForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Configure New Scan</CardTitle>
          </CardHeader>
          <CardContent>
            <ScanForm onSubmit={handleScanFormSubmit} onCancel={() => setShowScanForm(false)} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Scan History</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-700 text-left">
              <tr>
                <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Network Range</th>
                <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Devices</th>
                <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Time</th>
                <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scans && scans.length > 0 ? (
                scans.map((scan) => (
                  <tr key={scan.id} className="border-b border-secondary-700 hover:bg-secondary-700/50">
                    <td className="px-5 py-4 text-sm">{scan.name}</td>
                    <td className="px-5 py-4 text-sm font-mono text-gray-300">{scan.network_range}</td>
                    <td className="px-5 py-4 text-sm">{getScanTypeLabel(scan.scan_type)}</td>
                    <td className="px-5 py-4 text-sm">{getStatusLabel(scan.status)}</td>
                    <td className="px-5 py-4 text-sm text-gray-300">{scan.total_devices}</td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(scan.start_time).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/scan/${scan.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => generateReport(scan.id)}
                          disabled={scan.status !== 'completed'}
                        >
                          <FileOutput className="h-4 w-4" />
                          <span className="sr-only">Generate Report</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteScan(scan.id)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-4 text-sm text-center text-gray-400">
                    No scans found. Start a new scan to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
