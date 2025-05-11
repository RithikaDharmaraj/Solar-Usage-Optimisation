import { Shield, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Vulnerability {
  id: string;
  name: string;
  description?: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cvssScore?: number;
  cveId?: string;
  affectedComponent?: string;
  remediation?: string;
  status: 'open' | 'fixed' | 'in_progress' | 'ignored';
}

interface DeviceVulnerabilitiesProps {
  vulnerabilities: Vulnerability[];
}

export default function DeviceVulnerabilities({ vulnerabilities }: DeviceVulnerabilitiesProps) {
  // Function to get the badge color based on severity
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <Badge className="bg-red-500">Critical</Badge>;
      case 'High':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'Low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  // Function to get the status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'fixed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'ignored':
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // If no vulnerabilities, show a message
  if (vulnerabilities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <Shield className="h-12 w-12 text-green-500 mb-2" />
            <p className="text-center">No vulnerabilities detected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Vulnerabilities ({vulnerabilities.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vulnerabilities.map((vuln) => (
            <div key={vuln.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <h3 className="font-semibold mr-2">{vuln.name}</h3>
                  {getSeverityBadge(vuln.severity)}
                </div>
                <div className="flex items-center">
                  {vuln.cvssScore && (
                    <span className="text-sm bg-secondary px-2 py-1 rounded mr-2">
                      CVSS: {vuln.cvssScore}
                    </span>
                  )}
                  <div className="flex items-center">
                    {getStatusIcon(vuln.status)}
                    <span className="text-sm ml-1 capitalize">{vuln.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
              
              {vuln.cveId && (
                <p className="text-sm font-mono text-muted-foreground mb-2">
                  {vuln.cveId}
                </p>
              )}
              
              {vuln.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {vuln.description}
                </p>
              )}
              
              {vuln.affectedComponent && (
                <div className="text-sm mb-2">
                  <span className="font-semibold">Affected Component:</span> {vuln.affectedComponent}
                </div>
              )}
              
              {vuln.remediation && (
                <>
                  <Separator className="my-2" />
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold mb-1">Remediation:</h4>
                    <p className="text-sm text-muted-foreground">{vuln.remediation}</p>
                  </div>
                </>
              )}
              
              <div className="flex justify-end mt-3">
                <Button variant="outline" size="sm" className="mr-2">
                  Mark as Fixed
                </Button>
                <Button variant="outline" size="sm">
                  Ignore
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}