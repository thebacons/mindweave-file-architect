import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FolderOpen, Database, FileDown, ExternalLink } from "lucide-react";
import { scanFilesViaInput } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center p-10 border border-border/30 rounded-xl bg-card/30 backdrop-blur-sm shadow-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <FolderOpen className="h-16 w-16 text-primary mb-6 opacity-90" />
      </motion.div>
      
      <motion.h2 
        className="text-2xl font-medium mb-3" 
        variants={itemVariants}
      >
        Analyze Your File System
      </motion.h2>
      
      <motion.p 
        className="text-muted-foreground mb-8 text-center max-w-md"
        variants={itemVariants}
      >
        Choose a directory to scan and visualize your file structure as an interactive mindmap
      </motion.p>
      
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-4"
        variants={itemVariants}
      >
        <Button 
          onClick={handleDirectorySelect} 
          size="lg"
          className="gap-2 px-6 shadow-sm"
          disabled={isLoading}
        >
          <FolderOpen className="h-5 w-5" />
          {isLoading ? "Scanning..." : "Select Directory"}
        </Button>
        
        <Button
          onClick={handleUseMockData}
          variant="secondary"
          size="lg"
          className="gap-2 px-6"
        >
          <Database className="h-5 w-5" />
          Use Mock Data
        </Button>
      </motion.div>
      
      <motion.div 
        className="mt-8 w-full max-w-md flex flex-col gap-3"
        variants={itemVariants}
        transition={{ delay: 0.4 }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full gap-2"
            >
              <FileDown className="h-4 w-4" />
              Additional Resources
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-52">
            <DropdownMenuLabel>Resources</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={openStackblitz}>
                <ExternalLink className="h-4 w-4 mr-2" />
                <span>Open in Stackblitz</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.open("https://github.com/TheBacons/mindweave-file-architect", "_blank")}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2 fill-current">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub Repository</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
      
      <motion.p 
        className="text-xs text-muted-foreground mt-8 text-center opacity-70"
        variants={itemVariants}
        transition={{ delay: 0.5 }}
      >
        Your files are processed locally. No data is sent to any server.
      </motion.p>
    </motion.div>
  );
};

export default FileUploader;
