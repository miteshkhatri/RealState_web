import axios from 'axios';
import { API_BASE_URL } from 'config/constant';
import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import Imageprivew from '../../images/imageView.png';
import '../style.css';
import api from 'utils/api';
import BackButton from 'components/Loader/BackButton';

function AddUser() {
  const [Name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [Email, setEmail] = useState('');
  const [Image, setImage] = useState(null);
  const [password, setpassword] = useState('');
  const [passwordB, setPasswordB] = useState('');
  const [showPasswordB, setShowPasswordB] = useState(false);
  const [imagePrivew, setPreviewImage] = useState(null);
  const userData = JSON.parse(localStorage.getItem('users') || '{}');
  const [userRole, setUserRole] = useState('');
  const [userRoleData, setuserRoleData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Error states
  const [NameError, setNameError] = useState('');
  const [NumberError, setNumberError] = useState('');
  const [EmailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [roleError, setRoleErrror] = useState('');

  const location = useLocation();
  const { data, mode } = location?.state || {};
  const [projectNumbers, setProjectNumbers] = useState({});

  console.log(data, 'dnhen');

  useEffect(() => {
    if (!data) return;
    const current = Array.isArray(data) ? data[0] : data;

    setName(current.name || '');
    setMobile(current.mobile_no || '');
    setEmail(current.email || '');
    setUserRole(current.role ?? current.role_id ?? '');
    if (current.image) setPreviewImage(`${API_BASE_URL}/uploads/${current.image}`);
  }, [data]);

  useEffect(() => {
    if (!data || !projectData || projectData.length === 0) return;

    const current = Array.isArray(data) ? data[0] : data;

    if (Array.isArray(current.assigned_project_ids)) {
      const ids = [];
      const numbers = {};

      current.assigned_project_ids.forEach(item => {
        if (typeof item === 'object') {
          const pid = Number(item.project_id);
          ids.push(pid);
          numbers[pid] = item.plot_no || 0;
        } else {
          ids.push(Number(item));
        }
      });

      const available = new Set(projectData.map(p => Number(p.project_id)));
      const filtered = ids.filter(id => available.has(id));

      setSelectedProjects(filtered);
      setProjectNumbers(numbers);
    }
  }, [data, projectData]);

  // Ctrl + B toggle
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        setShowPasswordB((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Close dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const fileURL = URL.createObjectURL(file);
      setPreviewImage(fileURL);
    }
  };

  const toggleProject = (id) => {
    const numId = Number(id);
    setSelectedProjects(prev => {
      const prevNums = prev.map(x => Number(x));
      if (prevNums.includes(numId)) return prevNums.filter(x => x !== numId);
      return [...prevNums, numId];
    });
  };

  const selectAllProjects = () => {
    const ids = (projectData || []).map(p => Number(p.project_id)).filter(n => Number.isInteger(n));
    setSelectedProjects(Array.from(new Set(ids)));
  };

  const clearAllProjects = () => {
    setSelectedProjects([]);
  };

  const handleSubmit = async () => {
    setNameError('');
    setNumberError('');
    setEmailError('');
    setPasswordError('');
    setRoleErrror('');

    if (!Name) return setNameError('Name is required');
    if (!mobile) return setNumberError('Number is required');
    if (String(mobile).length < 10) return setNumberError('Enter a valid number');
    if (!Email) return setEmailError('Email is required');
    if (!validateEmail(Email)) return setEmailError('Please enter a valid email address');
    if (!userRole) return setRoleErrror('User role is required');

    try {
      const formData = new FormData();
      formData.append('Name', Name);
      formData.append('Number', mobile);
      formData.append('Email', Email);
      formData.append('password', password);
      formData.append('password_b', passwordB);
      formData.append('role', userRole);
      formData.append('UserImage', Image);
      formData.append('project_id', selectedProjects.join(','));

      const res = await api.post(`/user/add`, formData, {
        headers: { Authorization: userData?.user_token },
      });

      if (res.data.success === true) {
        setName('');
        setMobile('');
        setEmail('');
        setImage(null);
        setpassword('');
        setPasswordB('');
        setUserRole('');
        setSelectedProjects([]);
        navigate('/users');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateUser = async () => {
    setNameError('');
    setNumberError('');
    setEmailError('');
    setPasswordError('');
    setRoleErrror('');

    if (!Name) return setNameError('Name is required');
    if (!mobile) return setNumberError('Number is required');
    if (String(mobile).length < 10) return setNumberError('Enter a valid number');
    if (!Email) return setEmailError('Email is required');
    if (!validateEmail(Email)) return setEmailError('Please enter a valid email address');
    if (!userRole) return setRoleErrror('User role is required');

    try {
      const formData = new FormData();
      formData.append('userId', data?.user_id);
      formData.append('name', Name);
      formData.append('number', mobile);
      formData.append('email', Email);
      formData.append('password', password ? password : '');
      formData.append('password_b', passwordB ? passwordB : '');
      formData.append('role', userRole);
      formData.append('ProjectImage', Image);
      formData.append('project_id', selectedProjects.join(','));

      const res = await api.put(`/profile/update`, formData, {
        headers: { Authorization: userData?.user_token },
      });

      if (res.data.success === true) navigate('/users');
    } catch (error) {
      console.log(error);
    }
  };

  const GetAllUserRole = async () => {
    try {
      const res = await api.get(`/user/role`, {
        headers: { Authorization: userData?.user_token },
      });
      setuserRoleData(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleProjectNumberChange = (id, value) => {
    setProjectNumbers(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const getAllProjects = async () => {
    try {
      const res = await api.get(`/project/all`, {
        headers: { Authorization: userData?.user_token },
        params: { user_id: userData?.user_id }
      });

      if (res.data.success === true) {
        setProjectData(res.data.data || []);
      }
    } catch (error) {
      console.log(error, 'get all project api error');
    }
  };

  useEffect(() => {
    getAllProjects();
    GetAllUserRole();
  }, []);

  const OnChangeRole = (event) => {
    const selectedUserRole = event.target.value;
    setUserRole(selectedUserRole);
  };

  return (
    <React.Fragment>
      <BackButton />
      <div className="add-project-card">
        <Row>
          <Col sm={12}>
            <Card>
              <Card.Header className="project-header">
                <Card.Title as="h5" className="project-title">
                  {mode === 'edit' ? 'Update User' : 'Add User'}
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col>
                    <Form>
                      <Form.Group className="mb-3" controlId="formBasicDetails">
                        <Row>
                          <Col md={3}>
                            <Form.Label className="form-label">Name*</Form.Label>
                            <Form.Control
                              value={Name}
                              onChange={(e) => setName(e.target.value)}
                              type="text"
                              placeholder="Name *"
                              maxLength={25}
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{NameError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={3}>
                            <Form.Label className="form-label">Number*</Form.Label>
                            <Form.Control
                              value={mobile}
                              onChange={(e) => {
                                if (e.target.value.length <= 10) setMobile(e.target.value);
                              }}
                              onKeyDown={(e) => {
                                if (['.', '-', 'e'].includes(e.key)) e.preventDefault();
                              }}
                              type="number"
                              placeholder="Number *"
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{NumberError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={3}>
                            <Form.Label className="form-label">Email*</Form.Label>
                            <Form.Control
                              value={Email}
                              onChange={(e) => setEmail(e.target.value)}
                              type="email"
                              placeholder="Email *"
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{EmailError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={3}>
                            <Form.Label className="form-label">Password*</Form.Label>
                            <Form.Control
                              value={password}
                              onChange={(e) => setpassword(e.target.value)}
                              type="text"
                              placeholder="Password *"
                              maxLength={25}
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{passwordError}</p>
                            </Form.Text>
                          </Col>
                        </Row>

                        <Row className="mt-3">
                          {/* Project Dropdown - FIXED */}
                          <Col md={3}>
                            <Form.Label className="form-label">Select Projects</Form.Label>
                            <div ref={dropdownRef} className="position-relative" style={{ zIndex: 1050 }}>
                              <div
                                className="form-control form-control-sm"
                                onClick={() => setShowProjectDropdown((prev) => !prev)}
                                style={{ 
                                  cursor: 'pointer', 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  backgroundColor: '#fff'
                                }}
                              >
                                <span>
                                  {selectedProjects.length > 0
                                    ? `${selectedProjects.length} project(s) selected`
                                    : 'Select Projects'}
                                </span>
                                <span style={{ fontSize: '12px' }}>▼</span>
                              </div>

                              {showProjectDropdown && (
                                <div 
                                  style={{ 
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    zIndex: 1050,
                                    marginTop: '2px',
                                    maxHeight: '220px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden'
                                  }}
                                >
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    padding: '6px',
                                    borderBottom: '1px solid #eee',
                                    backgroundColor: '#f8f9fa',
                                    flexShrink: 0
                                  }}>
                                    <button 
                                      type="button" 
                                      className="btn btn-sm btn-light" 
                                      onClick={selectAllProjects}
                                    >
                                      Select All
                                    </button>
                                    <button 
                                      type="button" 
                                      className="btn btn-sm btn-light" 
                                      onClick={clearAllProjects}
                                    >
                                      Clear
                                    </button>
                                  </div>
                                  <div style={{ 
                                    padding: '4px 0',
                                    overflowY: 'auto',
                                    flexGrow: 1
                                  }}>
                                    {projectData?.map((data, index) => (
                                      <div
                                        key={data.project_id || index}
                                        onClick={() => toggleProject(data.project_id)}
                                        className={`dropdown-item ${data.krutiDev_font == 1 ? 'kruti-dev' : ''}`}
                                        style={{
                                          padding: '8px 12px',
                                          cursor: 'pointer',
                                          backgroundColor: selectedProjects.includes(Number(data.project_id)) ? '#e6f0ff' : 'transparent',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!selectedProjects.includes(Number(data.project_id))) {
                                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!selectedProjects.includes(Number(data.project_id))) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                          }
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedProjects.includes(Number(data.project_id))}
                                          onChange={() => toggleProject(data.project_id)}
                                          onClick={(e) => e.stopPropagation()}
                                          style={{ 
                                            cursor: 'pointer',
                                            width: '16px',
                                            height: '16px'
                                          }}
                                        />
                                        <span style={{ fontSize: '14px' }}>{data.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </Col>

                          <Col md={3}>
                            <Form.Label className="form-label">Select user role*</Form.Label>
                            <Form.Select
                              className="custom-select"
                              value={userRole}
                              onChange={OnChangeRole}
                            >
                              <option value="">Select user role*</option>
                              {userRoleData?.map((data, index) => (
                                <option key={index} value={data.role_id}>
                                  {data.role}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{roleError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            <Form.Group className="mb-1 d-flex align-items-start gap-3" controlId="formBasicEmail">
                              <Col md={8} xs={8}>
                                <Form.Label className="form-label">User Image*</Form.Label>
                                <Form.Control
                                  onChange={handleImageChange}
                                  type="file"
                                  placeholder="Select Image *"
                                  accept="image/*"
                                  className="form-control form-control-sm"
                                />
                              </Col>
                              <Col md={5} xs={2} style={{ marginTop: '30px' }}>
                                {imagePrivew ? (
                                  <img
                                    src={imagePrivew}
                                    alt="Preview"
                                    style={{ width: '40%', height: '40px', borderRadius: '5px' }}
                                  />
                                ) : data && data.image ? (
                                  <img
                                    src={`${API_BASE_URL}/uploads/${data?.image}`}
                                    alt="Preview"
                                    style={{
                                      width: '40%',
                                      height: '40px',
                                      borderRadius: '5px',
                                      objectFit: 'contain',
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={Imageprivew}
                                    alt="Preview"
                                    style={{
                                      width: '40%',
                                      height: '40px',
                                      borderRadius: '5px',
                                      objectFit: 'contain',
                                    }}
                                  />
                                )}
                              </Col>
                            </Form.Group>
                          </Col>

                          {showPasswordB && (
                            <Col md={3}>
                              <Form.Label className="form-label">Password *</Form.Label>
                              <Form.Control
                                value={passwordB}
                                onChange={(e) => setPasswordB(e.target.value)}
                                type="text"
                                placeholder="Password  *"
                                maxLength={25}
                                className="form-control form-control-sm"
                              />
                            </Col>
                          )}
                        </Row>
                      </Form.Group>
                    </Form>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={12}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div></div>
                      {mode === 'edit' ? (
                        <Button className="submit-btn" onClick={handleUpdateUser}>
                          Update
                        </Button>
                      ) : (
                        <Button className="submit-btn" onClick={handleSubmit}>
                          Add
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
}

export default AddUser;