import React from "react";
import { Card, Row, Col, Form } from "react-bootstrap";
import CommonAttachmentWithDate from "views/common/CommonAttachmentWithDate";

const ReraRegistrationSection = ({
  formData = {},
  setFormData = () => {},
  FontValue = 0,
  placeholders = {},
  LANGUAGE = { EN: 0, HI: 1 },
  onAddDeletedReraAttachmentId
}) => {
  const ph = (key, en, hi) =>
    placeholders[key] ?? (FontValue === LANGUAGE.EN ? en : hi);

  const reraRows =
    Array.isArray(formData.reraList) && formData.reraList.length > 0
      ? formData.reraList
      : [{ rera_number: "", document_date: "" }];

  return (
    <Card className="border-0 shadow-none">
      <Card.Body className="p-0">

        {/* ================= RERA NUMBER + DATE (MAP SAME UI) ================= */}
        {reraRows.map((item, index) => (
          <Row className="mb-3" key={index}>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  {ph(
                    "reraRegLabel",
                    "RERA Registration Number",
                    "RERA पंजीकरण संख्या"
                  )}
                </Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  maxLength={22}
                  value={item.rera_number || ""}
                  onChange={(e) => {
  const value = e.target.value
    .toUpperCase()                 // 🔥 CAPITAL
    .replace(/[^A-Z0-9/-]/g, "");  // 🔒 allowed chars only

  const list = [...reraRows];
  list[index] = {
    ...list[index],
    rera_number: value
  };

  setFormData((p) => ({ ...p, reraList: list }));
}}

                  className="form-control-sm hindi-input-custom"
                />
                 
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  {ph(
                    "dateOfDocsLabel",
                    "Date of Documents",
                    "दस्तावेज़ों की तिथि"
                  )}
                </Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={item.document_date || ""}
                  onChange={(e) => {
                    const list = [...reraRows];
                    list[index] = {
                      ...list[index],
                      document_date: e.target.value
                    };
                    setFormData((p) => ({ ...p, reraList: list }));
                  }}
                  className="form-control-sm hindi-input-custom"
                />
              </Form.Group>
            </Col>
          </Row>
        ))}

        {/* ================= TIR REPORT ================= */}
        <CommonAttachmentWithDate
          label={ph("tirLabel", "TIR Report Upload", "TIR रिपोर्ट अपलोड")}
          items={formData.tirReportDocs || [{ file: null, date: "" }]}
          dateLabel={ph("tirDateLabel", "TIR Report Date", "TIR रिपोर्ट तिथि")}
          onFileChange={(i, f) => {
            const c = [...(formData.tirReportDocs || [])];
            c[i] = { ...c[i], file: f };
            setFormData((p) => ({ ...p, tirReportDocs: c }));
          }}
          onDateChange={(i, d) => {
            const c = [...(formData.tirReportDocs || [])];
            c[i] = { ...c[i], date: d };
            setFormData((p) => ({ ...p, tirReportDocs: c }));
          }}
          onAddRow={() =>
            setFormData((p) => ({
              ...p,
              tirReportDocs: [...(p.tirReportDocs || []), { file: null, date: "" }]
            }))
          }
          onRemoveRow={(i) => {
            const removed = formData.tirReportDocs?.[i];
            if (removed?.id) onAddDeletedReraAttachmentId?.(removed.id);
            setFormData((p) => ({
              ...p,
              tirReportDocs: p.tirReportDocs.filter((_, x) => x !== i)
            }));
          }}
        />

        {/* ================= VALUATION REPORT ================= */}
        <CommonAttachmentWithDate
          label={ph(
            "valuationLabel",
            "Valuation Report Upload",
            "मूल्यांकन रिपोर्ट अपलोड"
          )}
          items={formData.valuationReportDocs || [{ file: null, date: "" }]}
          dateLabel={ph(
            "valuationDateLabel",
            "Valuation Report Date",
            "मूल्यांकन रिपोर्ट तिथि"
          )}
          onFileChange={(i, f) => {
            const c = [...(formData.valuationReportDocs || [])];
            c[i] = { ...c[i], file: f };
            setFormData((p) => ({ ...p, valuationReportDocs: c }));
          }}
          onDateChange={(i, d) => {
            const c = [...(formData.valuationReportDocs || [])];
            c[i] = { ...c[i], date: d };
            setFormData((p) => ({ ...p, valuationReportDocs: c }));
          }}
          onAddRow={() =>
            setFormData((p) => ({
              ...p,
              valuationReportDocs: [
                ...(p.valuationReportDocs || []),
                { file: null, date: "" }
              ]
            }))
          }
          onRemoveRow={(i) => {
            const removed = formData.valuationReportDocs?.[i];
            if (removed?.id) onAddDeletedReraAttachmentId?.(removed.id);
            setFormData((p) => ({
              ...p,
              valuationReportDocs: p.valuationReportDocs.filter((_, x) => x !== i)
            }));
          }}
        />

      </Card.Body>
    </Card>
  );
};

export default ReraRegistrationSection;
