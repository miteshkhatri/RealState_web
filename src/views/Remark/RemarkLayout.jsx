import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Form, Button, Badge, Modal } from 'react-bootstrap';
import { useParams, useLocation } from 'react-router-dom';
import api from 'utils/api';
import { ReactTransliterate } from "react-transliterate";
import { FaMessage, FaPaperPlane, FaTrash, FaCircleExclamation, FaCalendarDays, FaUser, FaClock } from 'react-icons/fa6';
import BackButton from 'components/Loader/BackButton';

// ✅ IST +5:30 timezone-safe format — "2026-06-12T18:30:00.000Z" → "13-06-2026"
const formatDate = (val) => {
  if (!val) return "";
  const str = val.toString().trim();
  if (str.includes("T")) {
    const date = new Date(str);
    const ist = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    const dd = String(ist.getUTCDate()).padStart(2, "0");
    const mm = String(ist.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = ist.getUTCFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
  // Sirf "2026-05-29" wala plain string
  const parts = str.split("-");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return str;
};

function RemarkLayout() {
  const { projectId } = useParams();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem("users") || "{}");

  const row = location.state?.row;
  const plotId = row?.plot_id;

  const [remarks, setRemarks] = useState([]);
  const [newRemark, setNewRemark] = useState("");
  const [nextFollowDate, setNextFollowDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [FontValue, setFontValue] = useState("hi_mangal");
  const isMangal = FontValue === "hi_mangal";

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  const alertTimer = useRef(null);

  const showTemporaryAlert = (msg, variant = "success", ms = 3000) => {
    if (alertTimer.current) clearTimeout(alertTimer.current);
    setAlertMsg(msg);
    setAlertVariant(variant);
    setShowAlert(true);
    alertTimer.current = setTimeout(() => setShowAlert(false), ms);
  };

  const getRemarks = async () => {
    try {
      const res = await api.get(`/project/get-remarks`, {
        params: { project_id: projectId, reference_id: plotId },
        headers: { Authorization: userData?.user_token }
      });
      if (res.data.success) setRemarks(res.data.data);
    } catch (err) {
      showTemporaryAlert("Failed to load remarks ❌", "danger");
    }
  };

  const handleAddRemark = async () => {
    if (!newRemark.trim()) {
      showTemporaryAlert(isMangal ? "कृपया टिप्पणी दर्ज करें ⚠️" : "Please enter remark ⚠️", "danger");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(`/project/add-remark`, {
        project_id: Number(projectId),
        reference_type: "plot",
        reference_id: Number(plotId),
        remark: newRemark,
        next_followup_date: nextFollowDate || null,
        created_by: userData?.user_id
      }, {
        headers: { Authorization: userData?.user_token }
      });

      if (res.data.success) {
        showTemporaryAlert(isMangal ? "टिप्पणी सफलतापूर्वक जोड़ी गई ✅" : "Remark added successfully ✅");
        setNewRemark("");
        setNextFollowDate("");
        getRemarks();
      }
    } catch (err) {
      showTemporaryAlert("Failed to add remark ❌", "danger");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const res = await api.post(`/project/delete-remark`,
        { id: deleteId, deleted_by: userData?.user_id },
        { headers: { Authorization: userData?.user_token } }
      );
      if (res.data.success) {
        showTemporaryAlert(isMangal ? "टिप्पणी हटा दी गई 🗑️" : "Remark deleted successfully 🗑️");
        getRemarks();
      }
    } catch (err) {
      showTemporaryAlert("Delete failed ❌", "danger");
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  useEffect(() => {
    if (plotId) getRemarks();
    return () => { if (alertTimer.current) clearTimeout(alertTimer.current); };
  }, [projectId, plotId]);

  return (
    <>
      {showAlert && (
        <div
          className={`alert alert-${alertVariant} position-fixed`}
          style={{ top: 20, right: 20, zIndex: 1050, minWidth: 260 }}
        >
          {alertMsg}
        </div>
      )}

      <Card className="shadow-sm rounded custom-card">
        <Card.Header className="text-white d-flex justify-content-between align-items-center">
          <Card.Title as="h5" className="mb-0 d-flex align-items-center gap-2">
            <FaMessage />
            {isMangal ? "टिप्पणियाँ" : "Project Remarks"}
            <span className="opacity-75 small fw-normal ms-1">
              | Plot: {plotId}
            </span>
          </Card.Title>
          <div className="d-flex align-items-center gap-2">
            <Badge bg="light" text="dark" className="px-3 py-2">
              {isMangal ? "कुल" : "Total"}: {remarks.length}
            </Badge>
            <div style={{ minWidth: 160 }}>
              <Form.Select
                value={FontValue}
                onChange={(e) => setFontValue(e.target.value)}
                style={{ fontSize: 13 }}
              >
                <option value="en">English</option>
                <option value="hi_mangal">Mangal</option>
              </Form.Select>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          <Row>
            {/* LEFT: INPUT */}
            <Col md={4} className="mb-4 mb-md-0">
              <div className="sticky-top" style={{ top: 16 }}>

                <Form.Group className="mb-3">
                  <Form.Label>
                    {isMangal ? "नई टिप्पणी" : "New Remark"}
                  </Form.Label>
                  {isMangal ? (
                    <ReactTransliterate
                      value={newRemark}
                      onChangeText={(txt) => setNewRemark(txt)}
                      lang="hi"
                      renderComponent={(props) => (
                        <Form.Control
                          {...props}
                          as="textarea"
                          rows={5}
                          placeholder="यहाँ टिप्पणी दर्ज करें..."
                          style={{ fontFamily: "'Mangal', sans-serif", resize: "none" }}
                        />
                      )}
                    />
                  ) : (
                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={newRemark}
                      onChange={(e) => setNewRemark(e.target.value)}
                      placeholder="Enter remark here..."
                      style={{ resize: "none" }}
                    />
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    {isMangal ? "अगली फॉलो-अप तिथि" : "Next Follow-up Date"}
                  </Form.Label>
                  {/* ✅ e.target.value directly save — "2026-06-13" plain string, koi conversion nahi */}
                  <Form.Control
                    type="date"
                    value={nextFollowDate}
                    onChange={(e) => setNextFollowDate(e.target.value)}
                  />
                  {nextFollowDate && (
                    <Form.Text className="text-muted">
                      <FaCalendarDays className="me-1" />
                      {/* ✅ Plain string "2026-06-13" → "13-06-2026" */}
                      {formatDate(nextFollowDate)}
                    </Form.Text>
                  )}
                </Form.Group>

                <Button
                  variant="primary"
                  className="w-100"
                  onClick={handleAddRemark}
                  disabled={loading}
                >
                  {loading
                    ? (isMangal ? "सहेज रहे हैं..." : "Saving...")
                    : <><FaPaperPlane className="me-2" />{isMangal ? "सहेजें" : "Save Remark"}</>
                  }
                </Button>
              </div>
            </Col>

            {/* RIGHT: LIST */}
            <Col md={8}>
              <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: 4 }}>
                {remarks.length > 0 ? (
                  remarks.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "#fff",
                        border: "1px solid #dee2e6",
                        borderLeft: "4px solid #0d6efd",
                        borderRadius: 8,
                        padding: "12px 16px",
                        marginBottom: 12,
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <p
                          className="mb-1 text-dark"
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            lineHeight: 1.7,
                            fontFamily: isMangal ? "'Mangal', sans-serif" : "inherit",
                            flex: 1
                          }}
                        >
                          {item.remark}
                        </p>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="border-0 p-1"
                          style={{ borderRadius: 6, flexShrink: 0 }}
                          onClick={() => confirmDelete(item.id)}
                          title="Delete"
                        >
                          <FaTrash size={13} />
                        </Button>
                      </div>

                      {/* ✅ Follow-up — IST converted formatDate */}
                      {item.next_followup_date && (
                        <div className="mt-1 mb-2">
                          <Badge
                            bg="warning"
                            text="dark"
                            style={{ fontSize: 11, fontWeight: 500, borderRadius: 20, padding: "3px 10px" }}
                          >
                            <FaCalendarDays className="me-1" />
                            {isMangal ? "फॉलो-अप: " : "Follow-up: "}
                            {formatDate(item.next_followup_date)}
                          </Badge>
                        </div>
                      )}

                      <div
                        className="d-flex justify-content-between align-items-center pt-2 mt-2"
                        style={{ borderTop: "1px solid #f0f0f0" }}
                      >
                        <span style={{ fontSize: 12, color: "#0d6efd", fontWeight: 600 }}>
                          <FaUser size={10} className="me-1" />
                          {isMangal ? "द्वारा: " : "By: "}{item.user_name || "Admin"}
                        </span>
                        {/* ✅ created_at — IST converted formatDate */}
                        <span style={{ fontSize: 11, color: "#999" }}>
                          <FaClock size={10} className="me-1" />
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="text-center py-5"
                    style={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: 8 }}
                  >
                    <FaMessage size={36} className="mb-3" style={{ color: "#dee2e6" }} />
                    <p className="text-muted mb-0">
                      {isMangal ? "कोई टिप्पणी उपलब्ध नहीं" : "No remarks available"}
                    </p>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>

       <Card.Footer className="d-flex justify-content-between align-items-center">
  
  {/* LEFT */}
  <BackButton />

  {/* RIGHT */}
  <small className="text-muted">
    {isMangal 
      ? `कुल ${remarks.length} टिप्पणियाँ` 
      : `${remarks.length} remark(s) total`}
  </small>

</Card.Footer>
      </Card>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered size="sm">
        <Modal.Body className="text-center p-4">
          <FaCircleExclamation size={45} className="text-danger mb-3" />
          <h5 className="fw-bold">
            {isMangal ? "क्या आप सुनिश्चित हैं?" : "Are you sure?"}
          </h5>
          <p className="text-muted small mb-0">
            {isMangal
              ? "यह टिप्पणी स्थायी रूप से हटा दी जाएगी।"
              : "This remark will be permanently deleted."}
          </p>
          <div className="d-flex gap-2 justify-content-center mt-4">
            <Button variant="outline-secondary" className="px-4" onClick={() => setShowConfirm(false)}>
              {isMangal ? "रद्द करें" : "Cancel"}
            </Button>
            <Button variant="danger" className="px-4" onClick={handleDelete}>
              {isMangal ? "हटाएं" : "Delete"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default RemarkLayout;