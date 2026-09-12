import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Button,
} from 'react-bootstrap';
import { IoIosArrowBack } from 'react-icons/io';
import GoogleMaps from 'views/maps/GoogleMaps';
import { API_BASE_URL } from 'config/constant';
import { useNavigate, useLocation } from 'react-router-dom';
import { post } from 'jquery';
import '../tables/table.css';
import '../prebooking/style.css';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import PasswordModal from 'components/PasswordModal';
import { ReactTransliterate } from 'react-transliterate';
import 'react-transliterate/dist/index.css';
import api from 'utils/api';
import BackButton from 'components/Loader/BackButton';

function AddAmount({
  updateData,
  getAllReceiveAmount,
  setShowInput,
  showInput,
  CallBacksetPlotId,
  setUpdateBtnShow,
  updateBtnShow,
  callListOnSave = true
}) {
  const [BookingData, setBookingData] = useState([]);
  const pressedKeys = useRef(new Set());
  const [CustomerId, setCustomerId] = useState();
  const [CustomerPlotId, setCustomerPlotId] = useState();
  const [ProjectId, setProjectId] = useState();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [sector_id, setSectorId] = useState();
  const [PlotId, setPlotId] = useState('');
  const [branchName, setBranchName] = useState('');

  const [CustomerName, setCustomerName] = useState();
  const [CustomerNumber, setCustomerNumber] = useState();
  const [SquareFeet, setSquareFeet] = useState();
  const [Refrens, setRefrens] = useState();
  const [ReferenceId, setReferenceId] = useState();
  const [AmountA, setAmountA] = useState();
  const [AmountB, setAmountB] = useState();
  const [chequeNo, setChequeNo] = useState('');

  const [BookingAmount, setBookingAmount] = useState();
  const [PaymentType, setPaymentType] = useState([]);
  const [PaymentTypeValue, setPaymentTypeValue] = useState();
  const [TimeofPayment, setTimeofPayment] = useState();
  const [AdditionalComments, setAdditionalComment] = useState('');
  const [SquareFeetSize, setSquareFeetSize] = useState();
  const [MoodofPayment, setMoodofPayment] = useState();
  const [agreementDate, SetAgreementDate] = useState();
  const [registerDate, setregisterDate] = useState();

  const [ReferenceOptions, setReferenceOptions] = useState();
  
  const [filteredOptions, setFilteredOptions] = useState([]);

  const [showAlert, setShowAlert] = useState(false);
  const [AlertMsg, setAlertMsg] = useState();
  const alertTimer = useRef(null);

  const userData = JSON.parse(localStorage.getItem('users')) || {};
  
  const [receiveamount, setreceiveamount] = useState();
  const [receiveAmountType, setreceiveAmountType] = useState();
  const [receiveAdditioncomment, setreceiveAdditioncomment] = useState();
  const [receiveAmountReference, setreceiveAmountReference] = useState();
  const [receiveAmountDate, setreceiveAmountDate] = useState();
  const [receiveAmountDateB, setreceiveAmountDateB] = useState();
  const [RemainingAmount, setRemainingAmount] = useState();
  const [RemainingAmount_b, setRemainingAmount_b] = useState();
  const [receiveAmountImage, setreceiveAmountImage] = useState();
  const [receiveAmountBType, setreceiveAmountBType] = useState();

  const [error, setError] = useState();
  const [receiveamountError, setreceiveamountError] = useState();
  const [receiveAmountTypeError, setreceiveAmountTypeError] = useState();
  const [receiveAmountDateError, setreceiveAmountDateError] = useState();
  const [userSelectError, setUserSelectError] = useState();
  const location = useLocation();
  const { data, mode, row } = location?.state || {};
  const [towords, setTowords] = useState('');

  const [Mode, setMode] = useState(mode || '');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bankName, setBankName] = useState('');
  const [errors, setErrors] = useState();
  const [chequeDate, setChequeDate] = useState('');

  const [FontValue, setFontValue] = useState(0); // ⭐ 0 = English
  const [Class, setClass] = useState(false);

  // ⭐ HELPER VARIABLES
  const isEnglish = FontValue === 0;
  const isHindi = FontValue === 1;
  const isMangal = FontValue === 2;

  const [selectedOption, setSelectedOption] = useState({});
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [excludeBookingIds, setExcludeBookingIds] = useState([]);

  const customerInputRef = useRef(null);

  const handleLanguageChange = (e) => {
    const selectedValue = Number(e.target.value);
    setClass(selectedValue === 1);
    setFontValue(selectedValue);
  };

  // ⭐ HELPER: Label/Placeholder switcher
  const L = (en, hi) => (isEnglish ? en : hi);

  const formatAmount = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return num.toLocaleString('en-IN');
  };

  const TRANSACTION_PAYMENT_ID = 6;
  const isTransactionMain = Number(receiveAmountType) === TRANSACTION_PAYMENT_ID;
  const isTransactionB = Number(receiveAmountBType) === TRANSACTION_PAYMENT_ID;

  const dedupeKeepEarliestByPlot_bookingId = (arr = []) => {
    const map = new Map();
    arr.forEach(item => {
      const pid = item.plot_id;
      if (!pid && pid !== 0) return;
      const existing = map.get(pid);
      if (!existing) {
        map.set(pid, item);
      } else {
        const exId = Number(existing.booking_id || 0);
        const itId = Number(item.booking_id || 0);
        if (itId < exId) {
          map.set(pid, item);
        }
      }
    });
    return Array.from(map.values());
  };

  const getreceiveamount = async (plot_id, password) => {
    try {
      if (!plot_id) return;
      const res = await api.get(`/receiveamount/remainingamount`, {
        headers: {
          authorization: userData.user_token,
        },
        params: {
          plot_id: plot_id,
          password_b: password,
          user_id: userData?.user_id,
        },
      });

      if (res.data.success === true) {
        setRemainingAmount(res.data.data[0]);
        setErrors(res.data.message);
        const status = res.data.status;
        setShowInput(status === true || status === "true");

        if (res.data.status) {
          setShowPasswordModal(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

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
    setMode(mode || '');
  }, [mode]);

  useEffect(() => {
    if (!row) return;

    setreceiveAmountType(row?.amount_a_type_id || '');
    setCustomerId(row?.customer_id || '');
    setCustomerPlotId(row?.plot_id || '');
    setProjectId(row?.project_id || '');
    setSectorId(row?.sector_id || '');
    setPlotId(row?.plot_id || '');

    (async () => {
      try {
        const bookings = await getAllBookings(row.plot_id, row.customer_id);
        if (Array.isArray(bookings) && bookings.length > 0) {
          const matching = bookings.filter(b => b.plot_id == row.plot_id || b.booking_id == row.customer_id || b.customer_id == row.customer_id);
          let selectedData = null;
          if (matching.length > 0) {
            matching.sort((a, b) => a.booking_id - b.booking_id);
            selectedData = matching[0];
          } else {
            selectedData = bookings[0];
          }

          if (selectedData) {
            if (excludeBookingIds && excludeBookingIds.includes(selectedData.booking_id)) {
              const alt = bookings.find(b => !excludeBookingIds.includes(b.booking_id));
              if (alt) selectedData = alt;
            }

            getreceiveamount(selectedData.plot_id);
            setSelectedBookingId(selectedData.booking_id);
            setSelectedOption(selectedData);
            setCustomerPlotId(selectedData.plot_id);
            setCustomerId(selectedData.customer_id || selectedData.booking_id);

            setSquareFeet(selectedData.square_feet_rate || '');
            setCustomerNumber(selectedData.mobile_no || '');
            setBookingAmount(selectedData.booking_amount || '');
            setAmountA(selectedData.amount_a || '');
            setAmountB(selectedData.amount_b || '');
            setTimeofPayment(selectedData.payment_time || '');
            setAdditionalComment(selectedData.additional_comment || '');
            setRefrens(selectedData.reference_name || '');
            setSquareFeetSize(selectedData.square_feet_size || '');
            setPaymentTypeValue(selectedData.payment_mode_id || '');
            const formattedAgreementDate = selectedData.agreement_date ? new Date(selectedData.agreement_date).toISOString().split('T')[0] : '';
            const formattedRegisterDate = selectedData.register_date ? new Date(selectedData.register_date).toISOString().split('T')[0] : '';
            SetAgreementDate(formattedAgreementDate);
            setregisterDate(formattedRegisterDate);
          }
        }
      } catch (err) {
        console.error('Error while selecting booking for row:', err);
      }
    })();

    CallBacksetPlotId(row?.plot_id || '');
  }, [row, excludeBookingIds]);

  useEffect(() => {
    if (!data) return;

    const toLocalYYYYMMDD = (iso) => {
      if (!iso) return '';
      const d = new Date(iso);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    setreceiveamount((Mode === 'edit' || updateBtnShow) ? data?.amount || '' : '');
    setreceiveAmountType((Mode === 'edit' || updateBtnShow) ? data?.amount_a_type_id || '' : '');
    setreceiveAdditioncomment(data?.additional_comments || '');
    setreceiveAmountReference(data?.reference_name || '');
    setCustomerId(data?.customer_id && data?.customer_id !== '' ? data.customer_id : data?.booking_id);
    setCustomerPlotId(data?.plot_id || '');
    setProjectId(data?.project_id || '');
    setSectorId(data?.sector_id || '');
    setBranchName(data?.branch_name || '');
    setRemainingAmount_b((Mode === 'edit' || updateBtnShow) ? data?.amount_b || '' : '');
    setreceiveAmountBType((Mode === 'edit' || updateBtnShow) ? data?.amount_b_type_id || '' : '');
    setPlotId(data?.plot_id || '');
    setBranchName((Mode === 'edit' || updateBtnShow) ? data?.branch_name || '' : '');
    setChequeNo((Mode === 'edit' || updateBtnShow) ? data?.check_no || '' : '');
    setBankName((Mode === 'edit' || updateBtnShow) ? data?.bank_name || '' : '');
    setTowords((Mode === 'edit' || updateBtnShow) ? data?.towords || '' : '');
    setreceiveAdditioncomment((Mode === 'edit' || updateBtnShow) ? data?.additional_comments || '' : '');

    const formattedChequeDate = (Mode === 'edit' || updateBtnShow) && data?.check_date ? toLocalYYYYMMDD(data.check_date) : '';
    setChequeDate(formattedChequeDate);

    const formattedAgreementDate = data?.receive_date ? toLocalYYYYMMDD(data.receive_date) : '';
    setreceiveAmountDate(formattedAgreementDate);

    (async () => {
      try {
        const bookings = await getAllBookings(data?.plot_id, data?.customer_id || data?.booking_id);
        if (Array.isArray(bookings) && bookings.length > 0) {
          let selected = bookings.find(b => b.booking_id == data?.booking_id)
            || bookings.find(b => b.plot_id == data?.plot_id)
            || bookings[0];

          if (excludeBookingIds && excludeBookingIds.includes(selected.booking_id)) {
            selected = bookings.find(b => !excludeBookingIds.includes(b.booking_id)) || selected;
          }

          if (selected) {
            setSelectedBookingId(selected.booking_id);
            setCustomerPlotId(selected.plot_id);
            setCustomerId(selected.customer_id || selected.booking_id);

            getreceiveamount(selected.plot_id);
            setSelectedOption(selected);

            setSquareFeet(selected.square_feet_rate || '');
            setCustomerNumber(selected.mobile_no || '');
            setBookingAmount(selected.booking_amount || '');
            setAmountA(selected.amount_a || '');
            setAmountB(selected.amount_b || '');
            setTimeofPayment(selected.payment_time || '');
            setAdditionalComment(selected.additional_comment || '');
            setRefrens(selected.reference_name || '');
            setSquareFeetSize(selected.square_feet_size || '');
            setPaymentTypeValue(selected.payment_mode_id || '');

            const formattedAgreement = selected?.agreement_date ? toLocalYYYYMMDD(selected.agreement_date) : '';
            const formattedRegister = selected?.register_date ? toLocalYYYYMMDD(selected.register_date) : '';
            SetAgreementDate(formattedAgreement);
            setregisterDate(formattedRegister);
          }
        }
      } catch (err) {
        console.error('Error in data-effect fetching bookings:', err);
      }
    })();

    CallBacksetPlotId(data?.plot_id || '');
  }, [data, updateBtnShow, Mode, excludeBookingIds]);

  useEffect(() => {
    if (updateData) {
      const toLocalYYYYMMDD = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      setreceiveamount(updateData.amount || '');
      setreceiveAmountType(updateData.amount_a_type_id || '');
      setreceiveAdditioncomment(updateData.additional_comments || '');
      setreceiveAmountReference(updateData.reference_name || '');
      setCustomerId(updateData.customer_id || '');
      setCustomerPlotId(updateData.plot_id || '');
      setProjectId(updateData.project_id || '');
      setSectorId(updateData.sector_id || '');
      setRemainingAmount_b(updateData.amount_b || '');
      setreceiveAmountBType(updateData.amount_b_type_id || '');
      setPlotId(updateData.plot_id || '');
      setBankName(updateData.bank_name || '');
      setBranchName(updateData.branch_name || '');
      setChequeNo(updateData.check_no || '');
      setTowords(updateData.towords || '');

      const fixedChequeDate = updateData.check_date ? toLocalYYYYMMDD(updateData.check_date) : '';
      setChequeDate(fixedChequeDate);

      const formattedDateA = updateData.receive_date ? toLocalYYYYMMDD(updateData.receive_date) : '';
      setreceiveAmountDate(formattedDateA);

      const formattedDateB = updateData.receive_date_b ? toLocalYYYYMMDD(updateData.receive_date_b) : '';
      setreceiveAmountDateB(formattedDateB);

      getAllBookings(updateData.plot_id);
    }
  }, [updateData, excludeBookingIds]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setreceiveAmountDate(today);
    setreceiveAmountDateB(today);
  }, []);

  const getAllBookings = async (plot_id, booking_id) => {
    setSquareFeet('');
    setCustomerNumber('');
    setBookingAmount('');
    setAmountA('');
    setAmountB('');
    setTimeofPayment('');
    setAdditionalComment('');
    setRefrens('');
    setSquareFeetSize('');
    setPaymentTypeValue('');
    setregisterDate('');
    SetAgreementDate('');
    try {
      const res = await api.get(`/booking/list`, {
        headers: { Authorization: userData?.user_token },
        params: {
          user_id: userData?.user_id,
          ...(plot_id ? { plot_id } : {}),
          ...(booking_id ? { booking_id } : {})
        }
      });

      if (res.data.success === true) {
        const incoming = res.data.data || [];
        const bookingsToUse = excludeBookingIds && excludeBookingIds.length > 0
          ? incoming.filter(b => !excludeBookingIds.includes(b.booking_id))
          : incoming;

        const dedupedByPlot = dedupeKeepEarliestByPlot_bookingId(bookingsToUse);

        if (plot_id && dedupedByPlot.length > 0) {
          const booking = dedupedByPlot.find(b => b.plot_id == plot_id) || dedupedByPlot[0];
          if (booking) {
            setSquareFeet(booking.square_feet_rate || '');
            setCustomerNumber(booking.mobile_no || '');
            setBookingAmount(booking.booking_amount || '');
            setAmountA(booking.amount_a || '');
            setAmountB(booking.amount_b || '');
            setTimeofPayment(booking.payment_time || '');
            setAdditionalComment(booking.additional_comment || '');
            setRefrens(booking.reference_name || '');
            setSquareFeetSize(booking.square_feet_size || '');
            setPaymentTypeValue(booking.payment_mode_id || '');
            const formattedAgreementDate = booking.agreement_date ? new Date(booking.agreement_date).toISOString().split('T')[0] : '';
            const formattedRegisterDate = booking.register_date ? new Date(booking.register_date).toISOString().split('T')[0] : '';
            setregisterDate(formattedRegisterDate);
            SetAgreementDate(formattedAgreementDate);
            setSelectedOption(booking);
          }
        } else if (!plot_id && dedupedByPlot.length > 0 && booking_id) {
          const booking = dedupedByPlot.find(b => b.booking_id == booking_id);
          if (booking) {
            setSquareFeet(booking.square_feet_rate || '');
            setCustomerNumber(booking.mobile_no || '');
            setBookingAmount(booking.booking_amount || '');
            setAmountA(booking.amount_a || '');
            setAmountB(booking.amount_b || '');
            setTimeofPayment(booking.payment_time || '');
            setAdditionalComment(booking.additional_comment || '');
            setRefrens(booking.reference_name || '');
            setSquareFeetSize(booking.square_feet_size || '');
            setPaymentTypeValue(booking.payment_mode_id || '');
            const formattedAgreementDate = booking.agreement_date ? new Date(booking.agreement_date).toISOString().split('T')[0] : '';
            const formattedRegisterDate = booking.register_date ? new Date(booking.register_date).toISOString().split('T')[0] : '';
            setregisterDate(formattedRegisterDate);
            SetAgreementDate(formattedAgreementDate);
            setSelectedOption(booking);
          }
        }

        setBookingData(dedupedByPlot);
        setFilteredOptions(dedupedByPlot);
        return dedupedByPlot;
      }
      return [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  };

  const addReceiveAmountFun = async () => {
    setUserSelectError('');
    setreceiveAmountDateError('');
    setreceiveAmountTypeError('');
    setreceiveamountError('');
    setError('');

    if (!PlotId && !CustomerPlotId && !selectedBookingId) {
      setUserSelectError(L('Please select user','कृपया ग्राहक चुनें'));
      return;
    }
    if (!receiveamount && !RemainingAmount_b) {
      setreceiveamountError(L('Amount is required','राशि आवश्यक है'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('project_id', parseInt(ProjectId || 0));
      formData.append('sector_id', parseInt(sector_id || 0));
      formData.append('Customer_id', parseInt(CustomerId || 0));
      formData.append('plot_id', parseInt(PlotId || CustomerPlotId || 0));
      if (receiveamount) formData.append('amount', parseInt(receiveamount));
      if (RemainingAmount_b) formData.append('amountB', parseInt(RemainingAmount_b));
      formData.append('payment_type', receiveAmountType ? parseInt(receiveAmountType) : 5);
      if (receiveAmountBType) formData.append('amount_b_payment_type', parseInt(receiveAmountBType));
      if (receiveAmountImage) formData.append('ProjectImage', receiveAmountImage);
      if (receiveAmountDate) formData.append('receive_date', receiveAmountDate);
      if (receiveAmountDateB) formData.append('receive_date_b', receiveAmountDateB);
      formData.append('check_no', chequeNo || '');
      formData.append('check_date', chequeDate || '');
      formData.append('bank_name', bankName || '');
      formData.append('kruti_font_booking', FontValue);
      formData.append('branch_name', branchName || '');
      formData.append('towords', towords || '');
      formData.append('additional_comments', receiveAdditioncomment ? receiveAdditioncomment : '');
      formData.append('created_by', userData?.user_id || '');

      const res = await api.post(`/receiveamount/add`, formData, {
        headers: { Authorization: userData.user_token },
      });

      if (res.data.success == true) {
        try {
          const finalPlot = PlotId || CustomerPlotId || '';
          if (callListOnSave && typeof getAllReceiveAmount === 'function') {
            const parsed = Number(finalPlot);
            const plotToSend = Number.isNaN(parsed) ? finalPlot : parsed;
            getAllReceiveAmount(plotToSend);

            if (typeof getreceiveamount === 'function') {
              setTimeout(() => { getreceiveamount(plotToSend); }, 250);
            }

            setTimeout(() => {
              try { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); } catch (e) {}
            }, 300);
          }
        } catch (e) { console.warn('getAllReceiveAmount error', e); }

        CallBacksetPlotId(PlotId || CustomerPlotId || '');
        showTemporaryAlert(res.data.message);
        setShowInput(false);

        setreceiveamount('');
        setreceiveAmountType('');
        setreceiveAdditioncomment('');
        setreceiveAmountReference('');
        setreceiveAmountDate('');
        setRemainingAmount_b('');
        getAllBookings();
        setreceiveAmountImage('');
        setUpdateBtnShow(false);
        setRemainingAmount(null);
        setError('');
      }
      if (res.data.success == false) {
        setError(res.data.message);
      }
    } catch (error) { console.log(error); }
  };

  const updateReceiveAmountFun = async () => {
    setreceiveamountError('');
    setreceiveAmountTypeError('');
    setreceiveAmountDateError('');
    setError('');

    if (!receiveamount && !RemainingAmount_b) {
      setreceiveamountError(L('Amount is required','राशि आवश्यक है'));
      return;
    }
    if (!receiveAmountType && !receiveAmountBType) {
      setreceiveAmountTypeError(L('mode of payment is required','भुगतान का प्रकार आवश्यक है'));
      return;
    }
    if (!receiveAmountDate) {
      setreceiveAmountDateError(L('Date is required','तिथि आवश्यक है'));
      return;
    }
    try {
      const formData = new FormData();
      formData.append('receive_amountId', parseInt(updateData ? updateData.id : data.id));
      formData.append('Customer_id', parseInt(CustomerId || 0));
      formData.append('project_id', parseInt(ProjectId || 0));
      formData.append('sector_id', parseInt(sector_id || 0));
      formData.append('plot_id', parseInt(PlotId || CustomerPlotId || 0));
      formData.append('check_no', chequeNo || '');
      formData.append('check_date', chequeDate || '');
      formData.append('bank_name', bankName || '');
      formData.append('branch_name', branchName || '');
      formData.append('towords', towords || '');
      formData.append('receive_date', receiveAmountDate);
      if (receiveamount) formData.append('amount', parseInt(receiveamount));
      if (RemainingAmount_b) formData.append('amountB', parseInt(RemainingAmount_b));
      if (receiveAmountType) formData.append('payment_type', parseInt(receiveAmountType));
      if (receiveAmountBType) formData.append('amount_b_payment_type', parseInt(receiveAmountBType));
      if (receiveAmountImage) formData.append('ProjectImage', receiveAmountImage);
      formData.append('additional_comments', receiveAdditioncomment || '');
      formData.append('updated_by', userData?.user_id || '');
      const res = await api.put(`/receiveamount`, formData, {
        headers: { authorization: userData.user_token },
      });

      if (res.data.success == true) {
        try {
          const finalPlot = PlotId || CustomerPlotId || '';
          if (callListOnSave && typeof getAllReceiveAmount === 'function') {
            const parsed = Number(finalPlot);
            const plotToSend = Number.isNaN(parsed) ? finalPlot : parsed;
            getAllReceiveAmount(plotToSend);

            if (typeof getreceiveamount === 'function') {
              setTimeout(() => { getreceiveamount(plotToSend); }, 250);
            }

            setTimeout(() => {
              try { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); } catch (e) {}
            }, 300);
          }
        } catch (e) { console.warn('getAllReceiveAmount error', e); }

        CallBacksetPlotId(PlotId || CustomerPlotId || '');
        setMode('');
        showTemporaryAlert(res.data.message);
        setShowInput(false);
        setreceiveAmountDate('');
        setreceiveAmountReference('');
        setreceiveAdditioncomment('');
        setreceiveAmountType('');
        setreceiveamount('');
        setCustomerId('');
        setProjectId('');
        setSectorId('');
        setRefrens('');
        setTimeofPayment('');
        setSquareFeetSize('');
        setregisterDate('');
        SetAgreementDate('');
        setAmountA('');
        setAmountB('');
        setUpdateBtnShow(false);
        getAllBookings();
        setUpdateBtnShow(false);
        setRemainingAmount(null);
        setRemainingAmount_b('');
        setError('');
      }
      if (res.data.success == false) {
        setError(res.data.message);
      }
    } catch (error) { console.log(error); }
  };

  const TypeofPayment = async () => {
    try {
      const res = await api.get(`/payment/mode`, {
        headers: { Authorization: userData?.user_token },
      });

      if (res.data.success === true) {
        setPaymentType(res.data.data || []);
        if (res.data.data.length > 0) {
          setPaymentTypeValue(data?.payment_mode || res.data.data[0].id);
        }
      }
    } catch (error) {}
  };

  const getAllReference = async () => {
    try {
      const res = await api.get(`/reference/all`, {
        headers: { authorization: userData.user_token },
      });
      if (res.data.success == true) {
        setReferenceOptions(res.data.data || []);
      }
    } catch (error) { console.log(error); }
  };

  const handlePasswordSubmit = (enteredPassword) => {
    if (PlotId) {
      getreceiveamount(PlotId, enteredPassword);
    } else if (CustomerPlotId) {
      getreceiveamount(CustomerPlotId, enteredPassword);
    } else if (selectedOption && selectedOption.plot_id) {
      getreceiveamount(selectedOption.plot_id, enteredPassword);
    }
  };

  const resetSelectionFields = () => {
    setSquareFeet('');
    setCustomerNumber('');
    setBookingAmount('');
    setAmountA('');
    setAmountB('');
    setTimeofPayment('');
    setAdditionalComment('');
    setRefrens('');
    setSquareFeetSize('');
    setPaymentTypeValue('');
    setregisterDate('');
    SetAgreementDate('');
    setRemainingAmount('');
  };

  const handleCustomerNameChange = (e) => {
    if (!e) return;
    resetSelectionFields();

    const { booking_id, plot_id, sector_id, project_id, customer_id } = e;

    if (excludeBookingIds && excludeBookingIds.includes(booking_id)) {
      const alt = BookingData.find(b => !excludeBookingIds.includes(b.booking_id));
      if (alt) {
        handleCustomerNameChange(alt);
      } else {
        setUserSelectError(L('This booking is hidden','यह बुकिंग छुपाई गई है'));
      }
      return;
    }

    setSectorId(sector_id);
    setSelectedBookingId(booking_id);
    setCustomerPlotId(plot_id);
    setCustomerId(customer_id || booking_id);
    setPlotId(plot_id);
    setProjectId(project_id);

    if (plot_id) { getreceiveamount(plot_id); }

    setSelectedOption(e);

    if (plot_id) { getAllBookings(plot_id, booking_id); }

    setCustomerSearchTerm('');
    setShowSuggestions(false);

    try {
      if (customerInputRef && customerInputRef.current && typeof customerInputRef.current.blur === 'function') {
        customerInputRef.current.blur();
      } else {
        document.activeElement && document.activeElement.blur && document.activeElement.blur();
      }
    } catch (err) { console.warn('blur failed', err); }

    CallBacksetPlotId(plot_id);
  };

  const handleImage = (event) => {
    const file = event.target.files[0];
    setreceiveAmountImage(file);
  };

  useEffect(() => {
    setExcludeBookingIds([]);
    getAllBookings();
    getAllReference();
    TypeofPayment();
  }, []);

  useEffect(() => {
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
  }, [showInput]);

  const handleAmountBChange = (e) => {
    const value = e.target.value;
    setRemainingAmount_b(value);
  };

  const handleSelection = (booking) => {
    if (!booking) return;

    if (excludeBookingIds && excludeBookingIds.includes(booking.booking_id)) {
      setUserSelectError(L('This booking is hidden','यह बुकिंग छुपाई गई है'));
      return;
    }

    setSelectedOption(booking);

    try {
      if (customerInputRef && customerInputRef.current && typeof customerInputRef.current.blur === 'function') {
        customerInputRef.current.blur();
      } else {
        document.activeElement && document.activeElement.blur && document.activeElement.blur();
      }
    } catch (e) { console.warn('blur failed', e); }
    setShowSuggestions(false);
    setShowPasswordModal(false);

    handleCustomerNameChange(booking);
  };

  const krutiClassIfTyped = (value) => (Class && value ? 'kruti-dev' : '');

  useEffect(() => {
    if (!BookingData || BookingData.length === 0) {
      setFilteredOptions([]);
      return;
    }

    const term = (customerSearchTerm || '').trim().toLowerCase();
    const normalize = (s) => (s || '').toString().trim().toLowerCase();

    const groupBookings = (arr) => {
      const grouped = Object.values(
        arr.reduce((map, item) => {
          const customerKey = normalize(item.customer_name);
          const projectKey = normalize(item.project_name);
          const key = `${customerKey}||${projectKey}`;

          if (!map[key]) {
            map[key] = { ...item, booking_count: 1, display_label: item.customer_name || '' };
          } else {
            map[key].booking_count = (map[key].booking_count || 1) + 1;
            if ((map[key].type === 0 || map[key].type == null) && item.type === 1) {
              map[key] = { ...item, booking_count: map[key].booking_count, display_label: item.customer_name || '' };
            }
          }
          return map;
        }, {})
      );

      grouped.forEach(g => {
        if (g.booking_count && g.booking_count > 1) {
          g.display_label = `${g.customer_name} (${g.booking_count})`;
        } else {
          g.display_label = g.plot_no ? `${g.customer_name} - g.plot_no` : (g.customer_name || '');
        }
      });

      return grouped;
    };

    if (!term) {
      const grouped = groupBookings(BookingData);
      setFilteredOptions(grouped);
      return;
    }

    const filtered = BookingData.filter((item) => {
      const name = (item.customer_name || '').toString().toLowerCase();
      const sector = (item.sector_name || item.project_name || '').toString().toLowerCase();
      const plotNo = (item.plot_no || '').toString().toLowerCase();
      return name.includes(term) || sector.includes(term) || plotNo.includes(term);
    });

    const uniqueFiltered = groupBookings(filtered);
    setFilteredOptions(uniqueFiltered);
  }, [customerSearchTerm, BookingData]);

  useEffect(() => {
    let deb;
    const typed = (customerSearchTerm || '').trim();

    if (typed) {
      if (selectedOption && selectedOption.booking_id) {
        setSelectedOption({});
        setSelectedBookingId(null);
        setCustomerPlotId(null);
        setCustomerId(null);
      }
      deb = setTimeout(() => { getAllBookings(); }, 350);
    }

    return () => clearTimeout(deb);
  }, [customerSearchTerm]);

  const headerCustomerName =
    selectedOption?.customer_name || row?.customer_name || data?.customer_name || '';
  const headerProjectName =
    selectedOption?.project_name || row?.project_name || data?.project_name || '';
  const headerSectorPlot = (() => {
    const sector = selectedOption?.sector_name || row?.sector_name || data?.sector_name || '';
    const plot = selectedOption?.plot_no || row?.plot_no || data?.plot_no || PlotId || '';
    if (!sector && !plot) return '';
    if (sector && plot) return `${sector} / ${plot}`;
    return sector || plot;
  })();

  const headerCustomerClass =
    (selectedOption?.krutiDev_font == 1 || row?.krutiDev_font == 1 || data?.krutiDev_font == 1) ? 'kruti-dev' : '';
  const headerProjectClass =
    (selectedOption?.project_font == 1 || row?.project_font == 1 || data?.project_font == 1) ? 'kruti-dev' : '';
  const headerSectorClass = headerProjectClass;

  return (
    <React.Fragment>

       <BackButton isEnglish={isEnglish} />
      {showAlert && (
        <div className="alert alert-success position-fixed w-full" style={{ top: '20px', right: '20px', zIndex: '1050', minWidth: 260 }} role="alert">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>{AlertMsg}</div>
            <button type="button" className="btn-close" aria-label="Close" onClick={() => {
              setShowAlert(false);
              if (alertTimer.current) { clearTimeout(alertTimer.current); alertTimer.current = null; }
            }} />
          </div>
        </div>
      )}

      {/* ⭐⭐⭐ ADD-PROJECT-CARD WRAPPER ⭐⭐⭐ */}
      <div className="add-project-card">
        <Row>
          <Col sm={12}>
            <Card>
              <Card.Header className="project-header">
                <div>
                  <Card.Title as="h5" className="project-title">
                    {updateBtnShow || Mode === 'edit'
                      ? L('Receive Amount Update','राशि अपडेट करें')
                      : L('Receive Amount Add','राशि जोड़ें')}
                  </Card.Title>

                  {(headerCustomerName || headerProjectName || headerSectorPlot) && (
                    <div style={{
  fontSize: '13px',
  marginTop: 4,
  lineHeight: 1.4,
  color: 'white'
}}>
                      <div>
                        <strong>
                          {L('Customer: ', 'ग्राहक: ')}
                          <span className={headerCustomerClass}>{headerCustomerName || '-'}</span>
                        </strong>
                      </div>
                      <div>
                        {L('Project: ', 'प्रोजेक्ट: ')}
                        <span className={headerProjectClass}>{headerProjectName || '-'}</span>
                      </div>
                      <div>
                        {L('Sector / Plot: ', 'सेक्टर / प्लॉट: ')}
                        <span className={headerSectorClass}>{headerSectorPlot || '-'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ minWidth: 150, maxWidth: 180 }}>
                  <Form.Select className="custom-select" value={FontValue} onChange={handleLanguageChange} size="sm">
                    <option value={0}>English</option>
                    <option value={1}>Hindi</option>
                    <option value={2}>Mangal</option>
                  </Form.Select>
                </div>
              </Card.Header>

              <Card.Body>
                <Row className="border-bottom border-1 border-grey">
                  <Col>
                    <Form>
                      <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Row className="mb-2">
                          <Col md={4}>
                            <Form.Label className="form-label">{L('Select Customer*','ग्राहक चुनें*')}</Form.Label>

                            <div style={{ position: 'relative' }}>
                              {isMangal ? (
                                <ReactTransliterate
                                  value={customerSearchTerm || ''}
                                  onChangeText={(txt) => {
                                    setCustomerSearchTerm(txt);
                                    setShowSuggestions(true);
                                    if (txt && selectedOption && selectedOption.booking_id) {
                                      setSelectedOption({});
                                    }
                                  }}
                                  ref={customerInputRef}
                                  inputRef={customerInputRef}
                                  lang="hi"
                                  placeholder={selectedOption.customer_name ? `${selectedOption.customer_name} ${selectedOption.sector_name}  ${selectedOption.plot_no}` : L('Select Customer *','ग्राहक चुनें *')}
                                  maxLength={200}
                                  className={`form-control form-control-sm ${krutiClassIfTyped(customerSearchTerm)} ${(selectedOption?.krutiDev_font == 1 || selectedOption?.project_font == 1) ? 'kruti-dev' : ''}`}
                                  onFocus={() => setShowSuggestions(true)}
                                  onBlur={() => { setTimeout(() => setShowSuggestions(false), 300); }}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={customerSearchTerm}
                                  ref={customerInputRef}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCustomerSearchTerm(val);
                                    setShowSuggestions(true);
                                    if (val && selectedOption && selectedOption.booking_id) {
                                      setSelectedOption({});
                                    }
                                  }}
                                  onFocus={() => setShowSuggestions(true)}
                                  onBlur={() => { setTimeout(() => setShowSuggestions(false), 300); }}
                                  className={`form-control form-control-sm ${krutiClassIfTyped(customerSearchTerm)} ${(selectedOption?.krutiDev_font == 1 || selectedOption?.project_font == 1) ? 'kruti-dev' : ''}`}
                                  placeholder={selectedOption.customer_name ? `${selectedOption.customer_name}  ${selectedOption.sector_name}  ${selectedOption.plot_no}` : L('Select Customer *','ग्राहक चुनें *')}
                                />
                              )}

                              {showSuggestions && filteredOptions && filteredOptions.length > 0 && (
                                <ul className="broker-dropdown show" style={{ maxHeight: '200px' }}>
                                  {filteredOptions.map((data, index) => (
                                    <li
                                      key={index}
                                      className={`dropdown-item ${data.krutiDev_font == 1 ? 'kruti-dev' : ''}`}
                                      onMouseDown={(ev) => {
                                        ev.preventDefault();
                                        try {
                                          const label = data.customer_name ? (data.plot_no ? `${data.customer_name} - ${data.plot_no}` : data.customer_name) : '';
                                          setCustomerSearchTerm(label);
                                        } catch (err) {}
                                        handleSelection(data);
                                      }}
                                    >
                                      <span>{data.customer_name}</span>
                                      <span className={data.project_font == 1 ? 'kruti-dev' : ''} style={{ marginLeft: 'auto', color: '#666' }}>{data.sector_name}</span>
                                      <span style={{ marginLeft: '10px', fontWeight: 600 }}>{data.plot_no}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <Form.Text className="form-text text-muted">
                              <p className="error-text">{userSelectError}</p>
                            </Form.Text>
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{L('Customer Number*','ग्राहक का नंबर*')}</Form.Label>
                            <Form.Control
                              value={CustomerNumber}
                              disabled={true}
                              onChange={(e) => { if (e.target.value.length <= 10) { setCustomerNumber(e.target.value); } }}
                              onKeyDown={(e) => { if (e.key === '.' || e.key === '-' || e.key === 'e') { e.preventDefault(); } }}
                              type="number"
                              placeholder={L('Customer Number *','ग्राहक का नंबर *')}
                              className={`form-control form-control-sm ${krutiClassIfTyped(CustomerNumber)}`}
                            />
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{L('Square Feet Rate*','स्क्वायर फीट दर*')}</Form.Label>
                            <Form.Control
                              value={SquareFeet}
                              onChange={(e) => setSquareFeet(e.target.value)}
                              type="number"
                              placeholder={L('Square feet rate *','स्क्वायर फीट दर *')}
                              className={`form-control form-control-sm ${krutiClassIfTyped(SquareFeet)}`}
                              disabled={true}
                            />
                          </Col>
                        </Row>

                        <Row className="mb-2">
                          <Col md={4}>
                            <Form.Label className="form-label">{L('Booking Amount *','बुकिंग राशि *')}</Form.Label>
                            <Form.Control
                              value={BookingAmount}
                              onChange={(e) => setBookingAmount(e.target.value)}
                              type="number"
                              placeholder={L('Booking Amount *','बुकिंग राशि *')}
                              maxLength={200}
                              className={`form-control form-control-sm ${krutiClassIfTyped(BookingAmount)}`}
                              disabled={true}
                            />
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{L('Amount*','राशि*')}</Form.Label>
                            <Form.Control
                              value={AmountA}
                              onChange={(e) => setAmountA(e.target.value)}
                              type="number"
                              placeholder={L('Amount ','राशि ')}
                              maxLength={200}
                              className={`form-control form-control-sm ${krutiClassIfTyped(AmountA)}`}
                              disabled={true}
                            />
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{L('Square Feet Size *','स्क्वायर फीट आकार *')}</Form.Label>
                            <Form.Control
                              value={SquareFeetSize}
                              onChange={(e) => setSquareFeetSize(e.target.value)}
                              type="number"
                              placeholder={L('Square Feet Size *','स्क्वायर फीट आकार *')}
                              maxLength={200}
                              className={`form-control form-control-sm ${krutiClassIfTyped(SquareFeetSize)}`}
                              disabled={true}
                            />
                          </Col>
                        </Row>

                        <Row className="mb-2">
                          <Col md={4}>
                            <Form.Label className="form-label">{L('Mode of payment ','भुगतान का तरीका')}</Form.Label>
                            <Form.Select className="custom-select" onChange={(e) => setPaymentTypeValue(e.target.value)} value={PaymentTypeValue} disabled={true}>
                              <option>{L('Mode of payment','भुगतान का तरीका')}</option>
                              {PaymentType && PaymentType?.map((data, index) => (
                                <option key={index} value={data.id}>{data.payment_mode}</option>
                              ))}
                            </Form.Select>
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{L('Time of payment *','भुगतान का समय *')}</Form.Label>
                            <Form.Control
                              value={TimeofPayment}
                              onChange={(e) => setTimeofPayment(e.target.value)}
                              type="text"
                              placeholder={L('Time of payment *','भुगतान का समय *')}
                              maxLength={20}
                              className={`form-control form-control-sm ${krutiClassIfTyped(TimeofPayment)}`}
                              disabled={true}
                            />
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{L('Additional comments','अतिरिक्त टिप्पणी')}</Form.Label>
                            <Form.Control
                              value={AdditionalComments}
                              onChange={(e) => setAdditionalComment(e.target.value)}
                              type="text"
                              placeholder={L('Additional comments','अतिरिक्त टिप्पणी')}
                              maxLength={100}
                              className={`form-control form-control-sm ${krutiClassIfTyped(AdditionalComments)}`}
                              disabled={true}
                            />
                          </Col>
                        </Row>

                        <Row className="mb-2">
                          <Col md={4}>
                            <Form.Label className="form-label">{L('Reference ','संदर्भ')}</Form.Label>
                            <Form.Control
                              value={Refrens}
                              type="text"
                              placeholder={L('Reference ','संदर्भ')}
                              className={`form-control form-control-sm ${krutiClassIfTyped(Refrens)}`}
                              maxLength={50}
                              disabled={true}
                            />
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{L('Date of agreement','समझौते की तिथि')}</Form.Label>
                            <Form.Control value={agreementDate} onChange={(e) => SetAgreementDate(e.target.value)} type="date" placeholder={L('Date of agreement ','समझौते की तिथि ')} className="form-control form-control-sm" disabled={true} />
                          </Col>

                          <Col md={4}>
                            <Form.Label className="form-label">{L('Date of register','रजिस्टर की तिथि')}</Form.Label>
                            <Form.Control value={registerDate} onChange={(e) => setregisterDate(e.target.value)} type="date" placeholder={L('Date of register ','रजिस्टर की तिथि ')} className="form-control form-control-sm" disabled={true} />
                          </Col>
                        </Row>
                      </Form.Group>
                    </Form>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={2}>
                    <Form.Label className="form-label">{L('Amount','राशि')}</Form.Label>
                    <Form.Control value={receiveamount} onChange={(e) => setreceiveamount(e.target.value)} onKeyDown={(e) => { if (e.key === '.' || e.key === '-' || e.key === 'e') { e.preventDefault(); } }} type="number" placeholder={L('Amount','राशि')} maxLength={200} className={`form-control form-control-sm ${krutiClassIfTyped(receiveamount)}`} />
                    <Form.Text className="form-text text-muted"><p className="error-text">{receiveamountError}</p></Form.Text>
                  </Col>

                  <Col md={2}>
                    <Form.Label className="form-label">{L('Mode of payment ','भुगतान का तरीका')}</Form.Label>
                    <Form.Select className="custom-select" onChange={(e) => setreceiveAmountType(e.target.value)} value={receiveAmountType}>
                      <option value="">{L('Mode','विधि')}</option>
                      {PaymentType && PaymentType?.map((data, index) => (
                        <option key={index} value={data.id}>{data.payment_mode}</option>
                      ))}
                    </Form.Select>
                    <Form.Text className="form-text text-muted"><p className="error-text">{receiveAmountTypeError}</p></Form.Text>
                  </Col>

                  <Col md={2}>
                    <Form.Label className="form-label">{isTransactionMain ? L('Transaction No','लेन-देन संख्या') : L('Cheque No','चेक नंबर')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={chequeNo}
                      onChange={(e) => setChequeNo(e.target.value)}
                      placeholder={isTransactionMain ? L('Enter Transaction No','लेन-देन संख्या दर्ज करें') : L('Enter Cheque No','चेक नंबर दर्ज करें')}
                      maxLength={15}
                      className={`form-control form-control-sm ${krutiClassIfTyped(chequeNo)}`}
                    />
                  </Col>

                  <Col md={3}>
                    <Form.Label className="form-label">{L('Towords', 'टुवर्ड्स')}</Form.Label>
                    {isMangal ? (
                      <ReactTransliterate
                        as="textarea"
                        rows={1}
                        value={towords || ''}
                        onChangeText={(txt) => setTowords(txt)}
                        lang="hi"
                        placeholder={L('Enter Towords', 'टुवर्ड्स दर्ज करें')}
                        maxLength={20}
                        className={`form-control form-control-sm ${krutiClassIfTyped(towords)}`}
                      />
                    ) : (
                      <Form.Control
                        as="textarea"
                        rows={1}
                        type="text"
                        value={towords}
                        onChange={(e) => setTowords(e.target.value)}
                        placeholder={L('Enter Towords', 'टुवर्ड्स दर्ज करें')}
                        maxLength={20}
                        className={`form-control form-control-sm ${krutiClassIfTyped(towords)}`}
                      />
                    )}
                  </Col>

                  <Col md={3}>
                    <Form.Label className="form-label">{L('Bank Name','बैंक का नाम')}</Form.Label>
                    {isMangal ? (
                      <ReactTransliterate value={bankName || ''} onChangeText={(txt) => setBankName(txt)} lang="hi" placeholder={L('Bank name','बैंक का नाम')} maxLength={30} className={`form-control form-control-sm ${krutiClassIfTyped(bankName)}`} />
                    ) : (
                      <Form.Control type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder={L('Bank name','बैंक का नाम')} maxLength={30} className={`form-control form-control-sm ${krutiClassIfTyped(bankName)}`} />
                    )}
                  </Col>

                  <Col md={3}>
                    <Form.Label className="form-label">{L('Branch Name','शाखा का नाम')}</Form.Label>
                    {isMangal ? (
                      <ReactTransliterate value={branchName || ''} onChangeText={(txt) => setBranchName(txt)} lang="hi" placeholder={L('Branch name','शाखा का नाम')} maxLength={50} className={`form-control form-control-sm ${krutiClassIfTyped(branchName)}`} />
                    ) : (
                      <Form.Control type="text" value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder={L('Branch name','शाखा का नाम')} maxLength={50} className={`form-control form-control-sm ${krutiClassIfTyped(branchName)}`} />
                    )}
                  </Col>

                  <Col md={2}>
                    <Form.Label className="form-label">{isTransactionMain ? L('Transaction Date','लेन-देन तिथि') : L('Cheque Date:','चेक की तिथि:')}</Form.Label>
                    <Form.Control value={chequeDate} onChange={(e) => setChequeDate(e.target.value)} type="date" className="form-control form-control-sm" />
                    <Form.Text className="form-text text-muted"><p className="error-text">{receiveAmountDateError}</p></Form.Text>
                  </Col>

                  <Col md={3}>
                    <Form.Label className="form-label">{L('Image','छवि')}</Form.Label>
                    <Form.Control onChange={handleImage} type="file" placeholder={L('Additional comment','अतिरिक्त टिप्पणी')} maxLength={100} className="form-control form-control-sm" accept="image/*" />
                  </Col>

                  <Col md={2}>
                    <Form.Label className="form-label">{L('Receive  Date:','तिथि:')}</Form.Label>
                    <Form.Control value={receiveAmountDate} onChange={(e) => setreceiveAmountDate(e.target.value)} type="date" className="form-control form-control-sm" />
                    <Form.Text className="form-text text-muted"><p className="error-text">{receiveAmountDateError}</p></Form.Text>
                  </Col>

                  {showInput && (
                    <Col md={2}>
                      <Form.Label className="form-label">{L('Amount ','राशि ')}</Form.Label>
                      <Form.Control value={RemainingAmount_b} onChange={handleAmountBChange} type="number" placeholder={L('Amount ','राशि ')} maxLength={200} className={`form-control form-control-sm ${krutiClassIfTyped(RemainingAmount_b)}`} />
                      <Form.Text className="form-text text-muted"><p className="error-text">{receiveamountError}</p></Form.Text>
                    </Col>
                  )}

                  {showInput && (
                    <Col md={3}>
                      <Form.Label className="form-label">{L('Mode of payment ','भुगतान का तरीका')}</Form.Label>
                      <Form.Select className="custom-select" onChange={(e) => setreceiveAmountBType(e.target.value)} value={receiveAmountBType}>
                        <option>{L('Mode of payment ','भुगतान का तरीका')}</option>
                        {PaymentType && PaymentType?.map((data, index) => (
                          <option key={index} value={data.id}>{data.payment_mode}</option>
                        ))}
                      </Form.Select>
                      <Form.Text className="form-text text-muted"><p className="error-text">{receiveAmountTypeError}</p></Form.Text>
                    </Col>
                  )}

                  {showInput && (
                    <>
                      <Col md={2}>
                        <Form.Label className="form-label">{L('Total Amount ','कुल राशि ')}</Form.Label>
                        <Form.Control value={AmountB} onChange={handleAmountBChange} type="number" placeholder={L('Amount ','राशि ')} maxLength={200} className="form-control form-control-sm" disabled={true} />
                      </Col>

                      <Col md={2}>
                        <Form.Label className="form-label">{L('Date:','तिथि:')}</Form.Label>
                        <Form.Control value={receiveAmountDateB} onChange={(e) => setreceiveAmountDateB(e.target.value)} type="date" className="form-control form-control-sm" />
                        <Form.Text className="form-text text-muted"><p className="error-text">{receiveAmountDateError}</p></Form.Text>
                      </Col>
                    </>
                  )}

                  <Col md={3} className="mb-2">
                    <Form.Label className="form-label">{L('Additional comment','अतिरिक्त टिप्पणी')}</Form.Label>
                    {isMangal ? (
                      <ReactTransliterate value={receiveAdditioncomment || ''} onChangeText={(txt) => setreceiveAdditioncomment(txt)} lang="hi" placeholder={L('Additional comment','अतिरिक्त टिप्पणी')} maxLength={100} className={`form-control form-control-sm ${krutiClassIfTyped(receiveAdditioncomment)}`} />
                    ) : (
                      <Form.Control value={receiveAdditioncomment} onChange={(e) => setreceiveAdditioncomment(e.target.value)} type="text" placeholder={L('Additional comment','अतिरिक्त टिप्पणी')} maxLength={100} className={`form-control form-control-sm ${krutiClassIfTyped(receiveAdditioncomment)}`} />
                    )}
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col>
                    <Form.Text className="form-text text-muted">
                      {RemainingAmount && (
                        <div style={{ marginLeft: 'auto', textAlign: 'left', fontSize: 12, color: 'grey', gap: 4 }}>
                          <p style={{ margin: 0, color: 'grey', fontSize: '12px' }}>
                            {L('Total Amount:', 'कुल राशि :')} {formatAmount(RemainingAmount?.booking_amount_a)}
                          </p>
                          <p style={{ margin: 0, color: 'grey', fontSize: '12px' }}>
                            {L('Step-wise Received Amount AND Total Amount:', 'कदम-दर-कदम प्राप्त राशि:')}{' '}
                            ({RemainingAmount?.all_received_amount_a && Array.isArray(RemainingAmount.all_received_amount_a)
                              ? RemainingAmount.all_received_amount_a.map(v => formatAmount(v)).join(' + ')
                              : '0'}) = {formatAmount(RemainingAmount?.total_all_received_amount_a)}
                          </p>
                          {RemainingAmount?.extra_paid_a === 0 ? (
                            <p style={{ margin: 0, color: 'grey', fontSize: '12px' }}>
                              {L('Remaining Amount:', 'शेष राशि:')}{' '}
                              ({formatAmount(RemainingAmount?.booking_amount_a)} - {formatAmount(RemainingAmount?.total_all_received_amount_a)}) ={' '}
                              {formatAmount(RemainingAmount?.remaining_amount_a)}
                            </p>
                          ) : (
                            <p className="error-text" style={{ fontWeight: 600 }}>
                              {L('Extra Paid:', 'अतिरिक्त भुगतान:')} {formatAmount(RemainingAmount?.extra_paid_a)}
                            </p>
                          )}
                          <hr />
                          {showInput && (
                            <>
                              <p style={{ margin: 0, color: 'grey', fontSize: '12px' }}>
                                {L('Total Welcome:', 'कुल स्वागत :')} {formatAmount(RemainingAmount?.booking_amount_b)}
                              </p>
                              <p style={{ margin: 0, color: 'grey', fontSize: '12px' }}>
                                {L('Step-wise Received Welcome AND Total Welcome:', 'स्टेप-wise प्राप्त स्वागत और कुल स्वागत: ')}{' '}
                                {RemainingAmount?.all_received_amount_b && Array.isArray(RemainingAmount.all_received_amount_b) && RemainingAmount.all_received_amount_b.length > 0 ? (
                                  <>({RemainingAmount.all_received_amount_b.map(v => formatAmount(v)).join(' + ')}) = {formatAmount(RemainingAmount.total_all_received_amount_b)}</>
                                ) : (<>0</>)}
                              </p>
                              {RemainingAmount?.extra_paid_b === 0 ? (
                                <p style={{ margin: 0, color: 'grey', fontSize: '12px' }}>
                                  {L('Remaining Welcome:', 'शेष स्वागत:')}{' '}
                                  ({formatAmount(RemainingAmount?.booking_amount_b)} - {formatAmount(RemainingAmount?.total_all_received_amount_b)}) ={' '}
                                  {formatAmount(RemainingAmount?.remaining_amount_b)}
                                </p>
                              ) : (
                                <p className="error-text" style={{ fontWeight: 600 }}>
                                  {L('Extra Paid:', 'अतिरिक्त भुगतान:')} {formatAmount(RemainingAmount?.extra_paid_b)}
                                </p>
                              )}
                              <hr />
                              <p style={{ margin: 0, color: 'grey', fontSize: '12px' }}>
                                {L('Total Remaining :', 'कुल शेष राशि:')} {formatAmount(RemainingAmount?.total_remaining_amount)}
                              </p>
                              <p style={{ margin: 0, color: 'grey', fontSize: '12px' }}>
                                {L('Total Received Amount:', 'कुल प्राप्त राशि :')} {formatAmount(RemainingAmount?.total_received_amount)}
                              </p>
                              {RemainingAmount?.total_extra_paid > 0 && (
                                <p className="error-text" style={{ fontWeight: 600 }}>
                                  {L('Extra Paid:', 'अतिरिक्त भुगतान:')} {formatAmount(RemainingAmount.total_extra_paid)}
                                </p>
                              )}
                            </>
                          )}
                          {error && <p className="error-text">{error}</p>}
                        </div>
                      )}
                    </Form.Text>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                     

                      <div></div>

                      {(updateBtnShow && updateBtnShow) || Mode == 'edit' ? (
                        <Button className="submit-btn" onClick={updateReceiveAmountFun}>
                          {L('Update','अपडेट')}
                        </Button>
                      ) : (
                        <Button className="submit-btn" onClick={addReceiveAmountFun}>
                          {L('Submit','सबमिट')}
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
      {/* ⭐⭐⭐ END WRAPPER ⭐⭐⭐ */}

      <PasswordModal show={showPasswordModal} onClose={() => setShowPasswordModal(false)} errors={errors} onSubmit={handlePasswordSubmit} />
    </React.Fragment>
  );
}

export default AddAmount;