import { API_BASE_URL } from 'config/constant';
import React, { useState, useEffect } from 'react';
import ThemeLoader from 'components/Loader/ThemeLoader';
import { Row, Col, Card, Table, Button, Dropdown, ListGroup, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import LogoutModel from 'layouts/AdminLayout/NavBar/NavRight/LogoutModel';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../style.css'
import { preeBookings, setIsFetched } from 'redux/store/PreBookings/Action';
import { useDispatch } from 'react-redux';
import api from 'utils/api';
import ModernPagination from 'components/Pagination';

const TableData = () => {
  const [ShowActionIcon, setShowActionIcon] = useState();
  const [showModal, setShowModal] = useState(false);
  const [BookingId, setBookingId] = useState();
  const [SecarhProject, setSearchProject] = useState('');
  const [PreBookingData, setPreBookingData] = useState();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [limitDropdownOpen, setLimitDropdownOpen] = useState(false); // ✅ controlled

  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('users'));
  const dispatch = useDispatch();
  const preeBookingData = useSelector((state) => state.prebooking.prebookings);
  const isFetched = useSelector((state) => state.prebooking.isFetched);

  function formatDateTime(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const handleNavigte = (data) => {
    dispatch(setIsFetched(false));
    navigate('/prebooking/add', { state: { data, mode: 'edit' } });
  };

  const handleShowModel = (id) => {
    setShowModal(true);
    setBookingId(id);
  };

  const filteredData = SecarhProject
    ? preeBookingData.filter(
        (row) =>
          (row.customer_name || '').toLowerCase().includes(SecarhProject.toLowerCase()) ||
          (row.customer_number || '').toLowerCase().includes(SecarhProject.toLowerCase()) ||
          (row.Plot_number || '').toLowerCase().includes(SecarhProject.toLowerCase())
      )
    : preeBookingData;

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const startIndex = (page - 1) * limit;
  const paginatedData = filteredData.slice(startIndex, startIndex + limit);

  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [SecarhProject]);

  const columns = ['#', 'Name', 'Number', 'Plot no', 'Amount', 'Create at', 'Action'];
  const MobileViewColums = ['User', 'Plot', 'Amt', 'Action'];

  const getAllPreBooking = async () => {
    if (isFetched == false) {
      try {
        const res = await api.get(`/prebooking/list`, {
          headers: {
            Authorization: userData.user_token
          }
        });
        if (res.data.success == true) {
          dispatch(preeBookings(res.data.data));
          dispatch(setIsFetched(true));
          setPreBookingData(res.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const deletePreBooking = async () => {
    try {
      dispatch(setIsFetched(false));
      const res = await api.delete(`/prebooking`, {
        headers: {
          Authorization: userData.user_token
        },
        params: {
          preBookingId: BookingId
        }
      });
      getAllPreBooking();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllPreBooking();
  }, [isFetched]);

  const formatAmount = (val) => {
    if (val === null || val === undefined || val === '' || Number(val) === 0) return '0';
    const num = Math.floor(Number(val));
    if (Number.isNaN(num)) return val;
    return num.toLocaleString('en-IN');
  };

  if (!isFetched) {
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
      <h5 className="project-title mb-0" style={{ color: "#ffffff", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.03em" }}>
        Pre Booking&nbsp;
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

        <div className="search-wrap">
          <i className="feather icon-search search-icon" />
          <input className="search-input" value={SecarhProject} onChange={(e) => setSearchProject(e.target.value)} maxLength={50} placeholder="Search pre bookings…" />
        </div>

        <button className="btn-add" onClick={() => navigate('/prebooking/add')}><span className="btn-add-icon">＋</span> Add</button>
      </div>
    </div>

    <div className="d-flex gap-2 mt-2 flex-wrap justify-content-end w-100">
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "10px", padding: "6px 14px", backdropFilter: "blur(8px)" }}>
        <span style={{ fontSize: "16px" }}>📋</span>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Total Pre Bookings</div>
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
        Pre Booking&nbsp;
        <span style={{ background: "rgba(255,255,255,0.22)", color: "#ffffff", fontSize: "11px", fontWeight: 700, borderRadius: "20px", padding: "2px 8px", border: "1px solid rgba(255,255,255,0.35)", display: "inline-block", verticalAlign: "middle" }}>
          {filteredData.length}
        </span>
      </h5>
      <button className="btn-add" style={{ width: '75px', padding: "4px 0", fontSize: "12px", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => navigate('/prebooking/add')}>
        <span className="btn-add-icon" style={{ fontSize: "14px", marginRight: "4px" }}>＋</span> Add
      </button>
    </div>

    {/* Search & Limit Row */}
    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', width: '100%', alignItems: 'center' }}>
      <div className="search-wrap" style={{ flex: 1, minWidth: 0, margin: 0 }}>
        <i className="feather icon-search search-icon" />
        <input className="search-input" style={{ width: '100%' }} value={SecarhProject} onChange={(e) => setSearchProject(e.target.value)} maxLength={50} placeholder="Search pre bookings…" />
      </div>
      
      <div style={{ width: '75px', flexShrink: 0 }}>
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
  </div>

              </Card.Header>

              <Card.Body className="card-body-p0">

                {/* ── DESKTOP TABLE ── */}
                <table className="project-table-desktop d-none d-md-table">
                  <thead>
                    <tr>
                      {columns && columns.map((column, index) => (
                        <th key={index} className="table-header-cell">{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData && paginatedData.map((row, index) => (
                      <tr
                        key={index}
                        className="table-row-clickable"
                        onClick={() => handleNavigte(row)}
                      >
                        <td className="table-sno-cell">{startIndex + index + 1}</td>

                        <td className={row.krutiDev_font == 1 ? 'kruti-dev' : ''}>
                          {row.customer_name}
                        </td>

                        <td>{row.customer_number}</td>

                        <td className={row.krutiDev_font == 1 ? 'kruti-dev' : ''}>
                          {row.Plot_number}
                        </td>

                        <td style={{ fontWeight: 600 }}>
                          ₹{formatAmount(row.amount)}
                        </td>

                        <td style={{ whiteSpace: "nowrap" }}>
                          {formatDateTime(row.create_at)}
                        </td>

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
                                { icon: "icon-edit", label: "Edit", color: "var(--green)", fn: () => handleNavigte(row) },
                                { icon: "icon-trash-2", label: "Delete", color: "var(--red)", fn: () => handleShowModel(row.id) },
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
                        {MobileViewColums && MobileViewColums.map((column, index) => (
                          <th key={index} className="mobile-table-header">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData && paginatedData.map((row, index) => (
                        <tr
                          key={index}
                          className="mobile-table-row"
                          onClick={() => handleNavigte(row)}
                        >
                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <span className={`mobile-name${row.krutiDev_font == 1 ? ' kruti-dev' : ''}`}>
                              {row.customer_name}
                            </span>
                            <span className="mobile-address">{row.customer_number}</span>
                          </td>

                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <span className={row.krutiDev_font == 1 ? 'kruti-dev' : ''}>
                              {row.Plot_number}
                            </span>
                          </td>

                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <strong>₹{formatAmount(row.amount)}</strong>
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
                              <Dropdown.Menu align="end" className="profile-notification" popperConfig={{ strategy: "fixed" }} style={{ padding: "6px", minWidth: "140px", zIndex: 990 }}>
                                {[
                                  { icon: "icon-edit", label: "Edit", color: "var(--green)", fn: () => handleNavigte(row) },
                                  { icon: "icon-trash-2", label: "Delete", color: "var(--red)", fn: () => handleShowModel(row.id) },
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

          {showModal && (
            <LogoutModel
              projectId={BookingId}
              setShowModal={setShowModal}
              handleFun={deletePreBooking}
              title="Confirm Delete Pre Booking"
              subtitle="Are you sure you want to delete pre booking?"
              btnText="Delete"
            />
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default TableData;