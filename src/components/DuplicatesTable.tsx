
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Duplicate Files</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Locations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {duplicates.map((group, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium max-w-[250px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate">{group.fileName}</div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="max-w-[400px] break-all">{group.fileName}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>{formatBytes(group.size)}</TableCell>
                  <TableCell>
                    <div className="max-h-20 overflow-y-auto text-xs">
                      {group.paths.map((path, i) => {
                        const fullFilename = group.fullFilenames?.[i] || path.split('/').pop() || "";
                        return (
                          <TooltipProvider key={i}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="truncate pb-1 border-b border-border last:border-0 last:pb-0 mb-1 last:mb-0">
                                  {path}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[500px]">
                                <div className="space-y-1">
                                  <p className="break-all font-medium">Full filename: {fullFilename}</p>
                                  <p className="break-all">Path: {path}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
