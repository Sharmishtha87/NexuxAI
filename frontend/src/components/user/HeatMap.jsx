import React, { useEffect, useState } from "react";
import HeatMap from "@uiw/react-heat-map";
import axios from "axios";

const HeatMapProfile = ({ commits = [] }) => {
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    // Count commits per day
    const dateCounts = {};

    commits.forEach(commit => {
      if (commit.createdAt) {
        const d = new Date(commit.createdAt);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;
        dateCounts[date] = (dateCounts[date] || 0) + 1;
      }
    });

    const data = Object.keys(dateCounts).map(date => ({
      date: date,
      count: dateCounts[date]
    }));

    setActivityData(data);
  }, [commits]);

  // Calculate exactly 365 days back (1 year) to perfectly align the month labels
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  // GitHub theme panel colors
  const panelColors = {
    0: "rgba(255, 255, 255, 0.05)",
    1: "#0e4429",
    2: "#006d32",
    3: "#26a641",
    4: "#39d353",
    5: "#39d353"
  };

  return (
    <div style={{ width: "100%", overflowX: "auto", paddingBottom: "10px" }}>
      <div style={{ minWidth: "800px" }}>
        <HeatMap
          className="HeatMapProfile"
          value={activityData}
          weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
          startDate={startDate}
          endDate={endDate}
          rectSize={14}
          space={4}
          rectProps={{
            rx: 3,
          }}
          panelColors={panelColors}
          style={{ color: "var(--text-secondary)", minWidth: "1000px" }}
        />
      </div>
    </div>
  );
};

export default HeatMapProfile;