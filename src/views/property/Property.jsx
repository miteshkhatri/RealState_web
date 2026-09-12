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
import api from 'utils/api';
import LogoutModel from 'layouts/AdminLayout/NavBar/NavRight/LogoutModel';
import { tree } from 'd3';

const LANGUAGE = {
  EN: 0,
  KRUTI: 1,
  HI: 2
};

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

  (formData.conversionChallanDocs || []).forEach((i) => {
    if (i?.file?.existing && i?.file?.name) {
      res.conversion_challan_existing.push({
        id: i.id || null,
        file: i.file.name,
        date: i.date || ""
      });
    }
  });

  (formData.conversionOrderDocs || []).forEach((i) => {
    if (i?.file?.existing && i?.file?.name) {
      res.conversion_order_existing.push({
        id: i.id || null,
        file: i.file.name,
        date: i.date || ""
      });
    }
  });

  (formData.conversionMapDocs || []).forEach((i) => {
    if (i?.file?.existing && i?.file?.name) {
      res.conversion_map_existing.push({
        id: i.id || null,
        file: i.file.name,
        date: i.date || ""
      });
    }
  });

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

// HindiInput
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

  const userData = JSON.parse(localStorage.getItem('users')) || {};
  const [FontValue, setFontValue] = useState(LANGUAGE.HI);
  const [Class, setClass] = useState(LANGUAGE.HI);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState([]);
  const [paymentTypeValue, setPaymentTypeValue] = useState('');
  const [fetchedRow, setFetchedRow] = useState(null);
  const [isFetchingRow, setIsFetchingRow] = useState(false);

  const formRef = useRef(null);
  const [submittingSection, setSubmittingSection] = useState(null);
  const [deletedSellerIds, setDeletedSellerIds] = useState([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState([]);
  const [deletedKycDocIds, setDeletedKycDocIds] = useState([]);
  const [deletedConversionAttachmentIds, setDeletedConversionAttachmentIds] = useState([]);
  const [deletedReraAttachmentIds, setDeletedReraAttachmentIds] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const alertTimer = useRef(null);
  const isAutoLandArea = useRef(true);
  const [landForms, setLandForms] = useState([]);

  console.log(deletedReraAttachmentIds, 'setDeletedKycDocIdssetDeletedKycDocIds');

  // ---------- initial state ----------
  const initialState = {
    seller_area: '',
    projectId: null,
    buyer_area: '',
    reraList: [
      {
        rera_number: '',
        document_date: '',
      }
    ],
    sellers: [
      {
        id: null,
        seller_name: '',
        poa_holder_name: '',
        seller_remarks: '',
        type: 'seller',
        relation: 'S/O',
        fatherName: '',
        age: '',
        aadhaar: '',
        area_type: '',
        mutation_status: '',
        jamabandi_status: '',
        girdawari_status: '',
        director_name: '',
        director_pan: '',
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
    kycDocs: [],
    conversionChallanCopy: [],
    conversionOrderAttachment: [],
    conversionMapAttachment: [],
    convertedArea: '',
    mapAttachment: [],
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
    conversionOrderDate: '',
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
    murbaKila: '',
    considerationAmount: '',
    allotmentAttachment: [],
    relatedPaymentDocs: [],
    plotPattaAttachment: [],
    poaDocDate: '',
    upniveshanKhasraDocs: [{ file: null, date: '' }],
    rajaswaKhasraDocs: [{ file: null, date: '' }],
    chainDocs: [{ file: null, date: "" }],
    mapMasterPlan: [{ file: null, date: "" }],
    mutationDocs: [{ file: null, date: "" }],
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
    murbbaType: 'Murba',
    murbbaNo: '',
    kilaNo: '',
    mutationStatus: '',
    jamabandiStatus: '',
    girdawariStatus: '',
    payableAmount: '',
  };

  const mapApiToForm = (apiRow) => {
    console.log(apiRow, 'jnhouhrirgyigi data..?')
    if (!apiRow) return initialState;

    const conversionAttachments =
      Array.isArray(apiRow.conversion_attachments)
        ? apiRow.conversion_attachments
        : [];

    const conversionChallanDocs = conversionAttachments
      .filter(a => a.attachment_type === "CHALLAN_COPY")
      .map(a => ({
        id: a.id,
        file: { existing: true, name: a.file_path },
        date: toDateInput(a.uploaded_at)
      }));

    const conversionOrderDocs = conversionAttachments
      .filter(a => a.attachment_type === "CONVERSION_ORDER")
      .map(a => ({
        id: a.id,
        file: { existing: true, name: a.file_path },
        date: toDateInput(a.uploaded_at)
      }));

    const conversionMapDocs = conversionAttachments
      .filter(a => a.attachment_type === "MAP_ATTACHMENT")
      .map(a => ({
        id: a.id,
        file: { existing: true, name: a.file_path },
        date: toDateInput(a.uploaded_at)
      }));

    const divisionDetailsObj =
      apiRow?.conversion?.division_details || {};

    const divisionOfArea =
      apiRow?.conversion?.division_of_area
        ? apiRow.conversion.division_of_area.split(",").map(s => s.trim())
        : [];

    let kycDocs = [];
    let upniveshanKhasraDocs = [];
    let rajaswaKhasraDocs = [];

    const landKycArr = Array.isArray(apiRow?.land_kyc)
      ? apiRow.land_kyc
      : [];

    landKycArr.forEach(kyc => {
      kyc.aadhaar_files?.forEach(f => {
        kycDocs.push({
          id: f.id,
          key: "sellerAadhar",
          file: { existing: true, name: f.file },
          date: toDateInput(f.date),
        });
      });

      kyc.pan_files?.forEach(f => {
        kycDocs.push({
          id: f.id,
          key: "sellerPAN",
          file: { existing: true, name: f.file },
          date: toDateInput(f.date),
        });
      });

      kyc.poa_pan_files?.forEach(f => {
        kycDocs.push({
          id: f.id,
          key: "poaPAN",
          file: { existing: true, name: f.file },
          date: toDateInput(f.date),
        });
      });

      kyc.upniveshan_khasra_files?.forEach(f => {
        upniveshanKhasraDocs.push({
          id: f.id,
          file: { existing: true, name: f.file },
          date: toDateInput(f.date),
        });
      });

      kyc.khasra_files?.forEach(f => {
        rajaswaKhasraDocs.push({
          id: f.id,
          file: { existing: true, name: f.file },
          date: toDateInput(f.date),
        });
      });
    });

    /* ================= RERA ================= */
    let reraList = [{ rera_number: "", document_date: "" }];
    let tirReportDocs = [{ file: null, date: "" }];
    let valuationReportDocs = [{ file: null, date: "" }];

    const rera = apiRow?.rera;

    if (rera) {
      if (rera && Array.isArray(rera.list) && rera.list.length > 0) {
        reraList = rera.list.map((r) => ({
          id: r.id,
          rera_number: r.rera_number || "",
          document_date: r.document_date || "",
        }));
      }
      if (
        Array.isArray(rera.attachments?.TIR_REPORT) &&
        rera.attachments.TIR_REPORT.length > 0
      ) {
        tirReportDocs = rera.attachments.TIR_REPORT.map((f) => ({
          id: f.id,
          file: { existing: true, name: f.file },
          date: toDateInput(f.date),
        }));
      }
      if (
        Array.isArray(rera.attachments?.VALUATION_REPORT) &&
        rera.attachments.VALUATION_REPORT.length > 0
      ) {
        valuationReportDocs = rera.attachments.VALUATION_REPORT.map((f) => ({
          id: f.id,
          file: { existing: true, name: f.file },
          date: toDateInput(f.date),
        }));
      }
    }

    /* ================= BUYERS ================= */
    const buyers = Array.isArray(apiRow.buyers)
      ? apiRow.buyers.map((b) => ({
          id: b.id || null,
          type: b.party_type === "company" ? "company" : "individual",
          name: b.name || '',
          relation: b.relation_prefix || 'S/O',
          fatherName: b.prefix_name || '',
          age: b.age || '',
          aadhaar: b.aadhar_number || '',
          pan: b.pan_number || '',
          address: b.address || '',
          mobile: b.mobile_number || '',
          reference: b.reference || '',
          area: b.area || "",
          area_type: b.area_type || '',
          mutation_status: b.mutation_status || '',
          jamabandi_status: b.jamabandi_status || '',
          girdawari_status: b.girdawari_status || '',
        }))
      : initialState.buyers;

    /* ================= SELLERS ================= */
    const sellers = Array.isArray(apiRow.sellers)
      ? apiRow.sellers.map((s) => ({
          id: s.id || null,
          seller_name: s.name || "",
          poa_holder_name: s.poa_holder_name || "",
          seller_remarks: s.remarks || "",
          type: s.party_type === "company" ? "holder" : "seller",
          relation:
            s.party_type === "company" ? "DIRECTOR" : s.relation_type || "S/O",
          fatherName: s.relation_name || "",
          age: s.age || "",
          aadhaar: s.aadhaar || "",
          pan: s.pan_no || "",
          area: s.area || "",
          address: s.address || "",
          mobile: s.mobile || "",
          font_name: Number(s.font_name ?? FontValue),
          mutation_status: s.mutation_status || '',
          jamabandi_status: s.jamabandi_status || '',
          girdawari_status: s.girdawari_status || '',
        }))
      : initialState.sellers;

    /* ================= PAYMENTS ================= */
    const paymentsArr = Array.isArray(apiRow.all_payments)
      ? apiRow.all_payments
      : [];
    const primaryPayment = paymentsArr[0] || {};

    const extraPayments = paymentsArr.slice(1).map((p) => ({
      id: p.id || null,
      physicalPossession: p.physical_possession_status || "",
      paymentA: p.payment_a || "",
      considerationAmount: p.consideration_amount || "",
      paymentAdmin: p.payment_admin_entry || "",
      compensationPayment: p.compensation_payment || "",
      category: p.land_category || "",
      paymentDate: toDateInput(p.payment_date),
      paymentMode: p.payment_mode || "",
      bankName: p.bank_name || "",
      branchName: p.branch_name || "",
      chequeNo: p.cheque_no || "",
    }));

    const convDetails =
      apiRow?.conversion?.conversion_details || [];

    const activeConv =
      convDetails.length > 0
        ? convDetails[convDetails.length - 1]
        : {};

    /* ================= FINAL RETURN ================= */
    return {
      sellers,
      buyers,
      conversion_details:
        Array.isArray(apiRow?.conversion?.conversion_details)
          ? apiRow.conversion.conversion_details.map(c => ({
              id: c.id,
              application_date: toDateInput(c.application_date),
              order_date: toDateInput(c.order_date),
              provision_section: c.provision_section || "",
              authority: c.authority || "BDA"
            }))
          : [],
      kycDocs,
      upniveshanKhasraDocs:
        upniveshanKhasraDocs.length
          ? upniveshanKhasraDocs
          : [{ file: null, date: "" }],
      rajaswaKhasraDocs:
        rajaswaKhasraDocs.length
          ? rajaswaKhasraDocs
          : [{ file: null, date: "" }],
      reraList,
      tirReportDocs,
      valuationReportDocs,
      allotmentDirectCustomer:
        rera?.direct_customer_name === 1
          ? "Yes"
          : rera?.direct_customer_name === 0
          ? "No"
          : "",
      pattaAppliedDate: toDateInput(rera?.patta_applied_date),
      pattaReceivedDate: toDateInput(rera?.patta_received_date),
      projectId: apiRow.project_id || null,
      projectName: apiRow.project_name || "",
      landArea: apiRow?.land?.land_area || "",
      remarks: apiRow?.land?.remarks || "",
      upniveshanType:
        apiRow?.land?.upni_type === "CHAK"
          ? "Chak"
          : apiRow?.land?.upni_type === "UPNI"
          ? "Khasra"
          : "Khasra",
      upniveshanKhasra: apiRow?.land?.upni_no_or_chak_no || "",
      rajaswaKhasra: apiRow?.land?.rajaswa_no || "",
      extraPayments,
      bankName: primaryPayment.bank_name || apiRow.bank_name || '',
      branchName: primaryPayment.branch_name || apiRow.branch_name || '',
      chequeNo: primaryPayment.cheque_no || apiRow.cheque_no || '',
      considerationAmount: primaryPayment.consideration_amount || "",
      propertiesPaymentId: primaryPayment.id || null,
      physicalPossession: primaryPayment.physical_possession_status || "",
      compensationPayment: primaryPayment.compensation_payment || "",
      is_married: Number(apiRow?.land?.is_married ?? 0),
      is_married_land_id: apiRow?.land?.is_married_land_id ?? null,
      category: primaryPayment.land_category || apiRow.land_category || '',
      mutationStatus: apiRow?.land?.mutation_status || '',
      jamabandiStatus: apiRow?.land?.jamabandi_status || '',
      girdawariStatus: apiRow?.land?.girdawari_status || '',
      payableAmount: apiRow?.land?.payable_amount || '',
      murbbaNo: apiRow?.land?.murbba_no || '',
      kilaNo: apiRow?.land?.kila_no || '',
      id: apiRow?.land?.id || null,
      conversion_application_date: toDateInput(activeConv.application_date),
      provision_section: activeConv.provision_section || "",
      conversion_authority: activeConv.authority || "BDA",
      division_of_area: apiRow?.conversion?.division_of_area || "",
      divisionDetails: apiRow?.conversion?.division_details || {},
      conversionAttachments: apiRow?.conversion_attachments || [],
      physicalPossession: primaryPayment.physical_possession_status || "",
      paymentA: primaryPayment.payment_a || "",
      paymentDate: toDateInput(primaryPayment.payment_date),
      conversionChallanDocs:
        conversionChallanDocs.length
          ? conversionChallanDocs
          : [{ file: null, date: "" }],
      conversionOrderDocs:
        conversionOrderDocs.length
          ? conversionOrderDocs
          : [{ file: null, date: "" }],
      conversionMapDocs:
        conversionMapDocs.length
          ? conversionMapDocs
          : [{ file: null, date: "" }],
      convertedArea: apiRow?.conversion?.converted_area || "",
      division_of_area: divisionOfArea,
      divisionDetails: divisionDetailsObj,
      projectName: apiRow.project_name || "",
    };
  };

  const [formData, setFormData] = useState(initialState);
  const [extraPayments, setExtraPayments] = useState([]);
  const [deletedBuyerIds, setDeletedBuyerIds] = useState([]);
  const [deletedPaymentIds, setDeletedPaymentIds] = useState([]);
  const [deletedLandAttachmentIds, setDeletedLandAttachmentIds] = useState([]);
  const [amountError, setAmountError] = useState("");

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

  const showTemporaryAlert = (msg) => {
    setAlertMsg(msg);
    setShowAlert(true);

    if (alertTimer.current) clearTimeout(alertTimer.current);

    alertTimer.current = setTimeout(() => {
      setShowAlert(false);
      alertTimer.current = null;
    }, 3000);
  };

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
        const res = await api.get(`/properties/list`, {
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

  useEffect(() => {
    const source = fetchedRow || data;
    const allLands = [];

    if (!isExistingMode) {
      allLands.push({
        note: "parent_land",
        land: {
          is_married: 0,
          is_married_land_id: null,
        },
      });
    }

    if (isExistingMode && source?.land) {
      allLands.push({
        note: "parent_land",
        land: source.land,
      });

      if (Array.isArray(source.merged_lands)) {
        source.merged_lands.forEach((l) => {
          if (l.note === "merged_land") {
            allLands.push({
              note: "merged_land",
              land: l,
            });
          }
        });
      }
    }

    const mappedLandForms = allLands.map((item) => {
      const fakeApiRow = {
        ...(source || {}),
        land: item.land,
        is_married: Number(item.land?.is_married ?? 0),
        is_married_land_id: item.land?.is_married_land_id ?? null,
      };

      return {
        note: item.note,
        formData: mapApiToForm(fakeApiRow),
      };
    });

    setLandForms(mappedLandForms);

    if (!isExistingMode || !source) return;

    if (typeof source.font_name !== "undefined" && source.font_name !== null) {
      const fv = Number(source.font_name);
      setFontValue(fv);
      setClass(fv);
    }

    const mapped = mapApiToForm(source);
    if (Array.isArray(mapped.extraPayments)) {
      setExtraPayments(mapped.extraPayments);
    }

    const sellers = Array.isArray(source?.sellers) ? source.sellers : [];
    const firstSeller = sellers[0];

    let kycDocsDate = "";
    let upniveshanDocDate = "";
    let rajaswaDocDate = "";

    if (firstSeller?.seller_kyc) {
      const kyc = firstSeller.seller_kyc;

      const commonDoc =
        kyc.pan_files?.[0] ||
        kyc.aadhaar_files?.[0] ||
        kyc.poa_pan_files?.[0];

      if (commonDoc?.date) kycDocsDate = toDateInput(commonDoc.date);
      if (kyc.upniveshan_khasra_files?.[0]?.date)
        upniveshanDocDate = toDateInput(
          kyc.upniveshan_khasra_files[0].date
        );
      if (kyc.khasra_files?.[0]?.date)
        rajaswaDocDate = toDateInput(kyc.khasra_files[0].date);
    }

    const landAttachments = Array.isArray(source.land_attachments)
      ? source.land_attachments
      : [];

    const mapLand = (type) =>
      landAttachments
        .filter((a) => a.type === type)
        .map((a) => ({
          id: a.id,
          file: null,
          name: a.file_path,
          existing: true,
          date: toDateInput(a.dates),
        }));

    const landChain = landAttachments.find(
      (a) => a.type === "Land_Chain_Documents"
    );
    const mapMaster = landAttachments.find(
      (a) => a.type === "Map_Master_Plan"
    );
    const poaDoc = landAttachments.find(
      (a) => a.type === "POA_Document"
    );

    setFormData((prev) => ({
      ...prev,
      ...mapped,
      kycDocsDate,
      upniveshanDocDate,
      rajaswaDocDate,
      chainDocs:
        mapLand("Land_Chain_Documents").length > 0
          ? mapLand("Land_Chain_Documents")
          : [{ file: null, date: "" }],
      mapMasterPlan:
        mapLand("Map_Master_Plan").length > 0
          ? mapLand("Map_Master_Plan")
          : [{ file: null, date: "" }],
      mutationDocs:
        mapLand("POA_Document").length > 0
          ? mapLand("POA_Document")
          : [{ file: null, date: "" }],
      landDate: toDateInput(landChain?.dates),
      mapDate: toDateInput(mapMaster?.dates),
      documentDate: toDateInput(poaDoc?.dates),
      poaDocDate: toDateInput(
        firstSeller?.seller_kyc?.poa_pan_files?.[0]?.date
      ),
    }));

    setDeletedBuyerIds([]);
    setDeletedPaymentIds([]);
    setDeletedLandAttachmentIds([]);
  }, [isExistingMode, data, fetchedRow]);

  useEffect(() => {
    if (!isExistingMode && landForms.length > 0) {
      setFormData(prev => ({
        ...prev,
        landArea: landForms[0].formData.landArea,
        landUnit: landForms[0].formData.landUnit,
        upniveshanType: landForms[0].formData.upniveshanType,
        upniveshanKhasra: landForms[0].formData.upniveshanKhasra,
        rajaswaKhasra: landForms[0].formData.rajaswaKhasra,
        murbbaNo: landForms[0].formData.murbbaNo,
        kilaNo: landForms[0].formData.kilaNo,
        mutationStatus: landForms[0].formData.mutationStatus,
        jamabandiStatus: landForms[0].formData.jamabandiStatus,
        girdawariStatus: landForms[0].formData.girdawariStatus,
        payableAmount: landForms[0].formData.payableAmount,
        remarks: landForms[0].formData.remarks
      }));
    }
  }, [landForms, isExistingMode]);

  useEffect(() => {
    if (!isExistingMode) return;
    if (!Array.isArray(formData.buyers)) return;

    const totalBuyerArea = formData.buyers.reduce((sum, b) => {
      const area = parseFloat(b.area);
      return sum + (isNaN(area) ? 0 : area);
    }, 0);

    if (totalBuyerArea > 0) {
      setLandForms((prev) => {
        const copy = [...prev];
        if (copy[0]) {
          copy[0] = {
            ...copy[0],
            formData: {
              ...copy[0].formData,
              landArea: totalBuyerArea.toFixed(2)
            }
          };
        }
        return copy;
      });
    }
  }, [
    isExistingMode,
    formData.buyers.map(b => b.area).join("|")
  ]);

  useEffect(() => {
    const initPaymentModes = async () => {
      try {
        const paymentResponse = await api.get(`/payment/mode`, {
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

  const totalAdminAmount = (() => {
    let total = 0;
    total += Number(formData.paymentAdmin || 0);
    (extraPayments || []).forEach(p => {
      total += Number(p.paymentAdmin || 0);
    });
    return total;
  })();

  const totalCompensationAmount = (() => {
    let total = 0;
    total += Number(formData.compensationPayment || 0);
    (extraPayments || []).forEach(p => {
      total += Number(p.compensationPayment || 0);
    });
    return total;
  })();

  const renderSectionActions = (sectionKey) => {
    if (!isViewMode) return null;
    if (sectionEdit[sectionKey]) {
      return (
        <div>
          <Button
            size="sm"
            variant="danger"
            type="button"
            className="btn-remove-customer"  // 🔥 CLASS ADDED
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
            className="ms-2 btn-add-customer"  // 🔥 CLASS ADDED
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
        className="btn-back"  // 🔥 CLASS ADDED
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
      const res = await api.get(`/properties/searchProperties`, {
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

  const getTotalPayableLabel = () => {
    return FontValue === LANGUAGE.EN
      ? "Total Payable Amount"
      : "कुल देय राशि";
  };

  const totalPayableAmount = isExistingMode
    ? landForms.reduce((sum, lf) => {
        const amt = Number(lf?.formData?.payableAmount || 0);
        return sum + (isNaN(amt) ? 0 : amt);
      }, 0)
    : Number(formData.payableAmount || 0);

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

  const buildExistingLandPayload = (formData = {}) => {
    const res = {
      land_chain_docs_existing: [],
      map_master_plan_existing: [],
      poa_doc_existing: [],
    };

    (formData.chainDocs || []).forEach((i) => {
      if (i?.existing && i?.name) {
        res.land_chain_docs_existing.push({
          id: i.id || null,
          file: i.name,
          date: i.date || "",
        });
      }
    });

    (formData.mapMasterPlan || []).forEach((i) => {
      if (i?.existing && i?.name) {
        res.map_master_plan_existing.push({
          id: i.id || null,
          file: i.name,
          date: i.date || "",
        });
      }
    });

    (formData.mutationDocs || []).forEach((i) => {
      if (i?.existing && i?.name) {
        res.poa_doc_existing.push({
          id: i.id || null,
          file: i.name,
          date: i.date || "",
        });
      }
    });

    return res;
  };

  const PAYMENT_LABELS = {
    title: {
      en: "Payment Summary",
      hi: "भुगतान सारांश",
    },
    totalPayable: {
      en: "Total Payable Amount",
      hi: "कुल देय राशि",
    },
    revised: {
      en: "Revised Payment",
      hi: "संपादित भुगतान",
    },
    overPaid: {
      en: "Over Paid Amount",
      hi: "भुगतान की प्रतिफल राशि",
    },
  };

  const tPay = (key) =>
    FontValue === LANGUAGE.EN
      ? PAYMENT_LABELS[key]?.en
      : PAYMENT_LABELS[key]?.hi;

  const renderFileInput = (label, name, files, note) => (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      {note && <div style={{ fontSize: '0.8rem', color: 'red' }}>{note}</div>}
      <Form.Control
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        multiple
        onChange={(e) => {
          const selectedFiles = Array.from(e.target.files);
          selectedFiles.forEach((f) => handleFileChange(name, f));
        }}
        className="form-control-sm hindi-input-custom"
      />
      <div className="mt-2 d-flex flex-column gap-1">
        {files?.map((item, idx) => {
          const previewUrl = getPreviewUrl(item);
          const fileName = getFileName(item);
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid',
                padding: '5px',
                borderRadius: '4px',
                gap: '8px',
              }}
            >
              {previewUrl && (
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={previewUrl}
                    alt={fileName || 'preview'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <span style={{ flex: 1, fontSize: '0.8rem', wordBreak: 'break-all' }}>
                {fileName}
              </span>
              <Button variant="danger" size="sm" className="btn-remove-customer" onClick={() => removeFile(name, idx)}>  {/* 🔥 CLASS ADDED */}
                Remove
              </Button>
            </div>
          );
        })}
      </div>
      {errors[name] && <Form.Text className="text-danger">{errors[name]}</Form.Text>}
    </Form.Group>
  );

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
  const [showProjectConfirm, setShowProjectConfirm] = useState(false);
  const [pendingSubmitArgs, setPendingSubmitArgs] = useState(null);

  const placeholders = {
    sellerName: FontValue === LANGUAGE.EN ? 'Enter Seller Name' : 'विक्रेता का नाम दर्ज करें',
    poaHolder:
      FontValue === LANGUAGE.EN
        ? 'Enter POA Holder Name'
        : 'पीओए धारक का नाम दर्ज करें',
    buyer: FontValue === LANGUAGE.EN ? 'Enter Buyer Name' : 'खरीदार का नाम दर्ज करें',
    age: FontValue === LANGUAGE.EN ? 'Enter Age' : 'आयु दर्ज करें',
    aadhaar:
      FontValue === LANGUAGE.EN
        ? 'Enter Aadhaar Number'
        : 'आधार संख्या दर्ज करें',
    pan: FontValue === LANGUAGE.EN ? 'Enter PAN Number' : 'पैन नंबर दर्ज करें',
    landArea: FontValue === LANGUAGE.EN ? 'Enter Land Area' : 'भूमि क्षेत्र दर्ज करें',
    upniveshanKhasra:
      FontValue === LANGUAGE.EN
         ? 'Enter Rajaswa Khasra No.'
       : 'राजस्व खसरा संख्या दर्ज करें',
    rajaswaKhasra:
      FontValue === LANGUAGE.EN
       ? 'Enter Upniveshan Khasra / Chak No.'
        : 'उपनिवेशन खसरा / चक संख्या दर्ज करें',
    murbaKila:
      FontValue === LANGUAGE.EN
        ? 'Enter Murba / Kila No.'
        : 'मुरबा / किला संख्या दर्ज करें',
    physicalPossession:
      FontValue === LANGUAGE.EN
        ? 'Enter Physical Possession Status'
        : 'भौतिक कब्जे की स्थिति दर्ज करें',
    paymentA:
      FontValue === LANGUAGE.EN
        ? 'Enter Payment A (Date-wise)'
        : 'भुगतान ए दर्ज करें (तिथि अनुसार)',
    paymentAdmin:
      FontValue === LANGUAGE.EN
        ? 'Enter Payment – Admin Entry'
        : 'भुगतान – प्रशासन प्रविष्टि दर्ज करें',
    compensationPayment:
      FontValue === LANGUAGE.EN
        ? 'Enter Compensation Payment'
        : 'मुआवजा भुगतान दर्ज करें',
    remarks:
      FontValue === LANGUAGE.EN
        ? 'Enter Remarks / Dispute'
        : 'टिप्पणियाँ / विवाद दर्ज करें',
    category: FontValue === LANGUAGE.EN ? 'Enter Category' : 'श्रेणी दर्ज करें',
    mutationStatus:
      FontValue === LANGUAGE.EN
        ? 'Enter Mutation'
        : 'म्यूटेशन ',
  };

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

  const validateSellerBuyer = (formData, FontValue) => {
    const errors = { sellers: [], buyers: [] };
    const t = (en, hi) => (FontValue === 0 ? en : hi);

    (formData.sellers || []).forEach((s, i) => {
      const e = {};

      if (!s.seller_name?.trim()) {
        e.seller_name = s.type == 'holder'
          ? t('Company name is required', 'कंपनी का नाम आवश्यक है')
          : t('Seller name is required', 'विक्रेता का नाम आवश्यक है');
      }

      if (!s.mobile || s.mobile.length !== 10) {
        e.mobile = t(
          'Mobile number is required',
          'मोबाइल नंबर आवश्यक है'
        );
      }

      if (!s.aadhaar || s.aadhaar.replace(/\s/g, '').length !== 12) {
        e.aadhaar = t(
          'Aadhaar number is required',
          'आधार नंबर आवश्यक है'
        );
      }

      if (!s.pan || s.pan.length !== 10) {
        e.pan = t(
          'PAN number is required',
          'पैन नंबर आवश्यक है'
        );
      }

      errors.sellers[i] = e;
    });

    (formData.buyers || []).forEach((b, i) => {
      const e = {};

      if (!b.name?.trim()) {
        e.name =
          b.type === 'company'
            ? t('Company name is required', 'कंपनी का नाम आवश्यक है')
            : t('Buyer name is required', 'खरीदार का नाम आवश्यक है');
      }

      if (!b.mobile || b.mobile.length !== 10) {
        e.mobile = t(
          'Mobile number is required',
          'मोबाइल नंबर आवश्यक है'
        );
      }

      if (!b.aadhaar || b.aadhaar.replace(/\s/g, '').length !== 12) {
        e.aadhaar = t(
          'Aadhaar number is required',
          'आधार नंबर आवश्यक है'
        );
      }

      if (!b.pan || b.pan.length !== 10) {
        e.pan = t(
          'PAN number is required',
          'पैन नंबर आवश्यक है'
        );
      }

      errors.buyers[i] = e;
    });

    return errors;
  };

  const validateProjectName = (formData, FontValue) => {
    const t = (en, hi) => (FontValue === LANGUAGE.EN ? en : hi);
    const e = {};
    return e;
  };

  const validateAllotmentType = (formData, FontValue) => {
    const t = (en, hi) => (FontValue === LANGUAGE.EN ? en : hi);
    const e = {};
    return e;
  };

  const revisedAmount = (() => {
    let total = 0;
    total += Number(formData.considerationAmount || 0);
    total += Number(formData.paymentA || 0);
    (extraPayments || []).forEach(p => {
      total += Number(p.considerationAmount || 0);
      total += Number(p.paymentA || 0);
    });
    return total;
  })();

  const remainingAmount = Math.max(
    totalPayableAmount - revisedAmount,
    0
  );

  const overPaidAmount = Math.max(
    revisedAmount - totalPayableAmount,
    0
  );

  // ---------- SUBMIT ----------
  const handleSubmit = async (e, triggeredSection = null) => {
    if (e && e.preventDefault) e.preventDefault();

    if (
      !showProjectConfirm &&
      formData.allotmentDirectCustomer &&
      formData.projectName
    ) {
      setPendingSubmitArgs({ e, triggeredSection });
      setShowProjectConfirm(true);
      return;
    }

    const payable = Number(formData.payableAmount || 0);

    const landAreaTypeMap = {
      Bigha: 'BIGHA',
      'Sq. Feet': 'SQFT',
      'Sq. Mtr': 'SQMTR',
      'Sq. Yard': 'SQYARD',
      Hectare: 'HECTARE',
    };

    const conversionDetailsPayload = Array.isArray(formData.conversion_details)
      ? formData.conversion_details.map(c => ({
          id: c.id || null,
          application_date: c.application_date || "",
          order_date: c.order_date || "",
          provision_section: c.provision_section || "",
          authority: c.authority || ""
        }))
      : [];

    const sellerBuyerErrors = validateSellerBuyer(formData, FontValue);
    const projectErrors = validateProjectName(formData, FontValue);
    const allotmentErrors = validateAllotmentType(formData, FontValue);

    const hasSellerBuyerError =
      sellerBuyerErrors.sellers.some(e => Object.keys(e).length) ||
      sellerBuyerErrors.buyers.some(e => Object.keys(e).length);

    const hasProjectError = Object.keys(projectErrors).length > 0;
    const hasAllotmentError = Object.keys(allotmentErrors).length > 0;

    if (hasSellerBuyerError || hasProjectError || hasAllotmentError) {
      setErrors({
        ...sellerBuyerErrors,
        ...projectErrors,
        ...allotmentErrors
      });

      showTemporaryAlert(
        FontValue === LANGUAGE.EN
          ? 'Please fix the highlighted errors'
          : 'कृपया चिन्हित त्रुटियाँ ठीक करें'
      );
      return;
    }

    if (triggeredSection) setSubmittingSection(triggeredSection);
    const sectionToLock = triggeredSection || submittingSection || null;
    setErrors({});
    setIsSubmitting(true);

    try {
      const fd = new FormData();

      const validReraList = Array.isArray(formData.reraList)
        ? formData.reraList.filter(
            (r) => r?.rera_number?.trim() && r?.document_date
          )
        : [];

      const existingKycPayload = buildExistingKycPayload(formData.kycDocs || []);
      const existingConversionPayload = buildExistingConversionPayload(formData);
      const existingReraPayload = buildExistingReraPayload(formData);

      const sellersToSend = (formData.sellers || []).map((s) => ({
        ...s,
        font_name:
          typeof FontValue !== 'undefined' && FontValue !== null
            ? Number(FontValue)
            : s.font_name
            ? Number(s.font_name)
            : 0,
      }));
      fd.append('sellers', JSON.stringify(sellersToSend));
      fd.append('seller_area', formData.seller_area || '');
      fd.append('buyer_area', formData.buyer_area || '');
      fd.append('project_name', formData.projectName || '');
      fd.append('project_font', FontValue);
      fd.append('project_id', formData.projectId || '');

      if (isExistingMode && deletedReraAttachmentIds.length > 0) {
        fd.append(
          "rera_attachment_delete_ids",
          JSON.stringify(deletedReraAttachmentIds)
        );
      }

      const existingLandPayload = buildExistingLandPayload(formData);
      fd.append(
        "land_attachments_existing",
        JSON.stringify(existingLandPayload)
      );

      if (isExistingMode) {
        fd.append(
          "conversion_details",
          JSON.stringify(conversionDetailsPayload)
        );
      }

      (formData.conversionChallanDocs || []).forEach((item) => {
        if (item?.file && isRealFile(item.file)) {
          fd.append('conversion_challan_copy', item.file);
          fd.append('conversion_challan_date[]', item.date || '');
          fd.append('conversion_challan_id[]', item.id || '');
        }
      });

      (formData.conversionOrderDocs || []).forEach((item) => {
        if (item?.file && isRealFile(item.file)) {
          fd.append('conversion_order_attachment', item.file);
          fd.append('conversion_order_date[]', item.date || '');
          fd.append('conversion_order_id[]', item.id || '');
        }
      });

      (formData.conversionMapDocs || []).forEach((item) => {
        if (item?.file && isRealFile(item.file)) {
          fd.append('conversion_map_attachment', item.file);
          fd.append('conversion_map_date[]', item.date || '');
          fd.append('conversion_map_id[]', item.id || '');
        }
      });

      (formData.upniveshanKhasraDocs || []).forEach((item) => {
        if (item?.file && isRealFile(item.file)) {
          fd.append('upniveshan_khasra_file', item.file);
          fd.append('upniveshanDocDate[]', item.date || '');
          fd.append("upniveshan_khasra_id[]", item.id || null);
        }
      });

      (formData.rajaswaKhasraDocs || []).forEach((item) => {
        if (item?.file && isRealFile(item.file)) {
          fd.append('khasra_file', item.file);
          fd.append('rajaswaDocDate[]', item.date || '');
          fd.append("rajaswa_khasra_id[]", item.id || null);
        }
      });

      Object.entries(existingKycPayload).forEach(([k, v]) => fd.append(k, v || ''));
      Object.entries(existingReraPayload).forEach(([k, v]) => fd.append(k, v || ''));

      fd.append('buyers', JSON.stringify(formData.buyers || []));
      fd.append('kyc_date', formData.poaDocDate || '');

      const primaryBuyer = formData.buyers[0] || {};
      fd.append('buyer_name', primaryBuyer.name || '');
      fd.append('buyer_mobile_number', primaryBuyer.mobile || '');
      fd.append('buyer_address', primaryBuyer.address || '');
      fd.append('buyer_aadhar_number', primaryBuyer.aadhaar || '');
      fd.append('buyer_pan_number', primaryBuyer.pan || '');
      fd.append('relation_prefix', primaryBuyer.relation || 'S/O');
      fd.append('buyer_age', primaryBuyer.age || '');
      fd.append('prefix_name', primaryBuyer.fatherName || '');
      fd.append('reference', primaryBuyer.reference || '');

      const upniTypeMap = { Khasra: 'UPNI', Chak: 'CHAK' };
      const murbbaTypeMap = { Murba: 'MURBBA', Kila: 'KILA' };

      if (!isExistingMode) {
        fd.append('land_area_type', landAreaTypeMap[formData.landUnit] || 'BIGHA');
        fd.append('land_area', formData.landArea || '');
        fd.append('upni_no_or_chak_no', formData.upniveshanKhasra || '');
        fd.append('upni_type', upniTypeMap[formData.upniveshanType] || '');
        fd.append('rajaswa_no', formData.rajaswaKhasra || '');
        fd.append('murbba_no', formData.murbbaNo || '');
        fd.append('kila_no', formData.kilaNo || '');
        fd.append('mutation_status', formData.mutationStatus || '');
        fd.append('jamabandi_status', formData.jamabandiStatus || '');
        fd.append('girdawari_status', formData.girdawariStatus || '');
        fd.append('payable_amount', formData.payableAmount || '');
        fd.append('land_remarks', formData.remarks || '');
      }

      if (isExistingMode) {
        const landsPayload = landForms.map(lf => ({
          id: lf.formData?.land_id || lf.formData?.id || null,
          is_married: lf.formData.is_married,
          is_married_land_id: lf.formData.is_married_land_id,
          land_area_type: landAreaTypeMap[lf.formData.landUnit] || 'BIGHA',
          land_area: lf.formData.landArea || '',
          upni_type: upniTypeMap[lf.formData.upniveshanType] || '',
          upni_no_or_chak_no: lf.formData.upniveshanKhasra || '',
          rajaswa_no: lf.formData.rajaswaKhasra || '',
          murbba_no: lf.formData.murbbaNo || '',
          kila_no: lf.formData.kilaNo || '',
          mutation_status: lf.formData.mutationStatus || '',
          jamabandi_status: lf.formData.jamabandiStatus || '',
          girdawari_status: lf.formData.girdawariStatus || '',
          payable_amount: lf.formData.payableAmount || '',
          remarks: lf.formData.remarks || '',
        }));

        fd.append('lands', JSON.stringify(landsPayload));
      }

      (formData.conversionChallanCopy || []).forEach((file) => {
        if (isRealFile(file)) fd.append('conversion_challan_copy', file);
      });
      (formData.conversionOrderAttachment || []).forEach((file) => {
        if (isRealFile(file)) fd.append('conversion_order_attachment', file);
      });
      (formData.conversionMapAttachment || []).forEach((file) => {
        if (isRealFile(file)) fd.append('conversion_map_attachment', file);
      });

      fd.append('land_date', formData.landDate || '');
      fd.append('map_date', formData.mapDate || '');
      fd.append('rajaswaDocDate', formData.rajaswaDocDate || '');
      fd.append('upniveshanDocDate', formData.upniveshanDocDate || '');

      fd.append('murbba_or_kila_no', formData.murbaKila || '');
      fd.append('murbba_type', murbbaTypeMap[formData.murbaType] || '');
      fd.append('land_remarks', formData.remarks || '');
      fd.append('conversion_application_date', formData.conversion_application_date || '');
      fd.append('provision_section', formData.provision_section || '');

      fd.append(
        'division_of_area',
        Array.isArray(formData.division_of_area)
          ? formData.division_of_area.join(',')
          : formData.division_of_area || ''
      );
      const divisionDetailsToSend = formData.divisionDetails || {};
      fd.append('divisionDetails', JSON.stringify(divisionDetailsToSend));
      fd.append('division_details', JSON.stringify(divisionDetailsToSend));
      fd.append('converted_area', formData.convertedArea || '');
      fd.append('conversion_authority', formData.conversion_authority || '');

      fd.append('conversion_challan_date', formData.conversionChallanDate || '');
      fd.append('conversion_map_date', formData.conversionMapDate || '');
      fd.append('conversion_order_date', formData.conversion_order_date || "");
      fd.append('conversion_order_date2', formData.conversionOrderDate || "");

      if (isExistingMode && deletedConversionAttachmentIds.length > 0) {
        fd.append(
          "conversion_attachment_delete_ids",
          JSON.stringify(deletedConversionAttachmentIds)
        );
      }

      const allPayments = [
        {
          id: formData.propertiesPaymentId || null,
          physicalPossession: formData.physicalPossession,
          paymentA: formData.paymentA,
          considerationAmount: formData.considerationAmount,
          paymentAdmin: formData.paymentAdmin,
          compensationPayment: formData.compensationPayment,
          category: formData.category,
          paymentDate: formData.paymentDate,
          paymentMode: formData.paymentMode || paymentTypeValue,
          bankName: formData.bankName,
          branchName: formData.branchName,
          chequeNo: formData.chequeNo,
          isPrimary: true
        },
        ...extraPayments.map(p => ({
          id: p.id || null,
          physicalPossession: p.physicalPossession,
          paymentA: p.paymentA,
          considerationAmount: p.considerationAmount,
          paymentAdmin: p.paymentAdmin,
          compensationPayment: p.compensationPayment,
          category: p.category,
          paymentDate: p.paymentDate,
          paymentMode: p.paymentMode,
          bankName: p.bankName,
          branchName: p.branchName,
          chequeNo: p.chequeNo,
          isPrimary: false
        }))
      ];

      fd.append('all_payments', JSON.stringify(allPayments));

      if (isExistingMode && deletedBuyerIds.length > 0)
        fd.append('buyer_delete_ids', JSON.stringify(deletedBuyerIds));
      if (isExistingMode && deletedPaymentIds.length > 0)
        fd.append('payment_delete_ids', JSON.stringify(deletedPaymentIds));
      if (isExistingMode && deletedLandAttachmentIds.length > 0)
        fd.append('land_attachment_delete_ids', JSON.stringify(deletedLandAttachmentIds));

      if (isExistingMode && deletedKycDocIds.length > 0) {
        fd.append(
          "seller_kyc_delete_ids",
          JSON.stringify(deletedKycDocIds)
        );
      }

      (formData.kycDocs || []).forEach((item) => {
        if (!item?.file || !item?.key || !isRealFile(item.file)) return;
        let fieldName = null;
        if (item.key === 'sellerAadhar' || item.key === 'sellerAadhaar')
          fieldName = 'seller_aadhaar';
        else if (item.key === 'sellerPAN') fieldName = 'seller_pan';
        else if (item.key === 'poaPAN') fieldName = 'seller_poa_pan';
        else if (item.key === 'rajaswaKhasraDoc') fieldName = 'khasra_file';
        else if (item.key === 'upniveshanKhasraDoc') fieldName = 'upniveshan_khasra_file';
        if (fieldName) fd.append(fieldName, item.file);
      });

      (formData.mutationDocs || []).forEach((item, index) => {
        if (item?.file && isRealFile(item.file)) {
          fd.append('poa_doc', item.file);
          fd.append('poa_doc_date[]', item.date || '');
          fd.append("poa_doc_id[]", item.id || "");
        }
      });

      (formData.mapMasterPlan || []).forEach((item, index) => {
        if (item?.file && isRealFile(item.file)) {
          fd.append('map_file', item.file);
          fd.append('map_file_date[]', item.date || '');
          fd.append("map_file_id[]", item.id || "");
        }
      });

      (formData.chainDocs || []).forEach((item, index) => {
        if (item?.file && isRealFile(item.file)) {
          fd.append('land_chain_docs', item.file);
          fd.append('land_chain_docs_date[]', item.date || '');
          fd.append("land_chain_docs_id[]", item.id || "");
        }
      });

      (formData.tirReportDocs || []).forEach((item) => {
        if (item?.file && isRealFile(item.file)) {
          fd.append('tir_report_file', item.file);
          fd.append('tir_report_date[]', item.date || '');
          fd.append('tir_report_id[]', item.id || '');
        }
      });

      (formData.valuationReportDocs || []).forEach((item) => {
        if (item?.file && isRealFile(item.file)) {
          fd.append('valuation_report_file', item.file);
          fd.append('valuation_report_date[]', item.date || '');
          fd.append('valuation_report_id[]', item.id || '');
        }
      });

      if (isExistingMode) {
        const reraPayload = Array.isArray(formData.reraList)
          ? formData.reraList
              .filter(r => r?.rera_number?.trim() && r?.document_date)
              .map(r => ({
                id: r.id || null,
                rera_number: r.rera_number,
                document_date: r.document_date
              }))
          : [];

        fd.append(
          "rera_list",
          JSON.stringify(reraPayload)
        );
      }

      if (!isExistingMode) {
        const singleRera =
          validReraList.length > 0
            ? validReraList[validReraList.length - 1]
            : null;

        if (singleRera) {
          fd.append("rera_registration_number", singleRera.rera_number);
          fd.append("rera_documents_date", singleRera.document_date);
        } else {
          fd.append("rera_registration_number", "");
          fd.append("rera_documents_date", "");
        }
      }

      fd.append(
        'tir_report_date',
        formData.tirReportDate || formData.tir_report_date || ''
      );
      fd.append(
        'valuation_report_date',
        formData.valuationReportDate || formData.valuation_report_date || ''
      );
      fd.append('allotment_date', formData.allotmentDate || formData.allotment_date || '');
      fd.append('rera_number', formData.reraRegistrationNumber || '');
      fd.append('rera_document_date', formData.dateOfDocuments || '');

      let directCustomerNameVal = '';
      if (formData.allotmentDirectCustomer === 'Yes') directCustomerNameVal = 'Yes';
      else if (formData.allotmentDirectCustomer === 'No') directCustomerNameVal = 'No';
      fd.append('allotment_direct_customer', directCustomerNameVal);

      if (isExistingMode && deletedSellerIds.length > 0) {
        fd.append(
          "seller_delete_ids",
          JSON.stringify(deletedSellerIds)
        );
      }

      if (isExistingMode) {
        const source = fetchedRow || data;
        if (source.land?.id) fd.append('land_id', source.land?.id);
        if (source?.seller_kyc_id) fd.append('seller_kyc_id', source.seller_kyc_id);
        if (source?.conversion_id) fd.append('conversion_id', source.conversion_id);
        if (source?.rera_allotment_id) fd.append('rera_allotment_id', source.rera_allotment_id);

        const primaryPaymentIdToSend =
          formData.propertiesPaymentId ||
          source?.properties_payment_id ||
          (Array.isArray(source?.all_payments) &&
            source.all_payments[0] &&
            source.all_payments[0].id) ||
          '';
        if (primaryPaymentIdToSend) fd.append('properties_payment_id', primaryPaymentIdToSend);

        const existingPrimaryBuyer =
          (Array.isArray(source?.buyers) && source.buyers[0]) || {};
        if (existingPrimaryBuyer.id) fd.append('buyer_id', existingPrimaryBuyer.id);
      }

      const url = isExistingMode
        ? `/properties/update`
        : `/properties/add`;
      const res = await api.post(url, fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: userData?.user_token,
        },
      });

      if (res.data?.success) {
        showTemporaryAlert(
          (isExistingMode
            ? 'Property updated successfully'
            : 'Property saved successfully')
        );

        if (!isExistingMode) {
          setFormData(initialState);
          setExtraPayments([]);
          setDeletedBuyerIds([]);
          setDeletedPaymentIds([]);
          setDeletedLandAttachmentIds([]);
        }

        if (isViewMode) {
          try {
            const listRes = await api.get(`/properties/list`, {
              headers: { Authorization: userData?.user_token },
            });
            const listJson = listRes.data || {};
            if (listJson.success && Array.isArray(listJson.data)) {
              const source = fetchedRow || data;
              const sellerId = source && (source.seller_id || source.sellerId);
              if (sellerId) {
                const found = listJson.data.find(
                  (r) => Number(r.seller_id) === Number(sellerId)
                );
                if (found) {
                  setFetchedRow(found);
                  const mapped = mapApiToForm(found);
                  setFormData((prev) => ({ ...prev, ...mapped }));
                }
              }
            }
          } catch (err) {
            console.error('Error re-fetching properties list after save:', err);
          }
        } else {
          setTimeout(() => {
            navigate('/properties');
          }, 2000);
        }

        if (isViewMode && sectionToLock) {
          setSectionEdit((prev) => ({ ...prev, [sectionToLock]: false }));
          setSectionBackups((prev) => {
            const copy = { ...prev };
            delete copy[sectionToLock];
            return copy;
          });
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          api: res.data?.message || 'Failed to save property',
        }));
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Server error while saving property";

      setAmountError(msg);
    } finally {
      setIsSubmitting(false);
      setSubmittingSection(null);
    }
  };

  return (
    <>
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
            <span>{alertMsg}</span>
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
      <Row>
        <Col sm={12}>
          <Card className="add-project-card"> {/* 🔥 CLASS ADDED */}
            <Card.Header className="d-flex justify-content-between align-items-center project-header"> {/* 🔥 CLASS ADDED */}
              <Card.Title className="project-title">{getLabel('landDetailsTitle')}</Card.Title> {/* 🔥 CLASS ADDED */}
              <Col md={2}>
                <Form.Select value={FontValue} onChange={handleLanguageChange} className="custom-select"> {/* 🔥 CLASS ADDED */}
                  <option value={LANGUAGE.EN}>English</option>
                  <option value={LANGUAGE.HI}>Mangal</option>
                  <option value={LANGUAGE.KRUTI}>Hindi</option>
                </Form.Select>
              </Col>
            </Card.Header>

            <Card.Body>
              <Form id="landForm" ref={formRef} noValidate onSubmit={handleSubmit}>
                {errors.api && <div className="text-danger mb-2">{errors.api}</div>}

                <div className="d-flex align-items-center justify-content-end mb-3">
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
                    onAddDeletedSellerId={(id) =>
                      setDeletedSellerIds((prev) =>
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
                  {!isExistingMode && (
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
                      radioName="upniveshanType"
                    />
                  )}

                  {isExistingMode &&
                    landForms.map((lf, index) => (
                      <div key={index} className="mb-4">
                        <div className="fw-bold text-primary mb-2">
                          {lf.note === "parent_land"
                            ? "Parent Land"
                            : `Merged Land ${index}`}
                        </div>

                        <LandIdentificationSection
                          formData={lf.formData}
                          setFormData={(updater) => {
                            setLandForms((prev) => {
                              const copy = [...prev];
                              const updated =
                                typeof updater === "function"
                                  ? updater(copy[index].formData)
                                  : updater;
                              copy[index].formData = updated;
                              return copy;
                            });
                          }}
                          FontValue={FontValue}
                          placeholders={placeholders}
                          LANGUAGE={LANGUAGE}
                          suggestions={suggestions}
                          handleSearchableChange={handleSearchableChange}
                          handleSelectSuggestion={handleSelectSuggestion}
                          dropdownStyle={dropdownStyle}
                          dropdownItemStyle={dropdownItemStyle}
                          radioGroupId={index}
                          HindiInput={HindiInput}
                        />

                        {index !== landForms.length - 1 && (
                          <hr style={{ borderTop: "2px dashed #999" }} />
                        )}
                      </div>
                    ))}
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

                {
                  <div
                    className="mt-3 p-3 rounded"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb"
                    }}
                  >
                    <h6 className="fw-bold mb-3" style={{ color: "#334155" }}>
                      💰 {tPay("title")}
                    </h6>

                    <div
                      className="d-flex justify-content-between align-items-center p-2 rounded mb-2"
                      style={{ background: "#f8fafc", borderLeft: "4px solid #0f172a" }}
                    >
                      <span style={{ color: "#475569" }}>
                        {tPay("totalPayable")}
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        ₹ {totalPayableAmount.toLocaleString("en-IN")}
                      </strong>
                    </div>

                    {!amountError && (
                      <div
                        className="d-flex justify-content-between align-items-center p-2 rounded mb-2"
                        style={{ background: "#eef2ff", borderLeft: "4px solid #4f46e5" }}
                      >
                        <span style={{ color: "#475569" }}>
                          {tPay("revised")}
                        </span>
                        <strong style={{ color: "#4f46e5" }}>
                          ₹ {revisedAmount.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    )}

                    <div
                      className="d-flex justify-content-between align-items-center p-2 rounded"
                      style={{ background: "#fef2f2", borderLeft: "4px solid #dc2626" }}
                    >
                      <span style={{ color: "#475569" }}>
                        {tPay("overPaid")}
                      </span>
                      <strong style={{ color: "#dc2626" }}>
                        ₹ {overPaidAmount.toLocaleString("en-IN")}
                      </strong>
                    </div>

                    {amountError && (
                      <div
                        className="mt-2 p-2 rounded"
                        style={{
                          background: "#fef2f2",
                          borderLeft: "4px solid #b91c1c",
                          color: "#b91c1c"
                        }}
                      >
                        {amountError}
                      </div>
                    )}
                  </div>
                }

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 text-primary">{getLabel('attachments')}</h5>
                  {renderSectionActions('attachments')}
                </div>
                <fieldset disabled={isSectionDisabled('attachments')}>
                  <MainAttachmentsSection
                    setDeletedAttachmentIds={setDeletedLandAttachmentIds}
                    formData={formData}
                    renderFileInput={renderFileInput}
                    handleChange={handleChange}
                    FontValue={FontValue}
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
                    errors={errors}
                    onAddDeletedKycId={(id) =>
                      setDeletedKycDocIds((prev) =>
                        prev.includes(id) ? prev : [...prev, id]
                      )
                    }
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
                    conversionList={formData.conversion_details || []}
                    isExistingMode={isExistingMode}
                    ConversionInfo={ConversionInfo}
                    AttachmentsSection={AttachmentsSection}
                    HindiInput={HindiInput}
                    FontValue={FontValue}
                    LANGUAGE={LANGUAGE}
                    placeholders={placeholders}
                    errors={errors}
                    onAddDeletedConversionId={(id) =>
                      setDeletedConversionAttachmentIds((prev) =>
                        prev.includes(id) ? prev : [...prev, id]
                      )
                    }
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
                    errors={errors}
                    onAddDeletedReraAttachmentId={(id) =>
                      setDeletedReraAttachmentIds((prev) =>
                        prev.includes(id) ? prev : [...prev, id]
                      )
                    }
                  />
                </fieldset>

                <Row className="mt-3">
                  <Col md={2}>
                    <Button 
                      type="submit" 
                      className="form-control-sm submit-btn"  // 🔥 CLASS ADDED
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : isExistingMode ? 'Update' : 'Submit'}
                    </Button>
                  </Col>
                </Row>
              </Form>

              {showProjectConfirm && (
                <LogoutModel
                  projectId={formData.projectId}
                  setShowModal={setShowProjectConfirm}
                  handleFun={() => {
                    const args = pendingSubmitArgs;
                    setPendingSubmitArgs(null);
                    setShowProjectConfirm(false);
                    handleSubmit(args?.e, args?.triggeredSection);
                  }}
                  title={
                    FontValue === LANGUAGE.EN
                      ? "Important Confirmation"
                      : "महत्वपूर्ण सूचना"
                  }
                  subtitle={
                    FontValue === LANGUAGE.EN
                      ? "Once a project is created, it cannot be merged with any other project.\n\nAre you sure you want to continue?"
                      : "एक बार प्रोजेक्ट बन जाने के बाद उसे किसी भी अन्य प्रोजेक्ट के साथ मर्ज नहीं किया जा सकता।\n\nक्या आप निश्चित रूप से आगे बढ़ना चाहते हैं?"
                  }
                  btnText={
                    FontValue === LANGUAGE.EN
                      ? "Yes, Continue"
                      : "हाँ, जारी रखें"
                  }
                  cancelText={
                    FontValue === LANGUAGE.EN
                      ? "No"
                      : "नहीं"
                  }
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}