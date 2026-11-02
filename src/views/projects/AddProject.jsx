import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoMdAdd } from 'react-icons/io';
import { MdDelete } from 'react-icons/md';
import imageView from '../../images/imageView.png';
import { API_BASE_URL } from 'config/constant';
import { setIsFetched } from 'redux/store/Projects/Action';
import './table.css';

import { ReactTransliterate } from 'react-transliterate';
import api from 'utils/api';
import BackButton from 'components/Loader/BackButton';

function Addproject({ setshowAddProject }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [ProjectName, setProjectName] = useState('');
  const [isBrokerSelected, setIsBrokerSelected] = useState(false);
  const [plotNo, setPlotNo] = useState('');
  const [ProjectImage, setProjectImage] = useState(null);
  const [sectore, setsectore] = useState('');
  const [DLCPrice, setDLCPrice] = useState('');
  const [SquarePrice, setSquarePrice] = useState('');
  const [locationName, setLocationName] = useState('');
  const [imagePrivew, setImagePrivew] = useState();
  const userData = JSON.parse(localStorage.getItem('users'));
  const [FontValue, setFontValue] = useState('2');
  const handleLanguageChange = (e) => setFontValue(e.target.value);

  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState();
  const [reraRegNo, setReraRegNo] = useState('');
  const [reraRegDate, setReraRegDate] = useState('');
  const [khasraNo, setKhasraNo] = useState('');

  const [errors, seterrors] = useState();
  const [ProjectNameError, setProjectNameError] = useState();
  const [PlotNoError, setPlotNoError] = useState();
  const [ImageError, setImageError] = useState();
  const [LocationError, setLocationError] = useState();
  const [SectoreError, setSectoreError] = useState();
  const [DLCError, setDLCError] = useState();
  const [SquarePriceError, setSquarePriceError] = useState();
  const [fields, setFields] = useState([{ sectore: '', plotNo: '', SectoreError: '', PlotNoError: '' }]);
  const [originalFields, setOriginalFields] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cinNumber, setCinNumber] = useState('');
  const [idType, setIdType] = useState('GST');
  const [gstOrPan, setGstOrPan] = useState('');
  const [commissionType, setCommissionType] = useState("percentage");
  const [commissionValue, setCommissionValue] = useState("");
  const [CompanyNameError, setCompanyNameError] = useState('');
  const [CompanyAddressError, setCompanyAddressError] = useState('');
  const [PhoneNumberError, setPhoneNumberError] = useState('');
  const [CINError, setCINError] = useState('');
  const [GSTPanError, setGSTPanError] = useState('');
  const [brokerName, setBrokerName] = useState('');
  const [broker_id, setBroker_id] = useState(null);
  const [BrokerList, setBrokerList] = useState([]);
  const [brokerDropdownOpen, setBrokerDropdownOpen] = useState(false);
  const [brokerFont, setBrokerFont] = useState(null);

  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setBrokerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setOriginalFields([...fields]);
  }, [fields]);

  const location = useLocation();
  const updateData = location.state?.data;
  const mode = location.state?.mode;

  const fetchBrokers = async (keyword) => {
    try {
      const res = await api.get(
        `/booking/searchBrokers?keyword=${keyword}`,
        {
          headers: { Authorization: userData?.user_token },
        }
      );

      if (res.data.success && res.data.data.length > 0) {
        setBrokerList(res.data.data);
        setBrokerDropdownOpen(true);
      } else {
        setBrokerList([]);
        setBrokerDropdownOpen(false);
      }
    } catch (err) {
      console.error(err);
      setBrokerList([]);
      setBrokerDropdownOpen(false);
    }
  };

  useEffect(() => {
    const populateFields = (data) => {
      if (!data) return;
      if (data.name || data.project_name) setProjectName(data.name || data.project_name);
      if (data.plot_number != null) setPlotNo(data.plot_number);
      if (data.image) setProjectImage(data.image);
      if (data.address != null) setLocationName(data.address);
      if (data.square_rate != null) setSquarePrice(data.square_rate);
      if (data.dlc_rate != null) setDLCPrice(data.dlc_rate);
      if (data.sector_name != null) setsectore(data.sector_name);
      if (data.company_name != null) setCompanyName(data.company_name);
      if (data.company_address != null) setCompanyAddress(data.company_address);
      if (data.phone_number != null) setPhoneNumber(data.phone_number);
      if (data.cin_number != null) setCinNumber(data.cin_number);
      if (data.gst_pan_type) setIdType(data.gst_pan_type);
      if (data.gst_pan_number != null) setGstOrPan(data.gst_pan_number);
      const bName = data?.brokers?.[0]?.broker_name || data?.broker_name || '';
      const bId = data?.brokers?.[0]?.broker_id || data?.broker_id || null;
      const bFont = data?.brokers?.[0]?.broker_font || data?.broker_font || 1;
      if (bName) setBrokerName(bName);
      if (bId) setBroker_id(bId);
      if (bFont) setBrokerFont(bFont);
      if (data.commission_type) setCommissionType(data.commission_type);
      if (data.commission_value != null) setCommissionValue(data.commission_value);
      if (data.krutiDev_font != null) setFontValue(String(data.krutiDev_font));
      if (data.rera_reg_no != null) setReraRegNo(data.rera_reg_no);
      if (data.rera_reg_date) setReraRegDate(data.rera_reg_date.split("T")[0]);
      if (data.khasra_no != null) setKhasraNo(data.khasra_no);
      if (data.company_logo) {
        setCompanyLogoPreview(`${API_BASE_URL}/uploads/${data.company_logo}`);
      }
    };

    if (updateData) {
      populateFields(updateData);

      // If key fields are missing from updateData, fetch full details from /project/all
      if (updateData.project_id && (!updateData.company_name || !updateData.gst_pan_number || !updateData.address)) {
        api.get(`/project/all`, {
          params: { project_id: updateData.project_id },
          headers: { Authorization: userData?.user_token }
        }).then((res) => {
          if (res.data.success && Array.isArray(res.data.data)) {
            const found = res.data.data.find(p => Number(p.project_id) === Number(updateData.project_id));
            if (found) {
              populateFields(found);
            }
          }
        }).catch((err) => {
          console.error("Error loading project full details in AddProject:", err);
        });
      }
    }
  }, [updateData]);

  useEffect(() => {
    const fetchSectors = async () => {
      let loadedFields = [];
      const newSec = location.state?.newSectorName;

      if (updateData && updateData.project_id) {
        try {
          const res = await api.get(`/sectors/list`, {
            params: { project_id: updateData.project_id },
            headers: { Authorization: userData.user_token }
          });
          if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
            loadedFields = res.data.data.map((sector) => ({
              sector_id: sector.sector_id,
              sectore: sector.sector_name || sector.name || '',
              plotNo: sector.plot_number || '',
              project_id: sector.project_id,
              SectoreError: '',
              PlotNoError: ''
            }));
          }
        } catch (e) {
          console.error("Error fetching sectors for project:", e);
        }
      }

      if (!loadedFields.length && updateData && Array.isArray(updateData.sector) && updateData.sector.length > 0) {
        loadedFields = updateData.sector.map((sector) => ({
          sector_id: sector.sector_id || null,
          sectore: sector.name || sector.sector_name || '',
          plotNo: sector.plot_number || '',
          project_id: sector.project_id || updateData?.project_id,
          SectoreError: '',
          PlotNoError: ''
        }));
      }

      if (newSec) {
        const sUpper = String(newSec).trim().toUpperCase();
        const alreadyPresent = loadedFields.some((f) => {
          const name = String(f.sectore || '').trim().toUpperCase();
          return name === sUpper || name.replace(/SECTOR\s*[-_]?/i, '').trim() === sUpper;
        });
        if (!alreadyPresent) {
          loadedFields.push({
            sector_id: null,
            sectore: newSec,
            plotNo: '',
            project_id: updateData?.project_id || null,
            SectoreError: '',
            PlotNoError: ''
          });
        }
      }

      if (!loadedFields.length) {
        loadedFields = [{ sectore: newSec || '', plotNo: '', sector_id: null, SectoreError: '', PlotNoError: '' }];
      }

      setFields(loadedFields);
    };

    fetchSectors();
  }, [updateData, location.state?.newSectorName]);

  useEffect(() => {
    if (location.state?.newSectorName) {
      setTimeout(() => {
        const el = document.querySelector('.sector-field-row:last-child');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    }
  }, [location.state?.newSectorName]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProjectImage(file);
      setImagePrivew(URL.createObjectURL(file));
    }
  };

  const handleCompanyLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyLogo(file);
      setCompanyLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProject = async () => {
    dispatch(setIsFetched(false));
    setProjectNameError('');
    setPlotNoError('');
    setImageError('');
    setLocationError('');
    setSquarePriceError('');
    setDLCError('');
    setCompanyNameError('');
    setCompanyAddressError('');
    setGSTPanError('');
    setCINError('');

    let isValid = true;
    if (!ProjectName) {
      setProjectNameError(FontValue === "0" ? 'Project name is required' : 'प्रोजेक्ट का नाम आवश्यक है');
      isValid = false;
    }
    if (!locationName) {
      setLocationError(FontValue === "0" ? 'Address is required' : 'पता आवश्यक है');
      isValid = false;
    }
    if (!SquarePrice) {
      setSquarePriceError(FontValue === "0" ? 'Square Price is required' : 'वर्ग मूल्य आवश्यक है');
      isValid = false;
    }
    if (!DLCPrice) {
      setDLCError(FontValue === "0" ? 'DLC price is required' : 'DLC मूल्य आवश्यक है');
      isValid = false;
    }
    if (!companyName) {
      setCompanyNameError(FontValue === "0" ? "Company Name is required" : "कंपनी का नाम आवश्यक है");
      isValid = false;
    }
    if (!companyAddress) {
      setCompanyAddressError(FontValue === "0" ? "Company Address is required" : "कंपनी का पता आवश्यक है");
      isValid = false;
    }
    if (!gstOrPan) {
      setGSTPanError(
        idType === "GST"
          ? (FontValue === "0" ? "GST Number is required" : "जीएसटी नंबर आवश्यक है")
          : (FontValue === "0" ? "PAN Number is required" : "पैन नंबर आवश्यक है")
      );
      isValid = false;
    }
    if (!cinNumber) {
      setCINError(FontValue === "0" ? "C.I.N Number must be valid" : "सी.आई.एन नंबर मान्य होना चाहिए");
      isValid = false;
    }

    fields.forEach((field, index) => {
      if (!field.sectore) {
        setFields((prev) => {
          const updated = [...prev];
          updated[index].SectoreError = FontValue === "0" ? 'Sector Name is required' : 'सेक्टर का नाम आवश्यक है';
          return updated;
        });
        isValid = false;
      }
      if (!field.plotNo) {
        setFields((prev) => {
          const updated = [...prev];
          updated[index].PlotNoError = FontValue === "0" ? 'Plot Number is required' : 'प्लॉट नंबर आवश्यक है';
          return updated;
        });
        isValid = false;
      }
    });

    if (!isValid) return;

    try {
      const sectorData = fields.map((field) => ({
        name: field.sectore,
        sector_name: field.sectore,
        plot_number: field.plotNo,
        plot_no: field.plotNo,
        sector_id: field.sector_id || null,
        project_id: updateData?.project_id || null,
      }));

      const formData = new FormData();
      formData.append('ProjectId', updateData?.project_id || null);
      formData.append('ProjectName', ProjectName);
      formData.append('address', locationName);
      formData.append('Square_Price', SquarePrice);
      formData.append('DLC_Price', DLCPrice);
      formData.append('sector_data', JSON.stringify(sectorData));
      formData.append("company_name", companyName);
      formData.append("company_address", companyAddress);
      formData.append("cin_number", cinNumber);
      formData.append("phone_number", phoneNumber);
      formData.append("gst_pan_type", idType);
      formData.append("gst_pan_number", gstOrPan || "");
      formData.append("broker_name", broker_id ? brokerName : "");
      formData.append("commission_type", commissionType);
      formData.append("commission_value", commissionValue || 0);
      formData.append("broker_id", broker_id ? broker_id : "");
      formData.append("krutiDev_font", FontValue);
      formData.append("rera_reg_no", reraRegNo);
      formData.append("rera_reg_date", reraRegDate ? reraRegDate : null);
      formData.append("khasra_no", khasraNo);
      if (companyLogo && typeof companyLogo !== 'string') {
        formData.append("company_logo", companyLogo);
      }
      if (ProjectImage && typeof ProjectImage !== 'string') {
        formData.append('ProjectImage', ProjectImage);
      }

      const res = await api.post(`/project/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: userData.user_token,
        },
      });

      if (res.data.success) {
        setsectore('');
        setProjectImage('');
        setPlotNo('');
        setProjectName('');
        navigate(location.state?.returnUrl || '/projects');
      }
    } catch (error) {
      if (error.response) {
        seterrors(error.response.data.message || (FontValue === "0" ? 'Server Error.' : 'सर्वर त्रुटि।'));
      }
    }
  };

  const handleAddProject = async () => {
    dispatch(setIsFetched(false));
    setProjectNameError('');
    setPlotNoError('');
    setImageError('');
    setLocationError('');
    setSectoreError('');
    setDLCError('');
    setSquarePriceError('');
    setCompanyNameError('');
    setCompanyAddressError('');
    setGSTPanError('');
    setCINError('');

    let isValid = true;
    if (!ProjectName) {
      setProjectNameError(FontValue === "0" ? 'Project name is required' : 'प्रोजेक्ट का नाम आवश्यक है');
      isValid = false;
    }
    if (!locationName) {
      setLocationError(FontValue === "0" ? 'Address is required' : 'पता आवश्यक है');
      isValid = false;
    }
    if (!SquarePrice) {
      setSquarePriceError(FontValue === "0" ? 'Square Price is required' : 'वर्ग मूल्य आवश्यक है');
      isValid = false;
    }
    if (!DLCPrice) {
      setDLCError(FontValue === "0" ? 'DLC price is required' : 'DLC मूल्य आवश्यक है');
      isValid = false;
    }

    if (!companyName) {
      setCompanyNameError(FontValue === "0" ? "Company Name is required" : "कंपनी का नाम आवश्यक है");
      isValid = false;
    }

    if (!companyAddress) {
      setCompanyAddressError(FontValue === "0" ? "Company Address is required" : "कंपनी का पता आवश्यक है");
      isValid = false;
    }

    if (!gstOrPan) {
      setGSTPanError(
        idType === "GST"
          ? (FontValue === "0" ? "GST Number is required" : "जीएसटी नंबर आवश्यक है")
          : (FontValue === "0" ? "PAN Number is required" : "पैन नंबर आवश्यक है")
      );
      isValid = false;
    }

    if (!cinNumber) {
      setCINError(FontValue === "0" ? "C.I.N Number must be valid" : "सी.आई.एन नंबर मान्य होना चाहिए");
      isValid = false;
    }

    fields.forEach((field, index) => {
      if (!field.sectore) {
        setFields((prev) => {
          const updated = [...prev];
          updated[index].SectoreError = FontValue === "0" ? 'Sector Name is required' : 'सेक्टर का नाम आवश्यक है';
          return updated;
        });
        isValid = false;
      }
      if (!field.plotNo) {
        setFields((prev) => {
          const updated = [...prev];
          updated[index].PlotNoError = FontValue === "0" ? 'Number of Plot is required' : 'प्लॉट नंबर आवश्यक है';
          return updated;
        });
        isValid = false;
      }
    });

    if (!isValid) return;

    try {
      const sectorData = fields.map((field) => ({
        sector_name: field.sectore,
        plot_no: field.plotNo,
      }));

      const formData = new FormData();
      formData.append('ProjectName', ProjectName);
      formData.append('ProjectImage', ProjectImage);
      formData.append('address', locationName);
      formData.append('Square_Price', SquarePrice);
      formData.append('DLC_Price', DLCPrice);
      formData.append("krutiDev_font", FontValue);
      formData.append('sector_data', JSON.stringify(sectorData));
      formData.append("company_name", companyName);
      formData.append("company_address", companyAddress);
      formData.append("cin_number", cinNumber);
      formData.append("phone_number", phoneNumber);
      formData.append("gst_pan_type", idType);
      formData.append("gst_pan_number", gstOrPan || "");
      formData.append("broker_name", broker_id ? brokerName : "");
      formData.append("commission_type", commissionType);
      formData.append("commission_value", commissionValue || "");
      formData.append("broker_id", broker_id ? broker_id : "");

      if (companyLogo) {
        formData.append("company_logo", companyLogo);
      }
      formData.append("rera_reg_no", reraRegNo);
      formData.append("rera_reg_date", reraRegDate);
      formData.append("khasra_no", khasraNo);

      const res = await api.post(`/project/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: userData.user_token,
        },
      });

      if (res.data.success) {
        setsectore('');
        setProjectImage('');
        setPlotNo('');
        setProjectName('');
        navigate('/projects');
      }
    } catch (error) {
      if (error.response) {
        seterrors(error.response.data.message || (FontValue === "0" ? 'Server Error.' : 'सर्वर त्रुटि।'));
      }
    }
  };

  const handleAddField = () => {
    const lastField = fields[fields.length - 1];
    if (!lastField.sectore || !lastField.plotNo) {
      const updated = [...fields];
      updated[fields.length - 1].SectoreError = !lastField.sectore ? (FontValue === "0" ? 'Sector Name is required' : 'सेक्टर का नाम आवश्यक है') : '';
      updated[fields.length - 1].PlotNoError = !lastField.plotNo ? (FontValue === "0" ? 'Number of Plot is required' : 'प्लॉट नंबर आवश्यक है') : '';
      setFields(updated);
    } else {
      setFields([...fields, { sectore: '', plotNo: '', sector_id: null, project_id: updateData?.project_id || null, SectoreError: '', PlotNoError: '' }]);
    }
  };

  const handleDeleteField = async (index) => {
    if (fields.length === 1) {
      alert(FontValue === "0" ? "You cannot delete the last remaining field." : "आप अंतिम फ़ील्ड को हटा नहीं सकते।");
      return;
    }
    const toDelete = fields[index];
    if (toDelete && toDelete.sector_id) {
      try {
        await api.delete('/sectors', {
          params: { sector_id: toDelete.sector_id },
          headers: { Authorization: userData.user_token }
        });
      } catch (err) {
        console.error("Error deleting sector:", err);
      }
    }
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...fields];
    updated[index][field] = value;
    updated[index].SectoreError = '';
    updated[index].PlotNoError = '';
    setFields(updated);
  };

  return (
    <React.Fragment>
      <Row>
        <BackButton></BackButton>


        
        <Col sm={12}>
          <div className="add-project-card">
            <Card className="card">
              <Card.Header className="project-header">
                <Card.Title as="h5" className="project-title">
                  {mode === 'edit'
                    ? FontValue === "0" ? "Update Project" : "प्रोजेक्ट अपडेट करें"
                    : FontValue === "0" ? "Create Project" : "प्रोजेक्ट जोड़ें"}
                </Card.Title>
                <div style={{ minWidth: '140px' }}>
                  <select
                    className="custom-select"
                    value={FontValue}
                    onChange={handleLanguageChange}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff' }}
                  >
                    <option value="0">English</option>
                    <option value="1">Hindi</option>
                    <option value="2">Mangal</option>
                  </select>
                </div>
              </Card.Header>

              <Card.Body>
                {/* Project Name & Address - Row 1 */}
                <div className="row">
                  <div className="col-md-3 col-sm-6">
                    <div className="form-group">
                      <label className="form-label">
                        {FontValue === "0" ? "Project Name With Phase*" : "प्रोजेक्ट नाम (फेज के साथ)*"}
                      </label>
                      {FontValue === "2" ? (
                        <ReactTransliterate
                          value={ProjectName || ""}
                          onChangeText={(text) => setProjectName(text)}
                          lang="hi"
                          placeholder={FontValue === "0" ? "Enter project name *" : "प्रोजेक्ट का नाम दर्ज करें *"}
                          maxLength={50}
                          className={`form-control form-control-md ${FontValue == 1 ? "kruti-dev" : ""}`}
                        />
                      ) : (
                        <input
                          type="text"
                          className={`form-control form-control-md ${FontValue == 1 ? "kruti-dev" : ""}`}
                          value={ProjectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          maxLength={50}
                          placeholder={FontValue === "0" ? "Enter project name *" : "प्रोजेक्ट का नाम दर्ज करें *"}
                        />
                      )}
                      <span className="error-text">{ProjectNameError}</span>
                    </div>
                  </div>

                  <div className="col-md-3 col-sm-6">
                    <div className="form-group">
                      <label className="form-label">{FontValue === "0" ? "Address*" : "पता*"}</label>
                      {FontValue === "2" ? (
                        <ReactTransliterate
                          value={locationName || ""}
                          onChangeText={(text) => setLocationName(text)}
                          lang="hi"
                          placeholder={FontValue === "0" ? "Enter Address *" : "पता दर्ज करें *"}
                          maxLength={150}
                          className={`form-control form-control-md ${FontValue == 1 ? "kruti-dev" : ""}`}
                        />
                      ) : (
                        <input
                          type="text"
                          className={`form-control form-control-md ${FontValue == 1 ? "kruti-dev" : ""}`}
                          value={locationName}
                          onChange={(e) => setLocationName(e.target.value)}
                          maxLength={150}
                          placeholder={FontValue === "0" ? "Enter Address *" : "पता दर्ज करें *"}
                        />
                      )}
                      <span className="error-text">{LocationError}</span>
                    </div>
                  </div>

                  <div className="col-md-3 col-sm-6">
                    <div className="form-group">
                      <label className="form-label">{FontValue === "0" ? "Company Name*" : "कंपनी का नाम*"}</label>
                      {FontValue === "2" ? (
                        <ReactTransliterate
                          value={companyName || ""}
                          onChangeText={(text) => setCompanyName(text)}
                          lang="hi"
                          placeholder={FontValue === "0" ? "Enter Company Name *" : "कंपनी का नाम दर्ज करें *"}
                          className={`form-control form-control-md ${FontValue == 1 ? "kruti-dev" : ""}`}
                        />
                      ) : (
                        <input
                          type="text"
                          className={`form-control form-control-md ${FontValue == 1 ? "kruti-dev" : ""}`}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder={FontValue === "0" ? "Enter Company Name *" : "कंपनी का नाम दर्ज करें *"}
                        />
                      )}
                      <span className="error-text">{CompanyNameError}</span>
                    </div>
                  </div>

                  <div className="col-md-3 col-sm-6">
                    <div className="form-group">
                      <label className="form-label">{FontValue === "0" ? "Company Address*" : "कंपनी का पता*"}</label>
                      {FontValue === "2" ? (
                        <ReactTransliterate
                          value={companyAddress || ""}
                          onChangeText={(text) => setCompanyAddress(text)}
                          lang="hi"
                          placeholder={FontValue === "0" ? "Enter Company Address *" : "कंपनी का पता दर्ज करें *"}
                          className={`form-control form-control-md ${FontValue == 1 ? "kruti-dev" : ""}`}
                        />
                      ) : (
                        <input
                          type="text"
                          className={`form-control form-control-md ${FontValue == 1 ? "kruti-dev" : ""}`}
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          placeholder={FontValue === "0" ? "Enter Company Address *" : "कंपनी का पता दर्ज करें *"}
                        />
                      )}
                      <span className="error-text">{CompanyAddressError}</span>
                    </div>
                  </div>
                </div>

                {/* Row 2 - Phone, CIN, GST/PAN */}
                <div className="row mt-3">
                  <div className="col-md-3 col-sm-6">
                    <div className="form-group">
                      <label className="form-label">{FontValue === "0" ? "Phone Number" : "फ़ोन नंबर"}</label>
                      <input
                        type="number"
                        className="form-control form-control-md"
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 10) {
                            setPhoneNumber(value);
                          }
                        }}
                        placeholder={FontValue === "0" ? "Enter Phone Number" : "फ़ोन नंबर दर्ज करें"}
                      />
                      <span className="error-text">{PhoneNumberError}</span>
                    </div>
                  </div>

                  <div className="col-md-3 col-sm-6">
                    <div className="form-group">
                      <label className="form-label">{FontValue === "0" ? "C.I.N Number*" : "सी.आई.एन नंबर*"}</label>
                      <input
                        type="text"
                        className="form-control form-control-md"
                        value={cinNumber}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          if (value.length <= 21) {
                            setCinNumber(value);
                          }
                        }}
                        maxLength={21}
                        placeholder={FontValue === "0" ? "Enter C.I.N Number*" : "सी.आई.एन नंबर दर्ज करें*"}
                      />
                      <span className="error-text">{CINError}</span>
                    </div>
                  </div>

                  <div className="col-md-3 col-sm-6">
                    <div className="form-group">
                      <label className="form-label">{FontValue === "0" ? "Select Type" : "प्रकार चुनें"}</label>
                      <div className="radio-group">
                        <div className="custom-radio">
                          <input
                            type="radio"
                            name="idType"
                            value="GST"
                            checked={idType == "GST"}
                            onChange={() => setIdType("GST")}
                            className="form-check-input"
                          />
                          <label className="form-check-label">GST</label>
                        </div>
                        <div className="custom-radio">
                          <input
                            type="radio"
                            name="idType"
                            value="PAN"
                            checked={idType == "PAN"}
                            onChange={() => setIdType("PAN")}
                            className="form-check-input"
                          />
                          <label className="form-check-label">PAN</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3 col-sm-6">
                    <div className="form-group">
                      <label className="form-label">
                        {idType === "GST"
                          ? FontValue === "0" ? "GST Number*" : "जीएसटी नंबर*"
                          : FontValue === "0" ? "PAN Number*" : "पैन नंबर*"}
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-md"
                        value={gstOrPan}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          const maxLen = idType === "GST" ? 15 : 10;
                          if (value.length <= maxLen) {
                            setGstOrPan(value);
                          }
                        }}
                        maxLength={idType === "GST" ? 15 : 10}
                        placeholder={
                          idType === "GST"
                            ? FontValue === "0" ? "Enter GST Number" : "जीएसटी नंबर दर्ज करें"
                            : FontValue === "0" ? "Enter PAN Number" : "पैन नंबर दर्ज करें"
                        }
                      />
                      <span className="error-text">{GSTPanError}</span>
                    </div>
                  </div>
                </div>

                {/* Row 3 - Project Plan, Square Rate, DLC Rate */}
                <div className="row align-items-start">
                  <div className="col-md-4">
                    <div className="form-group file-input-wrapper">
                      <div className="file-input-content">
                        <label className="form-label">
                          {FontValue === "0" ? "Project Plan" : "प्रोजेक्ट योजना"}
                        </label>
                        <input
                          type="file"
                          className="form-control form-control-md"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                        <span className="error-text">{ImageError}</span>
                      </div>
                      <div className="image-preview-box">
                        {imagePrivew ? (
                          <img src={imagePrivew} alt="Preview" />
                        ) : updateData && updateData.image ? (
                          <img src={`${API_BASE_URL}/uploads/${updateData.image}`} alt="Preview" />
                        ) : (
                          <img src={imageView} alt="Preview" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">
                        {FontValue === "0" ? "Square Feet Rate*" : "वर्ग फुट दर*"}
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-md"
                        value={SquarePrice}
                        onChange={(e) => setSquarePrice(e.target.value)}
                        maxLength={20}
                        placeholder={FontValue === "0" ? "Enter Square Price *" : "वर्ग कीमत दर्ज करें *"}
                      />
                      <span className="error-text">{SquarePriceError}</span>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">
                        {FontValue === "0" ? "DLC Rate*" : "डीएलसी दर*"}
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-md"
                        value={DLCPrice}
                        onChange={(e) => setDLCPrice(e.target.value)}
                        placeholder={FontValue === "0" ? "Enter DLC Price*" : "डीएलसी कीमत दर्ज करें *"}
                      />
                      <span className="error-text">{DLCError}</span>
                    </div>
                  </div>
                </div>

                {/* Row 4 - Company Logo, RERA Reg No, RERA Date */}
                <div className="row align-items-start">
                  <div className="col-md-4">
                    <div className="form-group file-input-wrapper">
                      <div className="file-input-content">
                        <label className="form-label">
                          {FontValue === "0" ? "Company Logo" : "कंपनी लोगो"}
                        </label>
                        <input
                          type="file"
                          className="form-control form-control-md"
                          onChange={handleCompanyLogoChange}
                          accept="image/*"
                        />
                      </div>
                      <div className="image-preview-box">
                        {companyLogoPreview ? (
                          <img src={companyLogoPreview} alt="Logo Preview" />
                        ) : updateData && updateData.company_logo ? (
                          <img src={`${API_BASE_URL}/uploads/${updateData.company_logo}`} alt="Logo Preview" />
                        ) : (
                          <img src={imageView} alt="Logo Preview" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">
                        {FontValue === "0" ? "RERA Regn No" : "रेरा रजिस्ट्रेशन नंबर"}
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-md"
                        value={reraRegNo}
                        onChange={(e) => setReraRegNo(e.target.value)}
                        placeholder={FontValue === "0" ? "Enter RERA Regn No" : "रेरा रजिस्ट्रेशन नंबर दर्ज करें"}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">
                        {FontValue === "0" ? "RERA Regn Date" : "रेरा रजिस्ट्रेशन दिनांक"}
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-md"
                        value={reraRegDate}
                        onChange={(e) => setReraRegDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 5 - Khasra No */}
                <div className="row align-items-start">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">
                        {FontValue === "0" ? "Khasra No" : "खसरा नंबर"}
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-md"
                        value={khasraNo}
                        onChange={(e) => setKhasraNo(e.target.value)}
                        placeholder={FontValue === "0" ? "Enter Khasra No" : "खसरा नंबर दर्ज करें"}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 6 - Broker Section */}
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">
                        {FontValue === "0" ? "Broker Name" : "दलाल का नाम"}
                      </label>
                      <div className="position-relative" ref={dropdownRef}>
                        {FontValue === "2" ? (
                          <ReactTransliterate
                            value={brokerName || ""}
                            onChangeText={async (text) => {
                              const value = text || "";
                              setBrokerName(value);
                              setBroker_id(null);
                              setBrokerFont(null);
                              setIsBrokerSelected(false);

                              // Check if user is actively typing English letters to convert in Mangal
                              // e.g. "m", "mit" (ends with English letters without space)
                              const endsWithEnglishLetters = /[a-zA-Z]$/.test(value);

                              if (endsWithEnglishLetters) {
                                // User is still typing in ReactTransliterate
                                // Keep API broker-dropdown closed so both don't open together!
                                setBrokerDropdownOpen(false);
                              } else {
                                // Hindi word selected or Space/Enter pressed!
                                // Now fetch and open the broker list dropdown
                                await fetchBrokers(value.trim());
                                setBrokerDropdownOpen(true);
                              }
                            }}
                            lang="hi"
                            placeholder={FontValue === "0" ? "Select Broker Name" : "दलाल का नाम चुनें"}
                            className={`form-control form-control-md ${brokerFont !== null ? (brokerFont === 1 ? "kruti-dev" : "") : FontValue === "1" ? "kruti-dev" : ""}`}
                            onFocus={() => {
                              const endsWithEnglishLetters = /[a-zA-Z]$/.test(brokerName || "");
                              if (!endsWithEnglishLetters) {
                                fetchBrokers((brokerName || "").trim());
                                setBrokerDropdownOpen(true);
                              }
                            }}
                            onBlur={() => {
                              if (window.blurTimeout) clearTimeout(window.blurTimeout);
                              window.blurTimeout = setTimeout(() => {
                                const matched = BrokerList.find(
                                  (b) =>
                                    (b?.broker_name || "").toLowerCase() ===
                                    (brokerName || "").trim().toLowerCase()
                                );
                                if (matched) {
                                  setBroker_id(matched.broker_id);
                                  setBrokerName(matched.broker_name);
                                  setBrokerFont(matched.kruti_brokers_font);
                                  setIsBrokerSelected(true);
                                } else if (!broker_id) {
                                  setBrokerName("");
                                  setBroker_id(null);
                                  setBrokerFont(null);
                                  setIsBrokerSelected(false);
                                }
                                setBrokerDropdownOpen(false);
                              }, 250);
                            }}
                          />
                        ) : (
                          <input
                            type="text"
                            className={`form-control form-control-md ${brokerFont !== null ? (brokerFont === 1 ? "kruti-dev" : "") : FontValue === "1" ? "kruti-dev" : ""}`}
                            value={brokerName || ""}
                            autoComplete="off"
                            onChange={async (e) => {
                              const value = e.target.value || "";
                              setBrokerName(value);
                              setBroker_id(null);
                              setBrokerFont(null);
                              setIsBrokerSelected(false);
                              await fetchBrokers(value);
                              setBrokerDropdownOpen(true);
                            }}
                            placeholder={FontValue === "0" ? "Select Broker Name" : "दलाल का नाम चुनें"}
                            onFocus={() => {
                              fetchBrokers(brokerName || "");
                              setBrokerDropdownOpen(true);
                            }}
                            onBlur={() => {
                              if (window.blurTimeout) clearTimeout(window.blurTimeout);
                              window.blurTimeout = setTimeout(() => {
                                const matched = BrokerList.find(
                                  (b) =>
                                    (b?.broker_name || "").toLowerCase() ===
                                    (brokerName || "").trim().toLowerCase()
                                );
                                if (matched) {
                                  setBroker_id(matched.broker_id);
                                  setBrokerName(matched.broker_name);
                                  setBrokerFont(matched.kruti_brokers_font);
                                  setIsBrokerSelected(true);
                                } else if (!broker_id) {
                                  setBrokerName("");
                                  setBroker_id(null);
                                  setBrokerFont(null);
                                  setIsBrokerSelected(false);
                                }
                                setBrokerDropdownOpen(false);
                              }, 250);
                            }}
                          />
                        )}

                        {brokerDropdownOpen && BrokerList.length > 0 && (
                          <ul className="broker-dropdown show" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                            {BrokerList.filter((b) => {
                              const searchVal = (brokerName || '').trim().toLowerCase();
                              const name = (b?.broker_name || '').toLowerCase();
                              return !searchVal || name.includes(searchVal);
                            }).map((data, index) => (
                              <li
                                key={index}
                                className={`dropdown-item ${data.kruti_brokers_font === 1 ? "kruti-dev" : ""}`}
                                onMouseDown={() => {
                                  if (window.blurTimeout) clearTimeout(window.blurTimeout);
                                  setBrokerName(data.broker_name);
                                  setBroker_id(data.broker_id);
                                  setBrokerFont(data.kruti_brokers_font);
                                  setIsBrokerSelected(true);
                                  setBrokerDropdownOpen(false);
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <span>{data.broker_name}</span>
                                  {data.phone_number && (
                                    <small style={{ opacity: 0.7, fontSize: '11px', marginLeft: '8px' }}>({data.phone_number})</small>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                        <small style={{ fontSize: '11px', color: '#c9a84c', display: 'block', marginTop: '3px' }}>
                          * केवल लिस्ट में से ही ब्रोकर सेलेक्ट करें (Select from list only)
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label className="form-label">
                        {FontValue === "0" ? "Commission" : "कमीशन"}
                      </label>
                      <div className="radio-group">
                        <div className="custom-radio">
                          <input
                            type="radio"
                            name="commissionType"
                            value="percentage"
                            checked={commissionType === "percentage"}
                            onChange={(e) => setCommissionType(e.target.value)}
                            className="form-check-input"
                          />
                          <label className="form-check-label">Percentage</label>
                        </div>
                        <div className="custom-radio">
                          <input
                            type="radio"
                            name="commissionType"
                            value="fixed"
                            checked={commissionType === "fixed"}
                            onChange={(e) => setCommissionType(e.target.value)}
                            className="form-check-input"
                          />
                          <label className="form-check-label">Fixed</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label className="form-label">
                        {commissionType === "percentage"
                          ? FontValue === "0" ? "Percentage (%)" : "प्रतिशत (%)"
                          : FontValue === "0" ? "Fixed Amount" : "निश्चित राशि"}
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-md"
                        value={commissionValue}
                        onChange={(e) => setCommissionValue(e.target.value)}
                        placeholder={
                          commissionType === "percentage"
                            ? FontValue === "0" ? "Enter Percentage (%)" : "प्रतिशत दर्ज करें (%)"
                            : FontValue === "0" ? "Enter Fixed Amount" : "निश्चित राशि दर्ज करें"
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Row 7 - Sectors Section */}
                <div className="row" style={{ overflow: 'visible' }}>
                  <div className="col-md-6 mt-2" style={{ overflow: 'visible', paddingBottom: '40px' }}>
                    {fields.map((field, index) => (
                      <div key={index} className="sector-field-row" style={{ overflow: 'visible', position: 'relative' }}>
                        <div className="col-md-5 col-sm-5" style={{ overflow: 'visible', position: 'relative' }}>
                          <div className="form-group" style={{ overflow: 'visible', position: 'relative' }}>
                            <label className="form-label">
                              {FontValue === "0" ? "Sector *" : "सेक्टर *"}
                            </label>
                            {FontValue === "2" ? (
                              <ReactTransliterate
                                value={field.sectore || ""}
                                onChangeText={(txt) => handleChange(index, "sectore", txt)}
                                lang="hi"
                                placeholder={FontValue === "0" ? "Enter Sector Name *" : "सेक्टर का नाम दर्ज करें *"}
                                maxLength={30}
                                className={`form-control form-control-md ${FontValue == 1 ? "kruti-dev" : ""}`}
                              />
                            ) : (
                              <input
                                type="text"
                                className={`form-control form-control-md ${FontValue == 1 ? "kruti-dev" : ""}`}
                                placeholder={FontValue === "0" ? "Enter Sector Name *" : "सेक्टर का नाम दर्ज करें *"}
                                value={field.sectore}
                                maxLength={30}
                                onChange={(e) => handleChange(index, "sectore", e.target.value)}
                              />
                            )}
                            {(field.SectoreError || SectoreError) && (
                              <span className="error-text">{field.SectoreError || SectoreError}</span>
                            )}
                          </div>
                        </div>

                        <div className="col-md-5 col-sm-5">
                          <div className="form-group">
                            <label className="form-label">
                              {FontValue === "0" ? "Number of Plot *" : "प्लॉट की संख्या *"}
                            </label>
                            <input
                              type="number"
                              className="form-control form-control-md"
                              placeholder={FontValue === "0" ? "Enter Number of Plot *" : "प्लॉट की संख्या दर्ज करें *"}
                              value={field.plotNo}
                              maxLength={20}
                              onChange={(e) => handleChange(index, "plotNo", e.target.value)}
                              onKeyDown={(e) => {
                                if ([".", ",", "-"].includes(e.key)) e.preventDefault();
                              }}
                            />
                            {(field.PlotNoError || PlotNoError) && (
                              <span className="error-text">{field.PlotNoError || PlotNoError}</span>
                            )}
                          </div>
                        </div>

<div className="col-md-2 col-sm-2 btn-wrapper">
  <button
    className="btn-funky-delete"
    onClick={() => handleDeleteField(index)}
  >
    <MdDelete size={18} />
  </button>
  {index === fields.length - 1 && (
    <button
      className="btn-funky-add"
      onClick={handleAddField}
    >
      <IoMdAdd size={18} />
    </button>
  )}
</div></div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="row">
                  {errors && (
                    <div className="col-12 text-start">
                      <div className="alert alert-danger py-2 px-3 mb-3" role="alert" style={{ fontSize: '13px', fontWeight: 500 }}>
                        {errors}
                      </div>
                    </div>
                  )}
                  <div className="col-12" style={{ textAlign: 'right' }}>
                    {mode === 'edit' ? (
                      <button className="submit-btn" onClick={handleUpdateProject}>
                        {FontValue === "0" ? "Update" : "अपडेट करें"}
                      </button>
                    ) : (
                      <button className="submit-btn" onClick={handleAddProject}>
                        {FontValue === "0" ? "Submit" : "जमा करें"}
                      </button>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
}

export default Addproject;