import { API_BASE_URL } from 'config/constant';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Dropdown, ListGroup, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import LogoutModel from 'layouts/AdminLayout/NavBar/NavRight/LogoutModel';
import ImageVeiw from '../../images/imageView.png';
import { BsBookmarks } from 'react-icons/bs';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { projects, setIsFetched } from 'redux/store/Projects/Action';
import { ReactTransliterate } from 'react-transliterate';
import { useLocation } from 'react-router-dom';
import api from 'utils/api';
import ModernPagination from 'components/Pagination';
import ThemeLoader from 'components/Loader/ThemeLoader';

// ─── ✅ FIXED: Search Input Component Moved OUTSIDE to prevent focus loss ───
const SearchInput = ({ fullWidth = false, SearchLang, searchQuery, setSearchQuery }) => {
  return (
    <div className={`search-wrap ${fullWidth ? 'search-wrap-full' : ''}`}>
      <i className="feather icon-search search-icon" />
      {SearchLang === 'hi_mangal' ? (
        <ReactTransliterate
          value={searchQuery}
          onChangeText={(value) => setSearchQuery(value)}
          lang="hi"
          placeholder="Search project..."
          renderComponent={(props) => (
            <input
              {...props}
              className="search-input mangal-font"
              style={{ 
                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '14px'
              }}
            />
          )}
        />
      ) : (
        <input
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search project..."
          style={{
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '14px'
          }}
        />
      )}
    </div>
  );
};

