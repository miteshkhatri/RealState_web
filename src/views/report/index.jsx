import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Card, Form, Button, Dropdown, Spinner } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { DateRange, DefinedRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { addMonths } from 'date-fns';
import api from "utils/api";
import ModernPagination from "components/Pagination";
import NotoSansDevanagariBase64 from "../../assets/NotoSansDevanagariFont";
import { toHindi } from "utils/krutiDevToUnicode";
import { ReactTransliterate } from 'react-transliterate';
import 'react-transliterate/dist/index.css';
import "../style.css";

const LiveSearchInput = ({ searchLang, setSearchLang, searchTerm, setSearchTerm, onSearchChange }) => {
  return (
    <Form.Group>
      <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: "6px" }}>
        <Form.Label style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "600", marginBottom: 0 }}>
          Live Search
        </Form.Label>
        <div className="d-flex align-items-center gap-1">
          <select
            value={searchLang}
            onChange={(e) => {
              setSearchLang(e.target.value);
              setSearchTerm("");
            }}
            style={{
              height: "24px",
              padding: "0 6px",
              fontSize: "11px",
              borderRadius: "4px",
              background: "rgba(255,255,255,0.2)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.35)",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="hi_mangal" style={{ color: "#000" }}>Mangal (Hindi)</option>
            <option value="en" style={{ color: "#000" }}>English</option>
            <option value="hi_kruti" style={{ color: "#000" }}>Kruti Dev</option>
          </select>
        </div>
      </div>

      <div style={{
        position: "relative",
        background: "#ffffff",
        borderRadius: "6px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 1px 2px rgba(0,0,0,0.07)"
      }}>
        <i
          className="feather icon-search"
          style={{
            position: "absolute",
            left: "12px",
            color: "#6c757d",
            fontSize: "15px",
            pointerEvents: "none",
            zIndex: 2
          }}
        />
        {searchLang === "hi_mangal" ? (
          <ReactTransliterate
            value={searchTerm}
            onChangeText={(text) => {
              if (onSearchChange) onSearchChange();
              setSearchTerm(text);
            }}
            lang="hi"
            placeholder="Search name, mobile, plot..."
            containerStyles={{ width: "100%" }}
            renderComponent={(props) => (
              <input
                {...props}
                style={{
                  width: "100%",
                  height: "42px",
                  paddingLeft: "36px",
                  paddingRight: searchTerm ? "32px" : "12px",
                  borderRadius: "6px",
                  border: "1px solid #ced4da",
                  outline: "none",
                  fontSize: "14px",
                  fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif"
                }}
              />
            )}
          />
        ) : (
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              if (onSearchChange) onSearchChange();
              setSearchTerm(e.target.value);
            }}
            placeholder={searchLang === "hi_kruti" ? "çkstsDV [kkstsa..." : "Search name, mobile, plot..."}
            className={searchLang === "hi_kruti" ? "kruti-dev" : ""}
            style={{
              width: "100%",
              height: "42px",
              paddingLeft: "36px",
              paddingRight: searchTerm ? "32px" : "12px",
              borderRadius: "6px",
              border: "1px solid #ced4da",
              outline: "none",
              fontSize: "14px"
            }}
          />
        )}
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            style={{
              position: "absolute",
              right: "8px",
              background: "transparent",
              border: "none",
              color: "#999",
              cursor: "pointer",
              fontSize: "14px",
              padding: "2px 6px",
              zIndex: 3
            }}
            title="Clear Search"
          >
            ✕
          </button>
        )}
      </div>
    </Form.Group>
  );
};

