import { API_BASE_URL } from "config/constant";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Dropdown,
  ListGroup,
  Form,
  Badge,
} from "react-bootstrap";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import LogoutModel from "layouts/AdminLayout/NavBar/NavRight/LogoutModel";
import "../style.css";
import axios from "axios";
import PasswordModal from "components/PasswordModal";
import Receipt from "views/Receipt/Receipt";
import "../Receipt/Receipt.css";
import { ReactTransliterate } from "react-transliterate";
import api from "utils/api";
import ModernPagination from "components/Pagination";

function RecordTable({ data, columns, getAllReceiveAmount, title }) {
  const [showModal, setShowModal] = useState(false);
  const pressedKeys = useRef(new Set());
  const [ReceiveAmountId, setReceiveAmountId] = useState();
  const [showInput, setShowInput] = useState(false);

  const [SearchProject, setSearchProject] = useState("");
  const [SearchLang, setSearchLang] = useState("hi_mangal");
  const [projectFilter, setProjectFilter] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [Errors, setErrors] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [page, setPage] = useState(initialPage);

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
  }, [page]);

  const [limit, setLimit] = useState(10);
  const [limitDropdownOpen, setLimitDropdownOpen] = useState(false); // ✅ controlled
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (column) => {
    if (column === '#' || column === 'Action') return;
    let direction = 'asc';
    if (sortConfig.key === column) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        // Reset to default on 3rd click
        setSortConfig({ key: null, direction: 'asc' });
        return;
      }
    }
    setSortConfig({ key: column, direction });
  };

  const [projectsData, setProjectsData] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("users"));

  const fetchProjects = async (assignedOnly = false) => {
    if (!userData?.user_token) return;
    const userId = userData?.user_id ?? userData?.id ?? null;
    setLoadingProjects(true);
    try {
      const params = {};
      if (userId) params.user_id = userId;
      if (assignedOnly) params.assigned_only = 1;
      const res = await api.get(`/dashboard/projectData`, {
        headers: { Authorization: userData.user_token },
        params,
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setProjectsData(res.data.data);
      }
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const grandStats = useMemo(() => {
    const target = projectFilter
      ? projectsData.filter((p) => String(p.project_id) === String(projectFilter))
      : projectsData;
    const total = target.reduce((sum, p) => sum + Number(p.total_booked_amount || 0), 0);
    const received = target.reduce((sum, p) => sum + Number(p.total_received_amount || 0), 0);
    const pending = target.reduce((sum, p) => sum + Number(p.pending_amount || 0), 0);
    return { total, received, pending };
  }, [projectsData, projectFilter]);

  const formatAmount = (val) => {
    if (val === null || val === undefined || val === "" || Number(val) === 0) return "0";
    const num = Math.floor(Number(val));
    return num.toLocaleString("en-IN");
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleNavigate = (row) => {
    const plotId = row?.plot_id ?? row?.plot_no;
    navigate(`/receiveamount/details/${plotId}`, {
      state: { data: row, plot_id: plotId },
    });
  };

  const handleDeleteAmount = async () => {
    try {
      const res = await api.delete(`/receiveamount`, {
        headers: { Authorization: userData.user_token },
        params: { receive_amountId: ReceiveAmountId },
      });
      if (res.data.success) {
        getAllReceiveAmount();
        setShowModal(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      pressedKeys.current.add(event.key.toLowerCase());

      if (
        (event.ctrlKey || pressedKeys.current.has('control')) &&
        pressedKeys.current.has('b') &&
        pressedKeys.current.has('c')
      ) {
        event.preventDefault();
        if (showInput) {
          setShowInput(false);
        } else {
          setShowPasswordModal(true);
        }
        pressedKeys.current.clear();
      }
    };

    const handleKeyUp = (event) => {
      pressedKeys.current.delete(event.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [showInput]);

  const handlePasswordSubmit = async (password) => {
    try {
      const res = await api.post(`/users/passwordb`, {
        user_id: userData?.user_id,
        password_b: password,
      });
      if (res.data.success) {
        setShowInput(true);
        setShowPasswordModal(false);
        setErrors(null);
      } else {
        setErrors(res.data.message || "Invalid password");
      }
    } catch (error) {
      console.log(error);
      setErrors("Server error");
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const projectSelectClass = (() => {
    if (!projectFilter) return "";
    const selectedProj = (data || []).find(
      (row) => String(row.project_id) === String(projectFilter),
    );
    return selectedProj && selectedProj.project_font == 1 ? "kruti-dev" : "";
  })();

  const filteredData = (() => {
    let base = data || [];
    const qRaw = String(SearchProject || "").trim();

    const isPending = window.location.pathname.includes('/pendingamount');
    const sortFn = (a, b) => {
      if (sortConfig.key) {
        let valA, valB;
        switch (sortConfig.key) {
          case 'Name': valA = a.customer_name || ''; valB = b.customer_name || ''; break;
          case 'Project': valA = a.project_name || ''; valB = b.project_name || ''; break;
          case 'Sec/Plot': valA = a.sector_name || ''; valB = b.sector_name || ''; break;
          case 'Rec Amt / Mode': valA = Number(a.amount) || 0; valB = Number(b.amount) || 0; break;
          case 'Pen Amount': 
          case 'Pen Amount ': valA = Number(a.pending_amount) || 0; valB = Number(b.pending_amount) || 0; break;
          case 'Total Amount': valA = Number(a.amount_a) || 0; valB = Number(b.amount_a) || 0; break;
          case 'Booking Date':
          case 'Receive Date':
            valA = new Date(a.receive_date).getTime() || 0;
            valB = new Date(b.receive_date).getTime() || 0;
            break;
          default: valA = a.id; valB = b.id; break;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return a.id - b.id; // secondary sort to keep stable order
      }

      // Default sorting
      if (isPending) {
        const dateA = new Date(a.receive_date);
        const dateB = new Date(b.receive_date);

        const is1970A = dateA.getFullYear() === 1970;
        const is1970B = dateB.getFullYear() === 1970;

        // Push 1970 to the very end
        if (is1970A && !is1970B) return 1;
        if (!is1970A && is1970B) return -1;

        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.id - b.id; // secondary sort
      }
      return b.id - a.id;
    };

    if (projectFilter) {
      const pid = Number(projectFilter);
      base = base.filter((row) => Number(row.project_id) === pid);
    }
    if (!qRaw) {
      return base.slice().sort(sortFn);
    }
    if (SearchLang === "hi_kruti") {
      return base
        .filter((row) => {
          return (
            String(row.project_name || "").includes(qRaw) ||
            String(row.sector_name || "").includes(qRaw) ||
            String(row.customer_name || "").includes(qRaw) ||
            String(row.plot_no || "").includes(qRaw)
          );
        })
        .sort(sortFn);
    }
    const q = qRaw.toLowerCase();
    return base
      .filter((row) => {
        return (
          String(row.project_name || "").toLowerCase().includes(q) ||
          String(row.sector_name || "").toLowerCase().includes(q) ||
          String(row.customer_name || "").toLowerCase().includes(q) ||
          String(row.plot_no || "").toLowerCase().includes(q)
        );
      })
      .sort(sortFn);
  })();

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const startIndex = (page - 1) * limit;
  const paginatedData = filteredData.slice(startIndex, startIndex + limit);

  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (page !== 1) setPage(1);
  }, [SearchProject, projectFilter, SearchLang]);

  return (
    <React.Fragment>
      <Row>
        <Col>
          {/* ── Card wrapper with theme ── */}
          <div className="project-table-card">
            <Card className="card">

              {/* ══════════════════════════════
                  CARD HEADER  — theme gradient (same as BookingTable)
              ══════════════════════════════ */}
              <Card.Header className="project-header">

                {/* Row 1: Title + Controls */}
  {/* Desktop View */}
  <div className="d-none d-md-flex flex-column gap-2 w-100">
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 w-100">
      <h5 className="project-title mb-0" style={{ color: "#ffffff", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.03em" }}>
        {title || "Receive Amount"}&nbsp;
        <span style={{ background: "rgba(255,255,255,0.22)", color: "#ffffff", fontSize: "12px", fontWeight: 700, borderRadius: "20px", padding: "3px 10px", border: "1px solid rgba(255,255,255,0.35)", display: "inline-block", verticalAlign: "middle" }}>
          {filteredData.length}
        </span>
      </h5>

      <div className="controls-row d-flex align-items-center gap-2">
        <Dropdown show={limitDropdownOpen} onToggle={(val) => setLimitDropdownOpen(val)}>
          <Dropdown.Toggle className="limit-toggle">{limit} <span className="limit-chevron">▾</span></Dropdown.Toggle>
          <Dropdown.Menu className="limit-menu">
            {[10, 25, 50, 100].map((n, i, arr) => (
              <React.Fragment key={n}>
                <div className={`limit-item${limit === n ? " active" : ""}`} onClick={() => { setLimit(n); setPage(1); setLimitDropdownOpen(false); }}>{n}</div>
                {i < arr.length - 1 && <Dropdown.Divider className="limit-divider" />}
              </React.Fragment>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <select className={`custom-select ${projectSelectClass}`} style={{ width: "150px" }} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
          <option value="" className="default-font-family">All Projects</option>
          {projectsData.map((proj) => (
            <option key={proj.project_id} value={proj.project_id} className={proj.krutiDev_font ? "kruti-dev" : "default-font-family"}>{proj.project_name}</option>
          ))}
        </select>

        <select className="custom-select" style={{ width: "120px" }} value={SearchLang} onChange={(e) => { setSearchLang(e.target.value); setSearchProject(""); }}>
          <option value="en">English</option>
          <option value="hi_mangal">Mangal</option>
          <option value="hi_kruti">Hindi</option>
        </select>

        <div className="search-wrap">
          <i className="feather icon-search search-icon" />
          {SearchLang === "hi_mangal" ? (
            <ReactTransliterate value={SearchProject} onChangeText={(text) => setSearchProject(text)} lang="hi" placeholder="Search…" renderComponent={(props) => (
              <input {...props} maxLength={50} className="search-input" style={{ fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif" }} />
            )} />
          ) : (
            <input className={`search-input${SearchLang === "hi_kruti" ? " kruti-dev" : ""}`} value={SearchProject} onChange={(e) => setSearchProject(e.target.value)} maxLength={50} placeholder={SearchLang === "hi_kruti" ? "खोजें" : "Search…"} />
          )}
        </div>

        <button className="btn-add" onClick={() => navigate("/receiveamount/add")}><span className="btn-add-icon">＋</span> Add</button>
      </div>
    </div>

    <div className="d-flex gap-2 mt-2 flex-wrap justify-content-end w-100">
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "10px", padding: "6px 14px", backdropFilter: "blur(8px)" }}>
        <span style={{ fontSize: "16px" }}>💰</span>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Total</div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>₹{formatAmount(grandStats.total)}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(16,185,129,0.20)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: "10px", padding: "6px 14px", backdropFilter: "blur(8px)" }}>
        <span style={{ fontSize: "16px" }}>✅</span>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Received</div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#6ee7b7" }}>₹{formatAmount(grandStats.received)}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.32)", borderRadius: "10px", padding: "6px 14px", backdropFilter: "blur(8px)" }}>
        <span style={{ fontSize: "16px" }}>⏳</span>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Pending</div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#fca5a5" }}>₹{formatAmount(grandStats.pending)}</div>
        </div>
      </div>
    </div>
  </div>

  {/* Mobile View */}
  <div className="d-md-none" style={{ width: '100%' }}>
    {/* Title & Add Button */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
      <h5 className="project-title mb-0" style={{ color: "#ffffff", fontWeight: 800, fontSize: "16px", letterSpacing: "-0.03em" }}>
        {title || "Receive Amount"}&nbsp;
        <span style={{ background: "rgba(255,255,255,0.22)", color: "#ffffff", fontSize: "11px", fontWeight: 700, borderRadius: "20px", padding: "2px 8px", border: "1px solid rgba(255,255,255,0.35)", display: "inline-block", verticalAlign: "middle" }}>
          {filteredData.length}
        </span>
      </h5>
      <button className="btn-add" style={{ width: '75px', padding: "4px 0", fontSize: "12px", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => navigate("/receiveamount/add")}>
        <span className="btn-add-icon" style={{ fontSize: "14px", marginRight: "4px" }}>＋</span> Add
      </button>
    </div>

    {/* Search */}
    <div className="search-wrap" style={{ width: '100%', marginBottom: '10px' }}>
      <i className="feather icon-search search-icon" />
      {SearchLang === "hi_mangal" ? (
        <ReactTransliterate value={SearchProject} onChangeText={(text) => setSearchProject(text)} lang="hi" placeholder="Search…" renderComponent={(props) => (
          <input {...props} maxLength={50} className="search-input" style={{ width: '100%', fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif" }} />
        )} />
      ) : (
        <input className={`search-input${SearchLang === "hi_kruti" ? " kruti-dev" : ""}`} style={{ width: '100%' }} value={SearchProject} onChange={(e) => setSearchProject(e.target.value)} maxLength={50} placeholder={SearchLang === "hi_kruti" ? "खोजें" : "Search…"} />
      )}
    </div>

    {/* Row 3: All 3 Dropdowns (Language, Projects, Limit) */}
    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', width: '100%' }}>
      <div style={{ flex: 1 }}>
        <select className="custom-select" style={{ width: '100%', height: '36px', fontSize: '13px', padding: '0 4px' }} value={SearchLang} onChange={(e) => { setSearchLang(e.target.value); setSearchProject(""); }}>
          <option value="en">English</option>
          <option value="hi_mangal">Mangal</option>
          <option value="hi_kruti">Hindi</option>
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <select className={`custom-select ${projectSelectClass}`} style={{ width: '100%', height: '36px', fontSize: '13px', padding: '0 4px' }} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
          <option value="" className="default-font-family">All Projects</option>
          {projectsData.map((proj) => (
            <option key={proj.project_id} value={proj.project_id} className={proj.krutiDev_font ? "kruti-dev" : "default-font-family"}>{proj.project_name}</option>
          ))}
        </select>
      </div>
      <div style={{ width: '75px' }}>
        <Dropdown show={limitDropdownOpen} onToggle={(val) => setLimitDropdownOpen(val)}>
          <Dropdown.Toggle className="limit-toggle" style={{ width: '100%', height: '36px', padding: '0 4px', fontSize: '12px' }}>{limit} <span className="limit-chevron">▾</span></Dropdown.Toggle>
          <Dropdown.Menu className="limit-menu">
            {[10, 25, 50, 100].map((n, i, arr) => (
              <React.Fragment key={n}>
                <div className={`limit-item${limit === n ? " active" : ""}`} onClick={() => { setLimit(n); setPage(1); setLimitDropdownOpen(false); }}>{n}</div>
                {i < arr.length - 1 && <Dropdown.Divider className="limit-divider" />}
              </React.Fragment>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>

    {/* Stats: Horizontal scroll */}
    <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", margin: "0 -4px", padding: "0 4px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "8px", padding: "6px 12px", backdropFilter: "blur(8px)" }}>
        <span style={{ fontSize: "14px" }}>💰</span>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>Total</div>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>₹{formatAmount(grandStats.total)}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, background: "rgba(16,185,129,0.20)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: "8px", padding: "6px 12px", backdropFilter: "blur(8px)" }}>
        <span style={{ fontSize: "14px" }}>✅</span>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>Received</div>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#6ee7b7" }}>₹{formatAmount(grandStats.received)}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.32)", borderRadius: "8px", padding: "6px 12px", backdropFilter: "blur(8px)" }}>
        <span style={{ fontSize: "14px" }}>⏳</span>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>Pending</div>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#fca5a5" }}>₹{formatAmount(grandStats.pending)}</div>
        </div>
      </div>
    </div>
  </div>

              </Card.Header>

              {/* ══════════════════════════════
                  CARD BODY
              ══════════════════════════════ */}
              <Card.Body className="card-body-p0">

                {/* ── DESKTOP TABLE ── */}
                <table className="project-table-desktop d-none d-md-table">
                  <thead>
                    <tr>
                      {columns &&
                        columns.map((column, index) => {
                          if (column === "Pen Amount" && !showInput) return null;
                          const isSortable = column !== '#' && column !== 'Action';
                          return (
                            <th 
                              key={index} 
                              className="table-header-cell"
                              onClick={() => isSortable && handleSort(column)}
                              style={{ cursor: isSortable ? 'pointer' : 'default', userSelect: 'none' }}
                            >
                              {column}
                              {sortConfig.key === column ? (
                                <span style={{ marginLeft: '4px', fontSize: '12px' }}>
                                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                </span>
                              ) : isSortable ? (
                                <span style={{ marginLeft: '4px', fontSize: '12px', opacity: 0.3 }}>↕</span>
                              ) : null}
                            </th>
                          );
                        })}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, index) => (
                      <tr
                        key={index}
                        className="table-row-clickable"
                        onClick={() => handleNavigate(row)}
                      >
                        {/* # */}
                        <td className="table-sno-cell">{startIndex + index + 1}</td>

                        {/* Customer Name */}
                        <td
                          className={row.krutiDev_font == 1 ? "kruti-dev" : ""}
                          title={row.customer_name}
                          style={{
                            maxWidth: "150px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {row.customer_name}
                        </td>

                        {/* Project Name */}
                        <td className={row.project_font == 1 ? "kruti-dev" : ""}>
                          {row.project_name}
                        </td>

                        {/* Sector / Plot */}
                        <td className={row.project_font == 1 ? "kruti-dev" : ""}>
                          <div style={{ fontWeight: 600 }}>{row.sector_name}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{row.plot_no}</div>
                        </td>

                        {/* Amount */}
                        <td>
                          <div style={{ fontSize: "15px", fontWeight: 700 }}>
                            ₹{formatAmount(row.amount)}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            {row.amount_a_type}
                          </div>
                        </td>

                        {/* Pen Amount (conditional) */}
                        {showInput && (
                          <td style={{ fontSize: "15px", fontWeight: 600, color: "var(--accent)" }}>
                            ₹{formatAmount(row.amount_b)}
                          </td>
                        )}

                        {/* Pending Amount */}
                        <td style={{ fontWeight: 600, color: Number(row.pending_amount) > 0 ? "var(--red)" : "var(--green)" }}>
                          ₹{formatAmount(row.pending_amount)}
                        </td>

                        {/* Total Amount */}
                        <td style={{ fontWeight: 600 }}>
                          ₹{formatAmount(row.amount_a)}
                        </td>

                        {/* Receive Date */}
                        <td style={{ whiteSpace: "nowrap" }}>
                          {formatDateTime(row.receive_date)}
                        </td>

                        {/* Action */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <Dropdown
                            align="start"
                            show={openDropdown === `desktop-${index}`}
                            onToggle={() =>
                              setOpenDropdown(openDropdown === `desktop-${index}` ? null : `desktop-${index}`)
                            }
                          >
                            <Dropdown.Toggle
                              as="div"
                              className="action-icon custom-action-toggle"
                            >
                              <i className="feather icon-more-vertical" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end" className="profile-notification" style={{ padding: "6px", minWidth: "160px", zIndex: 990 }}>
                              {[
                                { icon: "icon-message-square", label: "Remark", color: "var(--accent)", fn: () => navigate(`/project/remarks/${row.project_id}`, { state: { row } }) },
                                { icon: "icon-eye", label: "View", color: "var(--blue)", fn: () => handleNavigate(row) },
                                { icon: "icon-edit", label: "Add", color: "var(--green)", fn: () => navigate("/receiveamount/add", { state: { row } }) },
                                { icon: "icon-printer", label: "Receipt", color: "var(--text-secondary)", fn: () => { setShowReceiptModal(true); setSelectedRow(row); setOpenDropdown(null); } },
                              ].map(({ icon, label, color, fn }) => (
                                <div
                                  key={label}
                                  onClick={fn}
                                  style={{
                                    display: "flex", alignItems: "center", gap: "9px",
                                    padding: "8px 10px", borderRadius: "8px", cursor: "pointer",
                                    fontSize: "13px", fontFamily: "var(--font)",
                                    color: "var(--text-primary)",
                                    transition: "background 0.15s",
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                  <i className={`feather ${icon}`} style={{ fontSize: "15px", color, flexShrink: 0 }} />
                                  {label}
                                </div>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ── MOBILE TABLE ── */}
                <div className="project-table-mobile-wrap d-md-none">
                  <table className="project-table-mobile">
                    <thead>
                      <tr>
                        <th className="mobile-table-header">#</th>
                        <th className="mobile-table-header">Customer / Project</th>
                        <th className="mobile-table-header">Sec/Plot / Receive Amt</th>
                        <th className="mobile-table-header">Type / Comment</th>
                        <th className="mobile-table-header">Receive Date</th>
                        <th className="mobile-table-header">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((row, index) => (
                        <tr
                          key={index}
                          className="mobile-table-row"
                          onClick={() => handleNavigate(row)}
                        >
                          <td className="mobile-table-cell table-sno-cell">{startIndex + index + 1}</td>

                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <span
                              className={`mobile-name ${row.krutiDev_font == 1 ? "kruti-dev" : ""}`}
                              title={row.customer_name}
                              style={{
                                maxWidth: "140px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}
                            >
                              {row.customer_name}
                            </span>
                            <span className="mobile-address" style={{ fontSize: "11px" }}>
                              {row.project_name}
                            </span>
                          </td>

                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <div>
                              Sec: <span className={row.project_font == 1 ? "kruti-dev" : ""}>{row.sector_name}</span>
                              {" / "}
                              Plot: <span className={row.project_font == 1 ? "kruti-dev" : ""}>{row.plot_no}</span>
                            </div>
                            <div>
                              Receive Amt: <strong>₹{formatAmount(row.amount)}</strong>
                            </div>
                            {showInput && (
                              <div>
                                Pen Amt: <strong>₹{formatAmount(row.amount_b)}</strong>
                              </div>
                            )}
                          </td>

                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <div>
                              Type: <strong>{row.amount_a_type}</strong>
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                              {row.additional_comments}
                            </div>
                          </td>

                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <strong>{formatDateTime(row.receive_date)}</strong>
                          </td>

                          <td className="mobile-table-cell" onClick={(e) => e.stopPropagation()}>
                            <Dropdown
                              align="end"
                              show={openDropdown === `mobile-${index}`}
                              onToggle={() =>
                                setOpenDropdown(openDropdown === `mobile-${index}` ? null : `mobile-${index}`)
                              }
                            >
                              <Dropdown.Toggle as="div" className="action-icon custom-action-toggle">
                                <i className="feather icon-more-vertical" />
                              </Dropdown.Toggle>
                              <Dropdown.Menu align="end" className="profile-notification" style={{ padding: "6px", minWidth: "140px", zIndex: 990 }}>
                                {[
                                  { icon: "icon-message-square", label: "Remark", color: "var(--accent)", fn: () => navigate(`/project/remarks/${row.project_id}`, { state: { row } }) },
                                  { icon: "icon-eye", label: "View", color: "var(--blue)", fn: () => handleNavigate(row) },
                                  { icon: "icon-edit", label: "Add", color: "var(--green)", fn: () => navigate("/receiveamount/add", { state: { row } }) },
                                  { icon: "icon-printer", label: "Receipt", color: "var(--text-secondary)", fn: () => { setShowReceiptModal(true); setSelectedRow(row); setOpenDropdown(null); } },
                                ].map(({ icon, label, color, fn }) => (
                                  <div
                                    key={label}
                                    onClick={fn}
                                    style={{
                                      display: "flex", alignItems: "center", gap: "8px",
                                      padding: "8px 10px", borderRadius: "8px", cursor: "pointer",
                                      fontSize: "13px", fontFamily: "var(--font)",
                                      color: "var(--text-primary)", transition: "background 0.15s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <i className={`feather ${icon}`} style={{ fontSize: "15px", color, flexShrink: 0 }} />
                                    {label}
                                  </div>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </Card.Body>

              <ModernPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </Card>
          </div>

          {/* ── Modals ── */}
          {showModal && (
            <LogoutModel
              projectId={ReceiveAmountId}
              setShowModal={setShowModal}
              handleFun={handleDeleteAmount}
              title="Confirm Delete"
              subtitle="Are you sure?"
              btnText="Delete"
            />
          )}

          {showReceiptModal && selectedRow && (
            <div
              className="modal fade show"
              style={{
                display: "block",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1050,
                overflow: "hidden",
              }}
            >
              <div className="modal-dialog modal-md modal-dialog-centered" style={{ maxWidth: "820px" }}>
                <div className="modal-content position-relative">
                  <div className="modal-body">
                    <Receipt
                      data={{ selectedRow }}
                      onClose={() => setShowReceiptModal(false)}
                      getAllReceiveAmount={getAllReceiveAmount}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <PasswordModal
            show={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            errors={Errors}
            onSubmit={handlePasswordSubmit}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
}

export default RecordTable;