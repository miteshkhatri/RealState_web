// Payment_list.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Form } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from 'config/constant';
import './style.css';

const Payment_list = () => {
  const location = useLocation();
  const locationState = location.state || {};

  const initialPayments =
    Array.isArray(locationState.payments)
      ? locationState.payments
      : Array.isArray(locationState.data?.all_payments)
      ? locationState.data.all_payments
      : [];

  const [searchText, setSearchText] = useState('');
  const [payments, setPayments] = useState(initialPayments);
  const [paymentTypes, setPaymentTypes] = useState([]);

  useEffect(() => {
    setPayments(initialPayments);
  }, [locationState]);

  // -------- fetch payment modes from API (once) --------
  useEffect(() => {
    const fetchPaymentModes = async () => {
      try {
        const stored = localStorage.getItem('users') || localStorage.getItem('userData');
        const userData = stored ? JSON.parse(stored) : {};
        const token = userData?.user_token || '';

        const base = API_BASE_URL || '';

        if (!base) {
          console.warn('API_BASE_URL is not defined, skipping payment modes fetch');
          return;
        }

        const resp = await api.get(`/payment/mode`, {
          headers: token ? { Authorization: token } : {},
        });

        if (resp?.data?.success && Array.isArray(resp.data.data)) {
          const list = resp.data.data.slice().sort((a, b) =>
            (a.payment_mode || '').localeCompare(b.payment_mode || '')
          );
          setPaymentTypes(list);
        }
      } catch (err) {
        console.error('Failed to load payment modes', err);
      }
    };

    fetchPaymentModes();
  }, []);

  const formatDate = (val) => {
    if (!val) return '-';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  };

  const getPaymentModeLabel = (modeOrRow) => {
    let mode = modeOrRow;

    if (typeof modeOrRow === 'object' && modeOrRow !== null) {
      mode =
        modeOrRow.payment_mode ||
        modeOrRow.payment_mode_id ||
        modeOrRow.mode ||
        '';
    }

    const mRaw = String(mode || '').trim();
    if (!mRaw) return '-';

    const isNumeric = /^\d+$/.test(mRaw);
    if (isNumeric && paymentTypes.length > 0) {
      const found =
        paymentTypes.find(
          (p) =>
            String(p.id) === mRaw ||
            String(p.payment_mode_id || '') === mRaw ||
            String(p.mode_id || '') === mRaw
        );
      if (found) return found.payment_mode || found.name || mRaw;
    }

    if (paymentTypes.length > 0) {
      const foundByName = paymentTypes.find(
        (p) => String(p.payment_mode || '').toLowerCase() === mRaw.toLowerCase()
      );
      if (foundByName) return foundByName.payment_mode || mRaw;
    }

    return mRaw;
  };

  const showBankInfo = payments.some((r) => {
    const pm = String(r?.payment_mode || '').trim().toLowerCase();
    return (
      !!(r?.bank_name) ||
      !!(r?.branch_name) ||
      !!(r?.cheque_no) ||
      !!(r?.payment_mode) ||
      pm === '2' ||
      pm === 'cheque' ||
      pm === '3' ||
      pm === 'bank' ||
      pm === 'bank transfer'
    );
  });

  const filteredData = searchText
    ? payments.filter((row) => {
        const q = searchText.toLowerCase();
        return (
          (row.land_category || '').toString().toLowerCase().includes(q) ||
          (row.physical_possession_status || '').toString().toLowerCase().includes(q) ||
          (row.payment_a || '').toString().toLowerCase().includes(q) ||
          (row.payment_admin_entry || '').toString().toLowerCase().includes(q) ||
          (row.bank_name || '').toString().toLowerCase().includes(q) ||
          (row.branch_name || '').toString().toLowerCase().includes(q) ||
          (row.cheque_no || '').toString().toLowerCase().includes(q) ||
          (getPaymentModeLabel(row) || '').toLowerCase().includes(q)
        );
      })
    : payments;

  const columns = [
    'No.',
    'Possession',
    'Payment',
    'Consideration amount',
    'Compensation',
    'Category',
    'Date',
    'Bank Info',
  ];

  const styles = {
    headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
    searchCol: { minWidth: 200, maxWidth: 380, flex: '0 0 auto' },
    tableWrap: { maxHeight: '60vh', overflowY: 'auto', paddingTop: 0 },
    theadSticky: { position: 'sticky', top: 0, zIndex: 5, background: '#fff' },
    bankInfoBox: { lineHeight: 1.3, whiteSpace: 'normal' },
    monospace: { fontFamily: 'monospace' },
  };

  const topFont =
    (locationState && (locationState.data?.font_name ?? locationState.data?.seller_font_name)) ??
    locationState?.font_name ??
    locationState?.seller_font_name ??
    '';

  const getFontClass = (row) => {
    const fontValueFromRow =
      row?.font_name ?? row?.seller_font_name ?? row?.seller_font ?? null;

    const fontValue =
      fontValueFromRow != null && fontValueFromRow !== ''
        ? fontValueFromRow
        : topFont;

    const v = Number(fontValue);
    return v === 2 ? 'kruti-dev' : '';
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
            <Card.Header style={styles.headerRow} className='toolbar-row'>
              <Card.Title as="h5" style={{ margin: 0 }}>
                Payment List
              </Card.Title>

              <div style={styles.searchCol}>
                <Form.Group className="mb-0">
                  <Form.Control
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    maxLength={50}
                    type="text"
                    placeholder="Search by category / possession / payment / bank / branch / cheque / mode"
                  />
                </Form.Group>
              </div>
            </Card.Header>

            <Card.Body style={{ padding: '0.5rem' }}>
              <div style={styles.tableWrap}>
                <Table responsive hover className="mb-0">
                  <thead style={styles.theadSticky}>
                    <tr>
                      {columns.map((col, idx) => (
                        <th key={idx}>{col}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className="text-center">
                          No payment records found
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((row, index) => {
                        const pmLabel = getPaymentModeLabel(row);
                        const bank = row.bank_name || '';
                        const branch = row.branch_name || '';
                        const cheque = row.cheque_no || '';

                        const fontClass = getFontClass(row);

                        return (
                          <tr key={row.id || index}>
                            <td style={{ verticalAlign: 'top' }}>{index + 1}</td>

                            {/* Possession (kruti-dev added) */}
                            <td style={{ verticalAlign: 'top' }}>
                              <span className={fontClass}>
                                {row.physical_possession_status || '-'}
                              </span>

                              {row.mutation_jamabandi_girdawari ? (
                                <div style={{ marginTop: 6 }}>
                                  <small className={fontClass}>
                                    {row.mutation_jamabandi_girdawari}
                                  </small>
                                </div>
                              ) : null}
                            </td>

                            <td style={{ verticalAlign: 'top' }}>{row.payment_a ?? '-'}</td>

                            {/* Admin / Entry */}
                            <td style={{ verticalAlign: 'top' }}>
                              <span className={fontClass}>
                                {row.consideration_amount|| '-'}
                              </span>
                            </td>

                            {/* Compensation */}
                            <td style={{ verticalAlign: 'top' }}>
                              <span className={fontClass}>
                                {row.compensation_payment || '-'}
                              </span>
                            </td>

                            {/* Category */}
                            <td style={{ verticalAlign: 'top' }}>
                              <span className={fontClass}>
                                {row.land_category || '-'}
                              </span>
                            </td>

                            <td style={{ verticalAlign: 'top' }}>{formatDate(row.payment_date)}</td>

                            {/* Bank Info */}
                            <td style={{ verticalAlign: 'top' }}>
                              {(bank || branch || cheque) ? (
                                <div style={styles.bankInfoBox}>
                                  {bank ? (
                                    <div>
                                      <strong>Bank:</strong>{' '}
                                      <span className={fontClass}>{bank}</span>
                                    </div>
                                  ) : null}

                                  {branch ? (
                                    <div>
                                      <strong>Branch:</strong>{' '}
                                      <span className={fontClass}>{branch}</span>
                                    </div>
                                  ) : null}

                                  {cheque ? (
                                    <div>
                                      <strong>Cheque:</strong>{' '}
                                      <span style={styles.monospace}>{cheque}</span>
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Payment_list;
