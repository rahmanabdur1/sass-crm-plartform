"use client";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface HeatmapSeries {
  name: string;
  data: { x: string; y: number }[];
}

interface Props {
  series: HeatmapSeries[];
  title?: string;
  height?: number;
  colors?: string[];
}

export function HeatmapWidget({ series, title, height = 300, colors = ["#6366F1"] }: Props) {
  const options: ApexCharts.ApexOptions = {
    chart: { type: "heatmap", background: "transparent", toolbar: { show: false } },
    dataLabels: { enabled: false },
    colors,
    title: title ? { text: title, style: { color: "var(--text-primary)", fontSize: "14px" } } : undefined,
    xaxis: { labels: { style: { colors: "var(--text-muted)" } } },
    yaxis: { labels: { style: { colors: "var(--text-muted)" } } },
    tooltip: { theme: "dark" },
    theme: { mode: "dark" },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        colorScale: {
          ranges: [
            { from: 0, to: 20, color: "#1F2937", name: "low" },
            { from: 21, to: 50, color: "#4338CA", name: "medium" },
            { from: 51, to: 100, color: "#6366F1", name: "high" },
          ],
        },
      },
    },
  };

  return (
    <ReactApexChart options={options} series={series} type="heatmap" height={height} />
  );
}