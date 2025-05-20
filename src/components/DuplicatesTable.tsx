
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
                  <TableCell className="font-medium">
                    {group.fileName}
                  </TableCell>
                  <TableCell>{formatBytes(group.size)}</TableCell>
                  <TableCell>
                    <div className="max-h-20 overflow-y-auto text-xs">
                      {group.paths.map((path, i) => (
                        <div key={i} className="pb-1 border-b border-border last:border-0 last:pb-0 mb-1 last:mb-0">
                          {path}
                        </div>
                      ))}
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
