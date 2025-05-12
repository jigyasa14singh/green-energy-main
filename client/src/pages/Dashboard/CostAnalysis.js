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

const CostAnalysis = () => {
  const { id } = useParams();
  const { view } = useDashboardView();

  const [costDetails, setCostDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/houses/${id}/costs?period=${view}`)
      .then((res) => {
        setCostDetails(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cost details:", err);
        setLoading(false);
      });
  }, [id, view]);

  if (loading) return <div>Loading...</div>;

  const timeBasedCosts = [];
  const applianceCosts = [];

  costDetails.forEach((item) => {
    const label = item["Time/Appliance"]?.toString() ?? "";
    const consumptionCost = item["Consumption Cost / Contribution (%)"] ?? 0;
    const productionCost = item["Production Cost ($)"] ?? 0;

    if (isTimeLabel(label, view)) {
      timeBasedCosts.push({
        label,
        consumptionCost,
        productionCost,
      });
    } else {
      applianceCosts.push({
        label,
        consumptionCost,
      });
    }
  });

  const xLabels = getXAxisLabels(view);
  const consumptionData = xLabels.map((label) => {
    const found = timeBasedCosts.find((item) => item.label === label);
    return found ? found.consumptionCost : 0;
  });
  const productionData = xLabels.map((label) => {
    const found = timeBasedCosts.find((item) => item.label === label);
    return found ? found.productionCost : 0;
  });

  const chartData = {
    labels: xLabels,
    datasets: [
      {
        label: "Production Cost (₹)",
        data: productionData,
        backgroundColor: "#22c55e",
      },
      {
        label: "Consumption Cost (₹)",
        data: consumptionData,
        backgroundColor: "#f97316",
      },
    ],
  };

  const totalConsumption = consumptionData.reduce((sum, val) => sum + val, 0);
  const energyCostPerKWh = 0.2;

  const sortedAppliances = [...applianceCosts].sort((a, b) => a.consumptionCost - b.consumptionCost);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Energy Cost Analysis - {view.charAt(0).toUpperCase() + view.slice(1)}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-1">Current {view} Cost</p>
          <p className="text-3xl font-bold text-green-600">₹{totalConsumption.toFixed(2)}</p>
          {/* <p className="text-sm text-green-500 mt-1">vs previous {view}</p> */}
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-1">Energy Cost per kWh</p>
          <p className="text-3xl font-bold text-gray-800">₹{energyCostPerKWh.toFixed(3)}</p>
          <p className="text-sm text-gray-400 mt-1">Auto-calculated</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{view} Appliance Cost Breakdown</h3>
          <ul className="space-y-3 text-sm">
            {sortedAppliances.map((item, index) => {
              const percentage = (item.consumptionCost / totalConsumption) * 100;
              const gradientStrength = Math.min(100, Math.floor((index / sortedAppliances.length) * 100));
              return (
                <li key={index} className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-700 font-medium">
                    <span>{item.label}</span>
                    <span>₹{item.consumptionCost.toFixed(2)}</span>
                  </div>
                  <div
                    className="h-2 rounded"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(to right, #fde68a, #f97316 ${gradientStrength}%)`,
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Energy Production vs Consumption
            </h3>
          </div>
          <Bar data={chartData} />
        </div>
      </div>
    </div>
  );
};

function isTimeLabel(label, view) {
  if (view === "day") return label.includes(":");
  if (view === "month") return /^[0-9]+$/.test(label);
  if (view === "year") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.includes(label);
  }
  return false;
}

function getXAxisLabels(view) {
  if (view === "day") return ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];
  if (view === "month") return Array.from({ length: 30 }, (_, i) => (i + 1).toString());
  if (view === "year") return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return [];
}

export default CostAnalysis;
