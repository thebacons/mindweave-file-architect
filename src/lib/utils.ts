import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AnalysisResult, DirectoryNode, DuplicateGroup, FileStats, Recommendation } from "@/types/filesystem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export async function hashFile(file: File): Promise<string> {
  // A simple hash function for demo purposes
  // In a real app, we would use a proper hash function like SHA-256
  try {
    const buffer = await file.arrayBuffer();
    
    // Include the file name and size in the hash to distinguish
    // files with the same content but different names
    const fullFileName = file.name;
    const fileSize = file.size;
    
    // Create a unique identifier by combining content hash, name, and size
    const contentHashArray = Array.from(new Uint8Array(buffer))
      .slice(0, 1024) // Just use first 1KB for faster hashing
      .map(b => b.toString(16).padStart(2, '0'));
    
    const contentHash = contentHashArray.join('');
    const uniqueId = `${contentHash}_${fullFileName}_${fileSize}`;
    
    return uniqueId;
  } catch (error) {
    console.error("Error hashing file:", error);
    return "";
  }
}

export function generateFileRecommendations(result: AnalysisResult): Recommendation[] {
  const { stats, duplicates } = result;
  const recommendations: Recommendation[] = [];

  // Check for duplicates
  if (duplicates.length > 0) {
    recommendations.push({
      title: "Clean up duplicate files",
      description: `Found ${stats.duplicateFiles} duplicate files that waste ${formatBytes(duplicates.reduce((acc, dup) => acc + (dup.size * (dup.paths.length - 1)), 0))} of storage.`,
      suggestion: "Consider using a dedicated duplicate file cleaner to safely remove redundant files."
    });
  }

  // Recommend organization based on file types
  if (stats.fileTypes.size > 5) {
    recommendations.push({
      title: "Organize by file types",
      description: `You have ${stats.fileTypes.size} different file types. Consider organizing them into categories.`,
      suggestion: "Images → /Images\nDocuments → /Documents\nVideos → /Videos"
    });
  }

  // Deep directory structure
  if (stats.maxDepth > 5) {
    recommendations.push({
      title: "Simplify folder structure",
      description: "Your folder structure is quite deep (max depth: " + stats.maxDepth + "). Consider flattening it for easier navigation.",
      suggestion: "Try to aim for a maximum depth of 3-4 levels for frequently accessed files."
    });
  }

  // Large directories
  if (stats.totalFiles > 1000) {
    recommendations.push({
      title: "Break down large directories",
      description: `You have ${stats.totalFiles} files in total. Consider breaking down directories with many files.`,
      suggestion: "Directories with more than 100 files should be split into subcategories."
    });
  }

  return recommendations;
}

