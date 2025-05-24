import React from "react";
import LineChart from "./LineChart";
import DropOffChart from "./DropOffChart";
import BarChart from "./BarChart";
import StackedBarChart from "./StackedBarChart";
import PerformanceMatrix from "./PerformanceMatrix";

const UserDashboard = () => {
  return (
    <>
      
      <StackedBarChart />
      <PerformanceMatrix />
    </>
  );
};

export default UserDashboard;
