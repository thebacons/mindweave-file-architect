
import { useState, useEffect, useRef } from "react";
import { DirectoryNode } from "@/types/filesystem";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import MindMapLegend from "./mindmap/MindMapLegend";
import MindMapEmpty from "./mindmap/MindMapEmpty";
import { createMindMapVisualization } from "@/lib/mindMapUtils";

interface MindMapProps {
  data: DirectoryNode | null;
}

const MindMap = ({ data }: MindMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    createMindMapVisualization(svgRef, data, dimensions);
  }, [data, dimensions]);
  
  if (!data) {
    return <MindMapEmpty />;
  }

  return (
    <div className={cn("w-full h-full min-h-[500px] relative")}>
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="w-full h-full"
      ></svg>
      <MindMapLegend />
    </div>
  );
};

export default MindMap;
