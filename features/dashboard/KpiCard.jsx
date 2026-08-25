import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

/**
 * A single headline number is a stat tile, not a one-bar chart. The dot is a
 * quiet identity marker that ties the tile to its bar in the pipeline chart.
 */
export function KpiCard({ label, value, dotColor, hint, emphasis = false }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5">
        {dotColor && (
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: dotColor }}
            aria-hidden
          />
        )}
        <p className="truncate text-xs font-medium text-muted">{label}</p>
      </div>

      <p
        className={cn(
          "mt-2 font-semibold tracking-tight tabular-nums",
          emphasis ? "text-3xl" : "text-2xl"
        )}
      >
        {value}
      </p>

      {hint && <p className="mt-0.5 text-[11px] text-subtle">{hint}</p>}
    </Card>
  );
}
