import axios from 'axios';
import { API_BASE_URL } from 'config/constant';
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import avatar2 from '../../assets/images/user/avatar-2.jpg';
import api from 'utils/api';
import BackButton from 'components/Loader/BackButton';

function UpdateProfile() {
  const [Name, setName] = useState('');
  const [Number, setNumber] = useState('');
  const [Email, setEmail] = useState('');
  const [Image, setImage] = useState(null);
  const [password, setpassword] = useState();
  const [imagePrivew, setPreviewImage] = useState(null);
  const userData = JSON.parse(localStorage.getItem('users'));

  // Error state
  const [NameError, setNameError] = useState();
  const [NumberError, setNumberError] = useState();
  const [EmailError, setEmailError] = useState();
  const [passwordError, setPasswordError] = useState();

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const fileURL = URL.createObjectURL(file);
      setPreviewImage(fileURL);
    }
  };

  useEffect(() => {
    setName(userData ? userData.name : '');
    setNumber(userData ? userData.mobile_no : '');
    setEmail(userData ? userData.email : '');
    setImage(userData ? userData.image : '');
  }, []);

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async () => {
    if (!Name) {
      setNameError('Name is required');
      return;
    }
    if (!Number) {
      setNumberError('Number is required');
      return;
    } else if (Number.length < 10) {
      setNumberError('Enter a valid number');
      return;
    }
    if (!Email) {
      setEmailError('Email is required');
      return;
    } else if (!validateEmail(Email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('userId', userData.user_id);
      formData.append('name', Name);
      formData.append('number', Number);
      formData.append('email', Email);
      formData.append('ProjectImage', Image ? Image : userData.image);
      formData.append('password', password);
      formData.append('key', 1);

      const res = await api.put(`/profile/update`, formData, {
        headers: {
          Authorization: userData.user_token
        }
      });

      if (res.data.success == true) {
        localStorage.setItem('users', JSON.stringify(res.data.data));
        navigate('/profile');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <React.Fragment>
      {/* ⭐⭐⭐ ADD-PROJECT-CARD WRAPPER ⭐⭐⭐ */}
      <BackButton></BackButton>
      <div className="add-project-card">
        <Row>
          <Col sm={12}>
            <Card>
              <Card.Header className="project-header">
                <Card.Title as="h5" className="project-title">
                  Update Profile
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col>
                    <Form>
                      <Form.Group className="mb-3" controlId="formBasicDetails">
                        <Row>
                          <Col md={4}>
                            <Form.Label className="form-label">Name*</Form.Label>
                            <Form.Control
                              value={Name}
                              onChange={(e) => setName(e.target.value)}
                              type="text"
                              placeholder="Name *"
                              maxLength={25}
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text">
                              <p className="error-text">{NameError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">Number*</Form.Label>
                            <Form.Control
                              value={Number}
                              onChange={(e) => {
                                if (e.target.value.length <= 10) setNumber(e.target.value);
                              }}
                              onKeyDown={(e) => {
                                if (['.', '-', 'e'].includes(e.key)) e.preventDefault();
                              }}
                              type="number"
                              placeholder="Number *"
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text">
                              <p className="error-text">{NumberError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">Email*</Form.Label>
                            <Form.Control
                              value={Email}
                              onChange={(e) => setEmail(e.target.value)}
                              type="email"
                              placeholder="Email *"
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text">
                              <p className="error-text">{EmailError}</p>
                            </Form.Text>
                          </Col>
                        </Row>

                        <Row className="mt-3">
                          <Col md={4}>
                            <Form.Label className="form-label">Password*</Form.Label>
                            <Form.Control
                              value={password}
                              onChange={(e) => setpassword(e.target.value)}
                              type="text"
                              placeholder="Password *"
                              maxLength={25}
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text">
                              <p className="error-text">{passwordError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            <Form.Group className="mb-1 d-flex align-items-start gap-2" controlId="formBasicEmail">
                              <Col md={12} xs={9}>
                                <Form.Label className="form-label">Image*</Form.Label>
                                <Form.Control
                                  onChange={handleImageChange}
                                  type="file"
                                  placeholder="Select Image *"
                                  accept="image/*"
                                  className="form-control form-control-sm"
                                />
                              </Col>
                              <Col md={5} xs={4} style={{ marginTop: '30px' }}>
                                {imagePrivew ? (
                                  <img
                                    src={imagePrivew}
                                    alt="Preview"
                                    style={{ width: '40%', height: '40px', borderRadius: '5px' }}
                                  />
                                ) : userData && userData.image ? (
                                  <img
                                    src={`${API_BASE_URL}/uploads/${userData.image}`}
                                    alt="Preview"
                                    style={{
                                      width: '40%',
                                      height: '40px',
                                      borderRadius: '5px',
                                      objectFit: 'contain'
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={avatar2}
                                    alt="Preview"
                                    style={{
                                      width: '40%',
                                      height: '40px',
                                      borderRadius: '5px',
                                      objectFit: 'contain'
                                    }}
                                  />
                                )}
                              </Col>
                            </Form.Group>
                          </Col>
                        </Row>
                      </Form.Group>
                    </Form>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={12}>
                    <div className="d-flex justify-content-end">
                      <Button className="submit-btn" onClick={handleSubmit}>
                        Update
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      {/* ⭐⭐⭐ END WRAPPER ⭐⭐⭐ */}
    </React.Fragment>
  );
}

export default UpdateProfile;