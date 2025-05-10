const express = require('express');
const router = express.Router();

// GET all houses for HomePage
router.get('/', (req, res) => {
  const { housesData } = req;
  res.json(housesData);
});

router.get('/:id', (req, res) => {
  const { housesData, appliancesData } = req;
  const house = housesData.find((h) => h.id === req.params.id);

  if (!house) {
    return res.status(404).json({ error: 'House not found' });
  }

  // --- Top Appliances Section ---
  const topAppliances = appliancesData
    .filter((row) =>
      String(row['House'] || "").trim() === house.name &&
      String(row['Section'] || "").trim() === 'Top Appliance'
    )
    .map((row) => ({
      appliance: String(row['Label/Time'] || "").trim(),
      consumption: Number(row['Production/Usage']) || 0,
    }))
    .sort((a, b) => b.consumption - a.consumption)
    .slice(0, 5);

  // --- Time Series Section ---
  const timeSeriesRows = appliancesData
    .filter((row) =>
      String(row['House'] || "").trim() === house.name &&
      String(row['Section'] || "").trim() === 'Time Series'
    );

  const dayTrend = { labels: [], production: [], consumption: [] };
  const monthTrend = { labels: [], production: [], consumption: [] };
  const yearTrend = { labels: [], production: [], consumption: [] };

  timeSeriesRows.forEach((row) => {
    const timeType = String(row['Time Type/Other'] || "").trim().toLowerCase();
    const label = String(row['Label/Time'] || "").trim();
    const production = Number(row['Production/Usage']) || 0;
    const consumption = Number(row['Consumption']) || 0;

    if (timeType === 'daywise') {
      dayTrend.labels.push(label);
      dayTrend.production.push(production);
      dayTrend.consumption.push(consumption);
    } else if (timeType === 'monthwise') {
      monthTrend.labels.push(label);
      monthTrend.production.push(production);
      monthTrend.consumption.push(consumption);
    } else if (timeType === 'yearwise') {
      yearTrend.labels.push(label);
      yearTrend.production.push(production);
      yearTrend.consumption.push(consumption);
    }
  });

  res.json({
    id: house.id,
    name: house.name,
    stats: house.stats,
    topAppliances,
    timeSeries: {
      day: dayTrend,
      month: monthTrend,
      year: yearTrend,
    },
  });
});

router.get('/:id/appliances', (req, res) => {
  const { applianceAnalysisData, housesData } = req;
  const { period = 'day' } = req.query;
  const house = housesData.find((h) => h.id === req.params.id);

  if (!house) {
    return res.status(404).json({ error: 'House not found' });
  }

  const filtered = applianceAnalysisData.filter((row) =>
    (row['House'] || "").trim().toLowerCase() === (house.name || "").trim().toLowerCase() &&
    (row['Time Type'] || "").trim().toLowerCase() === `${period}wise`
  );

  //console.log(✅ Filtered Appliance Data for period=${period}:, filtered); // <-- ADD HERE

  if (!filtered.length) {
    return res.json([]);
  }

  const appliancesMap = {};

  filtered.forEach((entry) => {
    const applianceName = (entry['Appliance'] || "").trim();
    const time = (entry['Time'] || "").toString().trim();
    const consumption = Number(entry['Consumption (kWh)']) || 0;

    // Extra safe guard
    if (!applianceName || !time  || consumption === 0) {
      return; // skip invalid rows
    }

    if (!appliancesMap[applianceName]) {
      appliancesMap[applianceName] = [];
    }

    appliancesMap[applianceName].push({
      time,
      consumption
    });
  });

  const result = Object.keys(appliancesMap).map((applianceName) => ({
    appliance: applianceName,
    readings: appliancesMap[applianceName],
  }));

  //console.log(✅ Final Appliances JSON for period=${period}:, result); // <-- ADD HERE

  res.json(result);
});

// (Optional) GET cost data for Cost Analysis
router.get('/:id/costs', (req, res) => {
  const { costData, housesData } = req;
  const { period = 'day' } = req.query;
  const house = housesData.find((h) => h.id === req.params.id);

  if (!house) {
    return res.status(404).json({ error: 'House not found' });
  }

  const filteredCosts = costData.filter((row) =>
    row['House'] === house.name &&
    row['Time Type'].toLowerCase() ===`${period}wise`
  );

  res.json(filteredCosts);
});

module.exports = router;