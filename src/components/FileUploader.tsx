
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
# Running FileArchitect Locally (Including GitHub Setup)

## Option 1: Quick Setup
1. Make sure you have Node.js installed (version 16 or higher)
2. Create a new directory for the project
3. Open your terminal in that directory
4. Run the following commands:

\`\`\`
npm create vite@latest file-architect -- --template react-ts
cd file-architect
npm install
\`\`\`

5. Replace the project files with the ones from this app (see the "How to Download Source Files" section below)
6. Install the required dependencies:

\`\`\`
npm install @radix-ui/react-* lucide-react sonner recharts tailwind-merge clsx class-variance-authority @tanstack/react-query react-router-dom
\`\`\`

7. Start the development server:

\`\`\`
npm run dev
\`\`\`

8. Open your browser and navigate to http://localhost:5173

## Option 2: Setup With GitHub (TheBacons Account)

### Creating the GitHub Repository
1. Log in to your GitHub account (TheBacons)
2. Click the "+" icon in the top-right corner and select "New repository"
3. Name your repository (e.g., "file-architect")
4. Choose whether to make it public or private
5. Click "Create repository"

### Setting Up the Project Locally
1. Create a new Vite React TypeScript project:

\`\`\`
npm create vite@latest file-architect -- --template react-ts
cd file-architect
\`\`\`

2. Initialize Git and connect to your GitHub repository:

\`\`\`
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TheBacons/file-architect.git
git push -u origin main
\`\`\`

3. Replace the project files with the ones from this app (see the "How to Download Source Files" section below)
4. Install dependencies:

\`\`\`
npm install @radix-ui/react-* lucide-react sonner recharts tailwind-merge clsx class-variance-authority @tanstack/react-query react-router-dom
\`\`\`

5. Commit and push your changes:

\`\`\`
git add .
git commit -m "Add FileArchitect application"
git push origin main
\`\`\`

6. Your project is now available at https://github.com/TheBacons/file-architect

### Downloading From Your GitHub Repository
1. To download from your GitHub repository in the future:

\`\`\`
git clone https://github.com/TheBacons/file-architect.git
cd file-architect
npm install
npm run dev
\`\`\`

## How to Download Source Files

There are several ways to get the source files from this app:

### Method 1: Download through Lovable Interface
1. In the Lovable interface, click on "Dev Mode" in the top left corner to see the code
2. Click on each file in the file explorer
3. Copy and paste the content into your local files with the same structure

### Method 2: Export Files from Lovable
1. Click on the project name in the top left corner
2. Go to "Settings"
3. Click on "Export project"
4. Download the ZIP file and extract it
5. Copy the contents into your local project

### Method 3: Connect to GitHub
1. Click on the GitHub icon in the top right corner of the Lovable interface
2. Follow the instructions to connect your GitHub account
3. Push the project to your GitHub repository
4. Clone the repository to your local machine
`;

    // Create a blob and download it
    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'github-setup-instructions.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("GitHub setup instructions downloaded successfully!");
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
          <Download className="h-4 w-4" />
          Download GitHub Setup Instructions
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
