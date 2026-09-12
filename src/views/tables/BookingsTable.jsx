import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Dropdown, ListGroup, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import ImageVeiw from '../../images/imageView.png';
import { API_BASE_URL } from 'config/constant';
import api from 'utils/api';
import ModernPagination from 'components/Pagination';
import { ReactTransliterate } from 'react-transliterate';

// BookingsTable mirrors ProjectTable UI but fetches data from the Bookings endpoint.
const BookingsTable = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('users')) || {};

  // Search & pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLang, setSearchLang] = useState('hi_mangal');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (pageNo = page) => {
    try {
      const res = await api.get('/bookings/all', {
        headers: { Authorization: userData.user_token },
        params: { user_id: userData?.user_id, page: pageNo, limit },
      });
      if (res.data.success) {
        setData(res.data.data || []);
        setTotalPages(Math.ceil((res.data.total_records || 0) / limit));
        setPage(pageNo);
      }
    } catch (e) {
      console.error('Bookings fetch error', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit]);

  const filteredData = searchQuery
    ? data.filter(row => {
        const q = searchQuery.toLowerCase();
        return (row.name || '').toLowerCase().includes(q) || (row.address || '').toLowerCase().includes(q);
      })
    : data;

  const handleView = row => {
    localStorage.setItem('BookingData', JSON.stringify(row));
    navigate('/bookings/view', { state: { row } });
  };

  const handleEdit = row => {
    navigate('/bookings/edit', { state: { row } });
  };

  const handleDelete = id => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.post('/bookings/delete', { BookingId: selectedId }, { headers: { Authorization: userData.user_token } });
      fetchData();
    } catch (e) {
      console.error('Delete error', e);
    } finally {
      setShowModal(false);
      setSelectedId(null);
    }
  };

  const ActionDropdown = ({ row }) => (
    <Dropdown align="end" className="drp-user" show={openDropdown === row.id} onToggle={() => setOpenDropdown(openDropdown === row.id ? null : row.id)}>
      <Dropdown.Toggle as="div" className="action-icon custom-action-toggle">
        <i className="feather icon-more-vertical" />
      </Dropdown.Toggle>
      <Dropdown.Menu align="end" className="profile-notification p-0">
        <ListGroup bsPrefix=" " variant="flush" className="pro-body">
          <ListGroup.Item onClick={() => handleView(row)} className="border-bottom border-grey">
            <Link className="dropdown-item"><i className="feather icon-eye" /> View</Link>
          </ListGroup.Item>
          <ListGroup.Item onClick={() => handleEdit(row)} className="border-bottom border-grey">
            <Link className="dropdown-item"><i className="feather icon-edit" /> Edit</Link>
          </ListGroup.Item>
          <ListGroup.Item onClick={() => handleDelete(row.id)} className="border-bottom border-grey">
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
            <Dropdown.Item onClick={() => { setLimit(val); setPage(1); }} className={`limit-item ${limit === val ? 'active' : ''}`}> {val} </Dropdown.Item>
            {val !== 100 && <Dropdown.Divider className="limit-divider" />}
          </React.Fragment>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );

  const SearchInput = ({ fullWidth = false }) => (
    <div className={`search-wrap ${fullWidth ? 'search-wrap-full' : ''}`}>
      <i className="feather icon-search search-icon" />
      {searchLang === 'hi_mangal' ? (
        <ReactTransliterate
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
          lang="hi"
          placeholder="Search booking..."
          renderComponent={props => <Form.Control {...props} className="search-input" />}
        />
      ) : (
        <Form.Control className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search booking..." />
      )}
    </div>
  );

  const columns = ['#', 'Img', 'Name', 'Type', 'Address', 'Sq/F Rate', 'DLC Rate', 'Booked / Pending', 'Broker Info'];
  if (userData.role_id == 1 || userData.role_id == 2) columns.push('Action');
  const mobileColumns = ['Img', 'Name / Address', 'Rate / Status', 'Broker Info'];
  if (userData.role_id == 1 || userData.role_id == 2) mobileColumns.push('Action');

  const BrokerCell = ({ row, small = false }) => (
    row.brokers && row.brokers.length > 0 ? (
      row.brokers.map((broker, i) => (
        <div key={i} className={`broker-cell ${small ? 'broker-cell-small' : ''}`}>
          <strong className={`broker-name ${broker.broker_font == 1 ? 'kruti-dev' : ''}`}>{broker.broker_name}</strong>
          <div className="broker-phone">📞 {broker.phone_number || '-'}</div>
          {i === 0 && (
            <div className="broker-commission">Commission: {row.commission_type === 'percentage' ? `${row.commission_value || '-'}%` : row.commission_value || '-'}</div>
          )}
        </div>
      ))
    ) : (
      <span className="no-broker">No Broker</span>
    )
  );

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
            <Card.Header className="project-header">
              <div className="d-none d-md-flex align-items-center justify-content-between gap-2">
                <h5 className="project-title">Bookings</h5>
                <div className="controls-row">
                  <LimitDropdown />
                  <Form.Select className="custom-select" style={{ minWidth: '120px' }} value={limit} onChange={e => setLimit(Number(e.target.value))}>
                    {[10, 25, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
                  </Form.Select>
                  <Form.Select className="custom-select" style={{ minWidth: '110px' }} value={searchLang} onChange={e => { setSearchLang(e.target.value); setSearchQuery(''); }}>
                    <option value="en">English</option>
                    <option value="hi_mangal">Mangal</option>
                    <option value="hi_kruti">Hindi</option>
                  </Form.Select>
                  <SearchInput />
                  {Number(userData?.role_id) !== 4 && (
                    <Button className="btn-add" onClick={() => navigate('/bookings/create')}> <i className="feather icon-plus btn-add-icon" /> Add </Button>
                  )}
                </div>
              </div>
              <div className="d-md-none mobile-stack">
                <div className="mobile-row-1">
                  <h5 className="project-title mobile-title">Bookings</h5>
                  {Number(userData?.role_id) !== 4 && (
                    <Button className="btn-add btn-add-mobile" onClick={() => navigate('/bookings/create')}> <i className="feather icon-plus btn-add-icon-mobile" /> Add </Button>
                  )}
                </div>
                <SearchInput fullWidth />
                <div className="mobile-row-3">
                  <LimitDropdown />
                  <Form.Select className="custom-select custom-select-mobile" value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
                    {[10, 25, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
                  </Form.Select>
                  <Form.Select className="custom-select custom-select-mobile" value={searchLang} onChange={e => { setSearchLang(e.target.value); setSearchQuery(''); }}>
                    <option value="en">English</option>
                    <option value="hi_mangal">Mangal</option>
                    <option value="hi_kruti">Hindi</option>
                  </Form.Select>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="card-body-p0">
              {/* Desktop Table */}
              <Table responsive hover className="project-table-desktop d-none d-md-table table table-hover table-striped">
                <thead>
                  <tr>
                    {columns.map((col, i) => (<th key={i} className="table-header-cell">{col}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData && filteredData.map((row, index) => (
                    <tr key={index} onClick={() => navigate('/bookings/detail', { state: { row } })} className="table-row-clickable">
                      <td className="table-sno-cell">{(page - 1) * limit + index + 1}</td>
                      <td>
                        <div className="img-box"><img className="img-box-img" src={row.image ? `${API_BASE_URL}/uploads/${row.image}` : ImageVeiw} alt={row.name || 'booking'} onError={e => { e.target.src = ImageVeiw; }} /></div>
                      </td>
                      <td className={`${row.krutiDev_font == 1 ? 'kruti-dev' : ''} table-name-cell`}>{row.name}</td>
                      <td><span className={row.type === 1 ? 'status-badge status-badge-allotment' : row.type === 2 ? 'status-badge status-badge-registry' : 'status-badge status-badge-default'}>{row.type === 1 ? 'Allotment' : row.type === 2 ? 'Registry' : '-'}</span></td>
                      <td className={`${row.krutiDev_font == 1 ? 'kruti-dev' : ''} table-address-cell`}>{row.address}</td>
                      <td className="table-rate-cell">{row.square_rate}</td>
                      <td className="table-rate-cell">{row.dlc_rate}</td>
                      <td><span className="table-booked">{row.total_booked}</span><span className="table-slash">/</span><span className="table-pending">{row.total_pending}</span></td>
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
                    {filteredData && filteredData.map((row, index) => (
                      <tr key={index} onClick={() => navigate('/bookings/detail', { state: { row } })} className="mobile-table-row">
                        <td className="mobile-table-cell"><div className="img-box img-box-mobile"><img className="img-box-img" src={row.image ? `${API_BASE_URL}/uploads/${row.image}` : ImageVeiw} alt={row.name || 'booking'} onError={e => { e.target.src = ImageVeiw; }} /></div></td>
                        <td className="mobile-table-cell"><strong className="mobile-name">{row.name}</strong><span className="mobile-address">{row.address}</span></td>
                        <td className="mobile-table-cell mobile-rate-cell"><div>Sq/F: <strong>{row.square_rate}</strong></div><div>DLC: <strong>{row.dlc_rate}</strong></div><div><span className="table-booked">{row.total_booked}</span><span className="table-slash">/</span><span className="table-pending">{row.total_pending}</span></div></td>
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
            <ModernPagination currentPage={page} totalPages={totalPages} onPageChange={p => { setPage(p); fetchData(p); }} />
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default BookingsTable;