const ProjectTable = () => {
  const [projectData, setProjectData] = useState();
  const [showModal, setShowModal] = useState(false);
  const [projectId, setProjectId] = useState();
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('users'));
  const [searchQuery, setSearchQuery] = useState('');
  const projectReduxData = useSelector((state) => state.projects.projects);
  const Fetched = useSelector((state) => state.projects.isFetched);
  const dispatch = useDispatch();
  const [SearchLang, setSearchLang] = useState('hi_mangal');
  const [filterType, setFilterType] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const location = useLocation();

  const PROJECT_TYPE =
    location.pathname === '/projects' ? 0
    : location.pathname === '/allotmentsListing' ? 1
    : location.pathname === '/registries' ? 2
    : 0;

  // Search filtering logic
  const filteredData = searchQuery
    ? (projectReduxData || []).filter((row) => {
        const q = searchQuery.toLowerCase().trim();
        const name = (row.name || '').toLowerCase();
        const address = (row.address || '').toLowerCase();
        return name.includes(q) || address.includes(q);
      })
    : (projectReduxData || []);

  const currentTableData = filteredData.slice((page - 1) * limit, page * limit);
  const calculatedTotalPages = Math.ceil(filteredData.length / limit) || 1;

  useEffect(() => { getAllProjects(1); }, [filterType]);
  useEffect(() => { setFilterType(PROJECT_TYPE); dispatch(setIsFetched(false)); }, [PROJECT_TYPE]);

  const getAllProjects = async () => {
    try {
      const res = await api.get(`/project/all`, {
        headers: { Authorization: userData.user_token },
        params: { user_id: userData?.user_id, type: filterType }
      });
      if (res.data.success === true) {
        dispatch(projects(res.data.data));
        dispatch(setIsFetched(true));
        setProjectData(res.data.data);
        setPage(1);
      }
    } catch (error) { console.log(error, 'get all project api error'); }
  };

  const DeleteProject = async (id) => {
    dispatch(setIsFetched(false));
    try {
      await api.post(`/project/delete`, { ProjectId: id }, { headers: { authorization: userData.user_token } });
      getAllProjects();
    } catch (error) { console.log(error, 'project delete api error'); }
  };

  const handleNavigte = (data) => {
    dispatch(setIsFetched(false));
    navigate('/projects/createproject', { state: { data, mode: 'edit' } });
  };

  const handleShowModel = (id) => { setShowModal(true); setProjectId(id); };

  const handleRouteNavigte = (data) => {
    localStorage.setItem('ProjectData', JSON.stringify(data));
    navigate('/projects/plots', { state: { data } });
  };

  const handleBooking = (project_Id) => navigate('/bookings/add', { state: { project_Id } });

  const handleView = (data) => {
    localStorage.setItem('ProjectData', JSON.stringify(data));
    navigate('/projects/plots', { state: { data, mode: 'view' } });
  };

  const pageTitle =
    location.pathname === '/projects' ? 'Projects'
    : location.pathname === '/allotmentsListing' ? 'Allotments'
    : location.pathname === '/registries' ? 'Registries'
    : 'Projects';

  const columns = ['#', 'Img', 'Name', 'Type', 'Address', 'Sq/F Rate', 'DLC Rate', 'Booked / Pending', 'Broker Info'];
  if (userData.role_id == 1 || userData.role_id == 2) columns.push('Action');

  const MobileViewColums = ['Img', 'Name / Address', 'Rate / Status', 'Broker Info'];
  if (userData.role_id == 1 || userData.role_id == 2) MobileViewColums.push('Action');

  const getStatusBadgeClass = (type) => {
    if (type == 1) return 'status-badge status-badge-allotment';
    if (type == 2) return 'status-badge status-badge-registry';
    return 'status-badge status-badge-default';
  };

  const getStatusText = (type) => {
    if (type == 1) return 'Allotment';
    if (type == 2) return 'Registry';
    return '-';
  };

  // ─── Broker Cell ─────────────────────────────────────────────────────────
  const BrokerCell = ({ row, small = false }) =>
    row.brokers && row.brokers.length > 0 ? (
      row.brokers.map((broker, i) => (
        <div key={i} className={`broker-cell ${small ? 'broker-cell-small' : ''}`}>
          <strong className={`broker-name ${broker.broker_font == 1 ? 'kruti-dev' : ''}`}>
            {broker.broker_name}
          </strong>
          <div className="broker-phone">📞 {broker.phone_number || '-'}</div>
          {i === 0 && (
            <div className="broker-commission">
              Commission: {row.commission_type === 'percentage' ? `${row.commission_value || '-'}%` : row.commission_value || '-'}
            </div>
          )}
        </div>
      ))
    ) : (
      <span className="no-broker">No Broker</span>
    );

  // ─── Action Dropdown ─────────────────────────────────────────────────────
  const ActionDropdown = ({ row }) => (
    <Dropdown
      align="end"
      className="drp-user"
      show={openDropdown === row.project_id}
      onToggle={() => setOpenDropdown(openDropdown === row.project_id ? null : row.project_id)}
    >
      <Dropdown.Toggle as="div" className="action-icon custom-action-toggle">
        <i className="feather icon-more-vertical" />
      </Dropdown.Toggle>
      <Dropdown.Menu align="end" className="profile-notification" style={{ padding: "6px", minWidth: "175px", zIndex: 990 }}>
        <div
          onClick={() => handleView(row)}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
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

        <div
          onClick={() => handleNavigte(row)}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
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

        <div
          onClick={() => handleShowModel(row.project_id)}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
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

        <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />

        <div
          onClick={() => handleBooking(row.project_id)}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
            fontSize: "13px", fontFamily: "var(--font)",
            color: "var(--text-primary)",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <BsBookmarks size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
          Book Now
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
        {[10, 25, 50, 100].map((val, i, arr) => (
          <React.Fragment key={val}>
            <div
              className={`limit-item${limit === val ? ' active' : ''}`}
              onClick={() => { setLimit(val); setPage(1); }}
            >
              {val}
            </div>
            {i < arr.length - 1 && <Dropdown.Divider className="limit-divider" />}
          </React.Fragment>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );

  if (!Fetched) {
    return <ThemeLoader />;
  }

  return (
    <React.Fragment>
      <Row>
        <Col>
          <div className="project-table-card">
            <Card className="card">

              {/* CARD HEADER */}
             <Card.Header className="project-header">

  {/* Desktop View */}
  <div className="d-none d-md-flex flex-column gap-2 w-100">

    {/* Row 1: Title + Controls */}
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 w-100">
      
      {/* Title — always white */}
      <h5
        className="project-title mb-0"
        style={{ color: "#ffffff", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.03em" }}
      >
        {pageTitle}&nbsp;
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
          {filteredData.length}
        </span>
      </h5>

      {/* Controls row */}
      <div className="controls-row d-flex align-items-center gap-2">
        <LimitDropdown />
        
        <select
          className="custom-select"
          style={{ width: "130px" }}
          value={filterType}
          onChange={(e) => { 
            setFilterType(Number(e.target.value)); 
            dispatch(setIsFetched(false)); 
          }}
        >
          <option value={0}>All</option>
          <option value={1}>Allotments</option>
          <option value={2}>Registries</option>
        </select>
        
        <select
          className="custom-select"
          style={{ width: "120px" }}
          value={SearchLang}
          onChange={(e) => { 
            setSearchLang(e.target.value); 
            setSearchQuery('');
          }}
        >
          <option value="en">English</option>
          <option value="hi_mangal">Mangal (Hindi)</option>
        </select>
        
        {/* Search Input */}
        <SearchInput 
          SearchLang={SearchLang} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        {/* Add button */}
        {Number(userData?.role_id) !== 4 && (
          <button className="btn-add" onClick={() => navigate('/projects/createproject')}>
            <span className="btn-add-icon">＋</span> Add
          </button>
        )}
      </div>
    </div>

    {/* Row 2: Stats */}
    <div className="d-flex gap-2 mt-2 flex-wrap justify-content-end w-100">
      <div style={{
        display: "flex", 
        alignItems: "center", 
        gap: "8px",
        background: "rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "10px",
        padding: "6px 14px",
        backdropFilter: "blur(8px)",
      }}>
        <span style={{ fontSize: "16px" }}>🏢</span>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ 
            fontSize: "10px", 
            fontWeight: 600, 
            color: "rgba(255,255,255,0.65)", 
            letterSpacing: "0.05em", 
            textTransform: "uppercase" 
          }}>
            Total Properties
          </div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>
            {filteredData.length}
          </div>
        </div>
      </div>
    </div>

  </div>

  {/* Mobile View */}
  <div className="d-md-none" style={{ width: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
      <h5
        className="project-title mb-0"
        style={{ color: "#ffffff", fontWeight: 800, fontSize: "16px", letterSpacing: "-0.03em" }}
      >
        {pageTitle}&nbsp;
        <span
          style={{
            background: "rgba(255,255,255,0.22)",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 700,
            borderRadius: "20px",
            padding: "2px 8px",
            border: "1px solid rgba(255,255,255,0.35)",
            display: "inline-block",
            verticalAlign: "middle",
          }}
        >
          {filteredData.length}
        </span>
      </h5>
      {Number(userData?.role_id) !== 4 && (
        <button className="btn-add" style={{ width: '75px', padding: "4px 0", fontSize: "12px", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => navigate('/projects/createproject')}>
          <span className="btn-add-icon" style={{ fontSize: "14px", marginRight: "4px" }}>＋</span> Add
        </button>
      )}
    </div>
    
    <SearchInput 
      fullWidth 
      SearchLang={SearchLang} 
      searchQuery={searchQuery} 
      setSearchQuery={setSearchQuery} 
    />
    
    {/* Row 3: Language (Left) & Filter (Right) */}
    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', width: '100%' }}>
      <div style={{ flex: 1 }}>
        <select
          className="custom-select"
          style={{ width: '100%', height: '36px', fontSize: '13px' }}
          value={SearchLang}
          onChange={(e) => { 
            setSearchLang(e.target.value); 
            setSearchQuery('');
          }}
        >
          <option value="en">English</option>
          <option value="hi_mangal">Mangal (Hindi)</option>
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <select
          className="custom-select"
          style={{ width: '100%', height: '36px', fontSize: '13px' }}
          value={filterType}
          onChange={(e) => { setFilterType(Number(e.target.value)); dispatch(setIsFetched(false)); }}
        >
          <option value={0}>All</option>
          <option value={1}>Allotments</option>
          <option value={2}>Registries</option>
        </select>
      </div>
    </div>

    {/* Row 4: Total Properties (Left) & Limit Dropdown (Right) */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '4px' }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "8px", padding: "6px 12px", backdropFilter: "blur(8px)",
      }}>
        <span style={{ fontSize: "14px" }}>🏢</span>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>Total Properties</div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>{filteredData.length}</div>
        </div>
      </div>
      <div style={{ width: '75px' }}>
        <LimitDropdown />
      </div>
    </div>
  </div>

</Card.Header>

              {/* CARD BODY */}
              <Card.Body className="card-body-p0">
                {/* ── Desktop Table ── */}
                <table className="project-table-desktop d-none d-md-table">
                  <thead>
                    <tr>
                      {columns.map((col, i) => (
                        <th key={i} className="table-header-cell">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTableData && currentTableData.map((row, index) => (
                      <tr key={index} onClick={() => handleRouteNavigte(row)} className="table-row-clickable">
                        <td className="table-sno-cell">{(page - 1) * limit + index + 1}</td>
                        <td>
                          <div className="img-box">
                            <img
                              className="img-box-img"
                              src={row.image ? `${API_BASE_URL}/uploads/${row.image}` : ImageVeiw}
                              alt={row.name || 'project'}
                              onError={(e) => { e.target.src = ImageVeiw; }}
                            />
                          </div>
                        </td>
                        <td className={`${row.krutiDev_font == 1 ? 'kruti-dev' : ''} table-name-cell`}>{row.name}</td>
                        <td><span className={getStatusBadgeClass(row.type)}>{getStatusText(row.type)}</span></td>
                        <td className={`${row.krutiDev_font == 1 ? 'kruti-dev' : ''} table-address-cell`}>{row.address}</td>
                        <td><span className="rate-chip rate-chip-sqf">₹{row.square_rate}</span></td>
                        <td><span className="rate-chip rate-chip-dlc">₹{row.dlc_rate}</span></td>
                        <td>
                          <div className="bp-wrap">
                            <span className="bp-chip bp-booked">{row.total_booked} <span className="bp-label">Booked</span></span>
                            <span className="bp-chip bp-pending">{row.total_pending} <span className="bp-label">Pending</span></span>
                          </div>
                        </td>
                        <td><BrokerCell row={row} /></td>
                        {userData.role_id !== 4 && (
                          <td className="action-column" onClick={(e) => e.stopPropagation()}>
                            <ActionDropdown row={row} />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ── Mobile Table ── */}
                <div className="project-table-mobile-wrap d-md-none">
                  <table className="project-table-mobile">
                    <thead>
                      <tr>
                        {MobileViewColums.map((col, i) => (
                          <th key={i} className="mobile-table-header">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentTableData && currentTableData.map((row, index) => (
                        <tr key={index} onClick={() => handleRouteNavigte(row)} className="mobile-table-row">
                          <td className="mobile-table-cell">
                            <div className="img-box img-box-mobile">
                              <img
                                className="img-box-img"
                                src={row.image ? `${API_BASE_URL}/uploads/${row.image}` : ImageVeiw}
                                alt={row.name || 'project'}
                                onError={(e) => { e.target.src = ImageVeiw; }}
                              />
                            </div>
                          </td>
                          <td className={`${row.krutiDev_font == 1 ? 'kruti-dev' : ''} mobile-table-cell`}>
                            <strong className="mobile-name">{row.name}</strong>
                            <span className="mobile-address">{row.address}</span>
                          </td>
                          <td className="mobile-table-cell mobile-rate-cell">
                            <div>Sq/F: <strong>{row.square_rate}</strong></div>
                            <div>DLC: <strong>{row.dlc_rate}</strong></div>
                            <div>
                              <span className="table-booked">{row.total_booked}</span>
                              <span className="table-slash">/</span>
                              <span className="table-pending">{row.total_pending}</span>
                            </div>
                          </td>
                          <td className="mobile-table-cell"><BrokerCell row={row} small /></td>
                          {userData.role_id !== 4 && (
                            <td className="mobile-table-cell action-column" onClick={(e) => e.stopPropagation()}>
                              <ActionDropdown row={row} />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>

              <ModernPagination
                currentPage={page}
                totalPages={calculatedTotalPages}
                onPageChange={(p) => setPage(p)}
              />

            </Card>
          </div>

          {showModal && (
            <LogoutModel
              projectId={projectId}
              setShowModal={setShowModal}
              handleFun={DeleteProject}
              title="Confirm Delete Project"
              subtitle="Are you sure you want to delete project ?"
              btnText="Delete"
            />
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ProjectTable;