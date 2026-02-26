import { useState, useMemo, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { COUNTRY_NAME_TO_ISO } from "./worldMapData";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  data: [string, number][];
}

function WorldMapInner({ data }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<{
    name: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const countByIso = useMemo(() => {
    const map: Record<string, { count: number; name: string }> = {};
    data.forEach(([name, count]) => {
      const iso = COUNTRY_NAME_TO_ISO[name] || name;
      if (iso) map[iso] = { count, name };
    });
    return map;
  }, [data]);

  const maxCount = useMemo(
    () => Math.max(1, ...data.map(([, c]) => c)),
    [data]
  );

  const getColor = (isoA3: string, isoA2: string, geoName: string): string => {
    const entry =
      countByIso[isoA2] ||
      countByIso[isoA3] ||
      countByIso[geoName];
    if (!entry) return "hsl(var(--muted))";
    const intensity = 0.2 + (entry.count / maxCount) * 0.8;
    return `hsl(var(--primary) / ${intensity})`;
  };

  const getEntry = (isoA3: string, isoA2: string, geoName: string) =>
    countByIso[isoA2] || countByIso[isoA3] || countByIso[geoName];

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
                const { ISO_A2, ISO_A3, NAME } = geo.properties;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(ISO_A3, ISO_A2, NAME)}
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
                      const entry = getEntry(ISO_A3, ISO_A2, NAME);
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
                      const entry = getEntry(ISO_A3, ISO_A2, NAME);
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
