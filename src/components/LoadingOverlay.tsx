
import { Loader2 } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";

interface LoadingOverlayProps {
  message: string;
  isLoading: boolean;
}

const LoadingOverlay = ({ message, isLoading }: LoadingOverlayProps) => {
  const { progress } = useProgress();
  
  if (!isLoading) return null;
  
  const formatTimeRemaining = (seconds: number | null): string => {
    if (seconds === null || seconds === undefined) return "Calculating...";
    if (seconds < 60) return `About ${Math.ceil(seconds)} seconds`;
    return `About ${Math.ceil(seconds / 60)} minutes`;
  };
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="animate-pulse-glow">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
      <p className="mt-4 text-lg font-medium">{message}</p>
      
      {progress.isProcessing && (
        <div className="mt-8 w-full max-w-md px-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{progress.stage === "scanning" ? "Scanning files" : 
                   progress.stage === "analyzing" ? "Analyzing data" : 
                   progress.stage === "visualizing" ? "Creating visualization" : "Processing"}</span>
            <span>{progress.percentage.toFixed(0)}%</span>
          </div>
          
          <Progress value={progress.percentage} className="h-2 mb-4" />
          
          <div className="text-sm text-muted-foreground">
            {progress.processedItems > 0 && (
              <p className="mb-1">
                {progress.processedItems.toLocaleString()} / {progress.totalItems.toLocaleString()} items processed
              </p>
            )}
            
            {progress.currentFile && (
              <p className="mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                Current: {progress.currentFile}
              </p>
            )}
            
            {progress.estimatedTimeRemaining !== null && (
              <p>Estimated time remaining: {formatTimeRemaining(progress.estimatedTimeRemaining)}</p>
            )}
          </div>
        </div>
      )}
      
      {!progress.isProcessing && (
        <div className="mt-8 max-w-md">
          <div className="h-2 bg-secondary/70 rounded-full w-full max-w-[80%] mb-3"></div>
          <div className="h-2 bg-secondary/50 rounded-full w-full max-w-[60%]"></div>
        </div>
      )}
    </div>
  );
};

export default LoadingOverlay;
