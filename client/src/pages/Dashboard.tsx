import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import StatCard from "@/components/StatCard";
import ScanHistoryTable from "@/components/ScanHistoryTable";
import ThreatFeed from "@/components/ThreatFeed";
import VulnerabilityChart from "@/components/VulnerabilityChart";
import SecurityRecommendations from "@/components/SecurityRecommendations";
import { Shield, Search, Cpu, Bug, SunIcon } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface DashboardStats {
  totalScans: number;
  totalDevices: number;
  totalVulnerabilities: number;
  solarScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  recentScans: any[];
  recentThreats: any[];
  recommendations: any[];
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard'],
    queryFn: async () => {
      const res = await apiRequest('/api/dashboard', 'GET');
      return await res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Security Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-secondary-800 rounded-lg p-5 h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Security Dashboard</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>Error loading dashboard data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold text-white">Security Dashboard</h1>
        <Link to="/scanner">
          <Button className="mt-3 md:mt-0" size="sm">
            <Search className="mr-2 h-4 w-4" />
            New Scan
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Scans" 
          value={data?.totalScans.toString() || "0"} 
          trend={`${data?.totalScans || 0} total scans performed`}
          trendValue={data?.totalScans.toString() || "0"}
          trendDirection="up"
          icon={<Search className="h-4 w-4" />}
          color="primary"
        />
        
        <StatCard 
          title="Devices Monitored" 
          value={data?.totalDevices.toString() || "0"} 
          trend={`${data?.totalDevices || 0} devices discovered`}
          trendValue={data?.totalDevices.toString() || "0"}
          trendDirection="up"
          icon={<Cpu className="h-4 w-4" />}
          color="info"
        />
        
        <StatCard 
          title="Active Vulnerabilities" 
          value={data?.totalVulnerabilities.toString() || "0"} 
          trend={`${data?.totalVulnerabilities || 0} vulnerabilities found`}
          trendValue={data?.totalVulnerabilities.toString() || "0"}
          trendDirection="up"
          icon={<Bug className="h-4 w-4" />}
          color="danger"
        />
        
        <StatCard 
          title="Solar Security Score" 
          value={data?.solarScore ? `${data.solarScore}` : "--"} 
          subvalue="/100"
          trend={data?.solarScore 
            ? (data.solarScore >= 80 
              ? "Strong" 
              : data.solarScore >= 60 
                ? "Medium" 
                : "Weak")
            : "Not assessed"}
          trendDirection={data?.solarScore 
            ? (data.solarScore >= 80 
              ? "up" 
              : data.solarScore >= 60 
                ? "right" 
                : "down")
            : "neutral"}
          icon={<SunIcon className="h-4 w-4" />}
          color="warning"
        />
      </div>

      {/* Recent Scans & Security Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Recent Scans</CardTitle>
            <Link to="/scanner" className="text-sm text-primary hover:text-primary-400">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            <ScanHistoryTable scans={data?.recentScans || []} limit={5} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Latest Threat Intelligence</CardTitle>
            <Link to="/threats" className="text-sm text-primary hover:text-primary-400">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            <ThreatFeed threats={data?.recentThreats || []} />
          </CardContent>
        </Card>
      </div>

      {/* Vulnerability Overview & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Vulnerability Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <VulnerabilityChart 
              critical={data?.criticalCount || 0}
              high={data?.highCount || 0}
              medium={data?.mediumCount || 0}
              low={data?.lowCount || 0}
            />
            <div className="mt-6">
              <Link to="/scanner">
                <Button variant="secondary" className="w-full">View Details</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Security Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <SecurityRecommendations recommendations={data?.recommendations || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
