import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

/**
 * A headline number is a stat tile, not a one-bar chart.
 *
 * The optional sparkline and delta exist to give the number context: "46" alone
 * says nothing about whether the pipeline is growing. Neither is decoration —
 * drop them and the tile loses information, not styling.
 */
export function KpiCard({ label, value, dotColor, delta, sparkline, hint }) {
  return (
    <Card className="relative overflow-hidden p-4">
      <div className="flex items-center gap-1.5">
        {dotColor && (
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: dotColor }} aria-hidden />
        )}
        <p className="truncate text-xs font-medium text-muted">{label}</p>
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        {sparkline?.length > 1 && <Sparkline points={sparkline} />}
      </div>

      {/* Its own row — beside the sparkline this wrapped to three lines. */}
      {delta ? (
        <Delta delta={delta} />
      ) : hint ? (
        <p className="mt-1 truncate text-[11px] text-subtle">{hint}</p>
      ) : null}
    </Card>
  );
}

function Delta({ delta }) {
  const { percent, direction } = delta;

  // No previous data to compare against — say so rather than invent a percentage.
  if (percent === null) {
    return (
      <p className="mt-1 text-[11px] text-subtle">
        {delta.current > 0 ? `${delta.current} new in 30 days` : "no activity in 30 days"}
      </p>
    );
  }

  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  return (
    <p
      className={cn(
        "mt-1 flex items-center gap-0.5 text-[11px] font-medium whitespace-nowrap",
        direction === "up"
          ? "text-emerald-600 dark:text-emerald-400"
          : direction === "down"
            ? "text-red-600 dark:text-red-400"
            : "text-subtle"
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(percent)}%
      <span className="ml-0.5 font-normal text-subtle">vs prev 30d</span>
    </p>
  );
}

/**
 * Inline 30-day trend. Hand-rolled SVG rather than a chart library: at 64×24px
 * there are no axes, labels or tooltips to justify the weight.
 */
function Sparkline({ points, width = 64, height = 26 }) {
  const max = Math.max(...points, 1);
  const step = width / (points.length - 1);

  const coords = points.map((p, i) => [i * step, height - (p / max) * (height - 3) - 1.5]);
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 overflow-visible"
      aria-hidden
    >
      <path d={area} fill="var(--chart-accent)" opacity="0.1" />
      <path
        d={line}
        fill="none"
        stroke="var(--chart-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
