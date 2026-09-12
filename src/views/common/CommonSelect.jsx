import React from "react";
import { Col, Form } from "react-bootstrap";

function CommonSelect({
  md = 4,
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  size = "sm"
}) {
  return (
    <Col md={md}>
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Select
        size={size}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="form-control-sm hindi-input-custom"
      >
        <option value="">{placeholder}</option>

        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Form.Select>
    </Col>
  );
}

export default CommonSelect;
