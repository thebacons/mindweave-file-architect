
import * as d3 from "d3";
import { DirectoryNode } from "@/types/filesystem";
import { toast } from "sonner";

// Function to open file in explorer with improved experience
export const openInExplorer = (path: string) => {
  // Check if the file is from a mock dataset
  if (path.startsWith('/mock') || !path) {
    toast.info("This is a mock file path. In a real environment, this would open your file explorer.");
    return;
  }

  try {
    // Try to use the File System Access API if available
    if ('showDirectoryPicker' in window) {
      toast.info(`Opening: ${path}`);
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
export const truncateText = (text: string, maxLength = 35) => {
  if (!text) return "";
  
  // For very long filenames, show more of beginning and end
  if (text.length > maxLength * 2) {
    return text.substring(0, maxLength) + "..." + text.substring(text.length - 15);
  }
  
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Export mind map as SVG
export const exportMindMapAsSVG = (
  svgRef: React.RefObject<SVGSVGElement>,
  filename: string = "mindmap"
) => {
  if (!svgRef.current) return;
  
  // Clone the SVG to avoid modifying the original
  const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
  
  // Set white background for export
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", "100%");
  rect.setAttribute("height", "100%");
  rect.setAttribute("fill", "white");
  clone.insertBefore(rect, clone.firstChild);
  
  // Get serialized SVG
  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  
  // Create download link
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export mind map as JPG
export const exportMindMapAsJPG = (
  svgRef: React.RefObject<SVGSVGElement>,
  filename: string = "mindmap"
) => {
  if (!svgRef.current) return;
  
  // Clone the SVG to avoid modifying the original
  const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
  
  // Set white background for export
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", "100%");
  rect.setAttribute("height", "100%");
  rect.setAttribute("fill", "white");
  clone.insertBefore(rect, clone.firstChild);
  
  // Get serialized SVG
  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  
  // Create an image and set the SVG as its source
  const img = new Image();
  img.onload = () => {
    // Create a canvas with the same dimensions as the SVG
    const canvas = document.createElement("canvas");
    const width = svgRef.current?.width.baseVal.value || 800;
    const height = svgRef.current?.height.baseVal.value || 600;
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw the image on the canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert canvas to data URL and download
      const jpgURL = canvas.toDataURL("image/jpeg", 0.9);
      const link = document.createElement("a");
      link.href = jpgURL;
      link.download = `${filename}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Clean up
    URL.revokeObjectURL(url);
  };
  
  img.src = url;
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
  
  // Increase vertical spacing between nodes for better readability
  const treeLayout = d3.tree<DirectoryNode>()
    .size([height - 150, width - 400]) // Increased spacing horizontally and vertically
    .separation((a, b) => {
      // Custom separation function to add more space between nodes
      // Base separation is 2 units, but we add more for nodes with longer names
      const baseSpacing = 2;
      const additionalSpacing = Math.max(0, (a.data.name.length + b.data.name.length) / 60);
      return baseSpacing + additionalSpacing;
    }); 
  
  const root = treeLayout(hierarchy);

  // Create a group for the entire visualization with zoom capability
  const g = svg.append("g")
    .attr("transform", `translate(220, 75)`); // Increased margins for better spacing

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
  const nodeGroups = g.selectAll(".node")
    .data(root.descendants())
    .join("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .attr("data-path", d => d.data.path);

  // Add background rectangles for better hover behavior with increased size
  nodeGroups.append("rect")
    .attr("class", "node-bg")
    .attr("x", d => d.children ? -160 : 10) // Position based on whether node has children
    .attr("y", -20) // Increased height
    .attr("width", 150) // Increased width for longer filenames
    .attr("height", 40) // Increased height for better click area
    .attr("fill", "transparent") // Transparent by default
    .attr("rx", 4); // Rounded corners

  // Add node circles with different colors based on node type
  nodeGroups.append("circle")
    .attr("r", d => d.data.isDirectory ? 8 : 5)
    .attr("fill", d => {
      if (d.data.isDuplicate) return "#ef4444"; // Red for duplicates
      if (d.data.isDirectory) return "#8b5cf6"; // Purple for directories
      return "#3b82f6"; // Blue for files
    })
    .attr("stroke", "#1e293b")
    .attr("stroke-width", 1.5);

  // Add node labels with more stable positioning and improved spacing
  const labels = nodeGroups.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d.children ? -12 : 12)
    .attr("text-anchor", d => d.children ? "end" : "start")
    .attr("font-size", "12px") // Slightly larger font
    .attr("pointer-events", "none") // Prevent the text from capturing mouse events
    .text(d => truncateText(d.data.name, 30)) // Shorter text to prevent overlap
    .attr("fill", "currentColor")
    .attr("class", "node-text")
    .attr("dominant-baseline", "middle"); // Better vertical alignment

  // Add stable text backgrounds that don't change on hover
  labels.each(function(d) {
    // Add a background for better text visibility
    const bbox = this.getBBox();
    const padding = 4; // Increased padding
    d3.select(this.parentNode)
      .insert("rect", "text")
      .attr("class", "text-bg")
      .attr("x", bbox.x - padding)
      .attr("y", bbox.y - padding)
      .attr("width", bbox.width + (padding * 2))
      .attr("height", bbox.height + (padding * 2))
      .attr("fill", "rgba(30, 41, 59, 0.7)")
      .attr("rx", 3)
      .attr("opacity", 0.7);
  });

  // Add hover effects without causing text jumps
  nodeGroups
    .on("mouseover", function() {
      d3.select(this).select(".node-bg")
        .attr("fill", "rgba(30, 41, 59, 0.2)");
      
      // Increase circle size slightly
      d3.select(this).select("circle")
        .transition()
        .duration(100)
        .attr("r", function(d: any) {
          return d.data.isDirectory ? 9 : 6;
        });
    })
    .on("mouseout", function() {
      d3.select(this).select(".node-bg")
        .attr("fill", "transparent");
      
      // Restore circle size
      d3.select(this).select("circle")
        .transition()
        .duration(100)
        .attr("r", function(d: any) {
          return d.data.isDirectory ? 8 : 5;
        });
    })
    // Add click handler for opening in file explorer
    .on("click", (event, d: any) => {
      openInExplorer(d.data.path);
    })
    .style("cursor", "pointer");

  // Enhanced tooltip with full filename, size, and path
  nodeGroups.append("title")
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
  svg.call(zoom.transform as any, d3.zoomIdentity.translate(220, 75).scale(0.7)); // More zoomed out initially
};

