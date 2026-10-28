import React from "react";
import { Col, Form } from "react-bootstrap";

function CommonDateInput({
  md = 4,
  label,
  value,
  onChange,
  required = false,
  min,
  max,
  size = "sm"
}) {
  return (
    <Col md={md}>
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Control
        type="date"
        size={size}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        max={max}
        className="form-control-sm hindi-input-custom common-date-input w-100"
      />
    </Col>
  );
}

export default CommonDateInput;
