import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Download, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreakdownDetailsProps {
  title: string;
  data: [string, number][];
  columns?: { key: string; label: string }[];
  extraData?: Record<string, Record<string, number | string>>;
  onExportCSV?: () => void;
}

type SortKey = "name" | "count" | string;
type SortDir = "asc" | "desc";

export default function BreakdownDetails({ title, data, columns, extraData, onExportCSV }: BreakdownDetailsProps) {
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort(([nameA, countA], [nameB, countB]) => {
      if (sortKey === "name") return sortDir === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      if (sortKey === "count") return sortDir === "asc" ? countA - countB : countB - countA;
      // Extra column sort
      const valA = extraData?.[nameA]?.[sortKey] ?? 0;
      const valB = extraData?.[nameB]?.[sortKey] ?? 0;
      if (typeof valA === "number" && typeof valB === "number") return sortDir === "asc" ? valA - valB : valB - valA;
      return 0;
    });
    return copy;
  }, [data, sortKey, sortDir, extraData]);

  const total = data.reduce((s, [, c]) => s + c, 0);

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded" title="View details">
          <Maximize2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            {onExportCSV && (
              <Button variant="ghost" size="sm" onClick={onExportCSV} className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="space-y-0">
          {/* Header */}
          <div className="flex items-center border-b border-border px-2 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <button className="flex-1 flex items-center gap-1 text-left" onClick={() => toggleSort("name")}>
              Name <SortIcon col="name" />
            </button>
            <button className="w-20 flex items-center justify-end gap-1" onClick={() => toggleSort("count")}>
              Visitors <SortIcon col="count" />
            </button>
            {columns?.map((col) => (
              <button key={col.key} className="w-20 flex items-center justify-end gap-1" onClick={() => toggleSort(col.key)}>
                {col.label} <SortIcon col={col.key} />
              </button>
            ))}
            <span className="w-14 text-right">%</span>
          </div>
          {/* Rows */}
          {sorted.map(([name, count]) => (
            <div key={name} className="flex items-center px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors">
              <span className="flex-1 truncate text-foreground">{name}</span>
              <span className="w-20 text-right font-medium text-foreground">{formatNumber(count)}</span>
              {columns?.map((col) => (
                <span key={col.key} className="w-20 text-right text-muted-foreground">
                  {extraData?.[name]?.[col.key] ?? "–"}
                </span>
              ))}
              <span className="w-14 text-right text-xs text-muted-foreground">
                {total > 0 ? ((count / total) * 100).toFixed(1) : "0"}%
              </span>
            </div>
          ))}
          {sorted.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No data</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}
