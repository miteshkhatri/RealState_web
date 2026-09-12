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
      <Form.Label>{label}</Form.Label>

      <div className="radio-row d-flex gap-4 align-items-center ">
        {options.map((o) => (
          <Form.Check
            key={o.value}
            type="radio"
            name={radioName}
            value={o.value}
            label={o.label}
            checked={selected === o.value}
            onChange={(e) => onChangeRadio(e.target.value)}
          />
        ))}
 <div className="flex-1  w-100" >
        <HindiInput
          value={value || ""}
          onChange={onChangeValue}
          placeholder={placeholder}
          fontMode={fontMode}
          maxLength={12}
          className="radio-input hindi-input-custom flex-1"
        />
        </div>
      </div>
    </Col>
  );
}


export default RadioWithTextInput;
