import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Table, Modal, Button, Form, Dropdown, Spinner } from 'react-bootstrap';
import { FaUserTie, FaPhone, FaPlus, FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import { ReactTransliterate } from 'react-transliterate';
import api from 'utils/api';
import ModernPagination from 'components/Pagination';
import LogoutModel from 'layouts/AdminLayout/NavBar/NavRight/LogoutModel';
import '../projects/table.css';
import '../style.css';

const BrokerTable = () => {
  const navigate = useNavigate();

  const handleBrokerBookingsClick = (broker) => {
    navigate(`/bookings?broker_id=${broker.broker_id}&broker_name=${encodeURIComponent(broker.broker_name || '')}`, {
      state: {
        broker_id: broker.broker_id,
        broker_name: broker.broker_name
      }
    });
  };

  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLang, setSearchLang] = useState('hi_mangal');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State for Add / Edit
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [brokerName, setBrokerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isKrutiDev, setIsKrutiDev] = useState(false);
  const [inputLang, setInputLang] = useState('hi_mangal');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  // Theme state for Light / Dark Mode support
  const [isDark, setIsDark] = useState(() => 
    typeof document !== 'undefined' && 
    (document.body.classList.contains('dark-theme') || localStorage.getItem('theme') === 'dark')
  );

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.body.classList.contains('dark-theme') || localStorage.getItem('theme') === 'dark');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', checkTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', checkTheme);
    };
  }, []);

  // Modal Dynamic Theme Palette
  const modalStyles = {
    cardBg: isDark ? '#162338' : '#ffffff',
    cardBorder: isDark ? '1px solid rgba(201, 168, 76, 0.25)' : '1px solid #cbd5e1',
    cardShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 50px rgba(0, 0, 0, 0.15)',
    headerBorder: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
    titleColor: isDark ? '#ffffff' : '#0f172a',
    closeColor: isDark ? 'rgba(255,255,255,0.65)' : '#64748b',
    labelColor: isDark ? 'rgba(255,255,255,0.9)' : '#1e293b',
    subtextColor: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
    inputBg: isDark ? '#0d1826' : '#ffffff',
    inputBorder: isDark ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid #cbd5e1',
    inputText: isDark ? '#ffffff' : '#0f172a',
    placeholderColor: isDark ? '#cbd5e1' : '#64748b',
    selectBg: isDark ? '#1b2d45' : '#f8fafc',
    selectBorder: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
    selectText: isDark ? '#ffffff' : '#0f172a',
    boxBg: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
    boxBorder: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
    cancelBg: isDark ? '#1b2d45' : '#f1f5f9',
    cancelBorder: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid #cbd5e1',
    cancelText: isDark ? '#ffffff' : '#334155'
  };

  const userData = JSON.parse(localStorage.getItem('users')) || {};

  // Fetch Brokers from backend API
  const fetchBrokers = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 [BrokerTable] Requesting /broker/list with params:', {
        page,
        limit,
        search: searchQuery.trim(),
        token: userData?.user_token ? 'Present' : 'Missing'
      });

      const res = await api.get('/broker/list', {
        headers: {
          Authorization: userData.user_token
        },
        params: {
          page,
          limit,
          search: searchQuery.trim()
        }
      });

      console.log('✅ [BrokerTable] Full API Response:', res);
      console.log('📊 [BrokerTable] res.data:', res.data);
      console.log('📋 [BrokerTable] Brokers List (res.data.data):', res.data?.data);
      console.log('📄 [BrokerTable] Pagination (res.data.pagination):', res.data?.pagination);

      if (res.data?.success) {
        setBrokers(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('❌ [BrokerTable] Error fetching brokers:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, userData.user_token]);

  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  useEffect(() => {
    console.log('📌 [BrokerTable] Current brokers state updated:', brokers);
  }, [brokers]);

  // Open Add Broker Modal
  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedBroker(null);
    setBrokerName('');
    setPhoneNumber('');
    setAddress('');
    setIsKrutiDev(false);
    setFormError('');
    setShowFormModal(true);
  };

  // Open Edit Broker Modal
  const handleOpenEdit = (broker) => {
    setModalMode('edit');
    setSelectedBroker(broker);
    setBrokerName(broker.broker_name || '');
    setPhoneNumber(broker.phone_number || '');
    setAddress(broker.address || '');
    setIsKrutiDev(Number(broker.kruti_brokers_font) === 1);
    setFormError('');
    setShowFormModal(true);
  };

  // Submit Add or Edit
  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!brokerName.trim()) {
      setFormError('Broker name is required!');
      return;
    }

    if (!phoneNumber.trim()) {
      setFormError('Phone number is required!');
      return;
    }

    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number!');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError('');

      const payload = {
        broker_name: brokerName.trim(),
        phone_number: phoneNumber.trim(),
        address: address.trim(),
        kruti_brokers_font: isKrutiDev ? 1 : 0
      };

      let res;
      if (modalMode === 'add') {
        res = await api.post('/broker/add', payload, {
          headers: { Authorization: userData.user_token }
        });
      } else {
        res = await api.put(`/broker/update/${selectedBroker.broker_id}`, payload, {
          headers: { Authorization: userData.user_token }
        });
      }

      if (res.data?.success) {
        setShowFormModal(false);
        fetchBrokers();
      } else {
        setFormError(res.data?.message || 'Action failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async (id) => {
    const targetId = id || deleteId;
    if (!targetId) return;

    try {
      const res = await api.delete(`/broker/delete/${targetId}`, {
        headers: { Authorization: userData.user_token }
      });
      if (res.data?.success) {
        setShowDeleteModal(false);
        setDeleteId(null);
        fetchBrokers();
      }
    } catch (err) {
      console.error('Error deleting broker:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <div className="project-table-card">
            <Card className="card">
              {/* Header */}
              <Card.Header className="project-header borderless">
                <style>{`
                  .project-header h5::after,
                  .project-header .project-title::after {
                    display: none !important;
                    content: none !important;
                  }
                `}</style>
                {/* Desktop View */}
                <div className="d-none d-md-flex justify-content-between align-items-center flex-wrap gap-2 w-100">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #c9a84c, #b8963a)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#0b1426', fontSize: '18px', fontWeight: 'bold'
                    }}>
                      <FaUserTie />
                    </div>
                    <h5 className="project-title mb-0" style={{ color: '#ffffff', fontWeight: 800, fontSize: '18px' }}>
                      Brokers Management &nbsp;
                      <span style={{
                        background: 'rgba(255,255,255,0.22)',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        borderRadius: '20px',
                        padding: '3px 10px',
                        border: '1px solid rgba(255,255,255,0.35)',
                        display: 'inline-block',
                        verticalAlign: 'middle'
                      }}>
                        {totalCount}
                      </span>
                    </h5>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {/* Limit Selector */}
                    <Dropdown>
                      <Dropdown.Toggle className="limit-toggle" style={{ height: '36px', padding: '0 12px' }}>
                        {limit} <span className="limit-chevron">▾</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="limit-menu">
                        {[10, 25, 50, 100].map((val) => (
                          <div
                            key={val}
                            className={`limit-item${limit === val ? ' active' : ''}`}
                            onClick={() => { setLimit(val); setPage(1); }}
                          >
                            {val}
                          </div>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>

                    {/* Language Switcher */}
                    <select
                      className="custom-select"
                      style={{ width: '130px', height: '36px' }}
                      value={searchLang}
                      onChange={(e) => {
                        setSearchLang(e.target.value);
                        setSearchQuery('');
                      }}
                    >
                      <option value="hi_mangal">Hindi (Mangal)</option>
                      <option value="en">English</option>
                    </select>

                    {/* Search Input */}
                    <div className="search-wrap" style={{ minWidth: '220px', position: 'relative' }}>
                      <i className="feather icon-search search-icon" />
                      {searchLang === 'hi_mangal' ? (
                        <ReactTransliterate
                          value={searchQuery}
                          onChangeText={(value) => {
                            setSearchQuery(value);
                            setPage(1);
                          }}
                          lang="hi"
                          placeholder="Search broker / address..."
                          renderComponent={(props) => (
                            <input
                              {...props}
                              className="search-input"
                              style={{ width: '100%', padding: '8px 28px 8px 12px', border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: 'var(--text-primary)' }}
                            />
                          )}
                        />
                      ) : (
                        <input
                          className="search-input"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                          }}
                          placeholder="Search broker / address..."
                          style={{ width: '100%', padding: '8px 28px 8px 12px', border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: 'var(--text-primary)' }}
                        />
                      )}
                      {searchQuery && (
                        <span
                          onClick={() => {
                            setSearchQuery('');
                            setPage(1);
                          }}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: 'var(--text-muted)',
                            zIndex: 2,
                            padding: '2px 4px'
                          }}
                        >
                          ✕
                        </span>
                      )}
                    </div>

                    {/* Add Broker Button */}
                    <button
                      className="btn-add"
                      onClick={handleOpenAdd}
                      style={{
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0 16px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #c9a84c, #b8963a)',
                        color: '#0b1426',
                        fontWeight: 700,
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <FaPlus /> Add Broker
                    </button>
                  </div>
                </div>

                {/* Mobile View Header */}
                <div className="d-md-none broker-mobile-header">
                  {/* Row 1: Title & Total Count (Left), Add Button (Right) */}
                  <div className="broker-mobile-row-1">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #c9a84c, #b8963a)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0b1426',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        <FaUserTie />
                      </div>
                      <h5 className="project-title mb-0" style={{ color: '#ffffff', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em' }}>
                        Brokers&nbsp;
                        <span style={{
                          background: 'rgba(255,255,255,0.22)',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 700,
                          borderRadius: '20px',
                          padding: '2px 8px',
                          border: '1px solid rgba(255,255,255,0.35)',
                          display: 'inline-block',
                          verticalAlign: 'middle'
                        }}>
                          {totalCount}
                        </span>
                      </h5>
                    </div>

                    {/* Add Button */}
                    <button
                      className="btn-add"
                      onClick={handleOpenAdd}
                      style={{
                        height: '32px',
                        padding: '0 14px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #c9a84c, #b8963a)',
                        color: '#0b1426',
                        fontWeight: 700,
                        fontSize: '12px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        flexShrink: 0
                      }}
                    >
                      <FaPlus size={11} /> Add
                    </button>
                  </div>

                  {/* Row 2: Full-width Search Input */}
                  <div
                    className="search-wrap search-wrap-full broker-mobile-search"
                    style={{
                      height: '36px',
                      maxHeight: '36px',
                      minHeight: '36px',
                      flex: 'none',
                      position: 'relative',
                      width: '100%',
                      margin: 0
                    }}
                  >
                    <i className="feather icon-search search-icon" style={{ fontSize: '13px', position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', zIndex: 3 }} />
                    {searchLang === 'hi_mangal' ? (
                      <ReactTransliterate
                        value={searchQuery}
                        onChangeText={(value) => {
                          setSearchQuery(value);
                          setPage(1);
                        }}
                        lang="hi"
                        placeholder="Search broker / address..."
                        renderComponent={(props) => (
                          <input
                            {...props}
                            className="search-input"
                            style={{
                              width: '100%',
                              height: '36px',
                              padding: '6px 28px 6px 34px',
                              border: 'none',
                              outline: 'none',
                              background: 'transparent',
                              fontSize: '13px',
                              color: 'var(--text-primary)'
                            }}
                          />
                        )}
                      />
                    ) : (
                      <input
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Search broker / address..."
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '6px 28px 6px 34px',
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          fontSize: '13px',
                          color: 'var(--text-primary)'
                        }}
                      />
                    )}
                    {searchQuery && (
                      <span
                        onClick={() => {
                          setSearchQuery('');
                          setPage(1);
                        }}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          zIndex: 3,
                          padding: '2px 4px'
                        }}
                      >
                        ✕
                      </span>
                    )}
                  </div>

                  {/* Row 3: Language Select (Left) & Page Limit (Right) */}
                  <div
                    className="broker-mobile-controls"
                    style={{
                      display: 'flex',
                      gap: '8px',
                      width: '100%',
                      alignItems: 'center',
                      flex: 'none',
                      height: '34px',
                      marginTop: 0
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <select
                        className="custom-select"
                        style={{ width: '100%', height: '34px', fontSize: '12px' }}
                        value={searchLang}
                        onChange={(e) => {
                          setSearchLang(e.target.value);
                          setSearchQuery('');
                          setPage(1);
                        }}
                      >
                        <option value="en">English</option>
                        <option value="hi_mangal">Hindi (Mangal)</option>
                      </select>
                    </div>

                    <div style={{ width: '72px', flexShrink: 0 }}>
                      <select
                        className="custom-select"
                        style={{
                          width: '100%',
                          height: '34px',
                          fontSize: '12px',
                          padding: '0 6px',
                          fontWeight: 600,
                          textAlign: 'center'
                        }}
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1);
                        }}
                      >
                        {[10, 25, 50, 100].map((val) => (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </Card.Header>

              {/* Table Body */}
              <Card.Body className="card-body-p0">
                {/* ── Desktop Table ── */}
                <table className="project-table-desktop d-none d-md-table">
                  <thead>
                    <tr>
                      <th className="table-header-cell" style={{ width: '50px', textAlign: 'center' }}>#</th>
                      <th className="table-header-cell">BROKER NAME</th>
                      <th className="table-header-cell">PHONE NUMBER</th>
                      <th className="table-header-cell">ADDRESS</th>
                      <th className="table-header-cell" style={{ textAlign: 'center' }}>TOTAL BOOKINGS</th>
                      <th className="table-header-cell">CREATED DATE</th>
                      <th className="table-header-cell" style={{ width: '110px', textAlign: 'center' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <Spinner animation="border" size="sm" variant="warning" className="me-2" />
                          <span style={{ color: 'rgba(255,255,255,0.7)' }}>Loading brokers...</span>
                        </td>
                      </tr>
                    ) : brokers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                            No brokers found
                          </div>
                        </td>
                      </tr>
                    ) : (
                      brokers.map((broker, idx) => {
                        const sNo = (page - 1) * limit + idx + 1;
                        const isKruti = Number(broker.kruti_brokers_font) === 1;

                        return (
                          <tr key={broker.broker_id} className="table-row-clickable">
                            <td className="table-sno-cell" style={{ textAlign: 'center' }}>
                              {sNo}
                            </td>

                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className={`${isKruti ? 'kruti-dev' : ''} table-name-cell`}
                                  style={{
                                    fontSize: isKruti ? '16px' : '13.5px',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)'
                                  }}
                                >
                                  {broker.broker_name}
                                </span>

                                {isKruti && (
                                  <span style={{
                                    fontSize: '10px',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    background: 'rgba(201, 168, 76, 0.15)',
                                    color: '#c9a84c',
                                    border: '1px solid rgba(201, 168, 76, 0.3)'
                                  }}>
                                    Kruti Dev
                                  </span>
                                )}
                              </div>
                            </td>

                            <td style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                              {broker.phone_number ? (
                                <span className="d-inline-flex align-items-center gap-1">
                                  <FaPhone size={11} style={{ color: '#c9a84c' }} />
                                  {broker.phone_number}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>-</span>
                              )}
                            </td>

                            <td className="table-address-cell" style={{ color: 'var(--text-secondary)', maxWidth: '240px' }}>
                              {broker.address ? (
                                <span
                                  title={broker.address}
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    wordBreak: 'break-word',
                                    lineHeight: 1.4
                                  }}
                                >
                                  <FaMapMarkerAlt size={10} style={{ color: '#c9a84c', marginRight: '4px' }} />
                                  {broker.address}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>-</span>
                              )}
                            </td>

                            <td style={{ textAlign: 'center' }}>
                              <span
                                onClick={() => handleBrokerBookingsClick(broker)}
                                title={`ब्रोकर "${broker.broker_name}" की बुकिंग्स देखें`}
                                style={{
                                  background: Number(broker.total_bookings) > 0 ? 'rgba(34, 197, 94, 0.15)' : 'var(--accent-soft)',
                                  color: Number(broker.total_bookings) > 0 ? '#16a34a' : 'var(--text-muted)',
                                  border: Number(broker.total_bookings) > 0 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border)',
                                  borderRadius: '20px',
                                  padding: '3px 12px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  display: 'inline-block',
                                  minWidth: '36px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.08)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.25)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                {broker.total_bookings || 0}
                              </span>
                            </td>

                            <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                              {formatDate(broker.created_at)}
                            </td>

                            <td style={{ textAlign: 'center' }}>
                              <div className="d-flex justify-content-center align-items-center gap-2">
                                <button
                                  onClick={() => handleOpenEdit(broker)}
                                  title="Edit Broker"
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(201, 168, 76, 0.3)',
                                    background: 'rgba(201, 168, 76, 0.1)',
                                    color: '#c9a84c',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <FaEdit size={12} />
                                </button>

                                <button
                                  onClick={() => {
                                    setDeleteId(broker.broker_id);
                                    setShowDeleteModal(true);
                                  }}
                                  title="Delete Broker"
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <FaTrash size={11} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* ── Mobile Responsive Table ── */}
                <div className="project-table-mobile-wrap d-md-none" style={{ width: '100%', overflowX: 'auto' }}>
                  <table className="project-table-mobile broker-mobile-table" style={{ width: '100%', minWidth: '320px', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '30px' }} />
                      <col style={{ width: 'calc(100% - 176px)' }} />
                      <col style={{ width: '70px' }} />
                      <col style={{ width: '76px' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="mobile-table-header text-center" style={{ padding: '9px 4px', background: '#1b2d45', color: '#c9a84c', borderBottom: '1px solid rgba(201, 168, 76, 0.25)' }}>#</th>
                        <th className="mobile-table-header" style={{ padding: '9px 6px', background: '#1b2d45', color: '#c9a84c', borderBottom: '1px solid rgba(201, 168, 76, 0.25)' }}>BROKER</th>
                        <th className="mobile-table-header text-center" style={{ padding: '9px 4px', background: '#1b2d45', color: '#c9a84c', borderBottom: '1px solid rgba(201, 168, 76, 0.25)' }}>BOOKINGS</th>
                        <th className="mobile-table-header text-center" style={{ padding: '9px 4px', background: '#1b2d45', color: '#c9a84c', borderBottom: '1px solid rgba(201, 168, 76, 0.25)' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                            <Spinner animation="border" size="sm" variant="warning" className="me-2" />
                            Loading...
                          </td>
                        </tr>
                      ) : brokers.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                            No brokers found
                          </td>
                        </tr>
                      ) : (
                        brokers.map((broker, idx) => {
                          const sNo = (page - 1) * limit + idx + 1;
                          const isKruti = Number(broker.kruti_brokers_font) === 1;

                          return (
                            <tr key={broker.broker_id} className="mobile-table-row">
                              <td className="mobile-table-cell text-center" style={{ color: 'var(--text-muted)', fontSize: '11px', padding: '10px 2px', verticalAlign: 'top' }}>
                                {sNo}
                              </td>

                              <td className="mobile-table-cell" style={{ padding: '10px 6px', verticalAlign: 'top', overflow: 'hidden' }}>
                                <div className="d-flex align-items-center gap-1 flex-wrap">
                                  <span
                                    className={`mobile-name ${isKruti ? 'kruti-dev' : ''}`}
                                    style={{
                                      fontSize: isKruti ? '15px' : '13.5px',
                                      color: 'var(--text-primary)',
                                      fontWeight: 600,
                                      wordBreak: 'break-word',
                                      lineHeight: 1.3
                                    }}
                                  >
                                    {broker.broker_name}
                                  </span>
                                  {isKruti && (
                                    <span style={{
                                      fontSize: '9px',
                                      padding: '0 4px',
                                      borderRadius: '3px',
                                      background: 'rgba(201, 168, 76, 0.15)',
                                      color: '#c9a84c'
                                    }}>
                                      KD
                                    </span>
                                  )}
                                </div>

                                {broker.phone_number && (
                                  <div style={{ marginTop: '3px' }}>
                                    <a
                                      href={`tel:${broker.phone_number}`}
                                      style={{
                                        color: '#c9a84c',
                                        fontSize: '11.5px',
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontWeight: 500
                                      }}
                                    >
                                      <FaPhone size={9} /> {broker.phone_number}
                                    </a>
                                  </div>
                                )}

                                {broker.address && (
                                  <div style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '11px',
                                    marginTop: '2px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '3px',
                                    wordBreak: 'break-word',
                                    lineHeight: 1.3
                                  }}>
                                    <FaMapMarkerAlt size={9} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
                                    <span>{broker.address}</span>
                                  </div>
                                )}

                                {broker.created_at && (
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
                                    {formatDate(broker.created_at)}
                                  </div>
                                )}
                              </td>

                              <td className="mobile-table-cell text-center" style={{ padding: '10px 4px', verticalAlign: 'middle' }}>
                                <span
                                  onClick={() => handleBrokerBookingsClick(broker)}
                                  title={`View ${broker.total_bookings || 0} bookings for ${broker.broker_name}`}
                                  style={{
                                    background: Number(broker.total_bookings) > 0 ? 'rgba(34, 197, 94, 0.16)' : 'var(--accent-soft)',
                                    color: Number(broker.total_bookings) > 0 ? '#16a34a' : 'var(--text-muted)',
                                    border: Number(broker.total_bookings) > 0 ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid var(--border)',
                                    borderRadius: '14px',
                                    padding: '3px 8px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    display: 'inline-block',
                                    minWidth: '32px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {broker.total_bookings || 0}
                                </span>
                              </td>

                              <td className="mobile-table-cell text-center" style={{ padding: '10px 4px', verticalAlign: 'middle' }}>
                                <div className="d-flex justify-content-center align-items-center gap-1">
                                  <button
                                    onClick={() => handleOpenEdit(broker)}
                                    title="Edit Broker"
                                    style={{
                                      width: '30px', height: '30px', borderRadius: '6px',
                                      border: '1px solid rgba(201, 168, 76, 0.3)',
                                      background: 'rgba(201, 168, 76, 0.12)',
                                      color: '#c9a84c', cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                  >
                                    <FaEdit size={12} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteId(broker.broker_id);
                                      setShowDeleteModal(true);
                                    }}
                                    title="Delete Broker"
                                    style={{
                                      width: '30px', height: '30px', borderRadius: '6px',
                                      border: '1px solid rgba(239, 68, 68, 0.3)',
                                      background: 'rgba(239, 68, 68, 0.12)',
                                      color: '#ef4444', cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                  >
                                    <FaTrash size={11} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card.Body>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-3">
                  <ModernPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => setPage(p)}
                  />
                </div>
              )}
            </Card>
          </div>
        </Col>
      </Row>

      {/* ─── ADD / EDIT BROKER MODAL ───────────────────────── */}
      <Modal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        centered
        backdrop="static"
        contentClassName="broker-modal-content border-0 bg-transparent p-0 shadow-none"
      >
        <div style={{
          background: modalStyles.cardBg,
          borderRadius: '16px',
          border: modalStyles.cardBorder,
          overflow: 'hidden',
          boxShadow: modalStyles.cardShadow
        }}>
          {/* Custom style for high contrast placeholders, transparent outer modal, and focus */}
          <style>{`
            .broker-modal-content {
              background: transparent !important;
              background-color: transparent !important;
              border: none !important;
              box-shadow: none !important;
            }
            .broker-modal-input::placeholder,
            input.broker-modal-input::placeholder,
            textarea.broker-modal-input::placeholder {
              color: ${modalStyles.placeholderColor} !important;
              -webkit-text-fill-color: ${modalStyles.placeholderColor} !important;
              opacity: 1 !important;
              font-weight: 400 !important;
            }
            .broker-modal-input::-webkit-input-placeholder,
            input.broker-modal-input::-webkit-input-placeholder,
            textarea.broker-modal-input::-webkit-input-placeholder {
              color: ${modalStyles.placeholderColor} !important;
              -webkit-text-fill-color: ${modalStyles.placeholderColor} !important;
              opacity: 1 !important;
              font-weight: 400 !important;
            }
            .broker-modal-input::-moz-placeholder,
            input.broker-modal-input::-moz-placeholder,
            textarea.broker-modal-input::-moz-placeholder {
              color: ${modalStyles.placeholderColor} !important;
              opacity: 1 !important;
              font-weight: 400 !important;
            }
            .broker-modal-input:-ms-input-placeholder,
            input.broker-modal-input:-ms-input-placeholder,
            textarea.broker-modal-input:-ms-input-placeholder {
              color: ${modalStyles.placeholderColor} !important;
              opacity: 1 !important;
            }
            .broker-modal-input:focus {
              border-color: #c9a84c !important;
              box-shadow: 0 0 0 2px rgba(201, 168, 76, 0.25) !important;
              outline: none !important;
            }
          `}</style>

          {/* Modal Header */}
          <div style={{
            padding: '18px 24px',
            borderBottom: modalStyles.headerBorder,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #c9a84c, #b8963a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#0b1426', fontSize: '15px'
              }}>
                <FaUserTie />
              </div>
              <h5 style={{ margin: 0, color: modalStyles.titleColor, fontWeight: 700, fontSize: '17px' }}>
                {modalMode === 'add' ? 'Add Broker' : 'Edit Broker'}
              </h5>
            </div>
            <button
              onClick={() => setShowFormModal(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: modalStyles.closeColor,
                fontSize: '20px',
                cursor: 'pointer',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '24px' }}>
            {formError && (
              <div style={{
                background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fca5a5',
                color: isDark ? '#f87171' : '#b91c1c',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '13px'
              }}>
                {formError}
              </div>
            )}

            <Form onSubmit={handleFormSubmit}>
              {/* Language selector for Broker Name */}
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Label style={{ color: modalStyles.labelColor, fontSize: '13px', fontWeight: 600, margin: 0 }}>
                  Broker Name <span style={{ color: '#ef4444' }}>*</span>
                </Form.Label>
                <div className="d-flex align-items-center gap-1">
                  <span style={{ fontSize: '11px', color: modalStyles.subtextColor }}>Typing:</span>
                  <select
                    value={inputLang}
                    onChange={(e) => setInputLang(e.target.value)}
                    style={{
                      background: modalStyles.selectBg,
                      color: modalStyles.selectText,
                      border: modalStyles.selectBorder,
                      borderRadius: '4px',
                      fontSize: '11px',
                      padding: '2px 6px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="en">English</option>
                    <option value="hi_mangal">Hindi (Mangal)</option>
                  </select>
                </div>
              </div>

              {/* Input for Broker Name */}
              <div className="mb-3">
                {inputLang === 'hi_mangal' ? (
                  <ReactTransliterate
                    value={brokerName}
                    onChangeText={(val) => setBrokerName(val)}
                    lang="hi"
                    placeholder="e.g. Rahul Sharma"
                    renderComponent={(props) => (
                      <input
                        {...props}
                        placeholder="e.g. Rahul Sharma"
                        className={`form-control broker-modal-input ${isKrutiDev ? 'kruti-dev' : ''}`}
                        style={{
                          background: modalStyles.inputBg,
                          border: modalStyles.inputBorder,
                          color: modalStyles.inputText,
                          borderRadius: '8px',
                          padding: '10px 14px',
                          fontSize: isKrutiDev ? '16px' : '14px'
                        }}
                      />
                    )}
                  />
                ) : (
                  <Form.Control
                    type="text"
                    value={brokerName}
                    onChange={(e) => setBrokerName(e.target.value)}
                    placeholder="Enter broker name"
                    className={`broker-modal-input ${isKrutiDev ? 'kruti-dev' : ''}`}
                    style={{
                      background: modalStyles.inputBg,
                      border: modalStyles.inputBorder,
                      color: modalStyles.inputText,
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: isKrutiDev ? '16px' : '14px'
                    }}
                  />
                )}
              </div>

              {/* Phone Number */}
              <Form.Group className="mb-3">
                <Form.Label style={{ color: modalStyles.labelColor, fontSize: '13px', fontWeight: 600 }}>
                  Phone Number <span style={{ color: '#ef4444' }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  maxLength="15"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="broker-modal-input"
                  style={{
                    background: modalStyles.inputBg,
                    border: modalStyles.inputBorder,
                    color: modalStyles.inputText,
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '14px'
                  }}
                />
                <small style={{ fontSize: '11px', color: modalStyles.subtextColor, marginTop: '3px', display: 'block' }}>
                  * Mobile number must be unique
                </small>
              </Form.Group>

              {/* Address Field */}
              <Form.Group className="mb-3">
                <Form.Label style={{ color: modalStyles.labelColor, fontSize: '13px', fontWeight: 600 }}>
                  Address
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House No. 12, Gandhi Nagar, Jaipur"
                  className="broker-modal-input"
                  style={{
                    background: modalStyles.inputBg,
                    border: modalStyles.inputBorder,
                    color: modalStyles.inputText,
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '14px'
                  }}
                />
              </Form.Group>

              {/* Kruti Dev Font Checkbox */}
              <div className="mb-3" style={{
                background: modalStyles.boxBg,
                padding: '10px 14px',
                borderRadius: '8px',
                border: modalStyles.boxBorder
              }}>
                <Form.Check
                  type="checkbox"
                  id="kruti-font-checkbox"
                  checked={isKrutiDev}
                  onChange={(e) => setIsKrutiDev(e.target.checked)}
                  label={
                    <span style={{ fontSize: '13px', color: modalStyles.labelColor, cursor: 'pointer' }}>
                      Kruti Dev 010 Font?
                      <span style={{ display: 'block', fontSize: '11px', color: modalStyles.subtextColor }}>
                        Check this if the name was typed in Kruti Dev font
                      </span>
                    </span>
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowFormModal(false)}
                  style={{
                    background: modalStyles.cancelBg,
                    border: modalStyles.cancelBorder,
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: modalStyles.cancelText
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={formSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, #c9a84c, #b8963a)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0b1426',
                    boxShadow: '0 4px 12px rgba(201, 168, 76, 0.3)'
                  }}
                >
                  {formSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-1" /> Saving...
                    </>
                  ) : modalMode === 'add' ? (
                    'Add Broker'
                  ) : (
                    'Update Broker'
                  )}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Modal>

      {/* ─── DELETE CONFIRMATION MODAL ───────────────────────── */}
      {showDeleteModal && (
        <LogoutModel
          projectId={deleteId}
          setShowModal={setShowDeleteModal}
          handleFun={handleDeleteConfirm}
          title="Confirm Delete Broker"
          subtitle="Are you sure you want to delete this broker?"
          btnText="Delete"
        />
      )}
    </React.Fragment>
  );
};

export default BrokerTable;
