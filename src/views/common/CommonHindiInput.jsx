import React from "react";
import { Col, Form } from "react-bootstrap";

function CommonHindiInput({
  md = 4,
  label,
  value,
  onChange,
  placeholder,
  fontMode,
  maxLength = 100,
  HindiInput,
  disableHindi = false   // 🔥 new flag
}) {
  return (
    <Col md={md}>
      <Form.Label>{label}</Form.Label>

      {disableHindi ? (
        <Form.Control
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="form-control-sm hindi-input-custom "
        />
      ) : (
        <HindiInput
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          fontMode={fontMode}
          maxLength={maxLength}
          className="form-control-sm hindi-input-custom"
        />
      )}
    </Col>
  );
}

export default CommonHindiInput;
