import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { API_BASE_URL } from 'config/constant';
import { useDispatch } from "react-redux";
import { loginSuccess } from 'redux/store/auth/Action';

const JWTLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [errors, setErrors] = useState('');
  const [successMessage, setSuccessMessage] = useState('');


  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userData = JSON.parse(localStorage.getItem('users'));

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      const { role_id } = userData;
      let target = '/';
      if (role_id === 1) target = '/admin/dashboard';
      else if (role_id === 2) target = '/agent/dashboard';
      navigate(target, { replace: true });
    }
  }, []);

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const showError = (msg) => {
    setErrors(msg);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setErrors('');
    }, 3000);
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setErrors('');
    setShowAlert(false);

    // Validation
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/users/login`, { email, password });

      if (res.data.success === true) {
        dispatch(loginSuccess(res.data.user));
        localStorage.setItem('users', JSON.stringify(res.data.user));

        const { role_id } = res.data.user;
        let target = '/';
        if (role_id === 1) target = '/admin/dashboard';
        else if (role_id === 2) target = '/agent/dashboard';

        setEmail('');
        setPassword('');
        setSuccessMessage('Login successful!');
        navigate(target, { replace: true });

      } else if (res.data.success === false) {
        const msg = res.data.message || 'Invalid credentials.';

        // Field-specific error handling
        if (msg.toLowerCase().includes('email not found') || msg.toLowerCase().includes('email')) {
          setEmailError(msg);
        } else if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('incorrect')) {
          setPasswordError(msg);
        } else {
          setSuccessMessage('Login successful!');
        }
      }

    } catch (error) {
      if (error.response) {
        const msg = error.response.data.message || 'Server Error.';
        showError(msg);
      } else if (error.request) {
        showError('No response from server. Please try again.');
      } else {
        showError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <>
      {/* Toast Error Alert */}
      {showAlert && errors && (
        <div
          className="alert alert-danger position-fixed"
          style={{
            top: '20px',
            right: '20px',
            zIndex: 1050,
            minWidth: '220px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          role="alert"
        >
          {errors}
        </div>
      )}
      {successMessage && (
        <div
          className="alert alert-success position-fixed"
          style={{
            top: '20px',
            right: '20px',
            zIndex: 1050,
            minWidth: '220px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          role="alert"
        >
          {successMessage}
        </div>
      )}


      <div
        className="position-relative login-container"
      >
        <Form onKeyPress={handleKeyPress}>


          {/* Email */}
          <Form.Group style={{ textAlign: 'left' }} className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              type="email"
              placeholder="Enter your email"
              isInvalid={!!emailError}
            />
            <Form.Control.Feedback type="invalid">
              {emailError}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Password */}
          <Form.Group style={{ textAlign: 'left' }} className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              type="password"
              placeholder="Enter your password"
              isInvalid={!!passwordError}
            />
            <Form.Control.Feedback type="invalid">
              {passwordError}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col>
              <Button
                onClick={handleLogin}
                className="btn-block mb-4"
                size="large"
                type="button"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Col>
          </Row>

        </Form>
      </div>
    </>
  );
};

export default JWTLogin;