
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recommendation } from "@/types/filesystem";
import { LightbulbIcon } from "lucide-react";

interface RecommendationCardProps {
  recommendations: Recommendation[];
}

const RecommendationCard = ({ recommendations }: RecommendationCardProps) => {
  if (!recommendations.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {recommendations.map((rec, index) => (
            <li key={index} className="p-3 border rounded-md bg-secondary/50">
              <h4 className="font-semibold mb-1">{rec.title}</h4>
              <p className="text-sm text-muted-foreground">{rec.description}</p>
              {rec.suggestion && (
                <div className="mt-2 p-2 bg-background rounded-md text-xs font-mono">
                  {rec.suggestion}
                </div>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