// Updated to include progress reporting
export async function scanFileSystem(
  directoryEntry: FileSystemDirectoryEntry | any,
  progressCallback?: (progress: {
    stage: "scanning" | "analyzing" | "visualizing";
    percentage: number;
    currentFile: string;
    processedItems: number;
    totalItems: number;
    estimatedTimeRemaining: number | null;
  }) => void
): Promise<AnalysisResult> {
  // If the directoryEntry is actually an AnalysisResult (from scanFilesViaInput)
  if (directoryEntry && 'rootNode' in directoryEntry) {
    return directoryEntry as AnalysisResult;
  }

  const fileHashes = new Map<string, DuplicateGroup>();
  const fileTypes = new Set<string>();
  let totalFiles = 0;
  let totalDirs = 0;
  let totalSize = 0;
  let totalDepth = 0;
  let maxDepth = 0;
  let processedItems = 0;
  
  // First count total items for progress tracking
  let estimatedTotalItems = 0;
  
  // Start timing for estimating remaining time
  const startTime = Date.now();
  let lastProgressUpdate = startTime;
  
  // Function to estimate time remaining
  const estimateTimeRemaining = (processed: number, total: number): number | null => {
    if (processed === 0) return null;
    
    const elapsedMs = Date.now() - startTime;
    const msPerItem = elapsedMs / processed;
    const remainingItems = total - processed;
    const remainingMs = msPerItem * remainingItems;
    
    return remainingMs / 1000; // Return seconds
  };
  
  // Preliminary count to get a rough estimate of total items
  async function countItems(entry: FileSystemDirectoryEntry): Promise<number> {
    return new Promise<number>(async (resolve) => {
      const reader = entry.createReader();
      let count = 1; // Count the directory itself
      
      reader.readEntries(async (entries) => {
        const subCounts = await Promise.all(entries.map(async (subEntry) => {
          if (subEntry.isDirectory) {
            // @ts-ignore - TypeScript doesn't have proper types for this API
            return countItems(subEntry);
          } else {
            return 1; // Count the file
          }
        }));
        
        count += subCounts.reduce((acc, c) => acc + c, 0);
        resolve(count);
      });
    });
  }
  
  try {
    // Get a rough estimate of total items
    estimatedTotalItems = await countItems(directoryEntry);
    
    // Notify of analysis start
    if (progressCallback) {
      progressCallback({
        stage: "scanning",
        percentage: 0,
        currentFile: "Starting analysis...",
        processedItems: 0,
        totalItems: estimatedTotalItems,
        estimatedTimeRemaining: null
      });
    }
  } catch (error) {
    console.error("Error estimating directory size:", error);
    estimatedTotalItems = 100; // Fallback estimate
  }
  
  // Function to scan a directory recursively with progress reporting
  async function scanDirectory(entry: FileSystemDirectoryEntry, path: string, depth: number): Promise<DirectoryNode> {
    return new Promise<DirectoryNode>((resolve) => {
      const reader = entry.createReader();
      const node: DirectoryNode = {
        name: entry.name,
        path: path + '/' + entry.name,
        isDirectory: true,
        children: []
      };
      
      totalDirs++;
      maxDepth = Math.max(maxDepth, depth);
      totalDepth += depth;
      processedItems++;
      
      // Report progress
      if (progressCallback && Date.now() - lastProgressUpdate > 100) { // Throttle updates
        lastProgressUpdate = Date.now();
        const percentage = (processedItems / Math.max(1, estimatedTotalItems)) * 100;
        progressCallback({
          stage: "scanning",
          percentage: Math.min(95, percentage), // Cap at 95% to show we're still finalizing
          currentFile: entry.name,
          processedItems,
          totalItems: estimatedTotalItems,
          estimatedTimeRemaining: estimateTimeRemaining(processedItems, estimatedTotalItems)
        });
      }
      
      function readEntries() {
        reader.readEntries(async (entries) => {
          if (entries.length > 0) {
            const promises = entries.map(async (childEntry) => {
              if (childEntry.isDirectory) {
                // @ts-ignore - TypeScript doesn't have proper types for this API
                return scanDirectory(childEntry, node.path, depth + 1);
              } else {
                // @ts-ignore - TypeScript doesn't have proper types for this API
                const fileEntry = childEntry as FileSystemFileEntry;
                return new Promise<DirectoryNode>((resolveFile) => {
                  fileEntry.file(async (file) => {
                    const extension = getFileExtension(file.name);
                    fileTypes.add(extension);
                    totalFiles++;
                    totalSize += file.size;
                    processedItems++;
                    
                    // Report progress
                    if (progressCallback && Date.now() - lastProgressUpdate > 100) { // Throttle updates
                      lastProgressUpdate = Date.now();
                      const percentage = (processedItems / Math.max(1, estimatedTotalItems)) * 100;
                      progressCallback({
                        stage: "scanning",
                        percentage: Math.min(95, percentage),
                        currentFile: file.name,
                        processedItems,
                        totalItems: estimatedTotalItems,
                        estimatedTimeRemaining: estimateTimeRemaining(processedItems, estimatedTotalItems)
                      });
                    }
                    
                    const hash = await hashFile(file);
                    const fileNode: DirectoryNode = {
                      name: file.name,
                      path: node.path + '/' + file.name,
                      isDirectory: false,
                      size: file.size,
                      type: extension,
                      hash
                    };
                    
                    // Check for duplicates - but now using the more robust hash
                    if (hash) {
                      if (fileHashes.has(hash)) {
                        const group = fileHashes.get(hash)!;
                        group.paths.push(fileNode.path);
                        group.fullFilenames.push(file.name);
                        fileNode.isDuplicate = true;
                      } else {
                        fileHashes.set(hash, {
                          hash,
                          fileName: file.name,
                          size: file.size,
                          paths: [fileNode.path],
                          fullFilenames: [file.name]
                        });
                      }
                    }
                    
                    resolveFile(fileNode);
                  });
                });
              }
            });
            
            const childNodes = await Promise.all(promises);
            node.children?.push(...childNodes);
            readEntries(); // Continue reading if there are more entries
          } else {
            resolve(node);
          }
        });
      }
      
      readEntries();
    });
  }
  
  // Start the scanning process
  const rootNode = await scanDirectory(directoryEntry, "", 0);
  
  // Notify of analysis phase
  if (progressCallback) {
    progressCallback({
      stage: "analyzing",
      percentage: 97,
      currentFile: "Analyzing data and generating recommendations...",
      processedItems,
      totalItems: estimatedTotalItems,
      estimatedTimeRemaining: 2 // Assume analysis takes about 2 seconds
    });
  }
  
  const avgDepth = totalDepth / Math.max(1, totalDirs);
  
  // Filter duplicate groups to only include those with more than one file
  const duplicates = Array.from(fileHashes.values())
    .filter(group => group.paths.length > 1);
  
  const stats: FileStats = {
    totalSize,
    totalFiles,
    totalDirs,
    duplicateFiles: duplicates.reduce((acc, group) => acc + group.paths.length, 0),
    fileTypes,
    avgDepth,
    maxDepth
  };
  
  const recommendations = generateFileRecommendations({ 
    rootNode, 
    stats, 
    duplicates,
    recommendations: [] 
  });
  
  // Complete the progress
  if (progressCallback) {
    progressCallback({
      stage: "visualizing",
      percentage: 100,
      currentFile: "Ready!",
      processedItems: estimatedTotalItems,
      totalItems: estimatedTotalItems,
      estimatedTimeRemaining: 0
    });
  }
  
  return {
    rootNode,
    stats,
    duplicates,
    recommendations
  };
}

