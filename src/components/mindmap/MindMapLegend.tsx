
import React from "react";

const MindMapLegend = () => {
  return (
    <div className="absolute bottom-4 right-4 bg-secondary p-3 rounded text-xs shadow-md border border-border">
      <div className="font-medium mb-2 text-sm">Legend</div>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
        <span>Directory</span>
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
        <span>File</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
        <span>Duplicate</span>
      </div>
      <div className="space-y-1.5 border-t border-border pt-2 text-[10px] text-muted-foreground">
        <div>• Hover over nodes to see full details</div>
        <div>• Click on nodes to attempt opening in explorer</div>
        <div>• Use mouse wheel to zoom in/out</div>
        <div>• Click and drag to pan around</div>
      </div>
    </div>
  );
};

export default MindMapLegend;
