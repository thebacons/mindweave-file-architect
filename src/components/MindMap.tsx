
import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";
import { DirectoryNode } from "@/types/filesystem";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
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

  // Function to open file in explorer
  const openInExplorer = (path: string) => {
    // Check if the file is from a mock dataset
    if (path.startsWith('/mock') || !path) {
      toast.info("This is a mock file path. In a real environment, this would open your file explorer.");
      return;
    }

    try {
      // Try to use the File System Access API if available
      if ('showDirectoryPicker' in window) {
        toast.info(`Attempting to navigate to: ${path}`);
        // Unfortunately, we can't directly navigate to a specific path due to security restrictions
        // We can only show a message explaining what would happen in a desktop app
        toast.info("In a desktop application, this would open your file explorer to this path");
      } else {
        toast.warning("Your browser doesn't support file system navigation");
      }
    } catch (error) {
      console.error("Error opening file explorer:", error);
      toast.error("Unable to open file explorer due to browser restrictions");
    }
  };

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    
    const width = dimensions.width;
    const height = dimensions.height;

    // Create a hierarchical layout
    const hierarchy = d3.hierarchy(data);
    
    const treeLayout = d3.tree<DirectoryNode>()
      .size([height - 100, width - 300]); // Swap dimensions for horizontal tree
    
    const root = treeLayout(hierarchy);

    // Create a group for the entire visualization with zoom capability
    const g = svg.append("g")
      .attr("transform", `translate(100, 50)`);

    // Add links between nodes
    g.selectAll(".link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x))
      .attr("fill", "none")
      .attr("stroke", "#6366f1")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.6);

    // Add node groups with fixed positions
    const node = g.selectAll(".node")
      .data(root.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .attr("data-path", d => d.data.path);

    // Add node circles with different colors based on node type
    node.append("circle")
      .attr("r", d => d.data.isDirectory ? 8 : 5)
      .attr("fill", d => {
        if (d.data.isDuplicate) return "#ef4444"; // Red for duplicates
        if (d.data.isDirectory) return "#8b5cf6"; // Purple for directories
        return "#3b82f6"; // Blue for files
      })
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 1.5);

    // Truncate text if too long (to prevent overlap)
    const truncateText = (text: string, maxLength = 20) => {
      return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    // Add node labels with smaller font size and truncation
    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -10 : 10)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .attr("font-size", "10px") // Smaller font size
      .attr("pointer-events", "none") // Prevent the text from capturing mouse events
      .text(d => truncateText(d.data.name))
      .attr("fill", "currentColor")
      .attr("class", "node-text");

    // Add click handler for files/directories
    node.append("circle")
      .attr("r", 15) // Larger invisible circle for better click target
      .attr("fill", "transparent")
      .attr("class", "click-target")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (!d.data.isDirectory) {
          openInExplorer(d.data.path);
        }
      });

    // Add tooltip via SVG title element
    node.append("title")
      .text(d => {
        const name = d.data.name;
        const size = d.data.size ? ` (${formatBytes(d.data.size)})` : '';
        const pathInfo = d.data.path ? `\nPath: ${d.data.path}` : '';
        const typeInfo = d.data.type ? `\nType: ${d.data.type}` : '';
        return `${name}${size}${pathInfo}${typeInfo}`;
      });

    // Add zoom capabilities with smoother zooming
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

  }, [data, dimensions]);
  
  // Helper function to format bytes
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (!data) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">Select a directory to visualize</p>
      </Card>
    );
  }

  return (
    <div className={cn("w-full h-full min-h-[500px] relative")}>
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="w-full h-full"
      ></svg>
      <div className="absolute bottom-4 right-4 bg-secondary p-2 rounded text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
          <span>Directory</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
          <span>File</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
          <span>Duplicate</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="italic text-muted-foreground text-[10px]">Hover over nodes to see full names</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="italic text-muted-foreground text-[10px]">Click on files to open in explorer</span>
        </div>
      </div>
    </div>
  );
};

export default MindMap;
