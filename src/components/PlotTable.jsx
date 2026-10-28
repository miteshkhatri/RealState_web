import { API_BASE_URL } from 'config/constant';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  Table,
  FormControl,
  Dropdown,
  ListGroup,
  Modal
} from 'react-bootstrap';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import LogoutModel from 'layouts/AdminLayout/NavBar/NavRight/LogoutModel';
import axios from 'axios';
import AddPlot from './AddPlot';
import '../views/style.css';
import api from 'utils/api';
import BackButton from './Loader/BackButton';
import ModernPagination from 'components/Pagination';

const PlotTable = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [ShowActionIcon, setShowActionIcon] = useState();
  const [showModal, setShowModal] = useState(false);
  const [plotId, setPlotId] = useState();
  const [plotData, setplotData] = useState();
  const [updatePlot, setUpdatePlot] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPlotForStatus, setSelectedPlotForStatus] = useState(null);
  const [plotStatuses, setPlotStatuses] = useState([]);
  const [newStatusId, setNewStatusId] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [projectId, setProjectId] = useState();
  const [sectorId, handleFilterData] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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

  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (field) => {
    if (!field) return;
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        // Reset on 3rd click
        setSortField(null);
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const userData = JSON.parse(localStorage.getItem('users'));

  const [SectorData, setSectorData] = useState();
  const [PlotData, setPlotData] = useState([]);

  // ✅ Updated columns - mapped with sort fields
  const columns = [
    { label: '#', field: null },
    { label: 'Plot no', field: 'plot_no' },
    { label: 'Sector / Status', field: 'sector_name' },
    { label: 'Rate / Sq.Ft', field: 'plot_rate' },
    { label: 'Amount', field: 'amount' },
    { label: 'Height / Width', field: 'plot_height' },
    { label: 'Direction', field: null },
    { label: 'Note', field: 'plot_note' },
    { label: 'Date', field: 'create_at' },
    { label: 'Action', field: null }
  ];
  const MobileViewColums = ['Plot / Sector / Status', 'Rate / Sq.Ft / Amt', 'H / W', 'Dire', 'Action'];

  const navRow = location.state?.oneRow;

  const formatAmount = (value) => {
    if (value === null || value === undefined || value === '') return '0';
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return num.toLocaleString('en-IN');
  };

  const getCommentPreview = (text, max = 40) => {
    if (!text) return '';
    const str = String(text);
    return str.length > max ? str.slice(0, max) + '...' : str;
  };

  const ProjectData = JSON.parse(localStorage.getItem('ProjectData'));
  const ProjectId = ProjectData?.project_id;

  const getAllSector = async () => {
    try {
      const res = await api.get(`/sectors/list`, {
        params: { project_id: navRow?.project_id ?? ProjectId },
        headers: {
          Authorization: userData.user_token
        }
      });
      if (res.data.success === true) {
        setSectorData(res.data.data);
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };

  // Fetching plot statuses will now be done when the modal opens to guarantee it loads

  const getAllPlots = async (ProjectId, showBooked = 1) => {
    try {
      const res = await api.get(`/plots/list`, {
        params: {
          project_id: navRow?.project_id ?? ProjectId,
          showBooked: showBooked
        },
        headers: {
          Authorization: userData?.user_token
        }
      });
      if (res.data.success === true) {
        setPlotData(res.data.data);
      }
    } catch (error) {
      console.log(error, 'error get all plots api');
    }
  };

  useEffect(() => {
    if (ProjectId) {
      getAllSector();
      getAllPlots(ProjectId);
    }
  }, [ProjectId]);

  const handleUpdatePlot = (data) => {
    setplotData(data);
    setUpdatePlot(true);
    window.scrollTo(0, 0);
  };

  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const handleShowModel = (data) => {
    setShowModal(true);
    setPlotId(data.plot_id);
    setProjectId(data.project_id);
  };

  const handleDeletePlot = async () => {
    try {
      const res = await api.delete(`/plots`, {
        headers: {
          Authorization: userData.user_token
        },
        data: {
          plot_id: plotId,
          deleted_by_id: userData?.user_id 
        }
      });
      getAllPlots(projectId ?? ProjectId);
    } catch (error) {
      console.log(error, 'error');
    }
  };

  const FilterData = useMemo(() => {
    let data = Array.isArray(PlotData) ? PlotData.slice() : [];
    if (sectorId) {
      data = data.filter((plot) => Number(plot.sector_id) === Number(sectorId));
    }
    const q = String(searchQuery || '').trim().toLowerCase();
    if (q) {
      data = data.filter((plot) => {
        const plotNo = String(plot.plot_no || '').toLowerCase();
        const plotRate = String(plot.plot_rate ?? '').toLowerCase();
        const sqft = String(plot.square_feet ?? '').toLowerCase();
        const amount = String(plot.amount ?? '').toLowerCase();
        return (
          plotNo.startsWith(q) ||
          plotRate.includes(q) ||
          sqft.includes(q) ||
          amount.includes(q)
        );
      });
    }

    if (sortField) {
      data.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Numeric sort for specific fields
        if (sortField === 'amount' || sortField === 'plot_rate' || sortField === 'square_feet' || sortField === 'plot_no' || sortField === 'plot_height') {
           const numA = parseFloat(valA);
           const numB = parseFloat(valB);
           if (!isNaN(numA) && !isNaN(numB)) {
             valA = numA;
             valB = numB;
           }
        }
        
        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [PlotData, sectorId, searchQuery, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(FilterData.length / limit));
  const startIndex = (page - 1) * limit;
  const paginatedData = FilterData.slice(startIndex, startIndex + limit);

  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (page !== 1) setPage(1);
  }, [searchQuery, sectorId]);

  // Helper function to render status badge as chip
  const renderStatusChip = (row) => {
    let rawStatus = row.status || 'Unknown';
    let statusText = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
    if (rawStatus.toLowerCase() === 'npc') statusText = 'NPC';
    if (rawStatus.toLowerCase() === 'np') statusText = 'NP';
    if (rawStatus.toLowerCase() === 'uit reserve') statusText = 'UIT Reserve';

    let bg = '#f5f5f5';
    let color = '#757575';
    let border = '#e0e0e0';
    let content = statusText;
    let isAvailable = false;

    if (row.status === 'completed') {
      bg = '#e3f2fd'; color = '#1976d2'; border = '#90caf9'; content = '✓ ' + statusText;
    } else if (row.status === 'booked') {
      return (
        <span style={{
          display: 'inline-block', padding: '2px 10px', borderRadius: '20px',
          fontSize: '11px', fontWeight: 600, background: '#ffebee', color: '#d32f2f',
          border: '1px solid #ef9a9a', cursor: 'pointer', letterSpacing: '0.3px', transition: 'all 0.2s'
        }}
        onClick={(e) => { e.stopPropagation(); navigate("/bookings", { state: { focusPlotNo: row.plot_no, focusProjectId: row.project_id } }); }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#ffcdd2'; e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#ffebee'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {content}
        </span>
      );
    } else if (row.status === 'available') {
      bg = '#e8f5e9'; color = '#2e7d32'; border = '#a5d6a7';
      isAvailable = true;
    } else {
      bg = '#fff3e0'; color = '#ef6c00'; border = '#ffcc80';
    }

    if (isAvailable) {
      return (
        <span 
          style={{
            display: 'inline-block', padding: '2px 10px', borderRadius: '20px',
            fontSize: '11px', fontWeight: 600, background: bg, color: color,
            border: `1px solid ${border}`, cursor: 'pointer', letterSpacing: '0.3px', transition: 'all 0.2s'
          }}
          onClick={(e) => { e.stopPropagation(); navigate("/bookings/add", { state: { oneRow: row } }); }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#c8e6c9'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#e8f5e9'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {content}
        </span>
      );
    }

    return (
      <span style={{
        display: 'inline-block', padding: '2px 10px', borderRadius: '20px',
        fontSize: '11px', fontWeight: 600, background: bg, color: color,
        border: `1px solid ${border}`, letterSpacing: '0.3px'
      }}>
        {content}
      </span>
    );
  };

  const handleOpenStatusModal = async (row) => {
    setSelectedPlotForStatus(row);
    setNewStatusId(row.status_id ? String(row.status_id) : '');
    setShowStatusModal(true);
    setOpenDropdown(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/plots/statuses`, {
        headers: { Authorization: userData?.user_token }
      });
      if (res.data.success) {
        setPlotStatuses(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching plot statuses:', error);
    }
  };

  const handleOpenHistoryModal = async (row) => {
    setHistoryData([]);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    setOpenDropdown(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/plots/status-history/${row.plot_id}`, {
        headers: { Authorization: userData?.user_token }
      });
      if (res.data.success) {
        setHistoryData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!selectedPlotForStatus || !newStatusId) return;
    try {
      const payload = {
        plot_id: selectedPlotForStatus.plot_id,
        status_id: newStatusId,
        updated_by_id: userData?.user_id
      };
      const res = await axios.put(`${API_BASE_URL}/plots/change-status`, payload, {
        headers: { Authorization: userData?.user_token }
      });
      if (res.data.success) {
        setShowStatusModal(false);
        getAllPlots(projectId ?? ProjectId);
      } else {
        alert(res.data.message || 'Failed to change status');
      }
    } catch (error) {
      console.error(error);
      alert('Error changing status');
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          {/* ── AddPlot Component ── */}
          <AddPlot
            handleUpdatePlot={handleUpdatePlot}
            ProjectData={ProjectData}
            SectorData={SectorData}
            getAllPlots={getAllPlots}
            plotData={plotData}
            updatePlot={updatePlot}
            setUpdatePlot={setUpdatePlot}
            handleFilterData={handleFilterData}
          />

          {/* ── Card wrapper with theme ── */}
          <div className="project-table-card">
            <Card className="card">

              {/* ══════════════════════════════
                  CARD HEADER — theme gradient
              ══════════════════════════════ */}
              <Card.Header className="project-header">

                {/* Row 1: Title + Controls */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

                  {/* Title - Left Side */}
                  <h5
                    className="project-title mb-0"
                    style={{ color: "#ffffff", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.03em" }}
                  >
                    Plots&nbsp;
                    <span
                      style={{
                        background: "rgba(255,255,255,0.22)",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 700,
                        borderRadius: "20px",
                        padding: "3px 10px",
                        border: "1px solid rgba(255,255,255,0.35)",
                        display: "inline-block",
                        verticalAlign: "middle",
                      }}
                    >
                      {FilterData.length}
                    </span>
                  </h5>

                  {/* Controls - Right Side */}
                  <div className="controls-row">
                    {/* Limit dropdown */}
                    <Dropdown>
                      <Dropdown.Toggle className="limit-toggle">
                        {limit} <span className="limit-chevron">▾</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="limit-menu">
                        {[10, 25, 50, 100].map((n, i, arr) => (
                          <React.Fragment key={n}>
                            <div
                              className={`limit-item${limit === n ? " active" : ""}`}
                              onClick={() => { setLimit(n); setPage(1); }}
                            >
                              {n}
                            </div>
                            {i < arr.length - 1 && <Dropdown.Divider className="limit-divider" />}
                          </React.Fragment>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>

                    {/* Sector filter */}
                    {(() => {
                      const selectedSector = SectorData?.find((s) => String(s.id ?? s.sector_id) === String(sectorId));
                      const isSelectedKruti = Number(selectedSector?.krutiDev_font ?? selectedSector?.kruti_font) === 1;
                      return (
                        <select
                          className={`custom-select ${isSelectedKruti ? 'kruti-dev' : ''}`}
                          style={{ width: "150px", fontFamily: isSelectedKruti ? "'Kruti Dev 010', sans-serif !important" : undefined }}
                          value={sectorId}
                          onChange={(e) => handleFilterData(e.target.value)}
                        >
                          <option value="" style={{ fontFamily: 'inherit' }}>All Sectors</option>
                          {SectorData && SectorData.map((sector) => {
                            const isItemKruti = Number(sector.krutiDev_font ?? sector.kruti_font) === 1;
                            return (
                              <option 
                                key={sector.id ?? sector.sector_id} 
                                value={sector.id ?? sector.sector_id}
                                className={isItemKruti ? 'kruti-dev' : ''}
                                style={isItemKruti ? { fontFamily: "'Kruti Dev 010', sans-serif !important" } : undefined}
                              >
                                {sector.sector_name}
                              </option>
                            );
                          })}
                        </select>
                      );
                    })()}

                    {/* Search - Right side with icon */}
                    <div className="search-wrap">
                      <i className="feather icon-search search-icon" />
                      <input
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        maxLength={50}
                        placeholder="Search plot / rate / Sq/Ft / amount…"
                      />
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
                      {columns.map((col, index) => (
                        <th 
                          key={index} 
                          className="table-header-cell"
                          style={{ cursor: col.field ? 'pointer' : 'default', whiteSpace: 'nowrap', userSelect: 'none' }}
                          onClick={() => handleSort(col.field)}
                        >
                          {col.label}
                          {sortField === col.field && col.field ? (
                            <span style={{ marginLeft: '4px', fontSize: '12px' }}>
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          ) : col.field ? (
                            <span style={{ marginLeft: '4px', fontSize: '12px', opacity: 0.3 }}>↕</span>
                          ) : null}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData && paginatedData.length > 0 ? (
                      paginatedData.map((row, index) => (
                        <tr key={row.plot_id ?? index} className="table-row-clickable">
                          {/* # */}
                          <td className="table-sno-cell">{startIndex + index + 1}</td>

                          {/* Plot no */}
                          <td className={row.krutiDev_font == 1 ? 'kruti-dev' : ''}>
                            {row.plot_no}
                          </td>

                          {/* ✅ Sector / Status - with chip style */}
                          <td>
                            <div className={row.krutiDev_font == 1 ? 'kruti-dev' : ''} style={{ 
                              fontWeight: 500,
                              fontSize: '13px',
                              marginBottom: '4px'
                            }}>
                              {row.sector_name}
                            </div>
                            <div>
                              {renderStatusChip(row)}
                            </div>
                          </td>

                          {/* ✅ Merged: Square Rate / Sq.Ft */}
                          <td>
                            <div style={{ fontSize: '13px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Rate:</span> {row.plot_rate}
                            </div>
                            <div style={{ fontSize: '13px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Sq.Ft:</span> {row.square_feet}
                            </div>
                          </td>

                          {/* Amount */}
                          <td style={{ fontWeight: 600 }}>
                            ₹{formatAmount(row.amount)}
                          </td>

                          {/* ✅ Merged: Height / Width */}
                          <td>
                            <div style={{ fontSize: '13px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>H:</span> {row.plot_height}
                            </div>
                            <div style={{ fontSize: '13px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>W:</span> {row.plot_width}
                            </div>
                          </td>

                          {/* Direction */}
                          <td style={{ fontSize: "12px" }}>
                            <div>E- <span className={row.plot_font == 1 ? 'kruti-dev' : ''}>{row.east}</span></div>
                            <div>W- <span className={row.plot_font == 1 ? 'kruti-dev' : ''}>{row.west}</span></div>
                            <div>S- <span className={row.plot_font == 1 ? 'kruti-dev' : ''}>{row.south}</span></div>
                            <div>N- <span className={row.plot_font == 1 ? 'kruti-dev' : ''}>{row.north}</span></div>
                          </td>

                          {/* Note */}
                          <td
                            className={row.plot_font == 1 ? 'kruti-dev' : ''}
                            title={row.plot_note || ''}
                            style={{
                              maxWidth: 120,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {getCommentPreview(row.plot_note, 30)}
                          </td>

                          {/* Date */}
                          <td style={{ whiteSpace: "nowrap", fontSize: "12px" }}>
                            {formatDate(row.create_at)}
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
                              <Dropdown.Menu align="end" className="profile-notification" style={{ padding: "6px", minWidth: "160px" }}>
                                {/* Remark */}
                                <div
                                  onClick={() => navigate(`/project/remarks/${row.project_id}`, { state: { row } })}
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
                                  <i className="feather icon-message-square" style={{ fontSize: "15px", color: "var(--accent)", flexShrink: 0 }} />
                                  Remark
                                </div>

                                {/* Book Now - only for available plots */}
                                {row.status !== 'booked' && row.status !== 'completed' && (
                                  <div
                                    onClick={() => navigate("/bookings/add", { state: { oneRow: row } })}
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
                                    <i className="feather icon-plus-circle" style={{ fontSize: "15px", color: "var(--green)", flexShrink: 0 }} />
                                    Book Now
                                  </div>
                                )}

                                {/* Change Status */}
                                <div
                                  onClick={() => handleOpenStatusModal(row)}
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
                                  <i className="feather icon-refresh-cw" style={{ fontSize: "15px", color: "var(--blue)", flexShrink: 0 }} />
                                  Change Status
                                </div>

                                {/* Status History */}
                                <div
                                  onClick={() => handleOpenHistoryModal(row)}
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
                                  <i className="feather icon-clock" style={{ fontSize: "15px", color: "var(--indigo)", flexShrink: 0 }} />
                                  Status History
                                </div>

                                {/* Edit */}
                                <div
                                  onClick={() => handleUpdatePlot(row)}
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
                                  <i className="feather icon-edit" style={{ fontSize: "15px", color: "var(--green)", flexShrink: 0 }} />
                                  Edit
                                </div>

                                {/* Delete */}
                                <div
                                  onClick={() => handleShowModel(row)}
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
                                  <i className="feather icon-trash-2" style={{ fontSize: "15px", color: "var(--red)", flexShrink: 0 }} />
                                  Delete
                                </div>

                                {/* More Info - only for booked/completed plots */}
                                {(row.status === 'booked' || row.status === 'completed') && (
                                  <div
                                    onClick={() => navigate(`/MoreInfo`, { state: { row } })}
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
                                    <i className="feather icon-info" style={{ fontSize: "15px", color: "var(--blue)", flexShrink: 0 }} />
                                    More Info
                                  </div>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No plots found</td></tr>
                    )}
                  </tbody>
                </table>

                {/* ── MOBILE TABLE ── */}
                <div className="project-table-mobile-wrap d-md-none">
                  <table className="project-table-mobile">
                    <thead>
                      <tr>
                        {MobileViewColums.map((column, index) => (
                          <th key={index} className="mobile-table-header">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData && paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => (
                          <tr key={row.plot_id ?? index} className="mobile-table-row">
                            {/* ✅ Merged: Plot / Sector / Status with chips */}
                            <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                              <div style={{ fontWeight: 600 }}>{row.plot_no}</div>
                              <div className={row.krutiDev_font == 1 ? 'kruti-dev' : ''} style={{ fontSize: '12px' }}>
                                {row.sector_name}
                              </div>
                              <div style={{ marginTop: '4px' }}>
                                {row.status === 'completed' ? (
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '1px 8px',
                                    borderRadius: '20px',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    background: '#e3f2fd',
                                    color: '#1976d2',
                                    border: '1px solid #90caf9'
                                  }}>
                                    ✓ Completed
                                  </span>
                                ) : row.status === 'booked' ? (
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '1px 8px',
                                    borderRadius: '20px',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    background: '#ffebee',
                                    color: '#d32f2f',
                                    border: '1px solid #ef9a9a',
                                    cursor: 'pointer'
                                  }}
                                  onClick={(e) => { e.stopPropagation(); navigate("/bookings", { state: { focusPlotNo: row.plot_no, focusProjectId: row.project_id } }); }}
                                  >
                                    Booked
                                  </span>
                                ) : (
                                  <span 
                                    style={{
                                      display: 'inline-block',
                                      padding: '1px 8px',
                                      borderRadius: '20px',
                                      fontSize: '10px',
                                      fontWeight: 600,
                                      background: '#e8f5e9',
                                      color: '#2e7d32',
                                      border: '1px solid #a5d6a7',
                                      cursor: 'pointer'
                                    }}
                                    onClick={(e) => { e.stopPropagation(); navigate("/bookings/add", { state: { oneRow: row } }); }}
                                  >
                                    Available
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* ✅ Merged: Rate / Sq.Ft / Amt */}
                            <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                              <div>Rate: <strong>{row.plot_rate}</strong></div>
                              <div>Sq.Ft: <strong>{row.square_feet}</strong></div>
                              <div>Amt: <strong>₹{formatAmount(row.amount)}</strong></div>
                            </td>

                            {/* ✅ Merged: H / W */}
                            <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                              <div>H: <strong>{row.plot_height}</strong></div>
                              <div>W: <strong>{row.plot_width}</strong></div>
                            </td>

                            {/* Direction */}
                            <td className="mobile-table-cell" style={{ whiteSpace: "normal", minWidth: '100px', fontSize: '12px' }}>
                              <div>E- <span className={row.plot_font == 1 ? 'kruti-dev' : ''}>{row.east}</span></div>
                              <div>W- <span className={row.plot_font == 1 ? 'kruti-dev' : ''}>{row.west}</span></div>
                              <div>S- <span className={row.plot_font == 1 ? 'kruti-dev' : ''}>{row.south}</span></div>
                              <div>N- <span className={row.plot_font == 1 ? 'kruti-dev' : ''}>{row.north}</span></div>
                            </td>

                            {/* Action */}
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
                                <Dropdown.Menu align="end" className="profile-notification" style={{ padding: "6px", minWidth: "140px" }}>
                                  {/* Remark */}
                                  <div
                                    onClick={() => navigate(`/project/remarks/${row.project_id}`, { state: { row } })}
                                    style={{
                                      display: "flex", alignItems: "center", gap: "8px",
                                      padding: "8px 10px", borderRadius: "8px", cursor: "pointer",
                                      fontSize: "13px", fontFamily: "var(--font)",
                                      color: "var(--text-primary)", transition: "background 0.15s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <i className="feather icon-message-square" style={{ fontSize: "15px", color: "var(--accent)", flexShrink: 0 }} />
                                    Remark
                                  </div>

                                  {/* Change Status */}
                                  <div
                                    onClick={() => handleOpenStatusModal(row)}
                                    style={{
                                      display: "flex", alignItems: "center", gap: "8px",
                                      padding: "8px 10px", borderRadius: "8px", cursor: "pointer",
                                      fontSize: "13px", fontFamily: "var(--font)",
                                      color: "var(--text-primary)", transition: "background 0.15s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <i className="feather icon-refresh-cw" style={{ fontSize: "14px", color: "var(--blue)", flexShrink: 0 }} />
                                    Change Status
                                  </div>

                                  {/* Status History */}
                                  <div
                                    onClick={() => handleOpenHistoryModal(row)}
                                    style={{
                                      display: "flex", alignItems: "center", gap: "8px",
                                      padding: "8px 10px", borderRadius: "8px", cursor: "pointer",
                                      fontSize: "13px", fontFamily: "var(--font)",
                                      color: "var(--text-primary)", transition: "background 0.15s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <i className="feather icon-clock" style={{ fontSize: "14px", color: "var(--indigo)", flexShrink: 0 }} />
                                    Status History
                                  </div>

                                  {/* Edit */}
                                  <div
                                    onClick={() => handleUpdatePlot(row)}
                                    style={{
                                      display: "flex", alignItems: "center", gap: "8px",
                                      padding: "8px 10px", borderRadius: "8px", cursor: "pointer",
                                      fontSize: "13px", fontFamily: "var(--font)",
                                      color: "var(--text-primary)", transition: "background 0.15s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <i className="feather icon-edit" style={{ fontSize: "15px", color: "var(--green)", flexShrink: 0 }} />
                                    Edit
                                  </div>

                                  {/* Delete */}
                                  <div
                                    onClick={() => handleShowModel(row)}
                                    style={{
                                      display: "flex", alignItems: "center", gap: "8px",
                                      padding: "8px 10px", borderRadius: "8px", cursor: "pointer",
                                      fontSize: "13px", fontFamily: "var(--font)",
                                      color: "var(--text-primary)", transition: "background 0.15s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <i className="feather icon-trash-2" style={{ fontSize: "15px", color: "var(--red)", flexShrink: 0 }} />
                                    Delete
                                  </div>

                                  {/* Book Now - only for available plots */}
                                  {row.status !== 'booked' && row.status !== 'completed' && (
                                    <div
                                      onClick={() => navigate("/bookings/add", { state: { oneRow: row } })}
                                      style={{
                                        display: "flex", alignItems: "center", gap: "8px",
                                        padding: "8px 10px", borderRadius: "8px", cursor: "pointer",
                                        fontSize: "13px", fontFamily: "var(--font)",
                                        color: "var(--text-primary)", transition: "background 0.15s",
                                      }}
                                      onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                      <i className="feather icon-plus-circle" style={{ fontSize: "15px", color: "var(--green)", flexShrink: 0 }} />
                                      Book Now
                                    </div>
                                  )}

                                  {/* More Info - only for booked/completed plots */}
                                  {(row.status === 'booked' || row.status === 'completed') && (
                                    <div
                                      onClick={() => navigate(`/MoreInfo`, { state: { row } })}
                                      style={{
                                        display: "flex", alignItems: "center", gap: "8px",
                                        padding: "8px 10px", borderRadius: "8px", cursor: "pointer",
                                        fontSize: "13px", fontFamily: "var(--font)",
                                        color: "var(--text-primary)", transition: "background 0.15s",
                                      }}
                                      onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                      <i className="feather icon-info" style={{ fontSize: "15px", color: "var(--blue)", flexShrink: 0 }} />
                                      More Info
                                    </div>
                                  )}
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={MobileViewColums.length} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No plots found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </Card.Body>

              <ModernPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />

              <div className="px-3 py-3 text-start">
                <BackButton />
              </div>
            </Card>
          </div>

          {/* ── Modals ── */}
          {showModal && (
            <LogoutModel
              projectId={plotId}
              setShowModal={setShowModal}
              handleFun={handleDeletePlot}
              title="Confirm Delete Plot"
              subtitle="Are you sure you want to delete plot?"
              btnText="Delete"
            />
          )}

          {/* Change Status Modal */}
          <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title style={{ fontSize: '18px', fontWeight: 600 }}>Change Plot Status</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Select New Status</Form.Label>
                <Form.Select
                  value={newStatusId}
                  onChange={(e) => setNewStatusId(e.target.value)}
                >
                  <option value="">Select Status</option>
                  {plotStatuses
                    .filter((status) => {
                      const name = status.status_name || status.name || '';
                      return name.toLowerCase() !== 'booked';
                    })
                    .sort((a, b) => {
                      const nameA = a.status_name || a.name || '';
                      const nameB = b.status_name || b.name || '';
                      return nameA.localeCompare(nameB);
                    })
                    .map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.status_name || status.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleChangeStatus} disabled={!newStatusId}>Update Status</Button>
            </Modal.Footer>
          </Modal>

          {/* History Modal */}
          <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg" centered>
            <Modal.Header closeButton closeVariant="white" style={{ background: '#1a3353', borderBottom: 'none' }}>
              <Modal.Title style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="feather icon-clock" style={{ fontSize: '18px' }}></i>
                Plot Status History
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '0', background: '#f4f7fa' }}>
              {historyLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Fetching history...</p>
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-5 text-muted" style={{ background: '#fff' }}>
                  <i className="feather icon-info" style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }}></i>
                  No history found for this plot.
                </div>
              ) : (
                <div className="table-responsive" style={{ background: '#fff' }}>
                  <Table className="mb-0" hover style={{ fontSize: '13px', borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px 15px', fontWeight: 600, color: '#68778d', textTransform: 'uppercase', borderBottom: '1px solid #e0e5eb', fontSize: '11px', letterSpacing: '0.5px' }}>DATE & TIME</th>
                        <th style={{ padding: '12px 15px', fontWeight: 600, color: '#68778d', textTransform: 'uppercase', borderBottom: '1px solid #e0e5eb', fontSize: '11px', letterSpacing: '0.5px' }}>STATUS CHANGED TO</th>
                        <th style={{ padding: '12px 15px', fontWeight: 600, color: '#68778d', textTransform: 'uppercase', borderBottom: '1px solid #e0e5eb', fontSize: '11px', letterSpacing: '0.5px' }}>UPDATED BY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((item, idx) => {
                        const rawStatusName = item.status_name || item.name || 'Unknown';
                        const statusName = rawStatusName.toLowerCase();
                        
                        let displayStatusName = rawStatusName.charAt(0).toUpperCase() + rawStatusName.slice(1);
                        if (statusName === 'npc') displayStatusName = 'NPC';
                        if (statusName === 'uit reserve') displayStatusName = 'UIT Reserve';
                        
                        let bg = '#fff3e0';
                        let color = '#ef6c00';
                        let border = '#ffcc80';

                        if (statusName === 'completed') {
                          bg = '#e3f2fd'; color = '#1976d2'; border = '#90caf9';
                        } else if (statusName === 'booked') {
                          bg = '#ffebee'; color = '#d32f2f'; border = '#ef9a9a';
                        } else if (statusName === 'available') {
                          bg = '#e8f5e9'; color = '#2e7d32'; border = '#a5d6a7';
                        }
                        
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #f0f2f5' }}>
                            <td style={{ padding: '15px', verticalAlign: 'middle', color: '#333', fontWeight: 500 }}>
                              {new Date(item.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                              <br/>
                              <small style={{ color: '#888', fontWeight: 400 }}>
                                {new Date(item.updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </td>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <span style={{
                                display: 'inline-block', padding: '2px 10px', borderRadius: '20px',
                                fontSize: '11px', fontWeight: 600, background: bg, color: color,
                                border: `1px solid ${border}`, letterSpacing: '0.3px'
                              }}>
                                {statusName === 'completed' ? '✓ ' : ''}{displayStatusName}
                              </span>
                            </td>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ 
                                  width: '30px', height: '30px', borderRadius: '50%', background: '#1a3353', 
                                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' 
                                }}>
                                  {item.user_name ? item.user_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div style={{ lineHeight: '1.3' }}>
                                  <span style={{ fontWeight: 600, color: '#333', display: 'block' }}>{item.user_name || 'System User'}</span>
                                  <span style={{ fontSize: '12px', color: '#888' }}>{item.email || 'N/A'}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer style={{ borderTop: 'none', background: '#f4f7fa' }}>
              <Button variant="outline-secondary" onClick={() => setShowHistoryModal(false)} style={{ borderRadius: '4px', fontSize: '13px', fontWeight: 500 }}>Close</Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default PlotTable;