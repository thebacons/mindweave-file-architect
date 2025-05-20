
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileStats } from "@/types/filesystem";
import { 
  BarChart, 
  FileText, 
  FolderTree, 
  Copy, 
  HardDrive,
  FileArchive 
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface DirectoryStatsProps {
  stats: FileStats | null;
}

const DirectoryStats = ({ stats }: DirectoryStatsProps) => {
  if (!stats) {
    return null;
  }

  const statItems = [
    {
      title: "Total Size",
      value: formatBytes(stats.totalSize),
      icon: <HardDrive className="h-4 w-4" />,
      color: "text-blue-500"
    },
    {
      title: "Files",
      value: stats.totalFiles.toString(),
      icon: <FileText className="h-4 w-4" />,
      color: "text-green-500"
    },
    {
      title: "Directories",
      value: stats.totalDirs.toString(),
      icon: <FolderTree className="h-4 w-4" />,
      color: "text-purple-500"
    },
    {
      title: "Duplicate Files",
      value: stats.duplicateFiles.toString(),
      icon: <Copy className="h-4 w-4" />,
      color: "text-red-500"
    },
    {
      title: "File Types",
      value: stats.fileTypes.size.toString(),
      icon: <FileArchive className="h-4 w-4" />,
      color: "text-amber-500"
    },
    {
      title: "Avg. Depth",
      value: stats.avgDepth.toFixed(1),
      icon: <BarChart className="h-4 w-4" />,
      color: "text-teal-500"
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Directory Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center p-3 border rounded-md bg-secondary/50"
            >
              <div className={`mr-3 ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.title}</p>
                <p className="text-lg font-semibold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectoryStats;
