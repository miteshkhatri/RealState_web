import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Row, Col, Button, Card } from "react-bootstrap";
import "../style.css";

// 🔹 Redux imports
import { useDispatch } from "react-redux";
import { setIsFetched } from "../../redux/store/Bookings/Action";
import { ReactTransliterate } from "react-transliterate";
import api from "utils/api";
import BackButton from "components/Loader/BackButton";

// ✅ Signature Pad Component
function SignaturePad({ label, locked, confirmed, onConfirm, onEdit, lockMsg }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const getPos = (e) => {
      const r = canvas.getBoundingClientRect();
      const scaleX = canvas.width / r.width;
      const scaleY = canvas.height / r.height;
      const src = e.touches ? e.touches[0] : e;
      return {
        x: (src.clientX - r.left) * scaleX,
        y: (src.clientY - r.top) * scaleY,
      };
    };

    const start = (e) => {
      if (locked || confirmed) return;
      drawing.current = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      if (e.cancelable) e.preventDefault();
    };

    const draw = (e) => {
      if (!drawing.current || locked || confirmed) return;
      const p = getPos(e);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      setHasDrawn(true);
      if (e.cancelable) e.preventDefault();
    };

    const stop = () => { drawing.current = false; };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("mouseleave", stop);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stop);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stop);
      canvas.removeEventListener("mouseleave", stop);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stop);
    };
  }, [locked, confirmed]);

  useEffect(() => {
    if (confirmed && canvasRef.current && typeof confirmed === "string") {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = confirmed;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }, [confirmed]);

  const handleClear = () => {
    if (confirmed) return;
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    if (!hasDrawn) return;
    const dataURL = canvasRef.current.toDataURL("image/png");
    onConfirm(dataURL);
  };

  const handleEdit = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onEdit();
  };

  return (
    <div style={{
        border: confirmed ? "1.5px solid #1D9E75" : "1px solid #dee2e6",
        borderRadius: 8, padding: "1rem", marginBottom: "1rem",
        opacity: locked ? 0.45 : 1, pointerEvents: locked ? "none" : "auto",
        transition: "opacity 0.3s, border 0.3s", background: "#fff",
      }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong style={{ fontSize: 14 }}>{label}</strong>
        <span style={{
            fontSize: 12, padding: "3px 12px", borderRadius: 20,
            background: confirmed ? "#EAF3DE" : locked ? "#F1EFE8" : "#FAEEDA",
            color: confirmed ? "#3B6D11" : locked ? "#5F5E5A" : "#854F0B",
            fontWeight: 500,
          }}>
          {confirmed ? "✓ Signed" : locked ? "Locked" : "Pending"}
        </span>
      </div>
      <canvas ref={canvasRef} width={600} height={120} style={{ border: "1px solid #dee2e6", borderRadius: 6, width: "100%", height: 120, cursor: locked || confirmed ? "not-allowed" : "crosshair", background: "#f8f9fa", display: "block" }} />
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        {!locked && !confirmed && (
          <>
            <Button variant="outline-secondary" size="sm" onClick={handleClear}>Clear</Button>
            <Button size="sm" style={{ background: hasDrawn ? "#1D9E75" : "#aaa", border: "none" }} disabled={!hasDrawn} onClick={handleConfirm}>Confirm</Button>
          </>
        )}
        {confirmed && <Button variant="link" size="sm" onClick={handleEdit} style={{ color: "#dc3545", padding: 0 }}>Edit Signature</Button>}
      </div>
      {locked && <small className="text-muted d-block mt-1">{lockMsg}</small>}
    </div>
  );
}

