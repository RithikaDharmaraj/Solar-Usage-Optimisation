import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, AlertTriangle, RefreshCw, SunIcon, Cpu } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Threat {
  id: string;
  title: string;
  description: string;
  severity: string;
  threatType: string;
  publishedDate: string;
  source: string;
  cveId: string;
  affectedSystems: string[];
  mitigation: string;
  isRelevantToSolar: boolean;
  isRelevantToIot: boolean;
}

export default function ThreatIntelligence() {
  const { toast } = useToast();
  const { data, isLoading, error, refetch } = useQuery<Threat[]>({
    queryKey: ['/api/threats'],
    queryFn: async () => {
      const res = await apiRequest('/api/threats', 'GET');
      return await res.json();
    }
  });

  const refreshThreatFeed = async () => {
    toast({
      title: "Refreshing threat intelligence",
      description: "Updating with the latest security information...",
    });
    
    try {
      await refetch();
      toast({
        title: "Threat feed updated",
        description: "Successfully refreshed with the latest security information."
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: "Could not refresh threat feed. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return "bg-red-500 hover:bg-red-600";
      case 'high':
        return "bg-orange-500 hover:bg-orange-600";
      case 'medium':
        return "bg-yellow-500 hover:bg-yellow-600";
      case 'low':
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
            <h1 className="text-2xl font-semibold">Threat Intelligence</h1>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
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
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
            <h1 className="text-2xl font-semibold">Threat Intelligence</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center text-red-500">
              <AlertCircle className="mr-2 h-6 w-6" />
              <p>Error loading threat intelligence data. Please try again later.</p>
            </div>
            <Button className="mt-4" onClick={refreshThreatFeed}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const threats = data || [];
  const solarThreats = threats.filter(threat => threat.isRelevantToSolar);
  const iotThreats = threats.filter(threat => threat.isRelevantToIot);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
          <h1 className="text-2xl font-semibold">Threat Intelligence</h1>
        </div>
        <Button variant="outline" size="sm" onClick={refreshThreatFeed}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="all">All Threats ({threats.length})</TabsTrigger>
          <TabsTrigger value="solar" className="flex items-center">
            <SunIcon className="h-4 w-4 mr-1" />
            Solar ({solarThreats.length})
          </TabsTrigger>
          <TabsTrigger value="iot" className="flex items-center">
            <Cpu className="h-4 w-4 mr-1" />
            IoT ({iotThreats.length})
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="all">
            <ThreatList threats={threats} />
          </TabsContent>
          
          <TabsContent value="solar">
            {solarThreats.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <SunIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Solar Threats</h3>
                  <p className="text-muted-foreground mb-0">
                    There are currently no active threats specific to solar systems.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ThreatList threats={solarThreats} />
            )}
          </TabsContent>
          
          <TabsContent value="iot">
            {iotThreats.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Cpu className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-2">No IoT Threats</h3>
                  <p className="text-muted-foreground mb-0">
                    There are currently no active threats specific to IoT devices.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ThreatList threats={iotThreats} />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

interface ThreatListProps {
  threats: Threat[];
}

function ThreatList({ threats }: ThreatListProps) {
  if (threats.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-2">No Threats Found</h3>
          <p className="text-muted-foreground mb-0">
            There are currently no active security threats in the database.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {threats.map((threat) => (
        <Card key={threat.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <CardTitle className="text-lg font-medium">{threat.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${
                    threat.severity.toLowerCase() === 'critical'
                      ? 'bg-red-500 hover:bg-red-600'
                      : threat.severity.toLowerCase() === 'high'
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : threat.severity.toLowerCase() === 'medium'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {threat.severity}
                </Badge>
                {threat.isRelevantToSolar && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                    <SunIcon className="h-3 w-3 mr-1" />
                    Solar
                  </Badge>
                )}
                {threat.isRelevantToIot && (
                  <Badge variant="outline" className="border-purple-500 text-purple-500">
                    <Cpu className="h-3 w-3 mr-1" />
                    IoT
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4">
              <span>Source: {threat.source}</span>
              {threat.cveId && <span>CVE: {threat.cveId}</span>}
              <span>Published: {format(new Date(threat.publishedDate), 'MMM d, yyyy')}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">{threat.description}</p>
            
            {threat.affectedSystems && threat.affectedSystems.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Affected Systems:</h4>
                <div className="flex flex-wrap gap-1">
                  {threat.affectedSystems.map((system, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {system}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {threat.mitigation && (
              <>
                <Separator className="my-3" />
                <div>
                  <h4 className="text-sm font-medium mb-1">Mitigation:</h4>
                  <p className="text-sm text-muted-foreground">{threat.mitigation}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}