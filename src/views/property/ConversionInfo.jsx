import React from "react";
import { Row, Col, Form } from "react-bootstrap";
import CommonDateInput from "views/common/CommonDateInput";

const ConversionInfo = ({
  formData = {},
  setFormData = () => {},
  HindiInput,
  FontValue = 0,
  LANGUAGE = { EN: 0, HI: 1 },
  placeholders = {},
  radioGroupName
}) => {
  const ph = (key, en, hi) => {
    if (placeholders && placeholders[key]) return placeholders[key];
    return FontValue === LANGUAGE.EN ? en : hi;
  };

  const handleRadioChange = (e) => {
  const { value } = e.target;

  setFormData({
    ...formData,
    conversion_authority: value   // ✅ FIXED
  });
};
  // const handleRadioChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({ ...formData, [name]: value });
  // };

  const selectedAuthority = formData.conversion_authority || "BDA";

  return (
    <div>
      {/* 📅 DATES, PROVISION & AUTHORITY (IN ONE ROW) */}
      <Row className="mb-3">
        {/* 1. 📅 Conversion Application Date */}
        <Col md={3} sm={6}>
          <CommonDateInput
            md={12}
            size="sm"
            label={ph(
              "conversionAppDateLabel",
              "Conversion Application Date",
              "कन्वर्ज़न आवेदन तिथि"
            )}
            value={formData.conversion_application_date || ""}
            onChange={(date) =>
              setFormData({
                ...formData,
                conversion_application_date: date,
              })
            }
          />
        </Col>

        {/* 2. 📄 Provision / Section */}
        <Col md={5} sm={6}>
          <Form.Group controlId="provision_section">
            <Form.Label className="mb-1">
              {ph(
                "provisionLabel",
                "Conversion under Provision / Section",
                "प्रावधान / धारा के अंतर्गत कन्वर्ज़न"
              )}
            </Form.Label>

            <HindiInput
              value={formData.provision_section || ""}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  provision_section: val,
                })
              }
              placeholder={ph(
                "provisionPlaceholder",
                "Enter provision or section details",
                "प्रावधान या धारा का विवरण दर्ज करें"
              )}
              fontMode={FontValue}
              className="form-control-sm hindi-input-custom"
              maxLength={50}
            />
          </Form.Group>
        </Col>

        {/* 3. 🏛 Authority */}
        <Col md={4} sm={12}>
          <Form.Group controlId="conversion_authority">
            <Form.Label className="mb-1">
              {ph(
                "authorityLabel",
                "Under BDA / HB / JDA",
                "बीडीए / एचबी / जेडीए के अंतर्गत"
              )}
            </Form.Label>

            <div className="d-flex flex-wrap gap-3 align-items-center" style={{ minHeight: "33px" }}>
              {[
                { id: "BDA", en: "BDA", hi: "BDA" },
                { id: "HB", en: "HB", hi: "HB" },
                { id: "JDA", en: "JDA", hi: "JDA" },
                { id: "OTHER", en: "OTHER", hi: "अन्य" },
              ].map((authority) => (
                <Form.Check
                  key={authority.id}
                  type="radio"
                  name={radioGroupName}
                  value={authority.id}
                  label={ph(
                    `auth_${authority.id}`,
                    authority.en,
                    authority.hi
                  )}
                  checked={selectedAuthority === authority.id}
                  onChange={handleRadioChange}
                  className="form-check-sm"
                />
              ))}
            </div>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default ConversionInfo;