// Enhanced scanFilesViaInput function to report progress
export async function scanFilesViaInput(
  files: FileList,
  progressCallback?: (progress: {
    stage: "scanning" | "analyzing" | "visualizing";
    percentage: number;
    currentFile: string;
    processedItems: number;
    totalItems: number;
    estimatedTimeRemaining: number | null;
  }) => void
): Promise<AnalysisResult> {
  const fileHashes = new Map<string, DuplicateGroup>();
  const fileTypes = new Set<string>();
  let totalFiles = 0;
  let totalDirs = 0;
  let totalSize = 0;
  let maxDepth = 0;
  let totalDepth = 0;
  let processedItems = 0;
  const totalItems = files.length;
  
  // Start timing for estimating remaining time
  const startTime = Date.now();
  let lastProgressUpdate = startTime;
  
  // Function to estimate time remaining
  const estimateTimeRemaining = (processed: number, total: number): number | null => {
    if (processed === 0) return null;
    
    const elapsedMs = Date.now() - startTime;
    const msPerItem = elapsedMs / processed;
    const remainingItems = total - processed;
    const remainingMs = msPerItem * remainingItems;
    
    return remainingMs / 1000; // Return seconds
  };
  
  // Create a mapping of paths to organize files into a directory structure
  const pathMap = new Map<string, DirectoryNode>();
  const rootNode: DirectoryNode = {
    name: "root",
    path: "",
    isDirectory: true,
    children: []
  };
  pathMap.set("", rootNode);
  
  // Initial progress update
  if (progressCallback) {
    progressCallback({
      stage: "scanning",
      percentage: 0,
      currentFile: "Starting analysis...",
      processedItems: 0,
      totalItems,
      estimatedTimeRemaining: null
    });
  }
  
  // Count directories first to calculate proper depth metrics later
  const dirSet = new Set<string>();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = file.webkitRelativePath;
    const pathParts = fullPath.split('/');
    pathParts.pop(); // Remove file name
    
    // Add all directory levels to dirSet
    let currentPath = "";
    for (const part of pathParts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      dirSet.add(currentPath);
    }
    
    // Update progress occasionally during this phase
    if (progressCallback && i % 100 === 0 && Date.now() - lastProgressUpdate > 100) {
      lastProgressUpdate = Date.now();
      progressCallback({
        stage: "scanning",
        percentage: (i / totalItems) * 30, // First phase: 0-30%
        currentFile: "Analyzing directory structure...",
        processedItems: i,
        totalItems,
        estimatedTimeRemaining: estimateTimeRemaining(i, totalItems)
      });
    }
  }
  totalDirs = dirSet.size;
  
  // Process each file and build directory structure
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = file.webkitRelativePath;
    const pathParts = fullPath.split('/');
    const fileName = pathParts.pop() || "";
    
    // Update progress
    processedItems++;
    if (progressCallback && Date.now() - lastProgressUpdate > 100) {
      lastProgressUpdate = Date.now();
      progressCallback({
        stage: "scanning",
        percentage: 30 + (i / totalItems) * 65, // Second phase: 30-95%
        currentFile: fileName,
        processedItems,
        totalItems,
        estimatedTimeRemaining: estimateTimeRemaining(processedItems, totalItems)
      });
    }
    
    // Process file info
    const extension = getFileExtension(fileName);
    fileTypes.add(extension);
    totalFiles++;
    totalSize += file.size;
    
    // Create directory nodes for path
    let currentPath = "";
    let depth = 0;
    for (let j = 0; j < pathParts.length; j++) {
      const part = pathParts[j];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      depth = j + 1;
      
      if (!pathMap.has(currentPath)) {
        const dirNode: DirectoryNode = {
          name: part,
          path: currentPath,
          isDirectory: true,
          children: []
        };
        pathMap.set(currentPath, dirNode);
        
        // Add to parent
        const parent = pathMap.get(parentPath);
        if (parent && parent.children) {
          parent.children.push(dirNode);
          totalDepth += depth;
          // Update max depth
          maxDepth = Math.max(maxDepth, depth);
        }
      }
    }
    
    // Add file node
    const parentPath = pathParts.join('/');
    const parent = pathMap.get(parentPath);
    if (parent && parent.children) {
      // Updated hash function that includes filename in hash creation
      const hash = await hashFile(file);
      const fileNode: DirectoryNode = {
        name: fileName,
        path: fullPath,
        isDirectory: false,
        size: file.size,
        type: extension,
        hash
      };
      
      // Check for duplicates with improved hash method
      if (hash) {
        if (fileHashes.has(hash)) {
          const group = fileHashes.get(hash)!;
          group.paths.push(fileNode.path);
          group.fullFilenames.push(fileName);
          fileNode.isDuplicate = true;
        } else {
          fileHashes.set(hash, {
            hash,
            fileName: fileName,
            size: file.size,
            paths: [fileNode.path],
            fullFilenames: [fileName]
          });
        }
      }
      
      parent.children.push(fileNode);
    }
  }
  
  // Final analysis phase
  if (progressCallback) {
    progressCallback({
      stage: "analyzing",
      percentage: 97,
      currentFile: "Finalizing analysis...",
      processedItems: totalItems,
      totalItems,
      estimatedTimeRemaining: 1
    });
  }
  
  // Calculate stats
  const duplicates = Array.from(fileHashes.values())
    .filter(group => group.paths.length > 1);
  
  const avgDepth = totalDirs > 0 ? totalDepth / totalDirs : 0;
  
  const stats: FileStats = {
    totalSize,
    totalFiles,
    totalDirs,
    duplicateFiles: duplicates.reduce((acc, group) => acc + group.paths.length, 0),
    fileTypes,
    avgDepth,
    maxDepth
  };
  
  const recommendations = generateFileRecommendations({ 
    rootNode, 
    stats, 
    duplicates,
    recommendations: [] 
  });
  
  // Complete the progress
  if (progressCallback) {
    progressCallback({
      stage: "visualizing",
      percentage: 100,
      currentFile: "Ready!",
      processedItems: totalItems,
      totalItems,
      estimatedTimeRemaining: 0
    });
  }
  
  return {
    rootNode,
    stats,
    duplicates,
    recommendations
  };
}
