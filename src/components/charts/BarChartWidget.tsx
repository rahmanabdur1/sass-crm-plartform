"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  data: Record<string, unknown>[];
  dataKey: string;
  xKey: string;
  color?: string | string[];
  height?: number;
  formatter?: (v: number) => string;
  title?: string;
  barSize?: number;
}

const tooltipStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border-default)",
  borderRadius: 8,
  padding: "8px 12px",
  color: "var(--text-primary)",
  fontSize: 12,
};

export function BarChartWidget({ data, dataKey, xKey, color = "#6366F1", height = 200, formatter, title, barSize = 20 }: Props) {
  const colors = Array.isArray(color) ? color : null;
  return (
    <div>
      {title && <h3 className="font-semibold mb-4 text-sm" style={{ color: "var(--text-primary)" }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barSize={barSize}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey={xKey} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => formatter ? formatter(v) : v} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatter ? [formatter(v)] : [v]} />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} fill={Array.isArray(color) ? "#6366F1" : color}>
            {colors && data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}