
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message: string;
  isLoading: boolean;
}

const LoadingOverlay = ({ message, isLoading }: LoadingOverlayProps) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="animate-pulse-glow">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
      <p className="mt-4 text-lg font-medium">{message}</p>
      <div className="mt-8 max-w-md">
        <div className="h-2 bg-secondary/70 rounded-full w-full max-w-[80%] mb-3"></div>
        <div className="h-2 bg-secondary/50 rounded-full w-full max-w-[60%]"></div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
