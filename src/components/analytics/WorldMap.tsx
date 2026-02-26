import { useState, useMemo } from "react";
import { COUNTRY_PATHS, COUNTRY_NAME_TO_ISO } from "./worldMapPaths";

interface WorldMapProps {
  /** Array of [countryName, visitorCount] */
  data: [string, number][];
}

export default function WorldMap({ data }: WorldMapProps) {
  const [hovered, setHovered] = useState<{ name: string; count: number; x: number; y: number } | null>(null);

  // Build iso -> count map
  const countByIso = useMemo(() => {
    const map: Record<string, { count: number; name: string }> = {};
    data.forEach(([name, count]) => {
      const iso = COUNTRY_NAME_TO_ISO[name] || name;
      if (iso && iso.length === 2) {
        map[iso] = { count, name };
      }
    });
    return map;
  }, [data]);

  const maxCount = useMemo(() => Math.max(1, ...data.map(([, c]) => c)), [data]);

  const getOpacity = (iso: string): number => {
    const entry = countByIso[iso];
    if (!entry) return 0.06;
    // Scale from 0.15 to 1.0
    return 0.15 + (entry.count / maxCount) * 0.85;
  };

  const handleMouseEnter = (iso: string, e: React.MouseEvent) => {
    const entry = countByIso[iso];
    if (!entry) return;
    const rect = (e.currentTarget as SVGElement).closest("svg")!.getBoundingClientRect();
    setHovered({
      name: entry.name,
      count: entry.count,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="relative w-full mb-3">
      <svg
        viewBox="-180 -90 360 180"
        className="w-full h-auto"
        style={{ maxHeight: 260 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect x="-180" y="-90" width="360" height="180" fill="transparent" />

        {/* Country paths */}
        {Object.entries(COUNTRY_PATHS).map(([iso, path]) => (
          <path
            key={iso}
            d={path}
            fill={`hsl(var(--primary))`}
            fillOpacity={getOpacity(iso)}
            stroke="hsl(var(--border))"
            strokeWidth={0.3}
            className="transition-all duration-150 cursor-pointer hover:!fill-opacity-100"
            onMouseEnter={(e) => handleMouseEnter(iso, e)}
            onMouseMove={(e) => {
              const entry = countByIso[iso];
              if (!entry) return;
              const rect = (e.currentTarget as SVGElement).closest("svg")!.getBoundingClientRect();
              setHovered({
                name: entry.name,
                count: entry.count,
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-50 rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md"
          style={{
            left: hovered.x + 12,
            top: hovered.y - 8,
            transform: "translateY(-100%)",
          }}
        >
          <span className="font-medium">{hovered.name}</span>
          <span className="ml-2 text-muted-foreground tabular-nums">{hovered.count.toLocaleString()} visitors</span>
        </div>
      )}
    </div>
  );
}
