import React from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import { API_BASE_URL } from "config/constant";

// 🔹 helper: check real File object
const isRealFile = (f) =>
  typeof File !== "undefined" && f instanceof File;

// 🔹 helper: preview URL
const getPreviewUrl = (item) => {
  if (!item) return "";

  if (isRealFile(item)) return URL.createObjectURL(item);

  if (item.existing && item.name) {
    return `${API_BASE_URL}/uploads/${item.name}`;
  }

  if (typeof item === "string") {
    return `${API_BASE_URL}/uploads/${item}`;
  }

  return "";
};

// 🔹 helper: file name
const getFileName = (item) => {
  if (!item) return "";
  if (isRealFile(item)) return item.name;
  if (typeof item === "string") return item;
  if (typeof item.name === "string") return item.name;
  if (Array.isArray(item.name)) return item.name.join(",");
  if (Array.isArray(item)) return item.join(",");
  return "";
};

// 🔹 helper: image check
const isImageFile = (fileName) => {
  const f = String(fileName || "").toLowerCase();
  return f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg");
};

const AllotmentPattaSection = ({
  formData = {},
  setFormData = () => {},
  FontValue = 0,
  placeholders = {},
  LANGUAGE = { EN: 0, HI: 1 },
    errors = {},
  onAddDeletedReraAttachmentId,
}) => {
  const ph = (key, en, hi) => {
    if (placeholders && placeholders[key]) return placeholders[key];
    return FontValue === LANGUAGE.EN ? en : hi;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const existingFiles = formData[name] || [];
      setFormData((prev) => ({
        ...prev,
        [name]: [...existingFiles, ...Array.from(files)],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ✅🔥 FINAL FIXED removeFile
  const removeFile = (name, index) => {
    const files = formData[name] || [];
    const removedItem = files[index];

    // 🔥 existing file → ID parent ko bhejo
    if (removedItem?.id) {
      onAddDeletedReraAttachmentId?.(removedItem.id);
    }

    const updatedFiles = files.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      [name]: updatedFiles,
    }));
  };

  // 🔹 common renderer
  const renderFileInput = (label, name) => (
    <Form.Group controlId={name} className="mb-0">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type="file"
        name={name}
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleChange}
        multiple
        size="sm"
        className="form-control-sm hindi-input-custom"
      />

      <div className="mt-2 d-flex flex-column gap-1">
        {(formData[name] || []).map((item, idx) => {
          const fileName = getFileName(item);
          const previewUrl = getPreviewUrl(item);
          const isImage = isImageFile(fileName);

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid",
                padding: "5px",
                borderRadius: "4px",
                gap: "8px",
              }}
            >
              {previewUrl && isImage && (
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={previewUrl}
                    alt={fileName || "preview"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

              <span
                style={{
                  flex: 1,
                  fontSize: "0.8rem",
                  wordBreak: "break-all",
                }}
              >
                {fileName}
              </span>

              <Button
                size="sm"
                variant="danger"
                onClick={() => removeFile(name, idx)}
              >
                {ph("remove", "Remove", "हटाएँ")}
              </Button>
            </div>
          );
        })}
      </div>
    </Form.Group>
  );

  return (
    <Card className="border-0 shadow-none p-0">
      <Card.Body className="p-0">

        {/* FILE UPLOADS (hidden as before) */}
        <Row className="mb-0 d-none">
          <Col md={4}>
            {renderFileInput(
              ph("allotmentLabel", "Allotment Attachment", "एलॉटमेंट संलग्नक"),
              "allotmentAttachment"
            )}
          </Col>
          <Col md={4}>
            {renderFileInput(
              ph(
                "relatedPaymentLabel",
                "Related Payment & Document Upload",
                "संबंधित भुगतान और दस्तावेज़ अपलोड"
              ),
              "relatedPaymentDocs"
            )}
          </Col>
          <Col md={4}>
            {renderFileInput(
              ph("plotPattaLabel", "Plot Patta Attachment", "प्लॉट पट्टा संलग्नक"),
              "plotPattaAttachment"
            )}
          </Col>
        </Row>

        {/* DROPDOWN */}
        <Row className="m-0">
          <Col md={4}>
            <Form.Group controlId="allotmentDirectCustomer">
              <Form.Label className="mb-1">
                {ph(
                  "allotDirectLabel",
                  "Allotment / Registry",
                  " एलॉटमेंट / रजिस्ट्री"
                )}
              </Form.Label>

              <Form.Select
                name="allotmentDirectCustomer"
                value={formData.allotmentDirectCustomer || ""}
                onChange={handleChange}
                size="sm"
                className="form-control-sm"
                style={{ maxWidth: 240 }}
              >
                <option value="">
                  {ph("selectOption", "Select Option", "विकल्प चुनें")}
                </option>
                <option value="Yes">
                  {ph("allotment", "Allotment", "एलॉटमेंट")}
                </option>
                <option value="No">
                  {ph("registry", "Registry", "रजिस्ट्री")}
                </option>
              </Form.Select>
            </Form.Group>
            <div style={{ minHeight: "14px" }}>
  {errors?.allotmentDirectCustomer && (
    <small className="text-danger">
      {errors.allotmentDirectCustomer}
    </small>
  )}
</div>
          </Col>
        </Row>

      </Card.Body>
    </Card>
  );
};

export default AllotmentPattaSection;
