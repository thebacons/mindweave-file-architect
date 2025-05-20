
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FolderOpen } from "lucide-react";

interface FileUploaderProps {
  onFilesLoaded: (files: FileSystemDirectoryEntry) => void;
}

const FileUploader = ({ onFilesLoaded }: FileUploaderProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDirectorySelect = async () => {
    try {
      setIsLoading(true);

      // Check if File System Access API is supported
      if (!('showDirectoryPicker' in window)) {
        toast.error("Your browser doesn't support the File System Access API. Try using Chrome or Edge.");
        setIsLoading(false);
        return;
      }

      // @ts-ignore - TypeScript doesn't have types for showDirectoryPicker yet
      const directoryHandle = await window.showDirectoryPicker({
        mode: 'read'
      });

      // Convert directory handle to entry that can be scanned
      // @ts-ignore - Using non-standard API
      const directoryEntry = await new Promise<FileSystemDirectoryEntry>((resolve) => {
        // @ts-ignore - Using FileSystem API
        resolve(directoryHandle);
      });

      onFilesLoaded(directoryEntry);
      toast.success("Directory selected successfully!");
    } catch (error) {
      console.error("Error selecting directory:", error);
      toast.error("Failed to access the directory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-secondary rounded-lg">
      <FolderOpen className="h-12 w-12 text-primary mb-4" />
      <h2 className="text-xl font-semibold mb-2">Select a Directory to Analyze</h2>
      <p className="text-muted-foreground mb-4 text-center">
        Choose a directory to scan for files and create a mindmap visualization.
      </p>
      <Button 
        onClick={handleDirectorySelect} 
        className="gap-2"
        disabled={isLoading}
      >
        {isLoading ? "Scanning..." : "Select Directory"}
      </Button>
    </div>
  );
};

export default FileUploader;
