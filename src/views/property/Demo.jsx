// LandDetails.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import './style.css';

import SellerKycDocuments from './SellerKycDocuments';
import ConversionInfo from './ConversionInfo';
import AttachmentsSection from './AttachmentsSection';
import ReraRegistrationSection from './ReraRegistrationSection';
import AllotmentPattaSection from './AllotmentPattaSection';
import LandIdentificationSection from './LandIdentificationSection';
import OwnershipPaymentSection from './OwnershipPaymentSection';
import MainAttachmentsSection from './MainAttachmentsSection';
import SellerKycSection from './SellerKycSection';
import ConversionSection from './ConversionSection';
import ReraAllotmentSection from './ReraAllotmentSection';
import SellerBuyerSection from './SellerBuyerSection';

import { ReactTransliterate } from 'react-transliterate';
import { API_BASE_URL } from 'config/constant';

const LANGUAGE = { EN: 0, HI: 1, KRUTI: 2 };

// ---------- helpers ----------
const toDateInput = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const splitFilePaths = (v) =>
  !v
    ? []
    : Array.isArray(v)
    ? v.map(String).filter(Boolean)
    : String(v)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
const isRealFile = (f) => typeof File !== 'undefined' && f instanceof File;
const getPreviewUrl = (item) => {
  if (!item) return '';
  if (isRealFile(item)) return URL.createObjectURL(item);
  if (item && item.existing && item.name) return `${API_BASE_URL}/uploads/${item.name}`;
  if (typeof item === 'string') return `${API_BASE_URL}/uploads/${item}`;
  return '';
};
const getFileName = (item) => {
  if (!item) return '';
  if (isRealFile(item)) return item.name;
  if (typeof item === 'string') return item;
  if (item && typeof item.name === 'string') return item.name;
  if (Array.isArray(item)) return item.join(',');
  return '';
};

// ---------- build existing payload helpers ----------
const buildExistingKycPayload = (kycDocs = []) => {
  const out = {
    seller_aadhaar_existing: [],
    seller_pan_existing: [],
    seller_poa_pan_existing: [],
    khasra_file_existing: [],
    upniveshan_khasra_existing: [],
  };
  (kycDocs || []).forEach((it) => {
    if (!it || !it.file || !it.file.existing || !it.file.name) return;
    const name = String(it.file.name).trim();
    if (!name) return;
    if (it.key === 'sellerAadhar' || it.key === 'sellerAadhaar') out.seller_aadhaar_existing.push(name);
    if (it.key === 'sellerPAN') out.seller_pan_existing.push(name);
    if (it.key === 'poaPAN') out.seller_poa_pan_existing.push(name);
    if (it.key === 'rajaswaKhasraDoc') out.khasra_file_existing.push(name);
    if (it.key === 'upniveshanKhasraDoc') out.upniveshan_khasra_existing.push(name);
  });
  Object.keys(out).forEach((k) => {
    out[k] = out[k].join(',');
  });
  return out;
};
const buildExistingConversionPayload = (formData = {}) => {
  const res = {
    conversion_challan_existing: [],
    conversion_order_existing: [],
    conversion_map_existing: [],
  };
  (formData.conversionChallanCopy || []).forEach((i) => {
    if (i && i.existing && i.name) res.conversion_challan_existing.push(String(i.name).trim());
  });
  (formData.conversionOrderAttachment || []).forEach((i) => {
    if (i && i.existing && i.name) res.conversion_order_existing.push(String(i.name).trim());
  });
  (formData.conversionMapAttachment || []).forEach((i) => {
    if (i && i.existing && i.name) res.conversion_map_existing.push(String(i.name).trim());
  });
  Object.keys(res).forEach((k) => (res[k] = res[k].join(',')));
  return res;
};
const buildExistingReraPayload = (formData = {}) => {
  const res = {
    tir_report_existing: [],
    valuation_report_existing: [],
    allotment_attachment_existing: [],
    related_payment_existing: [],
    plot_patta_existing: [],
  };
  (formData.tirReportUpload || []).forEach((i) => {
    if (i && i.existing && i.name) res.tir_report_existing.push(String(i.name).trim());
  });
  (formData.valuationReportUpload || []).forEach((i) => {
    if (i && i.existing && i.name) res.valuation_report_existing.push(String(i.name).trim());
  });
  (formData.allotmentAttachment || []).forEach((i) => {
    if (i && i.existing && i.name) res.allotment_attachment_existing.push(String(i.name).trim());
  });
  (formData.relatedPaymentDocs || []).forEach((i) => {
    if (i && i.existing && i.name) res.related_payment_existing.push(String(i.name).trim());
  });
  (formData.plotPattaAttachment || []).forEach((i) => {
    if (i && i.existing && i.name) res.plot_patta_existing.push(String(i.name).trim());
  });
  Object.keys(res).forEach((k) => (res[k] = res[k].join(',')));
  return res;
};

