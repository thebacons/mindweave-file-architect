
import React from "react";

const MindMapLegend = () => {
  return (
    <div className="absolute bottom-4 right-4 bg-secondary p-2 rounded text-xs">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
        <span>Directory</span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
        <span>File</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
        <span>Duplicate</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="italic text-muted-foreground text-[10px]">Hover over nodes to see full details</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="italic text-muted-foreground text-[10px]">Click on nodes to attempt opening in explorer</span>
      </div>
    </div>
  );
};

export default MindMapLegend;
