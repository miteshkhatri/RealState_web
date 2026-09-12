import { API_BASE_URL } from 'config/constant';
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Table, Dropdown, ListGroup, Form, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import LogoutModel from 'layouts/AdminLayout/NavBar/NavRight/LogoutModel';
import axios from 'axios';
import PasswordModal from 'components/PasswordModal';
import '../style.css';
import Receipt from 'views/Receipt/Receipt';
import "../Receipt/Receipt.css";
import { ReactTransliterate } from 'react-transliterate';
import api from 'utils/api';
import BackButton from 'components/Loader/BackButton';

function SingleReceiveData() {
  const [ReceiveAmountData, setReceiveAmountData] = useState([]);
  const pressedKeys = useRef(new Set());
  const [SearchProject, setSearchProject] = useState('');
  const [showAmountB, setShowAmountB] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const userData = JSON.parse(localStorage.getItem('users'));
  const [remaining_amount_a, setremaining_amount_a] = useState();
  const [remaining_amount_b, setremaining_amount_b] = useState();
  const [RemainingAmount, setRemainingAmount] = useState();

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const customer_id = location.state?.data?.customer_id;
  const [customerId] = useState(customer_id);

  const [showModal, setShowModal] = useState(false);
  const [PreBookingId, setPreBookingId] = useState();

  const [plot_id, setplot_id] = useState(params.plot_id || location.state?.plot_id || '');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [Errors, setErrors] = useState(null);

  const [openDropdown, setOpenDropdown] = useState(null);

  const [SearchLang, setSearchLang] = useState('hi_mangal');

  const formatAmount = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return num.toLocaleString('en-IN');
  };

  const getCommentPreview = (text, max = 40) => {
    if (!text) return "";
    const str = String(text);
    return str.length > max ? str.slice(0, max) + "..." : str;
  };

  const getSingleUserrecord = async () => {
    try {
      const res = await api.get(`/receiveamount/list`, {
        headers: { Authorization: userData.user_token },
        params: {
          plot_id: plot_id || undefined,
          user_id: userData?.user_id,
          search: SearchProject || undefined,
          search_lang: SearchLang || undefined
        }
      });
      if (res.data.success) {
        setReceiveAmountData(res.data.data || []);
      } else {
        setReceiveAmountData([]);
      }
    } catch (error) {
      console.log(error);
      setReceiveAmountData([]);
    }
  };

  const PenddingAmount = async (password_b = '') => {
    try {
      const res = await api.get(`/receiveamount/remainingamount`, {
        headers: { Authorization: userData.user_token },
        params: {
          plot_id: plot_id || undefined,
          user_id: userData?.user_id,
          password_b: password_b || undefined,
        }
      });
      if (res.data && Array.isArray(res.data.data) && res.data.data[0]) {
        const row = res.data.data[0];
        setremaining_amount_b(row.remaining_amount_b);
        setremaining_amount_a(row.remaining_amount_a);
        setRemainingAmount(row);
        setShowAmountB(res.data.status);
      } else {
        setremaining_amount_a(null);
        setremaining_amount_b(null);
        setRemainingAmount(null);
        setShowAmountB(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.plot_id && params.plot_id !== plot_id) {
      setplot_id(params.plot_id);
    }
    PenddingAmount();
    getSingleUserrecord();
  }, [plot_id, SearchProject, SearchLang, params.plot_id]);

  const handleEditdata = (data) => {
    navigate('/receiveamount/add', { state: { data, mode: 'edit' } });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      pressedKeys.current.add(event.key.toLowerCase());

      if (
        (event.ctrlKey || pressedKeys.current.has('control')) &&
        pressedKeys.current.has('b') &&
        pressedKeys.current.has('c')
      ) {
        if (showAmountB) {
          setShowAmountB(false);
        } else {
          setShowPasswordModal(true);
        }
        pressedKeys.current.clear();
      }
    };

    const handleKeyUp = (event) => {
      pressedKeys.current.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showAmountB]);

  const handlePasswordSubmit = async (password) => {
    try {
      const res = await api.post(`/users/passwordb`, {
        user_id: userData?.user_id,
        password_b: password
      });
      if (res.data.success) {
        await PenddingAmount(password);
        setShowPasswordModal(false);
        setErrors(null);
      } else {
        setErrors(res.data.message || 'Invalid password');
      }
    } catch (error) {
      console.log(error);
      setErrors('Server error');
    }
  };

  const columns = [
    '#',
    'Name',
    'Project',
    'Sec/Plot',
    'Rec Amt / Mode',
    'Pen Amount',
    'Comment',
    'Image',
    'Receive Date',
    'Action'
  ];

  const filteredColumns = showAmountB
    ? columns
    : columns.filter((column) => column !== 'Pen Amount');

  const handleShowModel = (id) => {
    setShowModal(true);
    setPreBookingId(id);
  };

  const deleteReceiveAmount = async () => {
    try {
      await api.delete(`/receiveamount`, {
        headers: { Authorization: userData.user_token },
        params: { receive_amountId: PreBookingId, deleted_by: userData?.user_id }
      });
      getSingleUserrecord();
    } catch (error) {
      console.log(error);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleHeaderAdd = () => {
    const first = ReceiveAmountData && ReceiveAmountData.length ? ReceiveAmountData[0] : null;
    if (first) {
      navigate('/receiveamount/add', { state: { data: first } });
    } else {
      navigate('/receiveamount/add');
    }
  };

  return (
    <React.Fragment>
       <BackButton />
      <Row>
        <Col>
          {/* ── Card wrapper with theme ── */}
          <div className="project-table-card">
            <Card className="card">

              {/* ══════════════════════════════
                  CARD HEADER — theme gradient (same as BookingTable)
              ══════════════════════════════ */}
              <Card.Header className="project-header">

                {/* Row 1: Title + Controls */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

                  {/* Title — always white */}
                  <h5
                    className="project-title mb-0"
                    style={{ color: "#ffffff", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.03em" }}
                  >
                    Receive Amount&nbsp;
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
                      {ReceiveAmountData?.length || 0}
                    </span>
                  </h5>

                  {/* Controls row */}
                  <div className="controls-row">

                    {/* Language filter */}
                    <select
                      className="custom-select"
                      style={{ width: "120px" }}
                      value={SearchLang}
                      onChange={(e) => { setSearchLang(e.target.value); setSearchProject(''); }}
                    >
                      <option value="en">English</option>
                      <option value="hi_mangal">Mangal</option>
                      <option value="hi_kruti">Hindi</option>
                    </select>

                    {/* Search */}
                    <div className="search-wrap">
                      <i className="feather icon-search search-icon" />
                      {SearchLang === 'hi_mangal' ? (
                        <ReactTransliterate
                          value={SearchProject}
                          onChangeText={(text) => setSearchProject(text)}
                          lang="hi"
                          placeholder="Search…"
                          renderComponent={(props) => (
                            <input
                              {...props}
                              maxLength={50}
                              className="search-input"
                              style={{ fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif" }}
                            />
                          )}
                        />
                      ) : (
                        <input
                          className={`search-input${SearchLang === 'hi_kruti' ? ' kruti-dev' : ''}`}
                          value={SearchProject}
                          onChange={(e) => setSearchProject(e.target.value)}
                          maxLength={50}
                          placeholder={SearchLang === 'hi_kruti' ? 'खोजें राशि प्राप्त करें' : 'Search…'}
                        />
                      )}
                    </div>

                    {/* Add button */}
                    <button className="btn-add" onClick={handleHeaderAdd}>
                      <span className="btn-add-icon">＋</span> Add
                    </button>

                  </div>
                </div>

                {/* Row 2: Stats cards */}
                <div className="d-flex gap-2 mt-3 flex-wrap justify-content-end">
                  {RemainingAmount && (
                    <>
                      {/* Total Amount */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        borderRadius: "10px",
                        padding: "6px 14px",
                        backdropFilter: "blur(8px)",
                      }}>
                        <span style={{ fontSize: "16px" }}>💰</span>
                        <div style={{ lineHeight: 1.2 }}>
                          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Total</div>
                          <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>₹{formatAmount(RemainingAmount?.booking_amount_a)}</div>
                        </div>
                      </div>

                      {/* Received Amount */}
                      {RemainingAmount?.total_all_received_amount_a > 0 && (
                        <div style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          background: "rgba(16,185,129,0.20)",
                          border: "1px solid rgba(16,185,129,0.35)",
                          borderRadius: "10px",
                          padding: "6px 14px",
                          backdropFilter: "blur(8px)",
                        }}>
                          <span style={{ fontSize: "16px" }}>✅</span>
                          <div style={{ lineHeight: 1.2 }}>
                            <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Received</div>
                            <div style={{ fontSize: "13px", fontWeight: 800, color: "#6ee7b7" }}>₹{formatAmount(RemainingAmount.total_all_received_amount_a)}</div>
                          </div>
                        </div>
                      )}

                      {/* Remaining Amount */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: "rgba(239,68,68,0.18)",
                        border: "1px solid rgba(239,68,68,0.32)",
                        borderRadius: "10px",
                        padding: "6px 14px",
                        backdropFilter: "blur(8px)",
                      }}>
                        <span style={{ fontSize: "16px" }}>⏳</span>
                        <div style={{ lineHeight: 1.2 }}>
                          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Remaining</div>
                          <div style={{ fontSize: "13px", fontWeight: 800, color: "#fca5a5" }}>₹{formatAmount(RemainingAmount?.remaining_amount_a || 0)}</div>
                        </div>
                      </div>
                    </>
                  )}
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
                      {filteredColumns.map((col, i) => (
                        <th key={i} className="table-header-cell">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ReceiveAmountData?.map((row, i) => (
                      <tr key={i} className="table-row-clickable">
                        {/* # */}
                        <td className="table-sno-cell">{i + 1}</td>

                        {/* Name */}
                        <td className={row.krutiDev_font == 1 ? 'kruti-dev' : ''}>
                          {row.customer_name}
                        </td>

                        {/* Project */}
                        <td className={row.project_font == 1 ? 'kruti-dev' : ''}>
                          {row.project_name}
                        </td>

                        {/* Sec/Plot */}
                        <td className={row.project_font == 1 ? 'kruti-dev' : ''}>
                          <div style={{ fontWeight: 600 }}>{row.sector_name}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{row.plot_no}</div>
                        </td>

                        {/* Rec Amt / Mode */}
                        <td>
                          <div style={{ fontSize: "15px", fontWeight: 700 }}>
                            ₹{formatAmount(row.amount)}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            {row.amount_a_type}
                          </div>
                        </td>

                        {/* Pen Amount */}
                        {showAmountB && (
                          <td style={{ fontSize: "15px", fontWeight: 600, color: "var(--accent)" }}>
                            ₹{formatAmount(row.amount_b)}
                          </td>
                        )}

                        {/* Comment */}
                        <td
                          style={{
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={row.additional_comments || ''}
                        >
                          {row.additional_comments}
                        </td>

                        {/* Image */}
                        <td>
                          {row.image && (
                            <a
                              href={`${API_BASE_URL}/uploads/${row.image}`}
                              style={{ color: "var(--blue)", textDecoration: "none" }}
                              onClick={(e) => e.stopPropagation()}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          )}
                        </td>

                        {/* Receive Date */}
                        <td style={{ whiteSpace: "nowrap" }}>
                          {formatDateTime(row.receive_date)}
                        </td>

                        {/* Action */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <Dropdown
                            align="start"
                            show={openDropdown === `desktop-${i}`}
                            onToggle={() =>
                              setOpenDropdown(openDropdown === `desktop-${i}` ? null : `desktop-${i}`)
                            }
                          >
                            <Dropdown.Toggle
                              as="div"
                              className="action-icon custom-action-toggle"
                            >
                              <i className="feather icon-more-vertical" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end" className="profile-notification" style={{ padding: "6px", minWidth: "160px" }}>
                              {[
                                { icon: "icon-message-square", label: "Remark", color: "var(--accent)", fn: () => navigate(`/project/remarks/${row.project_id ?? row.projectId}`, { state: { row } }) },
                                { icon: "icon-edit", label: "Edit", color: "var(--green)", fn: () => handleEditdata(row) },
                                { icon: "icon-trash-2", label: "Delete", color: "var(--red)", fn: () => handleShowModel(row.id) },
                                { icon: "icon-file-text", label: "Receipt", color: "var(--text-secondary)", fn: () => { setSelectedRow(row); setShowReceiptModal(true); setOpenDropdown(null); } },
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
                        <th className="mobile-table-header">Mode / Comment</th>
                        <th className="mobile-table-header">Receive Date</th>
                        <th className="mobile-table-header">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ReceiveAmountData?.map((row, i) => (
                        <tr key={i} className="mobile-table-row">
                          <td className="mobile-table-cell table-sno-cell">{i + 1}</td>

                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <span className={`mobile-name${row.krutiDev_font == 1 ? ' kruti-dev' : ''}`}>
                              {row.customer_name}
                            </span>
                            <span className="mobile-address" style={{ fontSize: "11px" }}>
                              {row.project_name}
                            </span>
                          </td>

                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <div>
                              Sec: <span className={row.project_font == 1 ? 'kruti-dev' : ''}>{row.sector_name}</span>
                              {' / '}
                              Plot: <span className={row.project_font == 1 ? 'kruti-dev' : ''}>{row.plot_no}</span>
                            </div>
                            <div>
                              Receive Amt: <strong>₹{formatAmount(row.amount)}</strong>
                            </div>
                            {showAmountB && (
                              <div>
                                Pen Amt: <strong>₹{formatAmount(row.amount_b)}</strong>
                              </div>
                            )}
                          </td>

                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <div>
                              Mode: <strong>{row.amount_a_type}</strong>
                            </div>
                            <div
                              style={{ maxWidth: 150, wordBreak: 'break-word', fontSize: "11px", color: "var(--text-secondary)" }}
                              title={row.additional_comments || ''}
                            >
                              {getCommentPreview(row.additional_comments, 40)}
                            </div>
                            {row.image && (
                              <div>
                                <a
                                  href={`${API_BASE_URL}/uploads/${row.image}`}
                                  style={{ color: "var(--blue)", fontSize: "11px", textDecoration: "none" }}
                                  onClick={(e) => e.stopPropagation()}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View Img
                                </a>
                              </div>
                            )}
                          </td>

                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <strong>{formatDateTime(row.receive_date)}</strong>
                          </td>

                          <td className="mobile-table-cell" onClick={(e) => e.stopPropagation()}>
                            <Dropdown
                              align="end"
                              show={openDropdown === `mobile-${i}`}
                              onToggle={() =>
                                setOpenDropdown(openDropdown === `mobile-${i}` ? null : `mobile-${i}`)
                              }
                            >
                              <Dropdown.Toggle as="div" className="action-icon custom-action-toggle">
                                <i className="feather icon-more-vertical" />
                              </Dropdown.Toggle>
                              <Dropdown.Menu align="end" className="profile-notification" style={{ padding: "6px", minWidth: "140px" }}>
                                {[
                                  { icon: "icon-message-square", label: "Remark", color: "var(--accent)", fn: () => navigate(`/project/remarks/${row.project_id ?? row.projectId}`, { state: { row } }) },
                                  { icon: "icon-edit", label: "Edit", color: "var(--green)", fn: () => handleEditdata(row) },
                                  { icon: "icon-trash-2", label: "Delete", color: "var(--red)", fn: () => handleShowModel(row.id) },
                                  { icon: "icon-file-text", label: "Receipt", color: "var(--text-secondary)", fn: () => { setSelectedRow(row); setShowReceiptModal(true); setOpenDropdown(null); } },
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

              {/* ── Back Button ── */}
              <div className="px-3 py-3 text-start">
               
              </div>

            </Card>
          </div>

          {/* ── Modals ── */}
          {showModal && (
            <LogoutModel
              projectId={PreBookingId}
              setShowModal={setShowModal}
              handleFun={deleteReceiveAmount}
              title="Confirm Delete Receive Amount"
              subtitle="Are you sure you want to delete this receive amount?"
              btnText="Delete"
            />
          )}

          {showReceiptModal && selectedRow && (
            <div
              className="modal fade show"
              style={{
                display: 'block',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1050,
                overflow: 'hidden'
              }}
            >
              <div className="modal-dialog modal-sm modal-dialog-centered" style={{ maxWidth: '820px' }}>
                <div className="modal-content position-relative">
                  <div className="modal-body">
                    <Receipt data={{ selectedRow }} onClose={() => setShowReceiptModal(false)} />
                  </div>
                </div>
              </div>
            </div>
          )}

        </Col>
      </Row>

      <PasswordModal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        errors={Errors}
        onSubmit={handlePasswordSubmit}
      />
    </React.Fragment>
  );
}

export default SingleReceiveData;