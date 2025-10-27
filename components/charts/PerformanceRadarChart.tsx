import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useEffect, useState } from "react";
import type { SectionResult } from "@/types/tryout";
import "highcharts/highcharts-more";

// Initialize highcharts-more for polar charts
// The import above automatically initializes Highcharts with additional chart types

interface PerformanceRadarChartProps {
  sectionResults: SectionResult[];
}

export function PerformanceRadarChart({
  sectionResults,
}: PerformanceRadarChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        Loading chart...
      </div>
    );
  }

  const options: Highcharts.Options = {
    chart: {
      polar: true,
      type: "line",
      backgroundColor: "transparent",
    },
    title: {
      text: "Analisis Performa",
      style: {
        fontSize: "18px",
        fontWeight: "bold",
      },
    },
    pane: {
      size: "80%",
    },
    xAxis: {
      categories: sectionResults.map((s) => s.section_name),
      tickmarkPlacement: "on",
      lineWidth: 0,
    },
    yAxis: {
      gridLineInterpolation: "polygon",
      lineWidth: 0,
      min: 0,
      max: 100,
      labels: {
        format: "{value}%",
      },
    },
    tooltip: {
      shared: true,
      pointFormat:
        '<span style="color:{series.color}">{series.name}: <b>{point.y:.1f}%</b><br/>',
    },
    legend: {
      align: "center",
      verticalAlign: "bottom",
      layout: "horizontal",
    },
    series: [
      {
        name: "Skor Anda",
        type: "line",
        data: sectionResults.map((s) => parseFloat(s.percentage.toString())),
        pointPlacement: "on",
        color: "#3b82f6",
      },
      {
        name: "Passing Grade",
        type: "line",
        data: sectionResults.map(() => 65),
        pointPlacement: "on",
        color: "#10b981",
        dashStyle: "Dash",
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return (
    <div className="w-full">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}
