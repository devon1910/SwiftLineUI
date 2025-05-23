import { faker } from "@faker-js/faker";
import React from "react";
import { Bar } from "react-chartjs-2";

const StackedBarChart = () => {
  const options = {
    plugins: {
      title: {
        display: true,
        text: "Chart.js Bar Chart - Stacked",
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Dataset 1",
        data: labels.map(() =>
          faker.number.int({ min: -1000, max: 1000 })
        ),
        backgroundColor: "rgb(255, 99, 132)",
      },
      {
        label: "Dataset 2",
        data: labels.map(() =>
          faker.number.int({ min: -1000, max: 1000 })
        ),
        backgroundColor: "rgb(75, 192, 192)",
      },
      {
        label: "Dataset 3",
        data: labels.map(() =>
          faker.number.int({ min: -1000, max: 1000 })
        ),
        backgroundColor: "rgb(53, 162, 235)",
      },
    ],
  };
  return (
    <div className="p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-sage-800 dark:text-gray-100">
        Event Performance Comparison
      </h3>
      <div className="h-64">
        <Bar
          data={data}
          options={options}
        />
      </div>
    </div>
  );
};

export default StackedBarChart;
