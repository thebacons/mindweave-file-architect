
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recommendation, DuplicateGroup } from "@/types/filesystem";
import { LightbulbIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { formatBytes } from "@/lib/utils";

interface RecommendationCardProps {
  recommendations: Recommendation[];
  duplicates?: DuplicateGroup[];
}

const RecommendationCard = ({ recommendations, duplicates = [] }: RecommendationCardProps) => {
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set());

  // Toggle selection of a duplicate group
  const toggleDuplicateSelection = (hash: string) => {
    const newSelection = new Set(selectedDuplicates);
    if (newSelection.has(hash)) {
      newSelection.delete(hash);
    } else {
      newSelection.add(hash);
    }
    setSelectedDuplicates(newSelection);
  };

  // Calculate total wasted space
  const calculateWastedSpace = () => {
    return duplicates
      .filter(dup => selectedDuplicates.has(dup.hash))
      .reduce((acc, dup) => acc + (dup.size * (dup.paths.length - 1)), 0);
  };

  // Function to "clean" duplicates (simulated)
  const cleanDuplicates = () => {
    if (selectedDuplicates.size === 0) {
      toast.warning("Please select duplicates to clean");
      return;
    }

    const totalSaved = formatBytes(calculateWastedSpace());
    toast.success(`${selectedDuplicates.size} duplicate groups cleaned, saving ${totalSaved} of space`);

    // In a real app, this would actually delete files
    // For demo purposes, we just show a success message and clear selection
    setSelectedDuplicates(new Set());
    
    // Link to tools for cleaning duplicates
    toast("Need more advanced duplicate cleaning?", {
      action: {
        label: "Try these tools",
        onClick: () => window.open("https://www.google.com/search?q=best+duplicate+file+cleaner+tools", "_blank"),
      },
    });
  };

  if (!recommendations.length && !duplicates.length) {
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
        {duplicates.length > 0 && (
          <div className="mb-6 p-4 border rounded-md bg-secondary/30">
            <h3 className="font-semibold mb-2 text-md flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              Duplicate File Cleaner
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Found {duplicates.length} groups of duplicate files wasting space. 
              Select which ones to clean up:
            </p>
            
            <div className="max-h-60 overflow-y-auto mb-3 border rounded bg-background">
              {duplicates.map((dup) => (
                <div 
                  key={dup.hash} 
                  className={`p-2 border-b flex items-center gap-2 hover:bg-secondary/20 ${
                    selectedDuplicates.has(dup.hash) ? 'bg-secondary/40' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    id={dup.hash}
                    checked={selectedDuplicates.has(dup.hash)}
                    onChange={() => toggleDuplicateSelection(dup.hash)}
                    className="mr-1"
                  />
                  <div>
                    <label htmlFor={dup.hash} className="text-sm font-medium cursor-pointer">
                      {dup.fileName} ({dup.paths.length} copies, {formatBytes(dup.size * dup.paths.length)})
                    </label>
                    <div className="text-xs text-muted-foreground mt-1">
                      {dup.paths.slice(0, 2).map((path, i) => (
                        <div key={i} className="truncate">{path}</div>
                      ))}
                      {dup.paths.length > 2 && (
                        <div>+ {dup.paths.length - 2} more locations</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {duplicates.length === 0 && (
                <p className="p-4 text-center text-muted-foreground">No duplicate files found</p>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">
                {selectedDuplicates.size > 0 
                  ? `Selected ${selectedDuplicates.size} groups, potentially saving ${formatBytes(calculateWastedSpace())}`
                  : 'Select duplicate groups to clean up'}
              </span>
              <Button 
                onClick={cleanDuplicates}
                disabled={selectedDuplicates.size === 0}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clean Selected Duplicates
              </Button>
            </div>
            
            <div className="mt-3 text-xs text-muted-foreground">
              <p>Note: In this web version, files aren't actually deleted due to browser security restrictions.</p>
              <p>For real file deletion, consider using dedicated apps like <a href="https://www.google.com/search?q=best+duplicate+file+cleaner+tools" target="_blank" rel="noreferrer" className="underline hover:text-primary">these tools</a>.</p>
            </div>
          </div>
        )}
        
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
