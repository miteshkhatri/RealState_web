import React, { useMemo, useState, useRef, useEffect } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import CommonAttachmentWithDate from "views/common/CommonAttachmentWithDate";

const DIV_OPTIONS = [
  { value: "Residential", en: "Residential", hi: "आवासीय" },
  { value: "Commercial", en: "Commercial", hi: "वाणिज्यिक" },
  { value: "Informal", en: "Informal", hi: "अनौपचारिक" },
  { value: "Other", en: "Other", hi: "अन्य" }
];

const AttachmentsSection = ({
  formData = {},
  setFormData = () => {},
  FontValue = 0,
  placeholders = {},
  LANGUAGE = { EN: 0, HI: 1 },
  errors={},
 HindiInput,
  // 🔥 NEW: parent ko deleted conversion attachment id bhejne ke liye
  onAddDeletedConversionId = () => {}
}) => {
  const ph = (key, en, hi) =>
    placeholders[key] ?? (FontValue === LANGUAGE.EN ? en : hi);

  const updateList = (key, list) => {
    setFormData((prev) => ({ ...prev, [key]: list }));
  };

  const divisionArray = useMemo(() => {
    const v = formData.division_of_area;
    if (!v) return [];
    if (Array.isArray(v)) return v;
    return String(v).split(",").map((s) => s.trim()).filter(Boolean);
  }, [formData.division_of_area]);

  const convertedAreaNumber = Number(formData.convertedArea || 0);
  const totalDivisionSum = useMemo(() => {
    const d = formData.divisionDetails || {};
    return Object.values(d).reduce((a, b) => a + Number(b || 0), 0);
  }, [formData.divisionDetails]);

  const remaining = Math.max(0, convertedAreaNumber - totalDivisionSum);

  const [open, setOpen] = useState(false);
  const ddRef = useRef(null);

  useEffect(() => {
    const close = (e) =>
      ddRef.current && !ddRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const toggleDivision = (val) => {
    setFormData((prev) => {
      const arr = Array.isArray(prev.division_of_area)
        ? [...prev.division_of_area]
        : [];
      const exists = arr.includes(val);
      const nextArr = exists ? arr.filter(v => v !== val) : [...arr, val];

      const details = { ...(prev.divisionDetails || {}) };
      if (!exists) details[val] = "0";
      else delete details[val];

      return { ...prev, division_of_area: nextArr, divisionDetails: details };
    });
  };

  return (
    <div className="p-0 mb-3">

      {/* ========= CHALLAN ========= */}
      <CommonAttachmentWithDate
        label={ph(
          "challanLabel",
          "Challan Copy (Lease Money, EDC Entry)",
          "चालान कॉपी (लीज़ मनी, ईडीसी एंट्री)"
        )}
        items={formData.conversionChallanDocs || [{ file: null, date: "" }]}
        dateLabel={ph("challanDateLabel", "Challan Date", "चालान तिथि")}
        onFileChange={(i, f) => {
          const c = [...(formData.conversionChallanDocs || [])];
          c[i] = { ...c[i], file: f };
          updateList("conversionChallanDocs", c);
        }}
        onDateChange={(i, d) => {
          const c = [...(formData.conversionChallanDocs || [])];
          c[i] = { ...c[i], date: d };
          updateList("conversionChallanDocs", c);
        }}
        onAddRow={() =>
          updateList("conversionChallanDocs", [
            ...(formData.conversionChallanDocs || []),
            { file: null, date: "" }
          ])
        }
        onRemoveRow={(i) => {
          const item = formData.conversionChallanDocs?.[i];
          if (item?.id) onAddDeletedConversionId(item.id);

          updateList(
            "conversionChallanDocs",
            formData.conversionChallanDocs.filter((_, x) => x !== i)
          );
        }}
      />

      {/* ========= ORDER ========= */}
      <CommonAttachmentWithDate
        label={ph(
          "orderAttachmentLabel",
          "Conversion Order Attachment",
          "कन्वर्ज़न ऑर्डर अनुलग्नक"
        )}
        items={formData.conversionOrderDocs || [{ file: null, date: "" }]}
        dateLabel={ph("orderDateLabel", "Conversion Order Date", "कन्वर्ज़न आदेश तिथि")}
        onFileChange={(i, f) => {
          const c = [...(formData.conversionOrderDocs || [])];
          c[i] = { ...c[i], file: f };
          updateList("conversionOrderDocs", c);
        }}
        onDateChange={(i, d) => {
          const c = [...(formData.conversionOrderDocs || [])];
          c[i] = { ...c[i], date: d };
          updateList("conversionOrderDocs", c);
        }}
        onAddRow={() =>
          updateList("conversionOrderDocs", [
            ...(formData.conversionOrderDocs || []),
            { file: null, date: "" }
          ])
        }
        onRemoveRow={(i) => {
          const item = formData.conversionOrderDocs?.[i];
          if (item?.id) onAddDeletedConversionId(item.id);

          updateList(
            "conversionOrderDocs",
            formData.conversionOrderDocs.filter((_, x) => x !== i)
          );
        }}
      />

      {/* ========= MAP ========= */}
      <CommonAttachmentWithDate
        label={ph("mapLabel", "Map Attachment", "मानचित्र संलग्नक")}
        items={formData.conversionMapDocs || [{ file: null, date: "" }]}
        dateLabel={ph("mapDateLabel", "Map Date", "मानचित्र तिथि")}
        onFileChange={(i, f) => {
          const c = [...(formData.conversionMapDocs || [])];
          c[i] = { ...c[i], file: f };
          updateList("conversionMapDocs", c);
        }}
        onDateChange={(i, d) => {
          const c = [...(formData.conversionMapDocs || [])];
          c[i] = { ...c[i], date: d };
          updateList("conversionMapDocs", c);
        }}
        onAddRow={() =>
          updateList("conversionMapDocs", [
            ...(formData.conversionMapDocs || []),
            { file: null, date: "" }
          ])
        }
        onRemoveRow={(i) => {
          const item = formData.conversionMapDocs?.[i];
          if (item?.id) onAddDeletedConversionId(item.id);

          updateList(
            "conversionMapDocs",
            formData.conversionMapDocs.filter((_, x) => x !== i)
          );
        }}
      />

      {/* ========= AREA & DIVISION ========= */}
      <Row className="mt-3">
        <Col md={6}>
          <Form.Label>{ph("convertedArea", "Converted Area", "परिवर्तित क्षेत्र")}</Form.Label>
       <Form.Control
  type="number"
  size="sm"
  className="hindi-input-custom"
  value={formData.convertedArea || ""}
  onChange={(e) => {
    const value = e.target.value;

    // ❌ negative / scientific notation block
    if (value === "" || (/^\d+$/.test(value) && value.length <= 7)) {
      setFormData(p => ({
        ...p,
        convertedArea: value
      }));
    }
  }}
  inputMode="numeric"   // 📱 mobile numeric keypad
/>

        </Col>

        <Col md={6} ref={ddRef}>
          <Form.Label>{ph("division", "Division of Area", "क्षेत्र का विभाजन")}</Form.Label>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => setOpen(!open)}
            className="w-100 text-start"
          >
            {divisionArray.length
              ? `${divisionArray.length} selected`
              : ph("select", "Select", "चुनें")}
          </Button>

          {open && (
            <div className="border p-2 mt-1 bg-white">
              {DIV_OPTIONS.map((o) => (
                <Form.Check
                  key={o.value}
                  label={FontValue === LANGUAGE.EN ? o.en : o.hi}
                  checked={divisionArray.includes(o.value)}
                  onChange={() => toggleDivision(o.value)}
                />
              ))}
            </div>
          )}
        </Col>
      </Row>

      {/* ========= DIVISION DETAILS ========= */}
      <Row className="mt-2">
        {divisionArray.map((d) => (
          <Col md={6} key={d} className="mt-2">
            <Form.Label>{d}</Form.Label>
            <Form.Control
              type="number"
              size="sm"
              className="hindi-input-custom"
              value={formData.divisionDetails?.[d] || ""}
              onChange={(e) => {
                let value = Number(e.target.value || 0);

                setFormData((p) => {
                  const details = { ...(p.divisionDetails || {}) };

                  const otherSum = Object.entries(details).reduce(
                    (sum, [key, val]) =>
                      key === d ? sum : sum + Number(val || 0),
                    0
                  );

                  const maxAllowed = Math.max(
                    0,
                    Number(p.convertedArea || 0) - otherSum
                  );

                  if (value > maxAllowed) value = maxAllowed;

                  details[d] = value;

                  return { ...p, divisionDetails: details };
                });
              }}
            />
          </Col>
        ))}
      </Row>

      <div className="mt-2 text-muted">
        {ph("total", "Total:", "कुल:")} {totalDivisionSum} |{" "}
        {ph("remaining", "Remaining:", "शेष:")} {remaining}
      </div>

      <Row className="my-3">
        <Col md={6}>
        <Form.Label className="mb-1">
  {ph("projectNameLabel", "Project Name*", "प्रोजेक्ट का नाम*")}
</Form.Label>
          <Form.Group>
          <HindiInput
  value={formData.projectName || ""}
  onChange={(text) =>
    setFormData((p) => ({ ...p, projectName: text }))
  }
  placeholder={ph(
    "projectNamePh",
    "Enter Project Name*",
    "प्रोजेक्ट का नाम दर्ज करें*"
  )}
  fontMode={FontValue}
  maxLength={50}
  className="form-control-sm hindi-input-custom"
/>

          </Form.Group>

            <div style={{ minHeight: "14px" }}>
      {errors?.projectName && (
        <small className="text-danger">
          {errors.projectName}
        </small>
      )}
    </div>
        </Col>
      </Row>
    </div>
  );
};

export default AttachmentsSection;