// ---------- UI helpers ----------
const getRelationLabel = (relation, fontMode) => {
  if (fontMode === LANGUAGE.EN) {
    if (relation === 'W/O') return "Husband Name";
    if (relation === 'D/O') return "Father Name";
    return "Father Name";
  }
  if (relation === 'W/O') return 'पति का नाम ';
  if (relation === 'D/O') return 'पिता का नाम ';
  return 'पिता का नाम';
};
const getRelationPlaceholder = (relation, fontMode) => {
  if (fontMode === LANGUAGE.EN) {
    if (relation === 'W/O') return "Enter Husband Name";
    if (relation === 'D/O') return "Enter Father Name";
    return "Enter Father Name";
  }
  if (relation === 'W/O') return 'पति का नाम दर्ज करें';
  if (relation === 'D/O') return 'पिता का नाम दर्ज करें';
  return 'पिता का नाम दर्ज करें';
};

// HindiInput (kept same behavior)
const HindiInput = ({ value, onChange, placeholder, fontMode, className = '', maxLength, ...rest }) => {
  const applyLimit = (t) => (!maxLength ? t : String(t).slice(0, maxLength));
  if (fontMode === LANGUAGE.KRUTI) {
    return (
      <Form.Control
        type="text"
        value={value}
        onChange={(e) => onChange(applyLimit(e.target.value))}
        placeholder={placeholder}
        className={`form-control-sm kruti-dev ${className}`}
        maxLength={maxLength}
        {...rest}
      />
    );
  }
  const translitOn = fontMode !== LANGUAGE.EN;
  const mangalOn = fontMode === LANGUAGE.HI;
  if (translitOn) {
    return (
      <ReactTransliterate
        lang="hi"
        value={value}
        onChangeText={(text) => onChange(applyLimit(text))}
        placeholder={placeholder}
        className={`form-control form-control-sm ${mangalOn ? 'devanagari' : ''} ${className}`}
        maxLength={maxLength}
        {...rest}
      />
    );
  }
  return (
    <Form.Control
      type="text"
      value={value}
      onChange={(e) => onChange(applyLimit(e.target.value))}
      placeholder={placeholder}
      className={`form-control-sm ${className}`}
      maxLength={maxLength}
      {...rest}
    />
  );
};