export default function MoreInfo({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const row = location.state?.row || {};

  const documentsDate = Array.isArray(row.documents_date) ? row.documents_date : Array.isArray(row.documentsDate) ? row.documentsDate : [];

  console.log(row);

  const normalizeDate1 = (val) => {
    if (!val) return "";
    if (val instanceof Date) {
      const yyyy = val.getFullYear();
      const mm = String(val.getMonth() + 1).padStart(2, "0");
      const dd = String(val.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    const datePart = val.toString().split("T")[0];
    if (!datePart || datePart.length < 10) return "";
    return datePart;
  };

  const normalizeDate = (val) => {
    if (!val) return "";
    const date = new Date(val);
    if (isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  };

  const getDateByType = (type) => {
    const item = documentsDate.find((d) => d.type === type);
    return item ? normalizeDate(item.document_date) : "";
  };

  const getIdByType = (type) => {
    const item = documentsDate.find((d) => d.type === type);
    return item ? item.id : null;
  };

  const getValueByType = (type) => {
    const item = documentsDate.find((d) => d.type === type);
    return item ? item.document_date : "";
  };

  const [form, setForm] = useState({
    allotmentDate: getDateByType("allotment") || normalizeDate(row.allotmentDate || row.allotment_date),
    pattaFileDate: getDateByType("patta_file") || normalizeDate(row.pattaFileDate || row.patta_file_date),
    pattaDate: getDateByType("patta") || normalizeDate(row.pattaDate || row.patta_date),
    registrationDate: getDateByType("registration") || normalizeDate(row.registrationDate || row.registration_date),
    agreementDate: getDateByType("agreement") || normalizeDate1(row.agreement_date || row.agreementDate),
    bookingDate: getDateByType("booking") || normalizeDate(row.booking_date || row.bookingDate),
    executedDate: getDateByType("executed"),
    pattaReceivedDate: getDateByType("patta_received"),
    pattaRegistrationDate: getDateByType("patta_registration"),
    registryDate: getDateByType("registry"),
    agreementCheckedBy: getValueByType("agreement_checked_by"),
    organizationDocumentHandedOverToPartyDate: getDateByType("organization_document_handed_over_to_party"),
    project_id: row.project_id || "",
    plot_id: row.plot_id || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  const [FontValue, setFontValue] = useState("0"); // ⭐ English default
  const isEnglish = FontValue === "0";
  const isMangal = FontValue === "2";

  const userData = JSON.parse(localStorage.getItem("users"));

  const dbClientSig = getValueByType("client_signature");
  const dbAccountantSig = getValueByType("accountant_signature");
  const dbManagerSig = getValueByType("manager_signature");

  const dbRegClientSig = getValueByType("registry_client_signature");
  const dbRegAccountantSig = getValueByType("registry_accountant_signature");
  const dbRegManagerSig = getValueByType("registry_manager_signature");

  const [clientSig, setClientSig] = useState(getValueByType("client_signature"));
  const [accountantSig, setAccountantSig] = useState(getValueByType("accountant_signature"));
  const [managerSig, setManagerSig] = useState(getValueByType("manager_signature"));

  const [regClientSig, setRegClientSig] = useState(getValueByType("registry_client_signature"));
  const [regAccountantSig, setRegAccountantSig] = useState(getValueByType("registry_accountant_signature"));
  const [regManagerSig, setRegManagerSig] = useState(getValueByType("registry_manager_signature"));

  const showTemporaryAlert = (msg, variant = "success") => {
    setAlertMsg(msg); setAlertVariant(variant); setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const updateField = (key, value) => { setForm((prev) => ({ ...prev, [key]: value })); };

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        allotment_date: form.allotmentDate || null,
        patta_file_date: form.pattaFileDate || null,
        patta_date: form.pattaDate || null,
        registration_date: form.registrationDate || null,
        agreement_date: form.agreementDate || null,
        booking_date: form.bookingDate || null,
        executed_date: form.executedDate || null,
        patta_received_date: form.pattaReceivedDate || null,
        patta_registration_date: form.pattaRegistrationDate || null,
        registry_date: form.registryDate || null,
        agreement_checked_by: form.agreementCheckedBy || null,
        organization_document_handed_over_to_party_date: form.organizationDocumentHandedOverToPartyDate || null,
        allotment_id: getIdByType("allotment"),
        patta_file_id: getIdByType("patta_file"),
        patta_id: getIdByType("patta"),
        registration_id: getIdByType("registration"),
        agreement_id: getIdByType("agreement"),
        booking_id: getIdByType("booking"),
        executed_id: getIdByType("executed"),
        patta_received_id: getIdByType("patta_received"),
        patta_registration_id: getIdByType("patta_registration"),
        registry_id: getIdByType("registry"),
        agreement_checked_by_id: getIdByType("agreement_checked_by"),
        organization_document_handed_over_to_party_id: getIdByType("organization_document_handed_over_to_party"),
        client_signature: clientSig || null,
        accountant_signature: accountantSig || null,
        manager_signature: managerSig || null,
        registry_client_signature: regClientSig || null,
        registry_accountant_signature: regAccountantSig || null,
        registry_manager_signature: regManagerSig || null,
      };

      const res = await api.post(`/booking/addDate`, payload, {
        headers: { authorization: userData.user_token },
      });

      if (res.data.success) {
        showTemporaryAlert("All dates saved successfully!");
        dispatch(setIsFetched(false));
        setTimeout(() => navigate(-1), 1000);
      } else {
        showTemporaryAlert(res.data.message || "Save failed", "danger");
      }
    } catch (e) {
      showTemporaryAlert("Something went wrong", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = userData?.role_id === 1 || userData?.role_id === 2;
  const canEditField = (type) => (isAdmin || !(getDateByType(type) || getValueByType(type)));
  const canEditSignature = (dbValue) => (isAdmin || !dbValue);

  return (
    <>
      {showAlert && (
        <div className={`alert alert-${alertVariant} position-fixed`} style={{ top: 20, right: 20, zIndex: 1050, minWidth: 260 }}>
          {alertMsg}
        </div>
      )}

      {/* ⭐⭐⭐ ADD-PROJECT-CARD WRAPPER ⭐⭐⭐ */}
      <div className="add-project-card">
        <Card>
          {/* ⭐ HEADER */}
          <Card.Header className="project-header">
            <Card.Title as="h5" className="project-title">
              More Info
            </Card.Title>
            <div style={{ minWidth: 160 }}>
              <Form.Select className="custom-select" value={FontValue} onChange={(e) => setFontValue(e.target.value)}>
                <option value="0">English</option>
                <option value="1">Hindi</option>
                <option value="2">Mangal</option>
              </Form.Select>
            </div>
          </Card.Header>

          <Card.Body>
            {/* Agreement & Booking Date */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="form-label">
                  {isEnglish ? "Agreement Date" : isMangal ? "एग्रीमेंट दिनांक" : "एग्रीमेंट दिनांक"}
                </Form.Label>
                <Form.Control type="date" value={form.agreementDate} disabled={!canEditField("agreement")} onChange={(e) => updateField("agreementDate", e.target.value)} className="form-control form-control-sm" />
              </Col>
              <Col md={6}>
                <Form.Label className="form-label">
                  {isEnglish ? "Date of Booking" : isMangal ? "बुकिंग की तिथि" : "बुकिंग की तिथि"}
                </Form.Label>
                <Form.Control type="date" value={form.bookingDate} disabled={!canEditField("booking")} onChange={(e) => updateField("bookingDate", e.target.value)} className="form-control form-control-sm" />
              </Col>
            </Row>

            {/* Agreement Checked By & Executed Date */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="form-label">
                  {isEnglish ? "Agreement Checked By" : isMangal ? "एग्रीमेंट जाँचकर्ता" : "एग्रीमेंट जाँचकर्ता"}
                </Form.Label>
                {isMangal ? (
                  <ReactTransliterate value={form.agreementCheckedBy || ""} onChangeText={(txt) => updateField("agreementCheckedBy", txt.slice(0, 35))} lang="hi" renderComponent={(props) => <Form.Control {...props} disabled={!canEditField("agreement_checked_by")} maxLength={35} className="form-control form-control-sm" />} />
                ) : (
                  <Form.Control type="text" value={form.agreementCheckedBy || ""} disabled={!canEditField("agreement_checked_by")} maxLength={35} placeholder="Agreement Checked By" onChange={(e) => updateField("agreementCheckedBy", e.target.value.slice(0, 35))} className="form-control form-control-sm" />
                )}
              </Col>
              <Col md={6}>
                <Form.Label className="form-label">
                  {isEnglish ? "Executed Date" : isMangal ? "निष्पादन दिनांक" : "निष्पादन दिनांक"}
                </Form.Label>
                <Form.Control type="date" value={form.executedDate} disabled={!canEditField("executed")} onChange={(e) => updateField("executedDate", e.target.value)} className="form-control form-control-sm" />
              </Col>
            </Row>

            {/* Allotment & Patta Received */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="form-label">
                  {isEnglish ? "Date of Allotment" : isMangal ? "आवंटन दिनांक" : "आवंटन दिनांक"}
                </Form.Label>
                <Form.Control type="date" value={form.allotmentDate} disabled={!canEditField("allotment")} onChange={(e) => updateField("allotmentDate", e.target.value)} className="form-control form-control-sm" />
              </Col>
              <Col md={6}>
                <Form.Label className="form-label">
                  {isEnglish ? "Patta Received Date" : isMangal ? "पट्टा प्राप्ति दिनांक" : "पट्टा प्राप्ति दिनांक"}
                </Form.Label>
                <Form.Control type="date" value={form.pattaReceivedDate} disabled={!canEditField("patta_received")} onChange={(e) => updateField("pattaReceivedDate", e.target.value)} className="form-control form-control-sm" />
              </Col>
            </Row>

            {/* Patta Registration & Registry */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="form-label">
                  {isEnglish ? "Patta Registration Date" : isMangal ? "पट्टा पंजीकरण दिनांक" : "पट्टा पंजीकरण दिनांक"}
                </Form.Label>
                <Form.Control type="date" value={form.pattaRegistrationDate} disabled={!canEditField("patta_registration")} onChange={(e) => updateField("pattaRegistrationDate", e.target.value)} className="form-control form-control-sm" />
              </Col>
              <Col md={6}>
                <Form.Label className="form-label">
                  {isEnglish ? "Registry Date" : isMangal ? "रजिस्ट्री दिनांक" : "रजिस्ट्री दिनांक"}
                </Form.Label>
                <Form.Control type="date" value={form.registryDate} disabled={!canEditField("registry")} onChange={(e) => updateField("registryDate", e.target.value)} className="form-control form-control-sm" />
              </Col>
            </Row>

            {/* Organization Document Handover */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="form-label">
                  {isEnglish ? "Organization Document Handover To Party Date" : isMangal ? "संस्था दस्तावेज पार्टी को सौंपने की तिथि" : "संस्था दस्तावेज पार्टी को सौंपने की तिथि"}
                </Form.Label>
                <Form.Control type="date" value={form.organizationDocumentHandedOverToPartyDate} disabled={!canEditField("organization_document_handed_over_to_party")} onChange={(e) => updateField("organizationDocumentHandedOverToPartyDate", e.target.value)} className="form-control form-control-sm" />
              </Col>
            </Row>

            {/* ✅ Agreement Signatures */}
            {form.agreementDate && (
              <>
                <hr />
                <h6 className="mb-3 text-success">{isEnglish ? "Agreement Signatures" : "एग्रीमेंट हस्ताक्षर"}</h6>
                <Row>
                  <Col md={4}><SignaturePad label="Client" locked={!canEditSignature(dbClientSig)} confirmed={clientSig} onConfirm={setClientSig} onEdit={() => setClientSig(null)} /></Col>
                  <Col md={4}><SignaturePad label="Accountant" locked={!clientSig || !canEditSignature(dbAccountantSig)} confirmed={accountantSig} onConfirm={setAccountantSig} onEdit={() => setAccountantSig(null)} lockMsg="Client sign first" /></Col>
                  <Col md={4}><SignaturePad label="Manager" locked={!accountantSig || !canEditSignature(dbManagerSig)} confirmed={managerSig} onConfirm={setManagerSig} onEdit={() => setManagerSig(null)} lockMsg="Accountant sign first" /></Col>
                </Row>
              </>
            )}

            {/* ✅ Registry Signatures */}
            {form.registryDate && (
              <>
                <hr />
                <h6 className="mb-3 text-primary">{isEnglish ? "Registry Signatures" : "रजिस्ट्री हस्ताक्षर"}</h6>
                <Row>
                  <Col md={4}><SignaturePad label="Client (Reg)" locked={!canEditSignature(dbRegClientSig)} confirmed={regClientSig} onConfirm={setRegClientSig} onEdit={() => setRegClientSig(null)} /></Col>
                  <Col md={4}><SignaturePad label="Accountant (Reg)" locked={!regClientSig || !canEditSignature(dbRegAccountantSig)} confirmed={regAccountantSig} onConfirm={setRegAccountantSig} onEdit={() => setRegAccountantSig(null)} lockMsg="Client sign first" /></Col>
                  <Col md={4}><SignaturePad label="Manager (Reg)" locked={!regAccountantSig || !canEditSignature(dbRegManagerSig)} confirmed={regManagerSig} onConfirm={setRegManagerSig} onEdit={() => setRegManagerSig(null)} lockMsg="Accountant sign first" /></Col>
                </Row>
              </>
            )}
          </Card.Body>

          {/* ⭐ FOOTER */}
          <Card.Footer className="d-flex justify-content-between align-items-center">
            <BackButton isEnglish={isEnglish} />
            <Button className="submit-btn" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (isEnglish ? "Saving..." : "सेव हो रहा है...") : (isEnglish ? "Save" : "सेव करें")}
            </Button>
          </Card.Footer>
        </Card>
      </div>
    </>
  );
}