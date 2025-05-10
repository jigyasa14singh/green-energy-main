// client/src/context/DashboardContext.js
import { createContext, useContext, useState } from "react";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [view, setView] = useState("day");

  return (
    <DashboardContext.Provider value={{ view, setView }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardView = () => useContext(DashboardContext);