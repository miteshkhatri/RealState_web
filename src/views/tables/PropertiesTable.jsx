import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Dropdown, ListGroup, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FiMoreVertical } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import api from 'utils/api';
import ModernPagination from 'components/Pagination';
import ImageView from '../../images/imageView.png';
import './table.css';

const PropertiesTable = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('users') || '{}');

  const fetchProperties = async (pageNo = page) => {
    if (!userData?.user_token) return;
    try {
      const res = await api.get('/properties/all', {
        headers: { Authorization: userData.user_token },
        params: { page: pageNo, limit, type: filterType }
      });
      if (res.data.success) {
        setData(res.data.data || []);
        const total = Math.ceil((res.data.total_records || 0) / limit);
        setTotalPages(total);
        setPage(pageNo);
      }
    } catch (e) {
      console.error('Properties fetch error', e);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filterType, limit]);

  const filteredData = searchQuery
    ? data.filter(row => {
        const q = searchQuery.toLowerCase();
        return (
          (row.name || '').toLowerCase().includes(q) ||
          (row.address || '').toLowerCase().includes(q)
        );
      })
    : data;

  const columns = ['#', 'Img', 'Name', 'Type', 'Address', 'Sq/F Rate', 'DLC Rate', 'Booked / Pending', 'Broker Info'];
  if (userData.role_id !== 4) columns.push('Action');

  const mobileColumns = ['Img', 'Name / Address', 'Rate / Status', 'Broker Info'];
  if (userData.role_id !== 4) mobileColumns.push('Action');

  const getStatusBadgeClass = type => {
    if (type === 1) return 'status-badge status-badge-allotment';
    if (type === 2) return 'status-badge status-badge-registry';
    return 'status-badge status-badge-default';
  };
  const getStatusText = type => {
    if (type === 1) return 'Allotment';
    if (type === 2) return 'Registry';
    return '-';
  };

  const BrokerCell = ({ row, small = false }) =>
    row.brokers && row.brokers.length ? (
      row.brokers.map((broker, i) => (
        <div key={i} className={`broker-cell ${small ? 'broker-cell-small' : ''}`}>
          <strong className={`broker-name ${broker.broker_font === 1 ? 'kruti-dev' : ''}`}>{broker.broker_name}</strong>
          <div className="broker-phone">📞 {broker.phone_number || '-'}</div>
          {i === 0 && (
            <div className="broker-commission">Commission: {row.commission_type === 'percentage' ? `${row.commission_value}%` : row.commission_value}</div>
          )}
        </div>
      ))
    ) : (
      <span className="no-broker">No Broker</span>
    );

  const ActionDropdown = ({ row }) => (
    <Dropdown align="end" show={openDropdown === row.id} onToggle={() => setOpenDropdown(openDropdown === row.id ? null : row.id)}>
      <Dropdown.Toggle as="div" className="action-icon custom-action-toggle">
        <FiMoreVertical />
      </Dropdown.Toggle>
      <Dropdown.Menu align="end" className="profile-notification p-0">
        <ListGroup variant="flush" className="pro-body">
          <ListGroup.Item onClick={() => navigate(`/properties/view/${row.id}`)} className="border-bottom border-grey">
            <Link className="dropdown-item"><i className="feather icon-eye" /> View</Link>
          </ListGroup.Item>
          <ListGroup.Item onClick={() => navigate(`/properties/edit/${row.id}`)} className="border-bottom border-grey">
            <Link className="dropdown-item"><i className="feather icon-edit" /> Edit</Link>
          </ListGroup.Item>
          <ListGroup.Item onClick={() => {/* delete logic placeholder */}} className="border-bottom border-grey">
            <Link to="#" className="dropdown-item"><i className="feather icon-trash-2" /> Delete</Link>
          </ListGroup.Item>
        </ListGroup>
      </Dropdown.Menu>
    </Dropdown>
  );

  const LimitDropdown = () => (
    <Dropdown>
      <Dropdown.Toggle className="limit-toggle">{limit} <i className="feather icon-chevron-down limit-chevron" /></Dropdown.Toggle>
      <Dropdown.Menu className="limit-menu">
        {[10, 25, 50, 100].map(val => (
          <React.Fragment key={val}>
            <Dropdown.Item onClick={() => { setLimit(val); setPage(1); }} className={`limit-item ${limit === val ? 'active' : ''}`}>{val}</Dropdown.Item>
            {val !== 100 && <Dropdown.Divider className="limit-divider" />}
          </React.Fragment>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );

  const SearchInput = ({ fullWidth = false }) => (
    <div className={`search-wrap ${fullWidth ? 'search-wrap-full' : ''}`}>
      <i className="feather icon-search search-icon" />
      <Form.Control
        className="search-input"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search property..."
      />
    </div>
  );

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
            <Card.Header className="project-header">
              <div className="d-none d-md-flex align-items-center justify-content-between gap-2">
                <h5 className="project-title">Properties</h5>
                <div className="controls-row">
                  <LimitDropdown />
                  <Form.Select className="custom-select" style={{ minWidth: '120px' }} value={filterType} onChange={e => setFilterType(Number(e.target.value))}>
                    <option value={0}>All</option>
                    <option value={1}>Allotments</option>
                    <option value={2}>Registries</option>
                  </Form.Select>
                  <SearchInput />
                  {Number(userData?.role_id) !== 4 && (
                    <button className="btn-add" onClick={() => navigate('/properties/create')}>Add</button>
                  )}
                </div>
              </div>
              <div className="d-md-none mobile-stack">
                <div className="mobile-row-1">
                  <h5 className="project-title mobile-title">Properties</h5>
                  {Number(userData?.role_id) !== 4 && (
                    <button className="btn-add btn-add-mobile" onClick={() => navigate('/properties/create')}>Add</button>
                  )}
                </div>
                <SearchInput fullWidth />
                <div className="mobile-row-3">
                  <LimitDropdown />
                  <Form.Select className="custom-select-mobile" style={{ minWidth: '120px' }} value={filterType} onChange={e => setFilterType(Number(e.target.value))}>
                    <option value={0}>All</option>
                    <option value={1}>Allotments</option>
                    <option value={2}>Registries</option>
                  </Form.Select>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="card-body-p0">
              {/* Desktop Table */}
              <Table responsive hover className="project-table-desktop d-none d-md-table table table-hover table-striped">
                <thead>
                  <tr>{columns.map((col, i) => (<th key={i} className="table-header-cell">{col}</th>))}</tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr key={index} onClick={() => navigate(`/properties/${row.id}`)} className="table-row-clickable">
                      <td className="table-sno-cell">{(page - 1) * limit + index + 1}</td>
                      <td>
                        <div className="img-box">
                          <img className="img-box-img" src={row.image ? `${process.env.REACT_APP_API_BASE_URL}/uploads/${row.image}` : ImageView} alt={row.name || 'property'} onError={e => { e.target.src = ImageView; }} />
                        </div>
                      </td>
                      <td className={`${row.krutiDev_font === 1 ? 'kruti-dev' : ''} table-name-cell`}>{row.name}</td>
                      <td><span className={getStatusBadgeClass(row.type)}>{getStatusText(row.type)}</span></td>
                      <td className={`${row.krutiDev_font === 1 ? 'kruti-dev' : ''} table-address-cell`}>{row.address}</td>
                      <td className="table-rate-cell">{row.square_rate}</td>
                      <td className="table-rate-cell">{row.dlc_rate}</td>
                      <td>
                        <span className="table-booked">{row.total_booked}</span>
                        <span className="table-slash">/</span>
                        <span className="table-pending">{row.total_pending}</span>
                      </td>
                      <td><BrokerCell row={row} /></td>
                      {userData.role_id !== 4 && (
                        <td className="action-column" onClick={e => e.stopPropagation()}><ActionDropdown row={row} /></td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
              {/* Mobile Table */}
              <div className="project-table-mobile-wrap d-md-none">
                <table className="project-table-mobile">
                  <thead>
                    <tr>{mobileColumns.map((col, i) => (<th key={i} className="mobile-table-header">{col}</th>))}</tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, index) => (
                      <tr key={index} onClick={() => navigate(`/properties/${row.id}`)} className="mobile-table-row">
                        <td className="mobile-table-cell">
                          <div className="img-box img-box-mobile">
                            <img className="img-box-img" src={row.image ? `${process.env.REACT_APP_API_BASE_URL}/uploads/${row.image}` : ImageView} alt={row.name || 'property'} onError={e => { e.target.src = ImageView; }} />
                          </div>
                        </td>
                        <td className={`${row.krutiDev_font === 1 ? 'kruti-dev' : ''} mobile-table-cell`}>
                          <strong className="mobile-name">{row.name}</strong>
                          <span className="mobile-address">{row.address}</span>
                        </td>
                        <td className="mobile-table-cell mobile-rate-cell">
                          <div>Sq/F: <strong>{row.square_rate}</strong></div>
                          <div>DLC: <strong>{row.dlc_rate}</strong></div>
                          <div><span className="table-booked">{row.total_booked}</span><span className="table-slash">/</span><span className="table-pending">{row.total_pending}</span></div>
                        </td>
                        <td className="mobile-table-cell"><BrokerCell row={row} small /></td>
                        {userData.role_id !== 4 && (
                          <td className="mobile-table-cell action-column" onClick={e => e.stopPropagation()}><ActionDropdown row={row} /></td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
            <ModernPagination currentPage={page} totalPages={totalPages} onPageChange={p => { setPage(p); fetchProperties(p); }} />
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default PropertiesTable;
