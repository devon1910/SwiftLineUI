import React from "react";
import { Pie } from "react-chartjs-2";

const PieChart = ({dropOffReasons}) => {

    const generateBeautifulChartColors = (count) => {
        const goldenRatio = 0.618033988749;
        
        return Array.from({ length: count }, (_, i) => {
          const hue = (i * goldenRatio * 360) % 360;
          const saturation = 75 + (i % 3) * 8;
          const lightness = 55 + (i % 4) * 5;
          
          return {
            bg: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.2)`,
            border: `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`,
          };
        });
      };
      
      const colors = generateBeautifulChartColors(dropOffReasons.length);
      
      const data = {
        labels: dropOffReasons.map((reason) => reason.reason),
        datasets: [{
          label: '# of Reasons',
          data: dropOffReasons.map((reason) => reason.count),
          backgroundColor: colors.map(c => c.bg),
          borderColor: colors.map(c => c.border),
          borderWidth: 1,
        }],
      };

  return (
    <div className="p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-sage-800 dark:text-gray-100">
        Drop-off Reasons
      </h3>
      <div className="h-64">
        <Pie
          data={data}      
        />
      </div>
    </div>
  );
};

export default PieChart;
