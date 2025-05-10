const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Memory Data Holders
let housesData = [];
let appliancesData = [];
let costData = [];
let applianceAnalysisData = [];

// Load Excel file and Parse Correctly
function loadExcelData() {
  const workbook = xlsx.readFile(path.join(__dirname, 'data', 'energy_dashboard_final_data_corrected.xlsx'));

  // -------------- Load Page1_Overview (for HomePage) ---------------
  const overviewSheet = xlsx.utils.sheet_to_json(workbook.Sheets['Page1_Overview']);

  const houseMap = {};

  overviewSheet.forEach((row) => {
    const houseName = row['House'];
    if (!houseMap[houseName]) {
      houseMap[houseName] = {
        id: houseName.replace(/\s+/g, '_').toLowerCase(), // Redwood House -> redwood_house
        name: houseName,
        stats: { day: {}, month: {}, year: {} },
      };
    }

    const timeType = row['Time Type'].toLowerCase();
    if (timeType === 'daywise') {
      houseMap[houseName].stats.day = {
        production: row['Production (kWh)'] || 0,
        consumption: row['Consumption (kWh)'] || 0,
      };
    } else if (timeType === 'monthwise') {
      houseMap[houseName].stats.month = {
        production: row['Production (kWh)'] || 0,
        consumption: row['Consumption (kWh)'] || 0,
      };
    } else if (timeType === 'yearwise') {
      houseMap[houseName].stats.year = {
        production: row['Production (kWh)'] || 0,
        consumption: row['Consumption (kWh)'] || 0,
      };
    }
  });

  housesData = Object.values(houseMap);

  // -------------- Load Page2_HouseDashboard (Top Appliances) ---------------
  appliancesData = xlsx.utils.sheet_to_json(workbook.Sheets['Page2_HouseDashboard']);

  // -------------- Load Page3_CostAnalysis (Cost Graphs) ---------------
  costData = xlsx.utils.sheet_to_json(workbook.Sheets['Page3_CostAnalysis']);

  // -------------- Load Page4_ApplianceAnalysis (Appliance Usage) ---------------
  applianceAnalysisData = xlsx.utils.sheet_to_json(workbook.Sheets['Page4_ApplianceAnalysis']);
}

// Load Excel Data at Server Start
loadExcelData();

// API Routes
const houseRoutes = require('./routes/houses');
app.use('/api/houses', (req, res, next) => {
  req.housesData = housesData;
  req.appliancesData = appliancesData;
  req.costData = costData;
  req.applianceAnalysisData = applianceAnalysisData;
  next();
}, houseRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});