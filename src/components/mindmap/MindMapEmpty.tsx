
import React from "react";
import { Card } from "@/components/ui/card";

const MindMapEmpty = () => {
  return (
    <Card className="w-full h-full flex items-center justify-center">
      <p className="text-muted-foreground">Select a directory to visualize</p>
    </Card>
  );
};

export default MindMapEmpty;
