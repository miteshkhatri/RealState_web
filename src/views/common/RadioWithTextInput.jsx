import React from "react";
import { Col, Form } from "react-bootstrap";

function RadioWithTextInput({
  md = 4,
  label,
  radioName,
  options = [],
  selected,
  onChangeRadio,
  value,
  onChangeValue,
  placeholder,
  fontMode,
  HindiInput
}) {
  return (
    <Col md={md}>
      <Form.Label className="mb-1">{label}</Form.Label>

      <div className="radio-row d-flex gap-2 align-items-center">
        <div className="d-flex gap-2 flex-shrink-0">
          {options.map((o) => (
            <Form.Check
              key={o.value}
              type="radio"
              inline
              className="mb-0 me-0"
              name={radioName}
              value={o.value}
              label={o.label}
              checked={selected === o.value}
              onChange={(e) => onChangeRadio(e.target.value)}
            />
          ))}
        </div>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <HindiInput
            value={value || ""}
            onChange={onChangeValue}
            placeholder={placeholder}
            fontMode={fontMode}
            maxLength={12}
            className="form-control-sm radio-input hindi-input-custom w-100"
          />
        </div>
      </div>
    </Col>
  );
}


export default RadioWithTextInput;
