import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { ArrowUp, ArrowDown, Users, Eye, MousePointerClick, Clock } from "lucide-react";

const chartData = [
  { date: "Mon", visitors: 186 },
  { date: "Tue", visitors: 305 },
  { date: "Wed", visitors: 237 },
  { date: "Thu", visitors: 273 },
  { date: "Fri", visitors: 409 },
  { date: "Sat", visitors: 214 },
  { date: "Sun", visitors: 182 },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "hsl(var(--primary))",
  },
};

const metrics = [
  { label: "Unique Visitors", value: "1,806", change: 12.5, icon: Users },
  { label: "Total Pageviews", value: "4,231", change: 8.3, icon: Eye },
  { label: "Bounce Rate", value: "42%", change: -3.1, icon: MousePointerClick },
  { label: "Avg. Duration", value: "2m 34s", change: 5.7, icon: Clock },
];

const topPages = [
  { page: "/", visits: 1243 },
  { page: "/pricing", visits: 432 },
  { page: "/docs/getting-started", visits: 387 },
  { page: "/blog/privacy-analytics", visits: 298 },
  { page: "/features", visits: 245 },
];

const topSources = [
  { source: "Google", visits: 842 },
  { source: "Twitter / X", visits: 456 },
  { source: "Direct", visits: 312 },
  { source: "GitHub", visits: 198 },
  { source: "Hacker News", visits: 143 },
];

const DemoDashboard = () => {
  return (
    <section id="demo" className="border-t border-border/50 bg-muted/30 py-24">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            See it in action
          </h2>
          <p className="text-lg text-muted-foreground">
            A clean, intuitive dashboard that shows you what matters.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          {/* Top metrics */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.label} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                        metric.change > 0 ? "text-emerald-600" : "text-destructive"
                      }`}
                    >
                      {metric.change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart */}
          <Card className="mb-6 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Visitors — Last 7 days</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#fillVisitors)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Breakdown panels */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Top Pages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPages.map((item) => (
                  <div key={item.page} className="flex items-center justify-between">
                    <span className="truncate text-sm text-foreground">{item.page}</span>
                    <span className="ml-4 shrink-0 text-sm font-medium text-muted-foreground">
                      {item.visits.toLocaleString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Top Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topSources.map((item) => (
                  <div key={item.source} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.source}</span>
                    <span className="ml-4 shrink-0 text-sm font-medium text-muted-foreground">
                      {item.visits.toLocaleString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoDashboard;
