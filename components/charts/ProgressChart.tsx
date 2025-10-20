import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import type { TryoutResult } from "@/types/tryout";

interface ProgressChartProps {
  results: TryoutResult[];
}

export function ProgressChart({ results }: ProgressChartProps) {
  const sortedResults = [...results].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const options: Highcharts.Options = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
    },
    title: {
      text: "Progress Skor dari Waktu ke Waktu",
      style: {
        fontSize: "18px",
        fontWeight: "bold",
      },
    },
    xAxis: {
      categories: sortedResults.map((r) =>
        new Date(r.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        })
      ),
      crosshair: true,
    },
    yAxis: {
      title: {
        text: "Skor (%)",
      },
      min: 0,
      max: 100,
      plotLines: [
        {
          value: 65,
          color: "#10b981",
          dashStyle: "Dash",
          width: 2,
          label: {
            text: "Passing Grade",
            align: "right",
            style: {
              color: "#10b981",
            },
          },
        },
      ],
    },
    tooltip: {
      shared: true,
      useHTML: true,
      formatter: function () {
        const point = this.points?.[0];
        if (!point) return "";

        const result = sortedResults[(point as any).point.index];
        return `
          <b>${result.tryout_packages?.title || "Tryout"}</b><br/>
          Tanggal: ${new Date(result.created_at).toLocaleDateString(
            "id-ID"
          )}<br/>
          Skor: <b>${point.y?.toFixed(1)}%</b><br/>
          Rank: #${result.rank_position || "-"}
        `;
      },
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true,
          format: "{point.y:.0f}%",
        },
        enableMouseTracking: true,
      },
    },
    series: [
      {
        name: "Skor",
        type: "line",
        data: sortedResults.map((r) => parseFloat(r.percentage.toString())),
        color: "#3b82f6",
        marker: {
          enabled: true,
          radius: 4,
        },
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
