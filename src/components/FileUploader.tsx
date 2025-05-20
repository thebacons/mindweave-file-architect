import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FolderOpen, Database, Github, FileDown, Server } from "lucide-react";
import { scanFilesViaInput } from "@/lib/utils";
import { DirectoryNode } from "@/types/filesystem";

interface FileUploaderProps {
  onFilesLoaded: (files: FileSystemDirectoryEntry) => void;
  onUseMockData: () => void;
  onUseFilesArray?: (filesAnalysis: any) => void;
}

const FileUploader = ({ onFilesLoaded, onUseMockData, onUseFilesArray }: FileUploaderProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDirectorySelect = async () => {
    try {
      setIsLoading(true);

      // Create a standard input element for directory selection
      // This approach works better across browsers and in iframe environments
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true; // Non-standard attribute
      
      input.onchange = async (event) => {
        if (!input.files || input.files.length === 0) {
          toast.error("No files selected");
          setIsLoading(false);
          return;
        }
        
        try {
          toast.success(`Selected ${input.files.length} files`);
          
          // Process the files directly using the input files array
          const result = await scanFilesViaInput(input.files);
          if (result) {
            // If we have onUseFilesArray handler, use it
            if (onUseFilesArray) {
              onUseFilesArray(result);
            } else {
              // Otherwise pass the result to the regular handler
              // by wrapping it in a compatible interface
              onFilesLoaded(result.rootNode as unknown as FileSystemDirectoryEntry);
            }
            toast.success("Files analyzed successfully!");
          } else {
            throw new Error("Failed to analyze files");
          }
        } catch (error) {
          console.error("Error processing files:", error);
          toast.error("Error processing files. Using mock data instead.");
          onUseMockData(); // Fallback to mock data
        } finally {
          setIsLoading(false);
        }
      };
      
      input.click();
    } catch (error) {
      console.error("Error with directory select:", error);
      toast.error("Failed to access the directory. Please try again or use Mock Data for testing.");
      setIsLoading(false);
    }
  };

  const handleUseMockData = () => {
    toast.success("Using mock data for visualization");
    onUseMockData();
  };

  const openStackblitz = () => {
    window.open("https://stackblitz.com/github/TheBacons/mindweave-file-architect", "_blank");
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
- Try the "Alternative File Selection" button which uses an older API that might work in your environment

### If npm install Fails
Try the following:
1. Check your Node.js version (should be v16 or higher): \`node -v\`
2. Clear npm cache: \`npm cache clean --force\`
3. Try: \`npm install --legacy-peer-deps\`

### Corporate Restrictions Workarounds
If you're in a corporate environment with strict security policies:
1. Run the app on a personal device if possible
2. Use the Mock Data option for testing and demos
3. Request temporary exceptions from your IT department
4. Try running a portable browser version that has fewer restrictions

## Future Updates
To pull future updates from your GitHub repository:

\`\`\`
git pull origin main
npm install
\`\`\`;
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

## Accessing Project Files in Corporate Environments

### Option 1: Direct GitHub Download
1. Go to https://github.com/TheBacons/mindweave-file-architect
2. Click the green "Code" button
3. Select "Download ZIP"
4. Extract the ZIP file to your desired location
5. Use these files as a reference for your project

### Option 2: GitHub Desktop
If your corporate environment allows GitHub Desktop:
1. Install GitHub Desktop
2. Clone https://github.com/TheBacons/mindweave-file-architect
3. Open the project in your preferred IDE

### Option 3: Individual File Download
If you can't access the repository or download the ZIP:
1. Navigate to individual files in the GitHub repository
2. Click on each file
3. Click the "Raw" button
4. Save the page as a file with the correct extension
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
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mb-4">
        <Button 
          onClick={handleDirectorySelect} 
          className="gap-2"
          disabled={isLoading}
        >
          <FolderOpen className="h-4 w-4" />
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
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mb-6">
        <Button
          onClick={openStackblitz}
          variant="outline"
          className="gap-2"
        >
          <Server className="h-4 w-4" />
          Open in Stackblitz
        </Button>
        
        <Button
          onClick={() => window.open("https://github.com/TheBacons/mindweave-file-architect", "_blank")}
          variant="outline"
          className="gap-2"
        >
          <Github className="h-4 w-4" />
          View on GitHub
        </Button>
      </div>
      
      <div className="mt-2 w-full max-w-md flex flex-col gap-3">
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
        Having trouble? Use Mock Data for testing the application features or try opening the project directly in Stackblitz.
      </p>
    </div>
  );
};

export default FileUploader;
