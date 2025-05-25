
import React from "react";
import { Line } from "react-chartjs-2";

const LineChart = ({ isForDropOff, attendanceData, dropOffRateTrend }) => {

  
  let labels = [];
  let data = null;
  let options = null;
  if (isForDropOff) {
    options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: false,
          // text: 'Chart.js Line Chart',
        },

      },
    };

    labels = dropOffRateTrend.map((item) => monthNames[item.month]);
    const dropOffTrend = dropOffRateTrend.map((item) => item.dropOffRate);
    data = {
      labels,
      datasets: [
        {
          fill: true,
          label: "Drop off rate",
          data: dropOffTrend,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
      ],
    };
  } else {
    labels = attendanceData.map((item) => monthNames[item.month]);
    const attendees = attendanceData.map((item) => item.attendeesCount);
    const served = attendanceData.map((item) => item.servedCount);

    options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: false,
          text: "Chart.js Line Chart",
        },
      },
    };
    data = {
      labels,
      datasets: [
        {
          label: "Attendees",
          data: attendees,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
        {
          label: "Served",
          data: served,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
      ],
    };
  }

  return (
    <div className="space-y-8">
      {/* Chart 1: Total attendees vs served over time */}
      <div className="p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          {isForDropOff
            ? "Drop-off Rate Trend"
            : "Attendees vs Served Over Time"}
        </h3>
        <div className="h-64">
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

const monthNames = [
    null, // Placeholder for index 0
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  
export default LineChart;
