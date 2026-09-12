import React from 'react';
import { Row } from 'react-bootstrap';

function ReraAllotmentSection({
  formData,
  setFormData,
  ReraRegistrationSection,
  AllotmentPattaSection,

  // bilingual
  FontValue = 0,
  LANGUAGE = { EN: 0, HI: 1 },
  placeholders = {},
    errors = {},

  // 🔥 ADD THIS
  onAddDeletedReraAttachmentId,
}) {
  return (
    <>
      <Row>
        <ReraRegistrationSection
          formData={formData}
          setFormData={setFormData}
          FontValue={FontValue}
          LANGUAGE={LANGUAGE}
          placeholders={placeholders}

          // 🔥 PASS TO CHILD
          onAddDeletedReraAttachmentId={onAddDeletedReraAttachmentId}
        />
      </Row>

      <Row>
        <AllotmentPattaSection
          formData={formData}
          setFormData={setFormData}
          FontValue={FontValue}
          LANGUAGE={LANGUAGE}
          placeholders={placeholders}

          // 🔥 PASS TO CHILD
          errors={errors}
          onAddDeletedReraAttachmentId={onAddDeletedReraAttachmentId}
        />
      </Row>
    </>
  );
}

export default ReraAllotmentSection;
