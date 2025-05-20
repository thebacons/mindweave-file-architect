
import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import MindMap from "@/components/MindMap";
import DirectoryStats from "@/components/DirectoryStats";
import DuplicatesTable from "@/components/DuplicatesTable";
import RecommendationCard from "@/components/RecommendationCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import { AnalysisResult, DirectoryNode } from "@/types/filesystem";
import { scanFileSystem } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderTree, FileSearch, ArrowLeft } from "lucide-react";
import { mockFileSystemData } from "@/lib/mockData";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilesLoaded = async (directoryEntry: FileSystemDirectoryEntry) => {
    setIsLoading(true);
    try {
      const result = await scanFileSystem(directoryEntry);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error analyzing files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseFilesArray = (result: AnalysisResult) => {
    setAnalysisResult(result);
  };

  const handleUseMockData = () => {
    setIsLoading(true);
    // Simulate a delay for the loading experience
    setTimeout(() => {
      const mockData = mockFileSystemData();
      setAnalysisResult(mockData);
      setIsLoading(false);
    }, 1500);
  };

  const handleBackToFileSelect = () => {
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">FileSystem Mindmap</h1>
          </div>
          <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">AI File System Analyzer</span>
          </div>
        </div>
      </header>

      <LoadingOverlay 
        isLoading={isLoading}
        message="Analyzing your file system..." 
      />
      
      <main className="container py-6 flex-1">
        {!analysisResult ? (
          <div className="max-w-xl mx-auto mt-10">
            <FileUploader 
              onFilesLoaded={handleFilesLoaded}
              onUseMockData={handleUseMockData}
              onUseFilesArray={handleUseFilesArray}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBackToFileSelect}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to File Selection
              </Button>
            </div>
            
            {/* Stats Overview */}
            <DirectoryStats stats={analysisResult.stats} />
            
            {/* Tabs for different views */}
            <Tabs defaultValue="mindmap" className="w-full">
              <TabsList>
                <TabsTrigger value="mindmap">File System Mindmap</TabsTrigger>
                <TabsTrigger value="duplicates">Duplicate Files</TabsTrigger>
                <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="mindmap" className="mt-4">
                <Card className="w-full h-[600px]">
                  <CardContent className="p-6 h-full">
                    <MindMap data={analysisResult.rootNode} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="duplicates" className="mt-4">
                <DuplicatesTable duplicates={analysisResult.duplicates} />
              </TabsContent>
              
              <TabsContent value="recommendations" className="mt-4">
                <RecommendationCard 
                  recommendations={analysisResult.recommendations} 
                  duplicates={analysisResult.duplicates}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      
      <footer className="border-t border-border py-4">
        <div className="container text-center text-sm text-muted-foreground">
          <p>AI File System Analyzer - Local Privacy-First App</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
