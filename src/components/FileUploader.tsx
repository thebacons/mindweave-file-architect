
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FolderOpen, Database, Download } from "lucide-react";
import { mockFileSystemData } from "@/lib/mockData";

interface FileUploaderProps {
  onFilesLoaded: (files: FileSystemDirectoryEntry) => void;
  onUseMockData: () => void;
}

const FileUploader = ({ onFilesLoaded, onUseMockData }: FileUploaderProps) => {
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
      toast.error("Failed to access the directory. Please try again or use Mock Data for testing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseMockData = () => {
    toast.success("Using mock data for visualization");
    onUseMockData();
  };

  const handleDownloadInstructions = () => {
    const instructions = `
# Running FileArchitect Locally

1. Make sure you have Node.js installed (version 16 or higher)
2. Create a new directory for the project
3. Open your terminal in that directory
4. Run the following commands:

\`\`\`
npm create vite@latest file-architect -- --template react-ts
cd file-architect
npm install
\`\`\`

5. Replace the project files with the ones from this app
6. Install the required dependencies:

\`\`\`
npm install @radix-ui/react-* lucide-react sonner recharts tailwind-merge clsx class-variance-authority
\`\`\`

7. Start the development server:

\`\`\`
npm run dev
\`\`\`

8. Open your browser and navigate to http://localhost:5173
`;

    // Create a blob and download it
    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'setup-instructions.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Setup instructions downloaded successfully!");
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-secondary rounded-lg">
      <FolderOpen className="h-12 w-12 text-primary mb-4" />
      <h2 className="text-xl font-semibold mb-2">Select a Directory to Analyze</h2>
      <p className="text-muted-foreground mb-4 text-center">
        Choose a directory to scan for files and create a mindmap visualization.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
        <Button 
          onClick={handleDirectorySelect} 
          className="gap-2"
          disabled={isLoading}
        >
          {isLoading ? "Scanning..." : "Select Directory"}
        </Button>
        
        <Button
          onClick={handleUseMockData}
          variant="secondary"
          className="gap-2"
        >
          <Database className="h-4 w-4" />
          Use Mock Data
        </Button>
      </div>
      
      <div className="mt-6 w-full max-w-md">
        <Button
          onClick={handleDownloadInstructions}
          variant="outline"
          className="w-full gap-2"
        >
          <Download className="h-4 w-4" />
          Download Local Setup Instructions
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-4">
        Having trouble? The file picker may not work in corporate environments due to security restrictions.
      </p>
    </div>
  );
};

export default FileUploader;
