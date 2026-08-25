"use client";

/** Shared tooltip surface — text stays in ink tokens, never the series colour. */
export function ChartTooltip({ active, payload, label, suffix = "leads" }) {
  if (!active || !payload?.length) return null;

  const point = payload[0];

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 shadow-lg">
      <p className="text-[11px] text-muted">{point.payload.label ?? label}</p>
      <p className="text-sm font-semibold tabular-nums">
        {point.value} <span className="text-xs font-normal text-muted">{suffix}</span>
      </p>
    </div>
  );
}
