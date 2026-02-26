import { useState, useMemo, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { COUNTRY_NAME_TO_ISO } from "./worldMapData";

const GEO_URL = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

interface WorldMapProps {
  data: [string, number][];
}

// Build a reverse lookup: normalize names for flexible matching
function buildNameLookup(data: [string, number][]): Record<string, { count: number; name: string }> {
  const map: Record<string, { count: number; name: string }> = {};
  data.forEach(([name, count]) => {
    // Store by original name (lowercased for matching)
    map[name.toLowerCase()] = { count, name };
    // Also store by ISO code if available
    const iso = COUNTRY_NAME_TO_ISO[name];
    if (iso) map[iso.toLowerCase()] = { count, name };
  });
  return map;
}

function WorldMapInner({ data }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<{
    name: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const nameLookup = useMemo(() => buildNameLookup(data), [data]);

  const maxCount = useMemo(
    () => Math.max(1, ...data.map(([, c]) => c)),
    [data]
  );

  const findEntry = (geoName: string) => {
    // Try direct name match first
    const byName = nameLookup[geoName.toLowerCase()];
    if (byName) return byName;
    // Try ISO code from the geo name (some geo names are country names we have mapped)
    const iso = COUNTRY_NAME_TO_ISO[geoName];
    if (iso) return nameLookup[iso.toLowerCase()];
    return null;
  };

  const getColor = (geoName: string): string => {
    const entry = findEntry(geoName);
    if (!entry) return "hsl(var(--muted))";
    const intensity = 0.2 + (entry.count / maxCount) * 0.8;
    return `hsl(var(--primary) / ${intensity})`;
  };

  return (
    <div className="relative w-full mb-3 rounded-lg overflow-hidden border border-border bg-card">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [0, 30],
        }}
        width={800}
        height={400}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoName = geo.properties.name || "";
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(geoName)}
                    stroke="hsl(var(--border))"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        fill: "hsl(var(--primary) / 0.7)",
                        cursor: "pointer",
                      },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={(e) => {
                      const entry = findEntry(geoName);
                      if (!entry) return;
                      const rect = (
                        e.currentTarget as SVGElement
                      )
                        .closest("div")!
                        .getBoundingClientRect();
                      setTooltip({
                        name: entry.name,
                        count: entry.count,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }}
                    onMouseMove={(e) => {
                      const entry = findEntry(geoName);
                      if (!entry) {
                        setTooltip(null);
                        return;
                      }
                      const rect = (
                        e.currentTarget as SVGElement
                      )
                        .closest("div")!
                        .getBoundingClientRect();
                      setTooltip({
                        name: entry.name,
                        count: entry.count,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-50 rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md whitespace-nowrap"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 8,
            transform: "translateY(-100%)",
          }}
        >
          <span className="font-medium">{tooltip.name}</span>
          <span className="ml-2 text-muted-foreground tabular-nums">
            {tooltip.count.toLocaleString()} visitor{tooltip.count !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

const WorldMap = memo(WorldMapInner);
export default WorldMap;
