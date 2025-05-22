
import { useState, useEffect, useRef } from "react";
import * as d3 from "d3"; // Add this import to fix the d3 reference errors
import { DirectoryNode } from "@/types/filesystem";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import MindMapLegend from "./mindmap/MindMapLegend";
import MindMapEmpty from "./mindmap/MindMapEmpty";
import { createMindMapVisualization, exportMindMapAsSVG, exportMindMapAsJPG } from "@/lib/mindMapUtils";
import { Button } from "@/components/ui/button";
import { Download, FileDown, ZoomIn, ZoomOut, Minimize } from "lucide-react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Enhanced resize handler for more responsive dimensions
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const handleResize = () => {
      if (containerRef.current) {
        // Get the actual container size
        const container = containerRef.current;
        const { width, height } = container.getBoundingClientRect();
        
        // Set minimum dimensions to ensure good visualization
        setDimensions({
          width: Math.max(800, width - 20), // Slight padding
          height: Math.max(500, height - 20), // Slight padding
        });
      }
    };

    // Initial sizing
    handleResize();
    
    // Add resize listener
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    window.addEventListener("resize", handleResize);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Recreate visualization when data or dimensions change
  useEffect(() => {
    if (!data || !svgRef.current) return;
    createMindMapVisualization(svgRef, data, dimensions);
  }, [data, dimensions]);
  
  // SVG Export handler
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

  // JPG Export handler
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
  
  // FreeMind export handler
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
  
  // Custom zoom controls
  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 3]);
    svg.transition().call(zoom.scaleBy as any, 1.2);
    setZoomLevel(prev => Math.min(3, prev * 1.2));
  };
  
  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 3]);
    svg.transition().call(zoom.scaleBy as any, 0.8);
    setZoomLevel(prev => Math.max(0.1, prev * 0.8));
  };
  
  const handleResetZoom = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 3]);
    svg.transition().call(zoom.transform as any, d3.zoomIdentity.translate(250, 75).scale(0.6));
    setZoomLevel(0.6);
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
    <div className={cn("w-full h-full min-h-[500px] relative")} ref={containerRef}>
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <div className="bg-background/80 backdrop-blur-sm border border-border/30 rounded-md p-1 flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleZoomIn}
            className="h-8 w-8"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleZoomOut}
            className="h-8 w-8"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleResetZoom}
            className="h-8 w-8"
            title="Reset Zoom"
          >
            <Minimize className="h-4 w-4" />
          </Button>
        </div>
        
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
