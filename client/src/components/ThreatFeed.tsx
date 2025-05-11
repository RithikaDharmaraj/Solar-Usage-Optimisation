import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AlertTriangle, SunIcon, Cpu } from "lucide-react";

interface Threat {
  _id: string;
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  publishedDate: string;
  isRelevantToSolar?: boolean;
  isRelevantToIot?: boolean;
}

interface ThreatFeedProps {
  threats: Threat[];
}

export default function ThreatFeed({ threats }: ThreatFeedProps) {
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500 hover:bg-red-600";
      case "High":
        return "bg-orange-500 hover:bg-orange-600";
      case "Medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Low":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };
  
  if (threats.length === 0) {
    return (
      <div className="text-center py-6">
        <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No threat intelligence available</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {threats.map((threat) => (
        <Card key={threat._id} className="overflow-hidden bg-secondary-800/50 border-secondary-700">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    className={getSeverityColor(threat.severity)}
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
                
                <h3 className="font-medium mb-1">{threat.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {threat.description}
                </p>
                
                <div className="text-xs text-muted-foreground">
                  {format(new Date(threat.publishedDate), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="text-center">
        <Link to="/threats">
          <Badge 
            variant="outline"
            className="cursor-pointer hover:bg-secondary-800"
          >
            View all threats
          </Badge>
        </Link>
      </div>
    </div>
  );
}