// ---------- Main component ----------
export default function LandDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { mode, data } = state || {};
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';
  const isExistingMode = isEditMode || isViewMode;


  console.log(data,'dataa')

  const userData = JSON.parse(localStorage.getItem('users')) || {};
  const [FontValue, setFontValue] = useState(LANGUAGE.EN);
  const [Class, setClass] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState([]);
  const [paymentTypeValue, setPaymentTypeValue] = useState('');
  const [fetchedRow, setFetchedRow] = useState(null);
  const [isFetchingRow, setIsFetchingRow] = useState(false);

  const formRef = useRef(null);
  const [submittingSection, setSubmittingSection] = useState(null);

  // ---------- initial state ----------
  const initialState = {
    // section level area for seller/buyer (used in SellerBuyerSection)
    seller_area: '',
    buyer_area: '',

    sellers: [
      {
        id: null,
        seller_name: '',
        poa_holder_name: '',
        seller_remarks: '',
        type: 'seller', // 'seller' / 'holder' (company)
        relation: 'S/O',
        fatherName: '',
        age: '',
        aadhaar: '',
         director_name: '',     // ✅ ADD
    director_pan: '',      // ✅ ADD
        pan: '',
        address: '',
        mobile: '',
        reference: '',
        font_name: FontValue || LANGUAGE.EN,
      },
    ],
    buyers: [
      {
        id: null,
        type: 'individual',
        name: '',
        relation: 'S/O',
        fatherName: '',
        age: '',
        aadhaar: '',
        pan: '',
        address: '',
        mobile: '',
        reference: '',
         area: ''
        
      },
    ],
    landArea: '',
    landUnit: 'Bigha',
    upniveshanType: 'Khasra',
    upniveshanKhasra: '',
    rajaswaKhasra: '',
    murbaType: 'Murba',
    murbaKila: '',
  
    mapMasterPlan: [],
    kycDocs: [],
    conversionChallanCopy: [],
    conversionOrderAttachment: [],
    conversionMapAttachment: [],
    convertedArea: '',
    mapAttachment: [],
 chainDocs: [{ file: null, date: "" }],
 mapMasterPlan: [{ file: null, date: "" }],
 mutationDocs: [{ file: null, date: "" }],
    remarks: '',
    category: '',
    mutationStatus: '',
    physicalPossession: '',
    paymentA: '',
    paymentAdmin: '',
    compensationPayment: '',
    documentDate: '',
    landDate: '',
    rajaswaDocDate: '',
    upniveshanDocDate: '',
    mapDate: '',
    kycDocsDate: '',
    conversion_application_date: '',
    conversion_order_date: '',
    conversionOrderDate: '', // frontend-friendly duplicate
    provision_section: '',
    division_of_area: '',
    divisionDetails: {},
    conversionChallanDate: '',
    conversionMapDate: '',
    conversion_authority: '',
    paymentDate: '',
    reraRegistrationNumber: '',
    dateOfDocuments: '',
    tirReportUpload: [],
    valuationReportUpload: [],
    allotmentAttachment: [],
    relatedPaymentDocs: [],
    plotPattaAttachment: [],
    pattaAppliedDate: '',
    pattaReceivedDate: '',
    allotmentDirectCustomer: '',
    propertiesPaymentId: null,
    paymentMode: '',
    bankName: '',
    branchName: '',
    chequeNo: '',
    tirReportDate: '',
    valuationReportDate: '',
    allotmentDate: '',
    reraPaymentDate: '',
    projectName: "", 
  };

  // map API -> form (keeps stable)
  const mapApiToForm = (apiRow) => {
    if (!apiRow) return initialState;

    // ---- buyers ----
    const buyersFromApi = Array.isArray(apiRow.buyers) ? apiRow.buyers : [];
const buyers = buyersFromApi.map((b) => ({
  id: b.id || null,
projectName:
    apiRow.project_name ||
    apiRow.projectName ||
    apiRow.name ||        // 🔥 projects table ka column
    "",

  // ✅ BACKEND MATCH
  type: b.party_type === 'company' ? 'company' : 'individual',

  name: b.name || '',
  relation: b.relation_prefix || 'S/O',
  fatherName: b.prefix_name || '',
  age: b.age || '',
  aadhaar: b.aadhar_number || '',
  pan: b.pan_number || '',
  address: b.address || '',
  mobile: b.mobile_number || '',
  reference: b.reference || '',
}));


  
    const upniMap = { UPNI: 'Khasra', CHAK: 'Chak' };
    const murbbaMap = { MURBBA: 'Murba', KILA: 'Kila' };

    const paymentsArr = Array.isArray(apiRow.all_payments) ? apiRow.all_payments : [];
    const primaryPayment = paymentsArr.length > 0 ? paymentsArr[0] : apiRow;
    const primaryPaymentId = (primaryPayment && primaryPayment.id) || apiRow.properties_payment_id || null;
    const paymentModeId =
      primaryPayment.payment_mode ||
      primaryPayment.payment_mode_id ||
      apiRow.payment_mode ||
      apiRow.payment_mode_id ||
      '';

   const sellersFromApi =
  Array.isArray(apiRow.sellers) && apiRow.sellers.length
    ? apiRow.sellers.map((s) => {
        const isCompany = s.party_type === 'company';

        return {
          id: s.id || null,

          seller_name: s.name || '',
          poa_holder_name: s.poa_holder_name || s.relation_name
,
          seller_remarks: s.remarks || '',

          type: isCompany ? 'holder' : 'seller',

          // ✅ COMPANY DIRECTOR
          director_name: isCompany ? s.relation_name || '' : '',
          director_pan: isCompany
            ? Array.isArray(s?.seller_kyc?.pan_files)
              ? s.seller_kyc.pan_files.join(',')
              : ''
            : '',

          relation: isCompany ? 'DIRECTOR' : s.relation_type || 'S/O',
          fatherName: s.relation_name || '',

          age: s.age || '',
          aadhaar: s.aadhaar || '',
          pan: s.pan,
          address: s.address || '',
          mobile: s.mobile || '',
          reference: s.reference || '',
          font_name: Number(s.font_name ?? FontValue),
        };
      })
    : initialState.sellers;

    // ---- divisionDetails (same logic as before) ----
   let divisionDetailsObj = {};

try {
  // 🔹 highest priority: conversion.division_details
  if (apiRow?.conversion?.division_details) {
    if (typeof apiRow.conversion.division_details === 'string') {
      divisionDetailsObj = JSON.parse(apiRow.conversion.division_details);
    } else if (typeof apiRow.conversion.division_details === 'object') {
      divisionDetailsObj = apiRow.conversion.division_details;
    }

  // 🔹 fallback: apiRow.division_details
  } else if (apiRow?.division_details) {
    if (typeof apiRow.division_details === 'string') {
      divisionDetailsObj = JSON.parse(apiRow.division_details);
    } else if (typeof apiRow.division_details === 'object') {
      divisionDetailsObj = apiRow.division_details;
    }

  // 🔹 fallback: apiRow.divisionDetails
  } else if (apiRow?.divisionDetails) {
    if (typeof apiRow.divisionDetails === 'string') {
      divisionDetailsObj = JSON.parse(apiRow.divisionDetails);
    } else if (typeof apiRow.divisionDetails === 'object') {
      divisionDetailsObj = apiRow.divisionDetails;
    }
  }
} catch (e) {
  console.error('❌ Error parsing division details:', e);
  divisionDetailsObj = {};
}


    // section level areas
    const sellerAreaFromApi =
      apiRow.seller_area ||
      (Array.isArray(apiRow.sellers) &&
        apiRow.sellers[0] &&
        (apiRow.sellers[0].area || apiRow.sellers[0].seller_area)) ||
      '';
    const buyerAreaFromApi =
      apiRow.buyer_area ||
      (Array.isArray(apiRow.buyers) &&
        apiRow.buyers[0] &&
        (apiRow.buyers[0].area || apiRow.buyers[0].buyer_area)) ||
      '';

    // pick conversion order date from multiple possible fields
    const apiOrderDate =
      apiRow.order_date || apiRow?.conversion?.conversion_order_date || apiRow?.conversion?.conversionOrderDate || '';

    const apiTirDate = apiRow.tir_report_date || apiRow.tirReportDate || '';
    const apiValDate = apiRow.valuation_report_date || apiRow.valuationReportDate || '';
    const apiAllotDate = apiRow.allotment_date || apiRow.allotmentDate || '';
    const apiPaymentDate =
      apiRow.payment_date || apiRow.rera_payment_date || apiRow.paymentDate || '';

    return {
      sellers: sellersFromApi,
      seller_area: sellerAreaFromApi || initialState.seller_area,
      buyer_area: buyerAreaFromApi || initialState.buyer_area,
      buyers: buyers.length ? buyers : initialState.buyers,
      landArea: apiRow?.land.land_area || '',
      landUnit: landUnitMap[apiRow?.land?.land_area_type] || initialState.landUnit,
      upniveshanType: upniMap[apiRow?.land?.upni_type] || initialState.upniveshanType,
      upniveshanKhasra: apiRow?.land?.upni_no_or_chak_no || '',
      rajaswaKhasra: apiRow?.land?.rajaswa_no || '',
      murbaType: murbbaMap[apiRow?.land?.murbba_type] || initialState.murbaType,
      murbaKila: apiRow?.land?.murbba_or_kila_no || '',
      remarks: apiRow?.land?.remarks
 || '',
      category: primaryPayment.land_category || apiRow.land_category || '',
      mutationStatus: apiRow?.land?.mutation_jamabandi_girdawari || '',
      physicalPossession: primaryPayment.physical_possession_status || '',
      paymentA: primaryPayment.payment_a || '',
      paymentAdmin: primaryPayment.payment_admin_entry || '',
      compensationPayment: primaryPayment.compensation_payment || '',
      paymentDate: toDateInput(primaryPayment.payment_date),
      propertiesPaymentId: primaryPaymentId,
      documentDate: toDateInput(apiRow.document_date),
      kycDocsDate: toDateInput(apiRow.seller_kyc_document_date),
      conversion_application_date: toDateInput(apiRow?.conversion?.application_date),
      conversion_order_date: toDateInput(apiRow?.conversion?.order_date
),
      provision_section: apiRow?.conversion?.provision_section || '',
      division_of_area:
  apiRow?.conversion?.division_of_area ??
  apiRow?.division_of_area ??
  '',

      convertedArea: apiRow?.conversion?.converted_area || '',
      conversion_authority: apiRow?.conversion?.authority
 || '',
      divisionDetails: divisionDetailsObj || {},
      conversionChallanDate: apiRow.conversion_challan_date
        ? toDateInput(apiRow.conversion_challan_date)
        : apiRow.conversionChallanDate
        ? toDateInput(apiRow.conversionChallanDate)
        : '',
      conversionMapDate: apiRow.conversion_map_date
        ? toDateInput(apiRow.conversion_map_date)
        : apiRow.conversionMapDate
        ? toDateInput(apiRow.conversionMapDate)
        : '',
      conversionOrderDate: apiOrderDate
        ? toDateInput(apiOrderDate)
        : apiRow.conversionOrderDate
        ? toDateInput(apiRow.conversionOrderDate)
        : '',
      reraRegistrationNumber: apiRow.rera_number || '',
      dateOfDocuments: toDateInput(apiRow.rera_document_date),
      pattaAppliedDate: toDateInput(apiRow.patta_applied_date),
      pattaReceivedDate: toDateInput(apiRow.patta_received_date),
      allotmentDirectCustomer:
        apiRow.direct_customer_name === 1
          ? 'Yes'
          : apiRow.direct_customer_name === 0
          ? 'No'
          : '',
      paymentMode: paymentModeId,
      bankName: primaryPayment.bank_name || apiRow.bank_name || '',
      branchName: primaryPayment.branch_name || apiRow.branch_name || '',
      chequeNo: primaryPayment.cheque_no || apiRow.cheque_no || '',
    };
  };

  const [formData, setFormData] = useState(initialState);
  const [extraPayments, setExtraPayments] = useState([]);
  const [deletedBuyerIds, setDeletedBuyerIds] = useState([]);
  const [deletedPaymentIds, setDeletedPaymentIds] = useState([]);
  const [deletedLandAttachmentIds, setDeletedLandAttachmentIds] = useState([]);
  const [sectionEdit, setSectionEdit] = useState({
    sellerBuyer: !isViewMode,
    land: !isViewMode,
    ownership: !isViewMode,
    attachments: !isViewMode,
    kyc: !isViewMode,
    conversion: !isViewMode,
    rera: !isViewMode,
  });
  const [sectionBackups, setSectionBackups] = useState({});
  const [suggestions, setSuggestions] = useState({
    physicalPossession: [],
    category: [],
    mutationStatus: [],
  });

  // fetch existing by seller_id if needed
  useEffect(() => {
    const tryFetchBySellerId = async () => {
      const sellerId =
        data && (data.seller_id || data.sellerId || data.sellerId === 0)
          ? data.seller_id || data.sellerId
          : null;
      if (!isExistingMode || !sellerId) return;
      const maybeFull = data && (data.seller_name || data.land_id || Array.isArray(data.buyers));
      if (maybeFull) {
        setFetchedRow(null);
        return;
      }
      try {
        setIsFetchingRow(true);
        const res = await axios.get(`${API_BASE_URL}/properties/list`, {
          headers: { Authorization: userData?.user_token },
        });
        const json = res.data || {};
        if (json.success && Array.isArray(json.data)) {
          const found = json.data.find((r) => Number(r.seller_id) === Number(sellerId));
          setFetchedRow(found || null);
        } else setFetchedRow(null);
      } catch (err) {
        console.error('Error fetching property by seller_id:', err);
        setFetchedRow(null);
      } finally {
        setIsFetchingRow(false);
      }
    };
    tryFetchBySellerId();
  }, [isExistingMode, data?.seller_id, data?.sellerId, userData?.user_token]);

  // payment modes
  useEffect(() => {
    const initPaymentModes = async () => {
      try {
        const paymentResponse = await axios.get(`${API_BASE_URL}/payment/mode`, {
          headers: { Authorization: userData?.user_token },
        });
        if (paymentResponse.data?.success) {
          let list = Array.isArray(paymentResponse.data.data)
            ? paymentResponse.data.data
            : [];
          list = list.sort((a, b) =>
            (a.payment_mode || '').localeCompare(b.payment_mode || '')
          );
          setPaymentType(list);

          const source = fetchedRow || data;
          let paymentModeId = '';
          if (source) {
            if (Array.isArray(source.all_payments) && source.all_payments.length > 0) {
              paymentModeId =
                source.all_payments[0]?.payment_mode ||
                source.all_payments[0]?.payment_mode_id ||
                '';
            } else {
              paymentModeId = source.payment_mode || source.payment_mode_id || '';
            }
          }
          setPaymentTypeValue(paymentModeId);
          if (paymentModeId)
            setFormData((prev) => ({ ...prev, paymentMode: paymentModeId }));
        }
      } catch (error) {
        console.log(error, 'Initialization error');
      }
    };
    initPaymentModes();
  }, [userData?.user_token, data, fetchedRow]);

  const isSectionDisabled = (k) => {
    if (!isViewMode) return false;
    return !sectionEdit[k];
  };

  const renderSectionActions = (sectionKey) => {
    if (!isViewMode) return null;
    if (sectionEdit[sectionKey]) {
      return (
        <div>
          <Button
            size="sm"
            variant="danger"
            type="button"
            onClick={() => {
              const snap = sectionBackups[sectionKey];
              if (snap) {
                if (snap.formData) setFormData(snap.formData);
                if (snap.extraPayments) setExtraPayments(snap.extraPayments);
                if (snap.deletedBuyerIds) setDeletedBuyerIds(snap.deletedBuyerIds);
                if (snap.deletedPaymentIds) setDeletedPaymentIds(snap.deletedPaymentIds);
                if (snap.deletedLandAttachmentIds)
                  setDeletedLandAttachmentIds(snap.deletedLandAttachmentIds);
              }
              setSectionEdit((prev) => ({ ...prev, [sectionKey]: false }));
              setSectionBackups((prev) => {
                const copy = { ...prev };
                delete copy[sectionKey];
                return copy;
              });
            }}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            variant="primary"
            type="button"
            className="ms-2"
            onClick={() => handleSubmit(null, sectionKey)}
          >
            Submit
          </Button>
        </div>
      );
    }
    return (
      <Button
        size="sm"
        variant="outline-primary"
        type="button"
        onClick={() => {
          let snapshot;
          try {
            snapshot =
              typeof structuredClone === 'function'
                ? structuredClone({
                    formData,
                    extraPayments,
                    deletedBuyerIds,
                    deletedPaymentIds,
                    deletedLandAttachmentIds,
                  })
                : JSON.parse(
                    JSON.stringify({
                      formData,
                      extraPayments,
                      deletedBuyerIds,
                      deletedPaymentIds,
                      deletedLandAttachmentIds,
                    })
                  );
          } catch (e) {
            snapshot = {
              formData: { ...formData },
              extraPayments: extraPayments ? [...extraPayments] : [],
              deletedBuyerIds: [...deletedBuyerIds],
              deletedPaymentIds: [...deletedPaymentIds],
              deletedLandAttachmentIds: [...deletedLandAttachmentIds],
            };
          }
          setSectionBackups((prev) => ({ ...prev, [sectionKey]: snapshot }));
          setSectionEdit((prev) => ({ ...prev, [sectionKey]: true }));
        }}
      >
        Edit
      </Button>
    );
  };

  // suggestions
  const fetchSuggestions = async (field, query) => {
    const q = (query || '').trim().toLowerCase();
    if (!q || q.length < 2) {
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/properties/searchProperties`, {
        params: { q },
        headers: { Authorization: userData?.user_token },
      });
      const dataRes = res.data || {};
      if (field === 'physicalPossession') {
        const list = (dataRes.physicalResults || []).filter((item) =>
          (item.physical_possession_status || '').toLowerCase().includes(q)
        );
        setSuggestions((prev) => ({ ...prev, physicalPossession: list }));
      } else if (field === 'category') {
        const list = (dataRes.categoryResults || []).filter((item) =>
          (item.land_category || '').toLowerCase().includes(q)
        );
        setSuggestions((prev) => ({ ...prev, category: list }));
      } else if (field === 'mutationStatus') {
        const list = (dataRes.mutationResults || []).filter((item) =>
          (item.mutation_jamabandi_girdawari || '').toLowerCase().includes(q)
        );
        setSuggestions((prev) => ({ ...prev, mutationStatus: list }));
      }
    } catch (error) {
      console.error('Error while fetching suggestions:', error);
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
    }
  };
  const handleSearchableChange = (field, text) => {
    setFormData((prev) => ({ ...prev, [field]: text }));
    const trimmed = (text || '').trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
      return;
    }
    if (FontValue === LANGUAGE.HI) {
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
      return;
    }
    fetchSuggestions(field, trimmed);
  };
  const handleSelectSuggestion = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // language change
  const handleLanguageChange = (e) => {
    const selectedValue = Number(e.target.value);
    setClass(selectedValue);
    setFontValue(selectedValue);
    setFormData((prev) => ({
      ...prev,
      sellers: Array.isArray(prev.sellers)
        ? prev.sellers.map((s) => ({ ...s, font_name: selectedValue }))
        : prev.sellers,
    }));
  };

  const handleFileChange = (name, file) =>
    setFormData((prev) => ({
      ...prev,
      [name]: [...(prev[name] || []), file],
    }));
  const removeFile = (name, index) =>
    setFormData((prev) => {
      const files = prev[name] || [];
      const fileToRemove = files[index];
      if (
        isExistingMode &&
        (name === 'chainDocs' || name === 'mapMasterPlan' || name === 'mutationDocs') &&
        fileToRemove &&
        fileToRemove.existing &&
        fileToRemove.id
      ) {
        setDeletedLandAttachmentIds((old) =>
          old.includes(fileToRemove.id) ? old : [...old, fileToRemove.id]
        );
      }
      const updated = files.filter((_, i) => i !== index);
      return { ...prev, [name]: updated };
    });

  const addPaymentRow = () =>
    setExtraPayments((prev) => [
      ...prev,
      {
        id: null,
        physicalPossession: '',
        paymentA: '',
        paymentAdmin: '',
        compensationPayment: '',
        category: '',
        paymentDate: '',
        paymentMode: '',
        bankName: '',
        branchName: '',
        chequeNo: '',
      },
    ]);
  const handleExtraPaymentChange = (index, field, value) =>
    setExtraPayments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  const removeExtraPayment = (index) =>
    setExtraPayments((prev) => {
      const paymentToRemove = prev[index];
      if (isExistingMode && paymentToRemove && paymentToRemove.id) {
        setDeletedPaymentIds((old) =>
          old.includes(paymentToRemove.id) ? old : [...old, paymentToRemove.id]
        );
      }
      return prev.filter((_, i) => i !== index);
    });

 

  const dropdownStyle = {
    position: 'absolute',
    zIndex: 1000,
    background: '#fff',
    border: '1px solid #ccc',
    left: 0,
    right: 0,
    maxHeight: '150px',
    overflowY: 'auto',
    fontSize: '0.8rem',
  };
  const dropdownItemStyle = { padding: '4px 8px', cursor: 'pointer' };

  const placeholders = {
   
  };

  // === LABEL TRANSLATIONS (EN / HI) ===
  const LABELS = {
    landDetailsTitle: {
      en: 'Land Details Entry',
      hi: 'भूमि विवरण प्रविष्टि',
    },

    landIdentification: {
      en: 'Land Identification',
      hi: 'भूमि की पहचान',
    },
    ownershipPayment: {
      en: 'Ownership & Payment',
      hi: 'स्वामित्व एवं भुगतान',
    },
    attachments: {
      en: 'Attachments',
      hi: 'संलग्नक',
    },
    sellerKyc: {
      en: 'Seller KYC',
      hi: 'विक्रेता KYC',
    },
    conversionDetails: {
      en: 'Conversion Details',
      hi: 'कन्वर्ज़न विवरण',
    },
    reraAllotment: {
      en: 'RERA & Allotment',
      hi: 'रेरा एवं आवंटन',
    },
  };

  const getLabel = (key) => {
    const langKey = FontValue === LANGUAGE.EN ? 'en' : 'hi';
    return LABELS[key]?.[langKey] || LABELS[key]?.en || key;
  };

  // ---------- SUBMIT ----------
  const handleSubmit = async (e, triggeredSection = null) => {
   
  };

  return (
    <Row>
      <Col sm={12}>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <Card.Title>{getLabel('landDetailsTitle')}</Card.Title>
            <Col md={2}>
              <Form.Select value={FontValue} onChange={handleLanguageChange}>
                <option value={LANGUAGE.EN}>English</option>
                <option value={LANGUAGE.HI}>Mangal</option>
                <option value={LANGUAGE.KRUTI}>Hindi</option>
              </Form.Select>
            </Col>
          </Card.Header>

          <Card.Body>
            <Form id="landForm" ref={formRef} noValidate onSubmit={handleSubmit}>
              {errors.api && <div className="text-danger mb-2">{errors.api}</div>}

              <div className="d-flex justify-content-between align-items-center mb-3">
                {/* <h5 className="mb-0 text-primary">{getLabel('sellerBuyerSection')}</h5> */}
                {renderSectionActions('sellerBuyer')}
              </div>
              <fieldset disabled={isSectionDisabled('sellerBuyer')}>
                <SellerBuyerSection
                  formData={formData}
                  setFormData={setFormData}
                  FontValue={FontValue}
                  placeholders={placeholders}
                  errors={errors}
                  isExistingMode={isExistingMode}
                  onAddDeletedBuyerId={(id) =>
                    setDeletedBuyerIds((prev) =>
                      prev.includes(id) ? prev : [...prev, id]
                    )
                  }
                  HindiInput={HindiInput}
                  getRelationLabel={getRelationLabel}
                  getRelationPlaceholder={getRelationPlaceholder}
                />
              </fieldset>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 text-primary">{getLabel('landIdentification')}</h5>
                {renderSectionActions('land')}
              </div>
              <fieldset disabled={isSectionDisabled('land')}>
                <LandIdentificationSection
                  formData={formData}
                  setFormData={setFormData}
                  FontValue={FontValue}
                  placeholders={placeholders}
                  LANGUAGE={LANGUAGE}
                  suggestions={suggestions}
                  handleSearchableChange={handleSearchableChange}
                  handleSelectSuggestion={handleSelectSuggestion}
                  dropdownStyle={dropdownStyle}
                  dropdownItemStyle={dropdownItemStyle}
                  HindiInput={HindiInput}
                />
              </fieldset>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 text-primary">{getLabel('ownershipPayment')}</h5>
                {renderSectionActions('ownership')}
              </div>
              <fieldset disabled={isSectionDisabled('ownership')}>
                <OwnershipPaymentSection
                  formData={formData}
                  setFormData={setFormData}
                  FontValue={FontValue}
                  placeholders={placeholders}
                  LANGUAGE={LANGUAGE}
                  suggestions={suggestions}
                  handleSearchableChange={handleSearchableChange}
                  handleSelectSuggestion={handleSelectSuggestion}
                  dropdownStyle={dropdownStyle}
                  dropdownItemStyle={dropdownItemStyle}
                  HindiInput={HindiInput}
                  isExistingMode={isExistingMode}
                  extraPayments={extraPayments}
                  setExtraPayments={setExtraPayments}
                  onAddDeletedPaymentId={(id) =>
                    setDeletedPaymentIds((prev) =>
                      prev.includes(id) ? prev : [...prev, id]
                    )
                  }
                  addPaymentRow={addPaymentRow}
                  handleExtraPaymentChange={handleExtraPaymentChange}
                  removeExtraPayment={removeExtraPayment}
                  paymentType={paymentType}
                  paymentTypeValue={paymentTypeValue}
                  setPaymentTypeValue={setPaymentTypeValue}
                />
              </fieldset>

              <hr />
              

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 text-primary">{getLabel('attachments')}</h5>
                {renderSectionActions('attachments')}
              </div>
              <fieldset disabled={isSectionDisabled('attachments')}>
               <MainAttachmentsSection
  formData={formData}
  setFormData={setFormData}
     LANGUAGE={LANGUAGE}
                  placeholders={placeholders}
                  HindiInput={HindiInput}
/>

              </fieldset>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 text-primary">{getLabel('sellerKyc')}</h5>
                {renderSectionActions('kyc')}
              </div>
              <fieldset disabled={isSectionDisabled('kyc')}>
                <SellerKycSection
                  formData={formData}
                  setFormData={setFormData}
                  handleChange={handleChange}
                  SellerKycDocuments={SellerKycDocuments}
                  FontValue={FontValue}
                  LANGUAGE={LANGUAGE}
                  placeholders={placeholders}
                  HindiInput={HindiInput}
                />
              </fieldset>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 text-primary text-uppercase">
                  {getLabel('conversionDetails')}
                </h5>
                {renderSectionActions('conversion')}
              </div>
              <fieldset disabled={isSectionDisabled('conversion')}>
                <ConversionSection
                  formData={formData}
                  setFormData={setFormData}
                  ConversionInfo={ConversionInfo}
                  AttachmentsSection={AttachmentsSection}
                  HindiInput={HindiInput}
                  FontValue={FontValue}
                  LANGUAGE={LANGUAGE}
                  placeholders={placeholders}
                  suggestions={suggestions}
                  handleSearchableChange={handleSearchableChange}
                  handleSelectSuggestion={handleSelectSuggestion}
                  dropdownStyle={dropdownStyle}
                  dropdownItemStyle={dropdownItemStyle}
                />
              </fieldset>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 text-primary text-uppercase">
                  {getLabel('reraAllotment')}
                </h5>
                {renderSectionActions('rera')}
              </div>
              <fieldset disabled={isSectionDisabled('rera')}>
                <ReraAllotmentSection
                  formData={formData}
                  setFormData={setFormData}
                  FontValue={FontValue}
                  LANGUAGE={LANGUAGE}
                  placeholders={placeholders}
                  ReraRegistrationSection={ReraRegistrationSection}
                  AllotmentPattaSection={AllotmentPattaSection}
                />
              </fieldset>

              <Row className="mt-3">
                <Col md={2}>
                  <Button type="submit" className="form-control-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : isExistingMode ? 'Update' : 'Submit'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
