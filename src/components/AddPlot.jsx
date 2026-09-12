import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Button,
} from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from 'config/constant';
import '../views/tables/table.css';
import '../views/prebooking/style.css';
import direction from '../images/direction.png';
import { ReactTransliterate } from 'react-transliterate';
import BackButton from './Loader/BackButton';

function AddPlot({
  SectorData = [],
  getAllPlots,
  ProjectData,
  plotData,
  updatePlot,
  handleFilterData,
  setUpdatePlot,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem('users') || '{}');

  const [PlotNumber, setPlotNumber] = useState('');
  const [Sector, setSector] = useState('');
  const [PlotRate, setPlotRate] = useState('');
  const [PlotHight, setPlotHight] = useState('');
  const [PlotWidth, setPlotWidth] = useState('');
  const [North, setNorth] = useState('');
  const [East, setEast] = useState('');
  const [south, setSouth] = useState('');
  const [West, setWest] = useState('');
  const [Note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [SquareFeet, setSquareFeet] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [StatusId, setStatusId] = useState('1');
  const [showAlert, setShowAlert] = useState(false);
  const [AlertMsg, setAlertMsg] = useState('');
  const [errors, seterrors] = useState('');
  const [PlotNumberError, setPlotNumberError] = useState('');
  const [SectorError, setSectorError] = useState('');
  const [PlotRateError, setPlotRateError] = useState('');
  const [PlotHightError, setPlotHightError] = useState('');
  const [PlotWidthError, setPlotWidthError] = useState('');
  const [PlotNumberCount, setPlotNumberCount] = useState('');
  const [krutidev, setkrutidev] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [FontValue, setFontValue] = useState('0');  // ⭐ Default English
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [isManualAmount, setIsManualAmount] = useState(false);

  // ⭐ NEW: Helper variables
  const isEnglish = FontValue === "0";
  const isHindi = FontValue === "1";
  const isMangal = FontValue === "2";

  const handleLanguageChange = (e) => setFontValue(e.target.value);

  const navRow = location.state?.oneRow;
  const data = location.state?.data || null;
  const mode = location.state?.mode || null;
  const isUpdateMode = Boolean(plotData || navRow);

  useEffect(() => {
    if (!plotData && !navRow && ProjectData?.square_rate) {
      setPlotRate(String(ProjectData.square_rate));
    }
  }, [ProjectData, plotData, navRow]);

  useEffect(() => {
    const source = plotData || navRow;
    if (source) {
      setPlotNumber(String(source.plot_no ?? ''));
      setAmount(String(source.amount ?? ''));
      setSector(String(source.sector_id ?? ''));
      setPlotRate(String(source.plot_rate ?? ''));
      setPlotHight(String(source.plot_height ?? ''));
      setPlotWidth(String(source.plot_width ?? ''));
      setNote(source.plot_note ?? '');
      setNorth(source.north ?? '');
      setEast(source.east ?? '');
      setSouth(source.south ?? '');
      setWest(source.west ?? '');
      setSquareFeet(String(source.square_feet ?? ''));
      setFontValue(String(source.krutiDev_font ?? source.project_font ?? 0));
      setStatusId(String(source.status_id ?? '1'));
    }
    setIsUserEditing(false);
    setIsManualAmount(false);
  }, [plotData, navRow]);

  const calculateSquareFeet = () => {
    const h = Number(PlotHight) || 0;
    const w = Number(PlotWidth) || 0;
    const area = h * w;
    setSquareFeet(area ? parseFloat(area.toFixed(2)) : '');
  };

  const CalculateRateSquareFeet = () => {
    const rate = Number(PlotRate) || 0;
    const sq = Number(SquareFeet) || 0;
    const ans = rate * sq;
    setAmount(ans ? parseFloat(ans.toFixed(2)) : '');
  };

  useEffect(() => {
    if (PlotHight && PlotWidth && Number(PlotHight) > 0 && Number(PlotWidth) > 0) {
      if (!isUpdateMode) calculateSquareFeet();
      if (isUpdateMode && isUserEditing) calculateSquareFeet();
    }
  }, [PlotHight, PlotWidth, isUserEditing, isUpdateMode]);

  useEffect(() => {
    if (!isManualAmount && PlotRate && SquareFeet && Number(PlotRate) > 0 && Number(SquareFeet) > 0) {
      if (!isUpdateMode) CalculateRateSquareFeet();
      if (isUpdateMode && isUserEditing) CalculateRateSquareFeet();
    }
  }, [PlotRate, SquareFeet, isManualAmount, isUpdateMode, isUserEditing]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/plots/statuses`, {
          headers: { Authorization: userData.user_token },
        });
        if (res.data.success) {
          setStatuses(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching statuses:', error);
      }
    };
    fetchStatuses();
  }, [userData.user_token]);

  const AddPlotFun = async () => {
    seterrors('');
    setPlotNumberError('');
    setSectorError('');
    setPlotRateError('');
    setPlotHightError('');
    setPlotWidthError('');

    if (!Sector) {
      setSectorError(isEnglish ? 'Sector is required' : 'सेक्टर आवश्यक है');
      return;
    }
    if (!PlotNumber) {
      setPlotNumberError(isEnglish ? 'Plot number is required' : 'प्लॉट नंबर आवश्यक है');
      return;
    }
    if (!PlotRate) {
      setPlotRateError(isEnglish ? 'Plot rate is required' : 'वर्ग दर आवश्यक है');
      return;
    }

    try {
      const heightValue = PlotHight === '' || PlotHight == null ? '0' : String(PlotHight);
      const widthValue = PlotWidth === '' || PlotWidth == null ? '0' : String(PlotWidth);

      const payload = {
        plot_no: PlotNumber,
        plot_height: heightValue,
        plot_width: widthValue,
        sector_id: Sector,
        north: North || '',
        east: East || '',
        south: south || '',
        west: West || '',
        plot_rate: PlotRate,
        project_id: ProjectData?.project_id || 0,
        square_feet: SquareFeet || '',
        plot_note: Note || '',
        amount: amount || 0,
        plot_font: FontValue,
        status_id: StatusId || null,
        created_by_id: userData?.user_id,
      };

      const res = await axios.post(`${API_BASE_URL}/plots/add`, payload, {
        headers: { Authorization: userData.user_token },
      });

      if (res?.data?.success) {
        if (typeof getAllPlots === 'function' && ProjectData?.project_id) {
          getAllPlots(ProjectData.project_id);
        }
        setAlertMsg(res.data.message || 'Plot added');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          if (typeof handleFilterData === 'function') handleFilterData(res.data.data[0].sector_id);
        }
      } else {
        seterrors(res?.data?.message || (isEnglish ? 'Something went wrong' : 'कुछ गलत हुआ'));
      }
    } catch (error) {
      console.error('❌ AddPlotFun Error:', error.response?.data || error.message);
      seterrors(error.response?.data?.message || (isEnglish ? 'Server error occurred' : 'सर्वर त्रुटि हुई'));
    }
  };

  const UpdatePlotFun = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (typeof setUpdatePlot === 'function') setUpdatePlot(false);

    seterrors('');
    setPlotNumberError('');
    setSectorError('');
    setPlotRateError('');
    setPlotHightError('');
    setPlotWidthError('');

    if (!Sector) {
      setSectorError(isEnglish ? 'Sector is required' : 'सेक्टर आवश्यक है');
      return;
    }
    if (!PlotNumber) {
      setPlotNumberError(isEnglish ? 'Plot number is required' : 'प्लॉट नंबर आवश्यक है');
      return;
    }

    const plot_id = plotData?.plot_id || navRow?.plot_id;
    if (!plot_id) {
      seterrors(isEnglish ? 'Plot id missing' : 'प्लॉट आईडी गायब है');
      return;
    }

    try {
      const res = await axios.put(
        `${API_BASE_URL}/plots`,
        {
          plot_no: PlotNumber,
          plot_height: PlotHight === "" || PlotHight == null ? 0 : Number(PlotHight),
          plot_width: PlotWidth === "" || PlotWidth == null ? 0 : Number(PlotWidth),
          sector_id: Sector,
          north: North,
          east: East,
          south: south,
          west: West,
          plot_rate: PlotRate,
          plot_id: plot_id,
          square_feet: SquareFeet,
          plot_note: Note,
          amount: amount,
          plot_font: FontValue,
          status_id: StatusId || null,
          updated_by_id: userData?.user_id,
        },
        { headers: { Authorization: userData.user_token } }
      );

      if (res?.data?.success === true) {
        if (typeof handleFilterData === 'function') handleFilterData(Sector);
        if (typeof setUpdatePlot === 'function') setUpdatePlot(false);
        setAlertMsg(res.data.message || 'Updated');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        setPlotRate(ProjectData ? ProjectData.square_rate : '');
        if (typeof getAllPlots === 'function') {
          getAllPlots(plotData?.project_id || navRow?.project_id || ProjectData?.project_id);
        }
      } else {
        seterrors(res?.data?.message || 'Update failed');
      }
    } catch (error) {
      console.error('UpdatePlotFun error:', error.response?.data || error.message);
      seterrors(error.response?.data?.message || (isEnglish ? 'Server error occurred' : 'सर्वर त्रुटि हुई'));
    }
  };

  const handleSectorChange = (e) => {
    const selectedId = e && e.target ? e.target.value : e;
    setSector(String(selectedId ?? ''));
    const selectedSector = SectorData?.find((d) => d.sector_id == selectedId);
    setPlotNumberCount(selectedSector?.plot_number ?? '');
    setkrutidev(selectedSector?.krutiDev_font ?? 0);
    if (typeof handleFilterData === 'function') handleFilterData(selectedId);
  };

  const projectName =
    (updatePlot || navRow)
      ? (navRow?.project_name || navRow?.name || '')
      : (ProjectData?.name || data?.project_name || data?.name || '');

  return (
    <React.Fragment>

       <BackButton isEnglish={isEnglish} />
      {showAlert && (
        <div
          className="alert alert-success position-fixed w-full"
          style={{ top: '20px', right: '20px', zIndex: '1050', minWidth: 260 }}
          role="alert"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>{AlertMsg}</div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setShowAlert(false)}
            />
          </div>
        </div>
      )}

      {/* ⭐⭐⭐ ADD-PROJECT-CARD WRAPPER ⭐⭐⭐ */}
      <div className="add-project-card">
        <Row>
          <Col sm={12}>
            <Card>
              <Card.Header className="project-header">
                <div className="toolbar-row">
                  <Card.Title as="h5" className="project-title">
                    {updatePlot || navRow
                      ? (isEnglish ? "Update Plot" : "प्लॉट अपडेट करें")
                      : (isEnglish ? "Add Plot" : "प्लॉट जोड़ें")}
                  </Card.Title>

                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#F9FAFB',
                      lineHeight: '1.2',
                    }}
                    className={isHindi ? 'kruti-dev' : ''}
                  >
                    {projectName || ''}
                  </div>
                </div>

                <Col md={2}>
                  <Form.Select className="custom-select" value={FontValue} onChange={handleLanguageChange}>
                    <option value="0">English</option>
                    <option value="1">Hindi</option>
                    <option value="2">Mangal</option>
                  </Form.Select>
                </Col>
              </Card.Header>

              <Card.Body>
                <Row>
                  <Col>
                    <Form>
                      <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Row>
                          {/* SECTOR */}
                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? "Sector *" : "सेक्टर संख्या*"}
                            </Form.Label>

                            <div className="position-relative">
                              <div
                                className="form-control form-control-sm"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                style={{ cursor: 'pointer' }}
                              >
                                {Sector
                                  ? <span className={krutidev == 1 || isHindi ? 'kruti-dev' : ''}>
                                      {SectorData?.find(s => s.sector_id == Sector)?.sector_name || ''}
                                    </span>
                                  : (isEnglish ? 'Select Sector *' : 'सेक्टर चुनें *')}
                              </div>

                              {dropdownOpen && (
                                <ul className="broker-dropdown show">
                                  {SectorData?.map((data, index) => (
                                    <li
                                      key={index}
                                      className={`dropdown-item ${data.krutiDev_font == 1 ? 'kruti-dev' : ''}`}
                                      onClick={() => {
                                        handleSectorChange({ target: { value: data.sector_id } });
                                        setDropdownOpen(false);
                                      }}
                                    >
                                      {data.sector_name}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{SectorError}</p>
                            </Form.Text>
                          </Col>

                          {/* PLOT NUMBER */}
                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? "Plot Number *" : "प्लॉट नंबर*"}
                            </Form.Label>
                            <Form.Control
                              value={PlotNumber}
                              onChange={(e) => setPlotNumber(e.target.value)}
                              type="text"
                              placeholder={isEnglish ? "Enter Plot Number *" : "प्लॉट नंबर दर्ज करें *"}
                              className={`form-control form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                            />
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{PlotNumberError}</p>
                            </Form.Text>
                          </Col>

                          {/* SQUARE RATE */}
                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? "Square Rate *" : "वर्ग दर*"}
                            </Form.Label>
                            <Form.Control
                              type="number"
                              value={PlotRate}
                              onChange={(e) => setPlotRate(e.target.value)}
                              placeholder={isEnglish ? "Enter Square Rate *" : "वर्ग दर दर्ज करें *"}
                              className={`form-control form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                            />
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{PlotRateError}</p>
                            </Form.Text>
                          </Col>

                          {/* WIDTH */}
                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? "Width *" : "चौड़ाई*"}
                            </Form.Label>
                            {isMangal ? (
                              <ReactTransliterate
                                value={PlotWidth || ''}
                                onChangeText={(text) => {
                                  if (/^[0-9]*\.?[0-9]*$/.test(text) || text === "") {
                                    setPlotWidth(text);
                                    setIsUserEditing(true);
                                  }
                                }}
                                lang="hi"
                                placeholder={isEnglish ? "Enter Width *" : "चौड़ाई दर्ज करें *"}
                                className={`form-control form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                              />
                            ) : (
                              <Form.Control
                                value={PlotWidth}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  if (val === "") { setPlotWidth(''); return; }
                                  if (!/^[0-9]*\.?[0-9]*$/.test(val)) return;
                                  if (val.length > 10) return;
                                  setPlotWidth(val);
                                  setIsUserEditing(true);
                                  setIsManualAmount(false);
                                }}
                                type="text"
                                placeholder={isEnglish ? "Width *" : "चौड़ाई *"}
                                className={`form-control form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                              />
                            )}
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{PlotWidthError}</p>
                            </Form.Text>
                          </Col>

                          {/* HEIGHT */}
                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? "Height *" : "गहराई*"}
                            </Form.Label>
                            {isMangal ? (
                              <ReactTransliterate
                                value={PlotHight || ''}
                                onChangeText={(text) => {
                                  if (/^[0-9]*\.?[0-9]*$/.test(text) || text === "") {
                                    setPlotHight(text);
                                    setIsUserEditing(true);
                                  }
                                }}
                                lang="hi"
                                placeholder={isEnglish ? "Enter Height *" : "गहराई दर्ज करें *"}
                                className={`form-control form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                              />
                            ) : (
                              <Form.Control
                                value={PlotHight}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  if (val === "") { setPlotHight(''); return; }
                                  if (!/^[0-9]*\.?[0-9]*$/.test(val)) return;
                                  if (val.length > 10) return;
                                  setPlotHight(val);
                                  setIsUserEditing(true);
                                  setIsManualAmount(false);
                                }}
                                type="text"
                                placeholder={isEnglish ? "Height *" : "गहराई *"}
                                className={`form-control form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                              />
                            )}
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{PlotHightError}</p>
                            </Form.Text>
                          </Col>

                          {/* SQUARE FEET */}
                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? "Square Feet *" : "वर्ग फुट*"}
                            </Form.Label>
                            <Form.Control
                              value={SquareFeet}
                              onChange={(e) => {
                                let value = e.target.value;
                                if (!/^\d*\.?\d*$/.test(value)) return;
                                if (value.length > 7) return;
                                setSquareFeet(value);
                                setIsUserEditing(true);
                                setIsManualAmount(false);
                              }}
                              type="text"
                              placeholder={isEnglish ? "Square Feet *" : "वर्ग फुट *"}
                              className={`form-control form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                            />
                          </Col>

                          {/* NOTE */}
                          <Col md={8}>
                            <Form.Label className="form-label">
                              {isEnglish ? "Note" : "टिप्पणी"}
                            </Form.Label>
                            {isMangal ? (
                              <ReactTransliterate
                                value={Note || ''}
                                onChangeText={(text) => setNote(text)}
                                lang="hi"
                                placeholder={isEnglish ? "Enter Note" : "टिप्पणी दर्ज करें"}
                                className={`form-control form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                                maxLength={200}
                              />
                            ) : (
                              <Form.Control
                                value={Note}
                                onChange={(e) => setNote(e.target.value)}
                                type="text"
                                placeholder={isEnglish ? "Note" : "टिप्पणी"}
                                maxLength={200}
                                className={`form-control form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                              />
                            )}
                          </Col>

                          {/* AMOUNT */}
                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? "Amount *" : "राशि*"}
                            </Form.Label>
                            <Form.Control
                              value={amount}
                              onChange={(e) => {
                                setAmount(e.target.value);
                                setIsManualAmount(true);
                              }}
                              type="number"
                              placeholder={isEnglish ? "Amount" : "राशि"}
                              className={`form-control form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                            />
                          </Col>

                          {/* STATUS */}
                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? "Plot Status" : "प्लॉट स्थिति"}
                            </Form.Label>
                            <Form.Select
                              className="form-control form-control-sm"
                              value={StatusId}
                              onChange={(e) => setStatusId(e.target.value)}
                            >
                              <option value="">{isEnglish ? "Select Status" : "स्थिति चुनें"}</option>
                              {statuses
                                .filter((s) => {
                                  const name = s.name || '';
                                  return name.toLowerCase() !== 'booked';
                                })
                                .sort((a, b) => {
                                  const nameA = a.name || '';
                                  const nameB = b.name || '';
                                  return nameA.localeCompare(nameB);
                                })
                                .map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </Form.Select>
                          </Col>
                        </Row>
                      </Form.Group>
                    </Form>
                  </Col>

                  {/* DIRECTION INPUTS */}
                  <Col md={5}>
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div
                        className="position-relative"
                        style={{
                          width: '100%',
                          maxWidth: '160px',
                          height: '160px',
                          backgroundImage: `url(${direction})`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      >
                        {/* North */}
                        <div className="position-absolute top-0 start-50 translate-middle-x">
                          {isMangal ? (
                            <ReactTransliterate
                              value={North || ''}
                              onChangeText={(text) => setNorth(text)}
                              lang="hi"
                              placeholder={isEnglish ? "North" : "उत्तर"}
                              className={`form-control text-center form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                              style={{ width: '100px', padding: '0px', fontSize: '12px', marginTop: '6px' }}
                              maxLength={20}
                            />
                          ) : (
                            <input
                              type="text"
                              className={`form-control text-center form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                              placeholder={isEnglish ? "North" : "उत्तर"}
                              value={North}
                              style={{ width: '100px', padding: '0px', fontSize: '12px', marginTop: '6px' }}
                              onChange={(e) => setNorth(e.target.value)}
                              maxLength={20}
                            />
                          )}
                        </div>

                        {/* South */}
                        <div className="position-absolute bottom-0 start-50 translate-middle-x">
                          {isMangal ? (
                            <ReactTransliterate
                              value={south || ''}
                              onChangeText={(text) => setSouth(text)}
                              lang="hi"
                              placeholder={isEnglish ? "South" : "दक्षिण"}
                              className={`form-control text-center form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                              style={{ width: '100px', padding: '0px', fontSize: '12px', marginBottom: '6px' }}
                              maxLength={20}
                            />
                          ) : (
                            <input
                              type="text"
                              className={`form-control text-center form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                              placeholder={isEnglish ? "South" : "दक्षिण"}
                              value={south}
                              style={{ width: '100px', padding: '0px', fontSize: '12px', marginBottom: '6px' }}
                              onChange={(e) => setSouth(e.target.value)}
                              maxLength={20}
                            />
                          )}
                        </div>

                        {/* West */}
                        <div className="position-absolute top-50 translate-middle-y" style={{ left: '-61px' }}>
                          {isMangal ? (
                            <ReactTransliterate
                              value={West || ''}
                              onChangeText={(text) => setWest(text)}
                              lang="hi"
                              placeholder={isEnglish ? "West" : "पश्चिम"}
                              className={`form-control text-center form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                              style={{ width: '100px', padding: '0px', fontSize: '12px' }}
                              maxLength={20}
                            />
                          ) : (
                            <input
                              type="text"
                              className={`form-control text-center form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                              placeholder={isEnglish ? "West" : "पश्चिम"}
                              value={West}
                              style={{ width: '100px', padding: '0px', fontSize: '12px' }}
                              onChange={(e) => setWest(e.target.value)}
                              maxLength={20}
                            />
                          )}
                        </div>

                        {/* East */}
                        <div className="position-absolute top-50 translate-middle-y" style={{ right: '-61px' }}>
                          {isMangal ? (
                            <ReactTransliterate
                              value={East || ''}
                              onChangeText={(text) => setEast(text)}
                              lang="hi"
                              placeholder={isEnglish ? "East" : "पूर्व"}
                              className={`form-control text-center form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                              style={{ width: '100px', padding: '0px', fontSize: '12px' }}
                              maxLength={20}
                            />
                          ) : (
                            <input
                              type="text"
                              className={`form-control text-center form-control-sm ${isHindi ? "kruti-dev" : ""}`}
                              placeholder={isEnglish ? "East" : "पूर्व"}
                              value={East}
                              style={{ width: '100px', padding: '0px', fontSize: '12px' }}
                              onChange={(e) => setEast(e.target.value)}
                              maxLength={20}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* BUTTONS ROW */}
                <Row className="mt-3">
                  <Col md={12}>
                    <Form.Text className="form-text text-muted">
                      <p className="error-text" style={{ width: '300px' }}>{errors}</p>
                    </Form.Text>

                    <div className="d-flex justify-content-between align-items-center">
                     <div></div>

                      {updatePlot || navRow ? (
                        <Button className="submit-btn" onClick={UpdatePlotFun}>
                          {isEnglish ? "Update" : "अपडेट"}
                        </Button>
                      ) : (
                        <Button className="submit-btn" onClick={AddPlotFun}>
                          {isEnglish ? "Submit" : "जमा करना"}
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* PLOT COUNT */}
                <Row>
                  <Col>
                    {PlotNumberCount && (
                      <p style={{ color: 'green', fontSize: '14px' }}>
                        {isEnglish ? `Number of Plots: ${PlotNumberCount}` : `प्लॉटों की संख्या: ${PlotNumberCount}`}
                      </p>
                    )}
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

export default AddPlot;