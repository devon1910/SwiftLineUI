import React from "react";
import LineChart from "./LineChart";
import PieChart from "./PieChart";

const DropOffChart = ({dropOffRateTrend, dropOffReasons}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <LineChart isForDropOff={true} dropOffRateTrend={dropOffRateTrend} />
     <PieChart dropOffReasons={dropOffReasons}/>

    </div>
  );
};

export default DropOffChart;
