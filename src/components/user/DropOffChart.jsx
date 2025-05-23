import React from "react";
import { faker } from "@faker-js/faker";
import { Line } from "react-chartjs-2";
import LineChart from "./LineChart";
import PieChart from "./PieChart";

const DropOffChart = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <LineChart isForDropOff={true} />
     <PieChart />

    </div>
  );
};

export default DropOffChart;
