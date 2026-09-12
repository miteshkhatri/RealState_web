import { API_BASE_URL } from 'config/constant';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Dropdown, ListGroup, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import LogoutModel from 'layouts/AdminLayout/NavBar/NavRight/LogoutModel';
import avatar2 from '../../assets/images/user/avatar-2.jpg';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import '../style.css';
import api from 'utils/api';
import ModernPagination from 'components/Pagination';
import { ReactTransliterate } from 'react-transliterate';

const Userlist = ({ data, getAllUsers, columns, title, route }) => {
  const [showModal, setShowModal] = useState(false);
  const [UserId, setUserId] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [SearchLang, setSearchLang] = useState('hi_mangal');
  const [filterRole, setFilterRole] = useState('');

  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('users'));

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleNavigate = (data) => {
    navigate('/users/add', { state: { data, mode: 'edit' } });
  };

  const handleView = (row) => {
    navigate('/users/userlistdetails', { state: { data: row } });
  };

  const handleShowModel = (id) => {
    setShowModal(true);
    setUserId(id);
  };

  const deleteUser = async () => {
    try {
      const res = await api.delete(`/user`, {
        headers: {
          Authorization: userData.user_token
        },
        params: {
          user_id: UserId
        }
      });
      getAllUsers();
      setShowModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ Updated: Show role name from API
  const getRoleBadge = (row) => {
    // First try to use user_role_name from API
    const roleName = row.user_role_name || row.role || row.role_name || 'User';
    
    // Color mapping based on role name
    const roleColorMap = {
      'admin': { color: '#ef4444', bg: '#fef2f2' },
      'manager': { color: '#f59e0b', bg: '#fffbeb' },
      'broker': { color: '#3b82f6', bg: '#eff6ff' },
      'user': { color: '#22c55e', bg: '#f0fdf4' },
    };

    // Find matching color or use default
    const lowerRole = roleName.toLowerCase();
    const colors = roleColorMap[lowerRole] || { color: '#6b7280', bg: '#f3f4f6' };

    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 600,
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.color}33`,
        letterSpacing: '0.3px',
        textTransform: 'capitalize'
      }}>
        {roleName}
      </span>
    );
  };

  // Filter data
  const filteredData = (() => {
    let base = Array.isArray(data) ? data : [];
    
    // Role filter - filter by role name or role_id
    if (filterRole) {
      base = base.filter(row => {
        const roleName = (row.user_role_name || row.role || '').toLowerCase();
        const roleId = String(row.role_id || '');
        return roleName === filterRole.toLowerCase() || roleId === filterRole;
      });
    }
    
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      base = base.filter(row => {
        const name = (row.name || '').toLowerCase();
        const mobile = (row.mobile_no || '').toLowerCase();
        const email = (row.email || '').toLowerCase();
        return name.includes(q) || mobile.includes(q) || email.includes(q);
      });
    }
    
    return base;
  })();

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const startIndex = (page - 1) * limit;
  const paginatedData = filteredData.slice(startIndex, startIndex + limit);

  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [searchQuery, filterRole]);

  // Mobile columns
  const mobileColumns = ['Img', 'User Info', 'Role', 'Action'];

  // Desktop columns - use passed columns or default
  const desktopColumns = columns || ['#', 'Profile', 'Name', 'Mobile no', 'Email', 'Role', 'Date', 'Action'];

  // ─── Action Dropdown ──────────────────────────────────────────────────────
  const ActionDropdown = ({ row }) => (
    <Dropdown
      align="end"
      className="drp-user"
      show={openDropdown === row.user_id}
      onToggle={() => setOpenDropdown(openDropdown === row.user_id ? null : row.user_id)}
    >
      <Dropdown.Toggle as="div" className="action-icon custom-action-toggle">
        <i className="feather icon-more-vertical" />
      </Dropdown.Toggle>
      <Dropdown.Menu align="end" className="profile-notification" style={{ padding: "6px", minWidth: "160px", zIndex: 990 }}>
        {/* View */}
        <div
          onClick={() => handleView(row)}
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
          <FaEye size={14} style={{ color: "var(--blue)", flexShrink: 0 }} />
          View
        </div>

        {/* Edit */}
        <div
          onClick={() => handleNavigate(row)}
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
          <FaEdit size={14} style={{ color: "var(--green)", flexShrink: 0 }} />
          Edit
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />

        {/* Delete */}
        <div
          onClick={() => handleShowModel(row.user_id)}
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
          <FaTrash size={14} style={{ color: "var(--red)", flexShrink: 0 }} />
          Delete
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );

  // ─── Limit Dropdown ──────────────────────────────────────────────────────
  const LimitDropdown = () => (
    <Dropdown>
      <Dropdown.Toggle className="limit-toggle" style={{ width: '100%', height: '36px', padding: '0 8px' }}>
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
  );

  // Inline SearchInput logic moved to render

  return (
    <React.Fragment>
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
        {title || 'Users'}&nbsp;
        <span style={{ background: "rgba(255,255,255,0.22)", color: "#ffffff", fontSize: "12px", fontWeight: 700, borderRadius: "20px", padding: "3px 10px", border: "1px solid rgba(255,255,255,0.35)", display: "inline-block", verticalAlign: "middle" }}>
          {filteredData.length}
        </span>
      </h5>

      <div className="controls-row d-flex align-items-center gap-2">
        <LimitDropdown />
        


        <select className="custom-select" style={{ width: "120px" }} value={SearchLang} onChange={(e) => { setSearchLang(e.target.value); setSearchQuery(""); }}>
          <option value="en">English</option>
          <option value="hi_mangal">Mangal</option>
          <option value="hi_kruti">Hindi</option>
        </select>

        <div className="search-wrap ">
          <i className="feather icon-search search-icon" />
          {SearchLang === 'hi_mangal' ? (
            <ReactTransliterate
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
              lang="hi"
              placeholder="Search users..."
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              maxLength={50}
              placeholder="Search users..."
            />
          )}
        </div>

        <button className="btn-add" onClick={() => navigate('/users/add')}>
          <span className="btn-add-icon">＋</span> Add
        </button>
      </div>
    </div>
  </div>

  {/* Mobile View */}
  <div className="d-md-none" style={{ width: '100%' }}>
    {/* Title & Add Button */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
      <h5 className="project-title mb-0" style={{ color: "#ffffff", fontWeight: 800, fontSize: "16px", letterSpacing: "-0.03em" }}>
        {title || 'Users'}&nbsp;
        <span style={{ background: "rgba(255,255,255,0.22)", color: "#ffffff", fontSize: "11px", fontWeight: 700, borderRadius: "20px", padding: "2px 8px", border: "1px solid rgba(255,255,255,0.35)", display: "inline-block", verticalAlign: "middle" }}>
          {filteredData.length}
        </span>
      </h5>
      <button className="btn-add" style={{ width: '75px', padding: "4px 0", fontSize: "12px", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => navigate('/users/add')}>
        <span className="btn-add-icon" style={{ fontSize: "14px", marginRight: "4px" }}>＋</span> Add
      </button>
    </div>

    {/* Search */}
    <div style={{ width: '100%', marginBottom: '10px' }}>
      <div className="search-wrap search-wrap-full">
        <i className="feather icon-search search-icon" />
        {SearchLang === 'hi_mangal' ? (
          <ReactTransliterate
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            lang="hi"
            placeholder="Search users..."
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            maxLength={50}
            placeholder="Search users..."
          />
        )}
      </div>
    </div>

    {/* Row 3: Language, Limit */}
    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', width: '100%' }}>
      <div style={{ flex: 1 }}>
        <select className="custom-select" style={{ width: '100%', height: '36px', fontSize: '12px', padding: '0 6px' }} value={SearchLang} onChange={(e) => { setSearchLang(e.target.value); setSearchQuery(""); }}>
          <option value="en">English</option>
          <option value="hi_mangal">Mangal</option>
          <option value="hi_kruti">Hindi</option>
        </select>
      </div>
      <div style={{ width: '75px' }}>
        <LimitDropdown />
      </div>
    </div>
  </div>
</Card.Header>

              {/* ══════════════════════════════════════
                  CARD BODY
              ══════════════════════════════════════ */}
              <Card.Body className="card-body-p0">

                {/* ── DESKTOP TABLE ── */}
                <table className="project-table-desktop d-none d-md-table">
                  <thead>
                    <tr>
                      {desktopColumns.map((col, i) => (
                        <th key={i} className="table-header-cell">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData && paginatedData.length > 0 ? (
                      paginatedData.map((row, index) => (
                        <tr key={row.user_id || index} className="table-row-clickable">
                          {/* # */}
                          <td className="table-sno-cell">{startIndex + index + 1}</td>

                          {/* Profile */}
                          <td>
                            <div className="img-box" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
                              <img
                                className="img-box-img"
                                src={row.image ? `${API_BASE_URL}/uploads/${row.image}` : avatar2}
                                alt={row.name || 'user'}
                                onError={(e) => {
                                  e.target.src = avatar2;
                                }}
                                style={{ borderRadius: '50%', objectFit: 'cover', width: '40px', height: '40px' }}
                              />
                            </div>
                          </td>

                          {/* Name */}
                          <td className={row.krutiDev_font == 1 ? 'kruti-dev' : ''}>
                            {row.name}
                          </td>

                          {/* Mobile no */}
                          <td>{row.mobile_no}</td>

                          {/* Email */}
                          <td>{row.email}</td>

                          {/* Role - using user_role_name from API */}
                          <td>{getRoleBadge(row)}</td>

                          {/* Date */}
                          <td style={{ whiteSpace: "nowrap" }}>
                            {formatDateTime(row.create_at)}
                          </td>

                          {/* Action */}
                          <td onClick={(e) => e.stopPropagation()}>
                            <ActionDropdown row={row} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={desktopColumns.length} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* ── MOBILE TABLE ── */}
                <div className="project-table-mobile-wrap d-md-none">
                  <table className="project-table-mobile">
                    <thead>
                      <tr>
                        {mobileColumns.map((col, i) => (
                          <th key={i} className="mobile-table-header">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData && paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => (
                          <tr key={row.user_id || index} className="mobile-table-row">
                            {/* Img */}
                            <td className="mobile-table-cell">
                              <div className="img-box" style={{ width: '32px', height: '32px', borderRadius: '50%' }}>
                                <img
                                  className="img-box-img"
                                  src={row.image ? `${API_BASE_URL}/uploads/${row.image}` : avatar2}
                                  alt={row.name || 'user'}
                                  onError={(e) => {
                                    e.target.src = avatar2;
                                  }}
                                  style={{ borderRadius: '50%', objectFit: 'cover', width: '32px', height: '32px' }}
                                />
                              </div>
                            </td>

                            {/* User Info */}
                            <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                              <div className={row.krutiDev_font == 1 ? 'kruti-dev' : ''} style={{ fontWeight: 600 }}>
                                {row.name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {row.mobile_no}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {row.email}
                              </div>
                            </td>

                            {/* Role */}
                            <td className="mobile-table-cell" style={{ whiteSpace: "normal" }}>
                              {getRoleBadge(row)}
                            </td>

                            {/* Action */}
                            <td className="mobile-table-cell" onClick={(e) => e.stopPropagation()}>
                              <ActionDropdown row={row} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={mobileColumns.length} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                            No users found
                          </td>
                        </tr>
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

            </Card>
          </div>

          {/* ── Modals ── */}
          {showModal && (
            <LogoutModel
              projectId={UserId}
              setShowModal={setShowModal}
              handleFun={deleteUser}
              title="Confirm Delete User"
              subtitle="Are you sure you want to delete this user?"
              btnText="Delete"
            />
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Userlist;