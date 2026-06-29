import React, { useEffect, useState, useRef, useCallback } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";
import SpriteText from "three-spritetext";

const ArchitectureGraph = ({ files }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    // Update dimensions on mount and resize
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || 600
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!files || files.length === 0) return;

    const nodesMap = new Map();
    const links = [];

    // Always create a root node so the graph stays connected
    nodesMap.set("root", {
      id: "root",
      name: "Repository Root",
      val: 15,
      type: "folder",
      color: "var(--accent-primary, #58a6ff)"
    });

    files.forEach(file => {
      const parts = file.path.split("/");
      let currentPath = "";

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const parentPath = currentPath || "root";
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!nodesMap.has(currentPath)) {
          // Determine color and size
          let color = "#8b949e"; // default gray
          let val = 5;
          let type = "folder";

          if (isLast) {
            type = "file";
            val = 3; // Files are smaller
            const ext = part.split('.').pop().toLowerCase();
            if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) color = "#f1e05a"; // JS yellow
            else if (['html', 'css', 'scss'].includes(ext)) color = "#e34c26"; // HTML/CSS orange
            else if (['py'].includes(ext)) color = "#3572A5"; // Python blue
            else if (['json', 'md'].includes(ext)) color = "#6e7681"; // Config gray
            else color = "#ff7b72"; // Other files
          } else {
            color = "var(--text-secondary, #a1a1aa)"; // Folders
            val = 8;
          }

          nodesMap.set(currentPath, {
            id: currentPath,
            name: part,
            val,
            type,
            color
          });

          // Create link from parent to this node
          links.push({
            source: parentPath,
            target: currentPath
          });
        }
      });
    });

    setGraphData({
      nodes: Array.from(nodesMap.values()),
      links
    });
  }, [files]);

  const fgRef = useRef();
  
  // Use native OrbitControls auto-rotation so it doesn't fight with user interactions
  useEffect(() => {
    if (fgRef.current) {
      // The controls are initialized asynchronously, so we set a small timeout
      const enableAutoRotate = () => {
        const controls = fgRef.current.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 1.5;
        }
      };
      
      const timeoutId = setTimeout(enableAutoRotate, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [graphData]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: "100%", 
        height: "600px", 
        background: "rgba(0,0,0,0.2)", 
        borderRadius: "12px", 
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        position: "relative"
      }}
    >
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, color: "var(--text-secondary)", fontSize: "0.8rem", background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "4px" }}>
        Scroll to zoom | Drag to pan | Drag nodes
      </div>
      <ForceGraph3D
        ref={fgRef}
        controlType="orbit"
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={node => node.color}
        nodeRelSize={4}
        linkColor={() => "rgba(255, 255, 255, 0.15)"}
        linkWidth={1}
        backgroundColor="rgba(0,0,0,0)" // Transparent background
        nodeThreeObject={(node) => {
          // Create a group to hold both the sphere and the text
          const group = new THREE.Group();

          // 1. Create Glowing Sphere
          const geometry = new THREE.SphereGeometry(node.val, 16, 16);
          const material = new THREE.MeshPhongMaterial({
            color: node.color,
            transparent: true,
            opacity: 0.8,
            emissive: node.color,
            emissiveIntensity: 0.5
          });
          const sphere = new THREE.Mesh(geometry, material);
          group.add(sphere);

          // 2. Add SpriteText Label
          const sprite = new SpriteText(node.name);
          sprite.color = '#ffffff';
          sprite.textHeight = Math.max(3, node.val * 0.4); // Scale text with node size
          sprite.position.set(0, node.val + 4, 0); // Position above the sphere
          sprite.material.depthWrite = false; // Prevent clipping
          group.add(sprite);

          return group;
        }}
        // Setup initial forces
        d3Force={(forceName, force) => {
          if (forceName === 'link') {
            force.distance(60);
          }
          if (forceName === 'charge') {
            force.strength(-200);
          }
        }}
      />
    </div>
  );
};

export default ArchitectureGraph;
