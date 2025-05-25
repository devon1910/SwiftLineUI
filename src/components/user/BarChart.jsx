
import React from "react";
import { Bar } from "react-chartjs-2";

const BarChart = ({peakArrivalPeriodData}) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
  };

  const PeriodsOfDay = [
    "Morning",
    "Afternoon",
    "Evening",
    "Night",
  ];
  const labels = peakArrivalPeriodData.map((item) => PeriodsOfDay[item.timeOfDay]);
  const values = peakArrivalPeriodData.map((item) => item.count);

  const data = {
    labels,
    datasets: [
      {
        label: "Arrivals",
        data: values,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      
    ],
  };
  return (
    <div className="p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-sage-800 dark:text-gray-100">
        Peak Arrival Periods
      </h3>
      <div className="h-64">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
};

export default BarChart;
