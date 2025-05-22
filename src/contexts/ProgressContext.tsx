
import React, { createContext, useContext, useState } from "react";

export interface ProgressInfo {
  isProcessing: boolean;
  stage: "scanning" | "analyzing" | "visualizing" | "idle";
  percentage: number;
  currentFile: string;
  processedItems: number;
  totalItems: number;
  estimatedTimeRemaining: number | null; // in seconds
}

const initialState: ProgressInfo = {
  isProcessing: false,
  stage: "idle",
  percentage: 0,
  currentFile: "",
  processedItems: 0,
  totalItems: 0,
  estimatedTimeRemaining: null
};

interface ProgressContextType {
  progress: ProgressInfo;
  updateProgress: (updates: Partial<ProgressInfo>) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType>({
  progress: initialState,
  updateProgress: () => {},
  resetProgress: () => {}
});

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<ProgressInfo>(initialState);

  const updateProgress = (updates: Partial<ProgressInfo>) => {
    setProgress(prev => ({
      ...prev,
      ...updates,
      // Ensure percentage is always between 0-100
      percentage: updates.percentage !== undefined 
        ? Math.max(0, Math.min(100, updates.percentage)) 
        : prev.percentage
    }));
  };

  const resetProgress = () => {
    setProgress(initialState);
  };

  return (
    <ProgressContext.Provider value={{ progress, updateProgress, resetProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};
