// import React from "react";
import { Row, Col } from "react-bootstrap";

// fallback imports
import ConversionInfoDefault from "./ConversionInfo";
import AttachmentsSectionDefault from "./AttachmentsSection";

function ConversionSection({
  formData,
  setFormData,
  conversionList = [],
  isExistingMode = false,

  ConversionInfo,
  AttachmentsSection,
  HindiInput,
  FontValue,
  LANGUAGE,
  placeholders,
  errors = {},
  onAddDeletedConversionId
}) {
  const CI = ConversionInfo || ConversionInfoDefault;
  const AS = AttachmentsSection || AttachmentsSectionDefault;

  /* =====================================================
     EDIT / VIEW MODE
     ===================================================== */
  if (isExistingMode && conversionList.length > 0) {
    return (
      <>
        {/* 🔹 Conversion Info (MULTIPLE) */}
        {conversionList.map((conv, index) => (
          <div key={conv.id || index} className="mb-4">
            <Row className="mb-3">
              <Col>
                <CI
                  formData={{
                    conversion_application_date:
                      formData.conversion_details?.[index]
                        ?.conversion_application_date ??
                      conv.application_date ??
                      "",
                    provision_section:
                      formData.conversion_details?.[index]
                        ?.provision_section ??
                      conv.provision_section ??
                      "",
                    conversion_authority:
                      formData.conversion_details?.[index]
                        ?.conversion_authority ??
                      conv.authority ??
                      "BDA"
                  }}
                  setFormData={(updated) => {
                    setFormData((prev) => {
                      const list = [...(prev.conversion_details || [])];

                      list[index] = {
                        ...list[index],

                        // UI keys
                        conversion_application_date:
                          updated.conversion_application_date,
                        provision_section: updated.provision_section,
                        conversion_authority: updated.conversion_authority,

                        // DB keys
                        application_date:
                          updated.conversion_application_date,
                        authority: updated.conversion_authority
                      };

                      return {
                        ...prev,
                        conversion_details: list
                      };
                    });
                  }}
                  HindiInput={HindiInput}
                  FontValue={FontValue}
                  LANGUAGE={LANGUAGE}
                  placeholders={placeholders}
                  radioGroupName={`conversion_authority_${index}`}
                />
              </Col>
            </Row>

            {index !== conversionList.length - 1 && (
              <hr style={{ borderTop: "2px dashed #999" }} />
            )}
          </div>
        ))}

        {/* 🔹 Attachments + Area + Division + Project (ONE TIME ONLY) */}
        <Row>
          <Col>
            <AS
              formData={formData}
              setFormData={setFormData}
              HindiInput={HindiInput}
              FontValue={FontValue}
              LANGUAGE={LANGUAGE}
              placeholders={placeholders}
              errors={errors}
              onAddDeletedConversionId={onAddDeletedConversionId}
            />
          </Col>
        </Row>
      </>
    );
  }

  /* =====================================================
     ADD MODE (SINGLE CONVERSION)
     ===================================================== */
  return (
    <>
      <Row className="mb-3">
        <Col>
          <CI
            formData={formData}
            setFormData={setFormData}
            HindiInput={HindiInput}
            FontValue={FontValue}
            LANGUAGE={LANGUAGE}
            placeholders={placeholders}
            radioGroupName="conversion_authority"
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <AS
            formData={formData}
            setFormData={setFormData}
            HindiInput={HindiInput}
            FontValue={FontValue}
            LANGUAGE={LANGUAGE}
            placeholders={placeholders}
            errors={errors}
            onAddDeletedConversionId={onAddDeletedConversionId}
          />
        </Col>
      </Row>
    </>
  );
}

export default ConversionSection;
