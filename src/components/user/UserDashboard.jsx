import React from "react";
import LineChart from "./LineChart";
import DropOffChart from "./DropOffChart";
import BarChart from "./BarChart";
import StackedBarChart from "./StackedBarChart";
import PerformanceMatrix from "./PerformanceMatrix";

const UserDashboard = () => {
  return (
    <>
      <LineChart isForDropOff={false} />
      <DropOffChart />
      <BarChart />
      <StackedBarChart />
      <PerformanceMatrix />
    </>
  );
};

export default UserDashboard;
