// MainAttachmentsSection.jsx
import React from "react";
import { Row } from "react-bootstrap";
import CommonAttachmentWithDate from "views/common/CommonAttachmentWithDate";

function MainAttachmentsSection({
  formData = {},
  setFormData,
  FontValue = 0,
  LANGUAGE = { EN: 0, HI: 1, KRUTI: 2 },
   setDeletedAttachmentIds, 
  placeholders = {},
}) {
  /* ---------- SAFE UPDATE ---------- */
  const updateList = (key, list) => {
    setFormData((prev) => ({
      ...prev,
      [key]: list,
    }));
  };

  const handleRemoveWithDelete = (key, idx) => {
  setFormData((prev) => {
    const item = prev[key]?.[idx];

    // ✅ agar existing attachment hai
    if (item?.id) {
      setDeletedAttachmentIds((old) => [...old, item.id]);
    }

    return {
      ...prev,
      [key]: prev[key].filter((_, i) => i !== idx),
    };
  });
};


  /* ---------- SMART FILE REPLACE ---------- */
  const handleFileReplace = (arr = [], idx, file) => {
    const oldItem = arr[idx] || {};

    const copy = [...arr];
    copy[idx] = {
      ...oldItem,     // ✅ ADD case: empty | EDIT case: id, existing preserved
      file: file,     // ✅ always new binary
      date: oldItem.date || "",
    };

    return copy;
  };

  return (
    <Row className="p-0 m-0">
      {/* ===== CHAIN DOCS ===== */}
      <CommonAttachmentWithDate
        label={
          FontValue === LANGUAGE.EN
            ? "Land Chain Documents / POA Document"
            : "भूमि चेन डॉक्यूमेंट / POA दस्तावेज़"
        }
        name="chainDocs"
        items={formData.chainDocs || [{ file: null, date: "" }]}
        dateLabel={
          FontValue === LANGUAGE.EN ? "Document Date" : "दस्तावेज़ तिथि"
        }
        onFileChange={(idx, file) => {
          updateList(
            "chainDocs",
            handleFileReplace(formData.chainDocs || [], idx, file)
          );
        }}
        onDateChange={(idx, date) => {
          const copy = [...(formData.chainDocs || [])];
          copy[idx] = { ...copy[idx], date };
          updateList("chainDocs", copy);
        }}
        onAddRow={() =>
          updateList("chainDocs", [
            ...(formData.chainDocs || []),
            { file: null, date: "" },
          ])
        }
       onRemoveRow={(idx) => handleRemoveWithDelete("chainDocs", idx)}

        FontValue={FontValue}
        LANGUAGE={LANGUAGE}
        placeholders={placeholders}
      />

      {/* ===== MAP MASTER PLAN ===== */}
      <CommonAttachmentWithDate
        label={
          FontValue === LANGUAGE.EN
            ? "Map (Master Plan with Color)"
            : "मानचित्र (रंग के साथ मास्टर प्लान)"
        }
        name="mapMasterPlan"
        items={formData.mapMasterPlan || [{ file: null, date: "" }]}
        dateLabel={
          FontValue === LANGUAGE.EN ? "Map Date" : "मानचित्र तिथि"
        }
        onFileChange={(idx, file) => {
          updateList(
            "mapMasterPlan",
            handleFileReplace(formData.mapMasterPlan || [], idx, file)
          );
        }}
        onDateChange={(idx, date) => {
          const copy = [...(formData.mapMasterPlan || [])];
          copy[idx] = { ...copy[idx], date };
          updateList("mapMasterPlan", copy);
        }}
        onAddRow={() =>
          updateList("mapMasterPlan", [
            ...(formData.mapMasterPlan || []),
            { file: null, date: "" },
          ])
        }
       onRemoveRow={(idx) => handleRemoveWithDelete("mapMasterPlan", idx)}

        FontValue={FontValue}
        LANGUAGE={LANGUAGE}
        placeholders={placeholders}
      />

      {/* ===== MUTATION DOCS ===== */}
      <CommonAttachmentWithDate
        label={
          FontValue === LANGUAGE.EN
            ? "Mutation / Jamabandi / Girdawari PDFs"
            : "म्यूटेशन / जमाबंदी / गिरदावरी पीडीएफ"
        }
        name="mutationDocs"
        items={formData.mutationDocs || [{ file: null, date: "" }]}
        dateLabel={
          FontValue === LANGUAGE.EN ? "Mutation Date" : "म्यूटेशन तिथि"
        }
        onFileChange={(idx, file) => {
          updateList(
            "mutationDocs",
            handleFileReplace(formData.mutationDocs || [], idx, file)
          );
        }}
        onDateChange={(idx, date) => {
          const copy = [...(formData.mutationDocs || [])];
          copy[idx] = { ...copy[idx], date };
          updateList("mutationDocs", copy);
        }}
        onAddRow={() =>
          updateList("mutationDocs", [
            ...(formData.mutationDocs || []),
            { file: null, date: "" },
          ])
        }
        onRemoveRow={(idx) => handleRemoveWithDelete("mutationDocs", idx)}

        FontValue={FontValue}
        LANGUAGE={LANGUAGE}
        placeholders={placeholders}
      />
    </Row>
  );
}

export default MainAttachmentsSection;
