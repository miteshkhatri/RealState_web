import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';

/**
 * Generic dynamic field renderer
 * UI / spacing / classes SAME as your existing JSX
 */
const PartyFieldRenderer = ({
  fields,
  data,
  index,
  onChange,
  FontValue,
  HindiInput,
  ph,
  getRelationLabel,
  getRelationPlaceholder,
  relationOptions = [],
}) => {
  return (
    <Row className="mb-2 align-items-center shadow-none ">
      {fields.map((f) => {
        const value = data?.[f.key] || '';

        /* ================= RELATION SELECT ================= */
        if (f.type === 'relation') {
          return (
            <Col md={f.col} key={f.key} className=" shadow-none ">
              <Form.Label className="mb-1 small">
                {ph('relationLabel', 'Relation', 'संबंध')}
              </Form.Label>
              <Form.Select
                size="sm"
                value={value || 'S/O'}
                onChange={(e) => onChange(index, f.key, e.target.value)}
                className="form-control-sm"
              >
                {relationOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {FontValue === 0 ? o.labelEn : o.labelHi}
                  </option>
                ))}
              </Form.Select>
            </Col>
          );
        }

        /* ================= RELATION NAME (Father / Husband) ================= */
        if (f.type === 'relationName') {
          return (
            <Col md={f.col} key={f.key}>
              <Form.Label className="mb-1 small">
                {getRelationLabel(data?.relation || 'S/O', FontValue)}
              </Form.Label>
              <HindiInput
                value={value}
                onChange={(text) => onChange(index, f.key, text)}
                placeholder={getRelationPlaceholder(
                  data?.relation || 'S/O',
                  FontValue
                )}
                fontMode={FontValue}
                maxLength={50}
                className="form-control-sm hindi-input-custom"
              />
            </Col>
          );
        }

        /* ================= NUMBER / AGE ================= */
        if (f.type === 'number') {
          return (
            <Col md={f.col} key={f.key}>
              <Form.Label className="mb-1 small">
                {ph(f.labelKey, f.key, f.key)}
              </Form.Label>
              <Form.Control
                type="text"
                inputMode="numeric"
                value={value}
                onChange={(e) =>
                  onChange(
                    index,
                    f.key,
                    e.target.value.replace(/\D/g, '').slice(0, f.max || 10)
                  )
                }
                className="form-control-sm hindi-input-custom"
                placeholder={ph(f.phKey, f.key, f.key)}
                maxLength={f.max || 10}
              />
            </Col>
          );
        }

        /* ================= AADHAAR ================= */
        if (f.type === 'aadhaar') {
          return (
            <Col md={f.col} key={f.key}>
              <Form.Label className="mb-1 small">
                {ph('aadhaarLabel', 'Aadhaar Number', 'आधार नंबर')}
              </Form.Label>
              <Form.Control
                type="text"
                inputMode="numeric"
                value={value}
                onChange={(e) => {
                  const digits = e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 12);
                  const formatted = digits
                    .replace(/(.{4})/g, '$1 ')
                    .trim();
                  onChange(index, f.key, formatted);
                }}
                maxLength={14}
                className="form-control-sm hindi-input-custom"
                placeholder={ph(
                  'Aadhaar',
                  'Enter Aadhaar Number',
                  'आधार संख्या दर्ज करें'
                )}
              />
            </Col>
          );
        }

        /* ================= PAN ================= */
        if (f.type === 'pan') {
          return (
            <Col md={f.col} key={f.key}>
              <Form.Label className="mb-1 small">
                {ph('panLabel', 'PAN Number', 'पैन नंबर')}
              </Form.Label>
              <Form.Control
                type="text"
                value={value}
                onChange={(e) =>
                  onChange(
                    index,
                    f.key,
                    e.target.value.toUpperCase().slice(0, 10)
                  )
                }
                maxLength={10}
                className="form-control-sm hindi-input-custom"
                placeholder={ph(
                  'pan',
                  'Enter PAN Number',
                  'पैन नंबर दर्ज करें'
                )}
              />
            </Col>
          );
        }

        /* ================= MOBILE ================= */
        if (f.type === 'mobile') {
          return (
            <Col md={f.col} key={f.key}>
              <Form.Label className="mb-1 small">
                {ph('mobileLabel', 'Mobile Number', 'मोबाइल नंबर')}
              </Form.Label>
              <Form.Control
                type="text"
                inputMode="numeric"
                value={value}
                onChange={(e) =>
                  onChange(
                    index,
                    f.key,
                    e.target.value.replace(/\D/g, '').slice(0, 10)
                  )
                }
                maxLength={10}
                className="form-control-sm hindi-input-custom"
                placeholder={ph(
                  'mobile',
                  'Enter Mobile Number',
                  'मोबाइल नंबर दर्ज करें'
                )}
              />
            </Col>
          );
        }

        /* ================= DEFAULT HINDI INPUT ================= */
        return (
          <Col md={f.col} key={f.key}>
            <Form.Label className="mb-1 small">
              {ph(f.labelKey, f.key, f.key)}
            </Form.Label>
            <HindiInput
              value={value}
              onChange={(text) => onChange(index, f.key, text)}
              placeholder={ph(f.phKey, f.key, f.key)}
              fontMode={FontValue}
              maxLength={f.max || 50}
              className="form-control-sm hindi-input-custom"
            />
          </Col>
        );
      })}
    </Row>
  );
};

export default PartyFieldRenderer;
