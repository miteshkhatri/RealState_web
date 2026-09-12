import React from "react";
import { Row, Col } from "react-bootstrap";

function SellerKycSection({
  formData,
  setFormData,
  handleChange,
  SellerKycDocuments,
  FontValue = 0,
  placeholders = {},
  LANGUAGE = { EN: 0, HI: 1 },
  onAddDeletedKycId // 🔥 NEW PROP
}) {
  const ph = (key, en, hi) => {
    if (placeholders && placeholders[key]) return placeholders[key];
    return FontValue === LANGUAGE.EN ? en : hi;
  };

  return (
    <Row>
      <Col md={12}>
        <SellerKycDocuments
          formData={formData}
          FontValue={FontValue}
          placeholders={placeholders}
           onAddDeletedKycId={ onAddDeletedKycId}
          LANGUAGE={LANGUAGE}
          formLabel={ph("kycSectionLabel", "KYC Documents", "केवाईसी दस्तावेज़")}

          /* ================= ADD / REPLACE FILE ================= */
          handleFileChange={(docKey, file) => {
            setFormData((prev) => {
              const list = [...(prev.kycDocs || [])];

              // 🔁 find existing slot (replace case)
              const idx = list.findIndex(
                (d) => d.key === docKey && d.file?.existing
              );

              if (idx >= 0) {
                list[idx] = {
                  ...list[idx],     // keep id
                  file              // new binary
                };
              } else {
                list.push({ key: docKey, file });
              }

              return { ...prev, kycDocs: list };
            });
          }}

          /* ================= DELETE FILE ================= */
          removeFile={(docKey, index) => {
            setFormData((prev) => {
              let found = -1;
              const updated = [];

              (prev.kycDocs || []).forEach((item) => {
                if (item.key !== docKey) {
                  updated.push(item);
                  return;
                }

                found++;
                if (found === index) {
                  // 🔥 EXISTING → mark for DB delete
                  if (item?.file?.existing && item.id) {
                    onAddDeletedKycId?.(item.id);
                  }
                  // ❌ do not push → removed
                } else {
                  updated.push(item);
                }
              });

              return { ...prev, kycDocs: updated };
            });
          }}

          handleChange={handleChange}
        />
      </Col>
    </Row>
  );
}

export default SellerKycSection;
