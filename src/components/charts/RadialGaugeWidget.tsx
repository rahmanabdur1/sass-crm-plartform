"use client";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  value: number;
  max?: number;
  label: string;
  color?: string;
  height?: number;
}

export function RadialGaugeWidget({ value, max = 100, label, color = "#6366F1", height = 180 }: Props) {
  const percentage = Math.min((value / max) * 100, 100);

  const options: ApexCharts.ApexOptions = {
    chart: { type: "radialBar", background: "transparent" },
    plotOptions: {
      radialBar: {
        hollow: { size: "55%" },
        dataLabels: {
          name: {
            show: true,
            fontSize: "12px",
            color: "var(--text-muted)",
            offsetY: 20,
          },
          value: {
            show: true,
            fontSize: "20px",
            fontWeight: "bold",
            color: "var(--text-primary)",
            offsetY: -10,
            formatter: () => `${value.toFixed(1)}%`,
          },
        },
        track: { background: "rgba(255,255,255,0.05)" },
      },
    },
    colors: [color],
    labels: [label],
    theme: { mode: "dark" },
  };

  return (
    <div style={{ background: "transparent" }}>
      <ReactApexChart
        options={options}
        series={[percentage]}
        type="radialBar"
        height={height}
      />
    </div>
  );
}