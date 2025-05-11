import { Sun, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SolarScoreCardProps {
  score: number;
  className?: string;
}

export default function SolarScoreCard({ score, className }: SolarScoreCardProps) {
  // Determine risk level based on score
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: "Low Risk", color: "text-green-500" };
    if (score >= 60) return { label: "Moderate Risk", color: "text-yellow-500" };
    if (score >= 40) return { label: "High Risk", color: "text-orange-500" };
    return { label: "Critical Risk", color: "text-red-500" };
  };

  const { label, color } = getRiskLevel(score);

  // Determine progress color based on score
  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Solar Security Score</CardTitle>
        <Sun className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{score}%</div>
        <div className="relative w-full mt-2 h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full ${getProgressColor(score)}`} 
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="mt-2 flex items-center text-sm">
          <ShieldCheck className={`mr-1 h-4 w-4 ${color}`} />
          <span className={color}>{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}