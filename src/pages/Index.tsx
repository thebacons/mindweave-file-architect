
import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import MindMap from "@/components/MindMap";
import DirectoryStats from "@/components/DirectoryStats";
import DuplicatesTable from "@/components/DuplicatesTable";
import RecommendationCard from "@/components/RecommendationCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import { AnalysisResult } from "@/types/filesystem";
import { scanFileSystem, scanFilesViaInput } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderTree, FileSearch, ArrowLeft, ExternalLink, Menu } from "lucide-react";
import { mockFileSystemData } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useProgress } from "@/contexts/ProgressContext";

const Index = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { updateProgress, resetProgress } = useProgress();

  const handleFilesLoaded = async (directoryEntry: FileSystemDirectoryEntry) => {
    setIsLoading(true);
    resetProgress();
    updateProgress({ isProcessing: true, stage: "scanning" });
    
    try {
      const result = await scanFileSystem(directoryEntry, (progress) => {
        updateProgress({
          isProcessing: true,
          stage: progress.stage,
          percentage: progress.percentage,
          currentFile: progress.currentFile,
          processedItems: progress.processedItems,
          totalItems: progress.totalItems,
          estimatedTimeRemaining: progress.estimatedTimeRemaining
        });
      });
      
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error analyzing files:", error);
      updateProgress({ isProcessing: false, stage: "idle" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesArrayLoaded = async (files: FileList) => {
    setIsLoading(true);
    resetProgress();
    updateProgress({ isProcessing: true, stage: "scanning" });
    
    try {
      const result = await scanFilesViaInput(files, (progress) => {
        updateProgress({
          isProcessing: true,
          stage: progress.stage,
          percentage: progress.percentage,
          currentFile: progress.currentFile,
          processedItems: progress.processedItems,
          totalItems: progress.totalItems,
          estimatedTimeRemaining: progress.estimatedTimeRemaining
        });
      });
      
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error analyzing files:", error);
      updateProgress({ isProcessing: false, stage: "idle" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseMockData = () => {
    setIsLoading(true);
    resetProgress();
    
    // Simulate progress updates for mock data
    updateProgress({ 
      isProcessing: true, 
      stage: "scanning", 
      percentage: 0,
      currentFile: "Processing mock data...",
      processedItems: 0,
      totalItems: 100
    });
    
    // Create a mock progress simulation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress <= 95) {
        updateProgress({ 
          percentage: progress,
          currentFile: `Processing mock file ${progress}...`,
          processedItems: Math.floor(progress),
          totalItems: 100,
          estimatedTimeRemaining: (100 - progress) / 10 // 10% per 100ms = estimate in seconds
        });
      } else {
        clearInterval(interval);
      }
    }, 50);
    
    // Simulate a delay for the loading experience
    setTimeout(() => {
      const mockData = mockFileSystemData();
      setAnalysisResult(mockData);
      setIsLoading(false);
      clearInterval(interval);
      
      // Final update before visualization takes over
      updateProgress({ 
        stage: "analyzing",
        percentage: 100,
        currentFile: "Mock data processed",
        processedItems: 100,
        totalItems: 100,
        estimatedTimeRemaining: 0
      });
    }, 1000);
  };

  const handleBackToFileSelect = () => {
    setAnalysisResult(null);
    resetProgress();
  };

  const openStackblitz = () => {
    window.open("https://stackblitz.com/github/TheBacons/mindweave-file-architect", "_blank");
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/30 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="container flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-medium">FileSystem Mindmap</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              AI File System Analyzer
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={openStackblitz}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span>Open in Stackblitz</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    onClick={() => window.open("https://github.com/TheBacons/mindweave-file-architect", "_blank")}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2 fill-current">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>GitHub Repository</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => {
                    const instructions = document.createElement('a');
                    instructions.href = "data:text/plain;charset=utf-8," + encodeURIComponent(`
# Cloning and Running FileArchitect From GitHub

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
`);
                    instructions.download = 'github-clone-instructions.md';
                    document.body.appendChild(instructions);
                    instructions.click();
                    document.body.removeChild(instructions);
                  }}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span>Download Instructions</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const structure = document.createElement('a');
                    structure.href = "data:text/plain;charset=utf-8," + encodeURIComponent(`
# Project Structure
This is the structure of the FileArchitect project.

\`\`\`
src/
├── components/
│   ├── DirectoryStats.tsx
│   ├── DuplicatesTable.tsx
│   ├── FileUploader.tsx
│   ├── LoadingOverlay.tsx
│   ├── MindMap.tsx
│   ├── RecommendationCard.tsx
\`\`\`
`);
                    structure.download = 'project-structure.md';
                    document.body.appendChild(structure);
                    structure.click();
                    document.body.removeChild(structure);
                  }}>
                    <FileSearch className="h-4 w-4 mr-2" />
                    <span>Project Structure</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <LoadingOverlay 
        isLoading={isLoading}
        message="Analyzing your file system..." 
      />
      
      <main className="container py-8 flex-1 flex flex-col">
        {!analysisResult ? (
          <motion.div 
            className="max-w-xl mx-auto mt-10 w-full"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <FileUploader 
              onFilesLoaded={handleFilesLoaded}
              onUseMockData={handleUseMockData}
              onUseFilesArray={handleFilesArrayLoaded}
            />
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back Button - Clean and Minimal */}
            <div className="flex justify-between items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToFileSelect}
                className="gap-2 hover:bg-background hover:text-primary transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            
            {/* Stats Overview with animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <DirectoryStats stats={analysisResult.stats} />
            </motion.div>
            
            {/* Tabs for different views with subtle animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Tabs defaultValue="mindmap" className="w-full">
                <TabsList className="mb-2">
                  <TabsTrigger value="mindmap">File System Mindmap</TabsTrigger>
                  <TabsTrigger value="duplicates">Duplicate Files</TabsTrigger>
                  <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="mindmap" className="mt-2">
                  <Card className="w-full h-[600px] border-border/30 shadow-sm">
                    <CardContent className="p-4 h-full">
                      <MindMap data={analysisResult.rootNode} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="duplicates" className="mt-2">
                  <DuplicatesTable duplicates={analysisResult.duplicates} />
                </TabsContent>
                
                <TabsContent value="recommendations" className="mt-2">
                  <RecommendationCard 
                    recommendations={analysisResult.recommendations} 
                    duplicates={analysisResult.duplicates}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        )}
      </main>
      
      <footer className="border-t border-border/20 py-3 bg-background/50 backdrop-blur-sm">
        <div className="container text-center text-xs text-muted-foreground">
          <p>mindweave-file-architect © TheBacons-AI {new Date().getFullYear()} - Developed by Colin Bacon</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
