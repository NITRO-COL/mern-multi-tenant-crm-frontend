"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { humanize } from "@/lib/utils";
import { ChartTooltip } from "./ChartTooltip";

/** NEW → CONVERTED walk the ordinal ramp; LOST sits outside it, in gray. */
const STAGE_FILL = {
  NEW: "var(--chart-stage-1)",
  CONTACTED: "var(--chart-stage-2)",
  QUALIFIED: "var(--chart-stage-3)",
  CONVERTED: "var(--chart-stage-4)",
  LOST: "var(--chart-muted)",
};

export const STAGE_COLORS = STAGE_FILL;

const AXIS_TICK = { fill: "var(--chart-axis)", fontSize: 11 };

/**
 * Pipeline composition — columns, because the five stage names are short and the
 * reader compares heights against a common baseline. Identity comes from the
 * axis labels, so colour only reinforces the ordering.
 */
export function StatusChart({ data }) {
  const rows = data.map((d) => ({ ...d, label: humanize(d.key) }));

  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={rows} margin={{ top: 18, right: 4, bottom: 0, left: -22 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          interval={0}
        />
        <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} allowDecimals={false} width={40} />
        <Tooltip
          cursor={{ fill: "var(--surface-hover)" }}
          content={<ChartTooltip />}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={46}>
          {/* Values sit above the bars so the chart is readable without hovering. */}
          <LabelList
            dataKey="count"
            position="top"
            offset={6}
            style={{ fill: "var(--text-muted)", fontSize: 11 }}
          />
          {rows.map((row) => (
            <Cell key={row.key} fill={STAGE_FILL[row.key] ?? "var(--chart-accent)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Leads by source — horizontal, because the category names are long
 * ("Email campaign", "Social media"). A single series means one hue and no
 * legend: the axis already names every bar.
 */
export function SourceChart({ data }) {
  const rows = [...data]
    .map((d) => ({ ...d, label: humanize(d.key) }))
    .sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, rows.length * 34 + 24)}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 4 }}>
        <CartesianGrid horizontal={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          width={124}
        />
        <Tooltip cursor={{ fill: "var(--surface-hover)" }} content={<ChartTooltip />} />
        <Bar dataKey="count" fill="var(--chart-accent)" radius={[0, 4, 4, 0]} maxBarSize={18}>
          <LabelList
            dataKey="count"
            position="right"
            offset={8}
            style={{ fill: "var(--text-muted)", fontSize: 11 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Leads created over time — a single series, so an area rather than a line. */
export function TrendChart({ data }) {
  const rows = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={rows} margin={{ top: 8, right: 6, bottom: 0, left: -24 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-accent)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--chart-accent)" stopOpacity={0.01} />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          minTickGap={28}
        />
        <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} allowDecimals={false} width={40} />
        <Tooltip
          cursor={{ stroke: "var(--chart-axis)", strokeDasharray: "3 3" }}
          content={<ChartTooltip />}
        />
        <Area
          // Linear, not a smoothed curve: these are discrete daily counts, and a
          // monotone spline invents values between the points that never existed.
          type="linear"
          dataKey="count"
          stroke="var(--chart-accent)"
          strokeWidth={2}
          fill="url(#trendFill)"
          // Dots appear on hover only — one marker per day is noise.
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
