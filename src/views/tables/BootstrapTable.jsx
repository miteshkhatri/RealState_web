import { API_BASE_URL } from 'config/constant';
import React, { useState } from 'react';
import { Row, Col, Card, Table, Button, Dropdown, ListGroup, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import LogoutModel from 'layouts/AdminLayout/NavBar/NavRight/LogoutModel';
import ImageVeiw from '../../images/imageView.png';
import { BsBookmarks } from 'react-icons/bs';

import axios from 'axios';
import './table.css';
const BootstrapTable = ({ data, handleFun, columns, DeleteProject, title, route }) => {
  const [ShowActionIcon, setShowActionIcon] = useState();
  const [showModal, setShowModal] = useState(false);
  const [projectId, setProjectId] = useState();
  // console.log(projectId , 'projectId')
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('users'));
  const [SecarhProject, setSearchProject] = useState();
  function formatDateTime(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} `;
  }
  const handleShowOption = (index) => {
    setShowActionIcon(ShowActionIcon === index ? null : index);
  };
  const handleNavigte = (data) => {
    navigate('/projects/createproject', { state: { data, mode: 'edit' } });
  };

  const handleShowModel = (id) => {
    setShowModal(true);
    setProjectId(id);
  };
  const handleRouteNavigte = (data) => {
    localStorage.setItem('ProjectData', JSON.stringify(data));
    navigate(route, { state: { data } });
  };
  const handleBooking = (projectId) => {
    navigate('/bookings/add', { state: { projectId } });
  };

  const filteredData = SecarhProject
    ? data.filter(
        (row) =>
          row.name.toLowerCase().includes(SecarhProject.toLowerCase()) || row.address.toLowerCase().includes(SecarhProject.toLowerCase())
      )
    : data;
  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
            <Card.Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Card.Title as="h5">{title}</Card.Title>
              {/* <span className="d-block m-t-5">
                use props <code>hover</code> with <code>Table</code> component
              </span> */}
              <Row className="d-flex align-items-center g-2 flex-nowrap">
                <Col xs={8} md={userData.role_id == 4 ? 12 : 8}>
                  <Form.Group controlId="formBasicEmail">
                    <Form.Control
                      value={SecarhProject}
                      onChange={(e) => setSearchProject(e.target.value)}
                      maxLength={50}
                      type="text"
                      placeholder="Search project "
                    />
                  </Form.Group>
                </Col>

                <Col>
                  {userData.role_id == 4 ? null : (
                    <Button variant="primary" onClick={handleFun}>
                      Add
                    </Button>
                  )}
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>{columns && columns.map((column, index) => <th key={index}>{column}</th>)}</tr>
                </thead>
                <tbody style={{ cursor: 'pointer' }}>
                  {filteredData &&
                    filteredData.map((row, index) => (
                      <tr key={index}>
                        <th scope="row">{index + 1}</th>
                        <td onClick={() => handleRouteNavigte(row)}>
                          <div style={{ width: '100px', height: '100px', objectFit: 'contain' }}>
                            {row.image ? (
                              <img
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                src={`${API_BASE_URL}/uploads/${row.image}`}
                                alt=""
                              />
                            ) : (
                              <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src={ImageVeiw} alt="" />
                            )}
                          </div>
                        </td>
                        <td style={{ textWrap: 'wrap' }} onClick={() => handleRouteNavigte(row)}>
                          {row.name}
                        </td>
                        {/* <td>{row.longitude} , {row.latitude}</td> */}
                        <td style={{ textWrap: 'wrap' }}>{row.address}</td>
                        <td>{row.square_rate}</td>
                        <td>{row.dlc_rate}</td>
                        <td>{formatDateTime(row.create_at)}</td>
                        {userData.role_id == 4 ? null : (
                          <td>
                            {/* <i onClick={() => handleShowOption(index)} className="feather icon-more-vertical" /> */}
                            <ListGroup.Item bsPrefix="">
                              <Dropdown align={'start'} className="drp-user">
                                <Dropdown.Toggle as={Link} variant="link" id="dropdown-basic" className="no-arrow ">
                                  <i className="feather icon-more-vertical" style={{ color: 'black' }} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end" className="profile-notification p-0">
                                  <ListGroup bsPrefix=" " variant="flush" className="pro-body">
                                    <ListGroup.Item
                                      bsPrefix=" "
                                      onClick={() => handleNavigte(row)}
                                      className="border-bottom border-1 border-grey"
                                    >
                                      <Link className="dropdown-item">
                                        <i className="feather icon-edit" /> Edit
                                      </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item
                                      bsPrefix=" "
                                      onClick={() => handleShowModel(row.project_id)}
                                      className="border-bottom border-1 border-grey"
                                    >
                                      <Link to="#" className="dropdown-item">
                                        <i className="feather icon-trash-2" /> Delete
                                      </Link>
                                    </ListGroup.Item>
                                    <ListGroup.Item bsPrefix=" " onClick={() => handleBooking(row.project_id)}>
                                      <Link to="#" className="dropdown-item">
                                        <BsBookmarks /> Book now
                                      </Link>
                                    </ListGroup.Item>
                                  </ListGroup>
                                </Dropdown.Menu>
                              </Dropdown>
                            </ListGroup.Item>
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
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
          {/* <Card>
            <Card.Header>
              <Card.Title as="h5">Striped Table</Card.Title>
              <span className="d-block m-t-5">
                use props <code>striped</code> with <code>Table</code> component
              </span>
            </Card.Header>
            <Card.Body>
              <Table striped responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Username</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">1</th>
                    <td>Mark</td>
                    <td>Otto</td>
                    <td>@mdo</td>
                  </tr>
                  <tr>
                    <th scope="row">2</th>
                    <td>Jacob</td>
                    <td>Thornton</td>
                    <td>@fat</td>
                  </tr>
                  <tr>
                    <th scope="row">3</th>
                    <td>Larry</td>
                    <td>the Bird</td>
                    <td>@twitter</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card> */}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default BootstrapTable;
