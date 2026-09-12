import { API_BASE_URL } from "config/constant";
import React, { useState, useRef, useEffect } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { ReactTransliterate } from "react-transliterate";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

// 🔹 Redux imports
import { useDispatch } from "react-redux";
import { setIsFetched } from "../../redux/store/Bookings/Action";
import api from "utils/api";
import BackButton from "components/Loader/BackButton";

const LANGUAGE = { EN: 0, HI: 1, KRUTI: 2 };

export default function Add_Document() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { row } = location.state || {};
  const projectId = row?.project_id;
  const plotId = row?.plot_id;

  console.log(plotId, "dhbehibd");
  console.log(projectId);
  console.log("row.documents ::", row?.documents);

  const existingDocuments = Array.isArray(row?.documents) ? row.documents : [];

  const [rows, setRows] = useState([{ name: "", files: [] }]);
  const [FontValue, setFontValue] = useState(LANGUAGE.EN);
  const [loading, setLoading] = useState(false);

  const isEnglish = FontValue === LANGUAGE.EN;
  const isMangal = FontValue === LANGUAGE.HI;
  const isKruti = FontValue === LANGUAGE.KRUTI;

  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  const alertTimer = useRef(null);

  const showTemporaryAlert = (msg, variant = "success", ms = 3000) => {
    if (alertTimer.current) {
      clearTimeout(alertTimer.current);
      alertTimer.current = null;
    }
    setAlertMsg(msg);
    setAlertVariant(variant);
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

  const handleAddRow = () => {
    setRows((prev) => [...prev, { name: "", files: [] }]);
  };

  const handleRemoveRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddDocument = async () => {
    const userData = JSON.parse(localStorage.getItem("users"));
    const token = userData?.user_token;

    const hasAnyValid = rows.some(
      (r) => r.name && r.name.trim() !== "" && r.files.length > 0
    );
    if (!hasAnyValid) {
      showTemporaryAlert(
        isEnglish ? "At least one Document Name and File is required" : "कम से कम एक Document Name और File ज़रूरी है",
        "danger"
      );
      return;
    }

    try {
      setLoading(true);
      let successCount = 0;

      for (const r of rows) {
        if (!r.name || r.name.trim() === "" || r.files.length === 0) continue;

        const formData = new FormData();
        formData.append("projectId", projectId);
        formData.append("plotId", plotId);
        formData.append("documentName", r.name);
        formData.append("fontName", FontValue);

        r.files.forEach((file) => {
          formData.append("images", file);
        });

        const response = await api.post(`/booking/addocuments`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        });

        if (response.data.success) {
          successCount++;
        } else {
          console.warn("Upload failed for:", r.name, response.data.message);
        }
      }

      if (successCount > 0) {
        showTemporaryAlert(
          isEnglish ? `${successCount} Document(s) uploaded successfully!` : `${successCount} दस्तावेज़ सफलतापूर्वक अपलोड हुए!`,
          "success"
        );
        dispatch(setIsFetched(false));
        setRows([{ name: "", files: [] }]);
        setTimeout(() => {
          navigate("/bookings");
        }, 1000);
      } else {
        showTemporaryAlert(
          isEnglish ? "No document uploaded." : "कोई दस्तावेज़ अपलोड नहीं हुआ।",
          "danger"
        );
      }
    } catch (error) {
      console.error(error);
      showTemporaryAlert(
        isEnglish ? "Something went wrong while uploading." : "अपलोड करते समय कुछ गलत हुआ।",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      {/* ⭐ Toast Alert */}
      <BackButton isEnglish={isEnglish} />
      {showAlert && (
        <div
          className={`alert alert-${alertVariant === "danger" ? "danger" : "success"} position-fixed w-full`}
          style={{ top: "20px", right: "20px", zIndex: "1050", minWidth: 260 }}
          role="alert"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>{alertMsg}</div>
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

      {/* ⭐⭐⭐ ADD-PROJECT-CARD WRAPPER ⭐⭐⭐ */}
      <div className="add-project-card">
        {/* INPUT CARD */}
        <Card>
          <Card.Header className="project-header">
            <Card.Title as="h5" className="project-title" style={{ margin: 0 }}>
              {isEnglish ? "Add Document" : "दस्तावेज़ जोड़ें"}
            </Card.Title>

            <Col md={3}>
              <Form.Select
                className="custom-select"
                size="sm"
                value={FontValue}
                onChange={(e) => setFontValue(Number(e.target.value))}
              >
                <option value={LANGUAGE.EN}>English</option>
                <option value={LANGUAGE.HI}>Mangal</option>
                <option value={LANGUAGE.KRUTI}>Hindi (Kruti)</option>
              </Form.Select>
            </Col>
          </Card.Header>

          <Card.Body>
            {/* 🔁 Multiple rows */}
            {rows.map((rowItem, rowIndex) => (
              <div key={rowIndex} className="mb-3 border-bottom pb-3">
                <Row className="align-items-end">
                  {/* Document Name */}
                  <Col md={5}>
                    <Form.Label className="form-label">
                      {isEnglish ? "Document Name" : "दस्तावेज़ का नाम"} {rows.length > 1 ? `#${rowIndex + 1}` : ""}
                    </Form.Label>
                    {isMangal ? (
                      <ReactTransliterate
                        lang="hi"
                        value={rowItem.name}
                        onChangeText={(txt) => {
                          const updated = [...rows];
                          updated[rowIndex].name = txt;
                          setRows(updated);
                        }}
                        placeholder={isEnglish ? "Enter document name" : "दस्तावेज़ का नाम दर्ज करें"}
                        className="form-control form-control-sm"
                      />
                    ) : (
                      <Form.Control
                        type="text"
                        placeholder={isEnglish ? "Enter document name" : "दस्तावेज़ का नाम दर्ज करें"}
                        value={rowItem.name}
                        className={`form-control form-control-sm ${isKruti ? "kruti-dev" : ""}`}
                        onChange={(e) => {
                          const updated = [...rows];
                          updated[rowIndex].name = e.target.value;
                          setRows(updated);
                        }}
                      />
                    )}
                  </Col>

                  {/* Document Attachment */}
                  <Col md={5}>
                    <Form.Label className="form-label">
                      {isEnglish ? "Document Attachment" : "दस्तावेज़ अटैचमेंट"}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      multiple
                      className="form-control form-control-sm"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setRows((prev) =>
                          prev.map((r, i) =>
                            i === rowIndex ? { ...r, files: [...r.files, ...files] } : r
                          )
                        );
                      }}
                    />
                  </Col>

                  {/* Row delete button */}
                  <Col md={2} className="mt-3 mt-md-0 text-end">
                    {rows.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleRemoveRow(rowIndex)}
                      >
                        <FaTrash size={12} /> {isEnglish ? "Remove" : "हटाएं"}
                      </Button>
                    )}
                  </Col>
                </Row>

                {/* 🔍 Preview */}
                {rowItem.files.length > 0 && (
                  <Row className="mt-2">
                    {rowItem.files.map((file, idx) => (
                      <Col key={idx} xs={4} sm={3} md={3} className="mb-2">
                        <div className="border rounded p-1 position-relative text-center">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            style={{
                              width: "100%",
                              height: 70,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                          <span
                            onClick={() => {
                              setRows((prev) =>
                                prev.map((r, i) =>
                                  i === rowIndex
                                    ? { ...r, files: r.files.filter((_, fi) => fi !== idx) }
                                    : r
                                )
                              );
                            }}
                            style={{
                              position: "absolute",
                              top: -5,
                              right: -5,
                              background: "red",
                              color: "white",
                              borderRadius: "50%",
                              cursor: "pointer",
                              width: 20,
                              height: 20,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            ×
                          </span>
                          <small className="d-block text-truncate mt-1">{file.name}</small>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            ))}

            {/* Buttons */}
            <div className="d-flex justify-content-between mt-3">
              <Button
                size="sm"
                variant="outline-secondary"
                type="button"
                onClick={handleAddRow}
              >
                + {isEnglish ? "Add More" : "और जोड़ें"}
              </Button>

              <Button
                className="submit-btn"
                onClick={handleAddDocument}
                disabled={loading}
              >
                {loading
                  ? (isEnglish ? "Uploading..." : "अपलोड हो रहा है...")
                  : (isEnglish ? "Upload Document(s)" : "दस्तावेज़ अपलोड करें")
                }
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* 🔹 Existing Documents */}
        {existingDocuments.length > 0 && (
          <Card className="mt-3">
            <Card.Header className="project-header">
              <strong className="project-title">
                {isEnglish ? "Existing Documents" : "मौजूदा दस्तावेज़"}
              </strong>
            </Card.Header>
            <Card.Body>
              <Row>
                {existingDocuments.map((doc) => (
                  <Col key={doc.id} xs={6} sm={4} md={3} className="mb-3">
                    <div className="border rounded p-2 text-center">
                      <img
                        src={`${API_BASE_URL}/uploads/${doc.image}`}
                        alt={doc.name}
                        style={{
                          width: "100%",
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 4,
                          marginBottom: 4,
                        }}
                      />
                      <div className="small text-truncate" title={doc.name}>
                        {doc.name}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* ⭐ Back Button */}
        <div className="px-3 py-3 border-top text-start">
          
        </div>
      </div>
      {/* ⭐⭐⭐ END WRAPPER ⭐⭐⭐ */}
    </React.Fragment>
  );
}