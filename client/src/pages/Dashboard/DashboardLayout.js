import React from "react";
import { Outlet, useParams, Link, useLocation } from "react-router-dom";
import { ChevronDown, LayoutDashboard, DollarSign, Plug } from "lucide-react";
import { useDashboardView } from "../../context/DashboardContext";

const DashboardLayout = () => {
  const { id } = useParams();
  const location = useLocation();
  const { view, setView } = useDashboardView();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800 font-inter">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          ⚡ EnergyWise
        </div>
        <nav className="flex flex-col px-4 py-6 space-y-2">
          <Link
            to={`/dashboard/${id}`}
            className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 ${
              location.pathname === `/dashboard/${id}` ? "bg-slate-700" : ""
            }`}
          >
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </Link>
          <Link
            to={`/dashboard/${id}/cost`}
            className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 ${
              isActive("cost") ? "bg-slate-700" : ""
            }`}
          >
            <DollarSign size={18} /> <span>Cost Analysis</span>
          </Link>
          <Link
            to={`/dashboard/${id}/appliances`}
            className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 ${
              isActive("appliances") ? "bg-slate-700" : ""
            }`}
          >
            <Plug size={18} /> <span>Appliances</span>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">House {id}</h1>
          </div>

          {/* 🔁 Only show layout toggle on subroutes, not main dashboard */}
          {!location.pathname.endsWith(`/dashboard/${id}`) && (
            <div className="flex gap-2">
              {["day", "month", "year"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setView(opt)}
                  className={`px-4 py-2 text-sm rounded border ${
                    view === opt
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
