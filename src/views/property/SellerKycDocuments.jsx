import React from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import { API_BASE_URL } from "config/constant";
import CommonAttachmentWithDate from "views/common/CommonAttachmentWithDate";

/* ---------- helpers ---------- */
const isRealFile = (f) => typeof File !== "undefined" && f instanceof File;

const getPreviewUrl = (fileObj) => {
  if (!fileObj) return "";
  if (isRealFile(fileObj)) return URL.createObjectURL(fileObj);
  if (fileObj?.existing && fileObj?.name)
    return `${API_BASE_URL}/uploads/${fileObj.name}`;
  return "";
};

const SellerKycDocuments = ({
  formData = {},
  handleFileChange,
  removeFile,
  handleChange,
  onAddDeletedKycId,        // 🔥🔥 NEW PROP
  FontValue = 0,
  placeholders = {},
  LANGUAGE = { EN: 0, HI: 1 },
}) => {
  const ph = (key, en, hi) =>
    placeholders[key] ?? (FontValue === LANGUAGE.EN ? en : hi);

  const kycDocs = Array.isArray(formData.kycDocs) ? formData.kycDocs : [];

  /* ---------- BASIC KYC TYPES ---------- */
  const basicDocs = [
    {
      label: ph(
        "sellerAadharLabel",
        "Seller Aadhar (Compulsory)",
        "विक्रेता आधार (आवश्यक)"
      ),
      key: "sellerAadhar",
    },
    {
      label: ph("sellerPanLabel", "Seller PAN", "विक्रेता पैन"),
      key: "sellerPAN",
    },
    {
      label: ph("poaPanLabel", "POA Document", "POA दस्तावेज़"),
      key: "poaPAN",
      hasDate: true,
    },
  ];

  return (
    <Card className="border-0 shadow-none">
      <Card.Body className="p-0">

        {/* NOTE */}
        <p className="text-danger fw-semibold mb-3">
          {ph(
            "kycNote",
            <>Note: Compulsorily <strong>E or F</strong> + <strong>AADHAR</strong> + <strong>PAN</strong>. POA case → POA PAN required.</>,
            <>नोट: अनिवार्य रूप से <strong>E या F</strong> + <strong>आधार</strong> + <strong>PAN</strong>। POA की स्थिति में उसका PAN आवश्यक है।</>
          )}
        </p>

        {/* ---------- BASIC DOCS ---------- */}
        <Row>
          {basicDocs.map((doc) => {
            const files = kycDocs
              .map((f, i) => ({ ...f, _index: i }))
              .filter((f) => f.key === doc.key && f.file);

            return (
              <Col md={6} className="mb-3" key={doc.key}>
                <Form.Label className="fw-semibold">{doc.label}</Form.Label>

                <Form.Control
                  type="file"
                  size="sm"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleFileChange(doc.key, file);
                    e.target.value = "";
                  }}
                />

                {files.map((f) => {
                  const fileObj = f.file;
                  const preview = getPreviewUrl(fileObj);
                  const name = isRealFile(fileObj)
                    ? fileObj.name
                    : fileObj?.name;

                  return (
                    <div
                      key={f._index}
                      className="mt-2 d-flex align-items-center gap-2 border p-1 rounded"
                    >
                      {preview && (
                        <img
                          src={preview}
                          alt=""
                          style={{ width: 60, height: 60, objectFit: "cover" }}
                        />
                      )}
                      <span style={{ flex: 1, fontSize: "0.8rem" }}>
                        {name}
                      </span>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => removeFile(doc.key, f._index)}
                      >
                        {ph("removeBtn", "Remove", "हटाएँ")}
                      </Button>
                    </div>
                  );
                })}

                {doc.hasDate && (
                  <>
                    <Form.Label className="fw-semibold mt-3">
                      {ph("poaDocDateLabel", "Document Date", "दस्तावेज़ तिथि")}
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="poaDocDate"
                      value={formData.poaDocDate || ""}
                      onChange={handleChange}
                    />
                  </>
                )}
              </Col>
            );
          })}
        </Row>

        {/* ---------- COMMON ATTACHMENTS WITH DATE ---------- */}
        <Row className="mt-2">

          {/* UPNIVESHAN */}
          <CommonAttachmentWithDate
            label={ph(
              "upniveshanDocLabel",
              "Upniveshan Khasra / Chak No. Document",
              "उपनीवेशन खसरा / चक दस्तावेज़"
            )}
            items={formData.upniveshanKhasraDocs || [{ file: null, date: "" }]}
            dateLabel={ph("docDate", "Document Date", "दस्तावेज़ तिथि")}
            onFileChange={(idx, file) => {
              const copy = [...formData.upniveshanKhasraDocs];
              copy[idx] = { ...copy[idx], file };
              handleChange({
                target: { name: "upniveshanKhasraDocs", value: copy },
              });
            }}
            onDateChange={(idx, date) => {
              const copy = [...formData.upniveshanKhasraDocs];
              copy[idx] = { ...copy[idx], date };
              handleChange({
                target: { name: "upniveshanKhasraDocs", value: copy },
              });
            }}
            onAddRow={() =>
              handleChange({
                target: {
                  name: "upniveshanKhasraDocs",
                  value: [...formData.upniveshanKhasraDocs, { file: null, date: "" }],
                },
              })
            }
            onRemoveRow={(idx) => {
              const item = formData.upniveshanKhasraDocs[idx];

              
              if (item?.id) onAddDeletedKycId?.(item.id); // 🔥🔥 FIX
              handleChange({
                target: {
                  name: "upniveshanKhasraDocs",
                  value: formData.upniveshanKhasraDocs.filter((_, i) => i !== idx),
                },
              });
            }}
          />

          {/* RAJASWA */}
          <CommonAttachmentWithDate
            label={ph(
              "rajaswaDocLabel",
              "Rajaswa Khasra No. Document",
              "राजस्व खसरा दस्तावेज़"
            )}
            items={formData.rajaswaKhasraDocs || [{ file: null, date: "" }]}
            dateLabel={ph("docDate", "Document Date", "दस्तावेज़ तिथि")}
            onFileChange={(idx, file) => {
              const copy = [...formData.rajaswaKhasraDocs];
              copy[idx] = { ...copy[idx], file };
              handleChange({
                target: { name: "rajaswaKhasraDocs", value: copy },
              });
            }}
            onDateChange={(idx, date) => {
              const copy = [...formData.rajaswaKhasraDocs];
              copy[idx] = { ...copy[idx], date };
              handleChange({
                target: { name: "rajaswaKhasraDocs", value: copy },
              });
            }}
            onAddRow={() =>
              handleChange({
                target: {
                  name: "rajaswaKhasraDocs",
                  value: [...formData.rajaswaKhasraDocs, { file: null, date: "" }],
                },
              })
            }
            onRemoveRow={(idx) => {
              const item = formData.rajaswaKhasraDocs[idx];
 

          
              if (item?.id) onAddDeletedKycId?.(item.id); // 🔥🔥 FIX
              handleChange({
                target: {
                  name: "rajaswaKhasraDocs",
                  value: formData.rajaswaKhasraDocs.filter((_, i) => i !== idx),
                },
              });
            }}
          />

        </Row>
      </Card.Body>
    </Card>
  );
};

export default SellerKycDocuments;
