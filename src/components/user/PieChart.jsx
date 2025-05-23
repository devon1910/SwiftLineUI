import React from "react";
import { Pie } from "react-chartjs-2";

const PieChart = () => {

    const data = {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
          {
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3], //dict should be okay here
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };

  return (
    <div className="p-4 rounded-lg shadow border">
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
