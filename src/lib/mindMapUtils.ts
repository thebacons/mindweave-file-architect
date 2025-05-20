
import * as d3 from "d3";
import { DirectoryNode } from "@/types/filesystem";
import { toast } from "sonner";

// Function to open file in explorer
export const openInExplorer = (path: string) => {
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

// Helper function to format bytes
export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Helper function to truncate text with improved visibility
export const truncateText = (text: string, maxLength = 25) => {
  if (!text) return "";
  
  // For very long filenames, show beginning and end with ellipsis in middle
  if (text.length > maxLength * 2) {
    return text.substring(0, maxLength) + "..." + text.substring(text.length - 10);
  }
  
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Create D3 visualization for the mind map
export const createMindMapVisualization = (
  svgRef: React.RefObject<SVGSVGElement>,
  data: DirectoryNode, 
  dimensions: { width: number; height: number }
) => {
  if (!svgRef.current) return;

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
    .attr("transform", `translate(150, 50)`); // Increased left margin for longer filenames

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

  // Add node labels with more visible text
  node.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d.children ? -12 : 12) // Position text farther from node
    .attr("text-anchor", d => d.children ? "end" : "start")
    .attr("font-size", "10px") // Slightly larger font size
    .attr("pointer-events", "none") // Prevent the text from capturing mouse events
    .text(d => truncateText(d.data.name, 25))
    .attr("fill", "currentColor")
    .attr("class", "node-text")
    .each(function(d) {
      // Add a background for better text visibility
      const bbox = this.getBBox();
      const padding = 2;
      d3.select(this.parentNode)
        .insert("rect", "text")
        .attr("x", bbox.x - padding)
        .attr("y", bbox.y - padding)
        .attr("width", bbox.width + (padding * 2))
        .attr("height", bbox.height + (padding * 2))
        .attr("fill", "rgba(30, 41, 59, 0.7)")
        .attr("rx", 3)
        .attr("opacity", 0.6);
    });

  // Add click handler for files/directories
  node.append("circle")
    .attr("r", 15) // Larger invisible circle for better click target
    .attr("fill", "transparent")
    .attr("class", "click-target")
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      openInExplorer(d.data.path);
    });

  // Enhanced tooltip with full filename, size, and path
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
  
  // Initial zoom to fit more content
  svg.call(zoom.transform as any, d3.zoomIdentity.translate(150, 50).scale(0.8));
};
