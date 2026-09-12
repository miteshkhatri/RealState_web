import React, { useEffect, useState, useRef } from "react";
import {
  Row, Col, Card, Table, Form, Badge,
  Dropdown, ListGroup,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "config/constant";
import "../style.css";
import LogoutModel from "layouts/AdminLayout/NavBar/NavRight/LogoutModel";
import api from "utils/api";
import ModernPagination from "components/Pagination";
import BackButton from "components/Loader/BackButton";

const Projectview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [FilterData, setFilterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDropdown, setFilterDropdown] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);
  const userData = JSON.parse(localStorage.getItem("users")) || {};

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const [stats, setStats] = useState({
    total: 0, received: 0, pending: 0, todayReceived: 0,
  });

  const dropdownRefs = useRef({});

  const getDueDate = (agreementDate, paymentTime) => {
    if (!agreementDate) return null;
    const days = parseInt(paymentTime) || 45;
    const datePart = agreementDate.toString().split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    return date;
  };

  const params = new URLSearchParams(location.search);
  const projectId = params.get("project_id");

  const showProjectColumn =
    (!projectId || projectId === "null") &&
    (filterDropdown === "today" || filterDropdown === "today_received");

  const isTodayLike = (f) =>
    f === "booked" || f === "completed" || f === "sold" || f === "today" || f === "today_received" || f === "pending";

  const columns = isTodayLike(filterDropdown)
    ? filterDropdown === "today_received"
      ? ["#", ...(showProjectColumn ? ["Project"] : []), "Plot No", "Name", "Size", "Dates", "Received", "Action"]
      : filterDropdown === "today"
        ? ["#", ...(showProjectColumn ? ["Project"] : []), "Plot No", "Name", "Size", "Dates", "Booking Amt", "Total Amount", "Action"]
        : filterDropdown === "pending"
          ? ["#", ...(showProjectColumn ? ["Project"] : []), "Plot No", "Name", "Size", "Dates", "Pending Amt", "Action"]
          : ["#", "Plot No", "Name", "Size", "Dates", "Action"]
    : filterDropdown === "available"
      ? ["#", "Plot No", "Contact Info", "Sector", "Plot Rate", "Size", "Amount", "Direction", "Action"]
      : ["#", "Plot No", "Contact Info", "Sector", "Plot Rate", "Size", "Amount", "Direction", "Dates", "Action"];

  const formatDecimal = (val) => {
    if (!val && val !== 0) return "—";
    const num = Number(val);
    if (isNaN(num)) return val;
    return Number.isInteger(num) ? num : Number(num.toFixed(2));
  };

  const formatAmount = (value) => {
    if (value === null || value === undefined || value === "" || Number(value) === 0) return "0";
    const num = Math.floor(Number(value));
    if (isNaN(num)) return value;
    return num.toLocaleString("en-IN");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    if (dateString instanceof Date) {
      const day = String(dateString.getDate()).padStart(2, "0");
      const month = String(dateString.getMonth() + 1).padStart(2, "0");
      const year = dateString.getFullYear();
      return `${day}/${month}/${year}`;
    }
    const datePart = dateString.toString().split("T")[0];
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year}`;
  };

  const normalizeText = (text = "") =>
    text.toString().trim().normalize("NFKD").toLowerCase();

  const getProjectPlots = async (pageNo = page, currentSortField = sortField, currentSortOrder = sortOrder) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      const project_id = params.get("project_id");
      const filter = (params.get("filter") || "all").toLowerCase();
      const allowedWithoutProject = ["today", "today_received"];
      
      if (!project_id && !allowedWithoutProject.includes(filter)) {
        setFilterData([]);
        setLoading(false);
        return;
      }
      
      const cleanProjectId = project_id && project_id !== "null" ? project_id : null;
      const queryParts = [
        cleanProjectId ? `project_id=${cleanProjectId}` : "",
        `filter=${filter}`, `page=${pageNo}`, `limit=${limit}`,
        currentSortField ? `sortField=${encodeURIComponent(currentSortField)}` : "",
        currentSortOrder ? `sortOrder=${currentSortOrder}` : "",
      ].filter(Boolean).join("&");
      
      const response = await api.get(`/dashboard/ProjectDetails?${queryParts}`, {
        headers: { Authorization: userData.user_token || "" }
      });
      
      const result = response.data;
      setFilterData(result?.data || []);
      setStats({
        total: result?.grand_total_amount || 0,
        received: result?.grand_received_amount || 0,
        pending: result?.grand_pending_amount || 0,
        todayReceived: result?.grand_today_received || 0,
      });
      const totalRecords = result?.total_records || 0;
      setTotalPages(Math.ceil(totalRecords / limit));
      setPage(pageNo);
    } catch (err) {
      console.error("getProjectPlots error:", err);
      setFilterData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (field === "#" || field === "Action") return;
    const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);
    setPage(1);
    getProjectPlots(1, field, newOrder);
  };

  const handleFilterChange = (newFilter) => {
    const params = new URLSearchParams(location.search);
    params.set("filter", newFilter);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const visibleRows = FilterData.filter((row) => {
    if (!searchTerm) return true;
    const search = normalizeText(searchTerm);
    const booking = row?.bookings?.[0] || {};
    return (
      normalizeText(row.plot_no).includes(search) ||
      normalizeText(row.sector_name).includes(search) ||
      normalizeText(booking.customer_name).includes(search) ||
      normalizeText(booking.customer_address).includes(search) ||
      normalizeText(booking.mobile_no).includes(search)
    );
  });

  const filterLabel = (f) => {
    if (f === "booked") return "Booked";
    if (f === "available") return "Available";
    if (f === "completed") return "Completed";
    if (f === "sold") return "Sold";
    if (f === "today") return "Today Booked";
    if (f === "today_received") return "Today Received";
    if (f === "pending") return "Pending Amount";
    return "All";
  };

  const isRowBooked = (row) => {
    const booking = row?.bookings?.[0];
    return Boolean(booking?.booked === 1 || booking?.booking_id);
  };

  const actionsForRow = (row) => {
    const booked = isRowBooked(row);
    const hasCustomerInfo = row?.bookings?.[0]?.customer_name || row?.bookings?.[0]?.mobile_no;
    const actions = { showBookNow: false, showEditBooking: false, showEditPlot: false, showDeleteBooking: false, showDeletePlot: false };
    if (isTodayLike(filterDropdown)) { if (booked) { actions.showEditBooking = true; actions.showDeleteBooking = true; } }
    else if (filterDropdown === "available") { if (hasCustomerInfo) { actions.showEditBooking = true; actions.showDeleteBooking = true; } else { actions.showBookNow = true; actions.showEditPlot = true; } }
    else { if (booked || hasCustomerInfo) { actions.showEditBooking = true; actions.showDeleteBooking = true; } else { actions.showBookNow = true; actions.showEditPlot = true; } }
    if (!booked) actions.showDeletePlot = true;
    return actions;
  };

  const handleAddBooking = (row) => { setOpenDropdown(null); navigate("/bookings/add", { state: { oneRow: row } }); };
  const handleEditBooking = (row) => { setOpenDropdown(null); navigate("/bookings/add", { state: { data: [{ ...row.bookings?.[0], project_id: row.project_id, sector_id: row.sector_id, plot_id: row.plot_id, plot_no: row.plot_no, project_name: row.project_name, sector_name: row.sector_name, project_font: row.project_font, krutiDev_font: row.booked_krutiDev_font, amount_b: typeof row.bookings?.[0]?.amount_b === "number" ? row.bookings[0].amount_b : 0 }], mode: "edit" } }); };
  const handleEditPlot = (row) => { setOpenDropdown(null); navigate("/projects/plots", { state: { oneRow: row } }); };

  const handleCancelBookingConfirm = async () => {
    try {
      const plotId = selectedRow?.plot_id;
      if (!plotId) { setShowConfirmModal(false); return; }
      const res = await fetch(`${API_BASE_URL}/booking/cancel`, { method: "POST", headers: { Authorization: userData.user_token, "Content-Type": "application/json" }, body: JSON.stringify({ plot_id: plotId, cancel_by_id: userData?.user_id }) });
      const result = await res.json();
      if (result.success) await getProjectPlots();
      else alert(result.message || "Failed to cancel booking");
    } catch (err) { console.error("Cancel booking error:", err); alert("Error cancelling booking"); }
    finally { setShowConfirmModal(false); setSelectedRow(null); setConfirmType(null); }
  };

  const handleDeletePlotConfirm = async () => {
    try {
      const plotId = selectedRow?.plot_id;
      if (!plotId) { setShowConfirmModal(false); return; }
      await api.delete(`/plots`, { headers: { Authorization: userData.user_token }, data: { plot_id: plotId, deleted_by_id: userData?.user_id } });
      await getProjectPlots();
    } catch (error) { console.log(error, "error"); alert("Failed to delete plot"); }
    finally { setShowConfirmModal(false); setSelectedRow(null); setConfirmType(null); }
  };

  const openCancelBookingModal = (row) => { setSelectedRow(row); setConfirmType("cancelBooking"); setShowConfirmModal(true); };
  const openDeletePlotModal = (row) => { setSelectedRow(row); setConfirmType("deletePlot"); setShowConfirmModal(true); };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutside = !Object.values(dropdownRefs.current).some((ref) => ref?.contains(event.target));
      if (isOutside) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = (params.get("filter") || "all").toLowerCase();
    setFilterDropdown(filterParam);
    setPage(1);
    getProjectPlots(1);
  }, [location.search, limit]);

  // ⭐⭐⭐ COLORED ICONS DROPDOWN ⭐⭐⭐
  const renderActionsDropdown = (row, dropdownId) => {
    const actions = actionsForRow(row);
    const iconStyle = (color) => ({ color, marginRight: '8px', fontSize: '14px' });

    return (
      <td onClick={(e) => e.stopPropagation()} ref={(el) => (dropdownRefs.current[dropdownId] = el)} className="action-column">
        <Dropdown align="end" className="drp-user" show={openDropdown === dropdownId}>
          <Dropdown.Toggle as="div" id={`dropdown-${dropdownId}`} className="action-icon custom-action-toggle"
            onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === dropdownId ? null : dropdownId); }}
            style={{ cursor: "pointer" }}>
            <i className="feather icon-more-vertical" style={{ color: '#333' }} />
          </Dropdown.Toggle>
          <Dropdown.Menu align="end" className="profile-notification p-0" popperConfig={{ strategy: "fixed" }} style={{ zIndex: 990 }}>
            <ListGroup bsPrefix=" " variant="flush" className="pro-body">

              {/* 💬 Remark - Purple */}
              <ListGroup.Item onClick={(e) => { e.stopPropagation(); navigate(`/project/remarks/${row.project_id}`, { state: { row } }); setOpenDropdown(null); }} className="border-bottom border-grey">
                <span className="dropdown-item">
                  <i className="feather icon-message-square" style={iconStyle('#8b5cf6')} /> Remark
                </span>
              </ListGroup.Item>

              {/* ➕ Book Now - Green */}
              {actions.showBookNow && (
                <ListGroup.Item onClick={(e) => { e.stopPropagation(); handleAddBooking(row); }} className="border-bottom border-grey">
                  <span className="dropdown-item">
                    <i className="feather icon-plus-circle" style={iconStyle('#10b981')} /> Book Now
                  </span>
                </ListGroup.Item>
              )}

              {/* ✏️ Edit Booking - Orange */}
              {actions.showEditBooking && (
                <ListGroup.Item onClick={(e) => { e.stopPropagation(); handleEditBooking(row); }} className="border-bottom border-grey">
                  <span className="dropdown-item">
                    <i className="feather icon-edit" style={iconStyle('#f59e0b')} /> Edit Booking
                  </span>
                </ListGroup.Item>
              )}

              {/* ✏️ Edit Plot - Orange */}
              {actions.showEditPlot && (
                <ListGroup.Item onClick={(e) => { e.stopPropagation(); handleEditPlot(row); }} className="border-bottom border-grey">
                  <span className="dropdown-item">
                    <i className="feather icon-edit-2" style={iconStyle('#f59e0b')} /> Edit Plot
                  </span>
                </ListGroup.Item>
              )}

              {/* ℹ️ More Info - Blue */}
              {isRowBooked(row) && (
                <ListGroup.Item onClick={(e) => { e.stopPropagation(); navigate(`/MoreInfo`, { state: { row } }); setOpenDropdown(null); }} className="border-bottom border-grey">
                  <span className="dropdown-item">
                    <i className="feather icon-info" style={iconStyle('#3b82f6')} /> More Info
                  </span>
                </ListGroup.Item>
              )}

              {/* 🗑️ Cancel Booking - Red */}
              {actions.showDeleteBooking && (
                <ListGroup.Item onClick={(e) => { e.stopPropagation(); openCancelBookingModal(row); }} className="border-bottom border-grey">
                  <span className="dropdown-item">
                    <i className="feather icon-trash-2" style={iconStyle('#ef4444')} /> Cancel Booking
                  </span>
                </ListGroup.Item>
              )}

              {/* 🗑️ Delete Plot - Red */}
              {actions.showDeletePlot && (
                <ListGroup.Item onClick={(e) => { e.stopPropagation(); openDeletePlotModal(row); }}>
                  <span className="dropdown-item">
                    <i className="feather icon-trash" style={iconStyle('#ef4444')} /> Delete Plot
                  </span>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Dropdown.Menu>
        </Dropdown>
      </td>
    );
  };

  if (loading) return <p className="text-center mt-4">Loading project details...</p>;

  const getColStyle = (colName) => {
    switch (colName) {
      case "#": return { width: "3%" };
      case "Project": return { width: "10%" };
      case "Plot No": return { width: "6%" };
      case "Contact Info": return { width: "20%" };
      case "Name": return { width: "20%" };
      case "Sector": return { width: "10%" };
      case "Plot Rate": return { width: "8%" };
      case "Size": return { width: "12%" };
      case "Amount": return { width: "10%" };
      case "Direction": return { width: "14%" };
      case "Dates": return { width: "12%" };
      case "Booking Amt": return { width: "10%" };
      case "Total Amount": return { width: "10%" };
      case "Received": return { width: "10%" };
      case "Pending Amt": return { width: "12%" };
      case "Action": return { width: "5%" };
      default: return {};
    }
  };

  return (
    <Row>

      <Col>
        <BackButton />
        <div className="add-project-card">
          <Card>
            <Card.Header className="project-header">
              <div className="d-none d-md-flex align-items-center justify-content-between gap-2" style={{ flex: 1 }}>
                <h5 className="project-title" style={{ margin: 0 }}>
                  Project Plots{" "}
                  <Badge bg="secondary" className="ms-2" style={{ fontSize: '11px' }}>{filterLabel(filterDropdown)}</Badge>
                </h5>
                <div className="d-flex align-items-center gap-2" style={{ paddingRight: '10px' }}>
                  <Form.Select className="custom-select w-auto" value={filterDropdown} onChange={(e) => handleFilterChange(e.target.value)} style={{ height: '38px', minWidth: '140px' }}>
                    <option value="all">All</option>
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="completed">Completed</option>
                    <option value="sold">Sold</option>
                    <option value="today">Today Booked</option>
                    <option value="today_received">Today Received</option>
                    <option value="pending">Pending Amount</option>
                  </Form.Select>
                  <Dropdown>
                    <Dropdown.Toggle className="custom-select w-auto" style={{ height: '38px', minWidth: '70px' }}>{limit}</Dropdown.Toggle>
                    <Dropdown.Menu popperConfig={{ strategy: "fixed" }} style={{ minWidth: '80px', textAlign: 'center', zIndex: 990 }}>
                      {[10, 25, 50, 100].map((n) => (
                        <Dropdown.Item key={n} onClick={() => { setLimit(n); setPage(1); }}>{n}</Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
              <div className="d-md-none" style={{ flex: 1 }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="project-title" style={{ margin: 0 }}>Project Plots <Badge bg="secondary">{filterLabel(filterDropdown)}</Badge></h5>
                </div>
                <div className="d-flex gap-2">
                  <Form.Select className="custom-select w-auto" value={filterDropdown} onChange={(e) => handleFilterChange(e.target.value)} style={{ height: '34px', fontSize: '12px', flex: 1 }}>
                    <option value="all">All</option><option value="available">Available</option><option value="booked">Booked</option><option value="completed">Completed</option><option value="today">Today Booked</option><option value="today_received">Today Received</option><option value="pending">Pending Amount</option>
                  </Form.Select>
                  <Dropdown>
                    <Dropdown.Toggle className="custom-select w-auto" style={{ height: '34px', fontSize: '12px' }}>{limit}</Dropdown.Toggle>
                    <Dropdown.Menu popperConfig={{ strategy: "fixed" }} style={{ zIndex: 990 }}>{[10, 25, 50, 100].map(n => (<Dropdown.Item key={n} onClick={() => { setLimit(n); setPage(1); }}>{n}</Dropdown.Item>))}</Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </Card.Header>

            {FilterData.length > 0 && (
              <div style={{ padding: '8px 16px', background: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '20px', fontSize: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                {filterDropdown === "today_received" ? (
                  <span style={{ color: '#28a745' }}>Today Received: <strong>₹{formatAmount(stats.todayReceived)}</strong></span>
                ) : (
                  <>
                    <span style={{ color: '#6c757d' }}>Total: <strong style={{ color: '#000' }}>₹{formatAmount(stats.total)}</strong></span>
                    <span style={{ color: '#6c757d' }}>Received: <strong style={{ color: '#28a745' }}>₹{formatAmount(stats.received)}</strong></span>
                    <span style={{ color: '#6c757d' }}>Pending: <strong style={{ color: '#dc3545' }}>₹{formatAmount(stats.pending)}</strong></span>
                  </>
                )}
                {(() => {
                  const p = new URLSearchParams(location.search);
                  const pid = p.get("project_id");
                  if (!pid || pid === "null") return null;
                  const pname = FilterData?.[0]?.project_name || location.state?.project_name;
                  if (!pname) return null;
                  return <span className={FilterData?.[0]?.krutiDev_font == 1 ? "kruti-dev" : ""} style={{ fontWeight: 600, color: '#0d6efd' }}>📍 {pname}</span>;
                })()}
              </div>
            )}

            <Card.Body style={{ padding: 0 }}>
              <Table responsive hover className="d-none d-md-table project-table-desktop">
                <thead>
                  <tr>
                    {columns.map((col, i) => (
                      <th 
                        key={i} 
                        className="table-header-cell" 
                        style={{ ...getColStyle(col), cursor: (col !== "#" && col !== "Action") ? "pointer" : "default" }}
                        onClick={() => handleSort(col)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {col}
                          {sortField === col && (
                            <i className={`feather icon-arrow-${sortOrder === "asc" ? "up" : "down"} ms-1`} />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.length > 0 ? visibleRows.map((row, index) => {
                    const dropdownId = `row-${index}`;
                    const booked = isRowBooked(row);
                    const booking = row?.bookings?.[0] || {};
                    const baseDate = booking.agreement_date || booking.booking_date;
                    const dueDate = getDueDate(baseDate, booking.payment_time);
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    const isPast = dueDate && dueDate < today;
                    return (
                      <tr key={index} onClick={() => { if (booked) navigate(`/receiveamount/details/${row.plot_id}`); }} className="table-row-clickable" style={{ cursor: booked ? "pointer" : "default" }}>
                        {isTodayLike(filterDropdown) ? (
                          <>
                            <td className="table-sno-cell">{(page - 1) * limit + index + 1}</td>
                            {showProjectColumn && <td className={row.project_font == 1 ? "kruti-dev" : ""}>{row.project_name || "—"}</td>}
                            <td><strong>{row.plot_no || "—"}</strong></td>
                            <td className={booking.booked_krutiDev_font == 1 ? "kruti-dev" : ""}>{booking.customer_name || "—"}</td>
                            <td>
                              <div style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                                <div>{formatDecimal(row.plot_height)} x {formatDecimal(row.plot_width)}</div>
                                <div><span className="text-muted">{formatDecimal(row.square_feet)} Sq/Ft</span></div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: "13px", whiteSpace: "nowrap", display: "grid", gridTemplateColumns: "30px 1fr", rowGap: "2px", columnGap: "4px" }}>
                                <div className="text-muted">Ag:</div>
                                <div>{booking.agreement_date ? formatDateTime(booking.agreement_date) : "—"}</div>
                                <div className="text-muted">Due:</div>
                                <div>{dueDate ? <span style={{ color: isPast ? "red" : "blue", fontWeight: "bold" }}>{formatDateTime(dueDate)}</span> : "—"}</div>
                              </div>
                            </td>
                            {filterDropdown === "today_received" && <td><span className="text-success fw-bold">₹{formatAmount(row.today_received)}</span></td>}
                            {filterDropdown === "today" && <><td><span className="text-primary fw-bold">₹{formatAmount(row.bookings?.[0]?.booking_amount)}</span></td><td><span className="text-dark fw-bold">₹{formatAmount(row.bookings?.[0]?.amount_a)}</span></td></>}
                            {filterDropdown === "pending" && <td><span className="text-danger fw-bold">₹{formatAmount(row.pending_amount)}</span></td>}
                            {renderActionsDropdown(row, dropdownId)}
                          </>
                        ) : (
                          <>
                            <td className="table-sno-cell">{(page - 1) * limit + index + 1}</td>
                            <td>{row.plot_no || "—"}</td>
                            <td className={booking.booked_krutiDev_font == 1 ? "kruti-dev" : ""} style={{ whiteSpace: "pre-wrap" }}>
                              {booking.customer_name ? <><strong>{booking.customer_name}</strong><br /><span>{booking.mobile_no || "—"}</span><br /><span>{booking.customer_address || "—"}</span></> : "—"}
                            </td>
                            <td className={row.plot_font == 1 ? "kruti-dev" : ""}>{row.sector_name}</td>
                            <td>{formatDecimal(row.plot_rate)}</td>
                            <td>
                              <div style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                                <div>{formatDecimal(row.plot_height)} x {formatDecimal(row.plot_width)}</div>
                                <div><span className="text-muted">{formatDecimal(row.square_feet)} Sq/Ft</span></div>
                              </div>
                            </td>
                            <td>{formatAmount(row.amount)}</td>
                            <td>E-<span className={row.plot_font == 1 ? "kruti-dev" : ""}>{row.east}</span><br />W-<span className={row.plot_font == 1 ? "kruti-dev" : ""}>{row.west}</span><br />S-<span className={row.plot_font == 1 ? "kruti-dev" : ""}>{row.south}</span><br />N-<span className={row.plot_font == 1 ? "kruti-dev" : ""}>{row.north}</span></td>
                            {filterDropdown !== "available" && (
                              <td>
                                <div style={{ fontSize: "13px", whiteSpace: "nowrap", display: "grid", gridTemplateColumns: "30px 1fr", rowGap: "2px", columnGap: "4px" }}>
                                  <div className="text-muted">Ag:</div>
                                  <div>{booking.agreement_date ? formatDateTime(booking.agreement_date) : "—"}</div>
                                  <div className="text-muted">Due:</div>
                                  <div>{dueDate ? <span style={{ color: isPast ? "red" : "blue", fontWeight: "bold" }}>{formatDateTime(dueDate)}</span> : "—"}</div>
                                </div>
                              </td>
                            )}
                            {renderActionsDropdown(row, dropdownId)}
                          </>
                        )}
                      </tr>
                    );
                  }) : <tr><td colSpan={columns.length} className="text-center">No plots found.</td></tr>}
                </tbody>
              </Table>

              <div className="d-block d-md-none p-2">
                {visibleRows.length > 0 ? visibleRows.map((row, index) => {
                  const dropdownId = `mobile-row-${index}`;
                  const actions = actionsForRow(row);
                  const booked = isRowBooked(row);
                  const booking = row?.bookings?.[0] || {};
                  const baseDate = booking.agreement_date || booking.booking_date;
                  const dueDate = getDueDate(baseDate, booking.payment_time);
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  const isPast = dueDate && dueDate < today;
                  const iconStyle = (color) => ({ color, marginRight: '6px', fontSize: '13px' });
                  return (
                    <Card key={index} className="mb-2 shadow-sm" onClick={() => { if (booked) navigate(`/receiveamount/details/${row.plot_id}`); }} style={{ cursor: booked ? "pointer" : "default" }}>
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div><strong>Plot:</strong> {row.plot_no || "—"}<br />{!isTodayLike(filterDropdown) && filterDropdown !== "available" && <><strong>Sector:</strong> <span className={row.plot_font == 1 ? "kruti-dev" : ""}>{row.sector_name}</span></>}</div>
                          <div onClick={(e) => e.stopPropagation()} ref={(el) => (dropdownRefs.current[dropdownId] = el)}>
                            <Dropdown align="end" className="drp-user" show={openDropdown === dropdownId}>
                              <Dropdown.Toggle as="div" className="action-icon custom-action-toggle" onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === dropdownId ? null : dropdownId); }} style={{ cursor: "pointer" }}>
                                <i className="feather icon-more-vertical" style={{ color: '#333' }} />
                              </Dropdown.Toggle>
                              <Dropdown.Menu className="profile-notification p-0" popperConfig={{ strategy: "fixed" }} style={{ zIndex: 990 }}>
                                <ListGroup variant="flush">
                                  {actions.showBookNow && <ListGroup.Item onClick={() => handleAddBooking(row)}><i className="feather icon-plus-circle" style={iconStyle('#10b981')} /> Book Now</ListGroup.Item>}
                                  {actions.showEditBooking && <ListGroup.Item onClick={() => handleEditBooking(row)}><i className="feather icon-edit" style={iconStyle('#f59e0b')} /> Edit Booking</ListGroup.Item>}
                                  {actions.showEditPlot && <ListGroup.Item onClick={() => handleEditPlot(row)}><i className="feather icon-edit-2" style={iconStyle('#f59e0b')} /> Edit Plot</ListGroup.Item>}
                                  {isRowBooked(row) && <ListGroup.Item onClick={(e) => { e.stopPropagation(); navigate(`/MoreInfo`, { state: { row } }); setOpenDropdown(null); }}><i className="feather icon-info" style={iconStyle('#3b82f6')} /> More Info</ListGroup.Item>}
                                  {actions.showDeleteBooking && <ListGroup.Item onClick={() => openCancelBookingModal(row)}><i className="feather icon-trash-2" style={iconStyle('#ef4444')} /> Cancel Booking</ListGroup.Item>}
                                  {actions.showDeletePlot && <ListGroup.Item onClick={() => openDeletePlotModal(row)}><i className="feather icon-trash" style={iconStyle('#ef4444')} /> Delete Plot</ListGroup.Item>}
                                </ListGroup>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </div>
                        <hr className="my-2" />
                        <div className={booking.booked_krutiDev_font == 1 ? "kruti-dev" : ""}><strong>Customer:</strong> {booking.customer_name || "—"}<br /><strong>Mobile:</strong> {booking.mobile_no || "—"}</div>
                        <hr className="my-2" />
                        <div className="small">
                          {isTodayLike(filterDropdown) ? (<><strong>Size:</strong> {row.plot_height}x{row.plot_width} ({row.square_feet} Sq/Ft)<br /><strong>Agreement Date:</strong> {formatDateTime(booking.agreement_date)}<br /><strong>Due Date: </strong>{dueDate ? <span style={{ color: isPast ? "red" : "blue", fontWeight: "bold" }}>{formatDateTime(dueDate)}</span> : "—"}{filterDropdown === "today_received" && <><br /><strong>Today Received: </strong><span className="text-success fw-bold">₹{formatAmount(row.today_received)}</span></>}{filterDropdown === "today" && <><br /><strong>Booking Amt: </strong><span className="text-primary fw-bold">₹{formatAmount(row.bookings?.[0]?.booking_amount)}</span><br /><strong>Total Amount: </strong><span className="text-dark fw-bold">₹{formatAmount(row.bookings?.[0]?.amount_a)}</span></>}{filterDropdown === "pending" && <><br /><strong>Pending Amt: </strong><span className="text-danger fw-bold">₹{formatAmount(row.pending_amount)}</span></>}</>) : (<><strong>Rate:</strong> {row.plot_rate} | <strong>Size:</strong> {row.plot_height}x{row.plot_width} ({row.square_feet} Sq/Ft)<br /><strong>Amount:</strong> {formatAmount(row.amount)}</>)}
                        </div>
                      </Card.Body>
                    </Card>
                  );
                }) : <p className="text-center">No plots found.</p>}
              </div>
            </Card.Body>

            <div className="px-3 py-3 border-top">
              <Row className="align-items-center">
                <Col xs={12} className="d-flex justify-content-center">
                  <ModernPagination currentPage={page} totalPages={totalPages} onPageChange={(p) => getProjectPlots(p)} />
                </Col>
              </Row>
            </div>
          </Card>
        </div>
      </Col>

      {showConfirmModal && (
        <LogoutModel projectId={selectedRow?.plot_id} setShowModal={setShowConfirmModal}
          handleFun={confirmType === "cancelBooking" ? handleCancelBookingConfirm : handleDeletePlotConfirm}
          title={confirmType === "cancelBooking" ? "Confirm Cancel Booking" : "Confirm Delete Plot"}
          subtitle={confirmType === "cancelBooking" ? "Are you sure you want to cancel this booking?" : "Are you sure you want to delete this plot?"}
          btnText={confirmType === "cancelBooking" ? "Cancel Booking" : "Delete"}
        />
      )}
    </Row>
  );
};

export default Projectview;