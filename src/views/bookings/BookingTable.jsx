import { API_BASE_URL } from "config/constant";
import React, { useState, useEffect, useRef } from "react";
import ThemeLoader from "components/Loader/ThemeLoader";
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
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import LogoutModel from "layouts/AdminLayout/NavBar/NavRight/LogoutModel";
import { FaDownload, FaMoneyBillWave } from "react-icons/fa6";
import axios from "axios";
import "../style.css";
import { Bookings, setIsFetched } from "../../redux/store/Bookings/Action";
import { useDispatch, useSelector } from "react-redux";
import Receipt from "views/Receipt/Receipt";
import "../Receipt/Receipt.css";
import { ReactTransliterate } from "react-transliterate";
import { FaInfoCircle } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import api from "utils/api";
import ModernPagination from "components/Pagination";

const BookingTable = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelPlotId, setCancelPlotId] = useState(null);

  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedPlotCustomers, setSelectedPlotCustomers] = useState([]);
  const [typeFilter, setTypeFilter] = useState(0);

  const [SecarhProject, setSearchProject] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const [openDropdown, setOpenDropdown] = useState(null);
  const [limitDropdownOpen, setLimitDropdownOpen] = useState(false);
  const [SearchLang, setSearchLang] = useState("hi_mangal");

  const [dateSortType, setDateSortType] = useState("");
  const [dateSortOrder, setDateSortOrder] = useState("desc");

  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem("users"));
  const dispatch = useDispatch();
  const bookingsData = useSelector((state) => state.bookings.bookings) || [];
  const Fetched = useSelector((state) => state.bookings.isFetched);
  const [confirmType, setConfirmType] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [page, setPage] = useState(initialPage);

  const [brokerFilter, setBrokerFilter] = useState(
    searchParams.get("broker_id") || location.state?.broker_id || ""
  );
  const [brokerFilterName, setBrokerFilterName] = useState(
    location.state?.broker_name || searchParams.get("broker_name") || ""
  );

  useEffect(() => {
    const qBroker = searchParams.get("broker_id") || location.state?.broker_id;
    const qBrokerName = searchParams.get("broker_name") || location.state?.broker_name;
    if (qBroker) {
      setBrokerFilter(qBroker);
      if (qBrokerName) setBrokerFilterName(qBrokerName);
    }
  }, [location.state, searchParams]);

  const clearBrokerFilter = (e) => {
    if (e) e.stopPropagation();
    setBrokerFilter("");
    setBrokerFilterName("");
    const currentParams = Object.fromEntries([...searchParams]);
    delete currentParams.broker_id;
    delete currentParams.broker_name;
    setSearchParams(currentParams, { replace: true });
    if (location.state?.broker_id) {
      window.history.replaceState({}, document.title);
    }
  };

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

  const [grandStats, setGrandStats] = useState({
    total: 0,
    received: 0,
    pending: 0,
  });

  function formatDateTime1(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // 📍 Ye function add karein - sabse upar, useState ke baad
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  function formatDateTime(dateString) {
    if (!dateString) return "-";
    if (dateString instanceof Date) {
      const day = String(dateString.getDate()).padStart(2, "0");
      const month = dateString.toLocaleString("en-US", { month: "short" });
      const year = dateString.getFullYear();
      return `${day}-${month}-${year}`;
    }
    const datePart = dateString.toString().split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = d.toLocaleString("en-US", { month: "short" });
    return `${dd}-${mm}-${year}`;
  }

  const getDueDate = (agreementDate) => {
    if (!agreementDate) return null;
    const datePart = agreementDate.toString().split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + 45);
    return date;
  };

  const handleNavigte = (booking) => {
    let sameBookings = bookingsData.filter(
      (b) => b.project_id === booking.project_id && b.plot_no === booking.plot_no,
    );
    if (sameBookings.length === 0) {
      alert("No matching Project and Plot found.");
      return;
    }
    sameBookings = sameBookings.sort((a, b) => a.booking_id - b.booking_id);
    dispatch(setIsFetched(false));
    navigate("/bookings/add", { state: { data: sameBookings, mode: "edit", fromSearch: location.search } });
  };

  const handleShowModel = (id) => {
    setShowDeleteModal(true);
    setSelectedRow(id);
  };



  const AgreementDownload = async (row) => {
    try {
      const res = await api.get(`/booking/downloadDocx`, {
        headers: { Authorization: userData.user_token },
        params: { project_id: row?.project_id, plot_no: row?.plot_no },
      });
      navigate("/agreement", { state: { data: res.data, row: row } });
    } catch (error) {
      console.log(error);
    }
  };

  const AllotmentDownload = async (row) => {
    try {
      const res = await api.get(`/booking/PattaDocs`, {
        headers: { Authorization: userData.user_token },
        params: { project_id: row?.project_id, plot_no: row?.plot_no },
      });
      navigate("/Allotments", { state: { data: res.data, row: row } });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelClick = (plot_id) => {
    setCancelPlotId(plot_id);
    setShowCancelModal(true);
  };

  const handleShowDetails = (data) => {
    navigate("/bookings/details", { state: { data } });
  };

  const uniqueProjectBookings = () => {
    const projectMap = {};
    bookingsData.forEach((booking) => {
      const key = `${booking.project_name}_${booking.plot_no}`;
      if (!projectMap[key]) {
        projectMap[key] = { 
          ...booking, 
          all_customers: [{ name: booking.customer_name, mobile: booking.mobile_no, font: booking.krutiDev_font, id: booking.booking_id }],
          all_broker_ids: booking.broker_id ? [booking.broker_id] : []
        };
      } else {
        const exists = projectMap[key].all_customers.find(c => c.name === booking.customer_name && c.mobile === booking.mobile_no);
        if (!exists) {
          projectMap[key].all_customers.push({ name: booking.customer_name, mobile: booking.mobile_no, font: booking.krutiDev_font, id: booking.booking_id });
        }
        if (booking.broker_id && !projectMap[key].all_broker_ids?.includes(booking.broker_id)) {
          projectMap[key].all_broker_ids = projectMap[key].all_broker_ids || [];
          projectMap[key].all_broker_ids.push(booking.broker_id);
        }
        
        const existingDate = new Date(projectMap[key].create_at);
        const currentDate = new Date(booking.create_at);
        if (currentDate < existingDate) {
          const mergedCustomers = projectMap[key].all_customers;
          const mergedBrokers = projectMap[key].all_broker_ids;
          projectMap[key] = { ...booking, all_customers: mergedCustomers, all_broker_ids: mergedBrokers };
        } else if (currentDate.getTime() === existingDate.getTime()) {
          if (booking.booking_id < projectMap[key].booking_id) {
            const mergedCustomers = projectMap[key].all_customers;
            const mergedBrokers = projectMap[key].all_broker_ids;
            projectMap[key] = { ...booking, all_customers: mergedCustomers, all_broker_ids: mergedBrokers };
          }
        }
      }
    });

    const results = Object.values(projectMap);
    results.forEach(row => {
      if (row.all_customers) {
        row.all_customers.sort((a, b) => Number(a.id) - Number(b.id));
      }
    });
    
    return results;
  };

  const filteredData = React.useMemo(() => {
    let base = uniqueProjectBookings();
    if (brokerFilter) {
      base = base.filter((row) => 
        Number(row.broker_id) === Number(brokerFilter) || 
        (row.all_broker_ids && row.all_broker_ids.some(bId => Number(bId) === Number(brokerFilter)))
      );
    }
    if (projectFilter) {
      base = base.filter((row) => Number(row.project_id) === Number(projectFilter));
    }
    if (typeFilter !== 0) {
      base = base.filter((row) => Number(row.project_type) === Number(typeFilter));
    }

    if (location.state?.showOnlyDue) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      base = base.filter((row) => {
        const dueDate = getDueDate(row.agreement_date || row.booking_date);
        return dueDate && dueDate < today && Number(row.pending_amount) > 0;
      });
    }

    if (dateSortType) {
      base.sort((a, b) => {
        let valA, valB;
        if (dateSortType === "created") {
          valA = new Date(a.create_at || 0).getTime();
          valB = new Date(b.create_at || 0).getTime();
        } else if (dateSortType === "booking") {
          valA = new Date(a.booking_date || 0).getTime();
          valB = new Date(b.booking_date || 0).getTime();
        } else if (dateSortType === "due") {
          const dueA = getDueDate(a.agreement_date || a.booking_date);
          const dueB = getDueDate(b.agreement_date || b.booking_date);
          valA = dueA ? dueA.getTime() : 0;
          valB = dueB ? dueB.getTime() : 0;
        }

        if (dateSortOrder === "asc") {
          return valA - valB;
        } else {
          return valB - valA;
        }
      });
    }

    if (!SecarhProject) return base;
    const qRaw = String(SecarhProject).trim();
    if (!qRaw) return base;
    if (SearchLang === "hi_kruti") {
      return base.filter((row) => {
        if ((row.customer_name || "").includes(qRaw)) return true;
        if ((row.mobile_no || "").includes(qRaw)) return true;
        if (String(row.plot_no || "").includes(qRaw)) return true;
        if (row.all_customers && row.all_customers.some(c => (c.name || "").includes(qRaw) || (c.mobile || "").includes(qRaw))) return true;
        return false;
      });
    }
    const q = qRaw.toLowerCase();
    return base.filter((row) => {
      if (row.customer_name?.toLowerCase().includes(q)) return true;
      if (row.mobile_no?.toLowerCase().includes(q)) return true;
      if (String(row.plot_no).toLowerCase().includes(q)) return true;
      if (row.all_customers && row.all_customers.some(c => c.name?.toLowerCase().includes(q) || c.mobile?.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [bookingsData, SecarhProject, projectFilter, typeFilter, brokerFilter, SearchLang, dateSortType, dateSortOrder, location.state]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const startIndex = (page - 1) * limit;
  const paginatedData = filteredData.slice(startIndex, startIndex + limit);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (location.state?.focusPlotNo && location.state?.focusProjectId) {
      setProjectFilter(location.state.focusProjectId);
      setSearchProject(String(location.state.focusPlotNo));
      
      // Clear state so it doesn't persist on reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (page !== 1) setPage(1);
  }, [SecarhProject, projectFilter, typeFilter, brokerFilter]);

  const columns = [
    "#",
    "Contact Info",
    "Project / Type",
    "Sec/Plot",
    "Sq/F Rate / Booking Amt",
    "Amount Details",
    "Dates",
    "Action",
  ];

  const getAllBookings = async () => {
    try {
      const res = await api.get(
        `/booking/list?user_id=${userData?.user_id}`,
        { headers: { Authorization: userData?.user_token } }
      );
      if (res.data.success) {
        dispatch(Bookings(res.data.data));
        dispatch(setIsFetched(true));
        setGrandStats({
          total: res.data.grand_total_amount || 0,
          received: res.data.grand_received_amount || 0,
          pending: res.data.grand_pending_amount || 0,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleReceiveAmount = (row) => {
    navigate("/receiveamount/add", { state: { data: row } });
  };

  const cancelBooking = async (plot_id) => {
    try {
      const res = await api.post(
        `/booking/cancel`,
        { plot_id, cancel_by_id: userData?.user_id },
        { headers: { Authorization: userData?.user_token } },
      );
      if (res.data.success) {
        getAllBookings();  // ✅ Direct list refresh
      } else {
        alert(res.data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      alert("Error cancelling booking");
    }
  };
  const formatAmount = (val) => {
    if (val === null || val === undefined || val === "" || Number(val) === 0) return "0";
    const num = Math.floor(Number(val));
    if (Number.isNaN(num)) return val;
    return num.toLocaleString("en-IN");
  };

  useEffect(() => {
    dispatch(setIsFetched(false));
    getAllBookings();
  }, [userData?.user_id]);

  const projectSelectClass = (() => {
    if (!projectFilter) return "";
    const selectedProj = bookingsData.find(
      (b) => String(b.project_id) === String(projectFilter),
    );
    return selectedProj && selectedProj.project_font == 1 ? "kruti-dev" : "";
  })();

  useEffect(() => {
    if (filteredData.length > 0) {
      const total = filteredData.reduce((sum, row) => sum + Number(row.amount_a || 0), 0);
      const received = filteredData.reduce((sum, row) => sum + Number(row.received_amount || 0), 0);
      const pending = filteredData.reduce((sum, row) => sum + Number(row.pending_amount || 0), 0);
      setGrandStats({ total, received, pending });
    } else {
      setGrandStats({ total: 0, received: 0, pending: 0 });
    }
  }, [filteredData]);

  if (!Fetched) {
    return <ThemeLoader />;
  }

  return (
    <React.Fragment>
      <Row>
        <Col>
          <div className="project-table-card">
            <Card className="card">

              <Card.Header className="project-header">

                {/* Desktop View */}
                <div className="d-none d-md-flex flex-column gap-2 w-100">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 w-100">
                    <h5 className="project-title mb-0 d-flex align-items-center flex-wrap gap-2" style={{ color: "#ffffff", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.03em" }}>
                      <span>Bookings</span>
                      <span style={{ background: "rgba(255,255,255,0.22)", color: "#ffffff", fontSize: "12px", fontWeight: 700, borderRadius: "20px", padding: "3px 10px", border: "1px solid rgba(255,255,255,0.35)", display: "inline-block" }}>
                        {filteredData.length}
                      </span>
                      {brokerFilter && (
                        <span
                          onClick={clearBrokerFilter}
                          title="Click to remove filter"
                          style={{
                            background: "rgba(201, 168, 76, 0.25)",
                            color: "#f5d77f",
                            fontSize: "12px",
                            fontWeight: 600,
                            borderRadius: "20px",
                            padding: "3px 10px",
                            border: "1px solid rgba(201, 168, 76, 0.5)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <span>Broker: {brokerFilterName || bookingsData.find(b => Number(b.broker_id) === Number(brokerFilter))?.broker_name || brokerFilter}</span>
                          <span style={{ fontSize: "14px", fontWeight: "bold" }}>✕</span>
                        </span>
                      )}
                    </h5>

                    <div className="controls-row d-flex align-items-center gap-2">
                      <Dropdown show={limitDropdownOpen} onToggle={(isOpen) => setLimitDropdownOpen(isOpen)}>
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

                      <select className="custom-select" style={{ width: "130px" }} value={typeFilter} onChange={(e) => setTypeFilter(Number(e.target.value))}>
                        <option value={0}>All</option>
                        <option value={1}>Allotments</option>
                        <option value={2}>Registries</option>
                      </select>

                      <select className={`custom-select ${projectSelectClass}`} style={{ width: "150px" }} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                        <option value="" className="default-font-family">All Projects</option>
                        {Array.from(new Map(bookingsData.map((b) => [b.project_id, { id: b.project_id, name: b.project_name, font: b.project_font }])).values()).map((proj) => (
                          <option key={proj.id} value={proj.id} className={proj.font == 1 ? "kruti-dev" : "default-font-family"}>{proj.name}</option>
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
                          <ReactTransliterate value={SecarhProject} onChangeText={(text) => setSearchProject(text)} lang="hi" placeholder="Search…" renderComponent={(props) => (
                            <input {...props} maxLength={50} className="search-input" style={{ fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif" }} />
                          )} />
                        ) : (
                          <input className={`search-input${SearchLang === "hi_kruti" ? " kruti-dev" : ""}`} value={SecarhProject} onChange={(e) => setSearchProject(e.target.value)} maxLength={50} placeholder={SearchLang === "hi_kruti" ? "çkstsDV [kkstsa" : "Search Bookings…"} />
                        )}
                      </div>

                      <button className="btn-add" onClick={() => navigate("/bookings/add")}><span className="btn-add-icon">＋</span> Add</button>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <h5 className="project-title mb-0 d-flex align-items-center flex-wrap gap-2" style={{ color: "#ffffff", fontWeight: 800, fontSize: "16px", letterSpacing: "-0.03em" }}>
                      <span>Bookings</span>
                      <span style={{ background: "rgba(255,255,255,0.22)", color: "#ffffff", fontSize: "11px", fontWeight: 700, borderRadius: "20px", padding: "2px 8px", border: "1px solid rgba(255,255,255,0.35)", display: "inline-block" }}>
                        {filteredData.length}
                      </span>
                      {brokerFilter && (
                        <span
                          onClick={clearBrokerFilter}
                          style={{
                            background: "rgba(201, 168, 76, 0.25)",
                            color: "#f5d77f",
                            fontSize: "11px",
                            fontWeight: 600,
                            borderRadius: "20px",
                            padding: "2px 8px",
                            border: "1px solid rgba(201, 168, 76, 0.5)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <span>{brokerFilterName || bookingsData.find(b => Number(b.broker_id) === Number(brokerFilter))?.broker_name || brokerFilter}</span>
                          <span style={{ fontSize: "12px", fontWeight: "bold" }}>✕</span>
                        </span>
                      )}
                    </h5>
                    <button className="btn-add" style={{ width: '75px', padding: "4px 0", fontSize: "12px", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => navigate("/bookings/add")}>
                      <span className="btn-add-icon" style={{ fontSize: "14px", marginRight: "4px" }}>＋</span> Add
                    </button>
                  </div>

                  {/* Search */}
                  <div className="search-wrap" style={{ width: '100%', marginBottom: '10px' }}>
                    <i className="feather icon-search search-icon" />
                    {SearchLang === "hi_mangal" ? (
                      <ReactTransliterate value={SecarhProject} onChangeText={(text) => setSearchProject(text)} lang="hi" placeholder="Search…" renderComponent={(props) => (
                        <input {...props} maxLength={50} className="search-input" style={{ width: '100%', fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif" }} />
                      )} />
                    ) : (
                      <input className={`search-input${SearchLang === "hi_kruti" ? " kruti-dev" : ""}`} style={{ width: '100%' }} value={SecarhProject} onChange={(e) => setSearchProject(e.target.value)} maxLength={50} placeholder={SearchLang === "hi_kruti" ? "çkstsDV [kkstsa" : "Search Bookings…"} />
                    )}
                  </div>

                  {/* Row 3: Language & Filter */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <select className="custom-select" style={{ width: '100%', height: '36px', fontSize: '13px' }} value={SearchLang} onChange={(e) => { setSearchLang(e.target.value); setSearchProject(""); }}>
                        <option value="en">English</option>
                        <option value="hi_mangal">Mangal</option>
                        <option value="hi_kruti">Hindi</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <select className="custom-select" style={{ width: '100%', height: '36px', fontSize: '13px' }} value={typeFilter} onChange={(e) => setTypeFilter(Number(e.target.value))}>
                        <option value={0}>All</option>
                        <option value={1}>Allotments</option>
                        <option value={2}>Registries</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Projects Filter & Limit */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <select className={`custom-select ${projectSelectClass}`} style={{ width: '100%', height: '36px', fontSize: '13px' }} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                        <option value="" className="default-font-family">All Projects</option>
                        {Array.from(new Map(bookingsData.map((b) => [b.project_id, { id: b.project_id, name: b.project_name, font: b.project_font }])).values()).map((proj) => (
                          <option key={proj.id} value={proj.id} className={proj.font == 1 ? "kruti-dev" : "default-font-family"}>{proj.name}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ width: '75px' }}>
                      <Dropdown show={limitDropdownOpen} onToggle={(isOpen) => setLimitDropdownOpen(isOpen)}>
                        <Dropdown.Toggle className="limit-toggle" style={{ width: '100%', height: '36px', padding: '0 8px' }}>{limit} <span className="limit-chevron">▾</span></Dropdown.Toggle>
                        <Dropdown.Menu className="limit-menu" popperConfig={{ strategy: "fixed" }} style={{ zIndex: 990 }}>
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

              <Card.Body className="card-body-p0">

                <table className="project-table-desktop d-none d-md-table">
                  <thead>
                    <tr>
                      {columns.map((col, i) => (
                        <th key={i} className="table-header-cell">
                          {col === "Dates" ? (
                            <div className="d-flex align-items-center gap-2">
                              Dates
                              <Dropdown>
                                <Dropdown.Toggle variant="light" size="sm" className="p-0 border-0 bg-transparent shadow-none" style={{ color: "#74829c" }}>
                                  <i className="feather icon-filter" style={{ cursor: "pointer" }} title="Sort Dates" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <div className="px-3 py-1 fw-bold text-muted" style={{ fontSize: "12px" }}>SORT BY</div>
                                  <Dropdown.Item onClick={() => setDateSortType("created")} active={dateSortType === "created"}>Created Date</Dropdown.Item>
                                  <Dropdown.Item onClick={() => setDateSortType("booking")} active={dateSortType === "booking"}>Booking Date</Dropdown.Item>
                                  <Dropdown.Item onClick={() => setDateSortType("due")} active={dateSortType === "due"}>Due Date</Dropdown.Item>
                                  <Dropdown.Divider />
                                  <div className="px-3 py-1 fw-bold text-muted" style={{ fontSize: "12px" }}>ORDER</div>
                                  <Dropdown.Item onClick={() => setDateSortOrder("asc")} active={dateSortOrder === "asc"}>Ascending</Dropdown.Item>
                                  <Dropdown.Item onClick={() => setDateSortOrder("desc")} active={dateSortOrder === "desc"}>Descending</Dropdown.Item>
                                  {dateSortType && (
                                    <>
                                      <Dropdown.Divider />
                                      <Dropdown.Item onClick={() => setDateSortType("")} className="text-danger">Clear Sort</Dropdown.Item>
                                    </>
                                  )}
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          ) : (
                            col
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, index) => {
                      const dueDate = getDueDate(row.agreement_date || row.booking_date);
                      const today = new Date(); today.setHours(0, 0, 0, 0);
                      const isPast = dueDate && dueDate < today;

                      return (
                        <tr
                          key={row.booking_id}
                          className="table-row-clickable"
                          onClick={() => handleShowDetails(row)}
                        >
                          <td className="table-sno-cell">{startIndex + index + 1}</td>

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
                              <div className="broker-commission">
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
                            <span
                              className={`status-badge ${row.project_type === 1
                                ? "status-badge-allotment"
                                : row.project_type === 2
                                  ? "status-badge-registry"
                                  : "status-badge-default"
                                }`}
                            >
                              {row.project_type === 1 ? "Allotment" : row.project_type === 2 ? "Registry" : "-"}
                            </span>
                          </td>

                          <td className={row.project_font == 1 ? "kruti-dev" : ""}>
                            <div style={{ fontWeight: 600 }}>{row.sector_name}</div>
                            <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{row.plot_no}</div>
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
                                <span style={{ color: "var(--text-muted)" }}>Total:</span>
                                <span style={{ fontWeight: 700 }}>₹{formatAmount(row.amount_a)}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--blue)" }}>Paid:</span>
                                <span style={{ color: "var(--blue)", fontWeight: 700 }}>₹{formatAmount(row.received_amount)}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 4, marginTop: 2 }}>
                                <span style={{ color: "var(--text-secondary)" }}>Due:</span>
                                <span style={{
                                  fontWeight: 700,
                                  color: Number(row.pending_amount) > 0 ? "var(--red)" : "var(--green)",
                                }}>
                                  ₹{formatAmount(row.pending_amount)}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td style={{ whiteSpace: "nowrap", fontSize: "12px" }}>
                            <div><span style={{ color: "var(--text-muted)" }}>Created:</span> <strong>{formatDateTime1(row.create_at)}</strong></div>
                            <div><span style={{ color: "var(--text-muted)" }}>Booking:</span> <strong>{formatDateTime1(row.booking_date)}</strong></div>
                            {row.agreement_date && (
                              <div><span style={{ color: "var(--text-muted)" }}>
                                Agreement:</span> <strong>{formatDate(row.agreement_date)}</strong></div>
                            )}
                            {dueDate && (
                              <div>
                                <span style={{ color: "var(--text-muted)" }}>Due:</span>{" "}
                                <strong style={{ color: isPast ? "var(--red)" : "var(--accent)" }}>
                                  {formatDateTime(dueDate)}
                                </strong>
                              </div>
                            )}
                          </td>

                          <td onClick={(e) => e.stopPropagation()}>
                            <Dropdown
                              align="start"
                              show={openDropdown === row.booking_id}
                              onToggle={() =>
                                setOpenDropdown(openDropdown === row.booking_id ? null : row.booking_id)
                              }
                            >
                              <Dropdown.Toggle
                                as="div"
                                className="action-icon custom-action-toggle"
                              >
                                <i className="feather icon-more-vertical" />
                              </Dropdown.Toggle>
                              <Dropdown.Menu align="end" className="profile-notification" popperConfig={{ strategy: "fixed" }} style={{ padding: "6px", minWidth: "185px", zIndex: 990 }}>
                                {[
                                  { icon: "icon-message-square", label: "Remark", color: "var(--accent)", fn: () => navigate(`/project/remarks/${row.project_id}`, { state: { row } }) },
                                  { icon: "icon-eye", label: "View", color: "var(--blue)", fn: () => handleShowDetails(row) },
                                  { icon: "icon-edit", label: "Edit", color: "var(--green)", fn: () => handleNavigte(row) },
                                  { icon: "icon-trash-2", label: "Delete", color: "var(--red)", fn: () => { setConfirmType("delete"); setCancelPlotId(row.plot_id); setShowCancelModal(true); } },
                                  { icon: "icon-x-circle", label: "Cancel", color: "var(--orange)", fn: () => { setConfirmType("cancel"); setCancelPlotId(row.plot_id); setShowCancelModal(true); } },
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

                                <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />

                                <div
                                  onClick={() => handleReceiveAmount(row)}
                                  style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                  onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                  <FaMoneyBillWave size={14} style={{ color: "var(--green)", flexShrink: 0 }} />
                                  Receive Amount
                                </div>

                                {row.project_type === 2 && (
                                  <div
                                    onClick={() => AgreementDownload(row)}
                                    style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <FaDownload size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                                    Agreement
                                  </div>
                                )}
                                {row.project_type === 1 && (
                                  <div
                                    onClick={() => AllotmentDownload(row)}
                                    style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <FaDownload size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                                    Allotment
                                  </div>
                                )}

                                <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />

                                <div
                                  onClick={() => {
                                    const basePlotId = row._plot_id ?? row.plot_id;
                                    const plotCustomers = bookingsData
                                      .filter((b) => String(b._plot_id ?? b.plot_id) === String(basePlotId))
                                      .sort((a, b) => a.booking_id - b.booking_id);
                                    setSelectedPlotCustomers(plotCustomers);
                                    setSelectedRow(row.booking_id);
                                    setShowReceiptModal(true);
                                  }}
                                  style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                  onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                  <i className="feather icon-printer" style={{ fontSize: "15px", color: "var(--text-secondary)", flexShrink: 0 }} />
                                  Receipt
                                </div>

                                <div
                                  onClick={() => navigate(`/Docunent/Add`, { state: { row } })}
                                  style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                  onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                  <FaFileAlt size={14} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
                                  Add Document
                                </div>

                                <div
                                  onClick={() => navigate(`/MoreInfo`, { state: { row } })}
                                  style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                  onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                  <FaInfoCircle size={14} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
                                  More Info
                                </div>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* ── MOBILE TABLE ── */}
                <div className="project-table-mobile-wrap d-md-none">
                  <table className="project-table-mobile">
                    <thead>
                      <tr>
                        <th className="mobile-table-header">#</th>
                        <th className="mobile-table-header">Customer / Contact</th>
                        <th className="mobile-table-header">Project / Plot</th>
                        <th className="mobile-table-header">Rate / Booking</th>
                        <th className="mobile-table-header">
                          <div className="d-flex align-items-center gap-1">
                            Dates
                            <Dropdown>
                              <Dropdown.Toggle variant="light" size="sm" className="p-0 border-0 bg-transparent shadow-none" style={{ color: "#74829c" }}>
                                <i className="feather icon-filter" />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <div className="px-3 py-1 fw-bold text-muted" style={{ fontSize: "12px" }}>SORT BY</div>
                                <Dropdown.Item onClick={() => setDateSortType("created")} active={dateSortType === "created"}>Created Date</Dropdown.Item>
                                <Dropdown.Item onClick={() => setDateSortType("booking")} active={dateSortType === "booking"}>Booking Date</Dropdown.Item>
                                <Dropdown.Item onClick={() => setDateSortType("due")} active={dateSortType === "due"}>Due Date</Dropdown.Item>
                                <Dropdown.Divider />
                                <div className="px-3 py-1 fw-bold text-muted" style={{ fontSize: "12px" }}>ORDER</div>
                                <Dropdown.Item onClick={() => setDateSortOrder("asc")} active={dateSortOrder === "asc"}>Ascending</Dropdown.Item>
                                <Dropdown.Item onClick={() => setDateSortOrder("desc")} active={dateSortOrder === "desc"}>Descending</Dropdown.Item>
                                {dateSortType && (
                                  <>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={() => setDateSortType("")} className="text-danger">Clear Sort</Dropdown.Item>
                                  </>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </th>
                        <th className="mobile-table-header">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((row, index) => {
                        const dueDate = getDueDate(row.agreement_date || row.booking_date);
                        const isPast = dueDate && dueDate < new Date();
                        return (
                          <tr
                            key={index}
                            className="mobile-table-row"
                            onClick={() => handleShowDetails(row)}
                          >
                            <td className="mobile-table-cell table-sno-cell">{startIndex + index + 1}</td>

                            <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                              <span className={`mobile-name${row.krutiDev_font == 1 ? " kruti-dev" : ""}`}>
                                {row.customer_name}
                              </span>
                              <span className="mobile-address">Mob: {row.mobile_no}</span>
                              {row.broker_name && (
                                <span className="mobile-address">
                                  Broker:{" "}
                                  <span className={row.broker_font == 1 ? "kruti-dev" : ""}>
                                    {row.broker_name}
                                  </span>
                                </span>
                              )}
                            </td>

                            <td className={`mobile-table-cell${row.project_font == 1 ? " kruti-dev" : ""}`} style={{ whiteSpace: "normal" }}>
                              <span className="mobile-name">{row.project_name}</span>
                              <span className="mobile-address">{row.sector_name} / {row.plot_no}</span>
                            </td>

                            <td className="mobile-table-cell mobile-rate-cell" style={{ whiteSpace: "normal" }}>
                              <div>Sq/F: <strong>{row.square_feet_rate}</strong></div>
                              <div>Booking: <strong>₹{formatAmount(row.booking_amount)}</strong></div>
                            </td>

                            <td className="mobile-table-cell" style={{ whiteSpace: "nowrap", fontSize: "12px" }}>
                              <div>Created: <strong>{formatDateTime(row.create_at)}</strong></div>
                              <div>B Date: <strong>{formatDateTime(row.booking_date)}</strong></div>
                              {dueDate && (
                                <div>
                                  Due:{" "}
                                  <strong style={{ color: isPast ? "var(--red)" : "var(--accent)" }}>
                                    {formatDateTime(dueDate)}
                                  </strong>
                                </div>
                              )}
                            </td>

                            <td className="mobile-table-cell" onClick={(e) => e.stopPropagation()}>
                              <Dropdown
                                align="end"
                                show={openDropdown === row.booking_id}
                                onToggle={() =>
                                  setOpenDropdown(openDropdown === row.booking_id ? null : row.booking_id)
                                }
                              >
                                <Dropdown.Toggle as="div" className="action-icon custom-action-toggle">
                                  <i className="feather icon-more-vertical" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="profile-notification shadow-sm" popperConfig={{ strategy: "fixed" }} style={{ padding: "6px", minWidth: "160px", borderRadius: "12px", border: "1px solid var(--border)", zIndex: 990 }}>
                                  {[
                                    { icon: "icon-eye", label: "View", color: "var(--blue)", fn: () => handleShowDetails(row) },
                                    { icon: "icon-edit", label: "Edit", color: "var(--green)", fn: () => handleNavigte(row) },
                                    { icon: "icon-trash-2", label: "Delete", color: "var(--red)", fn: () => { setConfirmType("delete"); setCancelPlotId(row.plot_id); setShowCancelModal(true); } },
                                    { icon: "icon-x-circle", label: "Cancel", color: "var(--orange)", fn: () => { setConfirmType("cancel"); setCancelPlotId(row.plot_id); setShowCancelModal(true); } },
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

                                  <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />

                                  <div
                                    onClick={() => handleReceiveAmount(row)}
                                    style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <FaMoneyBillWave size={14} style={{ color: "var(--green)", flexShrink: 0 }} />
                                    Receive Amount
                                  </div>

                                  {row.project_type === 2 && (
                                    <div
                                      onClick={() => AgreementDownload(row)}
                                      style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                      onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                      <FaDownload size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                                      Agreement
                                    </div>
                                  )}
                                  {row.project_type === 1 && (
                                    <div
                                      onClick={() => AllotmentDownload(row)}
                                      style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                      onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                      <FaDownload size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                                      Allotment
                                    </div>
                                  )}

                                  <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />

                                  <div
                                    onClick={() => {
                                      const basePlotId = row._plot_id ?? row.plot_id;
                                      const plotCustomers = bookingsData
                                        .filter((b) => String(b._plot_id ?? b.plot_id) === String(basePlotId))
                                        .sort((a, b) => a.booking_id - b.booking_id);
                                      setSelectedPlotCustomers(plotCustomers);
                                      setSelectedRow(row.booking_id);
                                      setShowReceiptModal(true);
                                    }}
                                    style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <i className="feather icon-printer" style={{ fontSize: "15px", color: "var(--text-secondary)", flexShrink: 0 }} />
                                    Receipt
                                  </div>

                                  <div
                                    onClick={() => navigate(`/Docunent/Add`, { state: { row } })}
                                    style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <FaFileAlt size={14} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
                                    Add Document
                                  </div>

                                  <div
                                    onClick={() => navigate(`/MoreInfo`, { state: { row } })}
                                    style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font)", color: "var(--text-primary)", transition: "background 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <FaInfoCircle size={14} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
                                    More Info
                                  </div>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        );
                      })}
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

          {showCancelModal && (
            <LogoutModel
              setShowModal={setShowCancelModal}
              handleFun={() => {
                if (confirmType === "cancel" || confirmType === "delete") {
                  cancelBooking(cancelPlotId);
                }
                setShowCancelModal(false);
                setCancelPlotId(null);
                setConfirmType(null);
              }}
              title={confirmType === "delete" ? "Confirm Delete Booking" : "Confirm Cancel Booking"}
              subtitle={confirmType === "delete" ? "Are you sure you want to delete this booking?" : "Are you sure you want to cancel this booking?"}
              btnText={confirmType === "delete" ? "Delete" : "Yes, Cancel"}
            />
          )}

          {showReceiptModal && selectedPlotCustomers.length > 0 && (
            <div
              className="modal fade show"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050, overflow: "hidden" }}
            >
              <div className="modal-dialog modal-md modal-dialog-centered" style={{ maxWidth: "820px" }}>
                <div className="modal-content position-relative">
                  <div className="modal-body">
                    <Receipt
                      data={{ plotCustomers: selectedPlotCustomers }}
                      onClose={() => {
                        setShowReceiptModal(false);
                        setSelectedPlotCustomers([]);
                        dispatch(setIsFetched(false));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </Col>
      </Row>
    </React.Fragment>
  );
};

export default BookingTable;