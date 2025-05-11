import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, ArcElement, BarElement, Tooltip, Legend);

const HouseDashboard = () => {
  const { id } = useParams();
  const [view, setView] = useState("day");
  const [house, setHouse] = useState(null);
  const [appliances, setAppliances] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/houses/${id}`)
      .then((res) => setHouse(res.data))
      .catch((err) => console.error("Error fetching house:", err));
  }, [id]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/houses/${id}/appliances?period=${view}`)
      .then((res) => setAppliances(res.data))
      .catch((err) => console.error("Error fetching appliances:", err));
  }, [id, view]);

  if (!house) return <div className="text-center mt-10">Loading...</div>;

  const stats = house.stats?.[view] || {};

  // Doughnut Chart Data: Production vs Consumption
  const doughnutData = {
    labels: ["Production", "Consumption"],
    datasets: [
      {
        data: [
          stats.production || 0,
          stats.consumption || 0
        ],
        backgroundColor: ["#22c55e", "#3b82f6"],
        hoverOffset: 4,
      },
    ],
  };

  const appliancesBarData = {
    labels: house.topAppliances.map((a) => a.appliance),
    datasets: [
      {
        label: "Consumption (kWh)",
        data: house.topAppliances.map((a) => a.consumption),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  // Production vs Consumption Line Graph
  // const timeLabels = view === "day"
  //   ? Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const timeLabels = view === "day"
    ? ["0:00", "3:00", "6:00", "9:00", "12:00", "15:00", "18:00", "21:00"]

    : view === "month"
    ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const productionData = house?.timeSeries?.[view]?.production || Array(timeLabels.length).fill(0);
  const consumptionData = house?.timeSeries?.[view]?.consumption || Array(timeLabels.length).fill(0);

  const productionLineData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Production",
        data: productionData,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
      },
      {
        label: "Consumption",
        data: consumptionData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* View Toggle */}
      <div className="flex gap-2 justify-end">
        {["day", "month", "year"].map((opt) => (
          <button
            key={opt}
            onClick={() => setView(opt)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              view === opt ? "bg-green-600 text-white border-green-600" : "text-gray-700 border-gray-300 hover:bg-gray-200"
            }`}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Production</p>
          <p className="text-2xl font-bold text-green-700">{stats.production || 0} kWh</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Consumption</p>
          <p className="text-2xl font-bold text-blue-700">{stats.consumption || 0} kWh</p>
        </div>
        {/* <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Cost</p>
          <p className="text-2xl font-bold text-gray-800">${stats.cost || 0}</p>
        </div> */}
        {/* <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Green Ratio</p>
          <p className="text-2xl font-bold text-emerald-600">
            0%
          </p>
        </div> */}
      </div>

      {/* Top Appliances + Doughnut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-800 mb-4">Top Appliances</h3>
          <Bar data={appliancesBarData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-800 mb-4">Production vs Consumption</h3>
          <Doughnut data={doughnutData} />
        </div>
      </div>

      {/* Production vs Consumption Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-gray-800 mb-4">
          Energy Trend ({view.charAt(0).toUpperCase() + view.slice(1)})
        </h3>
        <Line data={productionLineData} />
      </div>
    </div>
  );
};

export default HouseDashboard;



