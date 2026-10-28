import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Button,
} from 'react-bootstrap';
import { API_BASE_URL } from 'config/constant';
import { useNavigate, useLocation } from 'react-router-dom';
import '../tables/table.css';
import { FaLanguage } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';
import { setIsFetched } from '../../redux/store/Bookings/Action';
import './style.css';

import PasswordModal from 'components/PasswordModal';

import { ReactTransliterate } from 'react-transliterate';
import api from 'utils/api';
import BackButton from 'components/Loader/BackButton';


function AddBooking() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [projectData, setProjectData] = useState();
  const [ProjectId, setProjectId] = useState();
  const dropdownRef = useRef(null);
  const [SectorData, setSectorData] = useState();
  const [sector_id, setSectorId] = useState();
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const pressedKeys = useRef(new Set());

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [AllPlots, setAllPlots] = useState();
  const [PlotNumber, setPlotNumber] = useState();
  const [plotId_,setplotid] = useState()

  const [CustomerName, setCustomerName] = useState();
  const [CustomerNumber, setCustomerNumber] = useState();
  const [CustomerFatherName, setCustomerFatherName] = useState();
  const [CustomerAge, setcustomerAge] = useState();
  const [CustomerAddress, setCustomerAddress] = useState();
  const [SquareFeet, setSquareFeet] = useState();
  const [BaseSquareFeet, setBaseSquareFeet] = useState();
  const [PlcDrc, setPlcDrc] = useState();
  const [Refrens, setRefrens] = useState();
  const [ReferenceId, setReferenceId] = useState();
  const [AmountA, setAmountA] = useState();
  const [AmountB, setAmountB] = useState();

  const [showInput, setShowInput] = useState(false);
  const [BookingAmount, setBookingAmount] = useState();
  const [PaymentType, setPaymentType] = useState([]);
  const [PaymentTypeValue, setPaymentTypeValue] = useState();
  const [TimeofPayment, setTimeofPayment] = useState();
  const [AdditionalComments, setAdditionalComment] = useState();
  const [SquareFeetSize, setSquareFeetSize] = useState();
  const [MoodofPayment, setMoodofPayment] = useState();
  const [agreementDate, SetAgreementDate] = useState();
  const [registerDate, setregisterDate] = useState();
  const [BookingDate, setBookingDate] = useState();

  const [ReferenceOptions, setReferenceOptions] = useState();
  const [filteredOptions, setFilteredOptions] = useState([]);

  const [showAlert, setShowAlert] = useState(false);
  const [AlertMsg, setAlertMsg] = useState();
  const userData = JSON.parse(localStorage.getItem('users'));
  const brokerClickedRef = useRef(false);

  const [Total, SetTotal] = useState();
  const [AmouthideA, SetAmounthideA] = useState();
  const [errors, seterrors] = useState();
  const [ProjectError, setProjectError] = useState();
  const [SectorError, setSectorError] = useState();
  const [PlotError, setPlotError] = useState();
  const [CustomerNameError, setCustomerNameError] = useState();
  const [CustomerNumberError, setCustomerNumberError] = useState();
  const [SquareFeetError, setSquareFeetError] = useState();
  const [PlcDrcError, setPlcDrcError] = useState();
  const [BookingAmountError, setBookingAmountError] = useState();
  const [AmountAError, setAmountAError] = useState();
  const [AmountBError, setAmountBError] = useState();
  const [ModeofPaymentError, setModeofPaymentError] = useState();
  const [TimeofpaymentError, setTimeofpaymentErorr] = useState();
  const [RefrensEror, setRefrensError] = useState();
  const [SquareFeetSizeError, setSquareFeetSizeError] = useState();
  const [CustomerFatherNameError, setCustomerFatherNameError] = useState();
  const [CustomerAgeError, setCustomerAgeError] = useState();
  const [CustomerAddressError, setCustomerAddressError] = useState();
  const [FontValue, setFontValue] = useState(2);
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [broker_id, setBroker_id] = useState('');
  const [brokerName, setBrokerName] = useState('');
  const [brokerDropdownOpen, setBrokerDropdownOpen] = useState(false);
  const [BrokerList, setBrokerList] = useState([]);
  const [commissionType, setCommissionType] = useState("percentage");
  const [commissionValue, setCommissionValue] = useState("");
  const [brokerNumber, setBrokerNumber] = useState("");
  const [brokerNumberError, setBrokerNumberError] = useState("");
  const [isBrokerSelected, setIsBrokerSelected] = useState(false);
  const [brokerFont, setBrokerFont] = useState(null);

  const [project_font, setProject_font] = useState(null);
  const [sector_font, setSector_font] = useState(null);
  const [towrod, setTowrod] = useState("");
  const [TowrodError, setTowrodError] = useState("");


  const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setBrokerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [Class, setClass] = useState(1);

  const [checkno, setCheckno] = useState();
  const [bankname, setbankname] = useState();
  const [branchname, setBranchname] = useState();
  const [checkdate, setCheckdate] = useState();
  const [Errors, setErors] = useState();

  const [isAddDisabled, setIsAddDisabled] = useState(false);
  const [font, setFont] = useState(null);

  const [booking_ids, setbooking_ids] = useState([]);
  const [deleted, SetDeleted] = useState([]);

  const location = useLocation();
  const alertTimer = useRef(null);

  const [showSecondCustomer, setShowSecondCustomer] = useState(false);

  const [customerList, setCustomerList] = useState([
    {
      name: "",
      fatherName: "",
      prefix: "",
      age: "",
      number: "",
      address: "",
      custom_field: "",
      adhar_number: "",
      pan_number: "",
      type: 1,
      id: null
    }
  ]);

  const [errorss, setErrors] = useState([
    { name: "", fatherName: "", age: "", number: "", address: "" }
  ]);

  const showTemporaryAlert = (msg, ms = 3000) => {
    if (alertTimer.current) {
      clearTimeout(alertTimer.current);
      alertTimer.current = null;
    }
    setAlertMsg(msg);
    setShowAlert(true);
    alertTimer.current = setTimeout(() => {
      setShowAlert(false);
      alertTimer.current = null;
    }, ms);
  };

  useEffect(() => {
    return () => {
      if (alertTimer.current) {
        clearTimeout(alertTimer.current);
        alertTimer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const row = location?.state?.oneRow;
    if (!row) return;

    const incomingProjectId = row.project_id ?? row.projectId ?? "";
    const incomingSectorId = row.sector_id ?? row.sectorId ?? "";
    const incomingPlotId = row.plot_id ?? row.plot_no ?? row.plotId ?? "";

    (async () => {
      try {
        if (incomingProjectId) {
          setProjectId(incomingProjectId);
          await getAllSector(incomingProjectId);
        }

        if (incomingSectorId) {
          setSectorId(incomingSectorId);
          await getAllPlots(incomingSectorId);
        } else if (!incomingSectorId && incomingProjectId) {
          if (SectorData && SectorData.length > 0) {
            const firstSector = SectorData[0].sector_id;
            setSectorId(firstSector);
            await getAllPlots(firstSector);
          }
        }

        if (incomingPlotId) {
          setPlotNumber(incomingPlotId);
          
          if (row.plot_rate !== undefined && row.plot_rate !== null) {
            setSquareFeet(row.plot_rate); setBaseSquareFeet(row.plot_rate);
          } else {
            const pl = AllPlots && AllPlots.find(p => String(p.plot_id) === String(incomingPlotId));
            if (pl) { setSquareFeet(pl.plot_rate); setBaseSquareFeet(pl.plot_rate); }
          }

          if (row.square_feet !== undefined && row.square_feet !== null) {
            setSquareFeetSize(row.square_feet);
          } else {
            const pl = AllPlots && AllPlots.find(p => String(p.plot_id) === String(incomingPlotId));
            if (pl) setSquareFeetSize(pl.square_feet);
          }

          if (row.krutiDev_font !== undefined && row.krutiDev_font !== null) {
            setFontValue(Number(row.krutiDev_font));
            setClass(Number(row.krutiDev_font) === 2);
          }

          getAllBookings(incomingPlotId);
        } else {
          if (!AllPlots || AllPlots.length === 0) {
            const sid = incomingSectorId || (SectorData && SectorData[0]?.sector_id);
            if (sid) await getAllPlots(sid);
          }
        }
      } catch (err) {
        console.error("Auto-select error:", err);
      }
    })();
  }, [location?.state?.oneRow]);

  const handleAddCustomer = () => {
    let hasError = false;
    const errs = [...errorss];

    const t = (en, hi) => (Number(FontValue) === 0 ? en : hi);

    const getRelationLabels = (customer = {}) => {
      if (customer.type === 0) {
        return {
          en: "Director Name",
          hi: "निर्देशक का नाम",
        };
      }

      const prefix = customer.prefix || "S/O";

      if (prefix === "W/O") {
        return {
          en: "Husband Name",
          hi: "पति का नाम",
        };
      }
      if (prefix === "D/O") {
        return {
          en: "Customer Father Name*",
          hi: "ग्राहक के पिता का नाम*",
        };
      }
      return {
        en: "Customer Father Name*",
        hi: "ग्राहक पिता का नाम*",
      };
    };

    const updatedCustomers = customerList.map(c => c || {});

    updatedCustomers.forEach((customer, idx) => {
      errs[idx] = errs[idx] || {};

      const { en: relEn, hi: relHi } = getRelationLabels(customer);
      const prefix = customer.prefix || "S/O";

      const nameEmpty = !customer.name || customer.name.trim() === "";
      errs[idx].name = nameEmpty
        ? (customer.type === 1
            ? t("Customer Name is required", "ग्राहक का नाम आवश्यक है")
            : t("Company Name is required", "कंपनी का नाम आवश्यक है"))
        : "";

      const fatherEmpty = !customer.fatherName || customer.fatherName.trim() === "";
      errs[idx].fatherName = fatherEmpty
        ? t(`${relEn} is required`, `${relHi} आवश्यक है`)
        : "";

      if (customer.type === 1) {
        errs[idx].age =
          customer.age === "" ||
          customer.age == null ||
          isNaN(customer.age) ||
          Number(customer.age) <= 0
            ? t("Enter valid age (above 0)", "वैध आयु दर्ज करें (0 से अधिक)")
            : "";
      } else {
        errs[idx].age = "";
      }

      if (prefix === "W/O" || prefix === "D/O") {
        errs[idx].number = "";
      } else {
        errs[idx].number =
          !customer.number || customer.number.length !== 10
            ? t("Enter 10 digit number", "10 अंकों का नंबर दर्ज करें")
            : "";
      }

      const addrEmpty = !customer.address || customer.address.trim() === "";
      errs[idx].address = addrEmpty
        ? t("Address is required", "पता आवश्यक है")
        : "";

      if (
        errs[idx].name ||
        errs[idx].fatherName ||
        errs[idx].age ||
        errs[idx].number ||
        errs[idx].address
      ) {
        hasError = true;
      }
    });

    setErrors(errs);

    if (hasError) {
      setIsAddDisabled(true);
      return;
    }

    if (updatedCustomers.length < 5) {
      setCustomerList([
        ...updatedCustomers,
        {
          name: "",
          fatherName: "",
          prefix: "S/O",
          age: "",
          number: "",
          address: "",
          custom_field: "",
          type: 1,
          id: null,
          adhar_number: "",
          pan_number: "",
        },
      ]);

      setErrors([
        ...errs,
        { name: "", fatherName: "", age: "", number: "", address: "" },
      ]);
    }

    setIsAddDisabled(false);
  };

  useEffect(() => {
    const data = {
      name: CustomerName,
      fatherName: CustomerFatherName,
      age: CustomerAge,
      address: CustomerAddress,
      number: CustomerNumber,
    };
    setCustomerList([data]);
  }, [CustomerName, CustomerFatherName]);

  const handlePasswordSubmit = (enteredPassword) => {
    checkPasswordB(enteredPassword);
  };

  const handleRemoveCustomer = (index, booking_id) => {
    if (mode === 'edit' && index === 0) {
      const t = (en, hi) => (Number(FontValue) === 0 ? en : hi);
      showTemporaryAlert(
        t("Delete not allowed, you can only edit this customer", "डिलीट नहीं कर सकते, सिर्फ एडिट कर सकते हैं")
      );
      return;
    }

    const updatedList = [...customerList];
    updatedList.splice(index, 1);
    setCustomerList(updatedList);

    const updatedErrors = [...errorss];
    updatedErrors.splice(index, 1);
    setErrors(updatedErrors);

    if (booking_id) {
      SetDeleted(prev => [...prev, booking_id]);
    }

    setIsAddDisabled(false);
  };

  const handleCustomerChange = (idx, field, value) => {
    const updatedCustomers = [...customerList];
    updatedCustomers[idx] = updatedCustomers[idx] || {};
    updatedCustomers[idx][field] = value;
    setCustomerList(updatedCustomers);

    const updatedErrors = [...errorss];
    updatedErrors[idx] = updatedErrors[idx] || {};

    const current = updatedCustomers[idx];

    const t = (en, hi) => (Number(FontValue) === 0 ? en : hi);

    const getRelationLabels = () => {
      if (current.type === 0) {
        return {
          en: "Director Name",
          hi: "निर्देशक का नाम",
        };
      }
      const prefix = current.prefix || "S/O";
      if (prefix === "W/O") {
        return {
          en: "Customer Husband Name",
          hi: "ग्राहक पति का नाम",
        };
      }
      if (prefix === "D/O") {
        return {
          en: "Customer Father Name",
          hi: "ग्राहक के पिता का नाम",
        };
      }
      return {
        en: "Customer Father Name",
        hi: "ग्राहक पिता का नाम",
      };
    };

    switch (field) {
      case "name":
        updatedErrors[idx].name =
          value.trim() === ""
            ? current.type === 1
              ? t("Customer Name is required", "ग्राहक का नाम आवश्यक है")
              : t("Company Name is required", "कंपनी का नाम आवश्यक है")
            : "";
        break;

      case "fatherName": {
        const { en: labelEn, hi: labelHi } = getRelationLabels();
        updatedErrors[idx].fatherName =
          value.trim() === ""
            ? t(`${labelEn} is required`, `${labelHi} आवश्यक है`)
            : "";
        break;
      }

      case "age":
        if (current.type === 1) {
          updatedErrors[idx].age =
            value === "" || isNaN(value) || Number(value) <= 0
              ? t("Enter valid age (above 0)", "वैध आयु दर्ज करें (0 से अधिक)")
              : "";
        } else {
          updatedErrors[idx].age = "";
        }
        break;

      case "number": {
        const prefix = current.prefix || "S/O";

        if (prefix === "W/O" || prefix === "D/O") {
          updatedErrors[idx].number = "";
        } else {
          updatedErrors[idx].number =
            value.length !== 10
              ? t("Enter 10 digit number", "10 अंकों का नंबर दर्ज करें")
              : "";
        }
        break;
      }

      case "address":
        updatedErrors[idx].address =
          value.trim() === ""
            ? t("Address is required", "पता आवश्यक है")
            : "";
        break;

      default:
        break;
    }

    setErrors(updatedErrors);

    const allValid = updatedCustomers.every((cust, i) => {
      if (!cust) return false;
      const e = updatedErrors[i] || {};

      const prefix = cust.prefix || "S/O";

      const numberOk =
        prefix === "W/O" || prefix === "D/O"
          ? true
          : !!cust.number && !e.number;

      const hasBasicFields =
        cust.name?.trim() !== "" &&
        cust.fatherName?.trim() !== "" &&
        cust.address?.trim() !== "" &&
        !e.name &&
        !e.fatherName &&
        !e.address &&
        numberOk;

      if (cust.type === 1) {
        return hasBasicFields && cust.age && !e.age;
      } else {
        return hasBasicFields;
      }
    });

    setIsAddDisabled(!allValid);
  };

  const FromLable = [
    { id: 0, EnglishName: 'Select Project *', HindiName: 'प्रोजेक्ट चुनें *' },
    { id: 1, EnglishName: 'Select Sector *', HindiName: 'सेक्टर चुनें *' },
    { id: 2, EnglishName: 'Select Plot no *', HindiName: 'प्लॉट नंबर चुनें *' },
    { id: 3, EnglishName: 'Customer Name *', HindiName: 'ग्राहक का नाम *' },
    { id: 4, EnglishName: 'Customer Father Name*', HindiName: 'ग्राहक के पिता का नाम*' },
    { id: 5, EnglishName: 'Age *', HindiName: 'आयु *' },
    { id: 6, EnglishName: 'Customer Number*', HindiName: 'ग्राहक का मोबाइल नंबर*' },
    { id: 7, EnglishName: 'Customer Address *', HindiName: 'ग्राहक का पता *' },
    { id: 8, EnglishName: 'Square Feet Rate *', HindiName: 'वर्ग फुट दर *' },
    { id: 9, EnglishName: 'Booking Amount *', HindiName: 'बुकिंग राशि *' },
    { id: 10, EnglishName: 'Amount *', HindiName: 'राशि *' },
    { id: 11, EnglishName: 'Square Feet Size *', HindiName: 'वर्ग फुट आकार*' },
    { id: 12, EnglishName: 'Mode of payment ', HindiName: 'भुगतान का प्रकार' },
    { id: 13, EnglishName: 'Time of payment ', HindiName: 'भुगतान का समय ' },
    { id: 14, EnglishName: 'Additional comments', HindiName: 'अतिरिक्त टिप्पणियां' },
    { id: 15, EnglishName: 'Reference', HindiName: 'संदर्भ' },
    { id: 16, EnglishName: 'Date of agreement', HindiName: 'समझौते की तिथि' },
    { id: 17, EnglishName: 'Date of register', HindiName: 'रजिस्टर की तारीख' },
    { id: 18, EnglishName: 'Welcome ', HindiName: 'स्वागत' },
    { id: 19, EnglishName: 'Amount  ', HindiName: 'राशि ' },
    { id: 20, EnglishName: 'Total  Amount ', HindiName: 'कुल रराशि' },
    { id: 21, EnglishName: 'Business ', HindiName: 'व्यवसाय' },
    { id: 22, EnglishName: 'Cheque No', HindiName: 'चेक नंबर' },
    { id: 23, EnglishName: 'Bank Name ', HindiName: 'बैंक का नाम' },
    { id: 24, EnglishName: 'Branch Name ', HindiName: 'शाखा का नाम' },
    { id: 25, EnglishName: 'Cheque Date', HindiName: 'चेक की तारीख' },
    { id: 26, EnglishName: 'Broker Name', HindiName: 'दलाल का नाम' },
    { id: 27, EnglishName: 'Booking Date', HindiName: 'बुकिंग की तारीख' }
  ];

  const { mode, data, project_Id } = location?.state || {};

  useEffect(() => {
    const initializeData = async () => {
      try {
        const projectResponse = await api.get(`/project/all`, {
          headers: { authorization: userData.user_token }
        });

        if (projectResponse.data.success) {
          const projects = projectResponse.data.data;
          setProjectData(projects);

          const selectedProjectId = Array.isArray(data) && data.length > 0 
            ? data[0].project_id 
            : data?.project_id || '';

          if (selectedProjectId) setProjectId(selectedProjectId);

          if (selectedProjectId) {
            const sectorResponse = await api.get(`/sectors/list`, {
              params: { project_id: selectedProjectId },
              headers: { Authorization: userData.user_token }
            });

            if (sectorResponse.data.success) {
              const sectors = sectorResponse.data.data;
              setSectorData(sectors);

              const selectedSectorId = Array.isArray(data) && data.length > 0 
                ? data[0].sector_id 
                : data?.sector_id || '';

              setSectorId(selectedSectorId);
              const foundSector = sectors?.find((s) => String(s.sector_id) === String(selectedSectorId));
              if (foundSector) {
                setSector_font(Number(foundSector.krutiDev_font ?? foundSector.kruti_font ?? 0));
              }

              if (selectedSectorId) {
                const selectedPlotId = Array.isArray(data) && data.length > 0 
                  ? data[0].plot_id 
                  : data?.plot_id || '';

                const plotResponse = await api.get(`/plots/list`, {
                  params: { 
                    sector_id: selectedSectorId,
                    showBooked: 0,
                    plot_id: data ? selectedPlotId : ''
                  },
                  headers: { Authorization: userData.user_token }
                });

                if (plotResponse.data.success) {
                  const plots = plotResponse.data.data;
                  setAllPlots(plots);

                  if (selectedPlotId) {
                    setPlotNumber(selectedPlotId);
                  }
                }
              }
            }
          }
        }

        const paymentResponse = await api.get(`/payment/mode`, {
          headers: { Authorization: userData.user_token }
        });

        if (paymentResponse.data.success) {
          setPaymentType(paymentResponse.data.data);

          const paymentModeId = Array.isArray(data) && data.length > 0 
            ? data[0].payment_mode_id 
            : data?.payment_mode_id || '';

          setPaymentTypeValue(paymentModeId);
        }
      } catch (error) {
        console.log(error, 'Initialization error');
      }
    };

    initializeData();

    if (data) {
      const currentData = Array.isArray(data) ? data[0] : data;

      setTowrod(currentData.towords || "");
      setplotid(currentData.plot_id);
      let effective = Number(currentData.square_feet_rate) || 0;
      let plc = Number(currentData.plc_drc) || 0;
      let base = effective;
      if (plc !== 0) {
        base = effective / (1 + (plc / 100));
      }
      setSquareFeet(currentData.square_feet_rate || '');
      setBaseSquareFeet(base || '');
      setPlcDrc(currentData.plc_drc || '');
      setSquareFeetSize(currentData.square_feet_size || '');
      setRefrens(currentData.reference_name || '');
      setAmountA(currentData.amount_a || '');
      setAmountB(currentData.amount_b || '');
      setBookingAmount(currentData.booking_amount || '');
      setTimeofPayment(currentData.payment_time || '');
      setAdditionalComment(currentData.additional_comment || '');
      setBrokerName(currentData.broker_name);
      setBroker_id(currentData.broker_id);
      setBrokerNumber(currentData.broker_number);
      setCommissionType(currentData.commission_type);
      setCommissionValue(currentData.commission_value);

      setPlotNumber(currentData.plot_no);
      setFontValue(currentData.krutiDev_font);

      const amountA = Number(currentData.amount_a || 0);
      const amountB = Number(currentData.amount_b || 0);
      SetTotal(amountA + amountB);

      setFontValue(Number(currentData.krutiDev_font));
      setClass(currentData.krutiDev_font);
      setFont(Number(currentData.krutiDev_font));
      setProject_font(currentData.project_font);
const formattedAgreementDate = currentData.agreement_date
  ? formatDate(currentData.agreement_date)
  : '';
const formattedRegisterDate = currentData.register_date
  ? formatDate(currentData.register_date)
  : '';
const formattedcheckDate = currentData.check_date
  ? formatDate(currentData.check_date)
  : '';
const formattedBookingDate = currentData.booking_date
  ? formatDate(currentData.booking_date)
  : '';

      SetAgreementDate(formattedAgreementDate);
      setregisterDate(formattedRegisterDate);
      setCheckdate(formattedcheckDate);
      setCheckno(currentData.check_no || '');
      setBranchname(currentData.branch_name);
      setbankname(currentData.bank_name);
      setBookingDate(formattedBookingDate);

      if (Array.isArray(data) && data.length > 0) {
        const customers = data.map((item) => ({
          name: item.customer_name || '',
          fatherName: item.customer_father_name || '',
          prefix: item.relation_prefix || '',
          age: item.customer_age || '',
          address: item.customer_address || '',
          number: item.mobile_no || '',
          id: item.booking_id || '',
          custom_field: item.custom_field,
          type: item.type,
          adhar_number: item.adhar_number || '',
          pan_number: item.pan_number || '',
        }));
        setCustomerList(customers);
        const ids = data.map((item) => item.booking_id || null);
        setbooking_ids(ids);
      } else {
        const customerObj = {
          name: data.customer_name || '',
          fatherName: data.customer_father_name || '',
          prefix: data.prefix || '',
          age: data.customer_age || '',
          address: data.customer_address || '',
          number: data.mobile_no || '',
          id: data.booking_id || '',
          custom_field: data.custom_field,
        };
        setCustomerList([customerObj]);
        setbooking_ids([data.booking_id || null]);
      }
    } else {
      setSquareFeet('');
      setPlcDrc('');
      setSquareFeetSize('');
      setRefrens('');
      setAmountA('');
      setAmountB('');
      setBookingAmount('');
      setTimeofPayment('');
      setAdditionalComment('');
      SetAgreementDate('');
      setregisterDate('');
      setCheckdate('');
      setCustomerList([]);
      setBookingDate('');
    }
  }, [data]);

  useEffect(() => {
    let base = Number(BaseSquareFeet) || 0;
    if (PlcDrc !== undefined && PlcDrc !== null && PlcDrc !== '') {
      let percent = Number(PlcDrc);
      let calculatedRate = Math.round((base + (base * percent / 100)) * 100) / 100;
      setSquareFeet(calculatedRate);
    } else {
      if (base > 0) {
        setSquareFeet(base);
      }
    }
  }, [PlcDrc, BaseSquareFeet]);

  const CalculateRateSquareFeet = () => {
    const ans = Math.round(((Number(SquareFeet) || 0) * (Number(SquareFeetSize) || 0)) * 100) / 100;
    setAmountA(ans);
  };
  
  useEffect(() => {
    if (SquareFeet > 0 || SquareFeetSize > 0) {
      CalculateRateSquareFeet();
    } else {
      setAmountA('');
    }
  }, [SquareFeet, SquareFeetSize]);

  const getAllProjects = async () => {
    try {
      const res = await api.get(`/project/all`, {
        headers: {
          Authorization: userData.user_token
        },
        params: {
          user_id: userData?.user_id
        }
      });

      if (res.data.success === true) {
        setProjectData(res.data.data);
      }
    } catch (error) {
      console.log(error, 'get all project api error');
    }
  };

  const getAllSector = async (selectedProjectId) => {
    try {
      const res = await api.get(`/sectors/list`, {
        params: { project_id: selectedProjectId },
        headers: {
          Authorization: userData.user_token
        }
      });

      if (res.data.success == true) {
        setSectorData(res.data.data);
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // noop
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getAllPlots = async (selectedSectorId) => {
    try {
      const res = await api.get(`/plots/list`, {
        params: { sector_id: selectedSectorId,
          showBooked: 0
        },
        headers: {
          Authorization: userData?.user_token
        }
      });
      if (res.data.success == true) {
        setAllPlots(res.data.data);
      }
    } catch (error) {
      console.log(error, 'error get all plots api ');
    }
  };
  
  const TypeofPayment = async () => {
    try {
      const res = await api.get(`/payment/mode`, {
        headers: {
          Authorization: userData?.user_token
        }
      });

      if (res.data.success == true) {
        setPaymentType(res.data.data);
        if (res.data.data.length > 0) {
          setPaymentTypeValue(data?.payment_mode || res.data.data[0].id);
        }
      }
    } catch (error) { }
  };
  
  const handleProjectChange = (event) => {
    const selectedProjectId = event.target.value;
    setProjectId(selectedProjectId);
    
    // ⭐ Clear Sector and Plot when Project changes
    setSectorId('');
    setPlotNumber('');
    setAllPlots([]);
    setSquareFeet('');
    setPlcDrc('');
    setSquareFeetSize('');

    const selectedProject = projectData?.find(
      (p) => p.project_id == selectedProjectId
    );

    if (selectedProject) {
      setBrokerName(
        selectedProject?.brokers && selectedProject.brokers.length > 0
          ? selectedProject.brokers[0].broker_name
          : selectedProject?.broker_name || ""
      );

      const projectKrutiFlag = Number(selectedProject.krutiDev_font || 2);
      setProject_font(projectKrutiFlag);

      setBrokerNumber(
        selectedProject?.brokers && selectedProject.brokers.length > 0
          ? selectedProject.brokers[0].phone_number
          : selectedProject?.phone_number || ""
      );

      setBroker_id(
        selectedProject?.brokers && selectedProject.brokers.length > 0
          ? selectedProject.brokers[0].broker_id
          : selectedProject?.broker_id || ""
      );

      setCommissionType(selectedProject?.commission_type || "");
      setCommissionValue(selectedProject?.commission_value || "");
    } else {
      console.log("Project not found for ID:", selectedProjectId);
      setProject_font(0);
    }

    if (selectedProjectId) {
      getAllSector(selectedProjectId);
    } else {
      setProjectId('');
    }
  };
  
  useEffect(() => {
    if (Array.isArray(PaymentType) && PaymentType.length > 0) {
      if (!PaymentTypeValue && PaymentTypeValue !== 0) {
        setPaymentTypeValue(Number(PaymentType[0].id));
      }
    }
  }, [PaymentType,PlotNumber]);

  const handleSectorChange = (event) => {
    const selectedSectorId = event.target.value;

    setSectorId(selectedSectorId);
    const foundSector = SectorData?.find((s) => String(s.sector_id) === String(selectedSectorId));
    setSector_font(foundSector ? Number(foundSector.krutiDev_font ?? foundSector.kruti_font ?? 0) : 0);

    // ⭐ Clear Plot when Sector changes
    setPlotNumber('');
    setSquareFeet('');
    setPlcDrc('');
    setSquareFeetSize('');

    if (selectedSectorId) {
      getAllPlots(selectedSectorId);
    } else {
      setSectorId('');
      setSector_font(0);
    }
  };

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

  const AddBooking = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    dispatch(setIsFetched(false));

    if (!ProjectId) {
      setProjectError('Project is required');
      setIsSubmitting(false);
      return;
    }
    if (!sector_id) {
      setSectorError('Sector is required');
      setIsSubmitting(false);
      return;
    }
    if (!PlotNumber) {
      setPlotError('Plot is required');
      setIsSubmitting(false);
      return;
    }

    let hasError = false;
    const updatedErrors = [...errorss];

    customerList.forEach((cust, idx) => {
      updatedErrors[idx] = updatedErrors[idx] || {};
      const isCustomer = cust.type == 1;
      const prefix = cust.prefix || "S/O";

      const t = (en, hi) => (Number(FontValue) === 0 ? en : hi);

      let relEn = "Customer Father name";
      let relHi = "Customer पिता का नाम";

      if (!isCustomer) {
        relEn = "Director name";
        relHi = "निर्देशक का नाम";
      } else {
        if (prefix === "W/O") {
          relEn = " Customer Husband Name";
          relHi = "ग्राहक पति का नाम";
        } else if (prefix === "D/O") {
          relEn = "Customer Father Name*";
          relHi = "ग्राहक के पिता का नाम";
        }
      }

      updatedErrors[idx].name =
        !cust.name || cust.name.trim() === ""
          ? (FontValue == 0
            ? isCustomer
              ? "Customer name is required"
              : "Company name is required"
            : isCustomer
              ? "ग्राहक का नाम आवश्यक है"
              : "कंपनी का नाम आवश्यक है")
          : "";

      updatedErrors[idx].fatherName =
        !cust.fatherName || cust.fatherName.trim() === ""
          ? t(`${relEn} is required`, `${relHi} आवश्यक है`)
          : "";

      if (isCustomer) {
        updatedErrors[idx].age =
          !cust.age || cust.age.toString().trim() === "" || Number(cust.age) <= 0
            ? (FontValue == 0 ? "Enter valid age (above 0)" : "वैध आयु दर्ज करें (0 से अधिक)")
            : "";
      } else {
        updatedErrors[idx].age = "";
      }

      if (prefix === "W/O" || prefix === "D/O") {
        updatedErrors[idx].number = "";
      } else {
        updatedErrors[idx].number =
          !cust.number || cust.number.toString().trim() === ""
            ? (FontValue == 0 ? "Mobile number is required" : "मोबाइल नंबर आवश्यक है")
            : cust.number.toString().length < 10
              ? (FontValue == 0 ? "Enter a valid number" : "मान्य नंबर दर्ज करें")
              : "";
      }

      updatedErrors[idx].address =
        !cust.address || cust.address.trim() === ""
          ? (FontValue == 0 ? "Address is required" : "पता आवश्यक है")
          : "";

      if (
        updatedErrors[idx].name ||
        updatedErrors[idx].fatherName ||
        updatedErrors[idx].age ||
        updatedErrors[idx].number ||
        updatedErrors[idx].address
      ) {
        hasError = true;
      }
    });

    setErrors(updatedErrors);
    if (hasError) {
      setIsSubmitting(false);
      return;
    }

    if (!SquareFeet) {
      setSquareFeetError('Square feet rate is required');
      setIsSubmitting(false);
      return;
    }

    if (!SquareFeetSize) {
      setSquareFeetSizeError('Square feet size is required');
      setIsSubmitting(false);
      return;
    }

    const customersArray = customerList.map(cust => ({
      customer_name: cust.name || '',
      CustomerFatherName: cust.fatherName || '',
      CustomerAge: cust.type == 1 && cust.age ? parseInt(cust.age) : null,
      prefix: cust.prefix || 'S/O',
      CustomerAddress: cust.address || '',
      mobile_no: cust.number ? parseInt(cust.number) : null,
      aadhaar_number: cust.adhar_number || null,
      pan_number: cust.pan_number || null,
      custom_field: cust.custom_field || null,
      type: cust.type
    }));

    try {
      const res = await api.post(`/booking/add`,
        {
          project_id: Number(ProjectId),
          sector_id: Number(sector_id),
          plot_id: Number(PlotNumber),
          customers: customersArray,
          square_feet_size: Number(SquareFeetSize),
          mobile_no: Number(customerList[0].number),
          square_feet_rate: Number(SquareFeet),
          plc_drc: PlcDrc ? Number(PlcDrc) : null,
          booking_amount: Number(BookingAmount),
          amount_a: Number(AmountA),
          amount_b: Number(AmountB),
          amount_c: Number(AmouthideA),
          payment_mode: PaymentTypeValue ? Number(PaymentTypeValue) : 5,
          broker_number: Number(brokerNumber),

          time_of_payment: TimeofPayment,
          additional_comment: AdditionalComments,
          refrens: Refrens,
          agreement_date: agreementDate,
          register_date: registerDate,
          booking_date: BookingDate || null,
          krutiDev_font: FontValue,
          check_no: checkno,
          branch_name: branchname,
          bank_name: bankname,
          check_date: checkdate,
          towords: towrod,
          broker_name: broker_id ? brokerName : null,
          broker_id: broker_id ? Number(broker_id) : null,
          commission_type: commissionType,
          commission_value: commissionValue,
          created_by_id: userData?.user_id
        },
        {
          headers: { Authorization: userData?.user_token }
        }
      );

      if (res.data.success == true) {
        showTemporaryAlert(res.data.message);

        setTimeout(() => {
          navigate(`/bookings${location.state?.fromSearch || ''}`);
        }, 900);

        setPlotNumber('');
        setSectorId('');
        setProjectId('');
        setCustomerName('');
        setCustomerNumber('');
        setSquareFeet('');
        setPlcDrc('');
        setRefrens('');
        setAmountA('');
        setAmountB('');
        dispatch(setIsFetched(false));
        setBookingAmount('');
        setPaymentType('');
        setAdditionalComment('');
        setMoodofPayment('');
        SetAgreementDate('');
        setregisterDate('');
        setTimeofPayment('');
        setCheckdate('');
        setBookingDate('');
      } else {
        seterrors(res.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const UpdateBooking = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    dispatch(setIsFetched(false));

    setCustomerAgeError("");
    setCustomerFatherNameError("");
    setCustomerAddressError("");
    setProjectError("");
    setSectorError("");
    setPlotError("");
    setCustomerNameError("");
    setCustomerNumberError("");
    setSquareFeetError("");
    setBookingAmountError("");
    setAmountAError("");
    setAmountBError("");
    setTimeofpaymentErorr("");
    setRefrensError("");
    setModeofPaymentError("");

    if (!ProjectId) setProjectError("Project is required");
    if (!sector_id) setSectorError("Sector is required");
    if (!PlotNumber) setPlotError("Plot is required");
    if (!SquareFeet) setSquareFeetError("Square feet rate is required");

    if (!ProjectId || !sector_id || !PlotNumber || !SquareFeet) {
      setIsSubmitting(false);
      return;
    }

    let hasError = false;
    const updatedErrors = [...errorss];

    customerList.forEach((cust, idx) => {
      updatedErrors[idx] = updatedErrors[idx] || {};
      const isCustomer = cust.type == 1;
      const prefix = cust.prefix || "S/O";

      const t = (en, hi) => (Number(FontValue) === 0 ? en : hi);

      let relEn = "Customer Father name";
      let relHi = "Customer पिता का नाम";

      if (!isCustomer) {
        relEn = "Director name";
        relHi = "निर्देशक का नाम";
      } else {
        if (prefix === "W/O") {
          relEn = " Customer Husband Name";
          relHi = "ग्राहक पति का नाम";
        } else if (prefix === "D/O") {
          relEn = "Customer Father Name*";
          relHi = "ग्राहक के पिता का नाम";
        }
      }

      updatedErrors[idx].name =
        !cust.name || cust.name.trim() === ""
          ? (FontValue == 0
            ? isCustomer
              ? "Customer name is required"
              : "Company name is required"
            : isCustomer
              ? "ग्राहक का नाम आवश्यक है"
              : "कंपनी का नाम आवश्यक है")
          : "";

      updatedErrors[idx].fatherName =
        !cust.fatherName || cust.fatherName.trim() === ""
          ? t(`${relEn} is required`, `${relHi} आवश्यक है`)
          : "";

      if (isCustomer) {
        updatedErrors[idx].age =
          !cust.age || cust.age.toString().trim() === "" || Number(cust.age) <= 0
            ? (FontValue == 0 ? "Enter valid age (above 0)" : "वैध आयु दर्ज करें (0 से अधिक)")
            : "";
      } else {
        updatedErrors[idx].age = "";
      }

      if (prefix === "W/O" || prefix === "D/O") {
        updatedErrors[idx].number = "";
      } else {
        updatedErrors[idx].number =
          !cust.number || cust.number.toString().trim() === ""
            ? (FontValue == 0 ? "Mobile number is required" : "मोबाइल नंबर आवश्यक है")
            : cust.number.toString().length < 10
              ? (FontValue == 0 ? "Enter a valid number" : "मान्य नंबर दर्ज करें")
              : "";
      }

      updatedErrors[idx].address =
        !cust.address || cust.address.trim() === ""
          ? (FontValue == 0 ? "Address is required" : "पता आवश्यक है")
          : "";

      if (
        updatedErrors[idx].name ||
        updatedErrors[idx].fatherName ||
        updatedErrors[idx].age ||
        updatedErrors[idx].number ||
        updatedErrors[idx].address
      ) {
        hasError = true;
      }
    });

    setErrors(updatedErrors);
    if (hasError) {
      setIsSubmitting(false);
      return;
    }

    try {
      const transformedCustomers = (customerList || []).map(cust => ({
        ...cust,
        CustomerFatherName: `${cust.prefix ? cust.prefix + ' ' : ''}${cust.fatherName || ''}`.trim()
      }));

      const payload = {
        booking_ids,
        sector_id: sector_id || null,
        plot_id: PlotNumber ? Number(PlotNumber) : null,
        square_feet_size: SquareFeetSize ? Number(SquareFeetSize) : null,
        square_feet_rate: SquareFeet ? Number(SquareFeet) : null,
        plc_drc: PlcDrc ? Number(PlcDrc) : null,
        booking_amount: BookingAmount ? Number(BookingAmount) : null,
        amount_a: AmountA ? Number(AmountA) : null,
        amount_b: AmountB ? Number(AmountB) : null,
        payment_mode: PaymentTypeValue ? Number(PaymentTypeValue) : 5,
        broker_number: Number(brokerNumber),
        towords: towrod,
        time_of_payment: TimeofPayment || null,
        additional_comment: AdditionalComments || null,
        refrens: Refrens || null,
        agreement_date: agreementDate || null,
        register_date: registerDate || null,
        booking_date: BookingDate || null,
        krutiDev_font: FontValue || 0,
        customers: transformedCustomers || [],
        delete_booking_ids: deleted || [],
        check_no: checkno || null,
        branch_name: branchname || null,
        bank_name: bankname || null,
        check_date: checkdate || null,
        project_id: Number(ProjectId),
        broker_id: broker_id ? Number(broker_id) : null,
        broker_name: broker_id ? brokerName : null,
        commission_type: commissionType || null,
        commission_value: commissionValue ? Number(commissionValue) : null,
        mobile_no: customerList?.[0]?.number ? Number(customerList[0].number) : null,
        updated_by_id: userData?.user_id
      };

      const res = await api.put(`/booking`, payload, {
        headers: { Authorization: userData?.user_token },
      });

      if (res.data.success) {
        showTemporaryAlert(res.data.message || "Booking updated successfully");

        setTimeout(() => {
          navigate(`/bookings${location.state?.fromSearch || ''}`);
        }, 900);
      } else {
        seterrors(res.data.message || "Failed to update booking.");
      }
    } catch (error) {
      console.error("❌ Update Booking Error:", error);
      seterrors("An error occurred while updating booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkPasswordB = async (password) => {
    try {
      const res = await api.post(`/users/passwordb`, {
        user_id: userData.user_id,
        password_b: password
      });

      if (res.data.success === true) {
        setShowPasswordModal(false);
        setShowInput(() => true)
      } else {
        setErors(res.data.message)
        setShowPasswordModal(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllReference = async () => {
    try {
      const res = await api.get(`/reference/all`, {
        headers: {
          authorization: userData.user_token
        }
      });
      if (res.data.success == true) {
        setReferenceOptions(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const getAllBookings = async (plotId) => {
    setCustomerName('');
    setCustomerFatherName('');
    setCustomerAddress('');
    setcustomerAge('');
    setCustomerNumber('');

    setBookingAmount('');
    setPaymentTypeValue('');
    setTimeofPayment('');
    setAdditionalComment('');
    setRefrens('');
    SetAgreementDate('');
    setregisterDate('');
    setCheckdate('');
    try {
      const res = await api.get(`/booking/list`, {
        headers: {
          Authorization: userData.user_token
        },
        params: {
          plot_id: plotId,
          user_id: userData?.user_id
        }
      });

      if (res.data.success == true) {
        const customers = Array.isArray(res?.data?.data) && res.data.data.length > 0
          ? res.data.data.map((item) => ({
            name: item.customer_name || '',
            fatherName: item.customer_father_name || '',
            prefix: item.prefix || '',
            age: item.customer_age || '',
            address: item.customer_address || '',
            number: item.mobile_no || '',
            custom_field: item.custom_field,
            type: item.type || 1
          }))
          : [
            {
              name: '',
              fatherName: '',
              prefix: '',
              age: '',
              address: '',
              number: '',
              type: 1
            },
          ];

        setCustomerList(customers);
        setBookingAmount(res.data?.data[0]?.booking_amount);

        if (res.data?.data[0]?.amount_a > 0) {
          setAmountA(res.data?.data[0]?.amount_a);
        }
        setAmountB(res.data?.data[0]?.amount_b);
        const amountAValue = res.data?.data[0]?.amount_a || 0;
        const amountBValue = res.data?.data[0]?.amount_b || 0;

        const total = Number(amountAValue) + Number(amountBValue);
        SetTotal(total);

        setPaymentTypeValue(res.data?.data[0]?.payment_mode_id);
        setTimeofPayment(res.data?.data[0]?.payment_time);
        setAdditionalComment(res.data?.data[0]?.additional_comment);
        setRefrens(res.data?.data[0]?.refer);
      // ✅ NEW CODE - ये लगाएं
const formattedAgreementDate = res.data?.data[0]?.agreement_date
  ? formatDate(res.data.data[0].agreement_date)
  : '';
const formattedRegisterDate = res.data?.data[0]?.register_date
  ? formatDate(res.data.data[0].register_date)
  : '';
        SetAgreementDate(formattedAgreementDate);
        setregisterDate(formattedRegisterDate);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const plotOnchange = (e) => {
    const plotId = e.target.value;
    setPlotNumber(plotId);

    const selectedPlot = AllPlots?.find((plot) => plot.plot_id == plotId);
    if (selectedPlot) {
      setSquareFeet(selectedPlot.plot_rate);
      setBaseSquareFeet(selectedPlot.plot_rate);
      setPlcDrc('');
      setSquareFeetSize(selectedPlot.square_feet);
    }

    if (plotId && mode !== 'edit') {
      getAllBookings(plotId);
    }
  };

  useEffect(() => {
    getAllProjects();
    TypeofPayment();
    getAllReference();
  }, []);
  
  useEffect(() => {
    if (project_Id) {
      setProjectId(project_Id);
      getAllSector(project_Id);
    }
  }, [project_Id]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setRefrens(value);

    const matches = ReferenceOptions ? ReferenceOptions.filter((option) => option?.name?.toLowerCase().includes(value.toLowerCase())) : [];

    setFilteredOptions(matches);
  };

  useEffect(() => {
    if (!BookingDate && mode !== "edit") {
      setBookingDate(new Date().toISOString().split("T")[0]);
    }
  }, [mode]);

  useEffect(() => {
    if (userData?.role_id !== 4) {
      const handleKeyDown = (event) => {
        pressedKeys.current.add(event.key.toLowerCase());

        if (
          (event.ctrlKey || pressedKeys.current.has('control')) &&
          pressedKeys.current.has('b') &&
          pressedKeys.current.has('c')
        ) {
          if (!showInput) {
            setShowPasswordModal(true);
          } else {
            setShowInput(false);
          }
          pressedKeys.current.clear();
        }
      };

      const handleKeyUp = (event) => {
        pressedKeys.current.delete(event.key.toLowerCase());
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [userData, showInput]);

  const handleAmountBChange = (e) => {
    const value = e.target.value;
    setAmountB(value);

    const total = Number(AmountA) + Number(value);
    SetTotal(total);
    if (value < 0) {
      setAmountBError('Amount cannot be negative.');
    } else {
      setAmountBError('');
    }
  };

  const isHindi = Number(FontValue) === 1;
  const isEnglish = Number(FontValue) === 0;
  const isMaganl = Number(FontValue) === 2;

  const handleLanguageChange = (e) => {
    const numeric = Number(e.target.value);
    setClass(numeric === 2);
    setFontValue(numeric);
  };

  const useKrutiClass = (dataKrutiFlag) => {
    return isHindi || Number(dataKrutiFlag) ===1 || Number(font) ===1  || Number(project_font) === 1;
  };

  return (
    <React.Fragment>
        <BackButton />
      {showAlert && (
        <div
          className="alert alert-success position-fixed w-full"
          style={{ top: '20px', right: '20px', zIndex: '1050', minWidth: 260 }}
          role="alert"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div>{AlertMsg}</div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => {
                setShowAlert(false);
                if (alertTimer.current) {
                  clearTimeout(alertTimer.current);
                  alertTimer.current = null;
                }
              }}
            />
          </div>
        </div>
      )}

      <div className="add-project-card">
        <Row>
          <Col sm={12}>
            <Card>
              <Card.Header className="project-header">
                {mode && mode == 'edit' ? 
                  <Card.Title as="h5" className="project-title">Update Booking</Card.Title> : 
                  <Card.Title as="h5" className="project-title">Add Booking</Card.Title>
                }
                <Col md={2}>
                  <Form.Select className="custom-select"
                   value={FontValue} onChange={handleLanguageChange}>
                    <option value={0}>English</option>
                    <option value={1}>Hindi</option>
                    <option value={2}>Maganl</option>
                  </Form.Select>
                </Col>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col>
                    <Form>
                      <Form.Group className="mb-3" controlId="formBasicEmail">
                        {/* Project, Sector, Plot Row */}
                        <Row>
                          {/* Project Dropdown */}
                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? FromLable[0].EnglishName : FromLable[0].HindiName}
                            </Form.Label>

                            <div className="position-relative">
                              <div
                                className="form-control form-control-sm"
                                onClick={() => {
                                  setProjectDropdownOpen(!projectDropdownOpen);
                                  setSectorDropdownOpen(false);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                {ProjectId
                                  ? <span className={`${useKrutiClass(project_font) ? 'kruti-dev' : ''}`}>
                                    {projectData?.find(p => p.project_id === ProjectId)?.name}
                                  </span>
                                  : (isEnglish ? FromLable[0].EnglishName : FromLable[0].HindiName)}
                              </div>

                              {projectDropdownOpen && (
                                <ul className="broker-dropdown show">
                                  {projectData &&
                                    projectData.map((data, index) => (
                                      <li
                                        key={index}
                                        className={`dropdown-item ${useKrutiClass(data.krutiDev_font) ? 'kruti-dev' : ''}`}
                                        onClick={() => {
                                          handleProjectChange({ target: { value: data.project_id } });
                                          setProjectDropdownOpen(false);
                                        }}
                                      >
                                        <span className={`${useKrutiClass(data.krutiDev_font) ? 'kruti-dev' : ''}`}>
                                          {data.name}
                                        </span>
                                      </li>
                                    ))}
                                </ul>
                              )}
                            </div>

                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{ProjectError}</p>
                            </Form.Text>
                          </Col>

                          {/* Sector Dropdown - Disabled until Project selected */}
   <Col md={4}>
  <Form.Label className="form-label">
    {isEnglish ? FromLable[1].EnglishName : FromLable[1].HindiName}
  </Form.Label>
  
  {(() => {
    const selectedSector = SectorData?.find((s) => String(s.sector_id) === String(sector_id));
    const isSelectedKruti = Number(selectedSector?.krutiDev_font ?? selectedSector?.kruti_font ?? sector_font) === 1;

    return (
      <Form.Select
        className={`custom-select ${!ProjectId ? 'disabled-custom' : ''} ${isSelectedKruti ? 'kruti-dev' : ''}`}
        style={isSelectedKruti ? { fontFamily: "'Kruti Dev 010', sans-serif !important", fontSize: '16px' } : undefined}
        onChange={handleSectorChange}
        value={sector_id || ''}
        disabled={!ProjectId}
      >
        <option value="" style={{ fontFamily: 'inherit' }}>
          {isEnglish ? "Select Sector" : "सेक्टर चुनें"}
        </option>
        {SectorData?.map((data, index) => {
          const isItemKruti = Number(data.krutiDev_font ?? data.kruti_font) === 1;
          return (
            <option
              key={index}
              value={data.sector_id}
              className={isItemKruti ? 'kruti-dev' : ''}
              style={isItemKruti ? { fontFamily: "'Kruti Dev 010', sans-serif !important", fontSize: '16px' } : undefined}
            >
              {data.sector_name}
            </option>
          );
        })}
      </Form.Select>
    );
  })()}
  
  <Form.Text className="form-text text-muted">
    <p className="error-text">{SectorError}</p>
  </Form.Text>
</Col>
                          {/* Plot Dropdown - Disabled until Sector selected */}
                          <Col md={4}>
  <Form.Label className="form-label">
    {isEnglish ? FromLable[2]?.EnglishName : FromLable[2]?.HindiName}
  </Form.Label>
  <Form.Select
    className={`custom-select ${!sector_id ? 'disabled-custom' : ''}`}
    onChange={plotOnchange}
    value={PlotNumber}
    disabled={!sector_id}
  >
    <option value="">
      {isEnglish ? "Select Plot" : "प्लॉट चुनें"}
    </option>
    {AllPlots &&
      AllPlots.map((data, index) => (
        <option key={index} value={data.plot_id}>
          {data.plot_no}
        </option>
      ))}
  </Form.Select>
  <Form.Text className="form-text text-muted">
    <p className="error-text">{PlotError}</p>
  </Form.Text>
</Col>
                        </Row>

                        <hr />

                        {/* Customer List */}
                        {customerList.map((customer, idx) => (
                          <React.Fragment key={idx}>
                            <Row className="mb-2">
                              <Col md={4}>
                                <Form.Label className="form-label">
                                  {customer.type === 1
                                    ? (isEnglish ? FromLable[3].EnglishName : FromLable[3].HindiName)
                                    : (isEnglish ? "Company Name" : "कंपनी का नाम")}
                                </Form.Label>

                                {isMaganl ? (
                                  <ReactTransliterate
                                    value={customer.name || ""}
                                    onChangeText={(txt) => handleCustomerChange(idx, "name", txt)}
                                    lang="hi"
                                    placeholder={
                                      customer.type === 1
                                        ? (isEnglish ? FromLable[3].EnglishName : FromLable[3].HindiName)
                                        : (isEnglish ? "Company Name" : "कंपनी का नाम")
                                    }
                                    maxLength={25}
                                    className={`form-control form-control-sm ${useKrutiClass(customer.kruti_font) ? "kruti-dev" : ""}`}
                                  />
                                ) : (
                                  <Form.Control
                                    value={customer.name}
                                    onChange={(e) => handleCustomerChange(idx, "name", e.target.value)}
                                    type="text"
                                    placeholder={
                                      customer.type === 1
                                        ? (isEnglish ? FromLable[3].EnglishName : FromLable[3].HindiName)
                                        : (isEnglish ? "Company Name" : "कंपनी का नाम")
                                    }
                                    className={`form-control form-control-sm ${useKrutiClass(customer.kruti_font) ? "kruti-dev" : ""}`}
                                    maxLength={25}
                                  />
                                )}

                                <Form.Text className="form-text text-muted">
                                  {errorss[idx]?.name && (
                                    <p className="error-text">{errorss[idx].name}</p>
                                  )}
                                </Form.Text>
                              </Col>

                              <Col md={4}>
                                {customer.type === 0 ? (
                                  <>
                                    <Form.Label className="form-label">
                                      {isEnglish ? "Director Name" : "निर्देशक का नाम"}
                                    </Form.Label>
                                    {isMaganl ? (
                                      <ReactTransliterate
                                        value={customer.fatherName || ""}
                                        onChangeText={(txt) => handleCustomerChange(idx, "fatherName", txt)}
                                        lang="hi"
                                        placeholder={isEnglish ? "Director Name" : "निर्देशक का नाम"}
                                        className={`form-control form-control-sm ${useKrutiClass(customer.kruti_font) ? "kruti-dev" : ""}`}
                                      />
                                    ) : (
                                      <Form.Control
                                        value={customer.fatherName}
                                        onChange={(e) => handleCustomerChange(idx, "fatherName", e.target.value)}
                                        type="text"
                                        placeholder={isEnglish ? "Director Name" : "निर्देशक का नाम"}
                                        className={`form-control form-control-sm ${useKrutiClass(customer.kruti_font) ? "kruti-dev" : ""}`}
                                      />
                                    )}
                                    <Form.Text className="form-text text-muted">
                                      {errorss[idx]?.fatherName && (
                                        <p className="error-text">{errorss[idx].fatherName}</p>
                                      )}
                                    </Form.Text>
                                  </>
                                ) : (
                                  <>
                                    {(() => {
                                      const prefixValue = customer.prefix || "";
                                      if (prefixValue === "W/O") {
                                        return <Form.Label className="form-label">{isEnglish ? "Customer Husband Name*" : "ग्राहक पति का नाम*"}</Form.Label>;
                                      }
                                      if (prefixValue === "D/O") {
                                        return <Form.Label className="form-label">{isEnglish ? "Customer Father Name*" : "ग्राहक के पिता का नाम*"}</Form.Label>;
                                      }
                                      return <Form.Label className="form-label">{isEnglish ? FromLable[4].EnglishName : FromLable[4].HindiName}</Form.Label>;
                                    })()}

                                    <div className="d-flex-align-center gap-2" style={{ width: "100%" }}>
                                      <Form.Select
                                        value={customer.prefix || "S/O"}
                                        onChange={(e) => handleCustomerChange(idx, "prefix", e.target.value)}
                                        className="form-control form-control-sm custom-select"
                                        style={{ width: "28%" }}
                                      >
                                        <option value="S/O">S/O</option>
                                        <option value="W/O">W/O</option>
                                        <option value="D/O">D/O</option>
                                      </Form.Select>

                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        {isMaganl ? (
                                          <ReactTransliterate
                                            value={customer.fatherName || ""}
                                            onChangeText={(txt) => handleCustomerChange(idx, "fatherName", txt)}
                                            lang="hi"
                                            placeholder={
                                              customer.prefix === "W/O"
                                                ? (isEnglish ? "Customer Husband Name*" : " ग्राहक पति का नाम*")
                                                : customer.prefix === "D/O"
                                                ? (isEnglish ? "Customer Father Name*" : "ग्राहक के पिता का नाम*")
                                                : (isEnglish ? FromLable[4].EnglishName : FromLable[4].HindiName)
                                            }
                                            style={{ width: "100%" }}
                                            className={`form-control form-control-sm ${useKrutiClass(customer.kruti_font) ? "kruti-dev" : ""}`}
                                          />
                                        ) : (
                                          <Form.Control
                                            value={customer.fatherName}
                                            onChange={(e) => handleCustomerChange(idx, "fatherName", e.target.value)}
                                            type="text"
                                            placeholder={
                                              customer.prefix === "W/O"
                                                ? (isEnglish ? " Customer Husband Name*" : " ग्राहक पति का नाम*")
                                                : customer.prefix === "D/O"
                                                ? (isEnglish ? "Customer Father Name*" : "ग्राहक के पिता का नाम*")
                                                : (isEnglish ? FromLable[4].EnglishName : FromLable[4].HindiName)
                                            }
                                            style={{ width: "100%" }}
                                            className={`form-control form-control-sm ${useKrutiClass(customer.kruti_font) ? "kruti-dev" : ""}`}
                                          />
                                        )}
                                      </div>
                                    </div>

                                    <Form.Text className="form-text text-muted">
                                      {errorss[idx]?.fatherName && (
                                        <p className="error-text">{errorss[idx].fatherName}</p>
                                      )}
                                    </Form.Text>
                                  </>
                                )}
                              </Col>

                              {customer.type === 1 && (
                                <Col sm={1}>
                                  <Form.Label className="form-label">
                                    {isEnglish ? FromLable[5].EnglishName : FromLable[5].HindiName}
                                  </Form.Label>
                                  <Form.Control
                                    value={customer.age}
                                    onChange={(e) => {
                                      if (e.target.value.length <= 3) handleCustomerChange(idx, "age", e.target.value);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "." || e.key === "-" || e.key === "e") e.preventDefault();
                                    }}
                                    type="number"
                                    placeholder={isEnglish ? FromLable[5].EnglishName : FromLable[5].HindiName}
                                    className="form-control form-control-sm"
                                  />
                                  <Form.Text className="form-text text-muted">
                                    {errorss[idx]?.age && (
                                      <p className="error-text">{errorss[idx].age}</p>
                                    )}
                                  </Form.Text>
                                </Col>
                              )}

                              <Col md={customer.type === 1 ? 3 : 4}>
                                <Form.Label className="form-label">
                                  {isEnglish ? "Mobile Number" : "मोबाइल नंबर"}
                                </Form.Label>
                                <Form.Control
                                  value={customer.number}
                                  onChange={(e) => {
                                    const val = e.target.value.slice(0, 10);
                                    handleCustomerChange(idx, "number", val);
                                  }}
                                  type="number"
                                  placeholder={isEnglish ? "Mobile Number" : "मोबाइल नंबर"}
                                  className="form-control form-control-sm"
                                  maxLength={10}
                                />
                                <Form.Text className="form-text text-muted">
                                  {errorss[idx]?.number && (
                                    <p className="error-text">{errorss[idx].number}</p>
                                  )}
                                </Form.Text>
                              </Col>
                            </Row>

                            <Row className="mb-2">
                              <Col md={4}>
                                <Form.Label className="form-label">
                                  {isEnglish ? "Address*" : "पता*"}
                                </Form.Label>
                                {isMaganl ? (
                                  <ReactTransliterate
                                    value={customer.address || ""}
                                    onChangeText={(txt) => handleCustomerChange(idx, "address", txt)}
                                    lang="hi"
                                    placeholder={isEnglish ? "Address" : "पता"}
                                    maxLength={100}
                                    className={`form-control form-control-sm ${useKrutiClass(customer.kruti_font) ? "kruti-dev" : ""}`}
                                  />
                                ) : (
                                  <Form.Control
                                    value={customer.address}
                                    onChange={(e) => handleCustomerChange(idx, "address", e.target.value)}
                                    type="text"
                                    placeholder={isEnglish ? "Address" : "पता"}
                                    className={`form-control form-control-sm ${useKrutiClass(customer.kruti_font) ? "kruti-dev" : ""}`}
                                    maxLength={100}
                                  />
                                )}
                                <Form.Text className="form-text text-muted">
                                  {errorss[idx]?.address && (
                                    <p className="error-text">{errorss[idx].address}</p>
                                  )}
                                </Form.Text>
                              </Col>

                              <Col md={4}>
                                <Form.Label className="form-label">
                                  {isEnglish ? "Aadhaar Number" : "आधार नंबर"}
                                </Form.Label>
                                <Form.Control
                                  value={customer.adhar_number}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, "");
                                    if (value.length > 12) value = value.slice(0, 12);
                                    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
                                    handleCustomerChange(idx, "adhar_number", value);
                                  }}
                                  type="text"
                                  placeholder={isEnglish ? "Aadhaar Number" : "आधार नंबर"}
                                  className="form-control form-control-sm"
                                />
                              </Col>

                              <Col md={4}>
                                <Form.Label className="form-label">
                                  {isEnglish ? "PAN Number" : "पैन नंबर"}
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  value={customer.pan_number || ""}
                                  onChange={(e) => {
                                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                                    handleCustomerChange(idx, "pan_number", value);
                                  }}
                                  placeholder={isEnglish ? "PAN Number" : "पैन नंबर"}
                                  className="form-control form-control-sm"
                                  maxLength={10}
                                />
                              </Col>
                            </Row>

                            <Row className="mb-2">
                              <Col md={4}>
                                <Form.Label className="form-label">
                                  {isEnglish ? FromLable[21].EnglishName : FromLable[21].HindiName}
                                </Form.Label>
                                {isMaganl ? (
                                  <ReactTransliterate
                                    value={customer.custom_field || ""}
                                    onChangeText={(txt) => handleCustomerChange(idx, "custom_field", txt)}
                                    lang="hi"
                                    placeholder={isEnglish ? FromLable[21].EnglishName : FromLable[21].HindiName}
                                    maxLength={100}
                                    className={`form-control form-control-sm ${useKrutiClass(customer.kruti_font) ? "kruti-dev" : ""}`}
                                  />
                                ) : (
                                  <Form.Control
                                    value={customer.custom_field}
                                    onChange={(e) => handleCustomerChange(idx, "custom_field", e.target.value)}
                                    placeholder={isEnglish ? FromLable[21].EnglishName : FromLable[21].HindiName}
                                    maxLength={100}
                                    className={`form-control form-control-sm ${useKrutiClass(customer.kruti_font) ? "kruti-dev" : ""}`}
                                  />
                                )}
                              </Col>

                              <Col md={8} className="d-flex mt-3 justify-content-end align-items-center gap-3">
                                <div className="radio-group">
                                  <Form.Check
                                    type="radio"
                                    id={`radio1-${idx}`}
                                    name={`status-${idx}`}
                                    label={isEnglish ? "Customer" : "ग्राहक"}
                                    checked={customer.type == 1}
                                    onChange={() => handleCustomerChange(idx, "type", 1)}
                                    className="custom-radio mb-0"
                                  />
                                  <Form.Check
                                    type="radio"
                                    id={`radio0-${idx}`}
                                    name={`status-${idx}`}
                                    label={isEnglish ? "Company" : "कंपनी"}
                                    checked={customer.type === 0}
                                    onChange={() => handleCustomerChange(idx, "type", 0)}
                                    className="custom-radio mb-0"
                                  />
                                </div>

                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleRemoveCustomer(idx, customer?.id)}
                                  className="btn-remove-customer ms-2"
                                >
                                  X
                                </Button>
                              </Col>
                            </Row>

                            <hr />
                          </React.Fragment>
                        ))}

                        <Button
                          size="sm"
                          onClick={handleAddCustomer}
                          className="btn-add-customer my-2"
                          disabled={isAddDisabled || customerList.length >= 5}
                        >
                          + {isEnglish ? "Add Customer" : "ग्राहक जोड़ें"}
                        </Button>
                        
                        {/* Broker Section */}
                        <Row>
                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish
                                ? FromLable.find((item) => item.id === 26)?.EnglishName
                                : FromLable.find((item) => item.id === 26)?.HindiName}
                            </Form.Label>

                            <div className="position-relative" ref={dropdownRef}>
                              {isMaganl ? (
                                <ReactTransliterate
                                  value={brokerName}
                                  onChangeText={async (text) => {
                                    const value = text || "";
                                    setBrokerName(value);
                                    setBroker_id(null);
                                    setBrokerFont(null);
                                    setIsBrokerSelected(false);

                                    const endsWithEnglishLetters = /[a-zA-Z]$/.test(value);
                                    if (endsWithEnglishLetters) {
                                      setBrokerDropdownOpen(false);
                                    } else {
                                      await fetchBrokers(value.trim());
                                      setBrokerDropdownOpen(true);
                                    }
                                  }}
                                  lang="hi"
                                  placeholder={isEnglish
                                    ? FromLable.find((item) => item.id === 26)?.EnglishName
                                    : FromLable.find((item) => item.id === 26)?.HindiName}
                                  className={`form-control form-control-sm ${
                                    brokerFont !== null
                                      ? brokerFont == 1
                                        ? "kruti-dev"
                                        : ""
                                      : isHindi
                                      ? "kruti-dev"
                                      : ""
                                  }`}
                                  onFocus={() => {
                                    const endsWithEnglishLetters = /[a-zA-Z]$/.test(brokerName || "");
                                    if (!endsWithEnglishLetters) {
                                      fetchBrokers((brokerName || "").trim());
                                      setBrokerDropdownOpen(true);
                                    }
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => {
                                      if (brokerClickedRef.current) {
                                        brokerClickedRef.current = false;
                                        return;
                                      }
                                      const matched = BrokerList.find(
                                        (b) =>
                                          b.broker_name.toLowerCase() ===
                                          (brokerName || "").trim().toLowerCase()
                                      );
                                      if (matched) {
                                        setBroker_id(matched.broker_id);
                                        setBrokerName(matched.broker_name);
                                        setBrokerNumber(matched.phone_number || "");
                                        setBrokerFont(matched.kruti_brokers_font);
                                      } else if (!broker_id) {
                                        setBrokerName("");
                                        setBrokerNumber("");
                                        setBroker_id(null);
                                        setBrokerFont(null);
                                      }
                                      setBrokerDropdownOpen(false);
                                    }, 250);
                                  }}
                                />
                              ) : (
                                <Form.Control
                                  type="text"
                                  value={brokerName}
                                  autoComplete="off"
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setBrokerName(value);
                                    setBroker_id(null);
                                    setBrokerFont(null);
                                    fetchBrokers(value);
                                  }}
                                  placeholder={isEnglish
                                    ? FromLable.find((item) => item.id === 26)?.EnglishName
                                    : FromLable.find((item) => item.id === 26)?.HindiName}
                                  className={`form-control form-control-sm ${
                                    brokerFont !== null
                                      ? brokerFont == 1
                                        ? "kruti-dev"
                                        : ""
                                      : isHindi
                                      ? "kruti-dev"
                                      : ""
                                  }`}
                                  onFocus={() => {
                                    fetchBrokers(brokerName || "");
                                    setBrokerDropdownOpen(true);
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => {
                                      if (brokerClickedRef.current) {
                                        brokerClickedRef.current = false;
                                        return;
                                      }
                                      const matched = BrokerList.find(
                                        (b) =>
                                          b.broker_name.toLowerCase() ===
                                          (brokerName || "").trim().toLowerCase()
                                      );
                                      if (matched) {
                                        setBroker_id(matched.broker_id);
                                        setBrokerName(matched.broker_name);
                                        setBrokerNumber(matched.phone_number || "");
                                        setBrokerFont(matched.kruti_brokers_font);
                                      } else if (!broker_id) {
                                        setBrokerName("");
                                        setBrokerNumber("");
                                        setBroker_id(null);
                                        setBrokerFont(null);
                                      }
                                      setBrokerDropdownOpen(false);
                                    }, 250);
                                  }}
                                />
                              )}

                              {brokerDropdownOpen && BrokerList.length > 0 && (
                                <ul className="broker-dropdown show" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                  {BrokerList.filter((b) =>
                                    !brokerName.trim() || b.broker_name.toLowerCase().includes(brokerName.trim().toLowerCase())
                                  ).map((data, index) => (
                                    <li
                                      key={index}
                                      className={`dropdown-item ${data.kruti_brokers_font == 1 ? "kruti-dev" : ""}`}
                                      onMouseDown={() => {
                                        brokerClickedRef.current = true;
                                      }}
                                      onClick={() => {
                                        setCommissionType(data?.commission_type);
                                        setCommissionValue(data?.commission_value);
                                        setBrokerName(data.broker_name);
                                        setBroker_id(data.broker_id);
                                        setBrokerNumber(data.phone_number || "");
                                        setBrokerDropdownOpen(false);
                                        setBrokerList([]);
                                        setBrokerFont(data.kruti_brokers_font);
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
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label ms-2">
                              {isEnglish ? "Commission" : "कमीशन"}
                            </Form.Label>
                            <div className="radio-group ms-3">
                              <Form.Check
                                type="radio"
                                name="commissionType"
                                label="Percentage"
                                value="percentage"
                                checked={commissionType == "percentage"}
                                onChange={(e) => setCommissionType(e.target.value)}
                                className="custom-radio"
                              />
                              <Form.Check
                                type="radio"
                                name="commissionType"
                                label="Fixed"
                                value="fixed"
                                checked={commissionType === "fixed"}
                                onChange={(e) => setCommissionType(e.target.value)}
                                className="custom-radio"
                              />
                            </div>
                          </Col>

                          <Col md={4}>
                            <Form.Group className="mb-1">
                              <Form.Label className="form-label">
                                {commissionType == "percentage"
                                  ? isEnglish
                                    ? "Percentage (%)"
                                    : "प्रतिशत (%)"
                                  : isEnglish
                                    ? "Fixed Amount"
                                    : "निश्चित राशि"}
                              </Form.Label>
                              <Form.Control
                                type="number"
                                value={commissionValue}
                                onChange={(e) => setCommissionValue(e.target.value)}
                                placeholder={
                                  commissionType == "percentage"
                                    ? isEnglish
                                      ? "Enter Percentage (%)"
                                      : "प्रतिशत दर्ज करें (%)"
                                    : isEnglish
                                      ? "Enter Fixed Amount"
                                      : "निश्चित राशि दर्ज करें"
                                }
                                className="form-control form-control-sm"
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        {/* Amount Fields Row */}
                        <Row className="mt-3">
                          <Col md={4}>
                            <Row>
                              <Col md={6} style={{ paddingRight: '5px' }}>
                                <Form.Label className="form-label">{isEnglish ? FromLable[8].EnglishName : FromLable[8].HindiName}</Form.Label>
                                <Form.Control
                                  value={SquareFeet}
                                  onChange={(e) => {
                                    let val = e.target.value;
                                    setSquareFeet(val);
                                    let plc = Number(PlcDrc) || 0;
                                    let base = val;
                                    if (plc !== 0) base = Number(val) / (1 + (plc / 100));
                                    setBaseSquareFeet(base);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === '-' || e.key === 'e') e.preventDefault();
                                  }}
                                  type="number"
                                  placeholder={isEnglish ? FromLable[8].EnglishName : FromLable[8].HindiName}
                                  className="form-control form-control-sm"
                                />
                                <Form.Text className="form-text text-muted">
                                  <p className="error-text">{SquareFeetError}</p>
                                </Form.Text>
                              </Col>

                              <Col md={6} style={{ paddingLeft: '5px' }}>
                                <Form.Label className="form-label">{isEnglish ? 'PLC/DIC (%)' : 'पीएलसी/डीआईसी (%)'}</Form.Label>
                                <Form.Control
                                  value={PlcDrc}
                                  onChange={(e) => setPlcDrc(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'e') e.preventDefault();
                                  }}
                                  type="number"
                                  placeholder={isEnglish ? 'PLC/DIC (%)' : 'पीएलसी/डीआईसी (%)'}
                                  className="form-control form-control-sm"
                                />
                                <Form.Text className="form-text text-muted">
                                  <p className="error-text">{PlcDrcError}</p>
                                </Form.Text>
                              </Col>
                            </Row>
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{isEnglish ? FromLable[11].EnglishName : FromLable[11].HindiName}</Form.Label>
                            <Form.Control
                              value={SquareFeetSize}
                              onChange={(e) => setSquareFeetSize(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e') e.preventDefault();
                              }}
                              type="number"
                              placeholder={isEnglish ? FromLable[11].EnglishName : FromLable[11].HindiName}
                              maxLength={200}
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{SquareFeetSizeError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? 'Broker Number' : 'दलाल का नंबर'}
                            </Form.Label>
                            <Form.Control
                              value={brokerNumber || ''}
                              readOnly
                              disabled
                              type="text"
                              placeholder={isEnglish ? 'Auto-filled on broker selection' : 'ब्रोकर चुनने पर स्वतः आएगा'}
                              className="form-control form-control-sm"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                cursor: 'not-allowed',
                                color: '#ffffff',
                                opacity: 0.9
                              }}
                            />
                            <Form.Text className="form-text text-muted">
                              <small style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                                * {isEnglish ? 'Auto-filled from selected broker' : 'चुने गए ब्रोकर से स्वतः भरा जाएगा'}
                              </small>
                            </Form.Text>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={4}>
                            <Form.Label className="form-label">{isEnglish ? FromLable[9].EnglishName : FromLable[9].HindiName}</Form.Label>
                            <Form.Control
                              value={BookingAmount}
                              onChange={(e) => setBookingAmount(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === '.' || e.key === '-' || e.key === 'e') e.preventDefault();
                              }}
                              type="number"
                              placeholder={isEnglish ? FromLable[9].EnglishName : FromLable[9].HindiName}
                              maxLength={200}
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{BookingAmountError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{isEnglish ? FromLable[10].EnglishName : FromLable[10].HindiName}</Form.Label>
                            <Form.Control
                              value={AmountA}
                              onChange={(e) => setAmountA(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === '.' || e.key === '-' || e.key === 'e') e.preventDefault();
                              }}
                              type="number"
                              placeholder={isEnglish ? FromLable[10].EnglishName : FromLable[10].HindiName}
                              maxLength={200}
                              className="form-control form-control-sm"
                            />
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{AmountAError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{isEnglish ? FromLable[12].EnglishName : FromLable[12].HindiName}</Form.Label>
                            <Form.Select
                              className="custom-select"
                              onChange={(e) => setPaymentTypeValue(e.target.value)}
                              value={PaymentTypeValue}
                            >
                              <option value="">
                                {isEnglish ? FromLable[12].EnglishName : FromLable[12].HindiName}
                              </option>
                              {PaymentType &&
                                PaymentType?.map((data, index) => (
                                  <option key={index} value={data.id}>
                                    {data.payment_mode}
                                  </option>
                                ))}
                            </Form.Select>
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{ModeofPaymentError}</p>
                            </Form.Text>
                          </Col>
                        </Row>

                        {/* Booking Date & Towords Row */}
                        <Row className="mt-3">
                          <Col md={4}>
                            <Form.Label className="form-label">
                              {isEnglish ? FromLable[27].EnglishName : FromLable[27].HindiName}
                            </Form.Label>
                            <Form.Control
                              value={BookingDate}
                              onChange={(e) => setBookingDate(e.target.value)}
                              type="date"
                              min={new Date().toISOString().split("T")[0]}
                              max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0]}
                              placeholder={isEnglish ? FromLable[27].EnglishName : FromLable[27].HindiName}
                              className="form-control form-control-sm"
                            />
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{isEnglish ? "Towords" : "टुवर्ड्स"}</Form.Label>
                            {FontValue === 2 ? (
                              <ReactTransliterate
                                as="textarea"
                                rows={2}
                                value={towrod || ""}
                                onChangeText={(txt) => setTowrod(txt)}
                                lang="hi"
                                placeholder={isEnglish ? "Enter Towords" : "टुवर्ड्स दर्ज करें"}
                                maxLength={20}
                                className={`form-control form-control-sm ${useKrutiClass(null) ? "kruti-dev" : ""}`}
                              />
                            ) : (
                              <Form.Control
                                as="textarea"
                                rows={2}
                                type="text"
                                value={towrod}
                                onChange={(e) => setTowrod(e.target.value)}
                                placeholder={isEnglish ? "Enter Towords" : "टुवर्ड्स दर्ज करें"}
                                maxLength={100}
                                className={`form-control form-control-sm ${useKrutiClass(null) ? "kruti-dev" : ""}`}
                              />
                            )}
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{TowrodError}</p>
                            </Form.Text>
                          </Col>
                        </Row>

                        {/* Payment Details Row */}
                        <Row>
                          <Col md={4}>
                            {(() => {
                              const isTransaction = Number(PaymentTypeValue) === 6;
                              const label = isTransaction
                                ? (isEnglish ? 'Transaction Number' : 'लेन-देन संख्या')
                                : (isEnglish ? FromLable[22].EnglishName : FromLable[22].HindiName);
                              const placeholder = isTransaction
                                ? (isEnglish ? 'Enter Transaction Number' : 'लेन-देन संख्या दर्ज करें')
                                : (isEnglish ? FromLable[22].EnglishName : FromLable[22].HindiName);
                              const inputType = isTransaction ? 'text' : 'number';

                              return (
                                <>
                                  <Form.Label className="form-label">{label}</Form.Label>
                                  <Form.Control
                                    value={checkno}
                                    onChange={(e) => setCheckno(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (inputType === 'number' && (e.key === '.' || e.key === '-' || e.key === 'e')) {
                                        e.preventDefault();
                                      }
                                    }}
                                    type={inputType}
                                    placeholder={placeholder}
                                    maxLength={isTransaction ? 50 : 20}
                                    className="form-control form-control-sm"
                                  />
                                  <Form.Text className="form-text text-muted">
                                    <p className="error-text">{BookingAmountError}</p>
                                  </Form.Text>
                                </>
                              );
                            })()}
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{isEnglish ? FromLable[23].EnglishName : FromLable[23].HindiName}</Form.Label>
                            {isMaganl ? (
                              <ReactTransliterate
                                value={bankname || ''}
                                onChangeText={(txt) => setbankname(txt)}
                                lang="hi"
                                placeholder={isEnglish ? FromLable[23].EnglishName : FromLable[23].HindiName}
                                maxLength={150}
                                className={`form-control form-control-sm ${useKrutiClass(null) ? "kruti-dev" : ""}`}
                              />
                            ) : (
                              <Form.Control
                                value={bankname}
                                onChange={(e) => setbankname(e.target.value)}
                                type="text"
                                placeholder={isEnglish ? FromLable[23].EnglishName : FromLable[23].HindiName}
                                maxLength={150}
                                className={`form-control form-control-sm ${useKrutiClass(null) ? "kruti-dev" : ""}`}
                              />
                            )}
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{TimeofpaymentError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{isEnglish ? FromLable[24].EnglishName : FromLable[24].HindiName}</Form.Label>
                            {isMaganl ? (
                              <ReactTransliterate
                                value={branchname || ''}
                                onChangeText={(txt) => setBranchname(txt)}
                                lang="hi"
                                placeholder={isEnglish ? FromLable[24].EnglishName : FromLable[24].HindiName}
                                maxLength={150}
                                className={`form-control form-control-sm ${useKrutiClass(null) ? "kruti-dev" : ""}`}
                              />
                            ) : (
                              <Form.Control
                                value={branchname}
                                onChange={(e) => setBranchname(e.target.value)}
                                type="text"
                                placeholder={isEnglish ? FromLable[24].EnglishName : FromLable[24].HindiName}
                                maxLength={150}
                                className={`form-control form-control-sm ${useKrutiClass(null) ? "kruti-dev" : ""}`}
                              />
                            )}
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{TimeofpaymentError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{isEnglish ? FromLable[13].EnglishName : FromLable[13].HindiName}</Form.Label>
                            {isMaganl ? (
                              <ReactTransliterate
                                value={TimeofPayment || ""}
                                onChangeText={(txt) => setTimeofPayment(txt)}
                                lang="hi"
                                placeholder={isEnglish ? FromLable[13].EnglishName : FromLable[13].HindiName}
                                maxLength={20}
                                className="form-control form-control-sm"
                              />
                            ) : (
                              <Form.Control
                                value={TimeofPayment}
                                onChange={(e) => setTimeofPayment(e.target.value)}
                                type="text"
                                placeholder={isEnglish ? FromLable[13].EnglishName : FromLable[13].HindiName}
                                maxLength={20}
                                className="form-control form-control-sm"
                              />
                            )}
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{TimeofpaymentError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            {(() => {
                              const isTransaction = Number(PaymentTypeValue) === 6;
                              const label = isTransaction
                                ? (isEnglish ? 'Transaction Date' : 'लेन-देन तिथि')
                                : (isEnglish ? FromLable[25].EnglishName : FromLable[25].HindiName);
                              return (
                                <>
                                  <Form.Label className="form-label">{label}</Form.Label>
                                  <Form.Control
                                    value={checkdate}
                                    onChange={(e) => setCheckdate(e.target.value)}
                                    type="date"
                                    placeholder={label}
                                    className="form-control form-control-sm"
                                  />
                                </>
                              );
                            })()}
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{isEnglish ? FromLable[14].EnglishName : FromLable[14].HindiName}</Form.Label>
                            {isMaganl ? (
                              <ReactTransliterate
                                value={AdditionalComments || ""}
                                onChangeText={(txt) => setAdditionalComment(txt)}
                                lang="hi"
                                placeholder={isEnglish ? FromLable[14].EnglishName : FromLable[14].HindiName}
                                maxLength={100}
                                className={`form-control form-control-sm ${useKrutiClass(null) ? "kruti-dev" : ""}`}
                              />
                            ) : (
                              <Form.Control
                                value={AdditionalComments}
                                onChange={(e) => setAdditionalComment(e.target.value)}
                                type="text"
                                placeholder={isEnglish ? FromLable[14].EnglishName : FromLable[14].HindiName}
                                maxLength={100}
                                className={`form-control form-control-sm ${useKrutiClass(null) ? "kruti-dev" : ""}`}
                              />
                            )}
                          </Col>
                        </Row>

                        {/* Reference & Dates Row */}
                        <Row>
                          <Col md={4}>
                            <Form.Label className="form-label">{isEnglish ? FromLable[15].EnglishName : FromLable[15].HindiName}</Form.Label>
                            {isMaganl ? (
                              <ReactTransliterate
                                value={Refrens || ""}
                                onChangeText={(txt) => handleInputChange({ target: { value: txt } })}
                                lang="hi"
                                placeholder={isEnglish ? FromLable[15].EnglishName : FromLable[15].HindiName}
                                className={`form-control form-control-sm ${useKrutiClass(null) ? "kruti-dev" : ""}`}
                                maxLength={50}
                              />
                            ) : (
                              <Form.Control
                                value={Refrens}
                                onChange={handleInputChange}
                                type="text"
                                placeholder={isEnglish ? FromLable[15].EnglishName : FromLable[15].HindiName}
                                className={`form-control form-control-sm ${useKrutiClass(null) ? "kruti-dev" : ""}`}
                                maxLength={50}
                              />
                            )}
                            {filteredOptions.length > 0 && (
                              <ul className="broker-dropdown show">
                                {filteredOptions.map((option, index) => (
                                  <li
                                    key={index}
                                    className="dropdown-item"
                                    value={option.name}
                                    onClick={() => {
                                      setReferenceId(option.name);
                                      setRefrens(option.name);
                                      setFilteredOptions([]);
                                    }}
                                  >
                                    {option.name}
                                  </li>
                                ))}
                              </ul>
                            )}
                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{RefrensEror}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{isEnglish ? FromLable[16].EnglishName : FromLable[16].HindiName}</Form.Label>
                            <Form.Control
                              value={agreementDate}
                              onChange={(e) => SetAgreementDate(e.target.value)}
                              type="date"
                              placeholder={isEnglish ? FromLable[16].EnglishName : FromLable[16].HindiName}
                              className="form-control form-control-sm"
                            />
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{isEnglish ? FromLable[17].EnglishName : FromLable[17].HindiName}</Form.Label>
                            <Form.Control
                              value={registerDate}
                              onChange={(e) => setregisterDate(e.target.value)}
                              type="date"
                              placeholder={isEnglish ? FromLable[17].EnglishName : FromLable[17].HindiName}
                              className="form-control form-control-sm"
                            />
                          </Col>
                        </Row>

                        {/* Conditional Amount B & Total Row */}
                        <Row>
                          {showInput && (
                            <>
                              <Col md={4}>
                                <Form.Label className="form-label">{isEnglish ? FromLable[18].EnglishName : FromLable[18].HindiName}</Form.Label>
                                <Form.Control
                                  value={AmountB}
                                  onChange={handleAmountBChange}
                                  type="number"
                                  placeholder={isEnglish ? FromLable[18].EnglishName : FromLable[18].HindiName}
                                  maxLength={200}
                                  className="form-control form-control-sm"
                                />
                                <Form.Text className="form-text text-muted">
                                  <p className="error-text">{AmountBError}</p>
                                </Form.Text>
                              </Col>

                              <Col md={4}>
                                <Form.Label className="form-label">{isEnglish ? FromLable[20].EnglishName : FromLable[20].HindiName}</Form.Label>
                                <Form.Control
                                  value={Total}
                                  onChange={(e) => SetTotal(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === '.' || e.key === '-' || e.key === 'e') {
                                      e.preventDefault();
                                    }
                                  }}
                                  type="number"
                                  placeholder={isEnglish ? FromLable[20].EnglishName : FromLable[20].HindiName}
                                  className="form-control form-control-sm"
                                />
                                <Form.Text className="form-text text-muted">
                                  <p className="error-text">{SquareFeetError}</p>
                                </Form.Text>
                              </Col>
                            </>
                          )}
                        </Row>
                      </Form.Group>
                    </Form>
                  </Col>
                </Row>

                {/* Buttons Row */}
                <Row className="justify-content-end mt-3">
                  <Col md={12}>
                    <Form.Text className="form-text text-muted">
                      <p className="error-text" style={{ width: '300px' }}>
                        {errors}
                      </p>
                    </Form.Text>
                    <div className="d-flex justify-content-between align-items-center">
                    

                      <div></div>

                      {mode && mode == 'edit' ? (
                        <Button
                          className="submit-btn"
                          disabled={isSubmitting}
                          onClick={UpdateBooking}
                        >
                          {isSubmitting 
                            ? (isEnglish ? "Please wait..." : "कृपया प्रतीक्षा करें...") 
                            : (isEnglish ? "Update Booking" : "बुकिंग अपडेट करें")
                          }
                        </Button>
                      ) : (
                        <Button
                          className="submit-btn"
                          onClick={AddBooking}
                          disabled={isSubmitting}
                        >
                          {isSubmitting 
                            ? (isEnglish ? "Please wait..." : "कृपया प्रतीक्षा करें...") 
                            : (isEnglish ? "Add" : "जोड़ें")
                          }
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

      <PasswordModal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        errors={Errors}
        onSubmit={handlePasswordSubmit}
      />
    </React.Fragment>
  );
}

export default AddBooking;