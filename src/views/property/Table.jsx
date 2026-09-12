import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Dropdown,
  ListGroup,
  Form,
  OverlayTrigger,
  Tooltip,
  Alert,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import LogoutModel from "layouts/AdminLayout/NavBar/NavRight/LogoutModel";
import { API_BASE_URL } from "config/constant";
import "./style.css";
import api from "utils/api";
import { ReactTransliterate } from "react-transliterate";
import ModernPagination from "components/Pagination";

const TableData = () => {
  const [showModal, setShowModal] = useState(false);
  const [BookingId, setBookingId] = useState();
  const [SearchLang, setSearchLang] = useState("hi_mangal");

  const [searchProject, setSearchProject] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [typeFilter, setTypeFilter] = useState(0); // 0 = All

  const [mergeModal, setMergeModal] = useState(false);
  const [mergeLoading, setMergeLoading] = useState(false);

  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("users") || "{}");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [limitDropdownOpen, setLimitDropdownOpen] = useState(false); // ✅ controlled

  const location = useLocation();
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const getTypeFromUrl = () => {
    if (location.pathname.includes("/registries")) return 2;
    if (location.pathname.includes("/allotmentsListing")) return 1;
    return null; // ALL
  };

  const type = getTypeFromUrl();

  /* ================= HELPERS ================= */

  const getFontClass = (fontValue) => {
    const v = Number(fontValue);
    return v === 2 ? "kruti-dev" : "";
  };

  const formatDate = (val) => {
    if (!val) return "-";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  /* ================= NAVIGATION ================= */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target.closest(".drp-user")) return;
      setOpenDropdownId(null);
    };

    if (openDropdownId !== null) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [openDropdownId]);

  const handleMergeConfirm = async () => {
    try {
      setMergeLoading(true);

      const res = await api.post(
        `/properties/merge`,
        {
          target_land_id: selectedIds[0],
          source_land_ids: selectedIds,
        },
        { headers: { Authorization: userData?.user_token } },
      );

      if (res.data?.success) {
        alert("Properties merged successfully");
        setSelectedIds([]);
        setMergeModal(false);
        fetchProperties();
      } else {
        alert(res.data?.message || "Merge failed");
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Server error while merging");
    } finally {
      setMergeLoading(false);
    }
  };

  const handleNavigate = (row) => {
    navigate("/Properties/edit", { state: { data: row, mode: "edit" } });
  };

  const handleView = (row) => {
    navigate("/Properties/edit", { state: { data: row, mode: "view" } });
  };

  const handleRowClick = (row) => {
    navigate("/Properties/details", { state: { data: row } });
  };

  const fetchProperties = async () => {
    const params = {
      page: currentPage,
      limit,
    };

    if (typeFilter === 1 || typeFilter === 2) {
      params.type = typeFilter;
    } else if (type !== null) {
      params.type = type;
    }

    try {
      setLoading(true);
      const res = await api.get(`/properties/list`, {
        headers: { Authorization: userData?.user_token },
        params,
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        setProperties(res.data.data || []);
        setTotalPages(res.data.total_pages || 0);
      } else {
        setProperties([]);
      }
    } catch (e) {
      console.error(e);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [type, typeFilter, currentPage, limit]);

  const handleShowModel = (id) => {
    setBookingId(id);
    setShowModal(true);
  };

  const handleDeleteProperty = async () => {
    if (!BookingId) return;

    try {
      setDeleteLoading(true);
      const res = await api.post(
        `/properties/delete`,
        { land_id: BookingId },
        { headers: { Authorization: userData?.user_token } },
      );

      if (res.data?.success) {
        setProperties((prev) => prev.filter((p) => p.land_id !== BookingId));
        setShowModal(false);
        fetchProperties();
      } else {
        alert(res.data?.message || "Delete failed");
      }
    } catch (e) {
      alert("Server error");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ================= SEARCH ================= */

  const filteredData = searchProject
    ? properties.filter((row) => {
        const q = searchProject.toLowerCase();
        const sellers = Array.isArray(row.sellers) ? row.sellers : [];
        const buyers = Array.isArray(row.buyers) ? row.buyers : [];
        return (
          sellers.some((s) => s.name?.toLowerCase().includes(q)) ||
          buyers.some((b) => b.name?.toLowerCase().includes(q))
        );
      })
    : properties;

  const columnsDesktop = [
    "",
    "PARTIES",
    "LAND / CATEGORY",
    "RERA / CONVERSION / DATES",
    "Action",
  ];

  const columnsMobile = ["", "PARTIES", "LAND", "RERA", "Action"];
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const columns = isMobile ? columnsMobile : columnsDesktop;

  const getPageTitle = () => {
    if (location.pathname.includes("/registries")) {
      return "Registries";
    }
    if (location.pathname.includes("/allotmentsListing")) {
      return "Allotments";
    }
    return "Properties";
  };

  return (
    <Row>
      <Col>
        {/* ── Card wrapper with theme ── */}
        <div className="project-table-card">
          <Card className="card">

            {/* ══════════════════════════════════════
                CARD HEADER — theme gradient (same as BookingTable)
            ══════════════════════════════════════ */}
            <Card.Header className="project-header">

              {/* Desktop View */}
              <div className="d-none d-md-flex flex-column gap-2 w-100">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 w-100">
                  <h5 className="project-title mb-0" style={{ color: "#ffffff", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.03em" }}>
                    {getPageTitle()}&nbsp;
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
                            <div className={`limit-item${limit === n ? " active" : ""}`} onClick={() => { setLimit(n); setCurrentPage(1); setLimitDropdownOpen(false); }}>{n}</div>
                            {i < arr.length - 1 && <Dropdown.Divider className="limit-divider" />}
                          </React.Fragment>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>

                    <button
                      className={`custom-btn ${selectedIds.length < 2 ? 'custom-btn-disabled' : 'custom-btn-primary'}`}
                      disabled={selectedIds.length < 2}
                      onClick={() => { if (selectedIds.length < 2) { alert("Please select at least 2 properties"); return; } setMergeModal(true); }}
                      style={{ padding: "6px 16px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: 600, background: selectedIds.length < 2 ? "var(--text-muted)" : "var(--accent)", color: "#ffffff", cursor: selectedIds.length < 2 ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                    >
                      Merge
                    </button>

                    <select className="custom-select" style={{ width: "130px" }} value={typeFilter} onChange={(e) => setTypeFilter(Number(e.target.value))}>
                      <option value={0}>All</option>
                      <option value={1}>Allotments</option>
                      <option value={2}>Registries</option>
                    </select>

                    <select className="custom-select" style={{ width: "120px" }} value={SearchLang} onChange={(e) => { setSearchLang(e.target.value); setSearchProject(""); }}>
                      <option value="en">English</option>
                      <option value="hi_mangal">Mangal</option>
                    </select>

                    <div className="search-wrap">
                      <i className="feather icon-search search-icon" />
                      {SearchLang === "hi_mangal" ? (
                        <ReactTransliterate value={searchProject} onChangeText={(text) => setSearchProject(text)} lang="hi" placeholder="Search by seller / buyer" renderComponent={(props) => (
                          <input {...props} maxLength={50} className="search-input" style={{ fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif" }} />
                        )} />
                      ) : (
                        <input className="search-input" value={searchProject} onChange={(e) => setSearchProject(e.target.value)} maxLength={50} placeholder="Search by seller / buyer" />
                      )}
                    </div>

                    <button className="btn-add" onClick={() => navigate("/Properties/Add")}><span className="btn-add-icon">＋</span> Add</button>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-2 flex-wrap justify-content-end w-100">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "10px", padding: "6px 14px", backdropFilter: "blur(8px)" }}>
                    <span style={{ fontSize: "16px" }}>🏢</span>
                    <div style={{ lineHeight: 1.2 }}>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Total Properties</div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>{filteredData.length}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile View */}
              <div className="d-md-none" style={{ width: '100%' }}>
                {/* Title & Add Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h5 className="project-title mb-0" style={{ color: "#ffffff", fontWeight: 800, fontSize: "16px", letterSpacing: "-0.03em" }}>
                    {getPageTitle()}&nbsp;
                    <span style={{ background: "rgba(255,255,255,0.22)", color: "#ffffff", fontSize: "11px", fontWeight: 700, borderRadius: "20px", padding: "2px 8px", border: "1px solid rgba(255,255,255,0.35)", display: "inline-block", verticalAlign: "middle" }}>
                      {filteredData.length}
                    </span>
                  </h5>
                  <button className="btn-add" style={{ width: '75px', padding: "4px 0", fontSize: "12px", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => navigate("/Properties/Add")}>
                    <span className="btn-add-icon" style={{ fontSize: "14px", marginRight: "4px" }}>＋</span> Add
                  </button>
                </div>

                {/* Row 2: Limit & Merge */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', width: '100%' }}>
                  <div style={{ width: '75px' }}>
                    <Dropdown show={limitDropdownOpen} onToggle={(val) => setLimitDropdownOpen(val)}>
                      <Dropdown.Toggle className="limit-toggle" style={{ width: '100%', height: '36px', padding: '0 8px' }}>{limit} <span className="limit-chevron">▾</span></Dropdown.Toggle>
                      <Dropdown.Menu className="limit-menu">
                        {[10, 25, 50, 100].map((n, i, arr) => (
                          <React.Fragment key={n}>
                            <div className={`limit-item${limit === n ? " active" : ""}`} onClick={() => { setLimit(n); setCurrentPage(1); setLimitDropdownOpen(false); }}>{n}</div>
                            {i < arr.length - 1 && <Dropdown.Divider className="limit-divider" />}
                          </React.Fragment>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  <div style={{ flex: 1 }}>
                    <button
                      className={`custom-btn ${selectedIds.length < 2 ? 'custom-btn-disabled' : 'custom-btn-primary'}`}
                      disabled={selectedIds.length < 2}
                      onClick={() => { if (selectedIds.length < 2) { alert("Please select at least 2 properties"); return; } setMergeModal(true); }}
                      style={{ width: '100%', height: "36px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: 600, background: selectedIds.length < 2 ? "var(--text-muted)" : "var(--accent)", color: "#ffffff", cursor: selectedIds.length < 2 ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                    >
                      Merge
                    </button>
                  </div>
                </div>

                {/* Row 3: Filter & Language */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', width: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <select className="custom-select" style={{ width: '100%', height: '36px', fontSize: '13px' }} value={typeFilter} onChange={(e) => setTypeFilter(Number(e.target.value))}>
                      <option value={0}>All</option>
                      <option value={1}>Allotments</option>
                      <option value={2}>Registries</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <select className="custom-select" style={{ width: '100%', height: '36px', fontSize: '13px' }} value={SearchLang} onChange={(e) => { setSearchLang(e.target.value); setSearchProject(""); }}>
                      <option value="en">English</option>
                      <option value="hi_mangal">Mangal</option>
                    </select>
                  </div>
                </div>

                {/* Search */}
                <div className="search-wrap" style={{ width: '100%', marginBottom: '10px' }}>
                  <i className="feather icon-search search-icon" />
                  {SearchLang === "hi_mangal" ? (
                    <ReactTransliterate value={searchProject} onChangeText={(text) => setSearchProject(text)} lang="hi" placeholder="Search by seller / buyer" renderComponent={(props) => (
                      <input {...props} maxLength={50} className="search-input" style={{ width: '100%', fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif" }} />
                    )} />
                  ) : (
                    <input className="search-input" style={{ width: '100%' }} value={searchProject} onChange={(e) => setSearchProject(e.target.value)} maxLength={50} placeholder="Search by seller / buyer" />
                  )}
                </div>

                {/* Stats */}
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "8px", padding: "6px 12px", backdropFilter: "blur(8px)" }}>
                    <span style={{ fontSize: "14px" }}>🏢</span>
                    <div style={{ lineHeight: 1.1, textAlign: 'center' }}>
                      <div style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>Total Properties</div>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>{filteredData.length}</div>
                    </div>
                  </div>
                </div>
              </div>

            </Card.Header>

            {/* ══════════════════════════════════════
                CARD BODY
            ══════════════════════════════════════ */}
            <Card.Body className="card-body-p0">

              {loading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
              ) : (
                <table className="project-table-desktop d-none d-md-table">
                  <thead>
                    <tr>
                      <th className="table-header-cell" style={{ width: "70px", textAlign: "center" }}>
                        <div className="d-flex align-items-center justify-content-start gap-1">
                          <Form.Check
                            type="checkbox"
                            id="select-all"
                            className="custom-checkbox"
                            checked={
                              filteredData.length > 0 &&
                              filteredData
                                .filter((r) => !r.project_created)
                                .every((r) => selectedIds.includes(r.land?.id))
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                const enabledIds = filteredData
                                  .filter((r) => !r.project_created)
                                  .map((r) => r.land?.id);
                                setSelectedIds(enabledIds);
                              } else {
                                setSelectedIds([]);
                              }
                            }}
                          />
                          <Form.Label htmlFor="select-all" className="mb-0" style={{ fontSize: "12px" }}>
                            All
                          </Form.Label>
                        </div>
                      </th>
                      <th className="table-header-cell" style={{ width: "30%" }}>PARTIES</th>
                      <th className="table-header-cell" style={{ width: "25%" }}>LAND / CATEGORY</th>
                      <th className="table-header-cell" style={{ width: "25%" }}>RERA / CONVERSION / DATES</th>
                      <th className="table-header-cell" style={{ width: "120px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center" style={{ padding: "40px", color: "var(--text-muted)" }}>
                          No records found
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((row) => {
                        const land = row.land || {};
                        const sellers = Array.isArray(row.sellers) ? row.sellers : [];
                        const buyers = Array.isArray(row.buyers) ? row.buyers : [];
                        const payment = row.payment || {};
                        const rera = row.rera || {};

                        const primarySeller = sellers[0] || {};
                        const sellerName = primarySeller.name || "-";
                        const poaHolder = primarySeller.poa_holder_name || "-";

                        const buyerNames = buyers
                          .map((b) => b.name)
                          .filter(Boolean)
                          .join(", ");
                        const firstBuyerName = buyerNames.split(",")[0] || "-";

                        const landArea =
                          land.land_area && land.land_area_type
                            ? `${land.land_area} ${land.land_area_type}`
                            : land.land_area_type || "-";

                        const fontClass = getFontClass(primarySeller.font_name);
                        const key = land.land_id || Math.random();

                        return (
                          <tr key={key} className="table-row-clickable">
                            {/* CHECKBOX */}
                            <td
                              style={{ width: "70px", textAlign: "left" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Form.Check
                                type="checkbox"
                                className="custom-checkbox"
                                disabled={row.project_created}
                                checked={selectedIds.includes(land.id)}
                                onChange={(e) => {
                                  if (row.project_created) return;
                                  if (e.target.checked) {
                                    setSelectedIds((prev) => [...prev, land.id]);
                                  } else {
                                    setSelectedIds((prev) =>
                                      prev.filter((id) => id !== land.id)
                                    );
                                  }
                                }}
                              />
                            </td>

                            {/* PARTIES */}
                            <td
                              onClick={() => handleRowClick(row)}
                              style={{ maxWidth: "320px" }}
                              className="text-wrap text-break"
                            >
                              <div>
                                <strong>Seller:</strong>{" "}
                                <span className={fontClass}>{sellerName}</span>
                              </div>
                              <div>
                                <strong>POA Holder:</strong>{" "}
                                <span className={fontClass}>{poaHolder}</span>
                              </div>
                              <div>
                                <strong>Buyer:</strong>{" "}
                                <span className={fontClass}>{firstBuyerName}</span>
                              </div>
                            </td>

                            {/* LAND */}
                            <td onClick={() => handleRowClick(row)}>
                              <div>
                                <strong>Area:</strong> {landArea}
                              </div>
                              <div>
                                <strong>Upni/Chak:</strong> {land.upni_no_or_chak_no || "-"}
                              </div>
                              <div>
                                <strong>Rajaswa:</strong> {land.rajaswa_no || "-"}
                              </div>
                              <div>
                                <strong>Category:</strong> {payment.land_category || "-"}
                              </div>
                              <div>
                                <strong>Possession:</strong>{" "}
                                {payment.physical_possession_status || "-"}
                              </div>
                            </td>

                            {/* RERA */}
                            <td onClick={() => handleRowClick(row)}>
                              {rera?.list?.length > 0 ? (
                                rera.list.map((item, i) => (
                                  <div key={item.id || i}>
                                    <strong>RERA {i + 1}:</strong>{" "}
                                    {item.rera_number || "-"}
                                  </div>
                                ))
                              ) : (
                                <div>
                                  <strong>RERA:</strong> -
                                </div>
                              )}
                              <div>
                                <strong>Payment:</strong>{" "}
                                {formatDate(payment.payment_date)}
                              </div>
                            </td>

                            {/* ACTION */}
                            <td
                              style={{ width: "80px", textAlign: "right", verticalAlign: "top" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Dropdown
                                align="end"
                                className="drp-user"
                                container="body"
                                show={openDropdownId === land.id}
                                onToggle={(isOpen) =>
                                  setOpenDropdownId(isOpen ? land.id : null)
                                }
                              >
                                <Dropdown.Toggle
                                  as="div"
                                  className="action-icon custom-action-toggle"
                                >
                                  <i className="feather icon-more-vertical" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end" className="profile-notification" style={{ padding: "6px", minWidth: "160px" }}>
                                  <div
                                    onClick={() => { setOpenDropdownId(null); handleView(row); }}
                                    style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <i className="feather icon-eye" style={{ fontSize: "15px", color: "var(--blue)", flexShrink: 0 }} />
                                    View
                                  </div>
                                  <div
                                    onClick={() => { setOpenDropdownId(null); handleNavigate(row); }}
                                    style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <i className="feather icon-edit" style={{ fontSize: "15px", color: "var(--green)", flexShrink: 0 }} />
                                    Edit
                                  </div>
                                  <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                                  <div
                                    onClick={() => { setOpenDropdownId(null); handleShowModel(land.id); }}
                                    style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <i className="feather icon-trash-2" style={{ fontSize: "15px", color: "var(--red)", flexShrink: 0 }} />
                                    Delete
                                  </div>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

              {/* ── Mobile Table ── */}
              <div className="project-table-mobile-wrap d-md-none">
                <table className="project-table-mobile">
                  <thead>
                    <tr>
                      {columnsMobile.map((col, i) => (
                        <th key={i} className="mobile-table-header">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center" style={{ padding: "20px", color: "var(--text-muted)" }}>
                          No records found
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((row) => {
                        const land = row.land || {};
                        const sellers = Array.isArray(row.sellers) ? row.sellers : [];
                        const buyers = Array.isArray(row.buyers) ? row.buyers : [];
                        const payment = row.payment || {};
                        const rera = row.rera || {};

                        const primarySeller = sellers[0] || {};
                        const sellerName = primarySeller.name || "-";
                        const poaHolder = primarySeller.poa_holder_name || "-";

                        const buyerNames = buyers
                          .map((b) => b.name)
                          .filter(Boolean)
                          .join(", ");
                        const firstBuyerName = buyerNames.split(",")[0] || "-";

                        const landArea =
                          land.land_area && land.land_area_type
                            ? `${land.land_area} ${land.land_area_type}`
                            : land.land_area_type || "-";

                        const fontClass = getFontClass(primarySeller.font_name);
                        const key = land.land_id || Math.random();

                        return (
                          <tr key={key} className="mobile-table-row">
                            <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                              <Form.Check
                                type="checkbox"
                                className="custom-checkbox"
                                disabled={row.project_created}
                                checked={selectedIds.includes(land.id)}
                                onChange={(e) => {
                                  if (row.project_created) return;
                                  if (e.target.checked) {
                                    setSelectedIds((prev) => [...prev, land.id]);
                                  } else {
                                    setSelectedIds((prev) =>
                                      prev.filter((id) => id !== land.id)
                                    );
                                  }
                                }}
                              />
                            </td>
                            <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                              <div>
                                <strong>Seller:</strong>{" "}
                                <span className={fontClass}>{sellerName}</span>
                              </div>
                              <div>
                                <strong>Buyer:</strong>{" "}
                                <span className={fontClass}>{firstBuyerName}</span>
                              </div>
                            </td>
                            <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                              <div>
                                <strong>Area:</strong> {landArea}
                              </div>
                              <div>
                                <strong>Category:</strong> {payment.land_category || "-"}
                              </div>
                            </td>
                            <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                              <div>
                                <strong>RERA:</strong>{" "}
                                {rera?.list?.length > 0 ? rera.list[0]?.rera_number || "-" : "-"}
                              </div>
                              <div>
                                <strong>Payment:</strong>{" "}
                                {formatDate(payment.payment_date)}
                              </div>
                            </td>
                            <td className="mobile-table-cell" onClick={(e) => e.stopPropagation()}>
                              <Dropdown
                                align="end"
                                className="drp-user"
                                container="body"
                                show={openDropdownId === land.id}
                                onToggle={(isOpen) =>
                                  setOpenDropdownId(isOpen ? land.id : null)
                                }
                              >
                                <Dropdown.Toggle
                                  as="div"
                                  className="action-icon custom-action-toggle"
                                >
                                  <i className="feather icon-more-vertical" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end" className="profile-notification" style={{ padding: "6px", minWidth: "140px" }}>
                                  <div
                                    onClick={() => { setOpenDropdownId(null); handleView(row); }}
                                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <i className="feather icon-eye" style={{ fontSize: "15px", color: "var(--blue)", flexShrink: 0 }} />
                                    View
                                  </div>
                                  <div
                                    onClick={() => { setOpenDropdownId(null); handleNavigate(row); }}
                                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <i className="feather icon-edit" style={{ fontSize: "15px", color: "var(--green)", flexShrink: 0 }} />
                                    Edit
                                  </div>
                                  <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                                  <div
                                    onClick={() => { setOpenDropdownId(null); handleShowModel(land.id); }}
                                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <i className="feather icon-trash-2" style={{ fontSize: "15px", color: "var(--red)", flexShrink: 0 }} />
                                    Delete
                                  </div>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </Card.Body>

            <ModernPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />

          </Card>
        </div>

        {showModal && (
          <LogoutModel
            projectId={BookingId}
            setShowModal={setShowModal}
            handleFun={handleDeleteProperty}
            title="Confirm Delete Property"
            subtitle={deleteLoading ? "Deleting..." : "Are you sure?"}
            btnText={deleteLoading ? "Deleting..." : "Delete"}
          />
        )}
      </Col>
      {mergeModal && (
        <LogoutModel
          setShowModal={setMergeModal}
          handleFun={handleMergeConfirm}
          title="Confirm Merge Properties"
          subtitle={
            mergeLoading
              ? "Merging properties..."
              : `Are you sure you want to merge ${selectedIds.length} properties?`
          }
          btnText={mergeLoading ? "Merging..." : "Confirm Merge"}
        />
      )}
    </Row>
  );
};

export default TableData;