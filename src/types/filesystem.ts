
export interface DirectoryNode {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  type?: string;
  children?: DirectoryNode[];
  hash?: string;
  isDuplicate?: boolean;
}

export interface DuplicateGroup {
  hash: string;
  fileName: string;
  size: number;
  paths: string[];
}

export interface FileStats {
  totalSize: number;
  totalFiles: number;
  totalDirs: number;
  duplicateFiles: number;
  fileTypes: Set<string>;
  avgDepth: number;
  maxDepth: number;
}

export interface Recommendation {
  title: string;
  description: string;
  suggestion?: string;
  actionLink?: string;
  actionText?: string;
}

export interface AnalysisResult {
  rootNode: DirectoryNode;
  stats: FileStats;
  duplicates: DuplicateGroup[];
  recommendations: Recommendation[];
}
