import { API_BASE_URL } from 'config/constant';
import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Dropdown, ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import LogoutModel from 'layouts/AdminLayout/NavBar/NavRight/LogoutModel';
import AddAmount from './AddAmount';
import axios from 'axios';
import Receipt from 'views/Receipt/Receipt';
import "../Receipt/Receipt.css";
import '../style.css';
import api from 'utils/api';

function AmountTable() {
  const [showModal, setShowModal] = useState(false);
  const [ReceiveAmountId, setreceive_amountId] = useState();
  const [updateData, setUpdateData] = useState();
  const [updateBtnShow, setUpdateBtnShow] = useState(false);
  const [PlotId, setPlotId] = useState('');
  const [ReceiveAmountData, setReceiveAmountData] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('users') || 'null');

  const callListOnSave = true;

  const formatAmount = (val) => {
    if (val === null || val === undefined || val === "") return "";
    const num = Number(val);
    if (Number.isNaN(num)) return val;
    return num.toLocaleString("en-IN");
  };

  const getCommentPreview = (text, max = 40) => {
    if (!text) return "";
    const str = String(text);
    return str.length > max ? str.slice(0, max) + "..." : str;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getAllReceiveAmount = async (plotId = null) => {
    if (!userData || !userData.user_token) {
      console.warn('No user data / token found. Skipping API call.');
      return;
    }

    try {
      const params = { user_id: userData?.user_id };
      if (plotId !== null && plotId !== undefined && String(plotId).trim() !== '') params.plot_id = plotId;

      const res = await api.get(`/receiveamount/list`, {
        headers: { Authorization: userData.user_token },
        params
      });

      if (res.data && res.data.success) {
        setReceiveAmountData(res.data.data || []);
      } else {
        setReceiveAmountData([]);
      }
    } catch (error) {
      console.log('getAllReceiveAmount error:', error);
    }
  };

  useEffect(() => {
    const trimmed = typeof PlotId === 'string' ? PlotId.trim() : PlotId;
    if (trimmed !== null && trimmed !== '' && typeof trimmed !== 'undefined') {
      const parsed = Number(trimmed);
      const finalPlotId = Number.isNaN(parsed) ? trimmed : parsed;
      getAllReceiveAmount(finalPlotId);
    }
  }, [PlotId]);

  const onPlotChange = (newPlotId, shouldCallList = callListOnSave) => {
    const trimmed = typeof newPlotId === 'string' ? newPlotId.trim() : newPlotId;
    setPlotId(trimmed);
    if (shouldCallList) {
      const parsed = Number(trimmed);
      const finalPlotId = Number.isNaN(parsed) ? trimmed : parsed;
      getAllReceiveAmount(finalPlotId);
    }
  };

  const handleUpdatedata = (data) => {
    const injected = {
      ...data,
      user_id: userData?.user_id || data.user_id,
      plot_id: PlotId || data.plot_id || data.plot_no || data.plotId || ''
    };
    setUpdateBtnShow(true);
    setUpdateData(injected);
    window.scrollTo(0, 0);
  };

  const handleShowModel = (id) => {
    setShowModal(true);
    setreceive_amountId(id);
  };

  const handleDeleteAmount = async () => {
    try {
      const res = await api.delete(`/receiveamount`, {
        headers: { Authorization: userData.user_token },
        params: { 
          receive_amountId: ReceiveAmountId,
          deleted_by: userData?.user_id
        }
      });
      if (res.data && res.data.success) {
        if (PlotId) {
          const parsed = Number(PlotId);
          const finalPlotId = Number.isNaN(parsed) ? PlotId : parsed;
          getAllReceiveAmount(finalPlotId);
        } else {
          setReceiveAmountData([]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleShowReceipt = (row) => {
    setSelectedRow({selectedRow:row});
    setShowReceiptModal(true);
  };

  const columns = [
    '#',
    'Name',
    'Project',
    'Sector',
    'Plot',
    ' Recevie Amount',
    'Welcome',
    'P_mode',
    'Comment',
    'Image',
    'Recevie Date ',
    'Wel/Date',
    'Action'
  ];

  const MobileViewColumns = ['User', 'Project', 'Amt', 'Action'];
  const filteredColumns = showInput
    ? columns
    : columns.filter((c) => c !== 'Welcome' && c !== 'Wel/Date');

  const FilterData = useMemo(() => {
    const data = Array.isArray(ReceiveAmountData) ? [...ReceiveAmountData] : [];
    data.sort((a, b) => Number(b.id) - Number(a.id));
    return data;
  }, [ReceiveAmountData]);

  return (
    <React.Fragment>
      {/* ⭐⭐⭐ ADD-PROJECT-CARD WRAPPER ⭐⭐⭐ */}
      <div className="add-project-card">
        <Row>
          <Col>
            <AddAmount
              getAllReceiveAmount={getAllReceiveAmount}
              setUpdateBtnShow={setUpdateBtnShow}
              updateBtnShow={updateBtnShow}
              updateData={updateData}
              CallBacksetPlotId={onPlotChange}
              showInput={showInput}
              callListOnSave={callListOnSave}
              setShowInput={setShowInput}
            />

            <Card>
              <Card.Header className="project-header">
                <Card.Title as="h5" className="project-title">
                  Receive Amount
                </Card.Title>
              </Card.Header>

              <Card.Body>
                {/* Desktop Table */}
                <Table responsive hover className="d-none d-md-table">
                  <thead>
                    <tr>
                      {filteredColumns.map((column, index) => (
                        <th key={index}>{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody style={{ cursor: 'pointer' }}>
                    {FilterData.map((row, index) => (
                      <tr key={index}>
                        <th scope="row">{index + 1}</th>
                        <td className={row.krutiDev_font == 1 ? 'kruti-dev' : ''}>
                          {row.customer_name}
                        </td>
                        <td className={row.project_font == 1 ? 'kruti-dev' : ''}>
                          {row.project_name}
                        </td>
                        <td className={row.project_font == 1 ? 'kruti-dev' : ''}>
                          {row.sector_name}
                        </td>
                        <td>{row.plot_no}</td>
                        <td>{formatAmount(row.amount)}</td>
                        {showInput && <td>{formatAmount(row.amount_b)}</td>}
                        <td>{row.amount_a_type}</td>
                        <td
                          style={{
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={row.additional_comments || ""}
                        >
                          {row.additional_comments}
                        </td>
                        <td>
                          {row.image ? (
                            <a
                              href={`${API_BASE_URL}/uploads/${row.image}`}
                              style={{ color: 'black' }}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View
                            </a>
                          ) : null}
                        </td>
                        <td>
                          {formatDateTime(row.receive_date ? row.receive_date : row.create_at)}
                        </td>
                        {showInput && (
                          <td>
                            {formatDateTime(row.receive_date_b ? row.receive_date_b : row.create_at_b)}
                          </td>
                        )}
                        <td>
                          <ListGroup.Item bsPrefix="">
                            <Dropdown align="end" className="drp-user">
                              <Dropdown.Toggle as={Link} variant="link" id="dropdown-basic" className="no-arrow">
                                <i className="feather icon-more-vertical" style={{ color: 'black' }} />
                              </Dropdown.Toggle>
                              <Dropdown.Menu align="end" className="profile-notification p-0" popperConfig={{ strategy: "fixed" }} style={{ zIndex: 990 }}>
                                <ListGroup bsPrefix=" " variant="flush" className="pro-body">
                                  <ListGroup.Item
                                    onClick={() => {
                                      navigate(`/project/remarks/${row.project_id}`, { state: { row } });
                                    }}
                                  >
                                    <Link className="dropdown-item">
                                      <i className="feather icon-message-square" /> Remark
                                    </Link>
                                  </ListGroup.Item>
                                  <ListGroup.Item
                                    bsPrefix=" "
                                    onClick={() => handleUpdatedata(row)}
                                    className="border-bottom border-1 border-grey"
                                  >
                                    <Link className="dropdown-item">
                                      <i className="feather icon-edit" /> Edit
                                    </Link>
                                  </ListGroup.Item>
                                  <ListGroup.Item
                                    bsPrefix=" "
                                    onClick={() => handleShowModel(row.id)}
                                    className="border-bottom border-1 border-grey"
                                  >
                                    <Link className="dropdown-item">
                                      <i className="feather icon-trash-2" /> Delete
                                    </Link>
                                  </ListGroup.Item>
                                  <ListGroup.Item
                                    bsPrefix=" "
                                    onClick={() => handleShowReceipt(row)}
                                  >
                                    <Link className="dropdown-item">
                                      <i className="feather icon-printer" /> Receipt
                                    </Link>
                                  </ListGroup.Item>
                                </ListGroup>
                              </Dropdown.Menu>
                            </Dropdown>
                          </ListGroup.Item>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* Mobile Table */}
                <div
                  className="d-md-none mobile-table-container p-0 m-0"
                  style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
                >
                  <table className="mobile-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        {MobileViewColumns.map((column, index) => (
                          <th key={index}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {FilterData.map((row, index) => (
                        <tr key={index}>
                          <td
                            className={row.krutiDev_font == 1 ? 'kruti-dev' : ''}
                            style={{ whiteSpace: 'normal', fontSize: '12px' }}
                          >
                            <strong>{row.customer_name}</strong>
                          </td>
                          <td style={{ whiteSpace: 'normal', fontSize: '12px' }}>
                            <div className={row.project_font == 1 ? 'kruti-dev' : ''}>
                              {row.project_name}
                            </div>
                            <div className={row.project_font == 1 ? 'kruti-dev' : ''}>
                              {row.sector_name}
                            </div>
                            <div className={row.project_font == 1 ? 'kruti-dev' : ''}>
                              {row.plot_no}
                            </div>
                          </td>
                          <td style={{ whiteSpace: 'normal', fontSize: '12px' }}>
                            <div>
                              Amt: <strong>{formatAmount(row.amount)}</strong>
                            </div>
                            {showInput && (
                              <div>
                                Welcome: <strong>{formatAmount(row.amount_b)}</strong>
                              </div>
                            )}
                            <div>Mode: {row.amount_a_type}</div>
                            <div
                              style={{ maxWidth: 150, wordBreak: 'break-word' }}
                              title={row.additional_comments || ""}
                            >
                              {getCommentPreview(row.additional_comments, 40)}
                            </div>
                            <div>
                              Date:{' '}
                              <strong>
                                {formatDateTime(row.receive_date ? row.receive_date : row.create_at)}
                              </strong>
                            </div>
                            {showInput && (
                              <div>
                                Wel Date:{' '}
                                <strong>
                                  {formatDateTime(row.receive_date_b ? row.receive_date_b : row.create_at_b)}
                                </strong>
                              </div>
                            )}
                            {row.image && (
                              <div>
                                <a
                                  href={`${API_BASE_URL}/uploads/${row.image}`}
                                  style={{ color: 'black', fontSize: '11px' }}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  View Img
                                </a>
                              </div>
                            )}
                          </td>
                          <td>
                            <Dropdown align="end" className="drp-user">
                              <Dropdown.Toggle as={Link} variant="link" id="dropdown-basic" className="no-arrow">
                                <i className="feather icon-more-vertical" style={{ color: 'black' }} />
                              </Dropdown.Toggle>
                              <Dropdown.Menu align="end" className="profile-notification p-0" popperConfig={{ strategy: "fixed" }} style={{ zIndex: 990 }}>
                                <ListGroup bsPrefix=" " variant="flush" className="pro-body">
                                  <ListGroup.Item
                                    onClick={() => {
                                      navigate(`/project/remarks/${row.project_id}`, { state: { row } });
                                    }}
                                  >
                                    <Link className="dropdown-item">
                                      <i className="feather icon-message-square" /> Remark
                                    </Link>
                                  </ListGroup.Item>
                                  <ListGroup.Item onClick={() => handleUpdatedata(row)}>
                                    <Link className="dropdown-item">
                                      <i className="feather icon-edit" /> Edit
                                    </Link>
                                  </ListGroup.Item>
                                  <ListGroup.Item onClick={() => handleShowModel(row.id)}>
                                    <Link className="dropdown-item">
                                      <i className="feather icon-trash-2" /> Delete
                                    </Link>
                                  </ListGroup.Item>
                                  <ListGroup.Item onClick={() => handleShowReceipt(row)}>
                                    <Link className="dropdown-item">
                                      <i className="feather icon-printer" /> Receipt
                                    </Link>
                                  </ListGroup.Item>
                                </ListGroup>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>

            {/* Delete Modal */}
            {showModal && (
              <LogoutModel
                projectId={ReceiveAmountId}
                setShowModal={setShowModal}
                handleFun={handleDeleteAmount}
                title="Confirm Delete Receive Amount"
                subtitle="Are you sure you want to delete this record?"
                btnText="Delete"
              />
            )}

            {/* Receipt Modal */}
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
                <div
                  className="modal-dialog modal-md modal-dialog-centered"
                  style={{ maxWidth: '820px' }}
                >
                  <div className="modal-content position-relative">
                    <div className="modal-body">
                      <Receipt data={selectedRow} onClose={() => setShowReceiptModal(false)} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </div>
      {/* ⭐⭐⭐ END WRAPPER ⭐⭐⭐ */}
    </React.Fragment>
  );
}

export default AmountTable;