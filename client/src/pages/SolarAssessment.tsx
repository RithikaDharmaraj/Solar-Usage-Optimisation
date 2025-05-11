import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SunIcon, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface SolarAssessment {
  id: string;
  securityScore: number;
  networkIsolationScore: number;
  authenticationStrength: string;
  encryptionStatus: string;
  firmwareStatus: string;
  inverterVulnerabilities: any[];
  monitoringSystemVulnerabilities: any[];
  communicationProtocolIssues: any[];
  recommendations: any[];
  createdAt: string;
}

export default function SolarAssessment() {
  const { toast } = useToast();
  
  const { data, isLoading, error } = useQuery<SolarAssessment>({
    queryKey: ['/api/solar/assessment'],
    queryFn: async () => {
      const res = await apiRequest('/api/solar/assessment', 'GET');
      return await res.json();
    }
  });
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };
  
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'strong':
      case 'up-to-date':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'moderate':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'weak':
      case 'outdated':
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center mb-6">
          <SunIcon className="mr-2 h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-semibold">Solar System Security Assessment</h1>
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
        <div className="flex items-center mb-6">
          <SunIcon className="mr-2 h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-semibold">Solar System Security Assessment</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center text-red-500">
              <AlertCircle className="mr-2 h-6 w-6" />
              <p>Error loading solar assessment data. Please try again later.</p>
            </div>
            <Button 
              className="mt-4" 
              onClick={() => {
                toast({
                  title: "Starting new assessment",
                  description: "This feature is not yet implemented",
                });
              }}
            >
              Start New Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center">
        <SunIcon className="mr-2 h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-semibold">Solar System Security Assessment</h1>
      </div>
      
      {!data ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <SunIcon className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-medium mb-2">No Solar Assessment Data Available</h2>
            <p className="text-muted-foreground mb-6">
              Run a solar-focused security scan to assess your solar installation's security posture.
            </p>
            <Button
              onClick={() => {
                toast({
                  title: "Starting new assessment",
                  description: "This feature is not yet implemented",
                });
              }}
            >
              Start New Assessment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Score Card */}
          <Card className="bg-gradient-to-br from-secondary-900 to-secondary-800">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-6">
                    <div className={`text-5xl font-bold ${getScoreColor(data.securityScore)}`}>
                      {data.securityScore}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Security Score</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 md:mt-0">
                  <div className="flex items-center">
                    {getStatusIcon(data.authenticationStrength)}
                    <div className="ml-2">
                      <div className="text-sm font-medium">Authentication</div>
                      <div className="text-xs text-muted-foreground">{data.authenticationStrength}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(data.encryptionStatus)}
                    <div className="ml-2">
                      <div className="text-sm font-medium">Encryption</div>
                      <div className="text-xs text-muted-foreground">{data.encryptionStatus}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(data.firmwareStatus)}
                    <div className="ml-2">
                      <div className="text-sm font-medium">Firmware</div>
                      <div className="text-xs text-muted-foreground">{data.firmwareStatus}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vulnerability Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Inverter Vulnerabilities</CardTitle>
              </CardHeader>
              <CardContent>
                {data.inverterVulnerabilities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No vulnerabilities detected</p>
                ) : (
                  <ul className="space-y-3">
                    {data.inverterVulnerabilities.map((vuln, i) => (
                      <li key={i} className="border-l-2 border-red-500 pl-3 py-1">
                        <div className="font-medium">{vuln.title}</div>
                        <div className="text-sm text-muted-foreground">{vuln.description}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Monitoring System Issues</CardTitle>
              </CardHeader>
              <CardContent>
                {data.monitoringSystemVulnerabilities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No vulnerabilities detected</p>
                ) : (
                  <ul className="space-y-3">
                    {data.monitoringSystemVulnerabilities.map((vuln, i) => (
                      <li key={i} className="border-l-2 border-yellow-500 pl-3 py-1">
                        <div className="font-medium">{vuln.title}</div>
                        <div className="text-sm text-muted-foreground">{vuln.description}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Security Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recommendations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recommendations available</p>
              ) : (
                <ul className="space-y-4">
                  {data.recommendations.map((rec, i) => (
                    <li key={i} className="flex">
                      <div className="mr-3 mt-0.5">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium">{rec.title}</div>
                        <div className="text-sm text-muted-foreground">{rec.description}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}