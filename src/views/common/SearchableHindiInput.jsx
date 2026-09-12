import React from "react";
import { Col, Form } from "react-bootstrap";

function SearchableHindiInput({
  md = 4,
  label,
  value,
  onChange,
  placeholder,
  fontMode,
  HindiInput,
  suggestions = [],
  dropdownStyle,
  dropdownItemStyle,
  onSelect,
  showDropdown
}) {
  return (
    <Col md={md} style={{ position: "relative" }}>
      <Form.Label>{label}</Form.Label>

      <HindiInput
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        fontMode={fontMode}
        className="form-control-sm hindi-input-custom"
      />

      {showDropdown && suggestions.length > 0 && (
        <div style={dropdownStyle}>
          {suggestions.map((item) => (
            <div
              key={item.id}
              style={dropdownItemStyle}
              onMouseDown={() => onSelect(item)}
            >
              {item.mutation_jamabandi_girdawari}
            </div>
          ))}
        </div>
      )}
    </Col>
  );
}

export default SearchableHindiInput;
