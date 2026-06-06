"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface DonutItem {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: DonutItem[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  title?: string;
  showLegend?: boolean;
}

const tooltipStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border-default)",
  borderRadius: 8,
  padding: "8px 12px",
  color: "var(--text-primary)",
  fontSize: 12,
};

export function DonutChartWidget({ data, height = 180, innerRadius = 45, outerRadius = 75, title, showLegend = true }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      {title && <h3 className="font-semibold mb-3 text-sm" style={{ color: "var(--text-primary)" }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} dataKey="value" paddingAngle={2}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number | string | readonly (string | number)[] | undefined) => {
              const v = Number(Array.isArray(value) ? value[0] : value ?? 0);
              return `${v} (${((v / total) * 100).toFixed(1)}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {showLegend && (
        <div className="mt-2 space-y-1">
          {data.slice(0, 5).map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="capitalize" style={{ color: "var(--text-secondary)" }}>{item.name}</span>
              </div>
              <span className="font-mono" style={{ color: "var(--text-primary)" }}>
                {item.value} ({((item.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}