import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import { useDashboardView } from "../../context/DashboardContext";
import axios from "axios";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ApplianceAnalysis = () => {
  const { id } = useParams();
  const { view } = useDashboardView();

  const [appliances, setAppliances] = useState([]);
  const [selectedAppliance, setSelectedAppliance] = useState("All");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/houses/${id}/appliances?period=${view}`)
      .then((res) => {
        setAppliances(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching appliances:", err);
        setAppliances([]);
      });
  }, [id, view]);

  const monthOrder = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Prepare selected data
  let selectedData;
  if (selectedAppliance === "All") {
    const timeMap = new Map();

    appliances.forEach((a) => {
      a.readings.forEach((r) => {
        const time = r.time;
        const consumption = r.consumption;
        timeMap.set(time, (timeMap.get(time) || 0) + consumption);
      });
    });

    const sortedTimes = Array.from(timeMap.keys()).sort((a, b) => {
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });

    selectedData = {
      readings: sortedTimes.map(time => ({
        time,
        consumption: timeMap.get(time)
      }))
    };
  } else {
    selectedData = appliances.find(a => a.appliance === selectedAppliance);
  }

  const chartData = {
    labels: selectedData ? selectedData.readings.map(r => r.time) : [],
    datasets: [
      {
        label: "Energy Usage (kWh)",
        data: selectedData ? selectedData.readings.map(r => r.consumption) : [],
        backgroundColor: "#3b82f6",
      },
    ],
  };

  // Total Energy Used
  const totalEnergyUsed = appliances.reduce((sum, a) =>
    sum + (a.readings?.reduce((innerSum, r) => innerSum + r.consumption, 0) || 0)
  , 0);

  // Flatten appliances for highest and efficient calculation
  const flattenAppliances = appliances.map(a => ({
    appliance: a.appliance,
    consumption: a.readings.reduce((sum, r) => sum + r.consumption, 0)
  }));

  const highest = flattenAppliances.reduce((max, a) => (a.consumption > max.consumption ? a : max), flattenAppliances[0] || {});
  const efficient = flattenAppliances.reduce((min, a) => (a.consumption < min.consumption ? a : min), flattenAppliances[0] || {});

  return (
    <div className="px-6 py-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Appliance Analysis</h1>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-1">Total Energy Used</p>
          <p className="text-3xl font-bold text-red-600">{totalEnergyUsed.toFixed(1)} kWh</p>
          <p className="text-sm text-red-500 mt-1">Across all appliances</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-1">Highest Consumer</p>
          <p className="text-xl font-bold text-gray-800">{highest?.appliance || "-"}</p>
          <p className="text-sm text-gray-400 mt-1">{highest?.consumption?.toFixed(1)} kWh</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-1">Most Efficient</p>
          <p className="text-xl font-bold text-gray-800">{efficient?.appliance || "-"}</p>
          <p className="text-sm text-green-500 mt-1">{efficient?.consumption?.toFixed(1)} kWh</p>
        </div>
      </div>

      {/* Chart with Dropdown */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Appliance Energy Consumption
          </h2>
          <select
            value={selectedAppliance}
            onChange={(e) => setSelectedAppliance(e.target.value)}
            className="text-sm border border-gray-300 rounded px-3 py-1 text-gray-700"
          >
            <option value="All">All</option>
            {appliances.map((a) => (
              <option key={a.appliance} value={a.appliance}>
                {a.appliance}
              </option>
            ))}
          </select>
        </div>
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default ApplianceAnalysis;
