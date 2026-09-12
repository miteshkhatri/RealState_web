import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  FormControl,
  DropdownButton,
  Dropdown,
  Modal,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { IoIosArrowBack } from 'react-icons/io';
import GoogleMaps from 'views/maps/GoogleMaps';
import { API_BASE_URL } from 'config/constant';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaLanguage } from 'react-icons/fa6';
import './style.css';
import { setIsFetched } from 'redux/store/PreBookings/Action';
import { useDispatch } from 'react-redux';
import api from 'utils/api';
import BackButton from 'components/Loader/BackButton';

function AddBooking() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [CustomerName, setCustomerName] = useState('');
  const [CustomerNumber, setCustomerNumber] = useState();
  const [PlotNumber, setPlotNumber] = useState();
  const [PlotAmount, setPlotAmount] = useState();

  const [Class, setClass] = useState(0);  // ⭐ Changed to 0 (English default)
  const [FontValue, setFontValue] = useState(0);  // ⭐ Changed to 0 (English default)

  // ⭐ NEW: isEnglish helper
  const isEnglish = FontValue === 0;

  const userData = JSON.parse(localStorage.getItem('users'));

  // error state :
  const [errors, seterrors] = useState();
  const [CustomerNameError, setCustomerNameError] = useState();
  const [CustomerNumberError, setCustomerNumberError] = useState();
  const [PlotNumberError, setPlotNumberError] = useState();
  const [PlotAmountError, setPlotAmountError] = useState();

  const location = useLocation();
  const { mode, data } = location?.state || {};

  const FromLable = [
    { id: 0, EnglishName: 'Customer Name *', HindiName: 'ग्राहक का नाम *' },
    { id: 1, EnglishName: 'Customer Number*', HindiName: 'ग्राहक का मोबाइल नंबर *' },
    { id: 2, EnglishName: 'Plot Number', HindiName: 'प्लॉट नंबर' },
    { id: 3, EnglishName: 'Amount', HindiName: 'मात्रा' },
  ];

  useEffect(() => {
    setCustomerName(data ? data.customer_name : '');
    setCustomerNumber(data ? data.customer_number : '');
    setPlotNumber(data ? data.Plot_number : '');
    setPlotAmount(data ? data.amount : '');
    // ⭐ Fix: Proper conversion
    setFontValue(data ? Number(data.krutiDev_font) : 0);
    setClass(data ? Number(data.krutiDev_font) : 0);
  }, [data]);

  const AddPreBooking = async () => {
    dispatch(setIsFetched(false));
    setCustomerNameError('');
    setCustomerNumberError('');
    setPlotNumberError('');
    setPlotAmountError('');
    if (!CustomerName) {
      setCustomerNameError('Customer name is required');
      return;
    }
    if (!CustomerNumber) {
      setCustomerNumberError('Customer number is required');
      return;
    }
    if (CustomerNumber.length < 10) {
      setCustomerNumberError('Please enter a valid customer number');
      return;
    }

    try {
      const res = await api.post(
        `/prebooking/add`,
        {
          CustomerName: CustomerName,
          CustomerNumber: CustomerNumber,
          PlotNumber: PlotNumber,
          amount: PlotAmount,
          krutiDev_font: FontValue
        },
        {
          headers: {
            Authorization: userData.user_token
          }
        }
      );

      if (res.data.success == true) {
        setCustomerName('');
        setCustomerNumber('');
        setPlotNumber('');
        setPlotAmount('');
        navigate('/prebooking');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const UpdatePreBooking = async () => {
    dispatch(setIsFetched(false));
    setCustomerNameError('');
    setCustomerNumberError('');
    setPlotNumberError('');
    setPlotAmountError('');
    if (!CustomerName) {
      setCustomerNameError('Customer name is required');
      return;
    }
    if (!CustomerNumber) {
      setCustomerNumberError('Customer number is required');
      return;
    }
    if (CustomerNumber.length < 10) {
      setCustomerNumberError('Please enter a valid customer number');
      return;
    }

    try {
      const res = await api.put(
        `/prebooking`,
        {
          preBookingId: data?.id,
          CustomerName: CustomerName,
          CustomerNumber: CustomerNumber,
          PlotNumber: PlotNumber,
          amount: PlotAmount,
          krutiDev_font: FontValue
        },
        {
          headers: {
            Authorization: userData.user_token
          }
        }
      );
      if (res.data.success == true) {
        navigate('/prebooking');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ⭐ FIX: Proper language change handler
  const handleLanguageChange = (e) => {
    const selectedValue = Number(e.target.value);
    setFontValue(selectedValue);
    setClass(selectedValue === 1);  // Class true only for Hindi (Kruti Dev)
  };

  return (
    <React.Fragment>
      
<BackButton isEnglish={isEnglish} />
      <div className="add-project-card">  {/* ⭐ Added wrapper */}
        <Row>
          <Col sm={12}>
            <Card>
              <Card.Header className="project-header">
                <Card.Title as="h5" className="project-title">
                  Pre Booking
                </Card.Title>
                <Col md={2}>
                  <Form.Select 
                    className="custom-select"
                    value={FontValue} 
                    onChange={handleLanguageChange}
                  >
                    <option value={0}>English</option>
                    <option value={1}>Hindi</option>
                  </Form.Select>
                </Col>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col>
                    <Form>
                      <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Row>
                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? FromLable[0].EnglishName : FromLable[0].HindiName}
                            </Form.Label>

                            {/* ⭐ FIX: Customer Name - Kruti Dev support */}
                            <Form.Control
                              value={CustomerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              type="text"
                              placeholder={isEnglish ? FromLable[0].EnglishName : FromLable[0].HindiName}
                              className={`form-control form-control-sm ${Class ? 'kruti-dev' : ''}`}
                              maxLength={25}
                            />

                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{CustomerNameError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? FromLable[1].EnglishName : FromLable[1].HindiName}
                            </Form.Label>
                            <Form.Control
                              value={CustomerNumber}
                              onChange={(e) => {
                                if (e.target.value.length <= 10) {
                                  setCustomerNumber(e.target.value);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === '.' || e.key === '-' || e.key === 'e') {
                                  e.preventDefault();
                                }
                              }}
                              type="number"
                              placeholder={isEnglish ? FromLable[1].EnglishName : FromLable[1].HindiName}
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{CustomerNumberError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? FromLable[2].EnglishName : FromLable[2].HindiName}
                            </Form.Label>
                            <Form.Control
                              value={PlotNumber}
                              onChange={(e) => {
                                if (e.target.value.length <= 10) {
                                  setPlotNumber(e.target.value);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === '.' || e.key === '-' || e.key === 'e') {
                                  e.preventDefault();
                                }
                              }}
                              type="number"
                              placeholder={isEnglish ? FromLable[2].EnglishName : FromLable[2].HindiName}
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{PlotNumberError}</p>
                            </Form.Text>
                          </Col>
                        </Row>

                        <Row className="mt-3">
                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? FromLable[3].EnglishName : FromLable[3].HindiName}
                            </Form.Label>
                            <Form.Control
                              value={PlotAmount}
                              onChange={(e) => {
                                if (e.target.value.length <= 10) {
                                  setPlotAmount(e.target.value);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === '.' || e.key === '-' || e.key === 'e') {
                                  e.preventDefault();
                                }
                              }}
                              type="number"
                              placeholder={isEnglish ? FromLable[3].EnglishName : FromLable[3].HindiName}
                              maxLength={200}
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{PlotAmountError}</p>
                            </Form.Text>
                          </Col>
                        </Row>
                      </Form.Group>
                    </Form>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={12}>
                    <Form.Text className="form-text text-muted">
                      <p className="error-text" style={{ width: '300px' }}>
                        {errors}
                      </p>
                    </Form.Text>

                    <div className="d-flex justify-content-between align-items-center">
                      

                      {mode && mode == 'edit' ? (
                        <Button
                          className="submit-btn"
                          onClick={UpdatePreBooking}
                        >
                          {isEnglish ? "Update" : "अपडेट"}
                        </Button>
                      ) : (
                        <Button
                          className="submit-btn"
                          onClick={AddPreBooking}
                        >
                          {isEnglish ? "Add" : "जोड़ें"}
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

export default AddBooking;