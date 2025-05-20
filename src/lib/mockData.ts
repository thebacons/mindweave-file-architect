
import { AnalysisResult, DirectoryNode, DuplicateGroup, FileStats, Recommendation } from "@/types/filesystem";
import { formatBytes } from "./utils";

// Create mock directory structure
const createMockDirectoryStructure = (): DirectoryNode => {
  return {
    name: "root",
    path: "/root",
    isDirectory: true,
    children: [
      {
        name: "Documents",
        path: "/root/Documents",
        isDirectory: true,
        children: [
          {
            name: "Work",
            path: "/root/Documents/Work",
            isDirectory: true,
            children: [
              {
                name: "Project A",
                path: "/root/Documents/Work/Project A",
                isDirectory: true,
                children: [
                  {
                    name: "proposal.docx",
                    path: "/root/Documents/Work/Project A/proposal.docx",
                    isDirectory: false,
                    size: 2500000,
                    type: "docx",
                    hash: "abc123"
                  },
                  {
                    name: "budget.xlsx",
                    path: "/root/Documents/Work/Project A/budget.xlsx",
                    isDirectory: false,
                    size: 1800000,
                    type: "xlsx"
                  }
                ]
              },
              {
                name: "Project B",
                path: "/root/Documents/Work/Project B",
                isDirectory: true,
                children: [
                  {
                    name: "report.pdf",
                    path: "/root/Documents/Work/Project B/report.pdf",
                    isDirectory: false,
                    size: 3500000,
                    type: "pdf"
                  },
                  {
                    name: "presentation.pptx",
                    path: "/root/Documents/Work/Project B/presentation.pptx",
                    isDirectory: false,
                    size: 4200000,
                    type: "pptx"
                  }
                ]
              }
            ]
          },
          {
            name: "Personal",
            path: "/root/Documents/Personal",
            isDirectory: true,
            children: [
              {
                name: "resume.docx",
                path: "/root/Documents/Personal/resume.docx",
                isDirectory: false,
                size: 350000,
                type: "docx"
              },
              {
                name: "tax_return_2024.pdf",
                path: "/root/Documents/Personal/tax_return_2024.pdf",
                isDirectory: false,
                size: 1200000,
                type: "pdf"
              }
            ]
          }
        ]
      },
      {
        name: "Pictures",
        path: "/root/Pictures",
        isDirectory: true,
        children: [
          {
            name: "Vacation",
            path: "/root/Pictures/Vacation",
            isDirectory: true,
            children: [
              {
                name: "beach.jpg",
                path: "/root/Pictures/Vacation/beach.jpg",
                isDirectory: false,
                size: 5500000,
                type: "jpg"
              },
              {
                name: "mountains.jpg",
                path: "/root/Pictures/Vacation/mountains.jpg",
                isDirectory: false,
                size: 6200000,
                type: "jpg"
              },
              {
                name: "beach_copy.jpg",
                path: "/root/Pictures/Vacation/beach_copy.jpg",
                isDirectory: false,
                size: 5500000,
                type: "jpg",
                hash: "def456",
                isDuplicate: true
              }
            ]
          },
          {
            name: "Family",
            path: "/root/Pictures/Family",
            isDirectory: true,
            children: [
              {
                name: "christmas.png",
                path: "/root/Pictures/Family/christmas.png",
                isDirectory: false,
                size: 8100000,
                type: "png"
              },
              {
                name: "birthday.jpg",
                path: "/root/Pictures/Family/birthday.jpg",
                isDirectory: false,
                size: 4800000,
                type: "jpg"
              }
            ]
          }
        ]
      },
      {
        name: "Downloads",
        path: "/root/Downloads",
        isDirectory: true,
        children: [
          {
            name: "software.dmg",
            path: "/root/Downloads/software.dmg",
            isDirectory: false,
            size: 350000000,
            type: "dmg"
          },
          {
            name: "movie.mp4",
            path: "/root/Downloads/movie.mp4",
            isDirectory: false,
            size: 1500000000,
            type: "mp4"
          },
          {
            name: "backup",
            path: "/root/Downloads/backup",
            isDirectory: true,
            children: [
              {
                name: "old_photos",
                path: "/root/Downloads/backup/old_photos",
                isDirectory: true,
                children: [
                  {
                    name: "beach.jpg",
                    path: "/root/Downloads/backup/old_photos/beach.jpg",
                    isDirectory: false,
                    size: 5500000,
                    type: "jpg",
                    hash: "def456",
                    isDuplicate: true
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };
};

// Create mock duplicates
const createMockDuplicates = (): DuplicateGroup[] => {
  return [
    {
      hash: "def456",
      fileName: "beach.jpg",
      size: 5500000,
      paths: [
        "/root/Pictures/Vacation/beach.jpg",
        "/root/Pictures/Vacation/beach_copy.jpg",
        "/root/Downloads/backup/old_photos/beach.jpg"
      ],
      fullFilenames: [
        "beach.jpg",
        "beach_copy.jpg",
        "beach.jpg"
      ]
    },
    {
      hash: "abc123",
      fileName: "proposal.docx",
      size: 2500000,
      paths: [
        "/root/Documents/Work/Project A/proposal.docx",
        "/root/Documents/Work/Project A/old/proposal_v1.docx"
      ],
      fullFilenames: [
        "proposal.docx",
        "proposal_v1.docx"
      ]
    }
  ];
};

// Create mock file stats
const createMockStats = (): FileStats => {
  const fileTypes = new Set<string>(["docx", "xlsx", "pdf", "pptx", "jpg", "png", "mp4", "dmg"]);
  return {
    totalSize: 2000000000,
    totalFiles: 15,
    totalDirs: 10,
    duplicateFiles: 5,
    fileTypes,
    avgDepth: 3.5,
    maxDepth: 5
  };
};

// Create mock recommendations
const createMockRecommendations = (stats: FileStats, duplicates: DuplicateGroup[]): Recommendation[] => {
  return [
    {
      title: "Clean up duplicate files",
      description: `Found ${stats.duplicateFiles} duplicate files that waste ${formatBytes(duplicates.reduce((acc, dup) => acc + (dup.size * (dup.paths.length - 1)), 0))} of storage.`,
      suggestion: "Consider using a dedicated duplicate file cleaner to safely remove redundant files."
    },
    {
      title: "Organize media files",
      description: "You have several media files scattered across different folders. Consider organizing them by type.",
      suggestion: "Move all images to /Pictures\nMove all videos to /Videos\nCreate subfolders by date or event"
    },
    {
      title: "Consolidate documents",
      description: "Your documents are spread across multiple folders with varying depths.",
      suggestion: "Create a more consistent folder structure with fewer levels for better navigation."
    },
    {
      title: "Clean up Downloads folder",
      description: "Your Downloads folder contains large files that could be organized better.",
      suggestion: "Create separate folders for software installations and media files within Downloads."
    }
  ];
};

export const mockFileSystemData = (): AnalysisResult => {
  const rootNode = createMockDirectoryStructure();
  const duplicates = createMockDuplicates();
  const stats = createMockStats();
  const recommendations = createMockRecommendations(stats, duplicates);
  
  return {
    rootNode,
    stats,
    duplicates,
    recommendations
  };
};
