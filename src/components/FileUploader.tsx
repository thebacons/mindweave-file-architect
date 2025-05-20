import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FolderOpen, Database, Download, Github, FileDown } from "lucide-react";
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
# Cloning and Running FileArchitect From Your GitHub Account (TheBacons)

## Step 1: Clone the Repository
1. Open your terminal or command prompt
2. Navigate to the directory where you want to clone the project
3. Run the following command:

\`\`\`
git clone https://github.com/TheBacons/mindweave-file-architect.git
cd mindweave-file-architect
\`\`\`

## Step 2: Install Dependencies
Once you have cloned the repository, install all the necessary dependencies:

\`\`\`
npm install
\`\`\`

## Step 3: Run the Application
After installing the dependencies, start the development server:

\`\`\`
npm run dev
\`\`\`

Then open your browser and navigate to the URL displayed in your terminal (typically http://localhost:5173 or http://localhost:8080).

## Troubleshooting

### If You See "Repository Not Found" Error
Make sure you're logged in to GitHub and have access to your repository.

### If the File System API Doesn't Work
Some browsers or environments (especially corporate environments) may restrict the File System Access API. In that case:
- Use the "Use Mock Data" button in the application to test functionality
- Try running the application in Chrome or Edge in a non-corporate environment
- Ensure you're running the application through a proper web server (not just opening HTML files directly)

### If npm install Fails
Try the following:
1. Check your Node.js version (should be v16 or higher): \`node -v\`
2. Clear npm cache: \`npm cache clean --force\`
3. Try: \`npm install --legacy-peer-deps\`

## Future Updates
To pull future updates from your GitHub repository:

\`\`\`
git pull origin main
npm install
\`\`\`
`;

    // Create a blob and download it
    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'github-clone-instructions.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("GitHub clone instructions downloaded successfully!");
  };

  const handleDownloadProjectFiles = () => {
    const projectStructure = `
# Project Structure

This is the structure of the FileArchitect project. You'll need to create these files and folders in your local project.

\`\`\`
src/
├── components/
│   ├── DirectoryStats.tsx
│   ├── DuplicatesTable.tsx
│   ├── FileUploader.tsx
│   ├── LoadingOverlay.tsx
│   ├── MindMap.tsx
│   ├── RecommendationCard.tsx
│   └── ui/
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       ├── tooltip.tsx
│       └── use-toast.ts
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── mockData.ts
│   └── utils.ts
├── pages/
│   ├── Index.tsx
│   └── NotFound.tsx
└── types/
    └── filesystem.ts
\`\`\`

To access these files:

1. Open Dev Mode in the Lovable interface (top left corner)
2. Export the project from Settings or copy each file manually
3. Make sure to install all dependencies (listed in the setup instructions)
`;

    // Create a blob and download it
    const blob = new Blob([projectStructure], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-structure.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Project structure file downloaded successfully!");
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
      
      <div className="mt-6 w-full max-w-md flex flex-col gap-3">
        <Button
          onClick={handleDownloadInstructions}
          variant="outline"
          className="w-full gap-2"
        >
          <Github className="h-4 w-4 mr-1" />
          Clone From TheBacons GitHub
        </Button>
        
        <Button
          onClick={handleDownloadProjectFiles}
          variant="outline"
          className="w-full gap-2"
        >
          <FileDown className="h-4 w-4" />
          Download Project Structure
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-4">
        Having trouble? The file picker may not work in corporate environments due to security restrictions.
      </p>
    </div>
  );
};

export default FileUploader;
