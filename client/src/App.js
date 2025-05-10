import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DashboardProvider } from "./context/DashboardContext";
import HomePage from "./pages/HomePage";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import HouseDashboard from "./pages/Dashboard/HouseDashboard";
import CostAnalysis from "./pages/Dashboard/CostAnalysis";
import { useEffect, useState } from "react";
import ApplianceAnalysis from "./pages/Dashboard/ApplianceAnalysis";

const App = () => {
  const [houses, setHouses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/houses")
      .then((res) => res.json())
      .then((data) => setHouses(data));
  }, []);

  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage houses={houses} />} />

        {/* Dashboard Layout with Nested Routes */}
        <Route
          path="/dashboard/:id"
          element={
            <DashboardProvider>
              <DashboardLayout />
            </DashboardProvider>
          }
        >
          <Route index element={<HouseDashboard />} />
          <Route path="cost" element={<CostAnalysis />} />
          <Route path="appliances" element={<ApplianceAnalysis />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;