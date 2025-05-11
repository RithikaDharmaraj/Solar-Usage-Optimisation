import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ExternalLink, Info } from "lucide-react";

interface Scan {
  _id: string;
  name: string;
  networkRange: string;
  status: "pending" | "running" | "completed" | "failed";
  scanType: string;
  startTime: string;
  endTime?: string;
  totalDevices: number;
  vulnerableDevices: number;
}

interface ScanHistoryTableProps {
  scans: Scan[];
  limit?: number;
}

export default function ScanHistoryTable({ scans, limit }: ScanHistoryTableProps) {
  const limitedScans = limit ? scans.slice(0, limit) : scans;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case "running":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Running</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>;
    }
  };
  
  const getScanTypeBadge = (type: string) => {
    switch (type) {
      case "standard":
        return <Badge variant="outline">Standard</Badge>;
      case "deep":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Deep</Badge>;
      case "solar_focused":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Solar</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };
  
  if (scans.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No scan history available</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-secondary-700">
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-left font-medium">Devices</th>
            <th className="px-4 py-3 text-left font-medium">Date</th>
            <th className="px-4 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {limitedScans.map((scan) => (
            <tr key={scan._id} className="border-b border-secondary-700 hover:bg-secondary-800/50">
              <td className="px-4 py-3">
                <div className="font-medium">{scan.name}</div>
                <div className="text-xs text-muted-foreground">{scan.networkRange}</div>
              </td>
              <td className="px-4 py-3">{getStatusBadge(scan.status)}</td>
              <td className="px-4 py-3">{getScanTypeBadge(scan.scanType)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span>{scan.totalDevices} total</span>
                  {scan.vulnerableDevices > 0 && (
                    <span className="text-xs text-red-500">
                      {scan.vulnerableDevices} vulnerable
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-xs">
                  <div>
                    Started: {format(new Date(scan.startTime), 'MMM d, yyyy HH:mm')}
                  </div>
                  {scan.endTime && (
                    <div>
                      Ended: {format(new Date(scan.endTime), 'MMM d, yyyy HH:mm')}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <Link to={`/scan/${scan._id}`}>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {limit && scans.length > limit && (
        <div className="mt-4 text-center">
          <Link to="/scanner">
            <Button variant="ghost" size="sm">
              View All Scans
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}