import { API_BASE_URL } from "config/constant";
import React from "react";
import { Row, Col, Button, Form } from "react-bootstrap";
import CommonDateInput from "views/common/CommonDateInput";

function CommonAttachmentWithDate({
  items = [],
  label,
  dateLabel,
  onFileChange,
  onDateChange,
  onAddRow,
  onRemoveRow
}) {
const renderPreview = (item) => {
  console.log("PREVIEW ITEM 👉", item);
  if (!item) return null;

  /* ================= ADD MODE ================= */
  if (item.file instanceof File) {
    const file = item.file;

    if (file.type?.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          style={imgStyle}
        />
      );
    }

    return (
      <small className="text-muted d-block text-center">
        📄 {file.name}
      </small>
    );
  }

  /* ================= EDIT MODE ================= */
  const fileName =
    item?.name ||
    item?.file?.name ||
    (typeof item === "string" ? item : null);

  if (!fileName) return null;

  const url = `${API_BASE_URL}/uploads/${fileName}`;
  console.log("IMAGE URL 👉", url);

  return (
    <img
      src={url}
      alt={fileName}
      onError={(e) => {
        console.error("❌ Image load failed:", url);
        e.target.style.display = "none";
      }}
      style={imgStyle}
    />
  );
};

const imgStyle = {
  width: "100%",
  height: "45px",
  objectFit: "cover",
  borderRadius: "6px",
  border: "1px solid #ddd",
};



  return (
    <>
      {/* 🔷 SECTION TITLE */}
      <Form.Label className="fw-bold mb-2 d-block">
        {label}
      </Form.Label>

      {items.map((row, idx) => (

        
        <Row
          key={idx}
          className="align-items-end mb-2 p-2"
          style={{
            border: "1px dashed #ddd",
            borderRadius: "8px",
            background: "#fafafa",
            margin: 'initial',
           
          }}
        >
          {/* 📎 FILE */}
          <Col md={4}>
            <Form.Label className="small text-muted mb-1">
              Upload File
            </Form.Label>
            <Form.Control
              type="file"
              size="sm"
               className="hindi-input-custom"
              onChange={(e) =>
                onFileChange(idx, e.target.files[0])
              }
            />
          </Col>

          {/* 👁 PREVIEW */}
          <Col
            md={2}
            className="d-flex justify-content-center align-items-center"
          >
            {renderPreview(row)}
          </Col>

          {/* 📅 DATE */}
          <CommonDateInput
            md={3}
            size="md"
            label={dateLabel}
            value={row.date || ""}
            onChange={(v) => onDateChange(idx, v)}
          />

          {/* ➕ ACTIONS */}
          <Col
            md={3}
            className="d-flex gap-2 justify-content-end"
          >
            <Button
              variant="primary"
              size="sm"
              onClick={onAddRow}
            >
              + Add
            </Button>

            {items.length > 1 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onRemoveRow(idx)}
              >
                Remove
              </Button>
            )}
          </Col>
        </Row>
      ))}
    </>
  );
}

export default CommonAttachmentWithDate;
