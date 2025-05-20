import { AnalysisResult, DirectoryNode, DuplicateGroup, FileStats, Recommendation } from "@/types/filesystem";
import { generateFileRecommendations } from "./utils";

export function mockFileSystemData(): AnalysisResult {
  // Create the root node
  const rootNode: DirectoryNode = {
    name: "mock-project",
    path: "/mock-project",
    isDirectory: true,
    children: [
      {
        name: "src",
        path: "/mock-project/src",
        isDirectory: true,
        children: [
          {
            name: "components",
            path: "/mock-project/src/components",
            isDirectory: true,
            children: [
              {
                name: "Button.tsx",
                path: "/mock-project/src/components/Button.tsx",
                isDirectory: false,
                size: 2048,
                type: "tsx"
              },
              {
                name: "Card.tsx",
                path: "/mock-project/src/components/Card.tsx",
                isDirectory: false,
                size: 3072,
                type: "tsx"
              }
            ]
          },
          {
            name: "lib",
            path: "/mock-project/src/lib",
            isDirectory: true,
            children: [
              {
                name: "utils.ts",
                path: "/mock-project/src/lib/utils.ts",
                isDirectory: false,
                size: 4096,
                type: "ts"
              },
              {
                name: "api.ts",
                path: "/mock-project/src/lib/api.ts",
                isDirectory: false,
                size: 1536,
                type: "ts"
              }
            ]
          },
          {
            name: "App.tsx",
            path: "/mock-project/src/App.tsx",
            isDirectory: false,
            size: 5120,
            type: "tsx"
          },
          {
            name: "index.css",
            path: "/mock-project/src/index.css",
            isDirectory: false,
            size: 1024,
            type: "css"
          }
        ]
      },
      {
        name: "public",
        path: "/mock-project/public",
        isDirectory: true,
        children: [
          {
            name: "logo.png",
            path: "/mock-project/public/logo.png",
            isDirectory: false,
            size: 8192,
            type: "png"
          },
          {
            name: "favicon.ico",
            path: "/mock-project/public/favicon.ico",
            isDirectory: false,
            size: 4096,
            type: "ico"
          }
        ]
      },
      {
        name: "data",
        path: "/mock-project/data",
        isDirectory: true,
        children: [
          {
            name: "sample.json",
            path: "/mock-project/data/sample.json",
            isDirectory: false,
            size: 6144,
            type: "json"
          },
          {
            name: "readme.md",
            path: "/mock-project/data/readme.md",
            isDirectory: false,
            size: 2048,
            type: "md"
          }
        ]
      },
      {
        name: "CI-0010040-911362-04D-0117.pdf",
        path: "/mock-project/CI-0010040-911362-04D-0117.pdf",
        isDirectory: false,
        size: 45000,
        type: "pdf"
      },
      {
        name: "old-config",
        path: "/mock-project/old-config",
        isDirectory: true,
        children: [
          {
            name: "package.json",
            path: "/mock-project/old-config/package.json",
            isDirectory: false,
            size: 2500,
            type: "json"
          }
        ]
      },
      {
        name: "package.json",
        path: "/mock-project/package.json",
        isDirectory: false,
        size: 2500,
        type: "json"
      },
      {
        name: "vite.config.ts",
        path: "/mock-project/vite.config.ts",
        isDirectory: false,
        size: 3584,
        type: "ts"
      },
      {
        name: "tsconfig.json",
        path: "/mock-project/tsconfig.json",
        isDirectory: false,
        size: 2048,
        type: "json"
      },
      {
        name: "README.md",
        path: "/mock-project/README.md",
        isDirectory: false,
        size: 1536,
        type: "md"
      },
      {
        name: ".gitignore",
        path: "/mock-project/.gitignore",
        isDirectory: false,
        size: 1024,
        type: ""
      },
      {
        name: "03_SV_Bescheinigung",
        path: "/mock-project/03_SV_Bescheinigung",
        isDirectory: true,
        children: [
          {
            "name": "CI-0010040-911362-04D-0117.pdf",
            "path": "/mock-project/03_SV_Bescheinigung/CI-0010040-911362-04D-0117.pdf",
            "isDirectory": false,
            "size": 45000,
            "type": "pdf"
          },
          {
            "name": "CI-0010040-911362-04D-0118.pdf",
            "path": "/mock-project/03_SV_Bescheinigung/CI-0010040-911362-04D-0118.pdf",
            "isDirectory": false,
            "size": 45000,
            "type": "pdf"
          },
          {
            "name": "CI-0010040-911362-04D-0119.pdf",
            "path": "/mock-project/03_SV_Bescheinigung/CI-0010040-911362-04D-0119.pdf",
            "isDirectory": false,
            "size": 45000,
            "type": "pdf"
          }
        ]
      }
    ]
  };
  
  // Calculate statistics
  const fileTypes = new Set<string>(["js", "tsx", "json", "md", "css", "html"]);
  
  const stats: FileStats = {
    totalSize: 1250000, // 1.25 MB
    totalFiles: 45,
    totalDirs: 12,
    duplicateFiles: 6,
    fileTypes,
    avgDepth: 2.5,
    maxDepth: 4
  };
  
  // Create duplicate groups
  const duplicates: DuplicateGroup[] = [
    {
      hash: "abcdef123456",
      fileName: "CI-0010040-911362-04D-0117.pdf",
      size: 45000,
      paths: [
        "/mock-project/03_SV_Bescheinigung/CI-0010040-911362-04D-0117.pdf",
        "/mock-project/03_SV_Bescheinigung/CI-0010040-911362-04D-0118.pdf",
        "/mock-project/03_SV_Bescheinigung/CI-0010040-911362-04D-0119.pdf",
      ],
      fullFilenames: [
        "CI-0010040-911362-04D-0117.pdf",
        "CI-0010040-911362-04D-0118.pdf",
        "CI-0010040-911362-04D-0119.pdf",
      ]
    },
    {
      hash: "deadbeef78901",
      fileName: "package.json",
      size: 2500,
      paths: [
        "/mock-project/package.json",
        "/mock-project/old-config/package.json"
      ],
      fullFilenames: [
        "package.json",
        "package.json"
      ]
    }
  ];
  
  // Mark duplicate nodes in the tree
  const markDuplicates = (node: DirectoryNode) => {
    if (!node.isDirectory && node.path) {
      for (const group of duplicates) {
        if (group.paths.includes(node.path)) {
          node.isDuplicate = true;
          break;
        }
      }
    }
    
    node.children?.forEach(markDuplicates);
  };
  
  markDuplicates(rootNode);
  
  // Generate recommendations
  const recommendations = generateFileRecommendations({
    rootNode,
    stats,
    duplicates,
    recommendations: []
  });
  
  return {
    rootNode,
    stats,
    duplicates,
    recommendations
  };
}
