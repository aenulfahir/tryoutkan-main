import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import type { SectionResult } from '@/types/tryout';

interface ScoreDistributionChartProps {
  sectionResults: SectionResult[];
}

export function ScoreDistributionChart({ sectionResults }: ScoreDistributionChartProps) {
  const options: Highcharts.Options = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Skor per Bagian',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
      },
    },
    xAxis: {
      categories: sectionResults.map((s) => s.section_name),
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Skor',
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.y:.0f}',
        },
      },
    },
    series: [
      {
        name: 'Skor Anda',
        type: 'column',
        data: sectionResults.map((s) => parseFloat(s.score.toString())),
        color: '#3b82f6',
      },
      {
        name: 'Skor Maksimal',
        type: 'column',
        data: sectionResults.map((s) => parseFloat(s.max_score.toString())),
        color: '#e5e7eb',
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

