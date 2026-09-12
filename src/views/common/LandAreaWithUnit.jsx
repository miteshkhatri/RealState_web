import React from "react";
import { Col, Form, InputGroup } from "react-bootstrap";

function LandAreaWithUnit({
  md = 3,
  label,
  value,
  unit,
  onChangeValue,
  onChangeUnit,
  units = [],
  placeholder,
  fontMode,
  HindiInput
}) {
  return (
    <Col md={md}>
      <Form.Label className="mb-1">{label}</Form.Label>

      <InputGroup size="sm">
        {/* ===== LAND AREA INPUT (FLOAT ALLOWED) ===== */}
        <Form.Control
          type="text"                 // 🔥 number ❌ → text ✅
          value={value || ""}
          onChange={(e) => {
            const val = e.target.value;

            // ✅ allow: 23, 23.3, 0.5
            if (/^\d*\.?\d*$/.test(val)) {
              onChangeValue(val);
            }
          }}
          placeholder={placeholder}
          className="form-control-sm hindi-input-custom"
            maxLength={10}   
        />

        {/* ===== UNIT SELECT (NO CHANGE) ===== */}
        <Form.Select
          value={unit || ""}
          onChange={(e) => onChangeUnit(e.target.value)}
          className="p-0 px-2"
          style={{ maxWidth: 120 }}
        >
          {units.map((u) => (
            <option key={u.value} value={u.value}>
              {fontMode === 0 ? u.en : u.hi}
            </option>
          ))}
        </Form.Select>
      </InputGroup>
    </Col>
  );
}

export default LandAreaWithUnit;
