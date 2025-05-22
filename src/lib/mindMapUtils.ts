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

// Calculate optimal tree size based on node count
const calculateOptimalTreeSize = (hierarchy: d3.HierarchyNode<DirectoryNode>) => {
  // Count total nodes
  const nodeCount = hierarchy.descendants().length;
  
  // Calculate tree depth
  const depth = hierarchy.height;
  
  // Find max text length at each level
  const maxLabelLength = hierarchy.descendants()
    .reduce((max, node) => Math.max(max, node.data.name.length), 0);
  
  // Base size adjusted for node count
  const baseHeight = Math.max(600, nodeCount * 15);
  const baseWidth = Math.max(800, maxLabelLength * 10, nodeCount * 25);
  
  // Adjust for depth - deeper trees need more width
  const widthMultiplier = Math.min(2.5, Math.max(1.5, depth / 4));
  
  return {
    height: baseHeight,
    width: baseWidth * widthMultiplier
  };
};

// Create D3 visualization for the mind map with progress reporting
export const createMindMapVisualization = (
  svgRef: React.RefObject<SVGSVGElement>,
  data: DirectoryNode, 
  dimensions: { width: number; height: number },
  progressCallback?: (progress: {
    percentage: number;
    currentFile: string;
    processedItems: number;
    totalItems: number;
    estimatedTimeRemaining: number | null;
  }) => void
) => {
  if (!svgRef.current) return;

  // Clear previous visualization
  d3.select(svgRef.current).selectAll("*").remove();

  const svg = d3.select(svgRef.current);
  
  const width = dimensions.width;
  const height = dimensions.height;

  // Create a hierarchical layout
  const hierarchy = d3.hierarchy(data);
  const totalNodes = hierarchy.descendants().length;
  let processedNodes = 0;
  
  // Track processing time for estimation
  const startTime = Date.now();
  let lastUpdateTime = startTime;
  
  // Function to estimate remaining time
  const estimateTimeRemaining = (processed: number, total: number): number | null => {
    if (processed === 0) return null;
    const elapsedMs = Date.now() - startTime;
    const msPerNode = elapsedMs / processed;
    const remainingNodes = total - processed;
    return (msPerNode * remainingNodes) / 1000; // seconds
  };
  
  // Report initial progress
  if (progressCallback) {
    progressCallback({
      percentage: 0,
      currentFile: "Preparing visualization...",
      processedItems: 0,
      totalItems: totalNodes,
      estimatedTimeRemaining: null
    });
  }
  
  // Calculate optimal size based on data complexity
  const optimalSize = calculateOptimalTreeSize(hierarchy);
  
  // Dynamic separation based on node count
  const nodeSeparationFactor = Math.min(4, Math.max(2.5, hierarchy.descendants().length / 100 + 2));
  
  // Update progress to 10% after calculating layout parameters
  if (progressCallback) {
    processedNodes += Math.floor(totalNodes * 0.1);
    progressCallback({
      percentage: 10,
      currentFile: "Calculating layout...",
      processedItems: processedNodes,
      totalItems: totalNodes,
      estimatedTimeRemaining: estimateTimeRemaining(processedNodes, totalNodes)
    });
  }
  
  // Increase vertical spacing between nodes for better readability
  const treeLayout = d3.tree<DirectoryNode>()
    .size([Math.min(height - 100, optimalSize.height), Math.min(width - 300, optimalSize.width)])
    .separation((a, b) => {
      // Enhanced separation function code here
      // Base separation is higher (3-4 units), plus we add more for nodes with longer names
      // Also consider the depth of the nodes - deeper nodes might need more separation
      const baseSpacing = nodeSeparationFactor;
      const depthFactor = Math.max(1, (a.depth + b.depth) / 10);
      const nameLengthFactor = Math.max(0, (a.data.name.length + b.data.name.length) / 40);
      const siblingFactor = a.parent === b.parent ? 1 : 1.2;
      
      return (baseSpacing + nameLengthFactor + depthFactor) * siblingFactor;
    }); 
  
  const root = treeLayout(hierarchy);
  
  // Update progress to 30% after tree layout
  if (progressCallback && Date.now() - lastUpdateTime > 100) {
    lastUpdateTime = Date.now();
    processedNodes += Math.floor(totalNodes * 0.2);
    progressCallback({
      percentage: 30,
      currentFile: "Creating node links...",
      processedItems: processedNodes,
      totalItems: totalNodes,
      estimatedTimeRemaining: estimateTimeRemaining(processedNodes, totalNodes)
    });
  }

  // Create a group for the entire visualization with zoom capability
  const g = svg.append("g")
    .attr("transform", `translate(250, 75)`); // Increased left margin for more space

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
    
  // Update progress to 50% after creating links
  if (progressCallback && Date.now() - lastUpdateTime > 100) {
    lastUpdateTime = Date.now();
    processedNodes += Math.floor(totalNodes * 0.2);
    progressCallback({
      percentage: 50,
      currentFile: "Creating node elements...",
      processedItems: processedNodes,
      totalItems: totalNodes,
      estimatedTimeRemaining: estimateTimeRemaining(processedNodes, totalNodes)
    });
  }

  // Add node groups with fixed positions
  const nodeGroups = g.selectAll(".node")
    .data(root.descendants())
    .join("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .attr("data-path", d => d.data.path);

  // Update progress to 60% after creating node groups
  if (progressCallback && Date.now() - lastUpdateTime > 100) {
    lastUpdateTime = Date.now();
    processedNodes += Math.floor(totalNodes * 0.1);
    progressCallback({
      percentage: 60,
      currentFile: "Adding node backgrounds...",
      processedItems: processedNodes,
      totalItems: totalNodes,
      estimatedTimeRemaining: estimateTimeRemaining(processedNodes, totalNodes)
    });
  }

  // Add background rectangles for better hover behavior with increased size
  nodeGroups.append("rect")
    .attr("class", "node-bg")
    .attr("x", d => d.children ? -180 : 10) // More space for directory names
    .attr("y", -20) // Increased height
    .attr("width", d => {
      // Dynamically size width based on text length
      const nameLength = d.data.name.length;
      return d.children ? Math.max(150, nameLength * 5) : Math.max(150, nameLength * 4);
    }) // Dynamic width for longer filenames
    .attr("height", 40) // Increased height for better click area
    .attr("fill", "transparent") // Transparent by default
    .attr("rx", 4); // Rounded corners
    
  // Update progress to 70% after creating node backgrounds
  if (progressCallback && Date.now() - lastUpdateTime > 100) {
    lastUpdateTime = Date.now();
    processedNodes += Math.floor(totalNodes * 0.1);
    progressCallback({
      percentage: 70,
      currentFile: "Adding node circles...",
      processedItems: processedNodes,
      totalItems: totalNodes,
      estimatedTimeRemaining: estimateTimeRemaining(processedNodes, totalNodes)
    });
  }

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
    
  // Update progress to 80% after creating node circles
  if (progressCallback && Date.now() - lastUpdateTime > 100) {
    lastUpdateTime = Date.now();
    processedNodes += Math.floor(totalNodes * 0.1);
    progressCallback({
      percentage: 80,
      currentFile: "Adding node labels...",
      processedItems: processedNodes,
      totalItems: totalNodes,
      estimatedTimeRemaining: estimateTimeRemaining(processedNodes, totalNodes)
    });
  }

  // More aggressive truncation based on depth and node density
  const calculateTruncateLength = (node: d3.HierarchyNode<DirectoryNode>) => {
    // Deeper nodes get shorter names
    const depthFactor = Math.max(10, 40 - node.depth * 5);
    // Adjust based on number of siblings
    const siblingCount = node.parent ? node.parent.children!.length : 1;
    const siblingFactor = Math.max(15, 35 - siblingCount * 1.5);
    
    return Math.min(depthFactor, siblingFactor);
  };

  // Add node labels with more stable positioning and improved spacing
  const labels = nodeGroups.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d.children ? -14 : 14) // Increased spacing from node circles
    .attr("text-anchor", d => d.children ? "end" : "start")
    .attr("font-size", "12px") // Slightly larger font
    .attr("pointer-events", "none") // Prevent the text from capturing mouse events
    .text(d => {
      // Dynamic truncation based on node density and depth
      const maxLength = calculateTruncateLength(d);
      return truncateText(d.data.name, maxLength);
    })
    .attr("fill", "currentColor")
    .attr("class", "node-text")
    .attr("dominant-baseline", "middle"); // Better vertical alignment
    
  // Update progress to 90% after adding labels
  if (progressCallback && Date.now() - lastUpdateTime > 100) {
    lastUpdateTime = Date.now();
    processedNodes += Math.floor(totalNodes * 0.1);
    progressCallback({
      percentage: 90,
      currentFile: "Adding text backgrounds...",
      processedItems: processedNodes,
      totalItems: totalNodes,
      estimatedTimeRemaining: estimateTimeRemaining(processedNodes, totalNodes)
    });
  }

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
  
  // Calculate initial zoom based on tree size and viewport
  const autoScale = Math.min(0.9, Math.max(0.4, 800 / optimalSize.width));
  
  // Initial zoom to fit content better
  svg.call(zoom.transform as any, d3.zoomIdentity
    .translate(250, 75)
    .scale(autoScale)); // Automatically calculate zoom level
    
  // Final progress update - complete
  if (progressCallback) {
    progressCallback({
      percentage: 100,
      currentFile: "Visualization complete",
      processedItems: totalNodes,
      totalItems: totalNodes,
      estimatedTimeRemaining: 0
    });
  }
};
