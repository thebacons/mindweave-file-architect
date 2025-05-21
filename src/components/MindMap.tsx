
import { useState, useEffect, useRef } from "react";
import { DirectoryNode } from "@/types/filesystem";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import MindMapLegend from "./mindmap/MindMapLegend";
import MindMapEmpty from "./mindmap/MindMapEmpty";
import { createMindMapVisualization, exportMindMapAsSVG, exportMindMapAsJPG } from "@/lib/mindMapUtils";
import { Button } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface MindMapProps {
  data: DirectoryNode | null;
}

const MindMap = ({ data }: MindMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    createMindMapVisualization(svgRef, data, dimensions);
  }, [data, dimensions]);
  
  const handleExportSVG = () => {
    if (!svgRef.current || !data) return;
    
    try {
      const fileName = `mindmap-${new Date().toISOString().split("T")[0]}`;
      exportMindMapAsSVG(svgRef, fileName);
      toast.success("SVG file downloaded successfully");
    } catch (error) {
      console.error("Error exporting SVG:", error);
      toast.error("Failed to export as SVG");
    }
  };

  const handleExportJPG = () => {
    if (!svgRef.current || !data) return;
    
    try {
      const fileName = `mindmap-${new Date().toISOString().split("T")[0]}`;
      exportMindMapAsJPG(svgRef, fileName);
      toast.success("JPG file downloaded successfully");
    } catch (error) {
      console.error("Error exporting JPG:", error);
      toast.error("Failed to export as JPG");
    }
  };
  
  const handleExportAsFreemind = () => {
    if (!data) return;
    
    try {
      // Convert to FreeMind format
      const xml = convertToFreemindXML(data);
      const blob = new Blob([xml], { type: "text/xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mindmap-${new Date().toISOString().split("T")[0]}.mm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("FreeMind file downloaded successfully");
    } catch (error) {
      console.error("Error exporting as FreeMind:", error);
      toast.error("Failed to export as FreeMind format");
    }
  };
  
  // Simple function to convert data to FreeMind XML format
  const convertToFreemindXML = (rootNode: DirectoryNode): string => {
    const convertNodeToXML = (node: DirectoryNode, indent: string = ""): string => {
      const nodeName = node.name.replace(/[<>&"']/g, (c) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '"': return '&quot;';
          case "'": return '&apos;';
          default: return c;
        }
      });
      
      const attributes = [
        `TEXT="${nodeName}"`,
        node.isDirectory ? `FOLDED="true"` : ''
      ].filter(Boolean).join(' ');
      
      if (!node.children || node.children.length === 0) {
        return `${indent}<node ${attributes}/>`;
      }
      
      return `${indent}<node ${attributes}>\n${
        node.children.map(child => convertNodeToXML(child, indent + "  ")).join("\n")
      }\n${indent}</node>`;
    };
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<map version="1.0.1">\n${
      convertNodeToXML(rootNode, "  ")
    }\n</map>`;
    
    return xml;
  };
  
  if (!data) {
    return <MindMapEmpty />;
  }

  return (
    <div className={cn("w-full h-full min-h-[500px] relative")}>
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export Map
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Download Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleExportSVG}>
                <FileDown className="h-4 w-4 mr-2" />
                <span>Download as SVG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJPG}>
                <FileDown className="h-4 w-4 mr-2" />
                <span>Download as JPG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportAsFreemind}>
                <FileDown className="h-4 w-4 mr-2" />
                <span>Export as FreeMind (.mm)</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="w-full h-full"
      ></svg>
      <MindMapLegend />
    </div>
  );
};

export default MindMap;
