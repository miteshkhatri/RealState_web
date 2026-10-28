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
    <Col md={12} className="mb-3 px-2">
      {/* 🔷 SECTION TITLE */}
      <Form.Label className="fw-semibold mb-1 d-block text-body" style={{ fontSize: "13px" }}>
        {label}
      </Form.Label>

      <div className="d-flex flex-column gap-2">
        {items.map((row, idx) => (
          <div
            key={idx}
            className="attachment-row-card"
          >
            {/* 📎 FILE */}
            <div className="attachment-file-col">
              <Form.Label className="mb-1 text-muted" style={{ fontSize: "11px" }}>
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
            </div>

            {/* 👁 PREVIEW (Only when file exists) */}
            {(row?.file || row?.name) && (
              <div className="attachment-preview-col d-flex justify-content-center align-items-center">
                {renderPreview(row)}
              </div>
            )}

            {/* 📅 DATE */}
            <div className="attachment-date-col">
              <Form.Label className="mb-1 text-muted" style={{ fontSize: "11px" }}>
                {dateLabel}
              </Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={row.date || ""}
                onChange={(e) => onDateChange(idx, e.target.value)}
                className="form-control-sm hindi-input-custom"
              />
            </div>

            {/* ➕ ACTIONS (No ms-auto, tight next to Date input) */}
            <div className="d-flex gap-2 align-items-center">
              <Button
                size="sm"
                className="btn-attachment-add"
                onClick={onAddRow}
              >
                + Add
              </Button>

              {items.length > 1 && (
                <Button
                  size="sm"
                  className="btn-attachment-remove"
                  onClick={() => onRemoveRow(idx)}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Col>
  );
}

export default CommonAttachmentWithDate;
