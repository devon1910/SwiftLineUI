
import React from "react";
import { Bar } from "react-chartjs-2";

const StackedBarChart = ({EventComparisonData}) => {
  const options = {
    plugins: {
      title: {
        display: false,
       
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

    let labels = [];
    let attendeesValues = [];
    let totalServedValues = [];
    let dropOffRateValues = [];

  if(EventComparisonData){
   labels = EventComparisonData.totalAttendees.map((item) => item.eventName);
   attendeesValues = EventComparisonData.totalAttendees.map((item) => item.count);
   totalServedValues = EventComparisonData.totalServed.map((item) => item.count);
   dropOffRateValues = EventComparisonData.dropOffRate.map((item) => item.count);
  }

//   const data = {
//     Label,
//     datasets: [
//       {
//         label: "Total Attendance",
//         data: attendeesValues,
//         backgroundColor: "rgb(255, 99, 132)",
//       },
//       {
//         label: "Total Served",
//         data: totalServedValues,
//         backgroundColor: "rgb(75, 192, 192)",
//       },
//       {
//         label: "Drop Off Rate",
//         data: dropOffRateValues,
//         backgroundColor: "rgb(53, 162, 235)",
//       },
//     ],
//   };

//const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

const data = {
    labels,
  datasets: [
    {
      label: 'Total Attendance',
      data: attendeesValues,
      backgroundColor: 'rgb(255, 99, 132)',
    },
    {
      label: 'Total Served',
      data: totalServedValues,
      backgroundColor: 'rgb(75, 192, 192)',
    },
    {
      label: 'Drop Off Rate(%)',
      data: dropOffRateValues,
      backgroundColor: 'rgb(53, 162, 235)',
    },
  ],
};


  return (
    <div className="p-4 rounded-lg shadow border">
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
