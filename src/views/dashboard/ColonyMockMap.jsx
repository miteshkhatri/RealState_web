import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import { API_BASE_URL } from "config/constant";
import defaultMapHtml from '../../assets/map-html/index.html?raw';
import rameshwarmMapHtml from '../../assets/map-html/rameshwarm-market-map.html?raw';

function ColonyMockMap() {
  const { project_id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [apiPlots, setApiPlots] = useState([]);
  const projectDetailsRef = useRef({ name: '', krutiDev_font: 0 });
  const fullProjectDataRef = useRef(null);
  const [wrapperHeight, setWrapperHeight] = useState(null);
  const [wrapperOffset, setWrapperOffset] = useState(0);

  // 📐 Fit the map exactly into the space below the header (no empty area under the bottom scrollbar)
  useLayoutEffect(() => {
    const updateHeight = () => {
      const el = containerRef.current;
      if (!el) return;
      // Top of the map without any previously applied header offset
      const currentOffset = parseFloat(el.style.marginTop) || 0;
      const naturalTop = el.getBoundingClientRect().top + window.scrollY - currentOffset;
      // On mobile the header is fixed and can be taller than the space reserved for it
      const header = document.querySelector("header.pcoded-header");
      const headerBottom = header ? header.getBoundingClientRect().bottom + window.scrollY : 0;
      const offset = Math.max(0, Math.ceil(headerBottom - naturalTop));
      setWrapperOffset(offset);
      setWrapperHeight(Math.max(300, Math.floor(window.innerHeight - naturalTop - offset)));
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    const timer = setTimeout(updateHeight, 300);

    let observer = null;
    const header = document.querySelector("header.pcoded-header");
    if (header && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateHeight);
      observer.observe(header);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, []);

  // 🎯 Listen for booking requests from the interactive map modal
  useEffect(() => {
    const handleBookPlot = (e) => {
      const plot = e?.detail || e;
      if (!plot) return;

      const rowData = {
        ...plot,
        project_id: plot.project_id || Number(project_id),
        sector_id: plot.sector_id,
        plot_id: plot.plot_id,
        plot_no: plot.plot_no,
        plot_rate: plot.plot_rate,
        square_feet: plot.square_feet,
        krutiDev_font: plot.krutiDev_font,
      };

      navigate("/bookings/add", {
        state: {
          oneRow: rowData,
          data: [rowData],
        },
      });
    };

    window.addEventListener("mapBookPlot", handleBookPlot);
    window.handleBookPlotFromMap = handleBookPlot;

    // 🎯 Listen for plot creation requests from interactive map modal
    const handleCreatePlot = (e) => {
      const plotInfo = e?.detail || e;
      if (!plotInfo) return;

      let plotWidth = '';
      let plotHeight = '';
      if (plotInfo.shopSize) {
        const matches = plotInfo.shopSize.match(/(\d+)'(?:00")?\s*[×x]\s*(\d+)'/);
        if (matches) {
          plotWidth = matches[1];
          plotHeight = matches[2];
        }
      }

      const realName =
        projectDetailsRef.current?.name ||
        window.currentProjectName ||
        (() => {
          try {
            const sp = JSON.parse(localStorage.getItem('ProjectData') || '{}');
            return (sp?.project_id == project_id && sp?.name !== 'Rameshwarm Market') ? sp.name : '';
          } catch (e) {
            return '';
          }
        })() ||
        '';

      const realFont =
        projectDetailsRef.current?.krutiDev_font ??
        window.currentProjectFont ??
        0;

      const existingProj = (() => {
        try {
          return JSON.parse(localStorage.getItem('ProjectData') || '{}');
        } catch (e) {
          return {};
        }
      })();

      const projectDataToStore = {
        ...(existingProj?.project_id == project_id ? existingProj : {}),
        project_id: Number(project_id),
        name: realName || (existingProj?.project_id == project_id && existingProj?.name !== 'Rameshwarm Market' ? existingProj.name : '') || '',
        project_name: realName || (existingProj?.project_id == project_id && existingProj?.name !== 'Rameshwarm Market' ? existingProj.name : '') || '',
        krutiDev_font: realFont,
      };

      try {
        localStorage.setItem('ProjectData', JSON.stringify(projectDataToStore));
      } catch (err) {}

      // 🎯 Clean plot_no: remove sector prefix (e.g. "E-17" -> "17")
      let cleanPlotNo = String(plotInfo.pure_plot_no || plotInfo.plot_no || '').trim();
      const secName = String(plotInfo.section || '').trim();
      if (secName && cleanPlotNo.toUpperCase().startsWith(secName.toUpperCase())) {
        cleanPlotNo = cleanPlotNo.replace(new RegExp(`^${secName}[-_\\s]*`, 'i'), '');
      } else if (cleanPlotNo.includes('-')) {
        cleanPlotNo = cleanPlotNo.split('-').slice(1).join('-');
      }

      navigate("/projects/plots", {
        state: {
          data: projectDataToStore,
          newPlot: {
            plot_no: cleanPlotNo,
            pure_plot_no: cleanPlotNo,
            sector_name: plotInfo.section,
            plot_width: plotWidth,
            plot_height: plotHeight,
            project_id: Number(project_id),
            project_name: projectDataToStore.name,
            krutiDev_font: realFont,
          },
        },
      });
    };

    window.addEventListener("mapCreatePlot", handleCreatePlot);
    window.handleCreatePlotFromMap = handleCreatePlot;

    // 🎯 Listen for request to open Update Project with new sector pre-filled
    const handleOpenUpdateProject = (e) => {
      const info = e?.detail || e;
      if (!info) return;

      const sectorName = String(info.section || '').trim();
      const existingProj = (() => {
        try {
          return JSON.parse(localStorage.getItem('ProjectData') || '{}');
        } catch (err) {
          return {};
        }
      })();

      const projectDataToPass = fullProjectDataRef.current || (existingProj?.project_id == project_id ? existingProj : { project_id: Number(project_id), name: window.currentProjectName || '' });

      navigate('/projects/createproject', {
        state: {
          data: projectDataToPass,
          mode: 'edit',
          newSectorName: sectorName,
          returnUrl: `/project/map/${project_id}`,
        }
      });
    };

    window.addEventListener("mapAddSector", handleOpenUpdateProject);
    window.handleAddSectorFromMap = handleOpenUpdateProject;

    return () => {
      window.removeEventListener("mapBookPlot", handleBookPlot);
      delete window.handleBookPlotFromMap;
      window.removeEventListener("mapCreatePlot", handleCreatePlot);
      delete window.handleCreatePlotFromMap;
      window.removeEventListener("mapAddSector", handleOpenUpdateProject);
      delete window.handleAddSectorFromMap;
    };
  }, [navigate, project_id]);

  useEffect(() => {
    const fetchProjectPlots = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("users") || "{}");
        
        // API CALL - Same as Projectview
        const queryParts = [
          `project_id=${project_id}`,
          `filter=all`,
          `page=1`,
          `limit=1000`,
        ].join("&");

        const url = `${API_BASE_URL}/dashboard/ProjectDetails?${queryParts}`;

        // Fetch statuses dictionary, project plots and plots list in parallel
        const [statusesRes, projectDetailsRes, plotsListRes] = await Promise.all([
          fetch(`${API_BASE_URL}/plots/statuses`, {
            headers: { Authorization: userData?.user_token || "" },
          }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
          fetch(url, {
            headers: { Authorization: userData?.user_token || "" },
          }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
          fetch(`${API_BASE_URL}/plots/list?project_id=${project_id}&showBooked=1`, {
            headers: { Authorization: userData?.user_token || "" },
          }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
        ]);

        const statusLookup = {};
        if (statusesRes?.data && Array.isArray(statusesRes.data)) {
          statusesRes.data.forEach(s => {
            if (s.id) statusLookup[s.id] = s.name;
          });
        }

        const plotsListMap = {};
        if (plotsListRes?.data && Array.isArray(plotsListRes.data)) {
          plotsListRes.data.forEach(p => {
            if (p.plot_id) plotsListMap[p.plot_id] = p;
          });
        }

        // 📦 Convert API data to format HTML expects
        const plotsData = projectDetailsRes?.data || [];
        
        // 🔥 CRITICAL: Format data with accurate status (Available, Booked, Hold, Completed, etc.)
        const formattedPlots = plotsData.map(plot => {
          const listPlot = plotsListMap[plot.plot_id] || {};
          const statusId = plot.status_id || listPlot.status_id;
          const statusName = plot.status_name || listPlot.status_name || (statusId ? statusLookup[statusId] : '');
          const hasBooking = (plot.bookings && plot.bookings.length > 0) || Boolean(plot.booking_id);
          const isComplete = plot.calculatedStatus === 'completed' || listPlot.status === 'completed';

          let finalStatus = 'Available';
          let finalStatusKey = 'available';

          const sRaw = String(statusName || listPlot.status || plot.status || '').trim().toLowerCase();

          if (isComplete) {
            finalStatus = 'Completed';
            finalStatusKey = 'completed';
          } else if (hasBooking) {
            finalStatus = 'Booked';
            finalStatusKey = 'booked';
          } else if (sRaw.includes('hold')) {
            finalStatus = 'Hold';
            finalStatusKey = 'hold';
          } else if (sRaw.includes('book')) {
            finalStatus = 'Booked';
            finalStatusKey = 'booked';
          } else if (sRaw.includes('complete') || sRaw.includes('regist')) {
            finalStatus = 'Completed';
            finalStatusKey = 'completed';
          } else if (sRaw.includes('uit')) {
            finalStatus = 'UIT Reserve';
            finalStatusKey = 'uit_reserve';
          } else if (sRaw.includes('npc')) {
            finalStatus = 'NPC';
            finalStatusKey = 'npc';
          } else if (sRaw === 'np') {
            finalStatus = 'NP';
            finalStatusKey = 'np';
          } else if (sRaw.includes('sold')) {
            finalStatus = 'Sold';
            finalStatusKey = 'sold';
          } else if (sRaw.includes('block')) {
            finalStatus = 'Blocked';
            finalStatusKey = 'blocked';
          } else if (sRaw.includes('reserv')) {
            finalStatus = 'Reserved';
            finalStatusKey = 'reserved';
          } else if (sRaw.includes('pend')) {
            finalStatus = 'Pending';
            finalStatusKey = 'pending';
          } else if (sRaw.includes('avail')) {
            finalStatus = 'Available';
            finalStatusKey = 'available';
          } else if (statusName) {
            finalStatus = statusName;
            finalStatusKey = sRaw.replace(/\s+/g, '_');
          }

          const isBooked = (finalStatusKey === 'booked' || finalStatusKey === 'completed' || finalStatusKey === 'sold') ? 1 : 0;

          return {
            ...plot,
            project_id: plot.project_id || Number(project_id),
            sector_id: plot.sector_id,
            plot_id: plot.plot_id,
            plot_no: plot.plot_no,
            sector_name: plot.sector_name,
            plot_height: plot.plot_height,
            plot_width: plot.plot_width,
            square_feet: plot.square_feet,
            plot_rate: plot.plot_rate,
            amount: plot.amount,
            status_id: statusId,
            status_name: statusName || finalStatus,
            is_booked: isBooked,
            status: finalStatus,
            status_key: finalStatusKey,
            booking: (plot.bookings && plot.bookings.length > 0) ? plot.bookings[0] : (plot.booking_id ? plot : null)
          };
        });
        
        setApiPlots(formattedPlots);
        
        // 📊 Calculate stats for all statuses in project
        const statusCounts = {};
        formattedPlots.forEach(p => {
          const k = p.status_key || 'available';
          statusCounts[k] = (statusCounts[k] || 0) + 1;
        });

        const stats = {
          booked: statusCounts['booked'] || 0,
          available: statusCounts['available'] || 0,
          hold: statusCounts['hold'] || 0,
          completed: statusCounts['completed'] || 0,
          sold: statusCounts['sold'] || 0,
          blocked: statusCounts['blocked'] || 0,
          reserved: statusCounts['reserved'] || 0,
          uit_reserve: statusCounts['uit_reserve'] || 0,
          npc: statusCounts['npc'] || 0,
          np: statusCounts['np'] || 0,
          pending: statusCounts['pending'] || 0,
          allStatuses: statusCounts,
          total: formattedPlots.length
        };
        window.mapPlotStats = stats;
        window.dispatchEvent(new CustomEvent('mapPlotStatsUpdated', { detail: stats }));

        // 🏷️ Set project name for header breadcrumb and storage
        let projName = plotsData?.[0]?.project_name || '';
        let projFont = plotsData?.[0]?.project_font ?? 0;

        if (!projName) {
          try {
            const pRes = await fetch(`${API_BASE_URL}/dashboard/projectData?user_id=${userData?.user_id || ''}`, {
              headers: { Authorization: userData?.user_token || "" },
            });
            const pJson = await pRes.json();
            const matched = pJson?.data?.find(p => Number(p.project_id) === Number(project_id));
            if (matched) {
              projName = matched.project_name || matched.name || '';
              projFont = matched.krutiDev_font ?? 0;
            }
          } catch (e) {
            console.error("Error fetching project info:", e);
          }
        }

        projectDetailsRef.current = { name: projName, krutiDev_font: projFont };
        window.currentProjectName = projName;
        window.currentProjectFont = projFont;
        window.dispatchEvent(new CustomEvent('projectNameUpdated', { detail: projName }));

        if (projName) {
          try {
            const existingProj = JSON.parse(localStorage.getItem('ProjectData') || '{}');
            const updatedProj = {
              ...(existingProj?.project_id == project_id ? existingProj : {}),
              project_id: Number(project_id),
              name: projName,
              project_name: projName,
              krutiDev_font: projFont,
            };
            localStorage.setItem('ProjectData', JSON.stringify(updatedProj));
          } catch (e) {}
        }

        // 🔹 Fetch Project Sectors
        try {
          const secRes = await fetch(`${API_BASE_URL}/sectors/list?project_id=${project_id}`, {
            headers: { Authorization: userData?.user_token || "" },
          });
          const secJson = await secRes.json();
          window.projectSectors = secJson?.data || [];
        } catch (e) {
          window.projectSectors = [];
        }

        // 🔹 Fetch Full Project Data for editing
        try {
          const pAllRes = await fetch(`${API_BASE_URL}/project/all?user_id=${userData?.user_id || ''}`, {
            headers: { Authorization: userData?.user_token || "" },
          });
          const pAllJson = await pAllRes.json();
          const matchedFull = pAllJson?.data?.find(p => Number(p.project_id) === Number(project_id));
          if (matchedFull) {
            fullProjectDataRef.current = matchedFull;
          }
        } catch (e) {
          console.error("Error fetching full project data:", e);
        }

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
        // 🚀 Primary: Use directly bundled raw HTML (instant, zero network latency, impossible to 404)
        let html = Number(project_id) === 49 ? defaultMapHtml : rameshwarmMapHtml;

        // Fallback: If for any reason raw bundle is unavailable, fetch via network
        if (!html || typeof html !== 'string' || !html.trim()) {
          const fileName = Number(project_id) === 49
            ? 'html/index.html'
            : 'html/rameshwarm-market-map.html';

          const pathname = window.location.pathname || '';
          const pathSegments = pathname.split('/').filter(Boolean);
          const subfolder = pathSegments.length > 0 && pathSegments[0] !== 'html' ? `/${pathSegments[0]}` : '';

          const candidates = [
            `/realestate/${fileName}`,
            subfolder ? `${subfolder}/${fileName}` : null,
            `../../${fileName}`,
            `../../../${fileName}`,
            `${window.location.origin}/realestate/${fileName}`,
            `/${fileName}`,
            `./${fileName}`,
          ].filter(Boolean);

          let lastStatus = 404;
          for (const candidate of candidates) {
            try {
              const res = await fetch(candidate);
              if (res.ok) {
                const text = await res.text();
                if (
                  (text.includes('parent-dev') || text.includes('page-container') || text.includes('metadata') || text.includes('map-viewport')) &&
                  !text.includes('id="root"')
                ) {
                  html = text;
                  break;
                }
              } else {
                lastStatus = res.status;
              }
            } catch (e) {
              console.warn(`Failed fetching candidate ${candidate}:`, e);
            }
          }

          if (!html) {
            throw new Error(`Failed to load HTML: ${lastStatus}`);
          }
        }

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
        
        // ✅ Force apply colors, search & Google Maps interaction after scripts run
        setTimeout(() => {
          if (typeof window.initGoogleMapInteractions === 'function') {
            window.initGoogleMapInteractions();
          }
          if (typeof applyPlotColors === 'function') {
            applyPlotColors();
          }
          if (typeof initPlotSearch === 'function') {
            initPlotSearch();
          }
          if (typeof updateFilterCounts === 'function') {
            updateFilterCounts();
          }
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
    <>
      <style>{`
        .colony-map-wrapper {
          width: 100%;
          height: calc(100vh - 110px);
          overflow: hidden;
          position: relative;
          background-color: #f5f5f5;
        }
        @media (max-width: 991.98px) {
          .colony-map-wrapper {
            height: calc(100vh - 98px);
            height: calc(100dvh - 98px);
          }
        }
        /* Map scroll area fills the wrapper completely */
        .colony-map-wrapper .parent-dev {
          height: 100% !important;
        }
        /* Remove bottom page padding on the map page so the page itself does not scroll */
        .pcoded-content:has(.colony-map-wrapper) {
          padding-bottom: 0 !important;
        }
        /* Main container is min 100vh below the header, which made the page 80px taller than the screen */
        .pcoded-main-container:has(.colony-map-wrapper) {
          min-height: 0 !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className="colony-map-wrapper"
        style={wrapperHeight ? { height: `${wrapperHeight}px`, marginTop: `${wrapperOffset}px` } : undefined}
      />
    </>
  );
}

export default ColonyMockMap;