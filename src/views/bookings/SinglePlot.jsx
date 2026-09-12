import { API_BASE_URL } from 'config/constant';
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './style.css';
import PasswordModal from 'components/PasswordModal';
import api from 'utils/api';
import BackButton from 'components/Loader/BackButton';

function SinglePlot() {
  const [data, setData] = useState([]);
  const [remaining_amount_a, setremaining_amount_a] = useState(0);
  const [remaining_amount_b, setremaining_amount_b] = useState(0);
  const [showAmountB, setShowAmountB] = useState(false);
  const [RemainingAmount, setRemainingAmount] = useState({});

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [Errors, setErrors] = useState(null);

  const userData = JSON.parse(localStorage.getItem('users'));
  const location = useLocation();
  const Data = location.state?.data;
  const plot_id = Data?.plot_id;
  const Customer_id = Data?.booking_id;

  const columns = [
    '#',
    'User',
    'Project',
    'Sec/Plot',
    'Sq/F Rate',
    'Booking Amt',
    'Total Amt',
    'Mode',
    'Ref',
  ];

  const filteredColumns = showAmountB
    ? columns
    : columns.filter((col) => col !== 'Welcome' && col !== 'Pen Welcome');

  const formatAmount = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return num.toLocaleString('en-IN');
  };

  const getRefPreview = (text, max = 40) => {
    if (!text) return '';
    const str = String(text);
    return str.length > max ? str.slice(0, max) + '...' : str;
  };

  const handleGetAllDataBooking = async () => {
    try {
      const res = await api.get(`/booking/list`, {
        headers: { Authorization: userData?.user_token },
        params: { plot_id, user_id: userData?.user_id }
      });

      const sortedData = res.data.data.sort((a, b) => a.booking_id - b.booking_id);

      if (sortedData.length > 1) {
        const combinedRow = {
          ...sortedData[0],
          customers: sortedData.map((r) => ({ name: r.customer_name, number: r.mobile_no }))
        };
        setData([combinedRow]);
      } else if (sortedData.length === 1) {
        setData([{
          ...sortedData[0],
          customers: [{ name: sortedData[0].customer_name, number: sortedData[0].mobile_no }]
        }]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const PenddingAmount = async () => {
    try {
      const res = await api.get(`/receiveamount/remainingamount`, {
        headers: { Authorization: userData.user_token },
        params: { Customer_id, plot_id }
      });

      if (res.data.data && res.data.data.length) {
        const apiData = res.data.data[0];
        setremaining_amount_a(apiData.remaining_amount_a);
        setremaining_amount_b(apiData.remaining_amount_b);

        setRemainingAmount({
          booking_amount_a: apiData.booking_amount_a,
          total_all_received_amount_a: apiData.total_all_received_amount_a,
          all_received_amount_a: apiData.all_received_amount_a,
          remaining_amount_a: apiData.remaining_amount_a,
          extra_paid_a: apiData.extra_paid_a,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    PenddingAmount();
    handleGetAllDataBooking();
  }, []);

  const renderCustomers = (row) => row.customers.map((c, idx) => (
    <div key={idx} style={{ marginBottom: '5px' }}>
      <strong>{c.name}</strong><br />
      <span>{c.number}</span>
    </div>
  ));

  const handlePasswordSubmit = async (password) => {
    try {
      const res = await api.post(`/users/passwordb`, {
        user_id: userData?.user_id,
        password_b: password
      });
      if (res.data.success) {
        setShowAmountB(true);
        setShowPasswordModal(false);
        setErrors(null);
      } else {
        setErrors(res.data.message || 'Invalid password');
      }
    } catch (error) {
      setErrors('Server error');
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

              {/* ══════════════════════════════════════
                  CARD HEADER — theme gradient (same as BookingTable)
              ══════════════════════════════════════ */}
              <Card.Header className="project-header">

                {/* Row 1: Title + Stats */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

                  {/* Title — always white */}
                  <h5
                    className="project-title mb-0"
                    style={{ color: "#ffffff", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.03em" }}
                  >
                    Plot Details&nbsp;
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
                      {data.length}
                    </span>
                  </h5>

                  {/* Stats cards */}
                  <div className="d-flex gap-2 flex-wrap">
                    {/* Total Amount */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      borderRadius: "10px",
                      padding: "4px 12px",
                      backdropFilter: "blur(8px)",
                    }}>
                      <span style={{ fontSize: "13px" }}>💰</span>
                      <div style={{ lineHeight: 1.2 }}>
                        <div style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Total</div>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>₹{formatAmount(RemainingAmount?.booking_amount_a)}</div>
                      </div>
                    </div>

                    {/* Received Amount */}
                    {RemainingAmount?.total_all_received_amount_a > 0 && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        background: "rgba(16,185,129,0.20)",
                        border: "1px solid rgba(16,185,129,0.35)",
                        borderRadius: "10px",
                        padding: "4px 12px",
                        backdropFilter: "blur(8px)",
                      }}>
                        <span style={{ fontSize: "13px" }}>✅</span>
                        <div style={{ lineHeight: 1.2 }}>
                          <div style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Received</div>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#6ee7b7" }}>₹{formatAmount(RemainingAmount.total_all_received_amount_a)}</div>
                        </div>
                      </div>
                    )}

                    {/* Remaining Amount */}
                    {RemainingAmount?.extra_paid_a === 0 && RemainingAmount?.remaining_amount_a !== undefined && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        background: "rgba(239,68,68,0.18)",
                        border: "1px solid rgba(239,68,68,0.32)",
                        borderRadius: "10px",
                        padding: "4px 12px",
                        backdropFilter: "blur(8px)",
                      }}>
                        <span style={{ fontSize: "13px" }}>⏳</span>
                        <div style={{ lineHeight: 1.2 }}>
                          <div style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Remaining</div>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#fca5a5" }}>₹{formatAmount(RemainingAmount?.remaining_amount_a || 0)}</div>
                        </div>
                      </div>
                    )}

                    {/* Extra Paid */}
                    {RemainingAmount?.extra_paid_a > 0 && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        background: "rgba(251,146,60,0.20)",
                        border: "1px solid rgba(251,146,60,0.35)",
                        borderRadius: "10px",
                        padding: "4px 12px",
                        backdropFilter: "blur(8px)",
                      }}>
                        <span style={{ fontSize: "13px" }}>⚠️</span>
                        <div style={{ lineHeight: 1.2 }}>
                          <div style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Extra Paid</div>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#fbbf24" }}>₹{formatAmount(RemainingAmount?.extra_paid_a)}</div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </Card.Header>

              {/* ══════════════════════════════════════
                  CARD BODY
              ══════════════════════════════════════ */}
              <Card.Body className="card-body-p0">

                {/* ── Desktop Table ── */}
                <table className="project-table-desktop d-none d-md-table">
                  <thead>
                    <tr>
                      {filteredColumns.map((col, idx) => (
                        <th key={idx} className="table-header-cell">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, index) => (
                      <tr key={index} className="table-row-clickable">
                        {/* # */}
                        <td className="table-sno-cell">{index + 1}</td>

                        {/* User */}
                        <td className={row.krutiDev_font == 1 ? 'kruti-dev' : ''}>
                          {renderCustomers(row)}
                        </td>

                        {/* Project */}
                        <td className={row.project_font == 1 ? 'kruti-dev' : ''}>
                          {row.project_name}
                        </td>

                        {/* Sec/Plot */}
                        <td className={row.project_font == 1 ? 'kruti-dev' : ''}>
                          <div style={{ fontWeight: 500 }}>{row.sector_name}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{row.plot_no}</div>
                        </td>

                        {/* Sq/F Rate */}
                        <td>
                          <span className="rate-chip rate-chip-sqf">{row.square_feet_rate}</span>
                        </td>

                        {/* Booking Amt */}
                        <td style={{ fontWeight: 600 }}>
                          ₹{formatAmount(row.booking_amount)}
                        </td>

                        {/* Total Amt */}
                        <td style={{ fontWeight: 600 }}>
                          ₹{formatAmount(row.amount_a)}
                        </td>

                        {/* Mode */}
                        <td>
                          <span className="status-badge status-badge-default">
                            {row.payment_mode}
                          </span>
                        </td>

                        {/* Ref */}
                        <td
                          style={{
                            maxWidth: 160,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={row.reference_name || ''}
                        >
                          {getRefPreview(row.reference_name, 40)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ── Mobile Table ── */}
                <div className="project-table-mobile-wrap d-md-none">
                  <table className="project-table-mobile">
                    <thead>
                      <tr>
                        <th className="mobile-table-header">User/Project/Sector/P no</th>
                        <th className="mobile-table-header">Sq/F B-Amt</th>
                        <th className="mobile-table-header">Amt</th>
                        <th className="mobile-table-header">Pen Amt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="mobile-table-row">
                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <div className={row.krutiDev_font == 1 ? 'kruti-dev' : ''}>
                              {renderCustomers(row)}
                            </div>
                            <div className={row.project_font == 1 ? 'kruti-dev' : ''} style={{ fontSize: "12px" }}>
                              {row.project_name}
                            </div>
                            <div className={row.project_font == 1 ? 'kruti-dev' : ''} style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                              {row.sector_name} / {row.plot_no}
                            </div>
                          </td>
                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <div>Sq/F: <strong>{row.square_feet_rate}</strong></div>
                            <div>B-Amt: <strong>₹{formatAmount(row.booking_amount)}</strong></div>
                          </td>
                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            <div>Total: <strong>₹{formatAmount(row.amount_a)}</strong></div>
                            {showAmountB && (
                              <div>Pen: <strong>₹{formatAmount(row.amount_b)}</strong></div>
                            )}
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                              {row.payment_mode}
                            </div>
                          </td>
                          <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                            {showAmountB && (
                              <div>Pen: <strong>₹{formatAmount(remaining_amount_b)}</strong></div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </Card.Body>

              {/* ── Back Button ── */}
              <div className="px-3 py-3 text-start border-top">
                
              </div>

            </Card>
          </div>
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

export default SinglePlot;