const Report = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [reportData, setReportData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [grandStats, setGrandStats] = useState({ total: 0, received: 0, pending: 0 });

  const formatAmount = (val) => {
    if (val === null || val === undefined || val === "" || Number(val) === 0) return "0";
    const num = Math.floor(Number(val));
    if (Number.isNaN(num)) return val;
    return num.toLocaleString("en-IN");
  };

  // Filters
  const [projectId, setProjectId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateFilterType, setDateFilterType] = useState("");
  const [dateSortType, setDateSortType] = useState("");
  const [dateSortOrder, setDateSortOrder] = useState("asc");

  // Advanced Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLang, setSearchLang] = useState("hi_mangal");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [overdueStatus, setOverdueStatus] = useState("");
  const [brokerId, setBrokerId] = useState("");
  const [brokersList, setBrokersList] = useState([]);
  const [kpiFilter, setKpiFilter] = useState("all");
  const [grandTotalPlots, setGrandTotalPlots] = useState(0);

  const calendarRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem("users") || "{}");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const currentParams = Object.fromEntries([...searchParams]);
    let hasChanged = false;
    if (page !== 1) {
      if (currentParams.page !== String(page)) {
        currentParams.page = page;
        hasChanged = true;
      }
    } else {
      if (currentParams.page) {
        delete currentParams.page;
        hasChanged = true;
      }
    }
    if (hasChanged) {
      setSearchParams(currentParams, { replace: true });
    }
  }, [page, searchParams, setSearchParams]);

  useEffect(() => {
    fetchProjects();
    fetchBrokers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchReportData();
  }, [
    page,
    limit,
    projectId,
    startDate,
    endDate,
    dateSortType,
    dateSortOrder,
    dateFilterType,
    debouncedSearch,
    overdueStatus,
    brokerId,
    kpiFilter
  ]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/project/all', { headers: { Authorization: userData?.user_token } });
      if (res.data && res.data.success) {
        setProjects(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching projects", error);
    }
  };

  const fetchBrokers = async () => {
    try {
      const res = await api.get('/report/brokers', { headers: { Authorization: userData?.user_token } });
      if (res.data && res.data.success) {
        setBrokersList(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching brokers", error);
    }
  };

  const fetchReportData = async () => {
    if (!projectId && !startDate && !endDate && !debouncedSearch && !overdueStatus && !brokerId && !dateFilterType) {
      setReportData([]);
      setTotalPages(1);
      setTotalRecords(0);
      setGrandStats({ total: 0, received: 0, pending: 0 });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        user_id: userData.user_id
      };
      if (projectId && projectId !== "all") params.project_id = projectId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (dateFilterType) params.date_filter_type = dateFilterType;
      if (dateSortType) params.dateSortType = dateSortType;
      if (dateSortOrder) params.dateSortOrder = dateSortOrder;
      if (debouncedSearch) params.search = debouncedSearch;
      if (overdueStatus) params.overdue_status = overdueStatus;
      if (brokerId && brokerId !== "all") params.broker_id = brokerId;
      if (kpiFilter && kpiFilter !== "all") params.kpi_filter = kpiFilter;

      const res = await api.get('/report/list', { 
        params, 
        headers: { Authorization: userData?.user_token } 
      });
      if (res.data && res.data.success) {
        setReportData(res.data.data);
        if (res.data.brokers_list && res.data.brokers_list.length > 0) {
          setBrokersList(res.data.brokers_list);
        }
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.total_pages);
          setTotalRecords(res.data.pagination.total_records);
          setGrandTotalPlots(res.data.grand_total_plots || res.data.pagination.total_records);
          setGrandStats({
            total: res.data.grand_total_amount || 0,
            received: res.data.grand_received_amount || 0,
            pending: res.data.grand_pending_amount || 0
          });
        }
      } else {
        setReportData([]);
        setTotalPages(1);
        setTotalRecords(0);
        setGrandStats({ total: 0, received: 0, pending: 0 });
      }
    } catch (error) {
      console.error("Error fetching report data", error);
      setReportData([]);
      setTotalPages(1);
      setTotalRecords(0);
      setGrandStats({ total: 0, received: 0, pending: 0 });
    } finally {
      setLoading(false);
    }
  };

  const [dateRange, setDateRange] = useState([{
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate ? new Date(endDate) : new Date(),
    key: 'selection'
  }]);
  
  const [leftDate, setLeftDate] = useState(startDate ? new Date(startDate) : new Date());
  const [rightDate, setRightDate] = useState(endDate ? new Date(endDate) : addMonths(new Date(), 1));
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
    const formatD = (d) => {
      if (!d) return "";
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    setStartDate(formatD(ranges.selection.startDate));
    setEndDate(formatD(ranges.selection.endDate));
    setPage(1);
  };

  const handleClearDates = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
    setDateRange([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
    setShowCalendar(false);
  };

  const handleQuickDate = (type) => {
    const today = new Date();
    const formatD = (d) => {
      if (!d) return "";
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    if (!projectId) {
      setProjectId("all");
    }

    if (type === "today") {
      const todayStr = formatD(today);
      setStartDate(todayStr);
      setEndDate(todayStr);
      setDateRange([{ startDate: today, endDate: today, key: 'selection' }]);
      setPage(1);
    } else if (type === "this_month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const todayStr = formatD(today);
      setStartDate(formatD(firstDay));
      setEndDate(todayStr);
      setDateRange([{ startDate: firstDay, endDate: today, key: 'selection' }]);
      setPage(1);
    }
  };

  const getExportDetails = () => {
    let projName = "All_Projects";
    let projTitle = "All Projects";
    if (projectId && projectId !== "all") {
      const p = projects.find(x => x.project_id == projectId || x.project_id === Number(projectId));
      if (p) {
        projTitle = p.name;
        projName = p.name.replace(/[^a-zA-Z0-9 -]/g, "").trim().replace(/\s+/g, "_");
        if (!projName) projName = "Project";
      }
    }
    
    let dateTypeLabel = "";
    let dateTypeFileLabel = "";
    if (dateFilterType === "booking") {
      dateTypeLabel = " - Booking Date";
      dateTypeFileLabel = "_BookingDate";
    } else if (dateFilterType === "received") {
      dateTypeLabel = " - Received Date";
      dateTypeFileLabel = "_ReceivedDate";
    } else if (dateFilterType === "due_expired") {
      dateTypeLabel = " - Due Date";
      dateTypeFileLabel = "_DueDate";
    }
    
    let dateStr = new Date().toLocaleDateString("en-IN").replace(/\//g, "-");
    let displayDate = dateStr;
    if (startDate && endDate) {
      const from = startDate.split("-").reverse().join("-");
      const to = endDate.split("-").reverse().join("-");
      dateStr = `${from}_To_${to}`;
      displayDate = `${from} to ${to}`;
    }
    
    return {
      fileName: `${projName}${dateTypeFileLabel}_Reports_${dateStr}`,
      title: `Reports - ${projTitle}${dateTypeLabel} (${displayDate})`
    };
  };

  const buildFilterQuery = (limitNum = 100000) => {
    const queryParts = [];
    if (projectId && projectId !== "all") queryParts.push(`project_id=${projectId}`);
    if (startDate && endDate) {
      queryParts.push(`start_date=${startDate}`);
      queryParts.push(`end_date=${endDate}`);
    }
    if (dateFilterType) queryParts.push(`date_filter_type=${dateFilterType}`);
    if (debouncedSearch) queryParts.push(`search=${encodeURIComponent(debouncedSearch)}`);
    if (overdueStatus) queryParts.push(`overdue_status=${overdueStatus}`);
    if (brokerId && brokerId !== "all") queryParts.push(`broker_id=${brokerId}`);
    if (kpiFilter && kpiFilter !== "all") queryParts.push(`kpi_filter=${kpiFilter}`);
    queryParts.push(`page=1`);
    queryParts.push(`limit=${limitNum}`);
    if (dateSortType) queryParts.push(`dateSortType=${dateSortType}`);
    if (dateSortOrder) queryParts.push(`dateSortOrder=${dateSortOrder}`);
    return queryParts.join("&");
  };

  const exportToCSV = async () => {
    try {
      const res = await api.get(`/report/list?${buildFilterQuery(100000)}`, { headers: { Authorization: userData?.user_token } });
      const dataToExport = res.data?.data || [];
      if (dataToExport.length === 0) {
        alert("No data to export");
        return;
      }

      const XLSX = await import("xlsx-js-style");

      const { fileName, title } = getExportDetails();

      const totalPlots = res.data?.grand_total_plots || res.data?.pagination?.total_records || dataToExport.length;
      const totalAmt = res.data?.grand_total_amount || grandStats.total;
      const totalRec = res.data?.grand_received_amount || grandStats.received;
      const totalPend = res.data?.grand_pending_amount || grandStats.pending;
      const collectionPct = totalAmt > 0 ? ((totalRec / totalAmt) * 100).toFixed(1) + "%" : "0%";

      const headers = ["S.No", "Customer Name", "Mobile", "Project", "Sector", "Plot No", "Total Amount", "Paid Amount", "Due Amount", "Created Date", "Booking Date", "Due Date"];

      const rows = dataToExport.map((row, idx) => {
        const isKruti = row.krutiDev_font == 1;
        const isProjKruti = row.project_font == 1;

        let customerNames = "";
        let mobiles = "";
        if (row.all_customers) {
          customerNames = row.all_customers.map(c =>
            (c.krutiDev_font == 1 || isKruti) ? toHindi(c.name) : (c.name || "")
          ).join(" / ");
          mobiles = row.all_customers.map(c => c.mobile).join(" / ");
        } else {
          customerNames = isKruti ? toHindi(row.customer_name || "") : (row.customer_name || "");
          mobiles = row.mobile_no || "";
        }

        const projectName = isProjKruti ? toHindi(row.project_name || "") : (row.project_name || "");
        const sectorName  = isProjKruti ? toHindi(row.sector_name  || "") : (row.sector_name  || "");

        return [
          idx + 1,
          customerNames,
          mobiles,
          projectName,
          sectorName,
          row.plot_no || "",
          row.amount_a || 0,
          row.received_amount || 0,
          row.pending_amount || 0,
          formatDateTime(row.create_at),
          formatDateTime(row.booking_date),
          getDueDate(row)
        ];
      });

      // Build worksheet data with Summary Stats at top
      const wsData = [
        [title],
        [],
        ["SUMMARY OVERVIEW:"],
        ["Total Plots", totalPlots, "Total Deal Value", `₹${formatAmount(totalAmt)}`],
        ["Total Received", `₹${formatAmount(totalRec)} (${collectionPct})`, "Total Pending Due", `₹${formatAmount(totalPend)}`],
        [],
        headers,
        ...rows
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Auto column width: calculate max character length per column
      const colWidths = headers.map((h, colIdx) => {
        if (colIdx === 0) return { wch: 6 }; // S.No column narrow width
        const maxLen = wsData.reduce((max, r) => {
          const val = r[colIdx] != null ? String(r[colIdx]) : "";
          return Math.max(max, val.length);
        }, h.length);
        return { wch: Math.min(maxLen + 2, 50) }; // cap at 50 chars
      });
      ws["!cols"] = colWidths;

      // Merge first row (title) across all columns
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
      ];

      // Style the title cell (A1)
      if (ws["A1"]) {
        ws["A1"].s = {
          font: { color: { rgb: "0000FF" }, bold: true, sz: 14 },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }


      // Force mobile column (index 2) to be text type to avoid scientific notation
      const mobileColLetter = XLSX.utils.encode_col(2);
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = 1; R <= range.e.r; R++) {
        const cellRef = `${mobileColLetter}${R + 1}`;
        if (ws[cellRef]) {
          ws[cellRef].t = "s"; // force string type
        }
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reports");

      // Use 'binary' type for compatibility with older xlsx versions
      const wbBinary = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
      const s2ab = (s) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
      };
      const blob = new Blob([s2ab(wbBinary)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error exporting to Excel", error);
      alert("Error exporting to Excel");
    }
  };


  const exportToPDF = async () => {
    setIsExportingPDF(true);
    try {
      const res = await api.get(`/report/list?${buildFilterQuery(100000)}`, { headers: { Authorization: userData?.user_token } });
      const dataToExport = res.data?.data || [];
      if (dataToExport.length === 0) {
        alert("No data to export");
        setIsExportingPDF(false);
        return;
      }

      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

      const { fileName, title } = getExportDetails();

      const totalPlots = res.data?.grand_total_plots || res.data?.pagination?.total_records || dataToExport.length;
      const totalAmt = res.data?.grand_total_amount || grandStats.total;
      const totalRec = res.data?.grand_received_amount || grandStats.received;
      const totalPend = res.data?.grand_pending_amount || grandStats.pending;
      const collectionPct = totalAmt > 0 ? ((totalRec / totalAmt) * 100).toFixed(1) + "%" : "0%";

      // Register Hindi font
      doc.addFileToVFS("NotoSansDevanagari.ttf", NotoSansDevanagariBase64);
      doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");

      doc.setFont("NotoSansDevanagari");
      doc.setFontSize(14);
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 28, { align: "center" });

      // Summary Table (4 KPI Cards in PDF)
      autoTable(doc, {
        startY: 38,
        head: [["TOTAL PLOTS", "TOTAL AMOUNT (DEAL VALUE)", "TOTAL RECEIVED", "TOTAL PENDING DUE"]],
        body: [[
          `${totalPlots}`,
          `₹${formatAmount(totalAmt)}`,
          `₹${formatAmount(totalRec)} (${collectionPct})`,
          `₹${formatAmount(totalPend)}`
        ]],
        theme: "plain",
        styles: { font: "NotoSansDevanagari", fontSize: 8, halign: "center", cellPadding: 4 },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
        bodyStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: "bold" },
        margin: { left: 10, right: 10 },
      });

      const summaryEndY = (doc.lastAutoTable?.finalY || 40) + 6;

      const headers = [["S.No", "Contact Info", "Project", "Sec/Plot", "Sq/F Rate / Booking", "Amount Details", "Created/Booking Date", "Due Date"]];

      const body = dataToExport.map((row, idx) => {
        const isKruti = row.krutiDev_font == 1;
        const convertName = (name) => isKruti ? toHindi(name) : (name || "");

        const customerNames = row.all_customers
          ? row.all_customers.map(c => (c.krutiDev_font == 1 || isKruti) ? toHindi(c.name) : (c.name || "")).join(" / ")
          : convertName(row.customer_name);
        const mobiles = row.all_customers
          ? row.all_customers.map(c => c.mobile).join(" / ")
          : (row.mobile_no || "");

        const projectName = row.project_font == 1 ? toHindi(row.project_name || "") : (row.project_name || "");
        const sectorName  = row.project_font == 1 ? toHindi(row.sector_name || "")  : (row.sector_name  || "");

        return [
          idx + 1,
          `${customerNames}\n${mobiles}`,
          projectName,
          `${sectorName}\n${row.plot_no || ""}`,
          `Sq/F: ${row.sq_ft_rate || 0}\nBooking: ${row.booking_amount || 0}`,
          `Total: ${row.amount_a || 0}\nPaid: ${row.received_amount || 0}\nDue: ${row.pending_amount || 0}`,
          `Created: ${formatDateTime(row.create_at)}\nBooking: ${formatDateTime(row.booking_date)}`,
          getDueDate(row)
        ];
      });

      autoTable(doc, {
        startY: summaryEndY,
        head: headers,
        body: body,
        theme: "grid",
        showHead: 'firstPage',
        rowPageBreak: 'avoid',
        styles: { font: "NotoSansDevanagari", fontSize: 8, cellPadding: 4, overflow: "linebreak" },
        headStyles: { font: "NotoSansDevanagari", fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: { 0: { cellWidth: 25 } },
        margin: { top: 45, left: 10, right: 10 },
      });

      doc.save(`${fileName}.pdf`);
      setIsExportingPDF(false);

    } catch (error) {
      console.error("Error exporting to PDF", error);
      alert("Error exporting to PDF");
      setIsExportingPDF(false);
    }
  };

  const printReport = async () => {
    setIsPrinting(true);
    try {
      const res = await api.get(`/report/list?${buildFilterQuery(100000)}`, { headers: { Authorization: userData?.user_token } });
      const dataToExport = res.data?.data || [];
      if (dataToExport.length === 0) { alert("No data to print"); setIsPrinting(false); return; }

      const rowsHtml = dataToExport.map((row, idx) => {
        const isKruti = row.krutiDev_font == 1;
        const isProjKruti = row.project_font == 1;
        const customerNames = row.all_customers
          ? row.all_customers.map(c => (c.krutiDev_font == 1 || isKruti) ? toHindi(c.name) : (c.name || "")).join(" / ")
          : (isKruti ? toHindi(row.customer_name || "") : (row.customer_name || ""));
        const mobiles = row.all_customers ? row.all_customers.map(c => c.mobile).join(" / ") : (row.mobile_no || "");
        const projectName = isProjKruti ? toHindi(row.project_name || "") : (row.project_name || "");
        const sectorName = isProjKruti ? toHindi(row.sector_name || "") : (row.sector_name || "");
        return `<tr>
          <td>${idx + 1}</td>
          <td>${customerNames}<br/><small>${mobiles}</small></td>
          <td>${projectName}</td>
          <td>${sectorName}<br/>${row.plot_no || ""}</td>
          <td>Sq/F: ${row.sq_ft_rate || 0}<br/>Booking: ${row.booking_amount || 0}</td>
          <td>Total: ${row.amount_a || 0}<br/>Paid: ${row.received_amount || 0}<br/>Due: ${row.pending_amount || 0}</td>
          <td>Created: ${formatDateTime(row.create_at)}<br/>Booking: ${formatDateTime(row.booking_date)}</td>
          <td>${getDueDate(row)}</td>
        </tr>`;
      }).join("");

      const { title } = getExportDetails();

      const totalPlots = res.data?.grand_total_plots || res.data?.pagination?.total_records || dataToExport.length;
      const totalAmt = res.data?.grand_total_amount || grandStats.total;
      const totalRec = res.data?.grand_received_amount || grandStats.received;
      const totalPend = res.data?.grand_pending_amount || grandStats.pending;
      const collectionPct = totalAmt > 0 ? ((totalRec / totalAmt) * 100).toFixed(1) + "%" : "0%";

      const summaryHtml = `
        <div style="display: flex; gap: 10px; margin-bottom: 14px;">
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; background: #f8fafc;">
            <div style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase;">Total Plots</div>
            <div style="font-size: 15px; font-weight: 800; color: #0f172a;">${totalPlots}</div>
          </div>
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; background: #f8fafc;">
            <div style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase;">Total Amount</div>
            <div style="font-size: 15px; font-weight: 800; color: #0f172a;">₹${formatAmount(totalAmt)}</div>
          </div>
          <div style="flex: 1; border: 1px solid #86efac; border-radius: 6px; padding: 8px 12px; background: #f0fdf4;">
            <div style="font-size: 9px; color: #166534; font-weight: bold; text-transform: uppercase;">Total Received</div>
            <div style="font-size: 15px; font-weight: 800; color: #16a34a;">₹${formatAmount(totalRec)} <span style="font-size: 10px; font-weight: 600;">(${collectionPct})</span></div>
          </div>
          <div style="flex: 1; border: 1px solid #fca5a5; border-radius: 6px; padding: 8px 12px; background: #fef2f2;">
            <div style="font-size: 9px; color: #991b1b; font-weight: bold; text-transform: uppercase;">Total Pending</div>
            <div style="font-size: 15px; font-weight: 800; color: #dc2626;">₹${formatAmount(totalPend)}</div>
          </div>
        </div>
      `;

      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>
      <style>
        @page { size: A4 landscape; margin: 10mm; }
        body { font-family: sans-serif; font-size: 10px; background: #fff; color: #000; }
        h2 { text-align: center; margin-bottom: 12px; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid #999; padding: 5px 6px; vertical-align: top; word-break: break-word; }
        th { background: #2980b9; color: #fff; font-weight: bold; text-align: left; }
        tr:nth-child(even) { background: #f5f5f5; }
        tr { page-break-inside: avoid; break-inside: avoid; }
        small { color: #555; }
      </style></head><body>
      <h2>${title}</h2>
      ${summaryHtml}
      <table><thead><tr><th>S.No</th><th>Contact Info</th><th>Project</th><th>Sec/Plot</th><th>Sq/F Rate / Booking</th><th>Amount Details</th><th>Created/Booking Date</th><th>Due Date</th></tr></thead>

      <tbody>${rowsHtml}</tbody></table></body></html>`;

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.style.top = "0";
      iframe.style.left = "0";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      iframe.contentWindow.focus();
      setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => { document.body.removeChild(iframe); setIsPrinting(false); }, 1000);
      }, 600);
    } catch (error) {
      console.error("Error printing", error);
      setIsPrinting(false);
    }
  };

  const parseDateSafe = (val) => {
    if (!val) return null;
    const str = String(val).trim();
    if (!str || str === '0000-00-00' || str === '0000-00-00 00:00:00' || str === 'null' || str === 'undefined' || str === '—' || str === '-') return null;
    const datePart = str.split('T')[0].split(' ')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split('-').map(Number);
      if (y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) return new Date(y, m - 1, d);
    }
    if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(datePart)) {
      const parts = datePart.split(/[-/]/).map(Number);
      const [d, m, y] = parts;
      if (y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) return new Date(y, m - 1, d);
    }
    const d = new Date(val);
    return (!isNaN(d.getTime()) && d.getFullYear() > 1900) ? d : null;
  };

  const getDueDate = (row) => {
    const baseDate = parseDateSafe(row.agreement_date) || parseDateSafe(row.booking_date) || parseDateSafe(row.create_at);
    if (!baseDate) return "--";
    const days = parseInt(row.payment_time) || 45;
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + days);
    return formatDateTime(date);
  };

  const columns = [
    "#",
    "Contact Info",
    "Project",
    "Sec/Plot",
    "Sq/F Rate / Booking Amt",
    "Amount Details",
    "Date"
  ];

  const formatDateTime = (dateString) => {
    const date = parseDateSafe(dateString);
    if (!date) return '--';
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const filteredReportData = (reportData || []).filter((row) => {
    if (!searchTerm || !searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const custName = (row.customer_name || "").toLowerCase();
    const mob = (row.mobile_no || "").toLowerCase();
    const plot = (row.plot_no || "").toString().toLowerCase();
    const proj = (row.project_name || "").toLowerCase();
    const allCusts = (row.all_customers || []).map((c) => `${c.name} ${c.mobile}`).join(" ").toLowerCase();

    // Hindi/Kruti conversions for matching transliterated Hindi
    const hindiCust = (row.krutiDev_font == 1 ? toHindi(row.customer_name || "") : (row.customer_name || "")).toLowerCase();
    const hindiProj = (row.project_font == 1 ? toHindi(row.project_name || "") : (row.project_name || "")).toLowerCase();
    const allCustsHindi = (row.all_customers || [])
      .map((c) => `${c.font == 1 ? toHindi(c.name) : c.name} ${c.mobile}`)
      .join(" ")
      .toLowerCase();
    const brokerName = (row.broker_name || "").toLowerCase();
    const hindiBroker = (row.broker_font == 1 ? toHindi(row.broker_name || "") : (row.broker_name || "")).toLowerCase();

    return (
      custName.includes(term) ||
      mob.includes(term) ||
      plot.includes(term) ||
      proj.includes(term) ||
      allCusts.includes(term) ||
      hindiCust.includes(term) ||
      hindiProj.includes(term) ||
      allCustsHindi.includes(term) ||
      brokerName.includes(term) ||
      hindiBroker.includes(term)
    );
  });

  const emptyFilterMessage =
    !projectId && !startDate && !endDate && !debouncedSearch && !overdueStatus && !brokerId && !dateFilterType
      ? "Please select a Project or Filter to view reports."
      : "No Reports Found for the selected filters.";

  const renderDateSortDropdown = () => (
    <Dropdown>
      <Dropdown.Toggle
        variant="light"
        size="sm"
        className="p-0 border-0 bg-transparent shadow-none"
        style={{ color: "#74829c" }}
      >
        <i className="feather icon-filter" style={{ cursor: "pointer" }} title="Sort Dates" />
      </Dropdown.Toggle>
      <Dropdown.Menu className="shadow-sm" style={{ zIndex: 990 }}>
        <div className="px-3 py-1 fw-bold text-muted" style={{ fontSize: "12px" }}>
          SORT BY
        </div>
        <Dropdown.Item
          onClick={() => {
            setDateSortType("created");
            setPage(1);
          }}
          active={dateSortType === "created"}
        >
          Created Date
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => {
            setDateSortType("booking");
            setPage(1);
          }}
          active={dateSortType === "booking"}
        >
          Booking Date
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => {
            setDateSortType("due");
            setPage(1);
          }}
          active={dateSortType === "due"}
        >
          Due Date
        </Dropdown.Item>
        <Dropdown.Divider />
        <div className="px-3 py-1 fw-bold text-muted" style={{ fontSize: "12px" }}>
          ORDER
        </div>
        <Dropdown.Item
          onClick={() => {
            setDateSortOrder("asc");
            setPage(1);
          }}
          active={dateSortOrder === "asc"}
        >
          Ascending
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => {
            setDateSortOrder("desc");
            setPage(1);
          }}
          active={dateSortOrder === "desc"}
        >
          Descending
        </Dropdown.Item>
        {dateSortType && (
          <>
            <Dropdown.Divider />
            <Dropdown.Item
              onClick={() => {
                setDateSortType("");
                setDateSortOrder("asc");
                setPage(1);
              }}
              className="text-danger"
            >
              Clear Sort
            </Dropdown.Item>
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
    <React.Fragment>
      <Row>
        <Col>
          <div className="project-table-card">
            <Card className="card">
              <Card.Header className="project-header pb-4">
                <div className="d-flex flex-column gap-3 w-100">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 w-100">
                    <h5 className="project-title mb-0" style={{ color: "#ffffff", fontWeight: 800, fontSize: "18px" }}>
                      Reports&nbsp;
                      <span style={{ background: "rgba(255,255,255,0.22)", color: "#ffffff", fontSize: "12px", fontWeight: 700, borderRadius: "20px", padding: "3px 10px", border: "1px solid rgba(255,255,255,0.35)", display: "inline-block", verticalAlign: "middle" }}>
                        {totalRecords}
                      </span>
                    </h5>

                    {reportData && reportData.length > 0 && (
                      <div className="d-flex gap-2 flex-wrap">
                        <Button variant="success" size="sm" onClick={exportToCSV} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="feather icon-file-text" /> Export to Excel
                        </Button>
                        <Button variant="danger" size="sm" onClick={exportToPDF} disabled={isExportingPDF} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {isExportingPDF ? (
                            <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Generating...</>
                          ) : (
                            <><i className="feather icon-file" /> Export to PDF</>
                          )}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={printReport} disabled={isPrinting} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {isPrinting ? (
                            <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Printing...</>
                          ) : (
                            <><i className="feather icon-printer" /> Print</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Filters Section */}
                  <div className="mt-3" style={{ background: "rgba(255,255,255,0.08)", padding: "20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <Row className="align-items-end g-3">
                      <Col xs={12} sm={6} lg={3}>
                        <Form.Group>
                          <Form.Label style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>Project</Form.Label>
                          <Form.Select
                            value={projectId}
                            onChange={(e) => {
                              setProjectId(e.target.value);
                              setPage(1);
                            }}
                            style={{ height: "42px", borderRadius: "6px" }}
                            className="shadow-sm"
                          >
                            <option value="">Select Project</option>
                            <option value="all">All Projects</option>
                            {projects.map((proj) => (
                              <option key={proj.project_id} value={proj.project_id}>
                                {proj.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col xs={12} sm={6} lg={3}>
                        <Form.Group>
                          <Form.Label style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>Date Type</Form.Label>
                          <Form.Select
                            value={dateFilterType}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!projectId) setProjectId("all");
                              setDateFilterType(val);
                              setPage(1);
                            }}
                            style={{ height: "42px", borderRadius: "6px" }}
                            className="shadow-sm"
                          >
                            <option value="">All Date Types</option>
                            <option value="booking">Booking / Created Date</option>
                            <option value="received">Payment Received Date</option>
                            <option value="due_expired">Due Date (Expired)</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col xs={12} sm={6} lg={3}>
                        <Form.Group style={{ position: "relative" }} ref={calendarRef}>
                          <Form.Label style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Date Range</Form.Label>
                          <Button 
                            variant="light" 
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="w-100 d-flex justify-content-between align-items-center shadow-sm"
                            style={{ height: "42px", borderRadius: "6px", backgroundColor: "#fff", color: "#495057", border: "1px solid #ced4da", textAlign: "left", cursor: "pointer", opacity: 1 }}
                          >
                            <span className="text-truncate">{startDate && endDate ? `${startDate.split('-').reverse().join('-')} to ${endDate.split('-').reverse().join('-')}` : "Select Date Range"}</span>
                            <i className="feather icon-calendar text-muted" style={{ fontSize: "16px", flexShrink: 0 }} />
                          </Button>
                          
                          {showCalendar && (
                            <div style={{ position: "absolute", top: "75px", right: "0", zIndex: 1000, boxShadow: "0px 10px 40px rgba(0,0,0,0.2)", borderRadius: "10px", overflow: "hidden", background: "#fff", display: "flex", border: "1px solid #eaeaea" }}>
                              <DefinedRange 
                                ranges={dateRange}
                                onChange={handleSelect}
                              />
                              <DateRange
                                ranges={dateRange}
                                onChange={handleSelect}
                                months={2}
                                direction="horizontal"
                                showSelectionPreview={true}
                                retainEndDateOnFirstSelection={true}
                                showDateDisplay={false}
                              />
                            </div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col xs={12} sm={6} lg={3}>
                        <Form.Label style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Quick Dates</Form.Label>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-light" 
                            size="sm"
                            onClick={() => handleQuickDate("today")} 
                            className="flex-fill shadow-sm fw-bold"
                            style={{ height: "42px", borderRadius: "6px", fontSize: "12px" }}
                          >
                            Today
                          </Button>
                          <Button 
                            variant="outline-light" 
                            size="sm"
                            onClick={() => handleQuickDate("this_month")} 
                            className="flex-fill shadow-sm fw-bold"
                            style={{ height: "42px", borderRadius: "6px", fontSize: "12px" }}
                          >
                            This Month
                          </Button>
                          <Button 
                            variant="outline-light" 
                            size="sm"
                            onClick={handleClearDates} 
                            className="shadow-sm fw-bold"
                            style={{ height: "42px", borderRadius: "6px", padding: "0 12px", fontSize: "12px" }}
                            title="Clear Dates"
                          >
                            Clear
                          </Button>
                        </div>
                      </Col>
                    </Row>

                    {/* Advanced Filters Row */}
                    <Row className="align-items-end g-3 mt-1 pt-3" style={{ borderTop: "1px dashed rgba(255,255,255,0.18)" }}>
                      <Col xs={12} sm={6} lg={4}>
                        <LiveSearchInput
                          searchLang={searchLang}
                          setSearchLang={setSearchLang}
                          searchTerm={searchTerm}
                          setSearchTerm={setSearchTerm}
                          onSearchChange={() => {
                            if (!projectId) setProjectId("all");
                          }}
                        />
                      </Col>

                      <Col xs={12} sm={6} lg={4}>
                        <Form.Group>
                          <Form.Label style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>Due / Defaulter</Form.Label>
                          <Form.Select
                            value={overdueStatus}
                            onChange={(e) => {
                              if (!projectId) setProjectId("all");
                              setOverdueStatus(e.target.value);
                              setPage(1);
                            }}
                            style={{ height: "42px", borderRadius: "6px" }}
                            className="shadow-sm"
                          >
                            <option value="">All Due Status</option>
                            <option value="overdue_all">All Overdue</option>
                            <option value="due_30">Due in 30 Days</option>
                            <option value="overdue_30">1 - 30 Days Overdue</option>
                            <option value="overdue_60">30+ Days Overdue</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col xs={12} sm={6} lg={4}>
                        <Form.Group>
                          <Form.Label style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>Broker / Agent</Form.Label>
                          <Form.Select
                            value={brokerId}
                            onChange={(e) => {
                              if (!projectId) setProjectId("all");
                              setBrokerId(e.target.value);
                              setPage(1);
                            }}
                            style={{ height: "42px", borderRadius: "6px" }}
                            className="shadow-sm"
                          >
                            <option value="">All Brokers</option>
                            {brokersList.map((b) => (
                              <option
                                key={b.broker_id}
                                value={b.all_broker_ids || b.broker_id}
                                className={b.kruti_brokers_font == 1 ? "kruti-dev" : ""}
                              >
                                {b.broker_name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Summary KPI Cards */}
                  {reportData && reportData.length > 0 && (
                    <Row className="g-3 mt-1">
                      <Col xs={6} md={3}>
                        <div style={{
                          background: "rgba(255, 255, 255, 0.10)",
                          backdropFilter: "blur(8px)",
                          borderRadius: "10px",
                          padding: "12px 16px",
                          border: "1px solid rgba(255, 255, 255, 0.18)",
                          color: "#ffffff"
                        }}>
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Total Plots</span>
                            <i className="feather icon-layers" style={{ fontSize: "16px", color: "#60a5fa" }} />
                          </div>
                          <div style={{ fontSize: "20px", fontWeight: 800 }}>{grandTotalPlots || totalRecords}</div>
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Filtered Plots</div>
                        </div>
                      </Col>

                      <Col xs={6} md={3}>
                        <div style={{
                          background: "rgba(255, 255, 255, 0.10)",
                          backdropFilter: "blur(8px)",
                          borderRadius: "10px",
                          padding: "12px 16px",
                          border: "1px solid rgba(255, 255, 255, 0.18)",
                          color: "#ffffff"
                        }}>
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Total Amount</span>
                            <i className="feather icon-credit-card" style={{ fontSize: "16px", color: "#a78bfa" }} />
                          </div>
                          <div style={{ fontSize: "20px", fontWeight: 800 }}>₹{formatAmount(grandStats.total)}</div>
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Total Deal Value</div>
                        </div>
                      </Col>

                      <Col xs={6} md={3}>
                        <div style={{
                          background: "rgba(255, 255, 255, 0.10)",
                          backdropFilter: "blur(8px)",
                          borderRadius: "10px",
                          padding: "12px 16px",
                          border: "1px solid rgba(255, 255, 255, 0.18)",
                          color: "#ffffff"
                        }}>
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Total Received</span>
                            <i className="feather icon-check-circle" style={{ fontSize: "16px", color: "#4ade80" }} />
                          </div>
                          <div style={{ fontSize: "20px", fontWeight: 800, color: "#86efac" }}>₹{formatAmount(grandStats.received)}</div>
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                            {grandStats.total > 0 ? `${((grandStats.received / grandStats.total) * 100).toFixed(1)}% collected` : "0% collected"}
                          </div>
                        </div>
                      </Col>

                      <Col xs={6} md={3}>
                        <div style={{
                          background: "rgba(255, 255, 255, 0.10)",
                          backdropFilter: "blur(8px)",
                          borderRadius: "10px",
                          padding: "12px 16px",
                          border: "1px solid rgba(255, 255, 255, 0.18)",
                          color: "#ffffff"
                        }}>
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Total Pending</span>
                            <i className="feather icon-alert-circle" style={{ fontSize: "16px", color: "#f87171" }} />
                          </div>
                          <div style={{ fontSize: "20px", fontWeight: 800, color: "#fca5a5" }}>₹{formatAmount(grandStats.pending)}</div>
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Due Balance</div>
                        </div>
                      </Col>
                    </Row>
                  )}
                </div>
              </Card.Header>

              <Card.Body className="card-body-p0" id="report-table-container">
                {/* ── DESKTOP TABLE ── */}
                <table className="project-table-desktop d-none d-md-table">
                  <thead>
                    <tr>
                      {columns.map((col, i) => (
                        <th key={i} className="table-header-cell">
                          {col === "Date" ? (
                            <div className="d-flex align-items-center gap-2">
                              Date
                              {renderDateSortDropdown()}
                            </div>
                          ) : (
                            col
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5">
                          <div style={{ color: "#74829c", fontSize: "14px", fontWeight: 600 }}>
                            Loading...
                          </div>
                        </td>
                      </tr>
                    ) : filteredReportData.length > 0 ? (
                      filteredReportData.map((row, index) => (
                        <tr key={row.booking_id || index} className="table-row-clickable">
                          <td className="table-sno-cell">{(page - 1) * limit + index + 1}</td>
                          <td style={{ maxWidth: "175px" }}>
                            {row.all_customers ? row.all_customers.map((cust, idx) => (
                              <div key={idx} style={{ marginBottom: idx < row.all_customers.length - 1 ? '8px' : '0' }}>
                                <div
                                  className={`table-name-cell text-truncate${cust.font == 1 ? " kruti-dev" : ""}`}
                                  title={cust.name}
                                >
                                  {cust.name}
                                </div>
                                <div className="broker-phone">Mob: {cust.mobile || "-"}</div>
                              </div>
                            )) : (
                              <>
                                <div
                                  className={`table-name-cell text-truncate${row.krutiDev_font == 1 ? " kruti-dev" : ""}`}
                                  title={row.customer_name}
                                >
                                  {row.customer_name}
                                </div>
                                <div className="broker-phone">Mob: {row.mobile_no || "-"}</div>
                              </>
                            )}
                            {row.broker_name && (
                              <div className="broker-commission" style={{ fontSize: "11px", color: "#6c757d", marginTop: "3px" }}>
                                Broker:{" "}
                                <span className={row.broker_font == 1 ? "kruti-dev" : ""}>
                                  {row.broker_name}
                                </span>
                                {row.commission_type && (
                                  <span style={{ marginLeft: 3 }}>
                                    ({row.commission_type === "percentage"
                                      ? `${row.commission_value}%`
                                      : row.commission_type === "fixed"
                                        ? `₹${row.commission_value}`
                                        : "-"})
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className={row.project_font == 1 ? "kruti-dev" : ""} style={{ fontWeight: 600 }}>
                              {row.project_name}
                            </div>
                          </td>
                          <td>
                            <div className={row.project_font == 1 ? "kruti-dev" : ""}>{row.sector_name}</div>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>{row.plot_no}</div>
                          </td>
                          <td style={{ fontSize: "12px" }}>
                            <div>
                              Sq/F Rate:{" "}
                              <span className="rate-chip rate-chip-sqf">{row.square_feet_rate}</span>
                            </div>
                            {row.plc_drc ? (
                              <div style={{ marginTop: 4 }}>
                                PLC/DIC:{" "}
                                <span className="rate-chip rate-chip-sqf">
                                  {row.plc_drc}%
                                </span>
                              </div>
                            ) : null}
                            <div style={{ marginTop: 4 }}>
                              Booking:{" "}
                              <span className="rate-chip rate-chip-dlc">₹{formatAmount(row.booking_amount)}</span>
                            </div>
                          </td>
                          <td style={{ minWidth: "120px" }}>
                            <div style={{ fontSize: "11px", display: "flex", flexDirection: "column", gap: 3, marginRight: "16px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#6c757d" }}>Total:</span>
                                <span style={{ fontWeight: 700 }}>₹{(() => {
                                  const val = row.amount_a;
                                  if (!val || Number(val) === 0) return "0";
                                  return Math.floor(Number(val)).toLocaleString("en-IN");
                                })()}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#0d6efd" }}>Paid:</span>
                                <span style={{ color: "#0d6efd", fontWeight: 700 }}>₹{(() => {
                                  const val = row.received_amount;
                                  if (!val || Number(val) === 0) return "0";
                                  return Math.floor(Number(val)).toLocaleString("en-IN");
                                })()}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #dee2e6", paddingTop: 4, marginTop: 2 }}>
                                <span style={{ color: "#6c757d" }}>Due:</span>
                                <span style={{
                                  fontWeight: 700,
                                  color: Number(row.pending_amount) > 0 ? "#dc3545" : "#28a745",
                                }}>
                                  ₹{(() => {
                                    const val = row.pending_amount;
                                    if (!val || Number(val) === 0) return "0";
                                    return Math.floor(Number(val)).toLocaleString("en-IN");
                                  })()}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ whiteSpace: "nowrap", fontSize: "12px" }}>
                            <div><span style={{ color: "#6c757d" }}>Created:</span> <strong>{formatDateTime(row.create_at)}</strong></div>
                            <div><span style={{ color: "#6c757d" }}>Booking:</span> <strong>{formatDateTime(row.booking_date)}</strong></div>
                            {parseDateSafe(row.agreement_date) && (
                              <div><span style={{ color: "#6c757d" }}>
                                Agreement:</span> <strong>{formatDateTime(row.agreement_date)}</strong></div>
                            )}
                            {(() => {
                              const baseDate = parseDateSafe(row.agreement_date) || parseDateSafe(row.booking_date) || parseDateSafe(row.create_at);
                              if (!baseDate) return null;
                              const days = parseInt(row.payment_time) || 45;
                              const dueDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + days);
                              const now = new Date(); now.setHours(0, 0, 0, 0);
                              const isPast = dueDate < now && Number(row.pending_amount) > 0;
                              return (
                                <div>
                                  <span style={{ color: "#6c757d" }}>Due:</span>{" "}
                                  <strong style={{ color: isPast ? "#dc3545" : "#0d6efd" }}>
                                    {formatDateTime(dueDate)}
                                  </strong>
                                </div>
                              );
                            })()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-5">
                          <div style={{ color: "#74829c", fontSize: "14px", fontWeight: 600 }}>
                            {emptyFilterMessage}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* ── MOBILE TABLE ── */}
                <div className="project-table-mobile-wrap d-md-none">
                  <table className="project-table-mobile" style={{ minWidth: "680px" }}>
                    <thead>
                      <tr>
                        <th className="mobile-table-header" style={{ width: "40px" }}>#</th>
                        <th className="mobile-table-header">Customer / Contact</th>
                        <th className="mobile-table-header">Project / Plot</th>
                        <th className="mobile-table-header">Rate / Booking</th>
                        <th className="mobile-table-header">Amount Details</th>
                        <th className="mobile-table-header">
                          <div className="d-flex align-items-center gap-1">
                            Dates
                            {renderDateSortDropdown()}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-5">
                            <div style={{ color: "#74829c", fontSize: "14px", fontWeight: 600 }}>
                              Loading...
                            </div>
                          </td>
                        </tr>
                      ) : filteredReportData.length > 0 ? (
                        filteredReportData.map((row, index) => {
                          const baseDate = parseDateSafe(row.agreement_date) || parseDateSafe(row.booking_date) || parseDateSafe(row.create_at);
                          const days = parseInt(row.payment_time) || 45;
                          const dueDate = baseDate ? new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + days) : null;
                          const now = new Date(); now.setHours(0, 0, 0, 0);
                          const isPast = dueDate && dueDate < now && Number(row.pending_amount) > 0;

                          return (
                            <tr key={row.booking_id || index} className="mobile-table-row">
                              <td className="mobile-table-cell table-sno-cell">{(page - 1) * limit + index + 1}</td>

                              <td className="mobile-table-cell" style={{ maxWidth: "160px" }}>
                                {row.all_customers ? row.all_customers.map((cust, idx) => (
                                  <div key={idx} style={{ marginBottom: idx < row.all_customers.length - 1 ? '6px' : '0' }}>
                                    <div
                                      className={`mobile-name text-truncate${cust.font == 1 ? " kruti-dev" : ""}`}
                                      title={cust.name}
                                    >
                                      {cust.name}
                                    </div>
                                    <div className="mobile-address">Mob: {cust.mobile || "-"}</div>
                                  </div>
                                )) : (
                                  <>
                                    <div
                                      className={`mobile-name text-truncate${row.krutiDev_font == 1 ? " kruti-dev" : ""}`}
                                      title={row.customer_name}
                                    >
                                      {row.customer_name}
                                    </div>
                                    <div className="mobile-address">Mob: {row.mobile_no || "-"}</div>
                                  </>
                                )}
                                {row.broker_name && (
                                  <div className="mobile-address" style={{ fontSize: "11px", color: "#6c757d", marginTop: "3px" }}>
                                    Broker:{" "}
                                    <span className={row.broker_font == 1 ? "kruti-dev" : ""}>
                                      {row.broker_name}
                                    </span>
                                    {row.commission_type && (
                                      <span style={{ marginLeft: 3 }}>
                                        ({row.commission_type === "percentage"
                                          ? `${row.commission_value}%`
                                          : row.commission_type === "fixed"
                                            ? `₹${row.commission_value}`
                                            : "-"})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>

                              <td className="mobile-table-cell">
                                <div className={`mobile-name${row.project_font == 1 ? " kruti-dev" : ""}`} style={{ fontWeight: 600 }}>
                                  {row.project_name}
                                </div>
                                <div className={`mobile-address${row.project_font == 1 ? " kruti-dev" : ""}`}>
                                  {row.sector_name} / <strong style={{ color: "#333" }}>{row.plot_no}</strong>
                                </div>
                              </td>

                              <td className="mobile-table-cell mobile-rate-cell" style={{ fontSize: "12px" }}>
                                <div>
                                  Sq/F:{" "}
                                  <span className="rate-chip rate-chip-sqf">{row.square_feet_rate}</span>
                                </div>
                                {row.plc_drc ? (
                                  <div style={{ marginTop: 3 }}>
                                    PLC/DIC:{" "}
                                    <span className="rate-chip rate-chip-sqf">
                                      {row.plc_drc}%
                                    </span>
                                  </div>
                                ) : null}
                                <div style={{ marginTop: 3 }}>
                                  Booking:{" "}
                                  <span className="rate-chip rate-chip-dlc">₹{formatAmount(row.booking_amount)}</span>
                                </div>
                              </td>

                              <td className="mobile-table-cell" style={{ minWidth: "110px" }}>
                                <div style={{ fontSize: "11px", display: "flex", flexDirection: "column", gap: 3 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "#6c757d" }}>Total:</span>
                                    <span style={{ fontWeight: 700 }}>₹{(() => {
                                      const val = row.amount_a;
                                      if (!val || Number(val) === 0) return "0";
                                      return Math.floor(Number(val)).toLocaleString("en-IN");
                                    })()}</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "#0d6efd" }}>Paid:</span>
                                    <span style={{ color: "#0d6efd", fontWeight: 700 }}>₹{(() => {
                                      const val = row.received_amount;
                                      if (!val || Number(val) === 0) return "0";
                                      return Math.floor(Number(val)).toLocaleString("en-IN");
                                    })()}</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #dee2e6", paddingTop: 3, marginTop: 2 }}>
                                    <span style={{ color: "#6c757d" }}>Due:</span>
                                    <span style={{
                                      fontWeight: 700,
                                      color: Number(row.pending_amount) > 0 ? "#dc3545" : "#28a745",
                                    }}>
                                      ₹{(() => {
                                        const val = row.pending_amount;
                                        if (!val || Number(val) === 0) return "0";
                                        return Math.floor(Number(val)).toLocaleString("en-IN");
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="mobile-table-cell" style={{ whiteSpace: "nowrap", fontSize: "12px" }}>
                                <div><span style={{ color: "#6c757d" }}>Created:</span> <strong>{formatDateTime(row.create_at)}</strong></div>
                                <div><span style={{ color: "#6c757d" }}>Booking:</span> <strong>{formatDateTime(row.booking_date)}</strong></div>
                                {parseDateSafe(row.agreement_date) && (
                                  <div><span style={{ color: "#6c757d" }}>Agreement:</span> <strong>{formatDateTime(row.agreement_date)}</strong></div>
                                )}
                                {dueDate && (
                                  <div>
                                    <span style={{ color: "#6c757d" }}>Due:</span>{" "}
                                    <strong style={{ color: isPast ? "#dc3545" : "#0d6efd" }}>
                                      {formatDateTime(dueDate)}
                                    </strong>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-5">
                            <div style={{ color: "#74829c", fontSize: "14px", fontWeight: 600 }}>
                              {emptyFilterMessage}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
              
              {totalPages > 1 && (
                <ModernPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              )}
            </Card>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Report;
