import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import { API_BASE_URL } from "config/constant";

function ColonyMockMap() {
  const { project_id } = useParams();
  const containerRef = useRef(null);
  const [apiPlots, setApiPlots] = useState([]);

  useEffect(() => {
    const fetchProjectPlots = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("users") || "{}");
        
        // API CALL - Same as Projectview
        const queryParts = [
          `project_id=${project_id}`,
          `filter=all`,
          `page=1`,
          `limit=100`,
        ].join("&");

        const url = `${API_BASE_URL}/dashboard/ProjectDetails?${queryParts}`;

        const response = await fetch(url, {
          headers: { Authorization: userData?.user_token || "" },
        });

        const result = await response.json();
        
        // 📦 Convert API data to format HTML expects
        const plotsData = result?.data || [];
        
        // 🔥 CRITICAL: Format data with is_booked flag for coloring
        const formattedPlots = plotsData.map(plot => ({
          plot_id: plot.plot_id,
          plot_no: plot.plot_no,
          sector_name: plot.sector_name,
          plot_height: plot.plot_height,
          plot_width: plot.plot_width,
          square_feet: plot.square_feet,
          plot_rate: plot.plot_rate,
          amount: plot.amount,
          // ✅ Check if plot has booking - for red/green coloring
          is_booked: (plot.bookings && plot.bookings.length > 0) ? 1 : 0,
          status: (plot.bookings && plot.bookings.length > 0) ? 'Booked' : 'Available',
          booking: plot.bookings && plot.bookings.length > 0 ? plot.bookings[0] : null
        }));
        
        setApiPlots(formattedPlots);
        
        // 🌍 Set global variable for HTML scripts (with formatted data)
        window.projectPlots = formattedPlots;
        
        // Load HTML after data is ready
        await loadHTML();
        
      } catch (err) {
        console.error("API call failed:", err);
        window.projectPlots = [];
        await loadHTML();
      }
    };

    const loadHTML = async () => {
      try {
        const htmlPath = Number(project_id) === 49
          ? "/html/index.html"
          : "/html/rameshwarm-market-map.html";

        const response = await fetch(htmlPath);

        if (!response.ok) {
          throw new Error(`Failed to load HTML: ${response.status}`);
        }

        let html = await response.text();

        if (!containerRef.current) return;

        // Inject HTML
        containerRef.current.innerHTML = html;

        // Remove old scripts
        containerRef.current
          .querySelectorAll("script")
          .forEach((s) => s.remove());

        // Parse and run scripts
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const scripts = doc.querySelectorAll("script");

        for (const oldScript of scripts) {
          const newScript = document.createElement("script");
          
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });

          if (oldScript.src) {
            await new Promise((resolve, reject) => {
              newScript.src = oldScript.src;
              newScript.onload = resolve;
              newScript.onerror = reject;
              document.body.appendChild(newScript);
            });
          } else {
            newScript.textContent = oldScript.textContent;
            document.body.appendChild(newScript);
          }
        }
        
        // ✅ Force apply colors after scripts run
        setTimeout(() => {
          if (typeof applyPlotColors === 'function') {
            applyPlotColors();
          }
          console.log("✅ Map loaded with", formattedPlots.length, "plots");
        }, 200);
        
      } catch (err) {
        console.error("HTML load failed:", err);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">
            <h3>Error Loading Map</h3>
            <p>${err.message}</p>
          </div>`;
        }
      }
    };

    fetchProjectPlots();
  }, [project_id]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#f5f5f5",
      }}
    />
  );
}

export default ColonyMockMap;