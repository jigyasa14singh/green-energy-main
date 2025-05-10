import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale } from "chart.js";
import { BoltIcon, FireIcon } from "@heroicons/react/24/outline";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale);

const HomePage = () => {
  const [houses, setHouses] = useState([]);
  const navigate = useNavigate();
  const [view, setView] = useState("month");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/houses")
      .then((res) => setHouses(res.data))
      .catch((err) => console.error("Error fetching houses:", err));
  }, []);

  const totalProduction = houses.reduce((sum, h) => sum + (h.stats?.[view]?.production || 0), 0);
  const totalConsumption = houses.reduce((sum, h) => sum + (h.stats?.[view]?.consumption || 0), 0);

  const chartData = {
    labels: houses.map((h) => h.name),
    datasets: [
      {
        label: "Production (kWh)",
        data: houses.map((h) => h.stats?.[view]?.production || 0),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Consumption (kWh)",
        data: houses.map((h) => h.stats?.[view]?.consumption || 0),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-100 px-6 py-8">
      {/* Title and View Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        <h1 className="text-5xl font-extrabold text-green-700 text-center tracking-wide">
          ⚡ Community Energy Dashboard
        </h1>
        <div className="flex gap-2 mt-4 md:mt-0">
          {["day", "month", "year"].map((option) => (
            <button
              key={option}
              onClick={() => setView(option)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                view === option
                  ? "bg-green-600 text-white border-green-600"
                  : "text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg border-t-4 border-green-500 transition-all flex items-center gap-4">
          <BoltIcon className="w-10 h-10 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Total Production</p>
            <p className="text-2xl font-bold text-green-700">{totalProduction} kWh</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg border-t-4 border-blue-500 transition-all flex items-center gap-4">
          <FireIcon className="w-10 h-10 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Total Consumption</p>
            <p className="text-2xl font-bold text-blue-700">{totalConsumption} kWh</p>
          </div>
        </div>
      </div>

      {/* Line Graph */}
      <div className="bg-white rounded-xl shadow p-6 max-w-6xl mx-auto mb-12 border border-green-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Energy Production vs Consumption - {view.charAt(0).toUpperCase() + view.slice(1)} View
        </h2>
        <Line data={chartData} />
      </div>

      {/* House Cards */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🏘️ Houses Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {houses.map((house) => (
          <div
            key={house.id} // ✅ Corrected
            onClick={() => navigate(`/dashboard/${house.id}`)} // ✅ Corrected
            className="bg-white hover:bg-green-50 hover:scale-[1.02] rounded-xl shadow-lg p-5 cursor-pointer transition-all border-l-4 border-green-400"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-1">{house.name}</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-medium text-green-600">⚡ Production:</span>{" "}
                {house.stats?.[view]?.production || 0} kWh
              </p>
              <p>
                <span className="font-medium text-blue-600">🔌 Consumption:</span>{" "}
                {house.stats?.[view]?.consumption || 0} kWh
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-400 mt-12">
        © 2025 EnergyWise • Smart Energy for a Greener Future 🌍
      </footer>
    </div>
  );
};

export default HomePage;