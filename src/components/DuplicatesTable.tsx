
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DuplicateGroup } from "@/types/filesystem";
import { formatBytes } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface DuplicatesTableProps {
  duplicates: DuplicateGroup[];
}

const DuplicatesTable = ({ duplicates }: DuplicatesTableProps) => {
  if (!duplicates.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Duplicate Files</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No duplicate files found.</p>
        </CardContent>
      </Card>
    );
  }

  const getFilenameDiff = (filename1: string, filename2: string) => {
    // Find the position where the filenames differ
    let i = 0;
    const minLength = Math.min(filename1.length, filename2.length);
    
    while (i < minLength && filename1[i] === filename2[i]) {
      i++;
    }
    
    // Return the differing part
    if (i < filename1.length) {
      return {
        common: filename1.substring(0, i),
        different: filename1.substring(i),
        position: i
      };
    }
    
    return {
      common: filename1,
      different: '',
      position: -1
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Duplicate Files</span>
          <span className="text-xs text-muted-foreground">
            {duplicates.length} duplicate groups found
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[300px]">File</TableHead>
                <TableHead className="w-[100px]">Size</TableHead>
                <TableHead>Locations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {duplicates.map((group, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium max-w-[300px]">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="truncate cursor-help">{group.fileName}</div>
                      </HoverCardTrigger>
                      <HoverCardContent side="top" className="w-[400px]">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Full filename:</p>
                          <p className="text-xs break-all">{group.fileName}</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell>{formatBytes(group.size)}</TableCell>
                  <TableCell>
                    <div className="max-h-36 overflow-y-auto text-xs space-y-2">
                      {group.paths.map((path, i) => {
                        const fullFilename = group.fullFilenames[i] || path.split('/').pop() || "";
                        
                        // If there's another filename to compare with, show the difference
                        const diffHighlight = i > 0 
                          ? getFilenameDiff(fullFilename, group.fullFilenames[0])
                          : null;
                        
                        return (
                          <HoverCard key={i}>
                            <HoverCardTrigger asChild>
                              <div className="truncate pb-1 border-b border-border last:border-0 last:pb-0 mb-1 last:mb-0 cursor-help">
                                {path}
                                {diffHighlight && diffHighlight.position > 0 && (
                                  <div className="mt-1 text-[11px]">
                                    <span className="text-muted-foreground">Differs at: </span>
                                    <span className="font-mono bg-muted px-1 rounded">
                                      {diffHighlight.common}
                                      <span className="text-destructive font-bold">
                                        {diffHighlight.different}
                                      </span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent side="top" className="w-[400px]">
                              <div className="space-y-2">
                                <div>
                                  <p className="text-sm font-medium">Full filename:</p>
                                  <p className="text-xs break-all">{fullFilename}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Path:</p>
                                  <p className="text-xs break-all">{path}</p>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DuplicatesTable;
